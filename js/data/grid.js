/* grid.js — LAYER 1 skeleton. Arcs, skills, helpers. Stage content lives in js/data/stages/*.js,
   one file per stage, each pushing onto window.STAGES. See docs/STORY_BIBLE.md for how to write a stage. */
(function(){
  window.ARCS = [
    { n: '00', id: 'wetware', title: 'WETWARE', sub: 'Computers, operating systems, the shell.', status: 'lock' },
    { n: '01', id: 'grid', title: 'THE GRID', sub: 'Networking. The CCNA material. Watson district.', status: 'play' },
    { n: '02', id: 'ice', title: 'ICE', sub: 'Defensive security fundamentals.', status: 'lock' },
    { n: '03', id: 'blackice', title: 'BLACK ICE', sub: 'Offensive security, with authorization.', status: 'lock' },
    { n: '04', id: 'blackwall', title: 'THE BLACKWALL', sub: 'Security operations, incident response, forensics.', status: 'lock' }
  ];

  window.STAGES = [];

  // source-link helpers used by the stage files
  window.SRC = {
    PS: f => ({ label: 'psaumur notes', url: 'https://github.com/psaumur/CCNA_Course_Notes/blob/main/Course_Notes/' + f }),
    SJ: f => ({ label: 'sparrowjumpy notes', url: 'https://github.com/sparrowjumpy/CCNA-Notes/blob/main/' + encodeURIComponent(f) })
  };

  window.SKILLS = {
    'net-devices': 'Network devices',
    'cabling': 'Interfaces and cables',
    'osi-layers': 'OSI / TCP-IP layers',
    'cli-modes': 'IOS CLI modes & saving',
    'mac-table': 'Frames & the MAC table',
    'arp': 'ARP & ping',
    'ipv4-addr': 'IPv4 addresses',
    'ipv4-config': 'Addressing interfaces',
    'switch-ifaces': 'Switch interfaces',
    'ipv4-header': 'The IPv4 header',
    'static-route': 'Static routing',
    'packet-life': 'Life of a packet',
    'subnetting': 'Subnetting',
    'subnet-math': 'Subnet and host counts',
    'vlsm': 'VLSM',
    'vlan-config': 'VLAN config',
    'trunk-config': 'Trunks & router on a stick',
    'l3-switching': 'Multilayer switching',
    'dtp-vtp': 'DTP & VTP',
    'stp-loops': 'Loop awareness',
    'stp-election': 'STP election & cost',
    'stp-states': 'STP states & timers',
    'stp-bpdu': 'BPDU reading',
    'stp-toolkit': 'PortFast / BPDU Guard',
    'stp-config': 'Shaping the tree',
    'rstp': 'Rapid spanning tree',
    'etherchannel': 'EtherChannel',
    'dynamic-routing': 'Dynamic routing & AD',
    'rip-eigrp': 'RIP & EIGRP',
    'ospf-basics': 'OSPF neighbours',
    'ospf-tuning': 'OSPF cost & passive',
    'ospf-areas': 'OSPF areas & defaults',
    'fhrp': 'First hop redundancy',
    'tcp-udp': 'TCP & UDP',
    'ipv6-addr': 'IPv6 addresses',
    'ipv6-eui': 'EUI-64 & link-local',
    'ipv6-routes': 'IPv6 static routes',
    'acl-standard': 'Standard ACLs',
    'acl-extended': 'Extended ACLs',
    'cdp-lldp': 'CDP & LLDP',
    'ntp': 'NTP',
    'dns': 'DNS',
    'dhcp': 'DHCP',
    'snmp': 'SNMP',
    'syslog': 'Syslog',
    'ssh': 'SSH',
    'ftp-tftp': 'FTP & TFTP',
    'nat-static': 'Static NAT',
    'nat-dynamic': 'Dynamic NAT & PAT',
    'voice-vlan': 'Voice VLANs',
    'qos': 'QoS',
    'sec-fundamentals': 'Security fundamentals',
    'port-security': 'Port security',
    'dhcp-snooping': 'DHCP snooping',
    'dai': 'Dynamic ARP inspection',
    'lan-arch': 'LAN architectures',
    'wan-arch': 'WAN & GRE',
    'virtualization': 'Virtualization & cloud',
    'wifi-basics': 'Wireless fundamentals',
    'wifi-arch': 'Wireless architectures',
    'wifi-security': 'Wireless security',
    'wlc-config': 'WLC configuration',
    'automation': 'Network automation',
    'data-formats': 'JSON, XML & YAML',
    'rest-api': 'REST APIs',
    'sdn': 'Software-defined networking',
    'config-mgmt': 'Ansible, Puppet & Chef'
  };
})();
