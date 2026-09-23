/* Stage 2 · The Block — IPv4 addressing and subnetting. Framework stub: one intro level. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'block', arc: 'grid', title: 'STAGE 2 · THE BLOCK', sub: 'IPv4 addressing and subnetting', npc: 'cider', status: 'stub', levels: [
    { id: 'cider-intro', title: 'Cutting the block', sub: 'Days 7–13 · IPv4, subnetting, VLSM', npc: 'cider', day: [7,11,12,13], src: [PS('IPv4_Addressing_Part1.md'), PS('Subnetting_Part1.md'), PS('Subnetting_VLSM_Part3.md'), SJ('01 - Day 8 - IPv4 Addressing (Part 2).md')], unlocks: ['subnetting'],
      beats: [
        { k: 'SCENE', where: 'The Block · a bar with a long steel counter · late',
          lines: [
            { who: 'narr', text: 'The counter is marked in 256 lines. A woman with a red bun is cutting a sheet of something along one of them with a straight edge.' },
            { who: 'cider', text: 'Sit. You need an address, or you need to divide some. Either way you need to know what one is. An [[IPv4 address]] is 32 bits. The [[subnet mask]] says which of those bits name the street and which name the house.' },
            { who: 'you', text: 'So a slash 24 is...' },
            { who: 'cider', text: 'Twenty-four street bits, eight house bits. Two to the eighth is 256 doors. The first door is the [[network address]] and the last is the [[broadcast address]]. Neither one can be a house. So 254 houses. That is the [[usable range]].' }
          ],
          choice: { opts: [
            { say: 'What if I need streets of different sizes?', reply: '"[[VLSM]]. Cut the biggest street first, then the next, then the small ones from what is left. Cut small first and you fragment the block, and then you come back here and I have to hear about it."' },
            { say: 'Why does anyone get this wrong?', reply: '"Because they hand a workstation the network address or the broadcast address, and it does not work, and they spend an hour blaming the switch. Count the doors. Skip the two ends."' }
          ] } },
        { k: 'LORE', text: 'Cider, cutting: "We used to hand out addresses in three fixed sizes, A, B and C, like lots. It wasted most of the block. [[CIDR]] replaced that in 1993, RFC 1519, and let us cut anywhere. It bought about eighteen years. On 3 February 2011 the central registry handed out its last five big blocks. IPv4 is gone at the top. Nat down the road and Sixx across the street are how the district keeps growing."' },
        { k: 'KIT', text: 'She slides a coaster across. Numbers on the back.', kit: [ { cmd: '/24 = 255.255.255.0 · /25 = .128 · /26 = .192 · /27 = .224 · /28 = .240 · /29 = .248 · /30 = .252', what: 'the mask ladder' }, { cmd: 'usable hosts = 2^(32 − prefix) − 2', what: 'doors minus the two ends' }, { cmd: 'block size = 256 − last mask octet', what: 'the jump from one street to the next' }, { cmd: 'interface g0/0 → ip address A.B.C.D MASK → no shutdown', what: 'give a router interface a door' } ] },
        { k: 'SYNC', q: { prompt: 'A regular at the bar leans over: "192.168.10.0 slash 26. How many houses?"', opts: ['64', '62', '30', '126'], a: 1, yes: 'Cider does not look up. "Sixty-four doors, two ends. Sixty-two."', no: 'Cider: "Slash 26 leaves six house bits. Sixty-four doors. Skip the two ends. Sixty-two."' } }
      ] }
  ] });
})();
