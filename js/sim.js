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
    'access-lists':'access-lists', 'access-list':'access-lists', tr:'trunk', mo:'mode', mod:'mode', acc:'access', ac:'access', vl:'vlan', po:'port-security', 'port':'port-security', 'port-sec':'port-security',
    add:'address', addr:'address', ro:'route', rou:'route', 'ospf':'ospf', 'ei':'eigrp', 'na':'nat', 'ins':'inside', 'out':'outside', 'so':'source', 'sta':'static', 'gen':'generate', 'ke':'key',
    'sec':'secret', 'secr':'secret', 'in':'input', 'inp':'input', 'vt':'vty', 'con':'console', 'shut':'shutdown', 'ne':'neighbors', 'nei':'neighbors', 'neigh':'neighbors', 'inter':'interfaces', 'int':'interfaces',
    'dh':'dhcp', 'snoop':'snooping', 'snoo':'snooping', 'ins':'inspection', 'pri':'priority', 'prio':'priority', 'roo':'root', 'portf':'portfast', 'bpdu':'bpduguard', 'stat':'statistics', 'nat':'nat', 'trans':'translations',
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
    s = s.replace(/ dot1q$/, ' dot1q');
    return s;
  }

  // ---- device state ---------------------------------------------------------
  function Device(name, opts){
    this.name = name; this.host = name; this.mode = 'user'; this.ctx = ''; this.stack = [];
    this.lines = []; // {mode, ctx, line}
    this.out = [];   // rendered console lines {t:'in'|'out'|'err'|'sys', s}
    this.shows = (opts && opts.shows) || {};
    this.banner = (opts && opts.banner) || null;
    if (this.banner) this.out.push({ t:'sys', s: this.banner });
  }
  Device.prototype.prompt = function(){
    const h = this.host;
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

  function runningConfig(dev){
    const o = ['Building configuration...', '', 'Current configuration:', '!', 'hostname ' + dev.host, '!'];
    let lastCtx = null;
    dev.lines.filter(l => l.mode !== 'user' && l.mode !== 'priv').forEach(l => {
      if (l.ctx !== lastCtx) { if (l.ctx) o.push(l.ctx); lastCtx = l.ctx; }
      if (l.line !== l.ctx) o.push((l.ctx ? ' ' : '') + l.line);
    });
    o.push('!', 'end'); return o.join('\n');
  }

  Device.prototype.exec = function(raw, all){
    const dev = this; if (all) dev._all = all; const s = normalize(raw);
    dev.out.push({ t:'in', s: dev.prompt() + ' ' + raw.trim() });
    if (!s) return;
    if (s === '?' || s.endsWith(' ?')) { dev.out.push({ t:'sys', s: '  (help: this sim knows the commands your NPC taught you. Try the abbreviations too.)' }); return; }
    const rec = { mode: dev.mode, ctx: dev.ctx, line: s };
    const doCmd = s.startsWith('do ') ? s.slice(3) : null;
    const showish = doCmd || (dev.mode === 'user' || dev.mode === 'priv' ? s : null);

    if (s === 'enable') { dev.lines.push(rec); if (dev.mode === 'user') dev.mode = 'priv'; return; }
    if (s === 'disable') { dev.mode = 'user'; dev.stack = []; dev.ctx = ''; return; }
    if (s === 'configure terminal') { if (dev.mode === 'user') { dev.out.push({ t:'err', s:'% Invalid input detected. (You are in user EXEC mode — you need privileged mode first.)' }); return; }
      dev.lines.push(rec); dev.mode = 'config'; dev.ctx = ''; dev.stack = [['priv','']]; dev.out.push({ t:'sys', s:'Enter configuration commands, one per line.  End with CNTL/Z.' }); return; }
    if (s === 'end' || s === 'ctrl-z' || s === '^z') { if (dev.mode !== 'user') { dev.mode = 'priv'; dev.ctx = ''; dev.stack = []; } return; }
    if (s === 'exit' || s === 'quit') { if (dev.mode === 'config') { dev.mode = 'priv'; dev.ctx=''; dev.stack=[]; } else if (dev.mode === 'priv' || dev.mode === 'user') { dev.out.push({ t:'sys', s:'(session stays open in the sim)' }); } else dev.leave(); return; }
    if (showish) {
      const q = showish;
      if (q === 'show running-config' || q === 'show run' || q === 'show configuration') { dev.out.push({ t:'out', s: runningConfig(dev) }); dev.lines.push(rec); return; }
      if (q.startsWith('show ')) { const r = matchShow(dev, q); if (r) rec.line = doCmd ? 'do ' + r.key : r.key; dev.out.push({ t: r ? 'out' : 'err', s: r ? r.out : ('% This sim has no output for "' + q + '" on ' + dev.host + '. (It only fakes what the job needs.)') }); dev.lines.push(rec); return; }
      if (q === 'write memory' || q === 'copy running-config startup-config') { dev.out.push({ t:'out', s:'Building configuration...\n[OK]' }); dev.lines.push(rec); return; }
      if (q.startsWith('ping ')) { dev.out.push({ t:'out', s:'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos:\n!!!!!\nSuccess rate is 100 percent (5/5)' }); dev.lines.push(rec); return; }
      if (q.startsWith('traceroute ')) { dev.out.push({ t:'out', s:'Tracing the route...\n  1 10.0.0.1 1 msec\n  2 203.0.113.1 4 msec' }); dev.lines.push(rec); return; }
      if (q.startsWith('reload')) { dev.out.push({ t:'sys', s:'(nice try. no reloads in the sim.)' }); return; }
      if (!doCmd && dev.mode !== 'config' && !s.startsWith('show')) { if (dev.mode === 'user' || dev.mode === 'priv') { dev.out.push({ t:'err', s:'% Invalid input detected at \'^\' marker. (Config commands need "configure terminal" first.)' }); return; } }
      if (doCmd) { dev.lines.push(rec); return; }
    }
    // ---- config-mode grammar ----
    if (dev.mode === 'user' || dev.mode === 'priv') { dev.out.push({ t:'err', s:'% Invalid input detected. (That looks like a config command — enter global config mode first.)' }); return; }
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
