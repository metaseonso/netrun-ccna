/* syllabus.js — the 63 nights in order: the topic each night teaches, where it happens, which act and class.
   From docs/CAMPAIGN_MAP.md, which follows the course files. The companion checklist, the map's TONIGHT marker and
   coverage checks read it. Rites and the finale are gigs; they live in the gig files, not here. */
(function(){
  const N = (night, topic, stage, act) => ({ night, topic, stage, act });
  window.SYLLABUS = [
    N(1, 'Network devices', 'wires', 1), N(2, 'Interfaces and cables', 'wires', 1), N(3, 'The OSI model and TCP/IP', 'wires', 1),
    N(4, 'The command line and device security', 'wires', 1), N(5, 'Ethernet LAN switching, part 1', 'floor', 1), N(6, 'Ethernet LAN switching, part 2', 'floor', 1),
    N(7, 'IPv4 addresses, part 1', 'block', 1), N(8, 'IPv4 addresses, part 2', 'block', 1), N(9, 'Switch interfaces', 'floor', 1),
    N(10, 'The IPv4 header', 'block', 1), N(11, 'Routing fundamentals and static routes', 'roads', 1), N(12, 'The life of a packet', 'roads', 1),
    N(13, 'Subnetting, part 1', 'block', 1), N(14, 'Subnetting, part 2', 'block', 1), N(15, 'Subnetting, part 3: VLSM', 'block', 1),
    N(16, 'VLANs, part 1', 'floor', 1), N(17, 'VLANs, part 2: trunks and router on a stick', 'floor', 1), N(18, 'VLANs, part 3: multilayer switching', 'floor', 1),
    N(19, 'DTP and VTP', 'floor', 1),
    N(20, 'Spanning tree, part 1', 'bridges', 2), N(21, 'Spanning tree, part 2, and its guards', 'bridges', 2), N(22, 'Rapid spanning tree', 'bridges', 2),
    N(23, 'EtherChannel', 'floor', 2), N(24, 'Dynamic routing', 'roads', 2), N(25, 'RIP and EIGRP', 'roads', 2),
    N(26, 'OSPF, part 1', 'roads', 2), N(27, 'OSPF, part 2', 'roads', 2), N(28, 'OSPF, part 3', 'roads', 2), N(29, 'First hop redundancy', 'roads', 2),
    N(30, 'TCP and UDP', 'services', 2), N(31, 'IPv6, part 1', 'services', 2), N(32, 'IPv6, part 2', 'services', 2), N(33, 'IPv6, part 3', 'services', 2),
    N(34, 'Standard ACLs', 'ice', 3), N(35, 'Extended ACLs', 'ice', 3), N(36, 'CDP and LLDP', 'floor', 3), N(37, 'NTP', 'services', 3),
    N(38, 'DNS', 'services', 3), N(39, 'DHCP', 'services', 3), N(40, 'SNMP', 'services', 3), N(41, 'Syslog', 'services', 3),
    N(42, 'SSH', 'services', 3), N(43, 'FTP and TFTP', 'services', 3), N(44, 'NAT, part 1', 'services', 3), N(45, 'NAT, part 2', 'services', 3),
    N(46, 'QoS, part 1', 'services', 3), N(47, 'QoS, part 2', 'services', 3), N(48, 'Security fundamentals', 'ice', 3), N(49, 'Port security', 'ice', 3),
    N(50, 'DHCP snooping', 'ice', 3), N(51, 'Dynamic ARP inspection', 'ice', 3),
    N(52, 'LAN architectures', 'lab', 4), N(53, 'WAN architectures', 'lab', 4), N(54, 'Virtualisation, cloud, containers and VRF', 'lab', 4),
    N(55, 'Wireless fundamentals', 'lab', 4), N(56, 'Wireless architectures', 'lab', 4), N(57, 'Wireless security', 'lab', 4), N(58, 'Wireless configuration', 'lab', 4),
    N(59, 'Network automation and AI', 'lab', 4), N(60, 'JSON, XML and YAML', 'lab', 4), N(61, 'REST APIs and authentication', 'lab', 4),
    N(62, 'Software-defined networking', 'lab', 4), N(63, 'Ansible, Puppet, Chef and Terraform', 'lab', 4)
  ];
  window.ACTS = [ { n: 1, title: 'NEW IN WATSON', cls: 'D' }, { n: 2, title: 'THE LONG WAY ROUND', cls: 'C' }, { n: 3, title: 'WHO IS ASKING', cls: 'B' }, { n: 4, title: 'OPENING NIGHT', cls: 'A' } ];
  window.FINALE = 'z-watson-exchange'; // the gig id of the Mega Lab finale; clearing it completes the game
})();
