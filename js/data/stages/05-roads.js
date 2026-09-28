/* Stage 5 · The Roads — routing. Framework stub: one intro level. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'roads', arc: 'grid', title: 'STAGE 5 · THE ROADS', sub: 'routing: static routes, OSPF, FHRP', npc: 'nexthop', status: 'live', levels: [
    { id: 'nexthop-intro', title: 'One stop at a time', sub: 'routing fundamentals, static routes', npc: 'nexthop', day: [11,14,15], src: [PS('Routing_Fundamentals_Part1.md'), PS('Static_Routing_Part2.md'), PS('Life_of_a_Packet.md')], unlocks: ['static-route'],
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
        { k: 'LORE', title: 'LO', year: 1969, vibe: 'Groovy. Two letters, then the crash. Still counts.', text: 'Nexthop, at a red light: "The first router was called an IMP, built by BBN on a Honeywell 516. On 29 October 1969 UCLA tried to send LOGIN through it to Stanford. It crashed after two letters. First message on the internet: LO. First cab crashed on the first fare. We got better."' },
        { k: 'KIT', text: 'He hands you a receipt with writing on the back.', kit: [ { cmd: 'ip route 10.0.2.0 255.255.255.0 10.0.12.2', what: 'static route through a next hop' }, { cmd: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1', what: 'default route toward the ISP' }, { cmd: 'show ip route', what: 'read the table: C connected, S static, S* default, O OSPF' } ] },
        { k: 'SYNC', q: { prompt: 'Nexthop, over his shoulder: "Table has 10.0.0.0/8, 10.1.0.0/16 and a default. Fare wants 10.1.2.3. Which entry?"', opts: ['10.0.0.0/8', '10.1.0.0/16', '0.0.0.0/0', 'Whichever was typed first'], a: 1, yes: '"Most specific street. Every time."', no: '"Longest prefix. Slash 16 beats slash 8 beats the default."' , why: 'Nexthop: When more than one route fits, I pick the one that matches the most bits. Slash 16 matches more bits than slash 8. The default, slash 0, matches nothing specific, so it is used last.' } }
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
            { who: 'nexthop', text: 'Two kinds of protocol. Interior gateway protocols, IGPs, share routes inside one organisation\'s network, one [[autonomous system]]. Exterior gateway protocols share routes between different ones, and there\'s only one of those left, BGP, the one the internet runs on.' },
            { who: 'nexthop', text: 'The IGPs come in two families. [[Distance vector]] protocols, RIP and EIGRP, only know what the neighbours tell them: that network, this far. Routing by rumour. [[Link state]] protocols, OSPF and IS-IS, hand every router the whole map, so each one works out the roads for itself. They cost more brain and react faster. BGP is its own thing, path vector.' },
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
            { who: 'nexthop', text: 'The co-op. My dad\'s crowd. Their routers have spoken RIP since before I could drive, and Hollis over there wants them moved to something newer before he retires.' },
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
            { who: 'ospef', text: 'With Dijkstra\'s algorithm. Shortest path first. Every router in the area runs it on the same map, so they all come to the same answer about the roads.' }
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
      ] }
  ] });
})();
