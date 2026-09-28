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
        else if ((m = s.match(/^ip route (\S+) (\S+) (\S+)(?: (\d+))?$/))) cfg.routes.push({ prefix: m[1], mask: m[2], via: m[3], ad: m[4] ? +m[4] : 1 });
        else if ((m = s.match(/^ipv6 route (\S+) (\S+)$/))) cfg.routes6.push({ prefix: m[1], via: m[2] });
        else if ((m = s.match(/^access-list (\d+) (permit|deny) (.+)$/))) { const n = m[1]; const a = cfg.acls[n] || (cfg.acls[n] = { id: n, type: (+n >= 100 && +n <= 199) || (+n >= 2000 && +n <= 2699) ? 'extended' : 'standard', entries: [] }); const e = parseAclEntry(m[3].split(' ')); e.action = m[2]; e.seq = (a.entries.length + 1) * 10; a.entries.push(e); }
        else if ((m = s.match(/^access-list (\d+) remark (.*)$/))) { const n = m[1]; cfg.acls[n] || (cfg.acls[n] = { id: n, type: +n >= 100 ? 'extended' : 'standard', entries: [] }); }
        else if ((m = s.match(/^ip nat inside source static (\S+) (\S+)$/))) cfg.natStatic.push({ inside: m[1], outside: m[2] });
        else if ((m = s.match(/^ip nat inside source list (\S+) (?:interface (\S+)|pool (\S+))( overload)?$/))) cfg.natDynamic.push({ acl: m[1], iface: m[2] || null, pool: m[3] || null, overload: !!m[4] });
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
        else if ((m = s.match(/^no ip route (\S+) (\S+) (\S+)/))) cfg.routes = cfg.routes.filter(x => !(x.prefix === m[1] && x.mask === m[2] && x.via === m[3]));
        else if ((m = s.match(/^no access-list (\d+)$/))) delete cfg.acls[m[1]];
        else if ((m = s.match(/^no vlan (\d+)$/))) delete cfg.vlans[+m[1]];
        if ((m = s.match(/^no router (ospf|eigrp|rip)\b(?: (\d+))?/)) && cfg[m[1]] && (!m[2] || m[1] === 'rip' || String(cfg[m[1]].pid != null ? cfg[m[1]].pid : cfg[m[1]].as) === m[2])) cfg[m[1]] = null; // remove the routing process
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
          if ((m = s.match(/^ip ospf (priority|hello-interval|dead-interval) (\d+)$/))) i[{ priority: 'ospfPriority', 'hello-interval': 'ospfHello', 'dead-interval': 'ospfDead' }[m[1]]] = +m[2];
          if (/^no ip ospf (hello|dead)-interval/.test(s)) { i.ospfHello = null; i.ospfDead = null; } if (s === 'no ip ospf network') i.ospfNetwork = null;
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
        if (proto === 'eigrp' && (m = s.match(/^passive-interface (\S+)$/))) (cfg.eigrp.passive = cfg.eigrp.passive || new Set()).add(m[1].replace(/\s+/g, '')); // EIGRP passive: no hellos, no neighbours, the network is still advertised
      }
    }
    cfg.hostname = dev.host;
    cfg.stp = Stp.readConfig(dev, 1);
    return cfg;
  }

  window.NetConfig = { parse, blank, iface, PORTS };
})();
