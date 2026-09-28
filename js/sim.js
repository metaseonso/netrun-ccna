/* sim.js — tiny Cisco-IOS-flavoured console simulator.
   Enough of the CLI grammar for the practicum jobs: modes, prompts, abbreviations,
   canned "show" output, and a normalized transcript that jobs validate against. */
(function(){
  // ---- abbreviation expansion --------------------------------------------
  const FIRST = { en:'enable', ena:'enable', conf:'configure', config:'configure', int:'interface', sh:'show', sho:'show', wr:'write', exit:'exit', end:'end',
    ho:'hostname', host:'hostname', hostn:'hostname', no:'no', ip:'ip', ipv6:'ipv6', sw:'switchport', swi:'switchport', switch:'switchport', span:'spanning-tree', spanning:'spanning-tree',
    desc:'description', shut:'shutdown', router:'router', rou:'router', vlan:'vlan', name:'name', access:'access-list', acc:'access-list', line:'line', lin:'line', login:'login', log:'logging', logg:'logging',
    transport:'transport', trans:'transport', crypto:'crypto', cry:'crypto', username:'username', user:'username', enc:'encapsulation', encap:'encapsulation', encapsulation:'encapsulation',
    network:'network', net:'network', passive:'passive-interface', pass:'passive-interface', default:'default-information', standby:'standby', stand:'standby', channel:'channel-group', chan:'channel-group',
    ntp:'ntp', snmp:'snmp-server', snmp:'snmp-server', service:'service', do:'do', copy:'copy', banner:'banner', clock:'clock', permit:'permit', deny:'deny', remark:'remark', dhcp:'dhcp',
    dns:'dns-server', 'dns-server':'dns-server', 'default-router':'default-router', lease:'lease', domain:'domain-name', errdisable:'errdisable', arp:'arp' };
  const SECOND = { t:'terminal', term:'terminal', terminal:'terminal', run:'running-config', 'running':'running-config', start:'startup-config', startup:'startup-config', br:'brief', bri:'brief',
    'access-lists':'access-lists', tr:'trunk', mo:'mode', mod:'mode', acc:'access', ac:'access', vl:'vlan', po:'port-security', 'port':'port-security', 'port-sec':'port-security',
    add:'address', addr:'address', ro:'route', rou:'route', 'ospf':'ospf', 'ei':'eigrp', 'na':'nat', 'so':'source', 'sta':'static', 'gen':'generate', 'ke':'key',
    'sec':'secret', 'secr':'secret', 'vt':'vty', 'con':'console', 'shut':'shutdown', 'ne':'neighbors', 'nei':'neighbors', 'neigh':'neighbors', 'inter':'interfaces', 'int':'interfaces',
    'dh':'dhcp', 'snoop':'snooping', 'snoo':'snooping', 'pri':'priority', 'prio':'priority', 'roo':'root', 'portf':'portfast', 'bpdu':'bpduguard', 'stat':'statistics', 'nat':'nat', 'trans':'translations',
    'ver':'version', 'v':'version', 'ma':'mac', 'mac':'mac', 'st':'standby', 'unicast':'unicast-routing', 'uni':'unicast-routing', 'server':'server', 'ser':'server', 'pool':'pool', 'excluded':'excluded-address', 'exc':'excluded-address',
    'default-information':'default-information', 'orig':'originate', 'ori':'originate', 'ip':'ip', 'ipv6':'ipv6', 'ssh':'ssh', 'trap':'traps', 'community':'community', 'comm':'community', 'sec':'secret',
    'protocol':'protocol', 'prot':'protocol', 'vlan':'vlan', 'name':'name', 'lldp':'lldp', 'cdp':'cdp', 'ru':'run', 'g':'gigabitethernet' };

  const IF_RE = /^(gigabitethernet|gi|g|fastethernet|fa|f|ethernet|e|loopback|lo|serial|se|s|vlan|port-channel|po|tunnel)\s*(\d+(?:\/\d+)*(?:\.\d+)?)$/i;
  const IF_MAP = { g:'gigabitethernet', gi:'gigabitethernet', gigabitethernet:'gigabitethernet', fa:'fastethernet', f:'fastethernet', fastethernet:'fastethernet', e:'ethernet', ethernet:'ethernet',
    lo:'loopback', loopback:'loopback', se:'serial', s:'serial', serial:'serial', vlan:'vlan', po:'port-channel', 'port-channel':'port-channel', tunnel:'tunnel' };

  function canonIf(s){
    const m = s.replace(/\s+/g,'').match(/^([a-z-]+)(\d.*)$/i); if (!m) return null;
    const k = m[1].toLowerCase(); if (!IF_MAP[k]) return null; return IF_MAP[k] + m[2];
  }

  function normalize(line){
    let t = line.trim().replace(/\s+/g,' ').toLowerCase().split(' ');
    if (!t[0]) return '';
    if (FIRST[t[0]]) t[0] = FIRST[t[0]];
    if (t[0] === 'no' && t[1] && FIRST[t[1]]) t[1] = FIRST[t[1]];
    if (t[0] === 'do' && t[1] && FIRST[t[1]]) t[1] = FIRST[t[1]];
    // interface names anywhere: join "g 0/1" into "g0/1" then canon
    for (let i = 0; i < t.length; i++) {
      if (/^(gigabitethernet|gi|g|fastethernet|fa|f|ethernet|e|loopback|lo|serial|se|s|vlan|port-channel|po|tunnel)$/i.test(t[i]) && t[i+1] && /^\d/.test(t[i+1]) && !(t[0]==='vlan' && i===0) && !(t[i]==='vlan' && (t[0]==='switchport'||t[0]==='spanning-tree'||t[0]==='ip'||t[0]==='show'||t[0]==='name'))) {
        const j = canonIf(t[i] + t[i+1]); if (j) { t.splice(i, 2, j); }
      } else if (i > 0 && /^(gigabitethernet|gi|g|fastethernet|fa|f|loopback|lo|serial|se|s|port-channel|po)\d/i.test(t[i])) {
        const j = canonIf(t[i]); if (j) t[i] = j;
      }
    }
    // second-token expansion (contextual)
    const base = t[0] === 'no' || t[0] === 'do' ? 1 : 0;
    if (t[base+1] && SECOND[t[base+1]] && !/^\d/.test(t[base+1])) {
      // avoid turning "ip address"/"vlan 10" words wrongly; only expand when it is an abbreviation of a known keyword
      const w = t[base+1]; const full = SECOND[w];
      if (full.startsWith(w) || w === 't' || w === 'run' || w === 'br' || w === 'ma') t[base+1] = full;
    }
    if (t[base+2] && SECOND[t[base+2]] && SECOND[t[base+2]].startsWith(t[base+2]) && !/^\d/.test(t[base+2])) t[base+2] = SECOND[t[base+2]];
    if (t[base+3] && SECOND[t[base+3]] && SECOND[t[base+3]].startsWith(t[base+3]) && !/^\d/.test(t[base+3])) t[base+3] = SECOND[t[base+3]];
    // common phrase fixes
    let s = t.join(' ');
    s = s.replace(/^configure terminal.*$/, 'configure terminal').replace(/^show running-config.*/, 'show running-config').replace(/^copy running-config startup-config$/, 'write memory').replace(/^write$/, 'write memory').replace(/^write mem$/, 'write memory');
    s = s.replace(/^interface range /, 'interface range ');
    s = s.replace(/^no shut$/, 'no shutdown');
    s = s.replace(/^transport in(p|pu)? /, 'transport input ').replace(/^ip nat ins(i|id|ide)?$/, 'ip nat inside').replace(/^ip nat out(s|si|sid|side)?$/, 'ip nat outside').replace(/^ip nat ins(i|id|ide)? so(u|ur|urc|urce)? /, 'ip nat inside source ').replace(/^ip arp ins(p|pe|pec|pect|pecti|pectio|pection)? /, 'ip arp inspection ');
    s = s.replace(/ dot1q$/, ' dot1q');
    // keywords the second-word expansion must leave alone: "cdp run" / "lldp run", "sh ip int" is interface, "logging trap", "snmp-server community X ro"
    s = s.replace(/^(no )?(cdp|lldp) running-config$/, '$1$2 run').replace(/^(do )?show ip interfaces /, '$1show ip interface ').replace(/^(no )?logging traps /, '$1logging trap ').replace(/^(no )?snmp-server community (\S+) route( |$)/, '$1snmp-server community $2 ro$3');
    return s;
  }

  // ---- device state ---------------------------------------------------------
  function Device(name, opts){
    this.name = name; this.host = name; this.mode = 'user'; this.ctx = ''; this.stack = [];
    this.lines = []; // {mode, ctx, line, pre?}
    this.out = [];   // rendered console lines {t:'in'|'out'|'err'|'sys', s}
    this.shows = (opts && opts.shows) || {};
    this.kind = (opts && opts.kind) || 'ios'; // 'ios' | 'host'
    this.banner = (opts && opts.banner) || null;
    this._netState = (opts && opts.netState) || null; // () => Net state, supplied by the game
    this.startup = null;  // the saved config text, set by write memory
    this.pending = null;  // 'enable' while the box waits for the enable password
    if (this.banner) this.out.push({ t:'sys', s: this.banner });
  }
  // apply a starting configuration silently (scenario setup); recorded as pre lines, shown in running-config
  Device.prototype.preload = function(lines){ const keepOut = this.out.length; lines = (lines || []).slice(); if (this.kind !== 'host') { const first = normalize(lines[0] || ''); if (first !== 'enable' && first !== 'configure terminal') lines = ['enable', 'configure terminal'].concat(lines); }
    lines.forEach(l => this.exec(l, this._all, true)); this.out.length = keepOut; this.lines.forEach(r => { if (r.pre === undefined) r.pre = true; }); this.mode = 'user'; this.ctx = ''; this.stack = []; this.pending = null; if (this.kind !== 'host' && lines.length > 2) this.startup = configText(this); };
  Device.prototype.prompt = function(){
    const h = this.host; if (this.kind === 'host') return h + '>'; if (this.pending) return 'Password:';
    switch (this.mode) {
      case 'user': return h + '>'; case 'priv': return h + '#'; case 'config': return h + '(config)#';
      case 'config-if': return h + '(config-if)#'; case 'config-subif': return h + '(config-subif)#'; case 'config-if-range': return h + '(config-if-range)#';
      case 'config-line': return h + '(config-line)#'; case 'config-router': return h + '(config-router)#'; case 'config-std-nacl': return h + '(config-std-nacl)#';
      case 'config-ext-nacl': return h + '(config-ext-nacl)#'; case 'config-vlan': return h + '(config-vlan)#'; case 'config-dhcp': return h + '(dhcp-config)#';
      case 'config-vrf': return h + '(config-vrf)#'; default: return h + '(' + this.mode + ')#';
    }
  };
  Device.prototype.enter = function(mode, ctx){ this.stack.push([this.mode, this.ctx]); this.mode = mode; this.ctx = ctx; };
  Device.prototype.leave = function(){ if (this.stack.length) { const [m, c] = this.stack.pop(); this.mode = m; this.ctx = c; } };

  function matchShow(dev, s){
    // exact normalized match first, then prefix-token match against canned keys
    const keys = Object.keys(dev.shows);
    const val = v => typeof v === 'function' ? v(dev, dev._all || {}) : v;
    if (dev.shows[s]) return { key: s, out: val(dev.shows[s]) };
    const st = s.split(' ');
    for (const k of keys) {
      const kt = k.split(' ');
      if (kt.length !== st.length) continue;
      let ok = true; for (let i = 0; i < kt.length; i++) { if (!kt[i].startsWith(st[i])) { ok = false; break; } }
      if (ok) return { key: k, out: val(dev.shows[k]) };
    }
    return null;
  }

  // ---- running-config, startup-config, help ---------------------------------------
  // Cisco type 7 (service password-encryption) is a reversible Vigenère over this key; type 5 is an MD5 hash (shown as a stable stand-in here).
  const XLAT = 'dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87';
  function type7(pw){ let h = 0; for (const c of pw) h = (h * 31 + c.charCodeAt(0)) >>> 0; const salt = h % 16; let out = String(salt).padStart(2, '0');
    for (let i = 0; i < pw.length; i++) out += (pw.charCodeAt(i) ^ XLAT.charCodeAt((salt + i) % XLAT.length)).toString(16).toUpperCase().padStart(2, '0'); return out; }
  function type5(pw){ const A = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; let h = 2166136261; const pick = n => { let o = ''; for (let i = 0; i < n; i++) { for (const c of pw + i) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; o += A[h % 64]; } return o; }; const salt = pick(4); return '$1$' + salt + '$' + pick(22); }
  const OPENER = /^(interface |router |line |ip access-list (standard|extended) |vlan [\d,\-]+$|ip dhcp pool |ip vrf )/;
  // settings that replace themselves inside a block (the last one typed wins); "no X" removes X
  const SINGLE = [/^hostname /, /^enable secret /, /^enable password /, /^ip domain[- ]name /, /^banner motd /, /^spanning-tree mode /, /^ip default-gateway /, /^service password-encryption$/,
    /^ip address (?!.* secondary$)/, /^description /, /^speed /, /^duplex /, /^switchport mode /, /^switchport access vlan /, /^switchport trunk native vlan /, /^switchport trunk encapsulation /, /^switchport trunk allowed vlan (?!add )/,
    /^encapsulation dot1q /, /^router-id /, /^password /, /^login( local)?$/, /^transport input /, /^exec-timeout /, /^ip ospf cost /, /^name /, /^network (?=\S+ \S+$)/, /^default-router /, /^dns-server /, /^standby \d+ priority /];
  const keyOf = line => { const r = SINGLE.find(x => x.test(line)); return r ? r.source : null; };
  function configText(dev){
    const S = dev._netState ? dev._netState() : null; const blocks = new Map([['', []]]); let enc = false; const secrets = [];
    const block = ctx => { if (!blocks.has(ctx)) blocks.set(ctx, []); return blocks.get(ctx); };
    const put = (b, line) => { const k = keyOf(line); if (k) { const i = b.findIndex(x => keyOf(x.line) === k); if (i >= 0) b.splice(i, 1); } if (!b.some(x => x.line === line)) b.push({ line }); return b[b.length - 1]; };
    for (const r of dev.lines) { if (!r.mode || !r.mode.startsWith('config')) continue; let line = r.line; if (!line || line.startsWith('do ') || line === 'exit' || line === 'end') continue;
      if (r.mode === 'config' && OPENER.test(line)) { block(line.startsWith('interface ') ? 'interface ' + line.slice(10) : line); continue; }
      const b = block(r.mode === 'config' ? '' : r.ctx);
      if (line === 'service password-encryption') { enc = true; secrets.forEach(x => { x.enc = true; }); put(b, line); continue; }
      if (line === 'no service password-encryption') { enc = false; const i = b.findIndex(x => x.line === 'service password-encryption'); if (i >= 0) b.splice(i, 1); continue; }
      if (line === 'no shutdown') { const i = b.findIndex(x => x.line === 'shutdown'); if (i >= 0) b.splice(i, 1); b.noShut = true; continue; }
      if (line === 'shutdown') b.noShut = false;
      { const na = line.match(/^no access-list (\d+)$/); if (na) { for (let i = b.length - 1; i >= 0; i--) if (b[i].line.startsWith('access-list ' + na[1] + ' ')) b.splice(i, 1); continue; } } // the whole numbered list goes
      if (line.startsWith('no ')) { const what = line.slice(3); const i = b.findIndex(x => x.line === what || x.line.startsWith(what + ' ') || keyOf(x.line) && keyOf(x.line) === keyOf(what)); if (i >= 0) b.splice(i, 1); else if (what === 'ip address') { const j = b.findIndex(x => /^ip address /.test(x.line)); if (j >= 0) b.splice(j, 1); } continue; }
      const e = put(b, line); if (/^enable password |^password |^username \S+ password /.test(line)) { e.enc = enc; secrets.push(e); } }
    const show = x => { let m; const l = x.line;
      if ((m = l.match(/^enable secret (?:\d+ )?(\S+)$/))) return 'enable secret 5 ' + type5(m[1]);
      if ((m = l.match(/^username (\S+) (?:privilege (\d+) )?secret (?:\d+ )?(\S+)$/))) return 'username ' + m[1] + (m[2] ? ' privilege ' + m[2] : '') + ' secret 5 ' + type5(m[3]);
      if ((m = l.match(/^(enable password|password|username \S+ password) (?:\d+ )?(\S+)$/))) return m[1] + (x.enc ? ' 7 ' + type7(m[2]) : ' ' + m[2]);
      if ((m = l.match(/^hostname /))) return 'hostname ' + dev.host; return l; };
    const G = blocks.get(''); const o = ['version 15.1', (G.some(x => x.line === 'service password-encryption') ? '' : 'no ') + 'service password-encryption', '!', 'hostname ' + dev.host, '!'];
    const top = G.filter(x => /^enable (secret|password) /.test(x.line)); if (top.length) o.push(...top.sort((a, b) => a.line.localeCompare(b.line) * -1).map(show), '!');
    const late = x => /^(ip route |ipv6 route |access-list |banner |ip nat )/.test(x.line);
    const rest = G.filter(x => !/^(hostname |enable (secret|password) |service password-encryption$)/.test(x.line) && !late(x)); if (rest.length) o.push(...rest.map(show), '!');
    // interfaces: every port the box has in this network, in the order IOS lists them, then any the player created
    const ifs = []; const seen = new Set(); const addIf = n => { if (!seen.has(n)) { seen.add(n); ifs.push(n); } };
    const kind = S && S.net && S.net.devices[dev.name] ? S.net.devices[dev.name].kind : null;
    if (S && S.ifaces && S.ifaces[dev.name]) Object.keys(S.ifaces[dev.name]).filter(n => !n.includes('.') && !n.startsWith('vlan')).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).forEach(addIf);
    [...blocks.keys()].filter(k => k.startsWith('interface ') && !k.startsWith('interface range ')).map(k => k.slice(10)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true })).forEach(addIf);
    const ranged = [...blocks.keys()].filter(k => k.startsWith('interface range ')); const rangeLines = n => { const out = []; ranged.forEach(k => { const members = window.Stp ? Stp.expandRange(k.replace('interface range ', '')) : []; if (members.includes(n)) blocks.get(k).forEach(x => out.push(x)); }); return out; };
    ifs.forEach(n => { const b = (blocks.get('interface ' + n) || []).concat(rangeLines(n)); const lines = b.map(x => ' ' + show(x)); const noShut = (blocks.get('interface ' + n) || {}).noShut;
      const physRouter = (kind === 'router') && /^(gigabitethernet|fastethernet|serial|ethernet)\d/.test(n) && !n.includes('.');
      if (!b.some(x => /^ip address /.test(x.line)) && (kind === 'router' || n.startsWith('vlan') || n.includes('.'))) lines.push(' no ip address');
      if (physRouter && !noShut && !b.some(x => x.line === 'shutdown')) lines.push(' shutdown');
      o.push('interface ' + n.replace(/^[a-z-]+/, w => ({ gigabitethernet: 'GigabitEthernet', fastethernet: 'FastEthernet', serial: 'Serial', ethernet: 'Ethernet', loopback: 'Loopback', vlan: 'Vlan', 'port-channel': 'Port-channel', tunnel: 'Tunnel', tengigabitethernet: 'TenGigabitEthernet' }[w] || w)), ...lines, '!'); });
    [...blocks.keys()].filter(k => k.startsWith('interface ') && !ifs.includes(k.slice(10)) && !k.startsWith('interface range ')).forEach(k => o.push(k, ...blocks.get(k).map(x => ' ' + show(x)), '!'));
    [...blocks.keys()].filter(k => /^(router |ip dhcp pool |ip vrf |ip access-list |vlan )/.test(k)).forEach(k => o.push(k, ...blocks.get(k).map(x => ' ' + show(x)), '!'));
    const tail = G.filter(late); tail.filter(x => !x.line.startsWith('banner ')).forEach(x => o.push(show(x))); if (tail.length) o.push('!');
    const ban = G.find(x => x.line.startsWith('banner motd ')); if (ban) o.push('banner motd ' + ban.line.slice(12), '!');
    const lineOf = k => (blocks.get(k) || []).map(x => ' ' + show(x)); const con = [...blocks.keys()].find(k => /^line con/.test(k)); const vty = [...blocks.keys()].filter(k => /^line vty/.test(k));
    o.push('line con 0', ...(con ? lineOf(con) : []), '!', 'line aux 0', '!'); if (vty.length) vty.forEach(k => o.push(k, ...lineOf(k))); else o.push('line vty 0 4', ' login'); o.push('!', 'end');
    return o.join('\n'); }
  function runningConfig(dev){ const t = configText(dev); return 'Building configuration...\n\nCurrent configuration : ' + t.length + ' bytes\n!\n' + t; }
  function startupConfig(dev){ return dev.startup ? 'Using ' + dev.startup.length + ' out of 262136 bytes\n!\n' + dev.startup : 'startup-config is not present'; }
  const HELP = {
    user: [['enable', 'Turn on privileged commands'], ['exit', 'Exit from the EXEC'], ['ping', 'Send echo messages'], ['show', 'Show running system information'], ['traceroute', 'Trace route to destination']],
    priv: [['configure', 'Enter configuration mode'], ['copy', 'Copy from one file to another'], ['disable', 'Turn off privileged commands'], ['enable', 'Turn on privileged commands'], ['exit', 'Exit from the EXEC'], ['ping', 'Send echo messages'], ['show', 'Show running system information'], ['traceroute', 'Trace route to destination'], ['write', 'Write running configuration to memory']],
    config: [['access-list', 'Add an access list entry'], ['banner', 'Define a login banner'], ['do', 'To run exec commands in config mode'], ['enable', 'Modify enable password parameters'], ['end', 'Exit from configure mode'], ['exit', 'Exit from configure mode'], ['hostname', 'Set system\'s network name'], ['interface', 'Select an interface to configure'], ['ip', 'Global IP configuration subcommands'], ['line', 'Configure a terminal line'], ['no', 'Negate a command or set its defaults'], ['router', 'Enable a routing process'], ['service', 'Modify use of network based services'], ['spanning-tree', 'Spanning Tree Subsystem'], ['username', 'Establish User Name Authentication'], ['vlan', 'VLAN commands']],
    'config-if': [['channel-group', 'Etherchannel/port bundling configuration'], ['description', 'Interface specific description'], ['duplex', 'Configure duplex operation'], ['exit', 'Exit from interface configuration mode'], ['ip', 'Interface Internet Protocol config commands'], ['ipv6', 'IPv6 interface subcommands'], ['no', 'Negate a command or set its defaults'], ['shutdown', 'Shutdown the selected interface'], ['spanning-tree', 'Spanning Tree Subsystem'], ['speed', 'Configure speed operation'], ['standby', 'HSRP interface configuration commands'], ['switchport', 'Set switching mode characteristics']],
    'config-line': [['access-class', 'Filter connections based on an IP access list'], ['exec-timeout', 'Set the EXEC timeout'], ['exit', 'Exit from line configuration mode'], ['login', 'Enable password checking'], ['no', 'Negate a command or set its defaults'], ['password', 'Set a password'], ['transport', 'Define transport protocols for line']],
    'config-router': [['default-information', 'Distribution of default information'], ['exit', 'Exit from routing protocol configuration mode'], ['network', 'Enable routing on an IP network'], ['no', 'Negate a command or set its defaults'], ['passive-interface', 'Suppress routing updates on an interface'], ['router-id', 'router-id for this process']],
    show: [['arp', 'ARP table'], ['cdp', 'CDP information'], ['clock', 'Display the system clock'], ['interfaces', 'Interface status and configuration'], ['ip', 'IP information'], ['mac', 'MAC configuration'], ['running-config', 'Current operating configuration'], ['spanning-tree', 'Spanning tree topology'], ['startup-config', 'Contents of startup configuration'], ['version', 'System hardware and software status'], ['vlan', 'VTP VLAN status']]
  };
  const helpText = rows => rows.map(([c, d]) => '  ' + c.padEnd(16) + d).join('\n');

  Device.prototype.exec = function(raw, all, silent){
    const dev = this; if (all) dev._all = all; const S = dev._netState ? dev._netState() : null;
    if (dev.kind === 'host') { dev.out.push({ t:'in', s: dev.prompt() + ' ' + raw.trim() }); const o = window.Show ? Show.host(dev, raw, S) : 'no network'; if (o) dev.out.push({ t: /timed out|not recognized/.test(o) ? 'err' : 'out', s: o }); dev.lines.push({ mode: 'host', ctx: '', line: normalize(raw) }); return; }
    // the enable password prompt: the typed word is never echoed or recorded
    if (dev.pending === 'enable') { dev.out.push({ t:'in', s: 'Password: ' }); const c = window.NetConfig ? NetConfig.parse(dev) : {}; const want = c.enableSecret || c.enablePassword;
      if (want && raw.trim().toLowerCase() === String(want).toLowerCase()) { dev.pending = null; dev.authFails = 0; dev.mode = 'priv'; dev.lines.push({ mode: 'user', ctx: '', line: 'enable', auth: true }); }
      else if (++dev.authFails >= 3) { dev.pending = null; dev.authFails = 0; dev.out.push({ t:'err', s:'% Bad secrets' }); }
      return; }
    // output modifiers: show ... | include X  (also exclude, begin, section)
    let pipe = null; const pm = raw.match(/\s\|\s*(i|in|inc|incl|inclu|includ|include|e|ex|exc|excl|exclu|exclud|exclude|b|be|beg|begi|begin|s|se|sec|sect|secti|sectio|section)\s+(.+)$/i);
    if (pm) { pipe = { kind: pm[1][0].toLowerCase(), re: new RegExp(pm[2].trim().replace(/[.*+?^${}()[\]\\]/g, m => m === '.' ? '.' : '\\' + m), 'i') }; raw = raw.slice(0, pm.index); }
    const s = normalize(raw);
    dev.out.push({ t:'in', s: dev.prompt() + ' ' + raw.trim() + (pipe ? ' | ' + pm[1] + ' ' + pm[2] : '') });
    if (!s) return;
    if (pipe) { const n0 = dev.out.length; dev.exec(raw, all, true); const fresh = dev.out.splice(n0); const kept = fresh.slice(1).map(o => { if (o.t !== 'out') return o; const L = o.s.split('\n'); let out;
        if (pipe.kind === 'i') out = L.filter(l => pipe.re.test(l)); else if (pipe.kind === 'e') out = L.filter(l => !pipe.re.test(l));
        else if (pipe.kind === 'b') { const i = L.findIndex(l => pipe.re.test(l)); out = i < 0 ? [] : L.slice(i); }
        else { out = []; let on = false; L.forEach(l => { if (!/^\s/.test(l)) on = pipe.re.test(l); if (on) out.push(l); }); }
        return Object.assign({}, o, { s: out.join('\n') }); }); dev.out.push(...kept); return; }
    if (!silent) dev.lines.forEach(r => { if (r.pre === undefined) r.pre = false; });
    if (s === '?' || s === 'do ?') { const rows = HELP[s === 'do ?' ? 'priv' : dev.mode] || HELP[dev.mode.startsWith('config-') ? 'config-if' : 'config']; dev.out.push({ t:'out', s: 'Exec commands:'.replace('Exec', dev.mode.startsWith('config') && s !== 'do ?' ? 'Configure' : 'Exec') + '\n' + helpText(rows) }); return; }
    if (/^(do )?show \?$/.test(s)) { dev.out.push({ t:'out', s: helpText(HELP.show) }); return; }
    if (s.endsWith(' ?')) { dev.out.push({ t:'sys', s: '  (this shell lists the commands for each mode with a bare ?. Abbreviations work: sh run, conf t, int g0/0.)' }); return; }
    const rec = { mode: dev.mode, ctx: dev.ctx, line: s };
    const doCmd = s.startsWith('do ') ? s.slice(3) : null;
    const showish = doCmd || (dev.mode === 'user' || dev.mode === 'priv' ? s : null);

    if (s === 'enable') { if (dev.mode === 'user') { const c = window.NetConfig ? NetConfig.parse(dev) : {}; if ((c.enableSecret || c.enablePassword) && !silent) { dev.pending = 'enable'; dev.authFails = 0; return; } dev.lines.push(rec); dev.mode = 'priv'; } return; }
    if (s === 'disable') { dev.mode = 'user'; dev.stack = []; dev.ctx = ''; return; }
    if (s === 'configure terminal') { if (dev.mode === 'user') { dev.out.push({ t:'err', s:'% Invalid input detected. (You are in user EXEC mode — you need privileged mode first.)' }); return; }
      dev.lines.push(rec); dev.mode = 'config'; dev.ctx = ''; dev.stack = [['priv','']]; dev.out.push({ t:'sys', s:'Enter configuration commands, one per line.  End with CNTL/Z.' }); return; }
    if (s === 'end' || s === 'ctrl-z' || s === '^z') { if (dev.mode !== 'user') { dev.mode = 'priv'; dev.ctx = ''; dev.stack = []; } return; }
    if (s === 'exit' || s === 'quit') { if (dev.mode === 'config') { dev.mode = 'priv'; dev.ctx=''; dev.stack=[]; } else if (dev.mode === 'priv' || dev.mode === 'user') { dev.out.push({ t:'sys', s:'(session stays open in the sim)' }); } else dev.leave(); return; }
    if (showish) {
      const q = showish;
      if (q === 'show startup-config' || q === 'show start') { dev.out.push({ t:'out', s: startupConfig(dev) }); rec.line = doCmd ? 'do show startup-config' : 'show startup-config'; dev.lines.push(rec); return; }
      if (q === 'show running-config' || q === 'show run' || q === 'show configuration') { dev.out.push({ t:'out', s: runningConfig(dev) }); dev.lines.push(rec); return; }
      if (q.startsWith('show ')) { let r = matchShow(dev, q); if (!r && window.Show && S) { const o = Show.render(dev, q, S); if (o != null) r = { key: q, out: o }; } if (r) rec.line = doCmd ? 'do ' + r.key : r.key; dev.out.push({ t: r ? 'out' : 'err', s: r ? r.out : ('% This sim has no output for "' + q + '" on ' + dev.host + '.') }); dev.lines.push(rec); return; }
      if (q === 'write memory' || q === 'copy running-config startup-config') { dev.lines.push(rec); dev.startup = configText(dev); dev.out.push({ t:'out', s:'Building configuration...\n[OK]' }); return; }
      if (q.startsWith('ping ') || q.startsWith('traceroute ')) { const ip = q.split(' ')[1]; dev.lines.push(rec);
        if (S && window.Net) { const r = Net.ping(S, dev.name, ip); dev._lastPing = r; if (r.nat && r.nat.length) { dev._natSeen = dev._natSeen || []; r.nat.forEach(t => { if (!dev._natSeen.some(x => x.inside === t.inside && x.global === t.global && x.port === t.port)) dev._natSeen.push(t); }); (dev._all && Object.values(dev._all) || []).forEach(o => { if (o !== dev && r.path.some(p => p.dev === o.name)) { o._natSeen = o._natSeen || []; r.nat.forEach(t => { if (!o._natSeen.some(x => x.inside === t.inside && x.global === t.global && x.port === t.port)) o._natSeen.push(t); }); } }); }
          if (q.startsWith('ping ')) dev.out.push({ t: r.ok ? 'out' : 'err', s: 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + ip + ', timeout is 2 seconds:\n' + (r.ok ? '!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms' : '.....\nSuccess rate is 0 percent (0/5)\n  [why: ' + r.reason + ']') });
          else dev.out.push({ t:'out', s: 'Type escape sequence to abort.\nTracing the route to ' + ip + '\n' + Net.traceLines(r, 'ios').join('\n') + (r.ok ? '' : '\n  [why: ' + r.reason + ']') }); return; }
        dev.out.push({ t:'out', s:'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos:\n!!!!!\nSuccess rate is 100 percent (5/5)' }); return; }
      if (q.startsWith('reload')) { dev.out.push({ t:'sys', s:'(nice try. no reloads in the sim.)' }); return; }
      if (/^(clock set|calendar set|clock read-calendar|clock update-calendar)/.test(q) && (dev.mode === 'priv' || doCmd)) { dev.lines.push(rec); return; } // exec commands for the clocks: accepted, NTP decides what show clock says
      if (!doCmd && dev.mode !== 'config' && !s.startsWith('show')) { if (dev.mode === 'user' || dev.mode === 'priv') { dev.out.push({ t:'err', s:'% Invalid input detected at \'^\' marker. (Config commands need "configure terminal" first.)' }); return; } }
      if (doCmd) { dev.lines.push(rec); return; }
    }
    // ---- config-mode grammar ----
    if (dev.mode === 'user' || dev.mode === 'priv') { dev.out.push({ t:'err', s:'% Invalid input detected. (That looks like a config command — enter global config mode first.)' }); return; }
    // a global command typed inside a sub-mode: IOS accepts it and drops back to global config
    const GLOBAL_ONLY = /^(no )?(ip route|ipv6 route|ip access-list|access-list|hostname|ip dhcp (pool|excluded-address|snooping vlan|snooping$)|ip nat (inside source|pool|outside source)|router |vlan [\d,\-]+$|spanning-tree (mode|vlan [\d,\-]+ (root|priority)|portfast default|portfast bpduguard default)|ip domain-name|ip domain name|crypto key|username|enable (secret|password)|ipv6 unicast-routing|ntp server|logging (host|\d)|snmp-server|ip arp inspection vlan|service |banner|line |ip default-gateway|cdp run|lldp run|errdisable|ip routing|ip name-server|ip ssh|interface )/;
    if (dev.mode !== 'config' && GLOBAL_ONLY.test(s)) { dev.mode = 'config'; dev.ctx = ''; dev.stack = [['priv', '']]; rec.mode = 'config'; rec.ctx = ''; }
    dev.lines.push(rec);
    let m;
    if ((m = s.match(/^hostname (\S+)$/))) { dev.host = raw.trim().split(/\s+/)[1]; return; }
    if ((m = s.match(/^interface range (.+)$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-if-range', 'interface range ' + m[1]); return; }
    if ((m = s.match(/^interface (\S+)$/))) { const i = canonIf(m[1]) || m[1]; if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter(i.includes('.') ? 'config-subif' : 'config-if', 'interface ' + i); rec.line = 'interface ' + i; return; }
    if ((m = s.match(/^line (vty|console|con|aux) ?(.*)$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-line', s); return; }
    if ((m = s.match(/^router (ospf|eigrp|rip|bgp)\s*(\d+)?$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-router', s); return; }
    if ((m = s.match(/^ip access-list (standard|extended) (\S+)$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter(m[1] === 'standard' ? 'config-std-nacl' : 'config-ext-nacl', s); return; }
    if ((m = s.match(/^vlan ([\d,\-]+)$/)) && dev.mode.startsWith('config')) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-vlan', s); return; }
    if ((m = s.match(/^ip dhcp pool (\S+)$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-dhcp', s); return; }
    if ((m = s.match(/^ip vrf (\S+)$/))) { if (dev.mode !== 'config') { dev.leave(); rec.mode = 'config'; rec.ctx = ''; } dev.enter('config-vrf', s); return; }
    if (s.startsWith('crypto key generate rsa')) { dev.out.push({ t:'out', s:'The name for the keys will be: ' + dev.host + '.' + (dev.domain || 'example.com') + '\n% Generating RSA keys ...[OK]' }); return; }
    if ((m = s.match(/^ip domain-name (\S+)$/))) { dev.domain = m[1]; return; }
    if (s === 'shutdown') { dev.out.push({ t:'sys', s:'%LINK-5-CHANGED: Interface changed state to administratively down' }); return; }
    if (s === 'no shutdown') { dev.out.push({ t:'sys', s:'%LINK-3-UPDOWN: Interface changed state to up' }); return; }
    const IF_LEVEL = /^(ip address|ip access-group|ip helper-address|ip nat (inside|outside)$|ip ospf|ipv6 address|switchport|description|standby|channel-group|encapsulation|spanning-tree (vlan [\d,\-]+ )?(cost|port-priority)|spanning-tree portfast( edge| trunk)?$|spanning-tree bpduguard|spanning-tree guard|duplex|speed)/;
    if (dev.mode === 'config' && IF_LEVEL.test(s)) {
      dev.out.push({ t:'err', s:'% Invalid input detected. (That is an interface-level command — enter "interface <name>" first.)' }); dev.lines.pop(); return; }
    // silently accept everything else — validation happens against dev.lines
  };

  // ---- validation helper -----------------------------------------------------
  // need: {dev, mode?, ctx?(regex|string), line:regex|string} ; all needs must be satisfied by some record
  function satisfied(devices, needs){
    const missing = [];
    for (const n of needs) {
      const d = devices[n.dev]; if (!d) { missing.push(n); continue; }
      const ok = d.lines.some(r => {
        if (n.mode && r.mode !== n.mode) return false;
        if (n.ctx) { if (n.ctx instanceof RegExp ? !n.ctx.test(r.ctx) : r.ctx !== n.ctx) return false; }
        return n.line instanceof RegExp ? n.line.test(r.line) : r.line === n.line;
      });
      if (!ok) missing.push(n);
    }
    return missing;
  }

  // ---- IP helpers (for calc steps) -------------------------------------------
  const ip2n = ip => ip.trim().split('.').reduce((a, o) => (a << 8) + (+o), 0) >>> 0;
  const n2ip = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
  const validIp = ip => /^(\d{1,3}\.){3}\d{1,3}$/.test(ip.trim()) && ip.trim().split('.').every(o => +o <= 255);
  const mask = p => p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  const wildcard = p => (~mask(p)) >>> 0;
  function subnet(ip, p){ const n = ip2n(ip) & mask(p); const b = (n | wildcard(p)) >>> 0; return { network: n2ip(n), broadcast: n2ip(b), first: n2ip(n + 1), last: n2ip(b - 1), mask: n2ip(mask(p)), wildcard: n2ip(wildcard(p)), hosts: p >= 31 ? (p === 31 ? 2 : 1) : Math.pow(2, 32 - p) - 2 }; }
  function ipv6compress(a){ // minimal RFC5952
    let h = a.toLowerCase().split('::'); let parts;
    if (h.length === 2) { const l = h[0] ? h[0].split(':') : [], r = h[1] ? h[1].split(':') : []; parts = l.concat(new Array(8 - l.length - r.length).fill('0'), r); } else parts = h[0].split(':');
    parts = parts.map(x => x.replace(/^0+(?=\w)/, '') || '0');
    let best = -1, bl = 0, cs = -1, cl = 0;
    for (let i = 0; i <= 8; i++) { if (i < 8 && parts[i] === '0') { if (cs < 0) { cs = i; cl = 1; } else cl++; } else { if (cl > bl && cl > 1) { best = cs; bl = cl; } cs = -1; cl = 0; } }
    if (best < 0) return parts.join(':');
    const l = parts.slice(0, best).join(':'), r = parts.slice(best + bl).join(':'); return l + '::' + r;
  }
  const sameIp = (a, b) => validIp(a) && validIp(b) && ip2n(a) === ip2n(b);

  window.Sim = { Device, normalize, satisfied, canonIf, ip: { ip2n, n2ip, validIp, mask, wildcard, subnet, sameIp, ipv6compress } };
})();
