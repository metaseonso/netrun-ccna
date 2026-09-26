/* cards.js — flash cards. Imported decks land in js/data/cards/dayNN.js (tools/import_apkg.py) and push onto CARDS.
   Hand-written cards go here or inside a level as `cards: [...]`. A card is unlocked once its skill has been slotted
   (a level that unlocks that skill was read) or its `level` was read. Protégés DM these to the player.
   Shape: { id, day, skill|level, q, a, type:'choice'|'text', opts?, why? }  — for text cards, `a` is the answer text and
   the game builds multiple choice from other cards' answers in the same skill at DM time. */
(function(){
  window.CARDS = window.CARDS || [];
  const K = 'stp';
  const add = (id, skill, day, q, opts, a, why) => CARDS.push({ id: 'stp-' + id, day, skill, type: 'choice', q, opts, a, why });
  // Day 20
  add('01', 'stp-loops', 20, 'Why can a Layer 2 loop run forever when a Layer 3 loop cannot?', ['Switches are faster', 'Frames have no TTL; packets do', 'Broadcasts are Layer 3 only', 'Routers block loops with ACLs'], 1, 'A packet carries a TTL that counts down to zero. A frame has nothing like it.');
  add('02', 'stp-loops', 20, 'What is the name for broadcasts multiplying endlessly around a switched loop?', ['ARP storm', 'Broadcast storm', 'Flood fill', 'MAC flap'], 1, 'A broadcast storm. It saturates links and CPUs and makes MAC tables unstable.');
  add('03', 'stp-election', 20, 'Which switch becomes the root bridge?', ['Highest priority, then highest MAC', 'Lowest priority, then lowest MAC', 'The one with the most ports', 'The first one powered on'], 1, 'Lowest Bridge ID wins. Bridge ID is priority first, then MAC address.');
  add('04', 'stp-election', 20, 'Default STP bridge priority is…', ['4096', '24576', '28672', '32768'], 3, '32768. The VLAN number is added to it in the display, so VLAN 1 shows 32769.');
  add('05', 'stp-election', 20, 'STP port cost of a GigabitEthernet link?', ['2', '4', '19', '100'], 1, 'Gigabit is 4. FastEthernet is 19. 10 Gigabit is 2. 10 Megabit is 100.');
  add('06', 'stp-election', 20, 'STP port cost of a FastEthernet link?', ['2', '4', '19', '100'], 2, 'FastEthernet is 19.');
  add('07', 'stp-election', 20, 'A switch chooses its root port by…', ['Highest port number', 'Lowest root cost, then lowest neighbour Bridge ID, then lowest neighbour port ID', 'Lowest MAC on the port', 'Whichever port came up first'], 1, 'Root cost first. Ties go to the neighbour with the lower Bridge ID, then the neighbour port ID.');
  add('08', 'stp-election', 20, 'How many designated ports does each network segment have?', ['0', '1', '2', 'One per switch'], 1, 'Exactly one per segment: the end with the lower root cost, tie to lower Bridge ID.');
  add('09', 'stp-election', 20, 'What state is a non-designated port in?', ['Forwarding', 'Learning', 'Blocking', 'Disabled'], 2, 'Non-designated ports block. That is the sleeping backup cable.');
  // Day 21
  add('10', 'stp-states', 21, 'How long does the Listening state last by default?', ['2 seconds', '15 seconds', '20 seconds', '30 seconds'], 1, '15 seconds, set by the Forward Delay timer. Learning is another 15.');
  add('11', 'stp-states', 21, 'In which state does a port learn MAC addresses but not forward traffic?', ['Blocking', 'Listening', 'Learning', 'Forwarding'], 2, 'Learning writes MACs into the table but still sends no user traffic.');
  add('12', 'stp-states', 21, 'Default Hello timer?', ['1 second', '2 seconds', '15 seconds', '20 seconds'], 1, 'The root sends a BPDU every 2 seconds.');
  add('13', 'stp-states', 21, 'Default Max Age timer?', ['2 seconds', '10 seconds', '15 seconds', '20 seconds'], 3, '20 seconds without a BPDU before a switch re-evaluates the topology.');
  add('14', 'stp-states', 21, 'Worst case for a blocking port to reach forwarding under classic STP?', ['15 seconds', '30 seconds', '35 seconds', '50 seconds'], 3, 'Max Age 20 + Listening 15 + Learning 15 = 50 seconds.');
  add('15', 'stp-states', 21, 'Which ports send BPDUs?', ['Root ports only', 'Designated ports only', 'Blocking ports only', 'All ports'], 1, 'Only designated ports send BPDUs. Root and blocked ports receive them.');
  add('16', 'stp-bpdu', 21, 'Destination MAC of a Cisco PVST+ BPDU?', ['01:80:C2:00:00:00', '01:00:0C:CC:CC:CD', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:01'], 1, '01:00:0C:CC:CC:CD is Cisco PVST+. 01:80:C2:00:00:00 is standard IEEE.');
  add('17', 'stp-bpdu', 21, 'Destination MAC of a standard IEEE 802.1D BPDU?', ['01:80:C2:00:00:00', '01:00:0C:CC:CC:CD', 'FF:FF:FF:FF:FF:FF', '01:00:5E:00:00:01'], 0, '01:80:C2:00:00:00.');
  add('18', 'stp-bpdu', 21, 'PVST+ works over which trunk encapsulation?', ['ISL only', '802.1Q', 'Neither', 'Only on access ports'], 1, 'PVST (no plus) was ISL only. PVST+ supports 802.1Q.');
  add('19', 'stp-toolkit', 21, 'PortFast should be enabled on…', ['Ports to other switches', 'Ports to end hosts', 'All trunk ports', 'The root bridge only'], 1, 'Only host ports. On a switch-facing port it can create a loop.');
  add('20', 'stp-toolkit', 21, 'What does BPDU Guard do when a BPDU arrives on the port?', ['Ignores it', 'Forwards it', 'Puts the port in err-disabled', 'Becomes root'], 2, 'The port shuts itself. The state is err-disabled.');
  add('21', 'stp-toolkit', 21, 'Global command to enable PortFast on all access ports?', ['spanning-tree portfast', 'spanning-tree portfast default', 'spanning-tree portfast all', 'spanning-tree mode portfast'], 1, 'spanning-tree portfast default, in global config. It skips trunk ports.');
  add('22', 'stp-toolkit', 21, 'Global command to enable BPDU Guard on all PortFast ports?', ['spanning-tree bpduguard enable', 'spanning-tree bpduguard default', 'spanning-tree portfast bpduguard default', 'spanning-tree guard bpdu'], 2, 'spanning-tree portfast bpduguard default.');
  add('23', 'stp-toolkit', 21, 'Which feature prevents a port from accepting a superior BPDU and taking the root away?', ['Loop Guard', 'Root Guard', 'BPDU Filter', 'UplinkFast'], 1, 'Root Guard.');
  add('24', 'stp-config', 21, '"spanning-tree vlan 1 root primary" sets the priority to…', ['0', '4096', '24576, or 4096 below the current lowest', '28672'], 2, '24576 when nobody is lower, otherwise 4096 below the lowest switch.');
  add('25', 'stp-config', 21, '"spanning-tree vlan 1 root secondary" sets the priority to…', ['4096', '24576', '28672', '32768'], 2, '28672.');
  add('26', 'stp-config', 21, 'Valid values for a manually set STP priority are…', ['Any number', 'Multiples of 4096', 'Multiples of 1024', 'Only 0 and 32768'], 1, 'Multiples of 4096 from 0 to 61440.');
  add('27', 'stp-config', 21, 'Default spanning tree mode on modern Cisco switches?', ['pvst', 'rapid-pvst', 'mst', '802.1D'], 1, 'rapid-pvst: one rapid tree per VLAN.');
  add('28', 'stp-config', 21, 'Command to verify the root bridge and port roles?', ['show vlan brief', 'show spanning-tree', 'show interfaces trunk', 'show mac address-table'], 1, 'show spanning-tree.');
  add('29', 'stp-config', 21, 'Interface command that changes how much a port adds to the root cost?', ['spanning-tree port-priority', 'spanning-tree vlan 1 cost', 'spanning-tree priority', 'spanning-tree weight'], 1, 'spanning-tree [vlan N] cost <value>.');
  add('30', 'stp-config', 21, 'You set root primary for VLAN 10 only. What happens to VLAN 20\'s tree?', ['It follows VLAN 10', 'Nothing; each VLAN has its own tree', 'It is disabled', 'It merges'], 1, 'PVST+ runs one tree per VLAN. Commands are per VLAN.');
})();
