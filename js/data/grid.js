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
    'osi-layers': 'OSI / TCP-IP layers', 'cli-modes': 'IOS CLI modes & saving', 'subnetting': 'Subnetting', 'mac-table': 'MAC table & ARP', 'vlan-config': 'VLAN config', 'trunk-config': 'Trunk config',
    'stp-loops': 'Loop awareness', 'stp-election': 'STP election & cost', 'stp-states': 'STP states & timers', 'stp-bpdu': 'BPDU reading', 'stp-toolkit': 'PortFast / BPDU Guard', 'stp-config': 'Shaping the tree',
    'static-route': 'Static routing', 'dhcp': 'DHCP', 'acl-standard': 'Standard ACLs', 'port-security': 'Port security', 'virtualization': 'Virtualization vocabulary'
  };
})();
