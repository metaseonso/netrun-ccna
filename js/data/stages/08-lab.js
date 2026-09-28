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
      ] },

    // ------------------------------------------------------------ night 54 · virtualisation, cloud, containers and VRF
    { id: 'n54-little-instances', title: 'Machines inside machines', sub: 'virtualisation, cloud, containers and VRF', npc: 'hypervisor', day: [54], src: [PS('Virtualizations_and_Cloud_Part1.md'), PS('Virtualizations_and_Cloud_Part2.md')], unlocks: ['virtualization'],
      beats: [
        { k: 'SCENE', where: 'The Lab · the blade chassis · after midnight', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'The noise reaches you before the light does: a chassis of eight thin servers slotted in like books on a shelf, every fan at full howl. The air coming off the back of it is hot enough to dry your eyes. Prof. Hypervisor sits cross-legged on a packing crate in front of it with a laptop on her knees, and the cat is asleep in the open lid of a toolbox.' },
            { who: 'hypervisor', text: 'This is a Cisco [[UCS]], a Unified Computing System, eight servers in one box. Each blade runs about forty of my little instances, and every one of them is a [[virtual machine]], a whole computer in software with its own operating system. The software sharing the hardware out among them is the [[hypervisor]], which the older books call a virtual machine monitor, a VMM.' },
            { who: 'you', text: 'Forty computers pretending to be one blade?' },
            { who: 'hypervisor', text: 'One blade pretending to be forty computers. These run a [[Type 1 hypervisor]], straight on the hardware with nothing underneath, which people call bare-metal or native. My laptop runs a [[Type 2 hypervisor]], a program on top of an ordinary operating system, which is called hosted. The laptop\'s own system is the host OS, and each system running inside the hypervisor is a guest OS.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why run forty machines on one blade?', reply: 'Prof. Hypervisor: "Because a server on its own spends most of the day doing nothing. Put forty on one blade and the idle time gets shared out, and a new server takes me a minute to make instead of a month to order. The clinic\'s records server has lived on that blade since the winter."' },
            { tone: 'press', say: 'Isn\'t that forty operating systems eating memory?', reply: 'Prof. Hypervisor: "It is, which is why people moved to [[container]]s. A container holds an app and everything the app needs to run, and no operating system at all. Every container on a host shares the host\'s own system, usually Linux, through a container engine such as Docker Engine. When you have hundreds of them, a container orchestrator like Kubernetes or Docker Swarm starts them, moves them and scales them."' },
            { tone: 'care', say: 'Is the clinic\'s data safe in there with everyone else\'s?', reply: 'Prof. Hypervisor: "Safer in a VM than it would be in a container. Each VM runs its own operating system, so a crash or a break-in next door has a wall to get through. Containers all share one system underneath, so they are less isolated from each other. They boot faster and take less disk, CPU and memory, but the records get a VM."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · the workbench', real: ['aws', 'gcp', 'microsoft'],
          lines: [
            { who: 'narr', text: 'Halvorsen\'s second brochure lies on the workbench, glossy enough to reflect the strip lights. On its cover a tower of glass floats above the words HALVORSEN CLOUD, and someone has drawn a small moustache on the tower in biro.' },
            { who: 'hypervisor', text: 'In 2011 NIST, the American standards institute, wrote down what a [[cloud]] has to be, and it\'s five things: on-demand self-service, broad network access, resource pooling, rapid elasticity and measured service. Halvorsen ticks all five. So does my basement, apart from the measured part, because I never send anyone a bill.' },
            { who: 'hypervisor', text: 'The trouble tonight is my router. The school\'s server moves in here tomorrow, next to the clinic\'s, and the school numbered its network 192.168.1.0/24, exactly like the clinic did. On an ordinary router two interfaces can\'t sit in the same subnet.' },
            { who: 'hypervisor', text: 'So we use [[VRF]], Virtual Routing and Forwarding. It splits one router into several routing tables that never see each other, one for the clinic and one for the school, and the same addresses can live in both.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'So what kind of cloud is the Lab?', reply: 'Prof. Hypervisor: "A [[community cloud]]: one set of machines shared by a group of organisations with the same concerns, the clinic, the school and the courier guild. Halvorsen\'s is a public cloud, open to anyone who pays. A rack the clinic owned for itself would be a private cloud, and a mix of two of those is a hybrid cloud."' },
            { tone: 'press', say: 'What can you put in a VRF?', reply: 'Prof. Hypervisor: "Only Layer 3 interfaces: router ports, subinterfaces, SVIs. You create one with ip vrf and a name, and put an interface in it with ip vrf forwarding and the name. That second command wipes the interface\'s IP address, so you type the address again afterwards. If two VRFs ever need to talk, VRF leaking lets chosen routes cross between them."' },
            { tone: 'quiet', say: '(Turn to the brochure\'s price list.)', reply: 'The price list has three columns. Prof. Hypervisor reads over your shoulder. "Software as a service, [[SaaS]]: you just use their program, like Microsoft Office 365. Platform as a service, [[PaaS]]: you bring your code and they run it, like AWS Lambda or Google App Engine. Infrastructure as a service, [[IaaS]]: you rent the virtual machines and install everything yourself, like Amazon EC2 or Google Compute Engine."' }
          ] } },
        { k: 'LORE', title: 'EVERYONE GETS A MACHINE', year: 1967, real: ['ibm', 'vmware', 'docker'], vibe: 'Out of sight. One mainframe, and every user swears it is theirs alone.',
          text: 'Prof. Hypervisor, lifting the cat off the keyboard: "In 1967 IBM\'s Cambridge Scientific Center put CP-40 into service on a modified System/360 Model 40. It gave each person at a keyboard a whole virtual machine of their own, up to fourteen at once, on one computer. VMware brought the same idea to ordinary PCs in 1999, and Docker handed containers to everyone in March 2013. I keep the first one because nobody using CP-40 could tell they were sharing, and that is still the whole trick."' },
        { k: 'KIT', text: 'She prints it on the back of a Halvorsen brochure and hands it over warm.', kit: [
          { cmd: 'Type 1 (bare-metal, native) · Type 2 (hosted)', what: 'on the hardware · a program on a host OS. The systems inside are guest OSes. Hypervisor = VMM' },
          { cmd: 'on-demand self-service · broad network access · resource pooling · rapid elasticity · measured service', what: 'NIST\'s five essential characteristics of cloud' },
          { cmd: 'SaaS (Office 365) · PaaS (AWS Lambda, Google App Engine) · IaaS (Amazon EC2, Google Compute Engine)', what: 'the three service models' },
          { cmd: 'private · community · public · hybrid', what: 'the four deployment models' },
          { cmd: 'container: app + dependencies, no OS · container engine (Docker Engine) on a host OS · orchestrator (Kubernetes, Docker Swarm)', what: 'faster to boot and lighter than a VM. A VM is more isolated and runs its own OS' },
          { cmd: 'ip vrf NAME · ip vrf forwarding NAME · show ip route vrf NAME · ping vrf NAME ADDRESS', what: 'separate routing tables on one router. Layer 3 interfaces only. Re-enter the IP after ip vrf forwarding. VRF leaking lets routes cross' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo reads from the brochure: "The clinic would rent virtual machines from Halvorsen and install its own software on them." He looks up. "Which service model is that?"', opts: ['IaaS', 'SaaS', 'PaaS', 'A community cloud'], a: 0,
          yes: 'Prof. Hypervisor: "Infrastructure as a service. The machines are theirs and everything on them is the clinic\'s problem."', no: 'Prof. Hypervisor: "IaaS. Renting the virtual machines themselves is infrastructure as a service."',
          why: 'Prof. Hypervisor: With IaaS the provider gives you virtual machines, storage and network, and you install and run everything on them. PaaS runs your code on a platform they manage, and SaaS is a finished program you just use. A community cloud is a deployment model, not a service model.' } }
      ] },

    // ------------------------------------------------------------ night 55 · wireless fundamentals
    { id: 'n55-channel-six', title: 'Channel six', sub: 'wireless fundamentals', npc: 'beacon', day: [55], src: [PS('Wireless_Fundamentals.md')], unlocks: ['wifi-basics'],
      beats: [
        { k: 'SCENE', where: 'The college roof · Beacon\'s station · half past one in the morning', real: ['ieee'],
          lines: [
            { who: 'narr', text: 'Cold wind and the smell of tar paper, and under it the hot-dust smell of old valve amplifiers. Beacon\'s station is a weather hut on the college roof with a whip antenna bolted to the chimney, and through its open door comes a bassline loud enough to feel in your teeth. Inside, a woman with pink spiked hair and an antenna clipped to her headband slides a fader down, leans into the microphone and tells half of Watson to stay put.' },
            { who: 'beacon', text: 'Back in four minutes, Watson. Don\'t touch that dial. You! Dispatch said you\'d come. Sit on the crate, the chair bites.' },
            { who: 'beacon', text: 'The clinic\'s new wing went up across the street, and the builders hung three wireless access points in its corridor, all on channel 6. My channel 6. My listeners on the stream have been dropping out since Tuesday.' },
            { who: 'beacon', text: 'Wi-Fi is [[802.11]], the IEEE\'s standard for wireless LANs, and the [[Wi-Fi Alliance]] tests the kit and puts its sticker on the box when it plays nicely with everyone else\'s. Radio is one shared room. Only one voice on a channel at a time, so wireless is always half-duplex, and nobody can hear a collision while they\'re talking. So every radio listens first, waits for quiet, and then talks. That\'s [[CSMA/CA]], carrier sense multiple access with collision avoidance.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What actually is a channel?', reply: 'Beacon: "A slice of frequency. A radio wave goes up and down, and how many times a second it does that is its [[frequency]], counted in hertz. A thousand is kilohertz, a million megahertz, a billion gigahertz, a trillion terahertz. How long one up-and-down takes is the [[period]], and how tall the wave is, the strength of it, is the [[amplitude]]. Wi-Fi lives in two main bands, 2.4 gigahertz and 5, and each band is cut into channels."' },
            { tone: 'press', say: 'Why do the walls kill the signal?', reply: 'Beacon: "Walls do five things to it. Concrete and water soak it up and turn it into heat, which is [[absorption]]. Metal bounces it, which is reflection. Glass or water bends it as it goes through, because the wave changes speed there, which is refraction. A pillar makes it wrap round the edge, which is diffraction, and a rough surface like a mesh fence throws it every which way, which is scattering. The new wing has all five in one corridor."' },
            { tone: 'joke', say: 'Did you pick channel 6 because it\'s in the middle?', reply: 'Beacon: "I picked it when I was twelve because 6 is the best number. Then I found out I was right. On 2.4 gigahertz the channels are so close together that they overlap, and only 1, 6 and 11 stay clear of each other. Everything else stamps on its neighbours."' }
          ] } },
        { k: 'SCENE', where: 'Beacon\'s station · the window facing the clinic',
          lines: [
            { who: 'narr', text: 'From the hut\'s grimy window you can see the clinic\'s new wing across the street, its corridor lights on and its rooms still dark. Beacon sets a scanner on the sill, and its screen fills with names stacked on top of each other: three of them are all called WING-TEMP, and all three sit on channel 6.' },
            { who: 'beacon', text: 'Each name on there is an [[SSID]], a service set identifier, the network\'s name as a human reads it. It doesn\'t have to be unique. Those three are one network, three APs sharing one SSID so a laptop can walk down the corridor and hop from one to the next, which is [[roaming]].' },
            { who: 'beacon', text: 'One AP and the clients joined to it is a [[BSS]], a basic service set. The clients are called stations, and they never talk to each other directly. Everything goes through the AP. The AP\'s radio has its own MAC address, the BSSID, and the patch of ground where you can hear it is the basic service area. Several BSSes with the same SSID joined by the wired network, which 802.11 calls the distribution system, make an [[ESS]], an extended service set.' },
            { who: 'beacon', text: 'The 2.4 band reaches further and gets through walls better, but it only has three clean channels. The 5 band has lots of channels that don\'t overlap, and it doesn\'t travel as far. For a clinic, put the important kit on 5 and use 2.4 for whatever can\'t.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which standards use which band?', reply: 'Beacon: "The first 802.11 did 2 megabits on 2.4. Then b, 11 megabits on 2.4, and a, 54 on 5. Then g, 54 on 2.4 again. n does up to 600 on both bands, and that\'s Wi-Fi 4. ac does 6.93 gigabits on 5 only, which is Wi-Fi 5. ax is Wi-Fi 6, about four times ac, on 2.4, 5 and 6 gigahertz."' },
            { tone: 'press', say: 'What if there\'s no AP at all?', reply: 'Beacon: "Then two laptops talk straight to each other in an [[IBSS]], an independent basic service set, what people call ad hoc. Or there\'s a mesh, an MBSS, where APs link to each other by radio and only the root AP, the RAP, is wired in. The others are mesh APs. An AP can also be a repeater to stretch a BSS, a workgroup bridge that joins a wired box to Wi-Fi, or an outdoor bridge between two buildings with no cable."' },
            { tone: 'care', say: 'Are your listeners still out there?', reply: 'Beacon looks at the stream counter and her shoulders drop an inch. "Four hundred and twelve, and half of them buffering. The night nurses listen on the ward, you know. Somebody over there has a radio on right now, and it\'s stuttering."' }
          ] } },
        { k: 'LORE', title: 'ISLANDS TALKING', year: 1971, vibe: 'Right on. Packets on the radio, hopping between islands.',
          text: 'Beacon, between records: "June 1971, the University of Hawaii. Norman Abramson\'s team switches on ALOHAnet, computers on different islands sending packets to each other by radio with no cables at all. Anyone could talk whenever they liked, and when two talked at once both packets were lost and both tried again later. Bob Metcalfe read about it and built Ethernet on the same idea. I keep it because every radio in Watson is still learning ALOHAnet\'s rule: if two talk at once, nobody hears either."' },
        { k: 'KIT', text: 'Beacon writes it on the back of a playlist in fat marker.', real: ['ieee'], kit: [
          { cmd: '802.11 · Wi-Fi Alliance · half-duplex · CSMA/CA', what: 'the standard · the certifier · one talker at a time · listen before talking' },
          { cmd: 'absorption · reflection · refraction · diffraction · scattering', what: 'turned to heat · bounced · bent · wrapped round · thrown everywhere' },
          { cmd: 'amplitude · frequency (Hz, kHz, MHz, GHz, THz) · period', what: 'height · cycles per second · time for one cycle' },
          { cmd: '2.4 GHz: further, overlapping, use 1 · 6 · 11 only · 5 GHz: non-overlapping', what: 'the two main bands' },
          { cmd: '802.11 2 Mbps 2.4 · b 11 2.4 · a 54 5 · g 54 2.4 · n 600 2.4/5 (Wi-Fi 4) · ac 6.93 Gbps 5 (Wi-Fi 5) · ax 4×ac 2.4/5/6 (Wi-Fi 6)', what: 'the standards' },
          { cmd: 'IBSS (ad hoc) · BSS (BSSID = AP radio MAC, BSA) · ESS (roaming) · MBSS (RAP, MAP)', what: 'service sets. Clients in a BSS talk through the AP. The wired side is the DS' } ] },
        { k: 'SYNC', q: { prompt: 'A listener rings the station\'s request line: "My laptop and my phone are both on the clinic\'s Wi-Fi. Do they talk straight to each other?"', opts: ['No. In a BSS every frame goes through the AP', 'Yes, if they are close enough', 'Only on 5 GHz', 'Only if they share a channel with the station'], a: 0,
          yes: 'Beacon, on air: "Through the AP, caller. Always through the AP."', no: 'Beacon, on air: "No, caller. In a BSS it all goes through the AP."',
          why: 'Beacon: In a basic service set the clients, the stations, never send to each other directly. Every frame goes to the AP and the AP passes it on. Only in an IBSS, an ad hoc network with no AP, do devices talk straight to each other.' } }
      ] },

    // ------------------------------------------------------------ night 56 · wireless architectures
    { id: 'n56-forty-rooms', title: 'Forty rooms, one controller', sub: 'wireless architectures', npc: 'beacon', day: [56], src: [PS('Wireless_Architectures.md')], unlocks: ['wifi-arch'],
      beats: [
        { k: 'SCENE', where: 'The clinic\'s new wing · the second-floor corridor · after midnight',
          lines: [
            { who: 'narr', text: 'The new wing smells of wet plaster and fresh paint, and every footstep rings off the bare floor. Half the ceiling tiles are out, and cable hangs down in loops like vines. Beacon stands on a stepladder in the middle of the corridor with a scanner in one hand, headphones round her neck, reading the air.' },
            { who: 'beacon', text: 'Listen to this. Every AP shouts its name about ten times a second in a [[beacon frame]], and I\'m legally obliged to find that funny. A phone that just waits and listens for those is doing passive scanning. A phone in a hurry sends a probe request, and every AP in earshot sends back a probe response. That\'s active scanning.' },
            { who: 'beacon', text: 'Then it joins, in three states: not authenticated and not associated, then authenticated but not associated, then authenticated and associated. Only in the last one does it get to send data.' },
            { who: 'beacon', text: '802.11 has three kinds of message. Management frames run the joining: beacons, probes, authentication, association requests and responses. Control frames keep the air polite: RTS, CTS and ACK. Data frames carry the actual traffic.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s inside one of those frames?', reply: 'Beacon: "A 2-byte Frame Control and a 2-byte Duration/ID first. Then up to four addresses, 6 bytes each, because a wireless frame can name the sender, the receiver, the AP and more. A 2-byte Sequence Control, a 2-byte QoS Control, a 4-byte HT Control, then the data, and a 4-byte FCS at the end to catch errors."' },
            { tone: 'press', say: 'Why four addresses when Ethernet manages with two?', reply: 'Beacon: "Because the frame crosses the air to the AP and then carries on somewhere else. The AP is neither the sender nor the final destination, but the frame has to name it, and on a wireless bridge the frame names both ends of the radio hop as well as the real sender and receiver."' },
            { tone: 'joke', say: 'So a beacon frame is basically you.', reply: 'Beacon: "Ten times a second, whether anyone asked or not. Except my beacons carry the SSID, the data rates and the security settings, and I carry opinions."' }
          ] } },
        { k: 'SCENE', where: 'The new wing · a nurses\' station with no nurses yet', real: ['cisco', 'wireshark'],
          lines: [
            { who: 'narr', text: 'Boxes of new access points are stacked on the counter of an empty nurses\' station, forty of them, still in their plastic. Clipped to the top box is a glossy leaflet from Halvorsen offering to run the whole wing\'s Wi-Fi from their cloud for a monthly fee.' },
            { who: 'beacon', text: 'There are three ways to run forty APs. [[Autonomous AP]]s each do everything themselves and get configured one by one, and they sit on trunk ports because each one maps its own SSIDs to VLANs. That\'s forty passwords to change, forty times.' },
            { who: 'beacon', text: 'Lightweight APs hand the thinking to a [[WLC]], a wireless LAN controller. The AP keeps the real-time radio work and the controller does the rest, which is why it\'s called [[split-MAC]]. Each lightweight AP builds two [[CAPWAP]] tunnels to the controller: control on UDP 5246, encrypted, and data on UDP 5247, not encrypted by default. Everything rides the tunnel, so a lightweight AP sits on an access port.' },
            { who: 'beacon', text: 'The third way is cloud-based, which is Halvorsen\'s leaflet. It sits between the other two: the APs are managed from a dashboard somewhere else, like Cisco Meraki, and the clients\' traffic stays in the building. The clinic would still own the APs and rent the brain for them.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Where does the controller live?', reply: 'Beacon: "Wherever you like. A unified WLC is a box of its own in a central place, good for about 6000 APs. A cloud-based WLC is a VM on a server, usually in a private cloud like the Lab, about 3000. An embedded WLC lives inside a switch, about 200, and Mobility Express runs inside an AP, about 100. The wing\'s forty would fit in any of them."' },
            { tone: 'press', say: 'What if the link to the controller dies?', reply: 'Beacon: "With FlexConnect the AP keeps switching its clients\' traffic locally when the tunnels to the WLC go down. That\'s one of the AP modes. Local is the default, serving clients. Sniffer captures frames for Wireshark. Monitor listens to the air for rogue devices, and rogue detector listens on the wire instead, with its radio off. SE-Connect analyses the spectrum on every channel, bridge or mesh links sites together, and Flex plus Bridge adds FlexConnect to that."' },
            { tone: 'care', say: 'Who\'ll look after it once it\'s running?', reply: 'Beacon: "Imani asked me that too. With a controller it\'s one login, one set of SSIDs and one place to change a key, so a night nurse with a laptop can see which AP is sulking. With Halvorsen it\'s a phone number and a queue."' }
          ] } },
        { k: 'LORE', title: 'TWO MEGABITS, NO CABLE', year: 1997, real: ['ieee'], vibe: 'Da bomb. A laptop on a network with no cable, at two whole megabits.',
          text: 'Beacon, sitting on the top step of the ladder: "In June 1997 the IEEE approved the first 802.11 standard, two megabits a second on 2.4 gigahertz. Vic Hayes chaired the committee that wrote it, and people still call him the father of Wi-Fi. My mum had a laptop card for it that stuck out of the side like a cracker. I keep this one because it was the first time the air in a room became part of the network."' },
        { k: 'KIT', text: 'Beacon writes it on the back of Halvorsen\'s leaflet and hands it to you.', real: ['cisco'], kit: [
          { cmd: 'Frame Control 2 · Duration/ID 2 · Address 1-4 6 each · Sequence Control 2 · QoS Control 2 · HT Control 4 · FCS 4', what: 'the 802.11 frame, in bytes' },
          { cmd: 'passive: listen for beacons · active: probe request, probe response', what: 'scanning' },
          { cmd: 'not auth, not assoc → auth, not assoc → auth and assoc', what: 'the three connection states' },
          { cmd: 'management (beacon, probe, auth, association) · control (RTS, CTS, ACK) · data', what: 'the three message types' },
          { cmd: 'autonomous (trunk port) · lightweight + WLC, split-MAC (access port) · cloud-based (Meraki)', what: 'the three AP architectures' },
          { cmd: 'CAPWAP control UDP 5246 (encrypted) · data UDP 5247 (not encrypted)', what: 'two tunnels from each lightweight AP to the WLC. LWAPP came before CAPWAP' },
          { cmd: 'local · FlexConnect · sniffer · monitor · rogue detector · SE-Connect · bridge/mesh · Flex plus Bridge', what: 'lightweight AP modes' },
          { cmd: 'unified ~6000 · cloud-based (VM) ~3000 · embedded (switch) ~200 · Mobility Express (AP) ~100', what: 'WLC deployments, APs supported' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, holding one of the boxed APs: "If we go with a controller, and the controller is built into the clinic\'s switch, what kind is that?"', opts: ['An embedded WLC', 'A unified WLC', 'A cloud-based WLC', 'Mobility Express'], a: 0,
          yes: 'Beacon: "Embedded. About two hundred APs, and you\'ve got forty."', no: 'Beacon: "Embedded. A WLC inside a switch is embedded."',
          why: 'Beacon: An embedded WLC is built into a switch and handles about 200 APs. A unified WLC is a separate hardware appliance (about 6000), a cloud-based WLC is a VM on a server (about 3000), and Mobility Express runs inside an AP (about 100).' } }
      ] },

    // ------------------------------------------------------------ night 57 · wireless security
    { id: 'n57-weak-keys', title: 'The door nobody tried', sub: 'wireless security', npc: 'beacon', day: [57], src: [PS('Wireless_Security.md')], unlocks: ['wifi-security'],
      beats: [
        { k: 'SCENE', where: 'The clinic\'s new wing · the ground-floor lobby · two in the morning',
          lines: [
            { who: 'narr', text: 'Rain drums on the lobby\'s new glass roof, and the air smells of wet concrete and dog. Ace Elle sits on an unopened crate of chairs with a laptop on her knees, and Sticky lies across her boots, watching the door. Beacon leans on the reception desk beside her, scanner in hand, unusually quiet.' },
            { who: 'ace', text: 'Every test on this district came in through a cable. The rogue switch, the rogue DHCP server, the ARP spoof. Nobody tried the air. Before Opening Night I want that door shut too.' },
            { who: 'beacon', text: 'And the builders\' network is still up. WING-TEMP. Tell them what it\'s running, Ace.' },
            { who: 'ace', text: '[[WEP]], Wired Equivalent Privacy, on kit older than Sticky. I recovered its key from this crate in eleven minutes, just by listening. Wireless security is three jobs: authentication, which proves who is joining, encryption, which keeps the frames private, and integrity, which proves nobody changed them on the way. WEP does all three badly.' },
            { who: 'ace', text: 'The fix is [[WPA2]] or [[WPA3]]. Each comes in two modes. Personal mode uses one pre-shared key, a PSK, the passphrase everybody types. Enterprise mode uses [[802.1X]] with EAP, so every nurse logs in as herself.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why is WEP so easy to break?', reply: 'Ace: "It encrypts with RC4 using a key of 40 bits or 104 bits, plus a 24-bit initialisation vector sent in the open, which makes 64 or 128. Twenty-four bits of IV repeats fast on a busy network, and every repeat leaks a little of the key. Collect enough frames and the key falls out."' },
            { tone: 'press', say: 'What about networks with no key at all?', reply: 'Ace: "[[Open authentication]] accepts every request to join. No password, nothing. Cafés use it with a web page afterwards. On a clinic network it means anyone in the street can associate."' },
            { tone: 'care', say: '(Crouch down and let Sticky smell your hand.)', reply: 'Sticky sniffs, considers you for a long moment, and settles back across Ace\'s boots. "Faces on ports," Ace says. "That\'s what the dog remembers. The ones in the air don\'t have a smell."' }
          ] } },
        { k: 'SCENE', where: 'The new wing · the lobby · the rain easing',
          lines: [
            { who: 'beacon', text: 'Enterprise mode has three players. The [[supplicant]] is the device that wants on, a nurse\'s tablet. The authenticator is the thing that lets it on or doesn\'t, the AP or the WLC. The authentication server, the AS, checks the credentials and says yes or no, usually a RADIUS server, and ours lives in the Lab.' },
            { who: 'ace', text: 'They speak [[EAP]], the Extensible Authentication Protocol, and there are four kinds you\'ll meet. LEAP is Cisco\'s old one: challenge phrases both ways and dynamic WEP keys, so it\'s dead. EAP-FAST passes the client a PAC, a protected access credential, builds a TLS tunnel with it, and authenticates the client inside the tunnel. PEAP needs a certificate on the server only, and the client logs in inside the tunnel, often with MS-CHAP. EAP-TLS needs certificates on both the server and every client.' },
            { who: 'beacon', text: 'Then the encryption. WPA used [[TKIP]], built to fix WEP on the same old hardware. WPA2 uses [[CCMP]], AES in counter mode with CBC-MAC as its message integrity check, its MIC. WPA3 uses [[GCMP]], AES counter mode with GMAC. The AP also holds a group key for frames it sends to all its clients at once.' },
            { who: 'ace', text: 'WPA3 personal adds SAE, simultaneous authentication of equals, which protects the four-way handshake, so nobody can grab it and guess the passphrase at home. And it has forward secrecy: steal the key next year and tonight\'s traffic still can\'t be decrypted.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which EAP type should the clinic use?', reply: 'Ace: "EAP-TLS for staff, if the clinic will look after a certificate on every tablet. It\'s the strongest because both ends prove who they are with certificates. PEAP if it won\'t: the server proves itself with its certificate, and the nurse proves herself with a password inside the tunnel."' },
            { tone: 'press', say: 'Isn\'t one passphrase for everyone good enough?', reply: 'Beacon: "For the guests in reception, fine, WPA3 personal with a long one. For staff, no. When one nurse leaves, you change the passphrase on every device in the wing. With 802.1X you switch off one login."' },
            { tone: 'joke', say: 'Can Sticky be the authentication server?', reply: 'Ace, almost smiling: "At the gate, the dog already is. But a dog checks one face per port, and the AS checks every login against a list in the Lab, a lot faster than a dog reads."' }
          ] } },
        { k: 'LORE', title: 'THE KEY IN THE NOISE', year: 2001, vibe: 'Off the hook. A laptop in a car park reading everyone\'s mail.',
          text: 'Ace, closing the laptop: "In August 2001 three cryptographers, Scott Fluhrer, Itsik Mantin and Adi Shamir, published a flaw in the way RC4 starts up its keys. WEP fed RC4 exactly the kind of keys the flaw needed. Within weeks a program called AirSnort was recovering WEP keys from a laptop just by listening to the traffic. I keep this one because WEP was switched on in buildings for years after that, and it still is, in this one."' },
        { k: 'KIT', text: 'Ace writes it on the back of the builders\' handover sheet in capitals.', kit: [
          { cmd: 'authentication · encryption · integrity (MIC)', what: 'the three jobs. The group key encrypts what the AP sends to all clients' },
          { cmd: 'open authentication · WEP (RC4, 40 or 104-bit key + 24-bit IV = 64 or 128)', what: 'accepts everyone · broken' },
          { cmd: '802.1X: supplicant · authenticator · authentication server (AS)', what: 'the tablet · the AP or WLC · the RADIUS server' },
          { cmd: 'LEAP · EAP-FAST (PAC, TLS tunnel, then client auth) · PEAP (server cert) · EAP-TLS (server and client certs)', what: 'the EAP methods' },
          { cmd: 'WPA TKIP · WPA2 CCMP (AES counter mode + CBC-MAC) · WPA3 GCMP (AES counter mode + GMAC)', what: 'encryption and MIC' },
          { cmd: 'Personal (PSK) · Enterprise (802.1X/EAP) · WPA3: SAE, forward secrecy', what: 'the modes' } ] },
        { k: 'SYNC', q: { prompt: 'Beacon, packing up the scanner: "Say someone records the wing\'s WPA3 traffic tonight and steals the passphrase next year. Can they read tonight\'s recording?"', opts: ['No. WPA3 has forward secrecy', 'Yes. The passphrase unlocks everything it ever protected', 'Only if they also steal the WLC', 'Only on the 2.4 GHz band'], a: 0,
          yes: 'Ace: "No. Tonight stays tonight."', no: 'Ace: "No. Forward secrecy means an old recording stays locked."',
          why: 'Ace: WPA3 provides forward secrecy: the keys protecting each session are not derived in a way that a stolen passphrase can recreate later, so traffic captured before the theft cannot be decrypted. SAE also protects the four-way handshake in personal mode.' } }
      ] },

    // ------------------------------------------------------------ night 58 · wireless configuration
    { id: 'n58-the-controller', title: 'The wing\'s controller', sub: 'wireless configuration', npc: 'beacon', day: [58], src: [PS('Wireless_Configuration.md')], unlocks: ['wlc-config'],
      beats: [
        { k: 'SCENE', where: 'The clinic\'s new wing · the comms room · three in the morning',
          lines: [
            { who: 'narr', text: 'The comms room is the size of a wardrobe and twice as warm, and the only sound is the steady whirr of the switch fans. WLC1 sits racked under the wing\'s switch, a flat grey box with a row of blinking ports. Beacon has a laptop on an upturned bin and a patch cable between her teeth.' },
            { who: 'beacon', text: 'Words first, because the controller is fussy about them. On a WLC a port is a physical socket and an interface is a logical thing that lives on a port. The [[service port]] is for managing the box out of band, and it goes to an access port on the switch. The distribution system ports carry the real traffic to the switched network, and there\'s a redundancy port for joining a second WLC as a standby pair.' },
            { who: 'beacon', text: 'Then the interfaces. The management interface is where the CAPWAP tunnels from every AP arrive. The virtual interface talks to wireless clients: it relays their DHCP and runs web authentication. A [[dynamic interface]] maps a WLAN to a VLAN, so the staff SSID lands in the staff VLAN. There\'s also a redundancy management interface for reaching the standby WLC, and a service port interface bound to the service port.' },
            { who: 'beacon', text: 'And the builders cabled two distribution ports to the switch as an EtherChannel with LACP. A WLC only does static LAG. It won\'t speak LACP or PAgP, so the switch has to be set to channel-group mode on.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How will the Kabuki APs find this controller?', reply: 'Beacon: "They\'re on another subnet, so they can\'t hear it shout. When a lightweight AP boots it asks for an address by DHCP, and the DHCP server can hand it the WLC\'s address as well, in DHCP option 43. The AP goes straight to it."' },
            { tone: 'press', say: 'Why won\'t it just speak LACP?', reply: 'Beacon: "Because it doesn\'t. You don\'t argue with a controller, you set the switch to on. Put active or desirable on the switch and the two ends never agree, so the bundle never forms and you\'re down to one cable."' },
            { tone: 'quiet', say: '(Take the patch cable from her.)', reply: 'She lets you take it and wipes her mouth on her sleeve. "Service port, the one on its own at the left. Access port on the switch, management VLAN. Thank you."' }
          ] } },
        { k: 'SCENE', where: 'The comms room · the controller\'s web page on Beacon\'s laptop',
          lines: [
            { who: 'narr', text: 'The laptop shows the controller\'s web page in the harsh colours of something designed by a committee. Beacon clicks WLANs, then Create New, and the fan in the laptop spins up as if it has been asked to lift something.' },
            { who: 'beacon', text: 'Three WLANs: staff, guests and the phones. Each gets an SSID, a dynamic interface for its VLAN, security and QoS. Layer 2 security happens before a client even gets an address: WPA+WPA2, 802.1X, static WEP, CKIP, or None with EAP passthrough. Layer 3 security happens after, on a web page: web authentication, web passthrough, conditional web redirect, splash page web redirect.' },
            { who: 'beacon', text: 'A PSK can be typed as ASCII or as hex, and in ASCII it has to be at least 8 characters long. The guest one goes on a sign in reception, so make it long and easy to read.' },
            { who: 'beacon', text: 'Then [[QoS]] per WLAN. Platinum is for voice, Gold for video, Silver for best effort, and Bronze for background. Silver is the default, so the phones only get Platinum if you give it to them.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Why web authentication for the guests?', reply: 'Beacon: "Because a web page can ask them to accept the clinic\'s terms, or type a code off a card, without handing them a password for the building. It\'s Layer 3: they get an address first and the page stops them until they\'re through it."' },
            { tone: 'press', say: 'Who can log in to the controller itself?', reply: 'Beacon: "Nobody from the guest WLAN, if I have anything to say about it. A CPU ACL filters traffic aimed at the WLC itself, so only the management VLAN can reach its login page."' },
            { tone: 'joke', say: 'Can the phones have Platinum and the radio have Gold?', reply: 'Beacon: "The station streams audio, so strictly speaking I\'m voice, but I\'ll settle for Gold. Video gets Gold. The phones are Platinum because a nurse calling for help can\'t stutter."' }
          ] } },
        { k: 'LORE', title: 'EVERY AP PHONES HOME', year: 2009, real: ['ietf', 'cisco'], vibe: 'Epic. Every AP in the building on a leash to one box.',
          text: 'Beacon, with her feet up on the bin: "In March 2009 the IETF published CAPWAP as RFC 5415, the standard way for a lightweight AP to talk to its controller, with control on UDP 5246 and data on 5247. It grew out of LWAPP, which came from a company called Airespace, and Cisco had bought Airespace in 2005. I keep it because it\'s the night the APs stopped being forty separate radios and became one network with forty antennas."' },
        { k: 'KIT', text: 'Beacon sticks a label on the top of WLC1 and writes on it.', kit: [
          { cmd: 'port = physical · interface = logical', what: 'on a WLC' },
          { cmd: 'service port (OOB, switch access port) · distribution system ports (data) · redundancy port (HA pair)', what: 'WLC ports' },
          { cmd: 'management (CAPWAP) · virtual (DHCP relay, web auth) · dynamic (WLAN to VLAN) · redundancy management · service port', what: 'WLC interfaces' },
          { cmd: 'channel-group 1 mode on', what: 'WLCs only support static LAG. No LACP, no PAgP' },
          { cmd: 'DHCP option 43', what: 'tells APs the WLC\'s address' },
          { cmd: 'L2: WPA+WPA2, 802.1X, static WEP, CKIP, None + EAP passthrough · L3: web auth, web passthrough, conditional web redirect, splash page web redirect', what: 'WLAN security' },
          { cmd: 'PSK: ASCII (8 characters or more) or hex', what: 'the pre-shared key' },
          { cmd: 'Platinum voice · Gold video · Silver best effort (default) · Bronze background', what: 'WLAN QoS. CPU ACLs protect the WLC itself' } ] },
        { k: 'SYNC', q: { prompt: 'Imani, reading over Beacon\'s shoulder: "You left the phones\' WLAN on the default QoS. What is the default, and is that right?"', opts: ['Silver, best effort. The phones need Platinum', 'Platinum. It is right', 'Gold. It is right', 'Bronze. The phones need Silver'], a: 0,
          yes: 'Beacon: "Silver, and no, it isn\'t. Platinum for the phones. Good catch."', no: 'Beacon: "Silver is the default, best effort. The phones need Platinum, which is voice."',
          why: 'Beacon: A WLAN\'s QoS is Silver (best effort) unless you change it. Platinum is voice, Gold is video and Bronze is background, so a WLAN carrying phones should be set to Platinum.' } }
      ] },

    // ------------------------------------------------------------ night 59 · network automation and AI
    { id: 'n59-a-thousand-boxes', title: 'A thousand boxes', sub: 'network automation and AI', npc: 'ansible', day: [59], src: [PS('Network_Automation.md')], unlocks: ['automation'],
      beats: [
        { k: 'SCENE', where: 'The Lab · Ansible\'s bench · eleven at night',
          lines: [
            { who: 'narr', text: 'A cold draught falls from the vent above Ansible\'s bench and carries the smell of solder and machine oil. Forty second-hand switches sit stacked in a wire shelf, every one with a cable to the same laptop, their lights blinking out of step. A palm-sized drone hovers at shoulder height and turns to look at you. The man at the bench is bald, with a green visor pushed up on his forehead, and he finishes typing before he looks up.' },
            { who: 'ansible', text: 'Good. Sit. Halvorsen shows the council their controller next week. It runs four thousand boxes with nobody touching them, they say. I want the council to see the street can run its own the same way. First you need to know what you are automating.' },
            { who: 'ansible', text: 'Every box on that shelf does three kinds of work. The [[data plane]] forwards the traffic itself, frame in, frame out, which is why people also call it the forwarding plane. The [[control plane]] decides how that forwarding happens: OSPF, spanning tree, ARP, building the tables. The [[management plane]] is how people and tools talk to the box: SSH, SNMP, syslog.' },
            { who: 'ansible', text: 'The data plane has to be fast, so a switch does it in hardware. An [[ASIC]], an application-specific integrated circuit, is a chip built to do one job. The MAC address table sits in CAM, content-addressable memory, which is why people call it the CAM table, and the routing lookups sit in TCAM, ternary CAM.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Which plane does your laptop touch?', reply: 'Ansible: "Management. My playbook logs in to each box over SSH and tells it what its configuration should be. The box\'s control plane then does its own work, and the data plane never knows I was there. That is also why a switch that refuses SSH refuses me."' },
            { tone: 'press', say: 'Why automate at all, if it works by hand?', reply: 'Ansible: "Forty boxes, one change each, is forty chances to type a wrong number at four in the morning. A play is written once, read by a second person, and run the same way on every box. Human error, inconsistent configuration and slow changes are what automation takes away."' },
            { tone: 'joke', say: 'Does the drone have a control plane?', reply: 'The drone tilts, as if it heard. Ansible: "It has all three. The rotors are its data plane, the flight controller deciding where to go is its control plane, and the app on my phone is its management plane. It is a better student than most."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · Ansible\'s bench · a tablet propped against the shelf', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'Ansible props a tablet against the shelf and plays Halvorsen\'s demo with the sound off. On the screen a map of Watson glows, every building a dot, and a line of text crawls under it: ONE CONTROLLER. NO STAFF. NO SURPRISES.' },
            { who: 'ansible', text: '[[SDN]], software-defined networking, pulls the control plane out of each box and puts it in one application, the controller. Applications and scripts talk to the controller through its [[northbound interface]], usually a REST API. The controller talks to the boxes through its [[southbound interface]], with OpenFlow, OpFlex, onePK or NETCONF.' },
            { who: 'ansible', text: 'Their controller is Cisco Catalyst Center with their logo on it. It uses AI in four places. AI Network Analytics learns what normal looks like and suggests changes. The Machine Reasoning Engine, the MRE, finds the root cause of a fault and can fix it. AI Endpoint Analytics works out what every device on the network is, and AI-enhanced RRM keeps tuning the Wi-Fi radios.' },
            { who: 'ansible', text: '[[Machine learning]] is the part of AI that learns from data instead of being programmed rule by rule. Supervised learning trains on labelled examples, unsupervised finds patterns in unlabelled data, and reinforcement learning is rewarded or penalised for what it does. Deep learning uses neural networks with many layers. Predictive AI forecasts from history, and generative AI makes something new from the patterns it learned.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Can the street have a controller too?', reply: 'Ansible: "It can have its own, running in the Lab, with its own REST API. The question for the council is not whether the boxes can be run from one place. It is whose place."' },
            { tone: 'press', say: 'What if their AI decides wrong?', reply: 'Ansible: "Then it is wrong on four thousand boxes at once, and nobody in Watson has the password to stop it. An automated change goes out as fast as a good one. That is why every play I write is read by a person before it runs."' },
            { tone: 'quiet', say: '(Watch the demo to the end.)', reply: 'The demo ends on the Exchange, lit up in Halvorsen\'s colours. Ansible stops it before the logo comes up. "REST. Representational State Transfer. That is what their northbound interface speaks, and it is what ours will speak."' }
          ] } },
        { k: 'LORE', title: 'A SUMMER TO TEACH MACHINES', year: 1955, vibe: 'Crazy, man. Ten scientists, one summer, and machines that think.',
          text: 'Ansible, with the drone settled on his shoulder: "On the thirty-first of August 1955, John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon wrote a proposal for a summer research project at Dartmouth College, and they named its subject artificial intelligence. The workshop ran the next summer. They thought ten people and two months would go a long way. I keep it because every promise about a machine that needs no people started with a proposal that sure of itself."' },
        { k: 'KIT', text: 'Ansible prints it from the laptop and the drone carries it over.', real: ['cisco'], kit: [
          { cmd: 'data (forwarding) · control · management', what: 'the three planes: forward the traffic · decide how (OSPF, STP, ARP) · talk to the box (SSH, SNMP, syslog)' },
          { cmd: 'ASIC · CAM (the MAC table) · TCAM', what: 'data plane hardware' },
          { cmd: 'SDN: the control plane centralised in a controller', what: 'SDA is software-defined architecture. API = application programming interface' },
          { cmd: 'NBI: REST to apps · SBI: OpenFlow, OpFlex, onePK, NETCONF to devices', what: 'the controller\'s two interfaces' },
          { cmd: 'supervised · unsupervised · reinforcement · deep', what: 'machine learning: labelled data · unlabelled data · rewards and penalties · many-layered neural networks' },
          { cmd: 'predictive · generative', what: 'forecast from history · create new content' },
          { cmd: 'AI Network Analytics · Machine Reasoning Engine (MRE) · AI Endpoint Analytics · AI-enhanced RRM', what: 'Catalyst Center: baselines · root cause and fixes · identify devices · tune the radios' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo, reading the demo\'s small print: "Their controller \'talks to every device over NETCONF\'. Is that its northbound or its southbound interface?"', opts: ['Southbound', 'Northbound', 'Both', 'Neither: NETCONF is a data plane protocol'], a: 0,
          yes: 'Ansible: "Southbound. Down to the boxes."', no: 'Ansible: "Southbound. NETCONF runs between the controller and the devices."',
          why: 'Ansible: The southbound interface (SBI) connects the SDN controller to the network devices it controls, using protocols such as OpenFlow, OpFlex, onePK and NETCONF. The northbound interface (NBI) connects the controller to applications and scripts, usually with a REST API.' } }
      ] },

    // ------------------------------------------------------------ night 60 · JSON, XML and YAML
    { id: 'n60-matching-braces', title: 'Matching braces', sub: 'JSON, XML and YAML', npc: 'jason', day: [60], src: [PS('JSON_XML_YAML.md')], unlocks: ['data-formats'],
      beats: [
        { k: 'SCENE', where: 'The Lab · Jason\'s desk by the stairs · ten at night', real: ['json'],
          lines: [
            { who: 'narr', text: 'Jason\'s corner of the Lab smells of fresh paper and lemon cleaner, which nothing else in the building does. Every folder on his desk is labelled, every label is typed, and his pens lie in a row sorted by colour. He wears a tie at ten at night. A print-out lies squared in the middle of the desk, and he has circled one character on it in red.' },
            { who: 'jason', text: 'Halvorsen sent the council an inventory of every network device in Watson, for the bid. They have counted our boxes. It\'s in [[JSON]], JavaScript Object Notation, and it doesn\'t parse, because of this comma.' },
            { who: 'jason', text: 'JSON has four primitive types. A string is text, always in double quotes. A number is just the number. A boolean is true or false. And null means there is deliberately no value. Then two structured types. An object is a set of key-value pairs inside braces, and an array is a list of values inside square brackets.' },
            { who: 'jason', text: 'Every key in an object is a string in double quotes, then a colon, then the value. Pairs are separated by commas, and there is never a comma after the last one. That is the comma I circled.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Does the spacing matter?', reply: 'Jason: "Not in JSON. Whitespace between the tokens is ignored, so one line or forty lines mean the same thing. I indent for people, not for the parser. That is not true of every format, which we will come to."' },
            { tone: 'press', say: 'Why would a corp send a file that doesn\'t parse?', reply: 'Jason: "Their own tools forgive trailing commas. Ours don\'t, because the standard doesn\'t. A file that only one side can read is not a shared record, and the council needs a shared record."' },
            { tone: 'joke', say: 'Is your desk in JSON too?', reply: 'Jason straightens a pen that was already straight. "An object. Key: drawer, value: an array of folders. The cat once walked across it, and I would describe what she left behind as null."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · Jason\'s desk · three print-outs side by side',
          lines: [
            { who: 'narr', text: 'He lays out three sheets side by side, each describing the same switch. The first is all braces and quotes, the second is all angle brackets, and the third is almost bare, just indented lines and a few dashes.' },
            { who: 'jason', text: 'Same data, three formats. [[XML]], Extensible Markup Language, wraps every value in tags, <hostname>ASW-A1</hostname>. It is older, longer, and whitespace does not matter in it either. REST APIs usually speak JSON or XML.' },
            { who: 'jason', text: '[[YAML]] stands for YAML Ain\'t Markup Language, which I find unbearable. A YAML file starts with three dashes. Key-value pairs are written key: value, and a dash at the start of a line marks an item in a list. In YAML the whitespace is significant: the indentation is the structure, so one space out of place changes the meaning.' },
            { who: 'jason', text: 'Ansible writes his plays in YAML because people read them. I carry the street\'s data in JSON because programs read it. The council will read whatever we hand them, so it had better parse.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I tell a string from a number?', reply: 'Jason: "Quotes. "48" is a string of two characters, and 48 is a number. "true" is a string, and true is a boolean. The difference matters the moment a program tries to add one to it."' },
            { tone: 'press', say: 'Why not just use one format?', reply: 'Jason: "Because they were built for different readers. XML came first and carries a great deal of structure. JSON is lighter and maps straight onto the objects in most programming languages. YAML is for people who have to edit the file by hand. The data doesn\'t care, and a good converter doesn\'t either."' },
            { tone: 'care', say: 'How did Halvorsen count our boxes?', reply: 'Jason taps the print-out. "From outside, mostly. Every address that answers a ping, every box that shows up in a public list. They missed the Lab entirely. I did not correct them."' }
          ] } },
        { k: 'LORE', title: 'THE FIRST MESSAGE IN BRACES', year: 2001, real: ['json'], vibe: 'Bling. Data a person can read over coffee.',
          text: 'Jason, squaring the three sheets: "In April 2001 Douglas Crockford and Chip Morningstar sent the first message in what became JSON, between two computers at their company, State Software. Crockford put the rules on a one-page website, json.org, the next year, and ECMA made it a standard, ECMA-404, in 2013. I keep this one because the whole format fits on a single page, and I have never needed a second one."' },
        { k: 'KIT', text: 'Jason types it, prints it and hands it to you squared.', real: ['json'], kit: [
          { cmd: 'JSON: JavaScript Object Notation · XML: Extensible Markup Language · YAML: YAML Ain\'t Markup Language', what: 'the three formats. REST APIs usually use JSON or XML' },
          { cmd: 'string "text" · number 5 · boolean true/false · null', what: 'JSON primitive types' },
          { cmd: 'object {"key": value, ...} · array [value, ...]', what: 'JSON structured types. Keys in double quotes. No comma after the last item' },
          { cmd: '<key>value</key>', what: 'XML' },
          { cmd: '--- · key: value · - item', what: 'YAML: starts with three dashes, dashes for lists' },
          { cmd: 'whitespace: JSON no · XML no · YAML yes', what: 'is it significant?' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo reads a line from Halvorsen\'s file: ""poe": false". "Is that a string, or something else?"', opts: ['A boolean', 'A string', 'A number', 'Null'], a: 0,
          yes: 'Jason: "A boolean. No quotes, so not a string."', no: 'Jason: "A boolean. true and false without quotes are booleans."',
          why: 'Jason: In JSON, true and false without quotation marks are booleans. With quotation marks they would be strings. A number has no quotes and is a numeric value, and null means the intentional absence of any value.' } }
      ] },

    // ------------------------------------------------------------ night 61 · REST APIs and authentication
    { id: 'n61-asking-politely', title: 'Asking the boxes politely', sub: 'REST APIs and authentication', npc: 'jason', day: [61], src: [PS('REST_APIs.md')], unlocks: ['rest-api'],
      beats: [
        { k: 'SCENE', where: 'The Lab · Jason\'s desk · a quarter to midnight',
          lines: [
            { who: 'narr', text: 'The Lab\'s racks hum behind you, and Jason\'s desk lamp makes a neat circle of yellow light on a single sheet headed OPENING NIGHT DASHBOARD. A council laptop sits open beside it, showing an empty page with the council\'s crest and nothing else.' },
            { who: 'jason', text: 'The council wants to watch the Exchange live on Opening Night: every box, up or down, on that page. The page will ask the street\'s controller for the data through a [[REST API]]. REST stands for Representational State Transfer, and a REST API is asked things over HTTP, one request at a time. It is stateless: every request carries everything the server needs, and the server remembers nothing between them.' },
            { who: 'jason', text: 'Everything you can do to data is one of four things, CRUD: create, read, update, delete. HTTP has a verb for each. POST creates, GET reads, PUT or PATCH updates, and DELETE deletes.' },
            { who: 'jason', text: 'A request goes to a [[URI]], a uniform resource identifier. In https://exchange.watson.lab/api/v1/devices, the scheme is https, the authority is exchange.watson.lab, the server, and the path is /api/v1/devices, the thing you are asking about.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What comes back?', reply: 'Jason: "A status code, and usually some JSON. The first digit is the class: 1xx informational, 2xx successful, 3xx redirection, 4xx client error, 5xx server error. 200 is OK, 201 is Created, 102 is Processing, 301 is Moved Permanently, 401 is Unauthorized, 404 is Not Found and 500 is Internal Server Error."' },
            { tone: 'press', say: 'Why not just log in to each box?', reply: 'Jason: "Because a web page cannot type into a shell, and a thousand web pages should not try. The controller already knows every box through Ansible\'s plays. The dashboard asks the controller once, with GET, and gets the whole district back as one JSON array."' },
            { tone: 'joke', say: 'What\'s the verb for making coffee?', reply: 'Jason: "POST, since it creates a coffee. If the machine is empty, it answers with a 5xx, because the fault is on the server\'s side. If you ask for tea, it answers 404."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · Jason\'s desk · Halvorsen\'s API sample',
          lines: [
            { who: 'narr', text: 'Jason unfolds a page from Halvorsen\'s bid: an example request to their controller, printed in a pale grey typeface. One header line is underlined twice in red: Authorization: Basic YWRtaW46aGFsdm9yc2Vu.' },
            { who: 'jason', text: 'That is [[Basic authentication]]: a username and password joined by a colon and encoded in Base64, in the Authorization header. Base64 is encoding, not encryption. Anyone can reverse it.' },
            { who: 'narr', text: 'He writes on the margin without looking anything up: admin:halvorsen.' },
            { who: 'jason', text: 'There are better ways. [[Bearer authentication]] sends a token in the same Authorization header, and the token expires after a set time. An API key is a static key the provider issues, which does not expire; it belongs in the Authorization header too, though people also put it in the URL or a cookie. And [[OAuth 2.0]] delegates access: the council\'s page can act for Clerk Adebayo without ever seeing his password.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How does OAuth 2.0 work?', reply: 'Jason: "Four parties. The resource owner is the person whose data it is, Clerk Adebayo. The client app is the council\'s page. The authorisation server checks who he is and hands the page an access token. The resource server is the controller\'s API, which accepts the token. When the token expires, a refresh token gets a new one without asking him to log in again."' },
            { tone: 'press', say: 'Is that really Halvorsen\'s password?', reply: 'Jason: "It is the one in their example, printed in a public bid. Whether it is still the password on their live controller I will not be finding out. The point for the council is that they sent an example with Basic authentication over a public page."' },
            { tone: 'care', say: 'Who will watch the dashboard on the night?', reply: 'Jason: "Clerk Adebayo, on a laptop in the Exchange\'s hall. If a box goes red, he will write down the time. He asked me to make the page large enough to read without his glasses."' }
          ] } },
        { k: 'LORE', title: 'THE WEB EXPLAINS ITSELF', year: 2000, vibe: 'Y2K came and went. Somebody finally wrote down why the web works.',
          text: 'Jason, slipping the sample into a folder: "In 2000 Roy Fielding finished his doctoral dissertation at the University of California, Irvine, on the architecture of network software. One chapter described the style the web itself was built in, and called it Representational State Transfer. Fielding had helped write the HTTP standard, so he was describing a building he had helped put up. I keep it because the best specification of the web was written after the web already worked."' },
        { k: 'KIT', text: 'Jason prints it on council paper.', kit: [
          { cmd: 'Create POST · Read GET · Update PUT, PATCH · Delete DELETE', what: 'CRUD and the HTTP verbs. REST is stateless' },
          { cmd: 'https :// exchange.watson.lab /api/v1/devices', what: 'a URI: scheme, authority, path' },
          { cmd: '1xx informational · 2xx successful · 3xx redirection · 4xx client error · 5xx server error', what: 'response classes' },
          { cmd: '200 OK · 201 Created · 102 Processing · 301 Moved Permanently · 401 Unauthorized · 404 Not Found · 500 Internal Server Error', what: 'response codes' },
          { cmd: 'Basic (Base64 user:password) · Bearer (expiring token) · API key (static) · OAuth 2.0 (delegation, refresh token)', what: 'REST authentication. Credentials go in the HTTP Authorization header' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo: "If the dashboard asks the controller for the device list twice, does the controller remember the first time?"', opts: ['No. REST APIs are stateless: each request carries everything it needs', 'Yes. It keeps a session for each page', 'Only if the page uses POST', 'Only with Basic authentication'], a: 0,
          yes: 'Jason: "No. Each GET stands on its own."', no: 'Jason: "No. REST is stateless. Every request is complete in itself."',
          why: 'Jason: REST APIs must be stateless: the server keeps no memory of earlier requests, so every request includes all the information needed to handle it, including its authentication.' } }
      ] },

    // ------------------------------------------------------------ night 62 · software-defined networking
    { id: 'n62-whose-controller', title: 'Whose controller', sub: 'software-defined networking', npc: 'ansible', day: [62], src: [PS('Software_Defined_Networking.md')], unlocks: ['sdn'],
      beats: [
        { k: 'SCENE', where: 'The Lab · the blade chassis · near one in the morning',
          lines: [
            { who: 'narr', text: 'The blade chassis roars as it always does, but one new light has joined the row on the front panel, a steady green. Prof. Hypervisor sits on her packing crate with the laptop, and Ansible stands behind her with his arms folded and the drone perched on his shoulder. Both of them are watching a single line of text scroll past: CONTROLLER READY.' },
            { who: 'hypervisor', text: 'There it is. The street\'s own controller, one little instance on blade four. Ansible\'s plays underneath it, Jason\'s API on top of it, and not a single Halvorsen logo anywhere.' },
            { who: 'ansible', text: 'An SDN network has three layers. The application layer holds the scripts and programs that tell the controller what they want, like Jason\'s dashboard. The control layer is the controller itself. The infrastructure layer is the boxes that forward the traffic.' },
            { who: 'ansible', text: 'Cisco sells three controllers, one for each kind of network, under the name Cisco [[DNA]], Digital Network Architecture. [[SD-Access]] runs campus LANs, [[ACI]], Application-Centric Infrastructure, runs data centres, and SD-WAN runs wide area networks. Halvorsen\'s bid proposes SD-Access for the Exchange.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What happens if the controller goes down?', reply: 'Ansible: "The boxes keep forwarding, because the data plane still lives in each of them. What stops is change: no new policies, no new devices, until it comes back. That is why the council should care who holds it."' },
            { tone: 'press', say: 'Why not just let Halvorsen run it?', reply: 'Prof. Hypervisor: "Because the controller is where the decisions are. Whoever holds it decides which building talks to which, and what it costs. Ours runs on a blade the clinic paid for, in a basement the street can walk into."' },
            { tone: 'joke', say: 'Does the drone report to the controller now?', reply: 'Ansible: "It reports to me. I report to nobody. In SDN terms the drone is infrastructure, I am the application, and the controller is Prof. Hypervisor\'s blade. The drone disagrees."' }
          ] } },
        { k: 'SCENE', where: 'The Lab · the whiteboard', real: ['cisco'],
          lines: [
            { who: 'narr', text: 'Prof. Hypervisor wheels over a whiteboard and draws two layers of boxes, one above the other, then a dotted line joining two boxes in the top layer straight through the one beneath.' },
            { who: 'hypervisor', text: 'The bottom layer is the [[underlay]], the real network: cables, switches, routes. The top layer is the [[overlay]], virtual networks built on top of it with tunnels, so two boxes can be neighbours even when the cables say they aren\'t. The two together are the [[fabric]].' },
            { who: 'ansible', text: 'In SD-Access the overlay\'s data plane is [[VXLAN]], Virtual Extensible LAN, which tunnels frames between switches. Its control plane is [[LISP]], the Locator ID Separation Protocol, which keeps track of where every endpoint is. Policy is Cisco TrustSec, CTS, which tags traffic by who sent it.' },
            { who: 'ansible', text: 'The fabric has three kinds of switch. An edge node is where the end hosts plug in. A border node joins the fabric to outside networks. A control node runs LISP and answers the question of where each endpoint is.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What does the underlay need to be?', reply: 'Ansible: "Plain, routed and solid. Every switch reachable by its loopback, usually with OSPF, because every VXLAN tunnel runs from one loopback to another. An overlay is only as good as the underlay under it."' },
            { tone: 'press', say: 'Where does intent-based networking come in?', reply: 'Prof. Hypervisor: "[[Intent-Based Networking]], IBN, is the idea that you tell the controller what you want, such as the clinic\'s phones never share a network with the guests, and it works out the configuration of every box to make it so. Halvorsen\'s brochure calls it magic. It is Ansible\'s plays with a nicer front door."' },
            { tone: 'quiet', say: '(Look at the dotted line on the whiteboard.)', reply: 'The dotted line runs from a box labelled WING to a box labelled KABUKI, straight through the Exchange. Prof. Hypervisor taps it with the marker. "That\'s the clinic, one network, two buildings. The underlay doesn\'t have to know."' }
          ] } },
        { k: 'LORE', title: 'A SWITCH TAKES ORDERS', year: 2008, vibe: 'Legit. A campus switch taking its orders from a laptop.',
          text: 'Prof. Hypervisor, capping the marker: "In April 2008 Nick McKeown and his colleagues at Stanford published a paper called OpenFlow: Enabling Innovation in Campus Networks. They proposed an open protocol that let a controller write the forwarding tables of ordinary switches, so researchers could try new ideas on a real campus without asking the vendors first. I keep it because it was written by people who wanted the campus network to belong to the people using it."' },
        { k: 'KIT', text: 'Ansible photographs the whiteboard and prints it; the drone carries it over.', real: ['cisco'], kit: [
          { cmd: 'application · control · infrastructure', what: 'the SDN layers: scripts and apps · the controller · the devices' },
          { cmd: 'SD-Access (campus) · ACI (data centre) · SD-WAN (WAN)', what: 'Cisco\'s SDN solutions. DNA = Digital Network Architecture' },
          { cmd: 'underlay · overlay · fabric', what: 'the physical network · the virtual network on top · both together' },
          { cmd: 'LISP control plane · VXLAN data plane · Cisco TrustSec (CTS) policy', what: 'SD-Access' },
          { cmd: 'edge node · border node · control node', what: 'SD-Access switches: hosts connect · outside networks · LISP' },
          { cmd: 'IBN', what: 'intent-based networking: say what you want, the controller configures it' } ] },
        { k: 'SYNC', q: { prompt: 'Clerk Adebayo, reading the whiteboard photo: "In Halvorsen\'s SD-Access plan, which protocol carries the actual traffic between the switches?"', opts: ['VXLAN', 'LISP', 'Cisco TrustSec', 'OpenFlow'], a: 0,
          yes: 'Ansible: "VXLAN. The data plane."', no: 'Ansible: "VXLAN is the data plane. LISP is the control plane, TrustSec the policy."',
          why: 'Ansible: In SD-Access, VXLAN provides the data plane, tunnelling traffic across the underlay. LISP provides the control plane, tracking where endpoints are, and Cisco TrustSec provides policy control.' } }
      ] }
  ] });
})();
