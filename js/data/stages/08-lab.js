/* District 08 · The Lab — nights 52–63: LAN and WAN architectures, virtualisation, wireless, automation.
   Prof. Hypervisor's basement under the college, Beacon's station, Jason's desk and Ansible's bench. Act IV · OPENING NIGHT.
   Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'lab', arc: 'grid', title: 'STAGE 8 · THE LAB', sub: 'architectures, wireless, automation', npc: 'hypervisor', status: 'live', levels: [
    // ------------------------------------------------------------ night 52 · LAN architectures
    { id: 'n52-the-blueprint', title: 'Halvorsen\'s blueprint', sub: 'LAN architectures', npc: 'hypervisor', day: [52], src: [PS('LAN_Architectures.md')], unlocks: ['lan-arch'],
      beats: [
        { k: 'SCENE', where: 'The Lab · under the college · a quarter past ten at night',
          lines: [
            { who: 'narr', text: 'Warm air comes up the basement stairs to meet you, dry and faintly sweet with dust cooking on circuit boards. The Lab under the college is one long room of racks humming on a single low note, and a black cat is asleep on top of the warmest of them. At a workbench under the strip lights, a woman in a lab coat, grey hair pinned up with a pencil, holds a sheet of blueprint paper flat with four coffee mugs.' },
            { who: 'hypervisor', text: 'Oh good, Dispatch sent you. Come round this side, the light\'s better. The council filed Halvorsen\'s bid for the Watson Exchange this afternoon, and this is their drawing of the network they\'d put in it.' },
            { who: 'narr', text: 'A thin man in a council jacket sits on a stool by the door with a ledger open on his knees and a pen already moving.' },
            { who: 'Clerk Adebayo', text: 'Clerk Adebayo, district council. Every bid is public until Opening Night, and the council has asked the college to read this one for the record. I write down what is said.' },
            { who: 'hypervisor', text: 'Then write this down. Every desk in every building plugs into a small switch on its own floor, which is the [[access layer]]. The floor switches run up to a pair of bigger switches for each building, the [[distribution layer]]. And every building\'s pair runs to two big switches in the Exchange, the [[core layer]]. It\'s the [[three-tier architecture]], and as a drawing there\'s nothing wrong with it.' },
            { who: 'you', text: 'Then what\'s the catch?' },
            { who: 'hypervisor', text: 'Who owns the middle. In this drawing Halvorsen owns the core, so every building in Watson reaches every other building through their two switches, and they bill for every head that crosses.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does each layer do all day?', reply: 'Prof. Hypervisor: "The access layer is where the end hosts plug in, so it\'s where the phones get power over the cable, PoE, where traffic gets its QoS marks, and where port security lives. The distribution layer gathers the access switches together, which is why some people call it the aggregation layer, and it\'s usually where Layer 2 stops and routing starts. The core joins the distribution blocks to each other and does nothing else, as fast as it can."' },
            { tone: 'press', say: 'Does a building like the clinic need three layers?', reply: 'Prof. Hypervisor: "No. A building that size folds the core into its distribution switches, and that\'s a [[two-tier architecture]], which people also call a [[collapsed core]]. You only split the core out when there are so many distribution blocks that cabling every pair of them together gets silly."' },
            { tone: 'care', say: 'Did Old Root ever draw one of these?', reply: 'Prof. Hypervisor: "On a napkin at Marrow\'s, the winter they rewired the clinic. Two distribution switches, a row of access switches under them and no core at all, because the clinic never needed one. That napkin is still the clinic\'s network."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · the back row', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'She leads you past her own racks to a row at the back, where the air is warmer still and the fans pitch higher. Each rack has one switch at the very top, and from every one of them two thick cables climb into a tray overhead and run to a pair of switches at the end of the row.' },
            { who: 'hypervisor', text: 'This row is where my little instances live. Each rack has a leaf switch on top, and every leaf is cabled to both spine switches at the end. A leaf never connects to another leaf, a spine never connects to another spine, and the servers only ever plug into leaves. That\'s [[spine-leaf]].' },
            { who: 'hypervisor', text: 'In a data centre most traffic goes from one server to another inside the room, which people call [[east-west traffic]]. On this row any server reaches any other through a leaf, a spine and another leaf, the same number of hops every time.' },
            { who: 'hypervisor', text: 'Halvorsen\'s data centre downtown is this row copied a few hundred times, down to the model of switch. I bought these four out of their skip the year they upgraded.' },
            { who: 'you', text: 'And what would you put in the Exchange?' },
            { who: 'hypervisor', text: 'Something that keeps the street\'s buildings talking when a cable dies. But the clinic\'s own two distribution switches are arguing tonight, and Imani rang an hour ago. The charting floor is slow to open every record.' },
            { who: 'hypervisor', text: 'My guess is that one of the pair is the spanning tree [[root bridge]] for the charting VLAN and the other is the HSRP active gateway for it, so every frame crosses from one to the other before it gets anywhere. For each VLAN, the root bridge and the active gateway should be the same box.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why cable every leaf to every spine?', reply: 'Prof. Hypervisor: "Because it makes growing easy. If the room needs more bandwidth, you add a spine and cable every leaf to it. If it needs more ports, you add a leaf and cable it to every spine. Nothing else moves, and every path stays the same length."' },
            { tone: 'press', say: 'Why not cable everything to everything?', reply: 'Prof. Hypervisor: "That\'s a [[full mesh]], every device joined to every other device, and the cable count climbs fast: ten switches need forty-five links. Most real networks are a [[partial mesh]], with some devices joined to each other and some not. Every access switch cabled only to one switch above it would be a [[star topology]], one device in the middle and the rest around it."' },
            { tone: 'joke', say: 'Does the cat have a network of her own?', reply: 'She scratches the cat behind one ear. "She shares my flat upstairs, and it has one small box doing the routing, the switching, the Wi-Fi and the firewall all at once. That\'s a [[SOHO]] network, small office and home office, and the box is usually just called a home router or a wireless router."' }
          ] } },
        { k: 'LORE', title: 'NO CALL EVER WAITS', year: 1953, real: ['belllabs'], vibe: 'The most. A telephone exchange where nobody ever hears the busy tone.',
          text: 'Prof. Hypervisor, feeding the cat a biscuit: "In March 1953 an engineer at Bell Labs called Charles Clos published a paper in the Bell System Technical Journal on building telephone exchanges out of stages of small switches, wired so that a call never had to wait for a free path. Fifty-odd years later the people building data centres needed exactly the same thing, and spine-leaf is a Clos network folded in half. I keep this one because the Watson Exchange was a telephone exchange before it ever held an Ethernet cable."' },
        { k: 'KIT', text: 'She writes on the back of a council form while Clerk Adebayo politely looks away.', kit: [
          { cmd: 'access · distribution · core', what: 'three-tier. Access: end hosts, PoE, QoS marking, port security. Distribution: gathers the access switches, the Layer 2/Layer 3 border (the aggregation layer). Core: joins distribution blocks, fast' },
          { cmd: 'two-tier = collapsed core', what: 'access and distribution only. The core\'s job is folded into the distribution pair' },
          { cmd: 'spine-leaf', what: 'every leaf to every spine. Never leaf to leaf or spine to spine. Hosts plug into leaves. Built for east-west traffic' },
          { cmd: 'star · full mesh · partial mesh', what: 'one in the middle · everyone to everyone · some to some' },
          { cmd: 'SOHO', what: 'small office/home office. One home router or wireless router does everything' },
          { cmd: 'spanning-tree vlan 10 root primary · standby 10 priority 110 · standby 10 preempt', what: 'on the same switch, so the root bridge and the HSRP active for a VLAN are one box' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo looks up from the ledger: "For the minutes. The clinic has its floor switches and two distribution switches, and nothing above them. What is that design called?"', opts: ['Two-tier, a collapsed core', 'Three-tier', 'Spine-leaf', 'A full mesh'], a: 0,
          yes: 'Prof. Hypervisor: "Two-tier. Collapsed core. Two words, Clerk."', no: 'Prof. Hypervisor: "Two-tier, a collapsed core. The core is folded into the distribution pair."',
          why: 'Prof. Hypervisor: With no separate core, the distribution switches also do the core\'s job of joining things together, so there are two tiers, access and distribution. That is also called a collapsed core. Three-tier adds a core layer, spine-leaf is a data centre design, and a full mesh joins every device to every other one.' } }
      ] },

    // ------------------------------------------------------------ night 53 · WAN architectures
    { id: 'n53-the-other-site', title: 'The line to Kabuki', sub: 'WAN architectures', npc: 'hypervisor', day: [53], src: [PS('WAN_Architectures.md')], unlocks: ['wan-arch'],
      beats: [
        { k: 'SCENE', where: 'The Lab · the workbench · early evening',
          lines: [
            { who: 'narr', text: 'The Lab smells of toner tonight. A printer by the stairs chatters out page after page, and the cat sits beside it batting at each sheet as it lands. Prof. Hypervisor has one letter pinned under her mug, printed on heavy paper with a phone company\'s crest at the top.' },
            { who: 'hypervisor', text: 'The clinic has an outpatient office in Kabuki, over the river, and the two sites are joined by a [[leased line]]. That\'s a private circuit the phone company rents out, one dedicated cable from one building to the other, and the clinic has paid for this one since before my hair went grey.' },
            { who: 'hypervisor', text: 'The phone company is switching it off at the end of the month. The last paragraph of the letter recommends Halvorsen\'s WAN service as a replacement.' },
            { who: 'you', text: 'How fast was the old line?' },
            { who: 'hypervisor', text: 'It\'s a T1, so 1.544 megabits a second. The European version, the E1, carries 2.048. The big ones, the T3 and E3, carry 44.736 and 34.368. A leased line is reliable and private, and for what it costs it\'s slow.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What is Halvorsen selling instead?', reply: 'Prof. Hypervisor: "[[MPLS]], Multiprotocol Label Switching. The clinic\'s router at each site would be a CE, a customer edge router, plugged into Halvorsen\'s PE, a provider edge router. Inside their network the P routers, the provider core, forward by labels instead of reading IP addresses. In a Layer 3 MPLS VPN the clinic\'s CE routers swap routes with Halvorsen\'s PE routers. In a Layer 2 MPLS VPN their whole network is invisible, and the two CEs peer with each other as if one cable joined them."' },
            { tone: 'press', say: 'Why not just use the internet?', reply: 'Prof. Hypervisor: "Nothing stops us. The internet reaches every building, over the phone line with [[DSL]], digital subscriber line, or over the TV cable, and either way a [[modem]], a modulator-demodulator, turns the data into a signal that wire can carry. The trouble is that the internet carries everything in the open, and it won\'t route a private address anywhere."' },
            { tone: 'quiet', say: '(Read the letter over her shoulder.)', reply: 'Under Halvorsen\'s monthly price per head is a count of the heads at the clinic. The count includes the patients. Prof. Hypervisor taps that line with the end of her pencil and says nothing.' }
          ] } },
        { k: 'SCENE', where: 'Kabuki · the clinic\'s outpatient office · the back room',
          lines: [
            { who: 'narr', text: 'The back room of the outpatient office is a cupboard with a window, warm from a radiator that will not turn off. On a shelf above the filing cabinet sit a small router and two modems, one on the phone line and one on the TV cable, and a fax machine that someone has labelled FOR WHEN THE LINE DROPS.' },
            { who: 'hypervisor', text: 'This office has one connection to one internet provider, which is [[single-homed]]. The main clinic has two connections to the same provider, which is dual-homed. One connection to each of two providers is multihomed, and two to each of two is dual multihomed, which is what the Exchange ought to have.' },
            { who: 'hypervisor', text: 'To join two sites across the internet you build a [[VPN]]. A site-to-site VPN joins two whole networks for good, router to router, and it usually runs on [[IPsec]]. A remote-access VPN is one laptop at a time, whenever it needs to connect, and that usually runs on [[TLS]], which used to be called SSL.' },
            { who: 'hypervisor', text: 'Tonight we build the plainest one there is, a [[GRE]] tunnel, Generic Routing Encapsulation. Each router wraps the clinic\'s private packet inside a new packet, addressed from its own public address to the other router\'s, so the internet only ever sees two public routers talking. GRE doesn\'t encrypt anything, but it carries broadcasts and multicasts, which IPsec on its own won\'t, so OSPF can run through it. That\'s why people put GRE inside IPsec.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does each end of the tunnel need?', reply: 'Prof. Hypervisor: "An interface tunnel 0 with an address from a small private subnet both ends share, a /30 is plenty. Then tunnel source, the router\'s own public interface, and tunnel destination, the other router\'s public address. The two ends mirror each other. If either one points at the wrong address, neither comes up."' },
            { tone: 'press', say: 'And if the clinic had twenty offices?', reply: 'Prof. Hypervisor: "Then a tunnel for every pair by hand would take all week. Cisco\'s answer is [[DMVPN]], Dynamic Multipoint VPN. You configure the hub, and the spokes build IPsec tunnels to each other as they need them, so you get a full mesh without configuring every tunnel."' },
            { tone: 'joke', say: 'So the internet carries our parcel inside someone else\'s box.', reply: 'Prof. Hypervisor: "Osi would put it exactly that way. The GRE packet carries the whole original packet as its payload, with a GRE header and a new IP header in front. The original header rides inside untouched, private addresses and all, so every packet gets a little bigger."' }
          ] } },
        { k: 'LORE', title: 'A PACKET IN A PACKET', year: 1994, real: ['ietf', 'cisco'], vibe: 'All that and a bag of chips. One protocol wearing another as a coat.',
          text: 'Prof. Hypervisor, coiling a patch cable around her hand: "In October 1994 the IETF published RFC 1701, Generic Routing Encapsulation, written by Stan Hanks with three engineers from Cisco, Tony Li, Dino Farinacci and Paul Traina. It was meant to carry any protocol inside any other, back when networks still spoke half a dozen languages. I keep it because it\'s the oldest trick in the building: if the road won\'t take your parcel, put it in a box the road will take."' },
        { k: 'KIT', text: 'She writes it on the back of the phone company\'s letter.', kit: [
          { cmd: 'T1 1.544 · E1 2.048 · T3 44.736 · E3 34.368 Mbps', what: 'leased lines. Dedicated, private, expensive' },
          { cmd: 'MPLS: CE · PE · P', what: 'customer edge, provider edge, provider core. Layer 3 VPN: CE peers with PE. Layer 2 VPN: the provider is invisible and the CEs peer with each other' },
          { cmd: 'DSL (phone line) · cable (TV line) · modem', what: 'internet to the building' },
          { cmd: 'single-homed · dual-homed · multihomed · dual multihomed', what: '1 link to 1 ISP · 2 to 1 · 1 to each of 2 · 2 to each of 2' },
          { cmd: 'site-to-site = IPsec · remote-access = TLS', what: 'permanent between networks · on demand for one device' },
          { cmd: 'interface tunnel 0 · ip address · tunnel source · tunnel destination', what: 'GRE. No encryption, carries broadcast and multicast. GRE over IPsec for both. DMVPN for many sites' } ] },
        { k: 'SYNC', q: { prompt: 'The office\'s receptionist has read Halvorsen\'s letter twice: "In their Layer 3 MPLS VPN, whose router would ours share routes with?"', opts: ['Halvorsen\'s provider edge router, the PE', 'The main clinic\'s router, directly', 'Halvorsen\'s P routers in the middle', 'Nobody. MPLS has no routing'], a: 0,
          yes: 'Prof. Hypervisor: "Their PE. Which means Halvorsen would know every route the clinic has."', no: 'Prof. Hypervisor: "Their PE, the provider edge. In a Layer 3 MPLS VPN the customer\'s router peers with the provider\'s edge."',
          why: 'Prof. Hypervisor: In a Layer 3 MPLS VPN the customer edge router forms a routing peering with the provider edge router, and the provider carries the routes between sites. The P routers in the middle only switch labels. In a Layer 2 MPLS VPN the provider is invisible and the two customer routers peer with each other.' } }
      ] }
  ] });
})();
