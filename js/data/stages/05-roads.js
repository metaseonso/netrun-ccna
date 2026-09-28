/* District 05 · The Roads — the cab rank and the map room. Nexthop drives; Ospef maps.
   Nights 11 and 12 (static routes, the life of a packet), then 24–29 (dynamic routing, RIP, EIGRP, OSPF, HSRP).
   Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'roads', arc: 'grid', title: 'STAGE 5 · THE ROADS', sub: 'routing: static routes, OSPF, FHRP', npc: 'nexthop', status: 'live', levels: [
    // ------------------------------------------------------------ night 11 · routing fundamentals and static routes
    { id: 'n11-the-fare', title: 'One stop at a time', sub: 'the routing table and static routes', npc: 'nexthop', day: [11], src: [PS('Routing_Fundamentals_Part1.md'), PS('Static_Routing_Part2.md')], unlocks: ['static-route'],
      beats: [
        { k: 'SCENE', where: 'A yellow cab · Kabuki to the Block · rain',
          lines: [
            { who: 'narr', text: 'Rain drums on the roof of the cab and the wipers squeal on every second pass. The seat smells of pine air freshener and old coffee. The driver, a broad man in a yellow cap, has the meter running and a handwritten note from Cider stuck to the dashboard with chewing gum.' },
            { who: 'nexthop', text: 'Nexthop. Everybody calls me that because it\'s all I ever know. You tell me where you\'re going, I look at my book, and I drive you to the next stop on the way, never further. Then the next driver does the same, and somehow you get home.' },
            { who: 'nexthop', text: 'A router works like my book. It\'s the [[routing table]], and every packet that comes in, the router looks up the destination in it and sends it on to the [[next hop]]. The book fills up three ways. A [[connected route]] goes in the moment you put an address on an interface, code C, for the whole network on that port. A [[local route]] goes in with it, code L, a /32 for the interface\'s own address.' },
            { who: 'nexthop', text: 'A [[static route]] is one a person typed in, code S. A dynamic route is one the routers told each other about with a protocol like OSPF. Ospef runs that side of things from the map room, and will bore you about it another night.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What if more than one route in the book fits?', reply: 'Nexthop: "Then the most specific one wins, the one with the longest prefix. If I\'ve got 10.0.0.0/8 and 10.1.0.0/16 and the fare wants 10.1.2.3, I take the /16, because it matches more of the address. That\'s the [[longest prefix match]], and it wins every time, whichever route was typed first."' },
            { tone: 'press', say: 'And if nothing in the book fits at all?', reply: 'Nexthop: "The router drops the packet. Unless there\'s a [[default route]], 0.0.0.0/0, the least specific route there is, which matches anything. It shows up as S* when it\'s static, and the router calls it the gateway of last resort. Most shops point theirs at the internet."' },
            { tone: 'joke', say: 'Do you ever just take the scenic route?', reply: 'Nexthop laughs. "Every fare thinks so. I only ever know one stop ahead, choom, so I couldn\'t take the scenic route if I tried."' }
          ] } },
        { k: 'SCENE', where: 'The cab · parked outside the Two Loaves',
          lines: [
            { who: 'nexthop', text: 'Ma Tsai at the Seven Bowls wants to order bread from Tomas, and the two shops can\'t see each other. Each router only knows its own networks. You have to tell each one about the far network, and the routers in the middle too.' },
            { who: 'nexthop', text: 'In global configuration it\'s ip route, then the destination network, the mask, and where to send it. That last part can be the next hop\'s address, or the exit interface, or both. With only an exit interface the route shows as directly connected, and the router asks the far side to answer for the destination. The next hop is the one I\'d type.' },
            { who: 'nexthop', text: 'Routes have to go both ways. If Tomas\'s router doesn\'t know the way back to the noodle bar, the order gets there and the reply dies on the doorstep. A router doesn\'t need a route to every network in between, only to the destination network.' },
            { who: 'narr', text: 'He peels Cider\'s note off the dashboard and reads it again, the wipers still going.' },
            { who: 'nexthop', text: 'The loop at Cider\'s last week was a route typed on exactly the right router to send Tomas\'s packets round in a circle. Whoever did it knew which router to pick.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does a PC know where to send things?', reply: 'Nexthop: "A PC only has one route worth talking about: anything not on its own network goes to its [[default gateway]], the router\'s address on its network. It\'s the same idea as a default route, set on the PC."' },
            { tone: 'press', say: 'You think somebody broke Cider\'s router on purpose?', reply: 'He shrugs and puts the cab in gear. "The route was tidy, and mistakes usually aren\'t. I\'ll keep an eye on the roads, and you keep an eye on whoever keeps asking about them."' },
            { tone: 'care', say: 'How long have you been driving?', reply: 'Nexthop: "Twenty-two years. My cousin drives the same fare when I\'m off, so the fares never notice who\'s behind the wheel. You\'ll meet him."' }
          ] } },
        { k: 'LORE', title: 'THE BEST ROUTE TO EVERYWHERE', year: 1997, vibe: 'Booyah. One tiny router told the whole internet it knew the way everywhere, and everybody believed it.',
          text: 'Nexthop, at a red light: "On the twenty-fifth of April 1997 a router belonging to a small provider, AS 7007, told the rest of the internet that it was the best route to nearly everywhere, and the most specific one too. Routers all over the world believed it, because the longest prefix wins. For hours a big piece of the internet sent its traffic into one small office and it went nowhere. I tell every new fare that story."' },
        { k: 'KIT', text: 'Nexthop writes on the back of a taxi receipt.', kit: [
          { cmd: 'show ip route', what: 'C connected · L local /32 · S static · S* candidate default · O OSPF' },
          { cmd: 'ip route 192.168.8.0 255.255.255.0 10.0.12.2', what: 'static route by next hop' },
          { cmd: 'ip route 192.168.8.0 255.255.255.0 g0/1  ·  ... g0/1 10.0.12.2', what: 'by exit interface (shows as directly connected), or both' },
          { cmd: 'ip route 0.0.0.0 0.0.0.0 10.0.23.1', what: 'default route, the gateway of last resort' },
          { cmd: 'longest prefix wins · no match and no default = dropped · routes both ways', what: 'the three rules of the road' } ] },
        { k: 'SYNC', q: { prompt: 'Nexthop, over his shoulder: "My book has 10.0.0.0/8, 10.1.0.0/16 and a default. The fare wants 10.1.2.3. Which one do I use?"', opts: ['10.1.0.0/16', '10.0.0.0/8', '0.0.0.0/0', 'Whichever was typed first'], a: 0,
          yes: 'Nexthop: "The /16, the most specific street."', no: 'Nexthop: "The /16. Longest prefix wins, and the default only gets the fares nothing else matches."',
          why: 'Nexthop: All three routes match 10.1.2.3, so the router picks the most specific, the one with the longest prefix length: /16 beats /8, and /8 beats the default /0. The order the routes were configured in does not matter.' } }
      ] }
  ] });
})();
