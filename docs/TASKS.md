# TASKS — the full CCNA arc, day by day

Source order: Jeremy's IT Lab CCNA 200-301 (63 days). Course files (Anki decks per day, Packet Tracer lab per day,
CCNA Mega Lab doc): the Google Drive folder the owner shared. Download it locally, run the importer for cards,
and turn every lab into a gig. `.pkt` files cannot be parsed; rebuild the lab's topology and tasks in `net` form.

Stage plan (arc 01 · THE GRID). Stage files exist as stubs; replace the intro level and add the rest.

| Stage | Days | NPCs | Skills to add to SKILLS |
|---|---|---|---|
| 1 THE WIRES | 1–4 | Osi Sevenfold, Enable | osi-layers, cabling, cli-modes, device-security |
| 2 THE BLOCK | 7–8, 10–13 | Cider | ipv4-basics, ipv4-header, subnetting, vlsm |
| 3 THE FLOOR | 5–6, 9, 16–19, 23 | Mac, Vee Lan | mac-table, arp, switch-interfaces, vlan-config, trunk-config, router-on-stick, dtp-vtp, etherchannel |
| 4 THE BRIDGES ✅ | 20–22 | Old Root | (built; add Day 22 Rapid STP level + gig) |
| 5 THE ROADS | 11, 14–15, 24–29, 44–45 | Nexthop, Ospef | static-route, default-route, dynamic-routing, rip-eigrp, ospf, fhrp, life-of-packet |
| 6 THE SERVICES | 30–43, 46–47 | Syn, Sixx, Denise, Shell, Nat | tcp-udp, ipv6-addressing, ipv6-routing, acl (see stage 7), cdp-lldp, ntp, dns, dhcp, snmp, syslog, ssh, ftp-tftp, nat-static, nat-pat, qos |
| 7 THE ICE | 34–35, 48–50, 58 | Ace Elle (+Sticky), Beacon | security-fundamentals, acl-standard, acl-extended, port-security, dhcp-snooping, dai, wireless-security |
| 8 THE LAB | 51–63 | Prof. Hypervisor, Beacon, Jason, Ansible | lan-arch, wan-arch, virtualization, cloud, wireless-fundamentals, wireless-arch, wireless-config, automation, json-yaml, rest, sdn, config-mgmt |

## Day list (level · cards · gig from the lab)

Days with a ✅ are built. Everything else: write the level(s), import the deck, build the gig, run `npm test`.

| Day | Topic | Stage | Gig idea (from the lab) |
|---|---|---|---|
| 1 | Network Devices | 1 | D: identify devices on a map (`find` × 3), name the layer each works at (`choice`) |
| 2 | Interfaces and Cables | 1 | D: pick cable types (`form`), fix a speed/duplex mismatch (`cmd`, check `n.issues`) |
| 3 | OSI Model / TCP-IP | 1 | D: `order` the layers, `order` the PDUs, `multi` which devices read which header |
| 4 | Intro to the CLI · Basic Device Security | 1 | ✅ First Jack-In (extend: `service password-encryption`, console password, banner) |
| 5 | Ethernet LAN Switching 1 | 3 | D: read `show mac address-table`, `find` the port for a MAC |
| 6 | Ethernet LAN Switching 2 | 3 | D: ARP flow `order`, ping across a switch from a PC console |
| 7 | IPv4 Addressing 1 | 2 | D: `calc` network/broadcast, configure router interfaces, `no shut` gotcha |
| 8 | IPv4 Addressing 2 | 2 | D: classes and masks (`calc`), interface config with verification `show ip interface brief` |
| 9 | Switch Interfaces | 3 | D: speed/duplex/description, `show interfaces status`, fix `n.issues` duplex mismatch |
| 10 | IPv4 Header | 2 | D: header field `order`/`multi`; TTL question via traceroute in engine |
| 11 | Routing Fundamentals 1 | 5 | D: read `show ip route`, connected routes appear with `no shut` |
| 12 | Subnetting 1 | 2 | D/C: `calc` subnetting drills (several fields), configure the result |
| 13 | Subnetting 2 · VLSM | 2 | C: VLSM plan for 4 departments (`calc`), configure, verify pings |
| 14 | Static Routing 2 | 5 | ✅-style: two routers, one-way route bug, fix both directions (engine test #1 is the model) |
| 15 | Life of a Packet | 5 | C: `order` the encapsulation at each hop; traceroute; ARP tables on PCs |
| 16 | VLANs 1 | 3 | D: create VLANs, assign access ports, verify `sameSegment` |
| 17 | VLANs 2 | 3 | C: router-on-a-stick subinterfaces, trunk, `ping` across VLANs (engine test #5) |
| 18 | VLANs 3 | 3 | C: L3 switch SVIs + `ip routing`, native VLAN mismatch issue |
| 19 | DTP / VTP | 3 | C: `switchport nonegotiate`, mode mismatch issue, `choice` on VTP modes |
| 20 | STP 1 ✅ | 4 | built |
| 21 | STP 2 ✅ | 4 | built (6 gigs) |
| 22 | Rapid STP | 4 | C: mode rapid-pvst everywhere, port roles alternate/backup `choice`, edge ports |
| 23 | EtherChannel | 3 | C: LACP active/passive, mode mismatch issue, `show etherchannel summary` |
| 24 | Dynamic Routing | 5 | C: AD comparison `calc`, floating static |
| 25 | RIP & EIGRP (+ EIGRP lab) | 5 | C: RIP v2 no auto-summary, EIGRP AS, `show ip protocols` |
| 26–28 | OSPF 1–3 | 5 | C/B: router-id, network statements, passive-interface, area mismatch bug, cost, default-information originate (engine test #2) |
| 29 | FHRP | 5 | B: HSRP active/standby, preempt, priority (engine test #7) |
| 30 | TCP & UDP | 6 | C: `order` the handshake, `multi` well-known ports, extended ACL by port |
| 31–33 | IPv6 1–3 | 6 | C/B: `calc` compression, EUI-64, `ipv6 unicast-routing`, static v6 routes, `show ipv6 interface brief` |
| 34 | Standard ACLs | 7 | C: deny a subnet near destination (engine test #3) |
| 35 | Extended ACLs | 7 | C: permit HTTP only near source (engine test #3) |
| 36 | CDP & LLDP | 6 | D: map a network from `show cdp neighbors`, disable CDP on the edge |
| 37 | NTP | 6 | D: `ntp server`, `show ntp status`, why logs need time |
| 38 | DNS | 6 | D: `ip name-server`, `ip domain-lookup`, PC `nslookup` (add to Show.host if needed) |
| 39 | DHCP | 6 | C: pool, exclusions, default-router, relay with `ip helper-address` |
| 40 | SNMP | 6 | D: communities ro/rw, `choice` on versions |
| 41 | Syslog | 6 | D: `logging host`, severity `order` |
| 42 | SSH | 6 | C: full SSH readiness `n.sshReady`, ACL on vty with `access-class` |
| 43 | FTP & TFTP | 6 | D: `choice`/`form` on ports and use cases |
| 44 | NAT Static | 6 | C: static NAT inbound to a server (engine test #4) |
| 45 | NAT Dynamic / PAT | 6 | C: PAT overload to the internet, ISP drops private source without it |
| 46 | QoS 1 · Voice LAN | 6 | C: voice VLAN, `form` on DSCP values |
| 47 | QoS 2 | 6 | C: `order` queuing concepts, `multi` |
| 48 | Security Fundamentals | 7 | D: CIA triad `multi`, attack types `form` |
| 49 | Port Security | 7 | C: MAC flood → err-disabled, restrict vs shutdown, sticky (engine test #6) |
| 50 | DHCP Snooping · DAI | 7 | B: rogue DHCP + ARP spoof, trust the uplink (engine tests #5, #6) |
| 51 | LAN Architectures | 8 | D: `order` three-tier, `choice` spine-leaf |
| 52 | WAN Architectures | 8 | D: `form` on MPLS/VPN/leased line |
| 53–55 | Virtualization · Cloud · Containers · VRF | 8 | D/C: `multi`/`form`; VRF gig if engine gets `ip vrf` (add with test) |
| 56–59 | Wireless Fundamentals · Architectures · Security · Configuration | 8 | C/B: channels `calc`, WPA2/WPA3 `form`, WLC `form` steps |
| 60 | Network Automation | 8 | D: planes `order`, `multi` |
| 61 | JSON · XML · YAML | 8 | C: `text` step: write valid JSON for a given object; fix a broken snippet |
| 62 | REST APIs | 8 | C: `form` verbs, `text` a URL path |
| 63 | Ansible · Puppet · Chef | 8 | C: `form` agent vs agentless, `text` a YAML play skeleton |
| MEGA LAB | everything | A capstone | A: one building, all skills, team `{ min: 3 }`, long `solution` |

## Beyond content

- Extend protégé lines and add a few recurring named protégés with arcs (optional, after the campaign).
- OAuth: follow `docs/AUTH_PLAN.md` when the owner is ready. No code changes outside `config/platform.js` and one script tag should be needed.
- Arcs 00, 02–04 stay locked. The engine is arc-agnostic; a new arc is a new set of stage files with `arc: 'ice'` etc.
