/* District 02 · The Block — Cider's bar, where address blocks get divided.
   Nights 7, 8, 10 (IPv4 addresses, the IPv4 header) and 13–15 (subnetting, VLSM).
   Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'block', arc: 'grid', title: 'STAGE 2 · THE BLOCK', sub: 'IPv4 addressing and subnetting', npc: 'cider', status: 'live', levels: [
    // ------------------------------------------------------------ night 7 · IPv4 addresses, part 1
    { id: 'n07-the-counter', title: 'Thirty-two notches', sub: 'IPv4 addresses, binary and classes', npc: 'cider', day: [7], src: [PS('IPv4_Addressing_Part1.md')], unlocks: ['ipv4-addr'],
      beats: [
        { k: 'SCENE', where: 'The Block · Cider\'s bar · late',
          lines: [
            { who: 'narr', text: 'The bar smells of cut apples and warm sugar, and a fan in the corner turns slowly without cooling anything. The steel counter is scored along its whole length with fine notches in groups of eight. Behind it a woman with a copper-red bun is cutting a sheet of clear acrylic along a steel ruler, one slow pass of the knife at a time.' },
            { who: 'cider', text: 'Osi says you can read a label and Mac says you can read a table. Sit down. On this block I hand out addresses, and I want to know you can count before I let you near one.' },
            { who: 'cider', text: 'An [[IPv4 address]] is thirty-two bits, four bytes. I split it into four groups of eight, the [[octet]]s, and write each one as a number with a dot between them. 192.168.7.20 is four octets.' },
            { who: 'cider', text: 'Every bit in an octet is worth something, from the left: 128, 64, 32, 16, 8, 4, 2 and 1. You add up the ones that are switched on. 11000000 is 128 plus 64, so 192. All eight on is 255, and that\'s as high as an octet goes.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I go the other way, from 192 to binary?', reply: 'Cider: "Start at 128. If the number is at least 128, write a 1 and take 128 away; if not, write a 0. Then do the same with 64, then 32, all the way down to 1. For 168 that\'s 1, leaving 40; 0 for 64; 1 for 32, leaving 8; 0, 1, 0, 0, 0. So 10101000."' },
            { tone: 'press', say: 'Why thirty-two bits? Why not more?', reply: 'Cider: "Because in 1981 four billion addresses looked like more than anyone would ever need. Two to the thirty-second is 4,294,967,296. Sixx across the street will tell you what happened next, at length, if you let him."' },
            { tone: 'joke', say: 'Do I get a drink while I count?', reply: 'Cider slides a glass of cloudy cider across the counter without looking up from the ruler. "It\'s on the house until you get one wrong."' }
          ] } },
        { k: 'SCENE', where: 'Cider\'s bar · the counter',
          lines: [
            { who: 'cider', text: 'Every address has two parts: the network it belongs to, and the host on that network. The [[prefix length]] tells you where one ends and the other starts. /24 means the first twenty-four bits are network and the last eight are host, and the [[subnet mask]] writes the same thing out as 255.255.255.0.' },
            { who: 'cider', text: 'The old way of cutting the block used fixed sizes, by the first octet. Class A is 0 to 127, first bit 0, with a /8. Class B is 128 to 191, starting 10, with a /16. Class C is 192 to 223, starting 110, with a /24. Class D, 224 to 239, starting 1110, is [[multicast]]. Class E, 240 to 255, is kept for experiments.' },
            { who: 'cider', text: 'Two addresses on every network are never handed out. With the host bits all zero you get the [[network address]], which names the network itself. With the host bits all ones you get the [[broadcast address]], which reaches every host on it. And anything starting 127 is a [[loopback address]], a machine talking to itself to test its own stack.' },
            { who: 'narr', text: 'She lifts the acrylic sheet and holds it against the light. It is cut into strips of different widths, each one etched with a range of numbers.' },
            { who: 'cider', text: 'The corp towers bought their addresses by the million, and they count them exactly the way you\'re counting them now, at my counter.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s the network address of 172.16.40.9?', reply: 'Cider: "172 is class B, so the first two octets are network and the last two are host. Set the host bits to zero and you get 172.16.0.0. Set them all to one and you get the broadcast, 172.16.255.255."' },
            { tone: 'press', say: 'If classes are the old way, why learn them?', reply: 'Cider: "Because half the boxes you\'ll touch still assume them when you don\'t tell them otherwise, and because the Board asks. Nobody hands out whole classes any more. You\'ll see how we cut them now, later this week."' },
            { tone: 'care', say: 'Is Marrow\'s hot plate on the shelf really yours?', reply: 'She snorts. "He borrowed it four years ago and tells everyone it came with the stall. He does make a better bowl of noodles than I do, but don\'t tell him I said so."' }
          ] } },
        { k: 'LORE', title: 'FOUR BILLION SEEMED LIKE PLENTY', year: 1981, real: ['ietf'], vibe: 'Tubular. Four billion addresses and not one person could picture running out.',
          text: 'Cider, wiping the ruler clean: "IPv4 is RFC 791, published in September 1981 with Jon Postel as its editor. Thirty-two bits, four billion addresses, for a network of a few hundred machines. My grandmother ran a bar on this block when there were more stools in it than computers on the whole internet."' },
        { k: 'KIT', text: 'Cider writes on a coaster in pencil and slides it over.', real: ['ietf'], kit: [
          { cmd: '128 64 32 16 8 4 2 1', what: 'the value of each bit in an octet. 11111111 = 255' },
          { cmd: 'A 0–127 (0…) /8 · B 128–191 (10…) /16 · C 192–223 (110…) /24', what: 'the classes, by the first octet' },
          { cmd: 'D 224–239 (1110…) multicast · E 240–255 (1111…) experimental · 127 loopback', what: 'never handed to a host' },
          { cmd: '/8 255.0.0.0 · /16 255.255.0.0 · /24 255.255.255.0', what: 'prefix length and mask' },
          { cmd: 'host bits all 0 = network address · all 1 = broadcast address', what: 'the two you never give out' } ] },
        { k: 'SYNC', q: { prompt: 'A regular at the end of the bar, turning a coaster over: "My landlord says our block is 172.20.0.0. What class is that, and what\'s the broadcast?"', opts: ['Class B, broadcast 172.20.255.255', 'Class C, broadcast 172.20.0.255', 'Class A, broadcast 172.255.255.255', 'Class B, broadcast 172.20.0.255'], a: 0,
          yes: 'Cider: "Class B. Two octets of host, all ones."', no: 'Cider: "172 is class B, a /16, so the last two octets are host. All ones is 172.20.255.255."',
          why: 'Cider: The first octet, 172, is between 128 and 191, so it is class B with a /16 mask, 255.255.0.0. The host part is the last two octets. Setting every host bit to 1 gives the broadcast address, 172.20.255.255.' } }
      ] },
    // ------------------------------------------------------------ night 8 · IPv4 addresses, part 2
    { id: 'n08-two-loaves', title: 'A shop that needs a door', sub: 'host counts, addressing a router, show ip interface brief', npc: 'cider', day: [8], src: [PS('IPv4_Addressing_Part2.md')], unlocks: ['ipv4-config'],
      beats: [
        { k: 'SCENE', where: 'The Block · the Two Loaves bakery, next door to Cider\'s · five in the morning',
          lines: [
            { who: 'narr', text: 'The heat from the ovens hits you in the doorway, along with the smell of bread crust and burnt sugar. Flour covers every flat surface, including a brand-new router still in its plastic on top of a sack of rye. A tall man in an apron is kneading dough with his sleeves pushed up, and Cider leans on the counter with her ruler under one arm.' },
            { who: 'Tomas', text: 'I\'m Tomas. I bake, I don\'t do computers. The till goes in the shop, the oven controller goes in the kitchen, and the man who sold me the router said something about addresses and left.' },
            { who: 'cider', text: 'Two networks, one for the shop and one for the kitchen, and the router joins them. Before I give you addresses, tell me how many hosts fit on a network. Count the host bits, call that n, and the answer is two to the n, minus two for the network and broadcast addresses.' },
            { who: 'cider', text: 'A /24 leaves eight host bits: 256 minus 2 is 254 hosts. Class B has sixteen host bits, so 65,534. Class A has twenty-four, so 16,777,214 hosts on one network. Nobody ever put that many machines on one wire, which is half the reason the old classes died.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How many class A networks were there?', reply: 'Cider: "The first bit of class A is fixed at 0, which leaves seven bits for the network: 2 to the 7th is 128 networks. Class B fixes two bits and has fourteen left, so 16,384 networks. Class C fixes three and has twenty-one left, so 2,097,152 networks of 254 hosts each."' },
            { tone: 'press', say: 'Why subtract two? That\'s two addresses wasted on every network.', reply: 'Cider: "Because the network address names the network and the broadcast address reaches all of it, and neither can be a host. On a big network two addresses are nothing. On a tiny one they hurt, and you\'ll see how tiny next week."' },
            { tone: 'care', say: 'Tomas, when did you open?', reply: 'Tomas: "Monday. I\'ve sold eleven loaves and burned four." Cider tells him the burned ones are the best, and he gives her one to prove it.' }
          ] } },
        { k: 'SCENE', where: 'The Two Loaves · the kitchen',
          lines: [
            { who: 'cider', text: 'Every port on a Cisco router starts switched off, administratively down, until someone types no shutdown on it. Switch ports are the other way round and come up on their own. Somebody plugging a cable into a router shouldn\'t be enough to join two networks.' },
            { who: 'cider', text: 'You go into the interface and give it an address with ip address, then the address and the mask. Put a description on it too, so the next person knows what\'s on the other end without following the cable through the flour.' },
            { who: 'cider', text: 'Then you check your work with show ip interface brief. The Status column is Layer 1, whether the port is up at all, and it says administratively down if nobody has turned it on. The Protocol column is Layer 2. You want up and up on both.' },
            { who: 'Tomas', text: 'And the description, where does that show?' },
            { who: 'cider', text: 'show interfaces description lists every port with its status and what you wrote on it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which addresses do the shop and kitchen get?', reply: 'Cider: "The shop gets 192.168.8.0/24 and the kitchen 192.168.9.0/24. The router takes .1 on each, the till gets 192.168.8.10, and the oven controller 192.168.9.20. Each host uses the router\'s address on its own network as its gateway."' },
            { tone: 'press', say: 'What if Status is up and Protocol is down?', reply: 'Cider: "Then the cable has signal but the two ends can\'t agree at Layer 2. A speed or duplex mismatch will do it, or a bad encapsulation on the far end."' },
            { tone: 'joke', say: 'Can the router bake as well?', reply: 'Tomas laughs so hard he gets flour in his beard. "If it can, I\'m selling the oven."' }
          ] } },
        { k: 'LORE', title: 'THE END OF CLASS', year: 1993, real: ['ietf'], vibe: 'All that and a bag of chips. The classes were out and the slash was in.',
          text: 'Cider, tearing the bread in half: "In September 1993 the IETF published RFC 1518 and RFC 1519, and that was the end of the classes. Classless inter-domain routing, CIDR, let you cut the block at any bit you liked and write the cut as a slash. Before that, a company that needed three hundred addresses got a whole class B and sat on sixty-five thousand. My mother kept the RFC pinned behind this counter for years, like a wedding photo."' },
        { k: 'KIT', text: 'Cider writes on a flour-dusted paper bag.', kit: [
          { cmd: 'hosts = 2^n − 2 (n = host bits)', what: '/24: 254 · class B: 65,534 · class A: 16,777,214' },
          { cmd: 'networks: A 128 · B 16,384 · C 2,097,152', what: 'the old classes' },
          { cmd: 'interface g0/0 → ip address 192.168.8.1 255.255.255.0 → description ... → no shutdown', what: 'router ports start administratively down; switch ports do not' },
          { cmd: 'show ip interface brief', what: 'Status = Layer 1 · Protocol = Layer 2 · want up/up' },
          { cmd: 'show interfaces description', what: 'status, protocol and what you wrote on each port' } ] },
        { k: 'SYNC', q: { prompt: 'Tomas, reading over your shoulder: "It says my kitchen port is administratively down. Did I break it with the flour?"', opts: ['No. Router ports start shut down until someone types no shutdown', 'Yes. The flour blocked the port', 'No. It means the cable is the wrong kind', 'No. It means the address is wrong'], a: 0,
          yes: 'Cider: "No. Nobody has turned it on yet."', no: 'Cider: "No. On a router, every port is administratively down until someone types no shutdown."',
          why: 'Cider: Cisco router interfaces are administratively down by default. The Status column of show ip interface brief shows administratively down until no shutdown is entered in interface configuration mode. Cisco switch interfaces are not shut down by default.' } }
      ] },
    // ------------------------------------------------------------ night 10 · the IPv4 header
    { id: 'n10-the-tab', title: 'Reading the tab', sub: 'the IPv4 header, TTL and fragments', npc: 'cider', day: [10], src: [PS('IPv4_Header.md')], unlocks: ['ipv4-header'],
      beats: [
        { k: 'SCENE', where: 'Cider\'s bar · closing time',
          lines: [
            { who: 'narr', text: 'The chairs are up on the tables and the floor smells of bleach and spilled cider. The receipt printer behind the bar chatters out a long curl of paper, and Cider tears it off and lays it along the counter, weighed down at each end with a glass. Tomas from the bakery sits on the one stool still down, flour in his eyebrows.' },
            { who: 'Tomas', text: 'The mill across the river takes my flour order every night at eleven. For three nights it hasn\'t arrived, and the mill swears they never saw it.' },
            { who: 'cider', text: 'I had the router print one of your packets. Every packet carries a header in front of its data, and I read a header the way I read a bar tab, line by line, and every line has a fixed number of bits.' },
            { who: 'cider', text: 'The first four bits are the Version, 4 for IPv4. The next four are the [[IHL]], the header length, counted in four-byte words: 5 means the smallest header, 20 bytes, and 15 means the largest, 60 bytes. Then six bits of [[DSCP]], which says how urgent the packet is, and two bits of [[ECN]], which lets the network warn the two ends about congestion without dropping anything.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What comes after that?', reply: 'Cider: "Sixteen bits of Total Length, the whole packet, header and data, from 20 bytes to 65,535. Then the fragment lines, then TTL, then Protocol, which says what\'s inside: 1 is ICMP, 6 is TCP, 17 is UDP, 89 is OSPF. Then a 16-bit header checksum, and the source and destination addresses, 32 bits each. Options can add up to 40 bytes at the end, and usually add nothing."' },
            { tone: 'press', say: 'Why is the header length counted in words instead of bytes?', reply: 'Cider: "Because the field is only four bits, so it can only count to 15. Fifteen bytes wouldn\'t hold even the smallest header, and fifteen four-byte words is 60 bytes, which is enough for the biggest header anyone is allowed to write."' },
            { tone: 'care', say: 'Tomas, what happens without the flour?', reply: 'Tomas: "Tomorrow I bake half a batch. The day after, I bake none." Cider pours him a glass without asking whether he wants one.' }
          ] } },
        { k: 'SCENE', where: 'Cider\'s bar · the tab on the counter',
          lines: [
            { who: 'cider', text: 'Here\'s your trouble. The [[TTL]], time to live, is eight bits. The sender sets it, 64 is the recommended starting value, and every router that forwards the packet takes one off. A router that brings it to zero drops the packet and sends an ICMP time exceeded message back to the sender.' },
            { who: 'cider', text: 'On your packet the TTL had fallen by one at every hop between the same two routers, back and forth, the bakery\'s router and mine, until it ran out. Somebody told each router that the mill is behind the other one. Without the TTL, that packet would still be going round.' },
            { who: 'cider', text: 'The other lines on the tab are for packets that are too big. Every link has an [[MTU]], the biggest packet it carries, usually 1500 bytes. A bigger packet gets cut into [[fragment]]s. They all carry the same Identification number, the Fragment Offset says where each piece goes, and the three Flags bits say the rest: the first is reserved and always 0, [[DF]] means don\'t fragment, and [[MF]] means more fragments follow.' },
            { who: 'Tomas', text: 'Can you stop the loop tonight?' },
            { who: 'cider', text: 'I can take the wrong route out of my router. Nexthop drives the roads between districts, and he\'ll want to know who typed it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How would I see the loop myself?', reply: 'Cider: "tracert from Tomas\'s till. It sends packets with a TTL of 1, then 2, then 3, and every router that drops one tells you its address. In a loop you see the same two addresses taking turns all the way to hop thirty."' },
            { tone: 'press', say: 'What stops a fragment arriving before the others?', reply: 'Cider: "Nothing, and that\'s fine. The receiver holds the pieces until it has them all, puts them in order by the offset, and knows it has the last one because its MF bit is 0. An unfragmented packet has MF set to 0 as well."' },
            { tone: 'quiet', say: '(Run a finger down the TTL column of the tab.)', reply: 'The numbers fall one at a time, 63, 62, 61, the same two router addresses alternating beside them, down to a row where the TTL reads 1 and the next row is blank.' }
          ] } },
        { k: 'LORE', title: 'THE TTL TRICK', year: 1987, vibe: 'Bodacious. Send a packet out to die one hop further each time and write down who reports it.',
          text: 'Cider, rolling up the tab: "In 1987 Van Jacobson, at the Lawrence Berkeley lab, wrote a little program called traceroute. He had worked out that if you send a packet with a TTL of 1, the first router kills it and tells you its name, and with a TTL of 2 the second one does. Nobody built a way to map the path; he borrowed the field that was there to kill loops. I still use it every week."' },
        { k: 'KIT', text: 'Cider writes the tab\'s layout on the back of a menu.', kit: [
          { cmd: 'Version 4 · IHL 4 · DSCP 6 · ECN 2 · Total Length 16 (bits)', what: 'IHL counts 4-byte words: 5 = 20 B minimum, 15 = 60 B maximum' },
          { cmd: 'Identification 16 · Flags 3 (0, DF, MF) · Fragment Offset 13', what: 'fragments of one packet share an ID. MTU usually 1500 B' },
          { cmd: 'TTL 8 · Protocol 8 (1 ICMP · 6 TCP · 17 UDP · 89 OSPF) · Header Checksum 16', what: 'TTL: start 64, minus 1 per router, dropped at 0' },
          { cmd: 'Source 32 · Destination 32 · Options 0–320 bits (0–40 B)', what: 'the addresses, then anything extra' },
          { cmd: 'tracert 10.10.0.5 (PC) · traceroute (Cisco)', what: 'uses TTL 1, 2, 3 ... to list each router on the path' } ] },
        { k: 'SYNC', q: { prompt: 'Tomas, watching Cider roll the tab up: "So what finally stopped my order going round and round?"', opts: ['The TTL reached 0 and a router dropped it', 'The checksum failed', 'The MTU was too small', 'The DF bit was set'], a: 0,
          yes: 'Cider: "The TTL. It\'s the only line on the tab that counts down."', no: 'Cider: "The TTL ran out. Every router took one off, and the one that reached zero dropped it."',
          why: 'Cider: Each router that forwards a packet decreases its TTL by 1. When a router decreases it to 0, it drops the packet and sends an ICMP time exceeded message to the source. That is what ends a routing loop. The checksum, MTU and DF bit have nothing to do with loops.' } }
      ] },
    // ------------------------------------------------------------ night 13 · subnetting, part 1
    { id: 'n13-three-shops', title: 'One block, three shops', sub: 'CIDR, masks from /25 to /32, cutting a /24', npc: 'cider', day: [13], src: [PS('Subnetting_Part1.md')], unlocks: ['subnetting'],
      beats: [
        { k: 'SCENE', where: 'Cider\'s bar · the back room · an afternoon',
          lines: [
            { who: 'narr', text: 'In daylight the back room smells of cardboard and the vinegar Cider cleans the taps with. A roll of floor plan is pinned flat on a trestle table under two bottles, showing the empty building across the street divided into three units in blue pencil: a tattoo studio, a pharmacy and a phone repair shop.' },
            { who: 'cider', text: 'The landlord has one /24 for the whole building, 192.168.13.0/24, and three tenants who each want their own network. Nobody gets the whole block. I cut it.' },
            { who: 'cider', text: 'Cutting is borrowing. Every bit I take from the host part and give to the network part doubles the number of pieces and halves the size of each one. Borrow one bit from a /24 and you get a /25: two [[subnet]]s of 128 addresses, 126 hosts each. Borrow two and you get a /26: four subnets of 64, 62 hosts each.' },
            { who: 'cider', text: 'Three tenants, so one bit isn\'t enough and two gives me four pieces. Each shop gets a /26 and the fourth one sits in the drawer for whoever moves in next.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I write the masks for those?', reply: 'Cider: "The last octet fills up from the left, one bit at a time. /25 is 255.255.255.128, /26 is .192, /27 is .224, /28 is .240, /29 is .248, /30 is .252, /31 is .254 and /32 is .255. Say them until you stop having to think."' },
            { tone: 'press', say: 'Where does each /26 start?', reply: 'Cider: "Take the value of the last bit you borrowed. For a /26 that\'s 64, the block size, and it\'s also 256 minus 192. The subnets start at .0, .64, .128 and .192. Each one\'s broadcast is one below the next one\'s start: .63, .127, .191, .255."' },
            { tone: 'joke', say: 'Can the tattoo studio have the pretty numbers?', reply: 'Cider: "The tattoo studio gets the first one because it signed first. If they want pretty numbers, they can ink them."' }
          ] } },
        { k: 'SCENE', where: 'The back room · the trestle table',
          lines: [
            { who: 'cider', text: 'This way of cutting is [[CIDR]], classless inter-domain routing. The classes said a 192 address was a /24 and nothing else. CIDR says the prefix length is whatever you write after the slash, and routers believe you.' },
            { who: 'cider', text: 'The router joining the three shops gets the first usable address in each piece: .1, .65 and .129, each with a /26 mask. The hosts in each shop use that address as their gateway.' },
            { who: 'cider', text: 'Between two routers you only ever need two addresses, one for each end, so there\'s no point giving a [[point-to-point]] link a /24. A /30 gives four addresses and two usable. A /31 gives two and both are usable, because a link with only two ends has no use for a network or broadcast address. Cisco routers take a /31 on a point-to-point link.' },
            { who: 'narr', text: 'She draws a thin blue line from the building across the street to her own bar on the plan, and writes /30 next to it.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s a /32 for?', reply: 'Cider: "One address and nothing else. You\'ve seen them in the routing table already as the local routes, the router\'s own address on each port. You\'ll also see them on loopbacks and in lists that match one single host."' },
            { tone: 'press', say: 'Isn\'t leaving a /26 in the drawer a waste?', reply: 'Cider: "It\'s a spare, which is different. When the fourth unit gets a tenant, I don\'t have to renumber the other three to make room. The waste is giving a two-address link sixty-two hosts it will never use."' },
            { tone: 'care', say: 'Who owns the building?', reply: 'Cider: "An old woman who has turned down Halvorsen twice. She wants people in there who sell things the street needs. I cut her block carefully because she\'s one of the few who asks."' }
          ] } },
        { k: 'LORE', title: 'THE KNIFE IN THE MASK', year: 1985, real: ['ietf'], vibe: 'Radical. Cut your class B into pieces, and nobody downtown ever has to hear about it.',
          text: 'Cider, rolling up the plan: "In August 1985, RFC 950 set out how to cut a network into subnets with a mask. Jeffrey Mogul and Jon Postel wrote it. Before that a university with one class B had one enormous flat network, or begged for more. After it, they took the knife to their own block, and the rest of the internet only ever saw the one route. My grandmother learned it from a photocopy."' },
        { k: 'KIT', text: 'Cider writes the ladder on a beer mat.', kit: [
          { cmd: '/25 .128 · /26 .192 · /27 .224 · /28 .240 · /29 .248 · /30 .252 · /31 .254 · /32 .255', what: 'the mask ladder' },
          { cmd: 'subnets = 2^borrowed bits · hosts = 2^host bits − 2', what: 'borrowing doubles the pieces and halves each one' },
          { cmd: 'block size = 256 − mask octet', what: '/26: 64 · subnets start .0 .64 .128 .192' },
          { cmd: 'gateway: first usable · broadcast: one below the next subnet', what: 'network and broadcast never go to a host' },
          { cmd: 'point-to-point: /30 (2 usable) or /31 (both usable)', what: 'don\'t spend a /24 on two ends' } ] },
        { k: 'SYNC', q: { prompt: 'The pharmacist, reading the plan upside down: "We\'re the second /26. What\'s our broadcast address?"', opts: ['192.168.13.127', '192.168.13.128', '192.168.13.63', '192.168.13.64'], a: 0,
          yes: 'Cider: "One-two-seven. The next subnet starts at .128."', no: 'Cider: "The second /26 runs .64 to .127, so .127."',
          why: 'Cider: A /26 has a block size of 64, so the subnets of 192.168.13.0/24 are .0, .64, .128 and .192. The second one runs from 192.168.13.64, its network address, to 192.168.13.127, its broadcast address, one below the start of the next subnet.' } }
      ] },
  ] });
})();
