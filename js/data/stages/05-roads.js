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
      ] },
    // ------------------------------------------------------------ night 12 · the life of a packet
    { id: 'n12-one-parcel', title: 'The whole trip', sub: 'the life of a packet, hop by hop', npc: 'nexthop', day: [12], src: [PS('Life_of_a_Packet.md')], unlocks: ['packet-life'],
      beats: [
        { k: 'SCENE', where: 'Nexthop\'s cab · the courier guild to the depot · after midnight',
          lines: [
            { who: 'narr', text: 'The cab smells of the pine air freshener and, tonight, of Osi\'s coffee. She sits in the back beside you with a small parcel on her knees and her clipboard on top of it. Nexthop pulls away from the guild\'s loading dock with the meter off.' },
            { who: 'osi', text: 'I\'ve spent eleven years wrapping parcels and I\'ve never watched one make the whole trip. Tonight we follow one ping from the dispatch laptop to the depot\'s tracker, every hop of it.' },
            { who: 'nexthop', text: 'First thing, before anything moves: the laptop looks at the tracker\'s address and its own mask, and sees the tracker is on another network. So the packet has to go to the default gateway, the guild router. The laptop knows the gateway\'s IP address and doesn\'t know its MAC.' },
            { who: 'osi', text: 'So it asks. An ARP request, broadcast, for the gateway\'s address. The router answers with its MAC, unicast. The laptop wraps the packet in a frame with the router\'s MAC as the destination, and the packet inside still says the tracker\'s IP address.' },
            { who: 'nexthop', text: 'The switch in between reads that frame, learns the laptop\'s MAC on its port, and sends the frame out the port it knows for the router. It doesn\'t change a single bit of it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why doesn\'t the laptop ARP for the tracker itself?', reply: 'Nexthop: "Because the tracker isn\'t on its network. ARP is a broadcast, and broadcasts stop at the router. The laptop only ever needs the MAC of the next stop, which is the gateway."' },
            { tone: 'press', say: 'Couldn\'t the laptop just put the tracker\'s MAC on the frame?', reply: 'Osi: "It doesn\'t know it, and it couldn\'t use it anyway. A frame only travels one hop. The address on the frame is the next stop, and the address on the packet is the end of the trip."' },
            { tone: 'quiet', say: '(Watch the guild shrink in the rear window.)', reply: 'The guild\'s loading bay lights fall away behind the rain. Osi keeps one hand flat on the parcel the whole time, as if it might try to leave on its own.' }
          ] } },
        { k: 'SCENE', where: 'The cab · crossing the river',
          lines: [
            { who: 'nexthop', text: 'At the guild router the frame comes off. The router reads the packet\'s destination, finds the longest match in its table, and sees the next hop is the depot router across the river. It takes one off the TTL.' },
            { who: 'osi', text: 'Then it needs the next hop\'s MAC, so it runs ARP again on the link across the river, and wraps the same packet in a new frame: source MAC its own port on that link, destination MAC the depot router. The IP addresses inside haven\'t changed since the laptop.' },
            { who: 'nexthop', text: 'At the depot router it happens a third time. Frame off, TTL down one, look up the tracker\'s network, and this time it\'s directly connected, so the router ARPs for the tracker itself and sends the last frame straight to it.' },
            { who: 'osi', text: 'And the reply comes back the same way, hop by hop, except every router already has the MAC it needs written down, so nobody has to ask twice.' },
            { who: 'nexthop', text: 'That\'s why the first ping over a new path loses one and the second doesn\'t: on the first one, every hop is asking for the first time.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What changes at each hop and what stays the same?', reply: 'Nexthop: "The frame changes at every router: new source MAC, new destination MAC, new FCS. The packet keeps its source and destination IP the whole way, and loses one off the TTL at each router, so its header checksum gets redone too."' },
            { tone: 'press', say: 'Where would you look if the parcel went missing?', reply: 'Osi: "Hop by hop, the way we just rode it. Does the laptop have the gateway in arp -a? Does each router have a route? Does each router have the next hop in show arp? The first place the answer is no is where it stopped."' },
            { tone: 'care', say: 'Osi, why did you want to ride along tonight?', reply: 'Osi looks down at the parcel. "Because for eleven years I\'ve handed things to people at the door and trusted the rest. I wanted to see the rest once." Nexthop turns the meter off for the whole ride and says nothing about it.' }
          ] } },
        { k: 'LORE', title: 'THE SOUND OF SONAR', year: 1983, vibe: 'Rad. A program named after the sound a submarine makes when it listens for an echo.',
          text: 'Nexthop, pulling up at the depot: "Mike Muuss wrote ping one night in December 1983, at an Army research lab in Maryland, to find out why a network was misbehaving. He named it after sonar, the ping a submarine sends out and listens for. A thousand lines of code, and it\'s the first thing every runner in Watson types when something breaks."' },
        { k: 'KIT', text: 'Osi draws the trip on the back of the parcel\'s label.', kit: [
          { cmd: 'destination on another network → send to the default gateway', what: 'the host decides with its own address and mask' },
          { cmd: 'ARP for the next hop only · broadcast request · unicast reply', what: 'never for a host beyond a router' },
          { cmd: 'at each router: frame off, TTL −1, route lookup, ARP next hop, new frame', what: 'new MACs every hop' },
          { cmd: 'IP source and destination unchanged end to end', what: 'switches change nothing in the frame' },
          { cmd: 'arp -a · show arp · show ip route · tracert', what: 'follow a parcel hop by hop' } ] },
        { k: 'SYNC', q: { prompt: 'Osi, as the depot\'s door opens: "On the link across the river, whose MAC address is the destination on the frame?"', opts: ['The depot router\'s interface on that link', 'The depot tracker\'s', 'The dispatch laptop\'s', 'The broadcast address'], a: 0,
          yes: 'Nexthop: "The depot router\'s, because a frame only ever goes as far as the next stop."', no: 'Nexthop: "The depot router\'s. A frame is only ever addressed to the next hop."',
          why: 'Nexthop: Each frame carries the packet one hop, so its destination MAC is the next device on that link: across the river, the depot router\'s interface. Only on the last hop, from the depot router to the tracker, is the tracker\'s MAC the destination.' } }
      ] },
    // ------------------------------------------------------------ night 24 · dynamic routing
    { id: 'n24-night-routes', title: 'The roads change at night', sub: 'dynamic routing, administrative distance, metrics, floating static routes', npc: 'nexthop', day: [24], src: [PS('Dynamic_Routing.md')], unlocks: ['dynamic-routing'],
      beats: [
        { k: 'SCENE', where: 'Nexthop\'s cab · the Watson ring road · Sunday, 01:10',
          lines: [
            { who: 'narr', text: 'The cab smells of pine air freshener losing a long fight with old coffee. The wipers thump, neon smears across the windscreen, and the radio mutters traffic reports in three languages. Nexthop drives with one wrist on the wheel and the other hand drumming the dash.' },
            { who: 'nexthop', text: 'Every night at one they close the bridge for repairs, and every night at one my radio fills up with drivers asking which way now. Cabs figure it out between them. Routers do the same thing, if you let them.' },
            { who: 'nexthop', text: 'A static route is a road somebody wrote on a card. It\'s still on the card when the bridge is shut. A [[dynamic routing]] protocol is the radio: routers tell each other which networks they can reach and how far, and when a road closes, the news goes round and they pick another one.' },
            { who: 'you', text: 'And if two routes lead to the same place?' },
            { who: 'nexthop', text: 'Same protocol, the lower [[metric]] wins. Two different protocols, the lower [[administrative distance]] wins, because their metrics don\'t mean the same thing. Lower is better both times. And if one protocol hands me two roads with the same metric, I use both and split the fares. That\'s ECMP, equal cost multi-path.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does each protocol measure?', reply: 'Nexthop: "RIP counts hops, like my dad counting stops. EIGRP looks at bandwidth and delay. OSPF works out a cost from the bandwidth of every link on the way. IS-IS gives every link a cost of 10 unless you tell it otherwise."' },
            { tone: 'press', say: 'Why not just write every road on a card?', reply: 'Nexthop: "Because cards don\'t hear the radio. Forty routers, a hundred networks, and one bridge closes at one in the morning: somebody has to rewrite every card by hand, and that somebody is asleep. The protocol does it in seconds."' },
            { tone: 'joke', say: 'Do you ever just get lost?', reply: 'He grins at you in the mirror. "Never lost. Sometimes I\'m just further from the destination than the fare expected. A router with no route to your address drops the packet. I at least let you out at a corner."' }
          ] } },
        { k: 'SCENE', where: 'The cab rank by the bridge · 01:40',
          lines: [
            { who: 'narr', text: 'The rank is a strip of wet tarmac under one flickering lamp, with a coffee van and a dozen cabs idling nose to tail. Across the water, the bridge lights are going out one section at a time. Nexthop pulls in, leaves the engine running and turns round in his seat.' },
            { who: 'nexthop', text: 'The rank\'s router lives in that grey cabinet behind the coffee van, and it learns the bridge road from the depot\'s routers the way I learn it from the radio. The corp towers downtown run the same protocols between their floors, on a thousand routers instead of four.' },
            { who: 'nexthop', text: 'Two kinds of protocol. Interior gateway protocols, IGPs, share routes inside one organisation\'s network, one [[autonomous system]]. Exterior gateway protocols share routes between different ones, and there\'s only one of those left, BGP, the one the internet runs on.' },
            { who: 'nexthop', text: 'The IGPs come in two families. [[Distance vector]] protocols, RIP and EIGRP, only know what the neighbours tell them, that network, this far, which is why people call it routing by rumour. [[Link state]] protocols, OSPF and IS-IS, hand every router the whole map, so each one works out the roads for itself. They cost more brain and react faster. BGP is its own thing, path vector.' },
            { who: 'nexthop', text: 'Now the bit I want. The depot\'s routers learn the bridge road from OSPF. I want the canal road written on a card as well, but only for when the bridge is gone. Give that static route an AD higher than OSPF\'s 110, say 111, and it floats: it sits out of the table until the OSPF route disappears, then it drops in. A [[floating static route]].' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I read a route in the table?', reply: 'Nexthop: "O 10.24.4.0/24 [110/3] via 10.24.12.2. O is OSPF, then the network, then the brackets: 110 is the AD and 3 is the metric. A route to one exact address, a /32, is a host route. Anything wider is a network route."' },
            { tone: 'press', say: 'Why 111? Why not 200?', reply: 'Nexthop: "Anything from 111 up works against OSPF, as long as it stays under 255. At 255 the router won\'t use the route at all. I like 111 because the next driver can see straight away what it\'s floating over."' },
            { tone: 'care', say: 'Do you mind driving the back roads?', reply: 'Nexthop: "The canal road has potholes and no lights, and it has never once been closed. I like a road I can count on more than a fast one."' }
          ] } },
        { k: 'LORE', title: 'ROUTING BY RUMOUR', year: 1988, real: ['ietf'], vibe: 'Bogus, dude: the whole net steered by gossip from the next router over.',
          text: 'Nexthop, watching the bridge go dark: "In June 1988 Charles Hedrick at Rutgers wrote RIP down as RFC 1058. It had already been running for years in a program called routed that came with Berkeley Unix. Every router told its neighbours how many hops it was from everything it knew, and fifteen hops was as far as it would go. My dad drove his first cab the same year, and he used to say he steered by rumours too."' },
        { k: 'KIT', text: 'He writes on the back of a fare receipt, pressing hard because the pen is dying.', kit: [
          { cmd: 'AD: connected 0 · static 1 · eBGP 20 · EIGRP 90 · IGRP 100 · OSPF 110 · IS-IS 115 · RIP 120 · EIGRP external 170 · iBGP 200 · unusable 255', what: 'lower wins between protocols' },
          { cmd: 'metric: lower wins inside one protocol. Equal metrics: both routes go in (ECMP)', what: 'RIP hop count · EIGRP bandwidth and delay · OSPF cost from bandwidth · IS-IS 10 per link' },
          { cmd: 'IGP, inside one AS: distance vector (RIP, EIGRP) · link state (OSPF, IS-IS)', what: 'EGP, between ASes: path vector (BGP)' },
          { cmd: 'ip route 10.24.4.0 255.255.255.0 10.24.13.2 111', what: 'floating static route: an AD above the protocol\'s, used only when the dynamic route is gone' },
          { cmd: 'O 10.24.4.0/24 [110/3] via 10.24.12.2', what: '[AD/metric]. /32 = host route, anything wider = network route' } ] },
        { k: 'SYNC', q: { prompt: 'A night driver at the coffee van, reading your receipt over your shoulder: "Say a router hears about the depot from OSPF and from RIP at the same time. Which one goes in the table?"', opts: ['The OSPF route, because 110 is lower than RIP\'s 120', 'The RIP route, because it counts hops', 'Whichever has the lower metric', 'Both, split evenly'], a: 0,
          yes: 'Nexthop: "OSPF. Lower AD, every time."', no: 'Nexthop: "OSPF. Different protocols get compared by AD, and 110 beats 120."',
          why: 'Nexthop: When two different protocols offer a route to the same network, the router cannot compare their metrics, so it compares administrative distance and keeps the lower one. OSPF is 110 and RIP is 120, so the OSPF route goes in the table. Metrics only decide between routes from the same protocol.' } }
      ] },
    // ------------------------------------------------------------ night 25 · RIP and EIGRP
    { id: 'n25-old-cabbies', title: 'The old cabbies\' routes', sub: 'RIP and EIGRP', npc: 'nexthop', day: [25], src: [PS('RIP_and_EIGRP.md')], unlocks: ['rip-eigrp'],
      beats: [
        { k: 'SCENE', where: 'The cab co-op garage · Monday, 23:30',
          lines: [
            { who: 'narr', text: 'The garage smells of engine oil and the cigarettes nobody is supposed to smoke in here. A radio on the workbench plays songs older than you, and four drivers in their sixties play cards on an upturned crate under a strip light. Along the back wall, above a rack of three dusty routers, hang hundreds of laminated route cards.' },
            { who: 'nexthop', text: 'The co-op, my dad\'s crowd. Their routers have spoken RIP since before I could drive, and Hollis over there wants them moved to something newer before he retires.' },
            { who: 'Hollis', text: 'Forty years on the radio, and every one of those boxes still thinks the only thing that matters is how many stops away you are.' },
            { who: 'nexthop', text: 'That\'s [[RIP]]. Hop count is the whole metric, and fifteen hops is the most it will count. Sixteen means you can\'t get there. It doesn\'t care whether a hop is a gigabit fibre or a wet piece of string.' },
            { who: 'nexthop', text: 'RIPv1 shouts its updates to everyone by broadcast and only knows the old classful networks, so no VLSM. RIPv2 carries the masks, works with VLSM and CIDR, and multicasts to 224.0.0.9. There\'s RIPng for IPv6. It only has two messages: a request, and a response full of routes.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do you set it up?', reply: 'Nexthop: "router rip, version 2, no auto-summary so it stops squashing subnets back into classful networks, then network with a classful address to switch it on for every interface inside it. passive-interface stops updates going out of a port with no routers behind it. default-information originate hands the neighbours your default route."' },
            { tone: 'press', say: 'Why move them off it, if it works?', reply: 'Hollis: "Because the garage on the hill has a fibre and the night depot has a copper line older than me, and RIP thinks they\'re the same. Two hops is two hops to RIP. It can\'t split traffic unequally either, only across routes with the same hop count."' },
            { tone: 'joke', say: 'Does anyone win at cards?', reply: 'Hollis: "Nobody\'s won since the co-op bought the fridge. We just keep score." He lays down a hand without looking at it.' }
          ] } },
        { k: 'SCENE', where: 'The co-op garage · the workbench · Tuesday, 00:10',
          lines: [
            { who: 'narr', text: 'Nexthop clears a space on the workbench among spark plugs and a cold teapot, and draws three boxes and three roads on a napkin with a green pen.' },
            { who: 'nexthop', text: '[[EIGRP]] is Cisco\'s. It\'s distance vector like RIP, rumours from the neighbours, but it measures the road properly: the bandwidth of the slowest link on the path, plus the delay of every link on it. AD 90, so it beats RIP\'s 120 the moment it\'s switched on. Hellos go to 224.0.0.10.' },
            { who: 'nexthop', text: 'router eigrp 100 starts it, and that number is the AS. It has to match on both routers or they never become neighbours. network with a wildcard mask picks the interfaces, no auto-summary like RIP, passive-interface on the ports that face desks, and a router ID the same way as always: one you set, or the highest loopback, or the highest physical address.' },
            { who: 'nexthop', text: 'Here\'s where it gets clever. My total metric to a place is my [[feasible distance]]. The neighbour\'s metric to it, what it tells me, is its [[reported distance]]. The road with the lowest total is the [[successor]]. Any other road whose reported distance is lower than the successor\'s feasible distance is a [[feasible successor]], a backup that can\'t possibly loop back through me.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why does the backup need a lower reported distance?', reply: 'Nexthop: "If the neighbour is closer to the place than I am, its road can\'t be going back through me. That\'s the feasibility condition. A feasible successor steps in the moment the successor dies, with no asking round."' },
            { tone: 'press', say: 'Can it use the slow line and the fast one at once?', reply: 'Nexthop: "EIGRP is the only one of the three that can load-balance over unequal costs, and only across feasible successors. RIP and OSPF only split traffic over routes with the same metric."' },
            { tone: 'care', say: 'What happens to the route cards?', reply: 'Hollis, from the card table: "On the wall, where they\'ve always been. My grandson can read them when the power goes."' }
          ] } },
        { k: 'LORE', title: 'THE CO-OP\'S OWN ROAD', year: 1993, real: ['cisco', 'ietf'], vibe: 'All that and a bag of chips: Cisco\'s own road, and only Cisco cabs allowed on it.',
          text: 'Nexthop, folding the napkin into his wallet: "Cisco brought out EIGRP in 1993 to replace its older protocol, IGRP. For more than twenty years only Cisco routers could speak it, and in 2016 Cisco published it as RFC 7868 so anyone could. The co-op bought Cisco routers the year it came out and have argued about it at the card table ever since."' },
        { k: 'KIT', text: 'Nexthop writes it on the back of the napkin.', kit: [
          { cmd: 'router rip → version 2 → no auto-summary → network 10.0.0.0', what: 'RIP: hop count, 15 max. v1 broadcasts, classful. v2 multicasts to 224.0.0.9, VLSM. RIPng for IPv6' },
          { cmd: 'passive-interface g0/0 · default-information originate', what: 'no updates out of a desk port · share the default route' },
          { cmd: 'router eigrp 100 → network 10.25.0.0 0.0.255.255 → no auto-summary', what: 'EIGRP: AD 90, hellos to 224.0.0.10. The AS number must match on neighbours' },
          { cmd: 'eigrp router-id 1.1.1.1', what: 'router ID: manual, else highest loopback, else highest physical address' },
          { cmd: 'metric = slowest bandwidth + total delay (K1 = 1, K3 = 1, K2 = K4 = K5 = 0)', what: 'feasible distance: mine. Reported distance: the neighbour\'s' },
          { cmd: 'successor = best route · feasible successor: RD lower than the successor\'s FD', what: 'EIGRP load-balances over unequal costs, but only across feasible successors' },
          { cmd: 'no router eigrp 10 · show ip eigrp neighbors · show ip protocols', what: 'remove a process · who the router can hear · what it is running' } ] },
        { k: 'SYNC', q: { prompt: 'Hollis, not looking up from his cards: "So the depot box says router eigrp 10 and ours say router eigrp 100. That\'s just a label, isn\'t it?"', opts: ['No. The AS number must match or they never become neighbours', 'Yes. The number is only for the router\'s own use', 'Only the lower number matters', 'It must match only for RIP'], a: 0,
          yes: 'Nexthop: "Not a label. Change the depot to 100 and they\'ll talk."', no: 'Nexthop: "It has to match. EIGRP routers with different AS numbers ignore each other."',
          why: 'Nexthop: The number after router eigrp is the autonomous system number, and two routers only become EIGRP neighbours when it matches. A router in AS 10 and one in AS 100 never exchange routes, even on the same cable.' } }
      ] },
    // ------------------------------------------------------------ night 26 · OSPF, part 1
    { id: 'n26-map-room', title: 'Nobody moves until the map agrees', sub: 'OSPF: link state, LSAs, areas, router IDs', npc: 'ospef', day: [26], src: [PS('OSPF_Part1.md')], unlocks: ['ospf-basics'],
      beats: [
        { k: 'SCENE', where: 'The map room above the cab rank · Wednesday, 20:00',
          lines: [
            { who: 'narr', text: 'The stairs up from the rank smell of wet coats and old paper. At the top is a long room with one wall covered in a hand-drawn map of Watson, every router a brass pin and every link a length of coloured string. A small drone hums along the map, photographing it. A tall man in yellow-tinted glasses stands with his back to you, moving one pin a millimetre to the left.' },
            { who: 'ospef', text: 'You\'re the runner Nexthop brought. He steers by what the next cab tells him, which is his business. I don\'t move a single fare until I\'ve seen the whole map myself.' },
            { who: 'ospef', text: '[[OSPF]] works that way. Every router describes its own links, which network, which neighbour, what each costs, in a [[LSA]], a link state advertisement, and floods it to every router in the [[OSPF area]]. Each router files every LSA it receives in its [[LSDB]], the link state database, and once they all hold the same database, each one works out its own shortest paths from it.' },
            { who: 'narr', text: 'He taps a framed photograph by the door: a thin man in heavy glasses at a café table.' },
            { who: 'ospef', text: 'With Dijkstra\'s algorithm, shortest path first. Every router in the area runs it on the same map, so they all come to the same answer about the roads.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How long does an LSA stay on the map?', reply: 'Ospef: "Every LSA has an age, and the router that made it floods a fresh copy every thirty minutes, so the map never goes stale. OSPFv2 carries the IPv4 map. OSPFv3 carries IPv6."' },
            { tone: 'press', say: 'Isn\'t flooding every link to every router a lot of work?', reply: 'Ospef: "More memory and more thinking than Nexthop\'s rumours, yes. In return, when a link breaks, every router knows within seconds and recalculates, instead of waiting for gossip to walk the long way round. And big maps get cut into areas so nobody carries the whole city."' },
            { tone: 'joke', say: 'Does the drone vote too?', reply: 'Ospef: "The drone photographs. It has no opinions, which makes it better company than most routers." The drone bumps gently into a pin and backs away.' }
          ] } },
        { k: 'SCENE', where: 'The map room · the long table · 20:40',
          lines: [
            { who: 'narr', text: 'A long table runs under the map, covered in index cards, one per router, in three colours of ink. Ospef lays out four of them for the northern roads.' },
            { who: 'ospef', text: 'An area is a set of routers and links that share one LSDB. [[Area 0]] is the backbone, and every other area has to connect to it. A router with all its interfaces in one area is an internal router. One with interfaces in two areas is an [[ABR]], an area border router, and I never give one more than two. Anything touching area 0 is a backbone router. The router with a door to the outside, like the one at the rank with the internet line, is an [[ASBR]], an autonomous system boundary router.' },
            { who: 'ospef', text: 'A route to somewhere in your own area is intra-area. A route to another area is interarea. One area on its own doesn\'t even have to be area 0, though I\'d still call it 0.' },
            { who: 'ospef', text: 'router ospf 1 starts it, and that number is only for this router, so the neighbours don\'t have to match it. network with a wildcard and an area picks the interfaces. passive-interface keeps hellos off the ports with only desks behind them, and the network is still advertised. The router ID comes from router-id if you set it, then the highest loopback address, then the highest physical one. Change it on a running router and it won\'t take until clear ip ospf process.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does the rest of the district learn the way out to the internet?', reply: 'Ospef: "The rank\'s router has a default route to the internet line. default-information originate under router ospf tells every other router about it, and it arrives as O*E2, an external default, pointing at the rank."' },
            { tone: 'press', say: 'Why set router IDs by hand if the router picks one anyway?', reply: 'Ospef: "Because a router that picks its own ID picks it from whatever addresses it has that morning. Add a loopback next month and the ID changes the next time the process restarts. 1.1.1.1 on the rank\'s router means I can read the neighbour tables without a key."' },
            { tone: 'care', say: 'Why won\'t you move until everyone agrees?', reply: 'He takes his glasses off and cleans them on his shirt. "Because I drove on rumours for nine years before this, and one wrong rumour put a fare in the canal. Nobody was hurt. I still take the stairs up here every night and look at the whole map first."' }
          ] } },
        { k: 'LORE', title: 'TWENTY MINUTES IN AMSTERDAM', year: 1956, vibe: 'Real cool, daddy-o: twenty minutes, no pencil, and every shortest road worked out.',
          text: 'Ospef, straightening the photograph: "In 1956 Edsger Dijkstra was shopping in Amsterdam with his fiancée. They sat down at a café terrace, and in about twenty minutes, with no pencil and no paper, he worked out how to find the shortest route between two cities on a map. He published it in 1959. Every OSPF router in Watson runs his twenty minutes every time a link changes. I keep his picture by the door so I remember to be that careful."' },
        { k: 'KIT', text: 'He copies four index cards for you in black ink and clips them together.', real: ['ietf'], kit: [
          { cmd: 'LSA → LSDB → Dijkstra (SPF)', what: 'every router in an area floods its links, holds the same database, and works out its own shortest paths. LSAs refresh every 30 minutes' },
          { cmd: 'area 0 = backbone · internal · ABR (2 areas max) · backbone router · ASBR', what: 'intra-area route: same area. Interarea route: another area' },
          { cmd: 'router ospf 1', what: 'the process ID is local. Neighbours do not need the same number' },
          { cmd: 'network 10.26.12.0 0.0.0.3 area 0 · passive-interface g0/0', what: 'enable OSPF on matching interfaces · no hellos out of a desk port, still advertised' },
          { cmd: 'router-id 1.1.1.1 · clear ip ospf process', what: 'router ID: manual, else highest loopback, else highest physical address. A change needs a reset' },
          { cmd: 'default-information originate', what: 'advertise this router\'s default route. It arrives as O*E2' },
          { cmd: 'distance 110 · maximum-paths 4 · show ip ospf neighbor', what: 'change OSPF\'s AD · ECMP paths · who has a full adjacency' } ] },
        { k: 'SYNC', q: { prompt: 'Nexthop, calling up the stairs: "My router says router ospf 1 and the garage\'s says router ospf 2. They\'ll never talk, right?"', opts: ['They will. The process ID only matters on the router itself', 'They won\'t. The process IDs must match', 'Only if both use area 2', 'Only if one of them is an ABR'], a: 0,
          yes: 'Ospef: "They\'ll talk. The number is his business, not the neighbour\'s."', no: 'Ospef: "They\'ll talk. The process ID is local. The area and the subnet have to match, not that."',
          why: 'Ospef: The number after router ospf is the process ID, and it only identifies the process on that router. Two routers with different process IDs still become neighbours, as long as things like their area and subnet on the shared link match.' } }
      ] },
    // ------------------------------------------------------------ night 27 · OSPF, part 2
    { id: 'n27-timetable-board', title: 'The timetable board says hello', sub: 'OSPF cost, reference bandwidth, neighbour states and messages', npc: 'ospef', day: [27], src: [PS('OSPF_Part2.md')], unlocks: ['ospf-tuning'],
      beats: [
        { k: 'SCENE', where: 'The map room · Thursday, 19:30',
          lines: [
            { who: 'narr', text: 'Rain drums on the skylight and the map room smells of pencil shavings and the drone\'s warm battery. A length of red string has been added between the garage and the south depot since last night, and Ospef is frowning at it.' },
            { who: 'ospef', text: 'The garage-to-depot line is old copper, FastEthernet, a hundred megabits. The yard route next to it is gigabit. And every router in the north thinks they\'re exactly as good as each other.' },
            { who: 'ospef', text: 'OSPF works out each interface\'s cost as the reference bandwidth divided by the interface bandwidth. The default reference is 100 megabits, so FastEthernet costs 1, and gigabit would cost a tenth, except that nothing costs less than 1. So FastEthernet, gigabit and ten-gig all cost 1. Old ten-megabit Ethernet costs 10. A loopback always costs 1.' },
            { who: 'you', text: 'So the old copper and the gigabit tie.' },
            { who: 'ospef', text: 'And the depot splits its traffic across both, which it should not. auto-cost reference-bandwidth fixes the ruler: set it to 100000, a hundred gigabits, and gigabit costs 100 while FastEthernet costs 1000. Set it the same on every router, or they measure the same road with different rulers.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Can I just set the cost on one interface?', reply: 'Ospef: "ip ospf cost on the interface, yes, and that number wins over the formula. Or the bandwidth command, in kilobits, which changes what OSPF divides by. It doesn\'t change how fast the port runs. The speed command does that."' },
            { tone: 'press', say: 'Why is the default reference so low?', reply: 'Ospef: "Because in 1989 a hundred megabits was a fantasy. The number never moved, and every network faster than it has had to fix the ruler by hand ever since."' },
            { tone: 'quiet', say: '(Look at the depot\'s index card on the table.)', reply: 'The card for the south depot has a new line in Ospef\'s hand: loopback0, 4.4.4.4, ip ospf 1 area 0. "On the interface itself," he says. "No wildcard, no guessing which interfaces a network command catches."' }
          ] } },
        { k: 'SCENE', where: 'The map room · 20:15',
          lines: [
            { who: 'narr', text: 'The drone chirps and drops a printout on the table. Ospef reads it and his mouth goes thin.' },
            { who: 'ospef', text: 'The tram yard router has a neighbour it shouldn\'t have. Something on the yard\'s office network is saying hello, and the yard is saying hello back.' },
            { who: 'narr', text: 'A man\'s voice comes out of the phone on the table, over the clatter and hiss of a tram yard.' },
            { who: 'Tobiah', text: 'That\'ll be the timetable board. The supplier left a router in the back of it with everything switched on. It\'s been running since Tuesday.' },
            { who: 'ospef', text: 'OSPF routers send hellos every 10 seconds on Ethernet to 224.0.0.5, all OSPF routers, and a neighbour that\'s been silent for 40, the dead timer, is gone. Two routers that hear each other walk through the states: Down, Init when I\'ve heard your hello but you haven\'t listed me, 2-way when you have. Then Exstart, where the higher router ID becomes the master, Exchange of database descriptions, Loading while we request what we\'re missing, and Full.' },
            { who: 'ospef', text: 'The yard\'s office port should never have said hello in the first place. passive-interface default makes every interface passive, and then no passive-interface opens only the ones that face real neighbours.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What messages go back and forth?', reply: 'Ospef: "Five types. 1 is the hello. 2 is the database description, a DBD, the list of LSAs I hold. 3 is a link state request, an LSR, for the ones you\'re missing. 4 is a link state update, an LSU, which carries the LSAs. 5 is the link state acknowledgement, an LSAck, so nothing gets lost."' },
            { tone: 'press', say: 'What harm can a timetable board do?', reply: 'Ospef: "It\'s advertising a network nobody asked for into every router\'s map. Today it\'s the board\'s own little network. The day someone gives it a default route, every fare in the north goes to the timetable board."' },
            { tone: 'care', say: 'You look angrier than the board deserves.', reply: 'Ospef: "I spent three weeks getting every router in the north to agree. A box in the back of a sign got a vote without asking." He puts the printout face down.' }
          ] } },
        { k: 'LORE', title: 'OPEN, SHORTEST, FIRST', year: 1989, real: ['ietf'], vibe: 'Rad to the max: one open map any vendor\'s router could read.',
          text: 'Ospef: "The IETF published the first OSPF as RFC 1131 in October 1989, written by John Moy. Open meant anyone\'s router could run it, where the protocols before it belonged to one company or another. The reference bandwidth of a hundred megabits comes from those years, when that was faster than any link in the building. I keep a printed copy of RFC 1131 in the drawer, and the corners are soft from reading."' },
        { k: 'KIT', text: 'Ospef writes a new index card, in red ink for once.', real: ['ietf'], kit: [
          { cmd: 'cost = reference bandwidth ÷ interface bandwidth', what: 'default reference 100 Mbps: 10M 10 · FastEthernet 1 · gigabit 1 · 10-gig 1 · loopback always 1' },
          { cmd: 'auto-cost reference-bandwidth 100000', what: 'in megabits, under router ospf. The same on every router' },
          { cmd: 'ip ospf cost 50 · bandwidth 100000', what: 'on an interface: set the cost directly · change the bandwidth OSPF divides by, in kbps (not the speed)' },
          { cmd: 'ip ospf 1 area 0', what: 'enable OSPF on one interface, without a network command' },
          { cmd: 'passive-interface default → no passive-interface g0/0', what: 'everything quiet, then open only the links to real neighbours' },
          { cmd: 'hello 10 s · dead 40 s · 224.0.0.5', what: 'Ethernet defaults. Hellos go to all OSPF routers' },
          { cmd: 'Down → Init → 2-way → Exstart → Exchange → Loading → Full', what: 'DR and BDR in 2-way · higher router ID is master in Exstart' },
          { cmd: '1 Hello · 2 DBD · 3 LSR · 4 LSU · 5 LSAck', what: 'the five OSPF message types. LSAs travel in LSUs' } ] },
        { k: 'SYNC', q: { prompt: 'Tobiah, still on the speaker: "The board\'s router and ours heard each other\'s hellos, and each one has the other\'s ID in its hello now. What state are they in?"', opts: ['2-way', 'Init', 'Full', 'Exstart'], a: 0,
          yes: 'Ospef: "2-way. And from there they went all the way to Full, which is the problem."', no: 'Ospef: "2-way. Init is when only one side has seen the other in a hello."',
          why: 'Ospef: A router that receives a hello without its own router ID in it is in Init. Once each router sees its own ID in the other\'s hello, they are 2-way. From there they go on through Exstart, Exchange and Loading to Full.' } }
      ] },
    // ------------------------------------------------------------ night 28 · OSPF, part 3
    { id: 'n28-round-table', title: 'The round table and the edge of the map', sub: 'OSPF network types, DR and BDR, neighbour requirements, LSA types', npc: 'ospef', day: [28], src: [PS('OSPF_Part3.md')], unlocks: ['ospf-areas'],
      beats: [
        { k: 'SCENE', where: 'The map room · Friday, 21:00',
          lines: [
            { who: 'narr', text: 'The skylight is open tonight, and cold air carries the smell of frying onions up from the coffee van. In the middle of the map, three pins stand in a ring around one small switch, joined to it by three short strings. Ospef has drawn a circle round them in chalk.' },
            { who: 'ospef', text: 'The round table. The rank, the garage and the tram yard all meet on this one switch, one Ethernet segment. If every router there made a full adjacency with every other, they\'d each flood every change to all the rest. So they elect a chair.' },
            { who: 'ospef', text: 'On Ethernet OSPF uses the broadcast network type, and a broadcast segment elects a [[designated router]], the DR, and a backup, the BDR. The highest interface priority wins, and it\'s 1 on every interface until you change it. On a tie, the highest router ID. Priority 0 means never stand. Everyone else is a DROther, and a DROther only goes Full with the DR and BDR. With each other they stay at 2-way. Updates for the DR and BDR go to 224.0.0.6.' },
            { who: 'you', text: 'So whoever has the highest router ID chairs the table.' },
            { who: 'ospef', text: 'Unless you choose. ip ospf priority on the interface. And the election happens once, in 2-way, and nobody takes the chair from a sitting DR just by arriving with a better number. It only changes when the DR goes away, or you reset the process.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What about a link with only two routers on it?', reply: 'Ospef: "Then electing a chair is a waste of time. Serial links with HDLC or PPP run the point-to-point type, no DR, no BDR. On Ethernet between two routers you can set it yourself: ip ospf network point-to-point on both ends. Old Frame Relay and X.25 are non-broadcast: no DR discovery on their own, you list the neighbours by hand, and the timers are 30 and 120."' },
            { tone: 'press', say: 'What does the DR actually do?', reply: 'Ospef: "Every router on the segment sends its updates to the DR and BDR, and the DR floods them back out to everyone. It also writes the segment into the map as a type 2 LSA, a network LSA. Every router writes itself as a type 1, a router LSA. The rank\'s internet default arrives as a type 5, AS-external."' },
            { tone: 'joke', say: 'Serial cables? Still?', reply: 'Ospef: "Two, to the old signal box. HDLC is the default on a serial interface, Cisco\'s own version. encapsulation ppp changes it. The DCE end, the one with the clock cable, sets the speed with clock rate, and show controllers tells you which end you\'re on."' }
          ] } },
        { k: 'SCENE', where: 'The map room · the east wall · 21:40',
          lines: [
            { who: 'narr', text: 'At the east edge of the map the strings stop at a line of masking tape. Beyond it, in a different hand and a different colour of ink, someone has drawn the next district\'s routers. One string crosses the tape to a pin labelled EDGE.' },
            { who: 'ospef', text: 'The edge router links us to the next district. Their side keeps its own area, area 1, and the rank will be the ABR between us. Tonight it has no neighbour at all, and the yard dropped off the round table as well.' },
            { who: 'ospef', text: 'Two routers only become neighbours when they agree on a list of things. The same area on the link. The same subnet and mask. The same hello and dead timers. The same authentication, if there is any. Different router IDs, and neither end passive. The process ID doesn\'t matter.' },
            { who: 'ospef', text: 'Some mismatches are quieter. Different MTUs on the two ends and they become neighbours but stick before Full. Different network types, one broadcast and one point-to-point, and they go Full but never learn each other\'s routes.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I check the timers?', reply: 'Ospef: "Under the interface in the running-config: ip ospf hello-interval and ip ospf dead-interval. Change the hello and IOS moves the dead to four times it for you. Someone set the yard\'s hello to 5 last week to be clever."' },
            { tone: 'press', say: 'Why keep the next district in a separate area at all?', reply: 'Ospef: "Because I don\'t want their every flapping link rerunning Dijkstra on my routers. Inside an area everyone carries the whole map. Between areas the ABR hands over a summary instead of every detail."' },
            { tone: 'care', say: 'Do you know the people on the other side of the tape?', reply: 'Ospef: "One of them. She taught me to draw strings instead of arrows." He touches the other colour of ink without smudging it.' }
          ] } },
        { k: 'LORE', title: 'THE VERSION THAT STAYED', year: 1998, real: ['ietf'], vibe: 'All that: one RFC every router in the world agreed to stop arguing about.',
          text: 'Ospef: "John Moy wrote OSPF version 2 in 1991, and in April 1998 he published the version of it that everyone still runs, RFC 2328. The DR, the BDR, the LSA types and the neighbour states you just learned are all in it, word for word. The yard\'s router, the rank\'s router and the edge router all follow a document older than the building they sit in."' },
        { k: 'KIT', text: 'He writes it on the back of the chalk box, in small careful capitals.', real: ['ietf'], kit: [
          { cmd: 'broadcast (Ethernet, FDDI) · point-to-point (PPP, HDLC) · non-broadcast (Frame Relay, X.25)', what: 'broadcast and point-to-point find neighbours themselves. Only broadcast and non-broadcast elect a DR' },
          { cmd: 'ip ospf priority 255 · ip ospf priority 0', what: 'DR: highest priority (default 1), then highest router ID. 0 never stands. The election is not pre-emptive' },
          { cmd: 'DROther: Full with DR and BDR, 2-way with other DROthers', what: 'updates to the DR and BDR go to 224.0.0.6' },
          { cmd: 'ip ospf network point-to-point', what: 'on both ends of a two-router Ethernet link: no DR election' },
          { cmd: 'neighbours need: same area, subnet and mask, hello and dead, authentication · different router IDs · not passive', what: 'MTU mismatch: stuck before Full. Network type mismatch: Full, but no routes' },
          { cmd: 'ip ospf hello-interval 10 · ip ospf dead-interval 40 · ip ospf authentication · ip ospf authentication-key PASSWORD', what: 'per interface' },
          { cmd: 'LSA type 1 router · type 2 network (from the DR) · type 5 AS-external', what: 'shutdown under router ospf stops the process' },
          { cmd: 'serial: HDLC by default · encapsulation ppp · clock rate 64000 on the DCE · show controllers s0/0/0', what: 'DCE sets the clock, DTE follows it' } ] },
        { k: 'SYNC', q: { prompt: 'Nexthop, leaning in the doorway with two coffees: "Three routers on the round table, all priority 1, IDs 1.1.1.1, 2.2.2.2 and 3.3.3.3. Who chairs it?"', opts: ['3.3.3.3, the highest router ID, and 2.2.2.2 is the BDR', '1.1.1.1, the lowest router ID', 'Whichever came up first, always', 'Nobody. Ethernet has no DR'], a: 0,
          yes: 'Ospef: "3.3.3.3, with 2.2.2.2 as the backup. Unless somebody changes a priority."', no: 'Ospef: "3.3.3.3. Equal priorities, so the highest router ID is DR and the next is BDR."',
          why: 'Ospef: On a broadcast segment the DR is the router with the highest OSPF interface priority, and every interface starts at 1. With the priorities tied, the highest router ID wins, so 3.3.3.3 is DR and 2.2.2.2, the next highest, is BDR.' } }
      ] },
    // ------------------------------------------------------------ night 29 · first hop redundancy
    { id: 'n29-cousins-cab', title: 'Two cabs, one number', sub: 'first hop redundancy: HSRP, VRRP and GLBP', npc: 'nexthop', day: [29], src: [PS('FHRPs.md')], unlocks: ['fhrp'],
      beats: [
        { k: 'SCENE', where: 'The cab rank · Saturday, 03:10',
          lines: [
            { who: 'narr', text: 'Hot oil and coolant hiss off Nexthop\'s engine into the rain, and the bonnet stands open like a mouth. He is on his back under the front bumper with a torch. In the next bay a second yellow cab idles, identical to his except for a dent in the door, and a man with Nexthop\'s nose and a better haircut leans on its roof.' },
            { who: 'nexthop', text: 'My cousin Stan. Same phone number on both our roofs. When a fare rings it, whichever of us is on duty picks up, and tonight that\'s him.' },
            { who: 'Stan', text: 'Nobody in Watson knows there are two of us. They ring the number, and a cab turns up.' },
            { who: 'nexthop', text: 'A PC has one default gateway, one address, and if that router dies the PC is stranded, even with a second router sitting right next to it. A [[first hop redundancy protocol]] gives the two routers one shared virtual IP and one virtual MAC. The PCs use the virtual IP as their gateway, and whichever router is active answers ARP for it with the virtual MAC.' },
            { who: 'Stan', text: 'And when he breaks down, I shout to the whole rank that the number\'s mine now, so nobody\'s left ringing a dead cab.' },
            { who: 'nexthop', text: 'That shout is a [[gratuitous ARP]], an ARP reply nobody asked for, sent to the broadcast address. Every switch learns the virtual MAC on the new router\'s port straight away.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do the two routers know which one is on duty?', reply: 'Nexthop: "They multicast hellos to each other. In [[HSRP]], Cisco\'s, the one with the highest priority is active and the other is standby. The default priority is 100, and on a tie the highest IP address wins."' },
            { tone: 'press', say: 'When your cab\'s fixed, do you get the number back?', reply: 'Stan: "Not unless he\'s set to take it. Preemption is off by default on all of them. Without it, I keep the number until my cab dies too." Nexthop, from under the bumper: "standby 1 preempt. I\'m typing it the minute I\'m out of here."' },
            { tone: 'joke', say: 'Does anyone ever notice it\'s not the same cab?', reply: 'Stan: "One old lady. She said the ride was smoother. I didn\'t tell him."' }
          ] } },
        { k: 'SCENE', where: 'Stan\'s cab · the ring road · 03:40',
          lines: [
            { who: 'narr', text: 'Stan\'s cab smells of peppermint and new seat covers. The radio is tuned to the rank\'s channel, and Nexthop\'s voice comes over it every few minutes from under his own cab, still talking.' },
            { who: 'nexthop', text: 'Three of them you need to know. HSRP is Cisco\'s: active and standby, hellos to 224.0.0.2 in version 1 and 224.0.0.102 in version 2. The virtual MAC is 0000.0c07.acXX in version 1, XX the group number, and 0000.0c9f.fXXX in version 2.' },
            { who: 'Stan', text: '[[VRRP]] is the open one, anybody\'s routers: master and backup instead, hellos to 224.0.0.18, virtual MAC 0000.5e00.01XX.' },
            { who: 'nexthop', text: 'And [[GLBP]], Cisco\'s again, which actually shares the fares. One active virtual gateway, the AVG, hands out up to four active virtual forwarders, AVFs, each with its own virtual MAC, 0007.b400.XXYY, and answers different PCs\' ARPs with different ones. Hellos to 224.0.0.102.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I set up HSRP?', reply: 'Stan: "On the LAN interface of both routers: standby 1 ip with the virtual address. On the one you want active, standby 1 priority higher than 100, and standby 1 preempt so it takes the number back after a fault. standby version 2 if you want the newer hellos. show standby brief tells you who\'s active."' },
            { tone: 'press', say: 'So with HSRP the standby router just sits there?', reply: 'Nexthop: "For that group, yes, idle and listening. You can split the load by hand with two groups, one active on each router for half the VLANs. GLBP does the sharing inside one group."' },
            { tone: 'care', say: 'Do you two ever work the same night?', reply: 'Stan: "Every Saturday. He drives, I sit in the next bay with the engine warm. Our mum rings the number to check we\'re both alive."' }
          ] } },
        { k: 'LORE', title: 'ONE NUMBER ON TWO ROOFS', year: 1998, real: ['cisco', 'ietf'], vibe: 'Da bomb: two routers answering to one address, and the fare never notices the swap.',
          text: 'Stan: "Cisco wrote up HSRP as RFC 2281 in March 1998, after years of running it on their own routers, and VRRP came out of the IETF as an open standard the same year, RFC 2338. Our uncle painted one phone number on two cabs the year the first one came out, because he read about it in a magazine. He said if the big networks could share an address, two brothers could share a phone."' },
        { k: 'KIT', text: 'Stan writes it on the back of a fare card and tucks it in your jacket.', real: ['cisco', 'ietf'], kit: [
          { cmd: 'standby 1 ip 10.29.1.254', what: 'HSRP group 1\'s virtual IP, on the LAN interface of both routers. PCs use it as their gateway' },
          { cmd: 'standby 1 priority 110 · standby 1 preempt · standby version 2', what: 'active: highest priority (default 100), then highest IP. Preemption is off by default' },
          { cmd: 'HSRP (Cisco): active/standby · v1 224.0.0.2, 0000.0c07.acXX · v2 224.0.0.102, 0000.0c9f.fXXX', what: 'XX or XXX is the group number' },
          { cmd: 'VRRP (open): master/backup · 224.0.0.18 · 0000.5e00.01XX', what: 'the standard one' },
          { cmd: 'GLBP (Cisco): one AVG, up to 4 AVFs · 224.0.0.102 · 0007.b400.XXYY', what: 'load-balances inside one subnet' },
          { cmd: 'gratuitous ARP', what: 'an unrequested ARP reply, broadcast by the new active router so switches relearn the virtual MAC' },
          { cmd: 'show standby brief', what: 'group, priority, P for preempt, who is active, who is standby, the virtual IP' } ] },
        { k: 'SYNC', q: { prompt: 'Stan, at a red light: "Two routers, both at priority 100, no preempt. One\'s 10.29.1.1 and the other\'s 10.29.1.2. Who answers the number?"', opts: ['10.29.1.2, the highest IP address, because the priorities tie', '10.29.1.1, the lowest IP address', 'Both, taking turns', 'Neither, until a priority is set'], a: 0,
          yes: 'Stan: "Point-two. Same as me: I answer if nobody\'s told me not to."', no: 'Stan: "Point-two. Equal priority, so the highest IP address is active."',
          why: 'Nexthop: HSRP makes the router with the highest priority active. Both are at the default of 100, so the tie goes to the highest IP address on the interface, 10.29.1.2. The other becomes standby.' } }
      ] }
  ] });
})();
