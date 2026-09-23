/* Stage 5 · The Roads — routing. Framework stub: one intro level. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'roads', arc: 'grid', title: 'STAGE 5 · THE ROADS', sub: 'routing: static routes, OSPF, FHRP', npc: 'nexthop', status: 'stub', levels: [
    { id: 'nexthop-intro', title: 'One stop at a time', sub: 'Days 11, 14–15 · routing fundamentals, static routes', npc: 'nexthop', day: [11,14,15], src: [PS('Routing_Fundamentals_Part1.md'), PS('Static_Routing_Part2.md'), PS('Life_of_a_Packet.md')], unlocks: ['static-route'],
      beats: [
        { k: 'SCENE', where: 'A yellow cab · rain · you are the fare',
          lines: [
            { who: 'nexthop', text: 'People think a router knows the way. It does not. It knows the [[next hop]]. You get in, I look at my [[routing table]], I drive you one block to the next cab. Every cab does the same thing and somehow you get home.' },
            { who: 'you', text: 'What is in the table?' },
            { who: 'nexthop', text: 'Streets I have a door on. Those are [[connected route]]s, code C. Streets a human typed in. [[Static route]]s, code S. And whatever Ospef gossips to me from the rest of the district. When more than one entry fits your address, the most specific one wins. [[Longest prefix match]]. Always.' }
          ],
          choice: { opts: [
            { say: 'And if nothing fits?', reply: '"Then the [[default route]] wins, 0.0.0.0/0, usually pointed at the ISP. If there is no default either, you die in my cab. It happens. I feel bad about it for one block."' },
            { say: 'Does the switch not do this?', reply: '"Mac works one floor down. He moves frames inside one street. I move packets between streets. Different job, different table."' }
          ] } },
        { k: 'LORE', text: 'Nexthop, at a red light: "The first router was called an IMP, built by BBN on a Honeywell 516. On 29 October 1969 UCLA tried to send LOGIN through it to Stanford. It crashed after two letters. First message on the internet: LO. First cab crashed on the first fare. We got better."' },
        { k: 'KIT', text: 'He hands you a receipt with writing on the back.', kit: [ { cmd: 'ip route 10.0.2.0 255.255.255.0 10.0.12.2', what: 'static route through a next hop' }, { cmd: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', what: 'default route toward the ISP' }, { cmd: 'show ip route', what: 'read the table: C connected, S static, S* default, O OSPF' } ] },
        { k: 'SYNC', q: { prompt: 'Nexthop, over his shoulder: "Table has 10.0.0.0/8, 10.1.0.0/16 and a default. Fare wants 10.1.2.3. Which entry?"', opts: ['10.0.0.0/8', '10.1.0.0/16', '0.0.0.0/0', 'Whichever was typed first'], a: 1, yes: '"Most specific street. Every time."', no: '"Longest prefix. Slash 16 beats slash 8 beats the default."' } }
      ] }
  ] });
})();
