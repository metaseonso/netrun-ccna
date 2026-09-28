# CAMPAIGN MAP — NETRUNNER://CCNA, arc 01 · THE GRID

Status: **draft for the owner's approval** (2026-09-28). Nothing in the campaign gets written until this is approved.
This file is the plan every night is written from: the world, the story, the cast and their arcs, what each night teaches,
the gig built from each lab, and the numbers that make learning the only way forward.

Source of truth for the course order: the file names in `C:\Users\Seonso\Desktop\CCNA Course Files` (decks and labs).
The day table in `docs/TASKS.md` was a guess and is wrong in places (for example the DHCP snooping lab is Day 50,
DAI is Day 51, GRE is Day 53). This map replaces it.

---

## 1. The shape in one paragraph

You arrive in Watson with nothing but a handle and a vouch you did not ask for. Watson runs on old gear that the
street keeps alive with its own hands. Halvorsen Consolidated, a corp downtown, wants to buy the **Watson Exchange**,
the old building where every cable in the district meets, and replace the street's networks with its own closed net,
billed per head. The district council will decide on **Opening Night**, when the rebuilt clinic wing opens: if the
street can keep its own net running, Watson keeps it. Over 63 nights you learn the gear from the people who run it,
climb from Class D to Class A, lose and save the runners who follow you, and find out who has been breaking the
district on purpose. On Opening Night you rebuild the Exchange yourself. The lights stay on.

## 2. How the game teaches (the loop every night follows)

| Step | What the player does | What it teaches | What it costs or pays |
|---|---|---|---|
| 1. The talk (level) | Walks into a scene, talks to the NPC, picks stances | The day's concepts, told by someone who needs them | Free. Syncs the first time. Unlocks the day's quickhack and the day's cards |
| 2. The question (SYNC) | Answers one question someone in the room asks | Recall, right after the scene | No rep on the line |
| 3. The gig | Fixes a real network in the shell, built from the day's lab | Doing it, with the engine checking the result | Hunger and chrome to jack in; creds and rep on the way out |
| 4. The crew's calls | Answers a runner's call against a clock | Spaced repetition over every card unlocked so far | A right answer saves them and pays rep; a wrong one hurts them |
| 5. Callbacks | Dispatch sends an old client back with a new problem | Mixed review of earlier nights | Normal gig pay |
| 6. Rites | The last gig of each class, cumulative | Everything in the act, in one building | Costs more going in, pays big, and it is the only way up a class |

Help has a price, so learning is always the cheaper path:
- **Ping Dispatch** (a nudge): free, but that floor pays less rep and the quickhack does not sharpen.
- **A fixer** (the whole answer): costs the gig's pay, and that run pays nothing. The notes stay in the CODEX.
- **The CODEX** opens a gig's notes only when you cleared it (GREENLIT) or paid a fixer (PAID).
- **Rites refuse fixers.** A class is earned in person.

## 3. The four acts

Nights follow the course order. Each act is one class. The rite at the end of the act is the only way up.

| Act | Nights | Class you play at | What the story is about | Rite (the way up) |
|---|---|---|---|---|
| I · NEW IN WATSON | 1–19 | D | Learning the street. Small jobs for small businesses. First signs that someone is testing the district. | Night 19 · **The Clinic's Front Door** → Class C |
| II · THE LONG WAY ROUND | 20–33 | C | The clinic and the roads between districts. Old Root's last season. The tests get bolder. | Night 33 · **Every Road Home** → Class B |
| III · WHO IS ASKING | 34–51 | B | Services, security and the gate. The tests turn into attacks. The reveal. | Night 51 · **Nobody Answers but Us** → Class A |
| IV · OPENING NIGHT | 52–63 + finale | A | The corp's plan, the district's answer, the rebuild of the Exchange. | Finale · **The Watson Exchange** (the Mega Lab) |

## 4. The districts (where each night happens)

Districts are places. Nights are the story's order. A district can host nights far apart, and you go back to it,
the way you go back to a bar you like. The map marks **TONIGHT** so the player always knows where the next night is.

| # | District | Who runs it | Nights |
|---|---|---|---|
| 01 | THE WIRES · the courier guild and Kabuki | Osi Sevenfold, Enable | 1, 2, 3, 4 |
| 02 | THE BLOCK · Cider's bar | Cider | 7, 8, 10, 13, 14, 15 |
| 03 | THE FLOOR · the switch floor under the market | Mac, Vee Lan | 5, 6, 9, 16, 17, 18, 19, 23 |
| 04 | THE BRIDGES · the clinic annex | Old Root | 20, 21, 22 |
| 05 | THE ROADS · the cab rank and the map room | Nexthop, Ospef | 11, 12, 24, 25, 26, 27, 28, 29 |
| 06 | THE SERVICES · the exchange hall | Syn & Ack, Sixx, Denise (+Dora), Shell, Nat, Beacon | 30–33, 36–47 |
| 07 | THE ICE · the gate | Ace Elle and her dog Sticky | 34, 35, 48, 49, 50, 51 |
| 08 | THE LAB · under the college | Prof. Hypervisor, Beacon, Jason, Ansible | 52–63 |
| — | THE WATSON EXCHANGE | everyone | the finale |

## 5. The cast and their arcs

Every NPC has a trade (the topic), a history, a want, and a thread that pays off. Walk-ons recur.

**The spine**
- **Dispatch** runs the job booth. Never says well done; sends a better gig instead. Arc: the only time Dispatch says
  "Well done" is the last line of the game.
- **Marrow** runs the stall under the overpass. Arc: he was a runner once and flatlined on a dive years ago. That is why
  he feeds people and runs a tab. He tells you on night 33 if your crew has lost someone, otherwise on night 51.
- **Old Root** kept the clinic's switches for twenty years. Arc: his last season. He hands you the DO NOT UNPLUG tag at
  the end of Act II (night 22) and retires. He comes back once, on Opening Night, to watch.
- **Vesper Kade** (new) is Halvorsen's liaison in Watson and Old Root's apprentice from twenty years ago. She left the
  street after the night of the loop, when the clinic went to paper for nine hours and a patient's records were lost.
  She believes the street cannot keep its own net safe and has been proving it with "stress tests": the rogue switch,
  the rogue DHCP server, the ARP spoof. Arc: she vouched for you. She wanted a fresh runner to fail in public; part of
  her hoped you would not. Revealed on night 51. On Opening Night she stands in the Exchange and does not interfere.
  Her last line admits the street held.

**Act I**
- **Osi Sevenfold** runs the courier guild; sorts everything by floor. Nights 1–3. Returns on night 12 (a parcel's trip)
  and night 30, when her couriers Syn and Ack join the story.
- **Enable** guards the console, three doors. Night 4. Returns on night 42, where he and Shell argue about locks.
- **Mac** works the door on the switch floor; remembers every face for five minutes. Nights 5, 6, 9. Returns on night 36
  (CDP and LLDP: knowing your neighbours) and night 49 (a face on two doors at once).
- **Cider** runs the bar where address blocks get divided. Nights 7, 8, 10, 13–15. Friendly rivalry with Marrow over
  who feeds you. Her hot plate is on Marrow's shelf.
- **Vee Lan** draws the borders inside buildings; owes Old Root and hates it. Nights 16–19, 23. Arc: she pays the debt
  on night 23 by fixing the one thing Root never could, and the two of them stop arguing.
- **Nexthop** drives a cab and only ever knows the next stop. Night 11. He drives you between districts as a running
  frame for scene changes. Night 12 is one long cab ride, hop by hop.

**Act II**
- **Old Root** nights 20–22 (the tree, the guards, the rapid tree).
- **Ospef** maps the district and will not move until every router agrees. Nights 26–28. Nexthop covers nights 24–25
  (the old cab routes, RIP and EIGRP) and 29 (his cousin's cab takes over the same fare: HSRP).
- **Syn and Ack**, twin couriers who confirm every delivery. Night 30.
- **Sixx** has been waiting since 1998 for everyone to move in. Nights 31–33.

**Act III**
- **Ace Elle** works the gate and reads the list top to bottom, once. **Sticky** remembers the first face on every port.
  Nights 34, 35, 48–51. Arc: Ace suspects Vesper first and says nothing until she can prove it.
- **Denise** the operator, with her intern **Dora** who hands out leases. Nights 37 (one clock), 38 (names to numbers),
  39 (leases), 40 (watching every box).
- **Beacon** runs a pirate radio station. Night 41 (logs as broadcasts). Returns in Act IV for wireless.
- **Shell** the locksmith changed every lock after a password was read off the wire. Nights 42, 43.
- **Nat** sells masks: one public face for a crew of private ones. Nights 44, 45.
- **Dispatch** teaches for the only time on nights 46–47: QoS is how Dispatch's voice calls get through when the whole
  district is shouting. The clinic's phones (nurse Imani) are the client.

**Act IV**
- **Prof. Hypervisor** runs the Lab under the college. Nights 52–54 (architectures, WANs, machines inside machines).
- **Beacon** nights 55–58 (radio, access points, controllers, keys).
- **Ansible** talks to a thousand boxes at once. Nights 59, 62, 63. Halvorsen automates everything; the street learns
  to do it too, on its own terms.
- **Jason** the data broker, everything in matching braces. Nights 60, 61.

**Recurring walk-ons:** nurse **Imani** (the clinic; the night of the loop), **Dora** (Denise's intern), the noodle bar
owner in Kabuki (night 4's client, returns as a callback), the council clerk (Act IV).

**The crew** (protégés) stay procedural, with the six archetypes in `docs/CREW_ARCHETYPES.md`. On Opening Night every
runner still alive shows up at the Exchange; the finale needs a crew of three.

## 6. Night by night

Columns: the night, the topic (exam content), where, who teaches, what happens in the story, the gig built from the
lab (or a gig built from the topic when the day has no lab), and the braindance (real history; the year is the hero).
Every braindance year is checked against a source before it is written.

### Act I · NEW IN WATSON (Class D)

| Night | Topic | District · NPC | Story beat | Gig (from the lab) | Braindance |
|---|---|---|---|---|---|
| 1 | Network devices | Wires · Osi | Dispatch sends you to the courier guild; Osi shows you what every box in the back room does | Lab 01 (PT intro): map the guild's network, find the switch, router, firewall, server; prove a PC reaches the server | 1969 · the IMP, the first router |
| 2 | Interfaces and cables | Wires · Osi | A courier van crushed a cable; the guild's link to the loading dock is dead | Lab 02 (connecting devices): choose cables, fix a speed/duplex mismatch | 1973 · the Ethernet memo |
| 3 | OSI and TCP/IP | Wires · Osi | A parcel goes missing between floors; Osi makes you trace it floor by floor | Lab 03 (OSI model): order the layers and the PDUs, name which box reads which header | 1983 · flag day |
| 4 | The CLI, device security | Wires · Enable | Enable's three doors; a noodle bar in Kabuki needs its router named and locked | Lab 04 (basic device security): hostname, enable secret, console password, password encryption, banner, save | 1984 · two campuses, one bridge |
| 5 | LAN switching 1 | Floor · Mac | Mac's door: every face gets remembered for five minutes | Topic gig: read the MAC table, find the port a laptop is on | 1990 · the first Ethernet switch |
| 6 | LAN switching 2, ARP | Floor · Mac | A stall owner's till cannot find the printer | Lab 06: ARP, ping across the switch, read `arp -a` | 1982 · who has |
| 7 | IPv4 addresses 1 | Block · Cider | First night at Cider's bar; she cuts address blocks with a straight edge | Topic gig: network and broadcast addresses, `no shutdown` on a router interface | 1981 · four billion seemed like plenty |
| 8 | IPv4 addresses 2 | Block · Cider | A new shop on the block needs addresses that do not collide | Lab 08: address router interfaces, verify with `show ip interface brief` | 1993 · the end of class |
| 9 | Switch interfaces | Floor · Mac | The market's cameras drop frames; Mac blames the cables, Vee blames Mac | Lab 09: speed, duplex, descriptions, fix the mismatch | 1995 · a hundred meg |
| 10 | IPv4 header | Block · Cider | Cider reads a packet like a bar tab | Topic gig: header fields, TTL with traceroute | 1987 · the TTL trick |
| 11 | Routing, static routes | Roads · Nexthop | Nexthop drives you across town; two shops cannot reach each other | Labs 11 ×2: configure static routes, then troubleshoot the one-way route | 1997 · AS 7007 |
| 12 | Life of a packet | Roads · Nexthop, Osi | One long cab ride, hop by hop, following a single parcel | Lab 12: order the encapsulation at every hop, read ARP and routes on the way | 1983 · the first ping |
| 13 | Subnetting 1 | Block · Cider | Cider splits the block for three shops | Topic gig: subnet a /24 for three shops, configure it | 1985 · subnets |
| 14 | Subnetting 2 | Block · Cider | A landlord wants more subnets than Cider thinks he needs | Topic gig: host and subnet counts, prefix choice | — |
| 15 | Subnetting 3, VLSM | Block · Cider | The clinic's new wing gets its address plan | Lab 15 (VLSM): plan four departments, configure, verify pings | 1987 · variable length |
| 16 | VLANs 1 | Floor · Vee Lan | Vee Lan draws borders in the market building | Lab 16: create VLANs, assign access ports | 1998 · 802.1Q |
| 17 | VLANs 2, trunks, router-on-a-stick | Floor · Vee Lan | Two VLANs need to talk through one cable | Lab 17: trunk, subinterfaces, ping across VLANs | 1995 · the tag |
| 18 | VLANs 3, multilayer switching | Floor · Vee Lan | The market outgrows the router on a stick | Lab 18: SVIs, `ip routing`, native VLAN mismatch | — |
| 19 | DTP and VTP | Floor · Vee Lan | A switch someone plugged in wipes the VLANs (Vesper's first test) | Lab 19: nonegotiate, mode mismatch, VTP modes | — |
| 19 | **RITE → Class C** | Floor + Block | **The Clinic's Front Door**: the clinic's reception floor, cumulative (addressing, VLANs, trunk, router on a stick, static route, security, save) | Rite gig | — |

### Act II · THE LONG WAY ROUND (Class C)

| Night | Topic | District · NPC | Story beat | Gig | Braindance |
|---|---|---|---|---|---|
| 20 | STP 1 | Bridges · Old Root | The cable that never carried a frame | Lab 20 (analyzing STP): find the root, the root ports, the blocked port | 1985 · the algorhyme |
| 21 | STP 2, PortFast, BPDU Guard/Filter, Root Guard, Loop Guard | Bridges · Old Root | The accidental root; a box under a desk | Lab 21: shape the tree, guard the edges | 2002 · four days on paper |
| 22 | Rapid STP | Bridges · Old Root | Old Root's last shift; he hands you the tag | Lab 22: rapid-pvst, port roles, edge ports | 2001 · 802.1w |
| 23 | EtherChannel | Floor · Vee Lan | Vee pays her debt to Root | Lab 23: LACP, mode mismatch, `show etherchannel summary` | 2000 · 802.3ad |
| 24 | Dynamic routing | Roads · Nexthop | The cab routes change at night | Lab 24 (floating static routes): AD, a backup route | 1988 · RIP |
| 25 | RIP and EIGRP | Roads · Nexthop | The old cabbies' routes | Lab 25 (EIGRP): AS numbers, `show ip protocols` | 1993 · EIGRP |
| 26 | OSPF 1 | Roads · Ospef | Ospef will not move until everyone agrees | Lab 26: router IDs, network statements, neighbours | 1956 · twenty minutes in Amsterdam |
| 27 | OSPF 2 | Roads · Ospef | A router that should not talk does | Lab 27: passive interfaces, cost | 1989 · open shortest path first |
| 28 | OSPF 3 | Roads · Ospef | The map room and the edge of the district | Lab 28: areas, area mismatch, default route | — |
| 29 | FHRPs | Roads · Nexthop | His cousin's cab takes the same fare | Lab 29: HSRP active/standby, priority, preempt | 1998 · HSRP |
| 30 | TCP and UDP | Services · Syn & Ack | The twins confirm every parcel; one courier never waits | Topic gig: the handshake, ports, a filter by port | 1974 · Cerf and Kahn |
| 31 | IPv6 1 | Services · Sixx | Sixx has waited since 1998 | Lab 31: addresses, compression | 1998 · RFC 2460 |
| 32 | IPv6 2 | Services · Sixx | EUI-64 and link-local | Lab 32 | 2012 · World IPv6 Launch |
| 33 | IPv6 3 | Services · Sixx | Static v6 routes across the district | Lab 33 | — |
| 33 | **RITE → Class B** | Roads + Bridges | **Every Road Home**: two sites, OSPF, HSRP, EtherChannel, STP, one v6 route; Vesper's test hits it mid-gig | Rite gig | — |

### Act III · WHO IS ASKING (Class B)

| Night | Topic | District · NPC | Story beat | Gig | Braindance |
|---|---|---|---|---|---|
| 34 | Standard ACLs | ICE · Ace Elle | Ace reads the list top to bottom, once | Lab 34 | 1988 · the first packet filter |
| 35 | Extended ACLs | ICE · Ace Elle | A rule placed on the wrong side of town | Lab 35 | — |
| 36 | CDP and LLDP | Floor · Mac | Mac knows every neighbour; so does anyone listening | Lab 36 | 2005 · LLDP |
| 37 | NTP | Services · Denise | One clock for everyone, because logs lie without it | Lab 37 | 1985 · NTP |
| 38 | DNS | Services · Denise | Names to numbers | Lab 38 | 1983 · DNS |
| 39 | DHCP | Services · Denise, Dora | Dora hands out leases | Lab 39: pool, exclusions, relay | 1993 · DHCP |
| 40 | SNMP | Services · Denise | Watching every box at once | Lab 40 | 1988 · SNMP |
| 41 | Syslog | Services · Beacon | Beacon reads the district's logs on air | Lab 41 | 1980s · syslog |
| 42 | SSH | Services · Shell, Enable | The password read off the wire | Lab 42 | 1995 · SSH |
| 43 | FTP and TFTP | Services · Shell | Moving files, and who can read them on the way | Lab 43 | 1971 · FTP |
| 44 | NAT 1 | Services · Nat | One public face | Lab 44 (static NAT) | 1994 · NAT |
| 45 | NAT 2 | Services · Nat | A crew of private faces behind one mask | Lab 45 (dynamic NAT, PAT) | — |
| 46 | QoS 1, voice VLANs | Services · Dispatch | The clinic's phones break up when the district is busy | Lab 46 (voice VLANs) | 1995 · the first internet phone call |
| 47 | QoS 2 | Services · Dispatch | Who gets to go first | Lab 47 (QoS) | — |
| 48 | Security fundamentals | ICE · Ace Elle | Ace lays out what has been happening to Watson | Topic gig: threats, the CIA triad | 1988 · the Morris worm |
| 49 | Port security | ICE · Ace, Sticky, Mac | A face on two doors at once | Lab 49 | 2000 · dsniff |
| 50 | DHCP snooping | ICE · Ace Elle | A rogue DHCP server hands the clinic a fake gateway | Lab 50 | — |
| 51 | Dynamic ARP inspection | ICE · Ace Elle | The ARP spoof traced back to Vesper; the reveal | Lab 51 | — |
| 51 | **RITE → Class A** | ICE + Services | **Nobody Answers but Us**: the clinic under a live attack, cumulative security and services | Rite gig | — |

### Act IV · OPENING NIGHT (Class A)

| Night | Topic | District · NPC | Story beat | Gig | Braindance |
|---|---|---|---|---|---|
| 52 | LAN architectures | Lab · Hypervisor | Halvorsen's blueprint for the Exchange | Lab 52 (STP and HSRP synchronisation) | 1953 · Clos |
| 53 | WAN architectures | Lab · Hypervisor | The link to the clinic's other site | Lab 53 (GRE tunnels) | 1994 · GRE |
| 54 | Virtualisation, cloud, containers, VRF | Lab · Hypervisor | Machines inside machines; the corp's cloud | Topic gig | 1967 · CP-40 |
| 55 | Wireless fundamentals | Lab · Beacon | Beacon's station and channel 6 | Topic gig: channels, bands | 1971 · ALOHAnet |
| 56 | Wireless architectures | Lab · Beacon | Access points everywhere in the new wing | Topic gig | 1997 · 802.11 |
| 57 | Wireless security | Lab · Beacon, Ace | Keys, and what happens when they are weak | Topic gig | 2001 · WEP falls |
| 58 | Wireless configuration | Lab · Beacon | The new wing's WLC | Lab 58 (wireless LANs) | — |
| 59 | Network automation, AI | Lab · Ansible | Halvorsen automates everything | Topic gig: planes, controllers | — |
| 60 | JSON, XML, YAML | Lab · Jason | Everything in matching braces | Topic gig: write valid JSON, fix a broken file | 2001 · JSON |
| 61 | REST APIs, authentication | Lab · Jason | Asking the boxes politely | Topic gig: verbs, a URL path | 2000 · REST |
| 62 | SDN | Lab · Ansible, Hypervisor | The corp's controller, and the street's own | Topic gig | 2008 · OpenFlow |
| 63 | Ansible, Puppet, Chef | Lab · Ansible | The street writes its own play | Topic gig: agent or agentless, a YAML play | 2012 · Ansible |
| — | **FINALE** | The Watson Exchange | Opening Night. Crew of three. Old Root watches. Vesper does not interfere. | **The Mega Lab**, rebuilt from the course's addressing plan | a montage of every year you learned |

### The ending

After the finale gig: the council clerk reads the result; the clinic wing's lights come on across the street; each
runner still alive sends one last line; Old Root gives you a nod and nothing else; Vesper's last line; Dispatch says
"Well done." for the only time in the game. Then an end card: your handle on the Board as Class A, your record
(nights, dives, clean floors, crew saved, crew lost, flatlines), and ARC 02 · ICE lit on the map as the next arc.

## 7. The numbers (first pass, tuned by playing)

**Rep and classes.** Today's thresholds (C at 90) would make a player Class C by night 3. Proposed, so each class lasts
its act:

| Class | Rep needed | Gig rep (first clear) | Gigs in the act | Rite |
|---|---|---|---|---|
| D | 0 | 10 | ~20 | +40 |
| C | 180 | 15 | ~15 | +60 |
| B | 420 | 20 | ~20 | +80 |
| A | 820 | 25 | ~13 + finale | finale +150 |

Rep from crew calls stays small (±2 to ±5). A re-run pays 40%. A fixer run pays nothing.

**Creds.** Pay covers upkeep with room to buy gifts, braindances and the odd fixer.

| Class | Gig pay | Dive upkeep (hunger + chrome at stall prices) | Net per clean gig | Fixer fee |
|---|---|---|---|---|
| D | 60 | ~23 | ~37 | 60 |
| C | 100 | ~36 | ~64 | 100 |
| B | 150 | ~52 | ~98 | 150 |
| A | 220 | ~70 | ~150 | 220 |

A fixer costs about two clean gigs of profit at every class, so it is a real choice, never a habit.

**The body.** Unchanged rules: costs at jack-in, 1 chrome per bad command, no time drain, Marrow's tab so nobody
soft-locks. Rites cost about 1.5 times a normal dive.

## 8. Continuity rules for writers

- The night order is the story's order. A scene may mention anything from earlier nights, never later ones.
- Vesper appears in person on nights 4 (a stranger at the noodle bar), 19, 22, 33, 51 and the finale. Before night 51
  nobody names her as the one behind the tests.
- Every district has one line where someone says the corp towers run on this same street tech.
- Old Root leaves after night 22. After that he is spoken of, not seen, until the finale.
- The crew archetypes and their lines follow `docs/CREW_ARCHETYPES.md`.
- The voice follows `docs/STORY_BIBLE.md` (the owner's rule: no two-beat lines, plain interface text).

## 9. Building it

- One night per commit: level(s) in `js/data/stages/NN-name.js`, gig(s) in `js/data/jobs/NN-name.js`, glossary,
  quickhack (skill), the day's cards mapped to the skill, `npm test` green, played once in the browser.
- The old demo content (nights 20–22 and the three placeholder rites) is rewritten when the campaign reaches it.
- Engine gaps found on the way (for example `nslookup` on a PC, VRF, GRE, a WLC) get their own commit with a test.
- New NPC: Vesper Kade needs a portrait line in `tools/gen_npcs.py` for the owner to run.
