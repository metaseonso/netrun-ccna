/* engine/config.js — turns a device's console transcript (Sim.Device.lines) into a structured config.
   Every engine (net, show, checks) reads this instead of grepping command strings.
   Authors never call this directly; ctx.cfg('R1') returns it. */
(function(){
  const IFNAME = s => s.replace(/^interface /, '').replace(/\s+/g, '');
  const num = x => (x == null ? null : +x);

  function blank(){
    return {
      hostname: null, enableSecret: null, enablePassword: null, domain: null, sshKeyBits: 0, sshVersion: null, users: [], passwordEncryption: false, banner: null, defaultGateway: null,
      vty: { transport: null, login: null, password: null }, con: { login: null, password: null },
      vlans: {}, interfaces: {}, routes: [], routes6: [], acls: {}, natStatic: [], natDynamic: [], natPools: {},
      dhcp: { excluded: [], pools: {}, snooping: false, snoopVlans: new Set(), daiVlans: new Set() },
      ospf: null, rip: null, eigrp: null, ipv6Routing: false, ipRouting: false, ntp: [], logging: [], snmp: [], cdp: true, lldp: false, errdisableRecovery: false
    };
  }
  // switch security settings that sit outside the old blank(): option 82 is inserted by default, recovery is off for every cause
  const secBlank = () => ({ recoveryCauses: new Set(), recoveryInterval: 300, option82: true, daiValidate: [], daiFilters: {}, arpAcls: {} });
  function iface(cfg, name){
    name = name.replace(/\s+/g, '');
    return cfg.interfaces[name] || (cfg.interfaces[name] = { name, ip: null, mask: null, secondary: [], shutdown: null, desc: null, mode: null, accessVlan: null, allowed: null, native: null, encap: null, dot1q: null, helpers: [],
      aclIn: null, aclOut: null, natInside: false, natOutside: false, ospfCost: null, ospfPassive: null, standby: {}, portsec: null, channel: null, ipv6: [], ipv6Enable: false, snoopTrust: false, daiTrust: false, speed: null, duplex: null, nonegotiate: false, stp: {} });
  }
  function ifacesOf(ctx){ // "interface x" or "interface range a - b, c"
    if (ctx.startsWith('interface range ')) return Stp.expandRange(ctx.replace('interface range ', ''));
    return [IFNAME(ctx)];
  }
  function parseAclEntry(tokens){ // after "permit|deny"
    // standard: [host] A [wild] | any        extended: proto src [ports] dst [ports]
    const t = tokens.slice(); const e = { action: null, proto: 'ip', src: null, swild: '0.0.0.0', dst: null, dwild: '0.0.0.0', sport: null, dport: null, log: false, raw: tokens.join(' ') };
    const addr = () => { const a = t.shift(); if (a === 'any') return ['0.0.0.0', '255.255.255.255']; if (a === 'host') return [t.shift(), '0.0.0.0']; if (t[0] && /^\d+\.\d+\.\d+\.\d+$/.test(t[0])) return [a, t.shift()]; return [a, '0.0.0.0']; };
    const port = () => { if (t[0] === 'eq') { t.shift(); const p = t.shift(); return { op: 'eq', p: PORTS[p] != null ? PORTS[p] : +p }; } if (t[0] === 'gt' || t[0] === 'lt' || t[0] === 'neq') { const op = t.shift(); const p = t.shift(); return { op, p: PORTS[p] != null ? PORTS[p] : +p }; } if (t[0] === 'range') { t.shift(); const a = +t.shift(), b = +t.shift(); return { op: 'range', a, b }; } return null; };
    if (['ip', 'tcp', 'udp', 'icmp', 'ospf', 'eigrp', 'gre', 'esp'].includes(t[0])) { e.proto = t.shift(); [e.src, e.swild] = addr(); e.sport = port(); [e.dst, e.dwild] = addr(); e.dport = port(); }
    else { [e.src, e.swild] = addr(); }
    if (t.includes('log')) e.log = true;
    return e;
  }
  const PORTS = { www: 80, http: 80, https: 443, ftp: 21, 'ftp-data': 20, telnet: 23, ssh: 22, smtp: 25, domain: 53, dns: 53, tftp: 69, bootps: 67, bootpc: 68, ntp: 123, snmp: 161, syslog: 514, pop3: 110, imap: 143 };

  function parse(dev){
    const cfg = blank(); if (!dev) return cfg;
    let aclName = null, dhcpPool = null, ospf = null, natCtx = null;
    for (const r of dev.lines) {
      const s = r.line; let m; const T = s.split(' ');
      // ---------------- global config
      if (r.mode === 'config') {
        if ((m = s.match(/^hostname (\S+)$/))) cfg.hostname = dev.host || m[1];
        else if ((m = s.match(/^enable secret (?:\d+ )?(\S+)$/))) cfg.enableSecret = m[1];
        else if ((m = s.match(/^enable password (\S+)$/))) cfg.enablePassword = m[1];
        else if ((m = s.match(/^ip domain-name (\S+)$/)) || (m = s.match(/^ip domain name (\S+)$/))) cfg.domain = m[1];
        else if ((m = s.match(/^crypto key generate rsa(?: general-keys)?(?: modulus (\d+))?/))) cfg.sshKeyBits = m[1] ? +m[1] : 512;
        else if ((m = s.match(/^ip ssh version (\d)$/))) cfg.sshVersion = +m[1];
        else if ((m = s.match(/^username (\S+) (?:privilege \d+ )?(secret|password) (?:\d+ )?(\S+)$/))) cfg.users.push({ name: m[1], kind: m[2], value: m[3] });
        else if (s === 'service password-encryption') cfg.passwordEncryption = true;
        else if ((m = s.match(/^banner motd (.*)$/))) cfg.banner = m[1];
        else if ((m = s.match(/^ip default-gateway (\S+)$/))) cfg.defaultGateway = m[1];
        else if (s === 'ip routing') cfg.ipRouting = true;
        else if (s === 'ipv6 unicast-routing') cfg.ipv6Routing = true;
        else if ((m = s.match(/^vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) cfg.vlans[i] = cfg.vlans[i] || { id: i, name: 'VLAN' + String(i).padStart(4, '0') }; });
        else if ((m = s.match(/^ip route (\S+) (\S+) (\S+)(?: (\S+))?(?: (\d+))?$/))) { // next hop, exit interface, or exit interface then next hop; an AD may follow
          const isIp = x => /^\d+\.\d+\.\d+\.\d+$/.test(x || ''); let via = m[3], exit = null, ad = 1;
          if (!isIp(m[3])) { exit = m[3]; via = isIp(m[4]) ? m[4] : m[3]; if (isIp(m[4]) && m[5]) ad = +m[5]; else if (!isIp(m[4]) && m[4]) ad = +m[4]; } else if (m[4]) ad = +m[4];
          cfg.routes.push({ prefix: m[1], mask: m[2], via, exit, ad }); }
        else if ((m = s.match(/^ipv6 route (\S+) (\S+)$/))) cfg.routes6.push({ prefix: m[1], via: m[2] });
        else if ((m = s.match(/^access-list (\d+) (permit|deny) (.+)$/))) { const n = m[1]; const a = cfg.acls[n] || (cfg.acls[n] = { id: n, type: (+n >= 100 && +n <= 199) || (+n >= 2000 && +n <= 2699) ? 'extended' : 'standard', entries: [] }); const e = parseAclEntry(m[3].split(' ')); e.action = m[2]; e.seq = (a.entries.length + 1) * 10; a.entries.push(e); }
        else if ((m = s.match(/^access-list (\d+) remark (.*)$/))) { const n = m[1]; cfg.acls[n] || (cfg.acls[n] = { id: n, type: +n >= 100 ? 'extended' : 'standard', entries: [] }); }
        else if ((m = s.match(/^ip nat inside source static (\S+) (\S+)$/))) cfg.natStatic.push({ inside: m[1], outside: m[2] });
        else if ((m = s.match(/^ip nat inside source list (\S+) (?:interface (\S+)|pool (\S+))( overload)?$/))) { cfg.natDynamic = cfg.natDynamic.filter(x => x.acl !== m[1]); cfg.natDynamic.push({ acl: m[1], iface: m[2] || null, pool: m[3] || null, overload: !!m[4] }); } // a new statement for the same list replaces the old one
        else if ((m = s.match(/^no ip nat inside source list (\S+)/))) cfg.natDynamic = cfg.natDynamic.filter(x => x.acl !== m[1]);
        else if ((m = s.match(/^no ip nat inside source static (\S+) (\S+)$/))) cfg.natStatic = cfg.natStatic.filter(x => !(x.inside === m[1] && x.outside === m[2]));
        else if ((m = s.match(/^ip nat pool (\S+) (\S+) (\S+) (?:netmask|prefix-length) (\S+)$/))) cfg.natPools[m[1]] = { start: m[2], end: m[3], mask: m[4] };
        else if ((m = s.match(/^ip dhcp excluded-address (\S+)(?: (\S+))?$/))) cfg.dhcp.excluded.push([m[1], m[2] || m[1]]);
        else if (s === 'ip dhcp snooping') cfg.dhcp.snooping = true;
        else if ((m = s.match(/^ip dhcp snooping vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) cfg.dhcp.snoopVlans.add(i); });
        else if ((m = s.match(/^ip arp inspection vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let i = a; i <= (b || a); i++) cfg.dhcp.daiVlans.add(i); });
        else if ((m = s.match(/^ntp server (\S+)/))) cfg.ntp.push(m[1]);
        else if ((m = s.match(/^logging (?:host )?(\S+)$/)) && !/^(console|monitor|buffered|trap|on)$/.test(m[1])) cfg.logging.push(m[1]);
        else if ((m = s.match(/^snmp-server community (\S+)(?: (ro|rw))?/))) cfg.snmp.push({ community: m[1], mode: m[2] || 'ro' });
        else if (s === 'no cdp run') cfg.cdp = false; else if (s === 'cdp run') cfg.cdp = true;
        else if (s === 'lldp run') cfg.lldp = true; else if (s === 'no lldp run') cfg.lldp = false;
        else if (/^errdisable recovery cause/.test(s)) cfg.errdisableRecovery = true;
        else if ((m = s.match(/^boot system (?:flash:? ?)?(\S+)$/))) (cfg.bootSystem = cfg.bootSystem || []).push(m[1].replace(/^flash:/, ''));
        else if ((m = s.match(/^ip ftp username (\S+)$/))) cfg.ftpUser = m[1];
        else if ((m = s.match(/^ip ftp password (?:\d+ )?(\S+)$/))) cfg.ftpPass = m[1];
        else if ((m = s.match(/^no ip route (\S+) (\S+)(?: (\S+))?/))) cfg.routes = cfg.routes.filter(x => !(x.prefix === m[1] && x.mask === m[2] && (!m[3] || x.via === m[3] || x.exit === m[3])));
        else if ((m = s.match(/^no access-list (\d+)$/))) delete cfg.acls[m[1]];
        else if ((m = s.match(/^no vlan (\d+)$/))) delete cfg.vlans[+m[1]];
      }
      // ---------------- vlan config
      if (r.mode === 'config-vlan') { const ids = r.ctx.replace('vlan ', '').split(',').map(x => +x.split('-')[0]); if ((m = s.match(/^name (\S+)$/))) ids.forEach(id => { cfg.vlans[id] = cfg.vlans[id] || { id }; cfg.vlans[id].name = m[1]; }); }
      // ---------------- interface config
      if (r.mode === 'config-if' || r.mode === 'config-subif' || r.mode === 'config-if-range') {
        for (const n of ifacesOf(r.ctx)) { const i = iface(cfg, n);
          if ((m = s.match(/^ip address (\S+) (\S+)( secondary)?$/))) { if (m[3]) i.secondary.push({ ip: m[1], mask: m[2] }); else { i.ip = m[1]; i.mask = m[2]; } }
          else if (s === 'no ip address') { i.ip = null; i.mask = null; }
          else if (s === 'shutdown') i.shutdown = true; else if (s === 'no shutdown') i.shutdown = false;
          else if ((m = s.match(/^description (.*)$/))) i.desc = m[1];
          else if ((m = s.match(/^switchport mode (access|trunk|dynamic (?:auto|desirable))$/))) i.mode = m[1];
          else if ((m = s.match(/^switchport access vlan (\d+)$/))) i.accessVlan = +m[1];
          else if ((m = s.match(/^switchport trunk allowed vlan (?:add )?([\d,\-]+|all|none)$/))) { if (m[1] === 'all') i.allowed = null; else if (m[1] === 'none') i.allowed = new Set(); else { i.allowed = i.allowed || (s.includes(' add ') ? new Set() : new Set()); m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let v = a; v <= (b || a); v++) i.allowed.add(v); }); } }
          else if ((m = s.match(/^switchport trunk native vlan (\d+)$/))) i.native = +m[1];
          else if ((m = s.match(/^switchport trunk encapsulation (dot1q|isl)$/))) i.encap = m[1];
          else if (s === 'switchport nonegotiate') i.nonegotiate = true;
          else if ((m = s.match(/^encapsulation dot1q (\d+)( native)?$/))) { i.dot1q = +m[1]; if (m[2]) i.dot1qNative = true; }
          else if ((m = s.match(/^ip helper-address (\S+)$/))) i.helpers.push(m[1]);
          else if ((m = s.match(/^ip access-group (\S+) (in|out)$/))) { if (m[2] === 'in') i.aclIn = m[1]; else i.aclOut = m[1]; }
          else if ((m = s.match(/^no ip access-group (\S+) (in|out)$/))) { if (m[2] === 'in') i.aclIn = null; else i.aclOut = null; }
          else if (s === 'ip nat inside') i.natInside = true; else if (s === 'ip nat outside') i.natOutside = true;
          else if ((m = s.match(/^ip ospf cost (\d+)$/))) i.ospfCost = +m[1];
          else if ((m = s.match(/^ip ospf (\d+) area (\d+)$/))) { i.ospfArea = +m[2]; i.ospfPid = +m[1]; }
          else if ((m = s.match(/^standby (\d+) ip (\S+)$/))) (i.standby[m[1]] = i.standby[m[1]] || {}).ip = m[2];
          else if ((m = s.match(/^standby (\d+) priority (\d+)$/))) (i.standby[m[1]] = i.standby[m[1]] || {}).priority = +m[2];
          else if ((m = s.match(/^standby (\d+) preempt/))) (i.standby[m[1]] = i.standby[m[1]] || {}).preempt = true;
          else if ((m = s.match(/^standby version (\d)$/))) i.standbyVersion = +m[1];
          else if (s === 'switchport port-security') (i.portsec = i.portsec || { max: 1, violation: 'shutdown', sticky: false, macs: [] }).enabled = true;
          else if ((m = s.match(/^switchport port-security maximum (\d+)$/))) (i.portsec = i.portsec || { enabled: false, max: 1, violation: 'shutdown', sticky: false, macs: [] }).max = +m[1];
          else if ((m = s.match(/^switchport port-security violation (shutdown|restrict|protect)$/))) (i.portsec = i.portsec || { enabled: false, max: 1, violation: 'shutdown', sticky: false, macs: [] }).violation = m[1];
          else if (s === 'switchport port-security mac-address sticky') (i.portsec = i.portsec || { enabled: false, max: 1, violation: 'shutdown', sticky: false, macs: [] }).sticky = true;
          else if ((m = s.match(/^switchport port-security mac-address (\S+)$/)) && m[1] !== 'sticky') (i.portsec = i.portsec || { enabled: false, max: 1, violation: 'shutdown', sticky: false, macs: [] }).macs.push(m[1]);
          else if ((m = s.match(/^channel-group (\d+) mode (active|passive|on|desirable|auto)$/))) i.channel = { group: +m[1], mode: m[2] };
          else if ((m = s.match(/^ipv6 address (\S+)\/(\d+)( eui-64)?$/))) i.ipv6.push({ addr: m[1], prefix: +m[2], eui64: !!m[3] });
          else if ((m = s.match(/^ipv6 address (\S+) link-local$/))) i.ipv6LinkLocal = m[1];
          else if (s === 'ipv6 enable') i.ipv6Enable = true;
          else if (s === 'ip dhcp snooping trust') i.snoopTrust = true; else if (s === 'ip arp inspection trust') i.daiTrust = true;
          else if ((m = s.match(/^speed (\S+)$/))) i.speed = m[1]; else if ((m = s.match(/^duplex (\S+)$/))) i.duplex = m[1];
          else if ((m = s.match(/^ip ospf network (\S+)$/))) i.ospfNetwork = m[1];
          else if ((m = s.match(/^switchport voice vlan (\d+)$/))) i.voiceVlan = +m[1];
          else if (s === 'no switchport voice vlan') i.voiceVlan = null;
          else if ((m = s.match(/^power inline police(?: action (errdisable|log))?$/))) i.powerPolice = m[1] || 'errdisable';
        }
      }
      // ---------------- line config
      if (r.mode === 'config-line') { const which = r.ctx.startsWith('line vty') ? cfg.vty : cfg.con;
        if ((m = s.match(/^transport input (.+)$/))) which.transport = m[1].split(' ');
        else if (s === 'login local') which.login = 'local'; else if (s === 'login') which.login = 'password'; else if (s === 'no login') which.login = 'none';
        else if ((m = s.match(/^password (\S+)$/))) which.password = m[1];
        else if ((m = s.match(/^access-class (\S+) (in|out)$/))) which.accessClass = m[1]; }
      // ---------------- named ACLs
      if (r.mode === 'config-std-nacl' || r.mode === 'config-ext-nacl') { const name = r.ctx.split(' ')[3]; const a = cfg.acls[name] || (cfg.acls[name] = { id: name, type: r.mode === 'config-std-nacl' ? 'standard' : 'extended', entries: [] });
        if ((m = s.match(/^(?:(\d+) )?(permit|deny) (.+)$/))) { const e = parseAclEntry(m[3].split(' ')); e.action = m[2]; e.seq = m[1] ? +m[1] : (a.entries.length + 1) * 10; a.entries.push(e); a.entries.sort((x, y) => x.seq - y.seq); }
        else if ((m = s.match(/^no (\d+)$/))) a.entries = a.entries.filter(e => e.seq !== +m[1]); }
      // ---------------- DHCP pool
      if (r.mode === 'config-dhcp') { const name = r.ctx.replace('ip dhcp pool ', ''); const p = cfg.dhcp.pools[name] || (cfg.dhcp.pools[name] = { name, network: null, mask: null, router: null, dns: [], lease: null, domain: null });
        if ((m = s.match(/^network (\S+) (\S+)$/))) { p.network = m[1]; p.mask = m[2]; }
        else if ((m = s.match(/^default-router (\S+)/))) p.router = m[1];
        else if ((m = s.match(/^dns-server (.+)$/))) p.dns = m[1].split(' ');
        else if ((m = s.match(/^lease (.+)$/))) p.lease = m[1];
        else if ((m = s.match(/^domain-name (\S+)$/))) p.domain = m[1]; }
      // ---------------- routing protocols
      if (r.mode === 'config-router') { const [, proto, pid] = r.ctx.split(' ');
        if (proto === 'ospf') { const o = cfg.ospf || (cfg.ospf = { pid: +pid, routerId: null, networks: [], passive: new Set(), passiveDefault: false, noPassive: new Set(), defaultOriginate: false, refBw: 100 });
          if ((m = s.match(/^router-id (\S+)$/))) o.routerId = m[1];
          else if ((m = s.match(/^network (\S+) (\S+) area (\d+)$/))) o.networks.push({ addr: m[1], wild: m[2], area: +m[3] });
          else if (s === 'passive-interface default') o.passiveDefault = true;
          else if ((m = s.match(/^passive-interface (\S+)$/))) o.passive.add(m[1].replace(/\s+/g, ''));
          else if ((m = s.match(/^no passive-interface (\S+)$/))) { o.noPassive.add(m[1]); o.passive.delete(m[1]); }
          else if (/^default-information originate/.test(s)) o.defaultOriginate = true;
          else if ((m = s.match(/^auto-cost reference-bandwidth (\d+)$/))) o.refBw = +m[1];
          else if ((m = s.match(/^maximum-paths (\d+)$/))) o.maxPaths = +m[1]; }
        if (proto === 'rip') { const o = cfg.rip || (cfg.rip = { networks: [], v2: false, noAuto: false, passive: new Set() }); if ((m = s.match(/^network (\S+)$/))) o.networks.push(m[1]); else if (s === 'version 2') o.v2 = true; else if (s === 'no auto-summary') o.noAuto = true; else if ((m = s.match(/^passive-interface (\S+)$/))) o.passive.add(m[1]); }
        if (proto === 'eigrp') { const o = cfg.eigrp || (cfg.eigrp = { as: +pid, networks: [], noAuto: false, routerId: null }); if ((m = s.match(/^network (\S+)(?: (\S+))?$/))) o.networks.push({ addr: m[1], wild: m[2] || null }); else if (s === 'no auto-summary') o.noAuto = true; else if ((m = s.match(/^eigrp router-id (\S+)$/))) o.routerId = m[1]; }
      }
      // ---------------- QoS (MQC): class-maps, policy-maps and their classes, service-policy and trust on interfaces
      const Q = cfg.qos || (cfg.qos = { classMaps: {}, policyMaps: {} });
      if (r.mode === 'config' && (m = s.match(/^class-map(?: (match-any|match-all))? (\S+)$/))) Q.classMaps[m[2]] = Q.classMaps[m[2]] || { name: m[2], type: m[1] || 'match-all', matches: [] };
      if (r.mode === 'config' && (m = s.match(/^policy-map (\S+)$/))) Q.policyMaps[m[1]] = Q.policyMaps[m[1]] || { name: m[1], classes: {}, order: [] };
      if (r.mode === 'config-cmap') { const name = r.ctx.split(' ').pop(); const c = Q.classMaps[name] || (Q.classMaps[name] = { name, type: 'match-all', matches: [] });
        if ((m = s.match(/^match (.+)$/))) c.matches.push(m[1]); else if ((m = s.match(/^no match (.+)$/))) c.matches = c.matches.filter(x => x !== m[1]); }
      if (r.mode === 'config-pmap' && (m = s.match(/^class (\S+)$/))) { const pm = Q.policyMaps[r.ctx.split(' ')[1]]; if (pm && !pm.classes[m[1]]) { pm.classes[m[1]] = { name: m[1] }; pm.order.push(m[1]); } }
      if (r.mode === 'config-pmap-c') { const [, pname, , cname] = r.ctx.split(' '); const pm = Q.policyMaps[pname] || (Q.policyMaps[pname] = { name: pname, classes: {}, order: [] }); const c = pm.classes[cname] || (pm.classes[cname] = { name: cname }); if (!pm.order.includes(cname)) pm.order.push(cname);
        if ((m = s.match(/^set (?:ip )?dscp (\S+)$/))) c.setDscp = m[1]; else if ((m = s.match(/^set cos (\d)$/))) c.setCos = +m[1];
        else if ((m = s.match(/^priority (?:percent (\d+)|(\d+))/))) c.priority = m[1] ? { percent: +m[1] } : { kbps: +m[2] };
        else if ((m = s.match(/^bandwidth (?:remaining )?(?:percent (\d+)|(\d+))$/))) c.bandwidth = m[1] ? { percent: +m[1] } : { kbps: +m[2] };
        else if ((m = s.match(/^police (?:cir )?(\d+)/))) c.police = { bps: +m[1], raw: s }; else if ((m = s.match(/^shape average (\d+)/))) c.shape = { bps: +m[1] };
        else if (s === 'fair-queue') c.fairQueue = true; else if (/^random-detect/.test(s)) c.wred = s; }
      if ((r.mode === 'config-if' || r.mode === 'config-if-range' || r.mode === 'config-subif') && ((m = s.match(/^service-policy (input|output) (\S+)$/)) || (m = s.match(/^mls qos trust (cos|dscp|device cisco-phone)$/)))) for (const n of ifacesOf(r.ctx)) { const i = iface(cfg, n);
        if (s.startsWith('service-policy')) (i.servicePolicy = i.servicePolicy || {})[m[1]] = m[2]; else if (m[1] === 'device cisco-phone') i.qosTrustDevice = 'cisco-phone'; else i.qosTrust = m[1]; }
      // ---------------- switch security extras: err-disable recovery, snooping option 82 and rate limits, DAI validation, ARP ACLs and filters
      const X = cfg.sec || (cfg.sec = secBlank());
      if (r.mode && r.mode.startsWith('config') && r.mode !== 'config-arp-nacl' || r.mode === 'config-arp-nacl' && /^(no )?(ip arp inspection|ip dhcp snooping|errdisable) /.test(s)) {
        if ((m = s.match(/^errdisable recovery cause (\S+)$/))) X.recoveryCauses.add(m[1]);
        else if ((m = s.match(/^no errdisable recovery cause (\S+)$/))) X.recoveryCauses.delete(m[1]);
        else if ((m = s.match(/^errdisable recovery interval (\d+)$/))) X.recoveryInterval = +m[1];
        else if (s === 'ip dhcp snooping information option') X.option82 = true; else if (s === 'no ip dhcp snooping information option') X.option82 = false;
        else if (s === 'no ip dhcp snooping') cfg.dhcp.snooping = false;
        else if ((m = s.match(/^no ip dhcp snooping vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let v = a; v <= (b || a); v++) cfg.dhcp.snoopVlans.delete(v); });
        else if ((m = s.match(/^no ip arp inspection vlan ([\d,\-]+)$/))) m[1].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let v = a; v <= (b || a); v++) cfg.dhcp.daiVlans.delete(v); });
        else if ((m = s.match(/^ip arp inspection validate ((?:src-mac|dst-mac|ip)(?: (?:src-mac|dst-mac|ip))*)$/))) X.daiValidate = m[1].split(' '); // one command sets them all; a new one replaces the old
        else if (s === 'no ip arp inspection validate' || /^no ip arp inspection validate /.test(s)) X.daiValidate = [];
        else if ((m = s.match(/^ip arp inspection filter (\S+) vlan ([\d,\-]+)(?: static)?$/))) m[2].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let v = a; v <= (b || a); v++) X.daiFilters[v] = m[1]; });
        else if ((m = s.match(/^no ip arp inspection filter (\S+) vlan ([\d,\-]+)/))) m[2].split(',').forEach(x => { const [a, b] = x.split('-').map(Number); for (let v = a; v <= (b || a); v++) if (X.daiFilters[v] === m[1]) delete X.daiFilters[v]; });
        if (r.mode === 'config-if' || r.mode === 'config-if-range') for (const n of ifacesOf(r.ctx)) { const i = iface(cfg, n);
          if ((m = s.match(/^ip dhcp snooping limit rate (\d+)$/))) i.snoopRate = +m[1]; else if (s === 'no ip dhcp snooping limit rate') i.snoopRate = null;
          else if ((m = s.match(/^ip arp inspection limit rate (\d+)(?: burst interval (\d+))?$/))) { i.daiRate = +m[1]; i.daiBurst = m[2] ? +m[2] : 1; } else if (s === 'ip arp inspection limit rate none') i.daiRate = 'none';
          else if (s === 'no ip dhcp snooping trust') i.snoopTrust = false; else if (s === 'no ip arp inspection trust') i.daiTrust = false; } }
      if (r.mode === 'config-arp-nacl') { const name = r.ctx.split(' ')[2]; const a = X.arpAcls[name] || (X.arpAcls[name] = []);
        const hostOr = (t, k) => t[k] === 'any' ? [null, k + 1] : t[k] === 'host' ? [t[k + 1], k + 2] : [null, k + 1];
        if ((m = s.match(/^(permit|deny) ip (.+)$/))) { const t = m[2].split(' '); const [ip, k] = hostOr(t, 0); const [mac] = t[k] === 'mac' ? hostOr(t, k + 1) : [null]; a.push({ action: m[1], ip, mac, raw: s }); } }
    }
    if (!cfg.sec) cfg.sec = secBlank();
    if (!cfg.qos) cfg.qos = { classMaps: {}, policyMaps: {} };
    cfg.hostname = dev.host;
    cfg.stp = Stp.readConfig(dev, 1);
    return cfg;
  }

  window.NetConfig = { parse, blank, iface, PORTS, secBlank };
})();
