/* jobs/06-services.js — District 06 · The Services (the exchange hall): TCP and UDP, IPv6, NTP, DNS, DHCP, SNMP, syslog, SSH, FTP and TFTP, NAT, QoS. */
(function(){
  const { gi, fa } = NETKIT;
  JOBS.push(
    // ------------------------------------------------------------------ night 30 · TCP and UDP (no lab: a topic gig)
    { id: 'c-n30-courier-desk', cls: 'C', rep: 15, from: 'syn', title: 'Signed For, Twice', day: [30], requires: ['n30-twins'], devices: ['R1', 'PC1'],
      brief: 'DISPATCH » The courier desk at the exchange hall can open the parcel tracker over plain HTTP but not over HTTPS. Syn and Ack want the handshake, the ports and the filter checked, one by one.\n\nCLIENT (Syn) » "The tracker answers on 80 and not on 443. Somebody\'s put a list on the door. Count it with me."',
      net: {
        devices: {
          R1: { kind: 'router' }, SW1: { kind: 'switch', mac: '0011.2230.0001' },
          PC1: { kind: 'host', ip: '10.30.1.10', mask: '255.255.255.0', gw: '10.30.1.1' }, SRV: { kind: 'server', ip: '10.30.2.80', mask: '255.255.255.0', gw: '10.30.2.1' }
        },
        links: [ { a: 'SW1', ap: fa(1), b: 'PC1' }, { a: 'R1', ap: gi(0), b: 'SW1', bp: gi(1) }, { a: 'R1', ap: gi(1), b: 'SRV' } ],
        preconfig: { R1: ['interface g0/0', 'ip address 10.30.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 10.30.2.1 255.255.255.0', 'no shutdown',
          'access-list 130 deny tcp any host 10.30.2.80 eq 443', 'access-list 130 permit ip any any', 'interface g0/0', 'ip access-group 130 in'] }
      },
      map: { w: 520, h: 240, nodes: [ { id: 'PC1', label: 'courier desk laptop', type: 'pc', x: 50, y: 120 }, { id: 'SW1', label: 'desk switch', type: 'switch', x: 170, y: 120 }, { id: 'R1', label: 'exchange hall router', type: 'router', x: 310, y: 120 }, { id: 'SRV', label: 'the parcel tracker', type: 'server', x: 460, y: 120 } ],
        links: [ { a: 'PC1', b: 'SW1' }, { a: 'SW1', b: 'R1', ap: gi(1), bp: gi(0) }, { a: 'R1', b: 'SRV', ap: gi(1) } ] },
      steps: [
        { type: 'order', skill: 'tcp-udp', text: 'Syn, knocking on the desk: "The laptop opens a connection to the tracker. Put the three knocks in order."',
          items: ['tracker → laptop: SYN-ACK', 'laptop → tracker: ACK', 'laptop → tracker: SYN'],
          accept: arr => arr.join('|') === ['laptop → tracker: SYN', 'tracker → laptop: SYN-ACK', 'laptop → tracker: ACK'].join('|'),
          hint: 'The one who starts it knocks first.', ok: 'Ack: "Knock, knock-back, answer. Connected."',
          why: 'Syn: TCP opens a connection with a three-way handshake. The client sends a SYN, the server answers with a SYN-ACK, which acknowledges the SYN and sends its own, and the client acknowledges that with an ACK. Only then does data flow.' },
        { type: 'order', skill: 'tcp-udp', text: 'Ack: "And when the laptop\'s done. Four this time."',
          items: ['tracker → laptop: FIN', 'laptop → tracker: FIN', 'laptop → tracker: ACK', 'tracker → laptop: ACK'],
          accept: arr => arr.join('|') === ['laptop → tracker: FIN', 'tracker → laptop: ACK', 'tracker → laptop: FIN', 'laptop → tracker: ACK'].join('|'),
          hint: 'Each side says FIN, and each FIN gets an ACK.', ok: 'Syn: "Both sides done, both sides heard it."',
          why: 'Ack: A TCP connection closes with four messages. The side that is finished sends a FIN, and the other side acknowledges it with an ACK. Then the other side sends its own FIN when it is finished, and the first side acknowledges that. Each direction is closed separately.' },
        { type: 'form', skill: 'tcp-udp', text: 'Syn: "Which courier does which? Me, TCP, or the bike, UDP."',
          fields: [ { key: 'rel', label: 'reliable delivery, resends what is lost', options: ['TCP', 'UDP'], answer: 'TCP' }, { key: 'cl', label: 'connectionless, no handshake', options: ['TCP', 'UDP'], answer: 'UDP' },
            { key: 'seq', label: 'sequence numbers, so everything arrives in order', options: ['TCP', 'UDP'], answer: 'TCP' }, { key: 'oh', label: 'less overhead', options: ['TCP', 'UDP'], answer: 'UDP' },
            { key: 'fc', label: 'flow control with a window size', options: ['TCP', 'UDP'], answer: 'TCP' }, { key: 'rt', label: 'real-time voice and video', options: ['TCP', 'UDP'], answer: 'UDP' } ],
          hint: 'Everything careful is TCP. Everything quick is UDP.', ok: 'Ack: "Six for six. She counted twice."',
          why: 'Syn: TCP is connection-oriented and reliable: it numbers every segment, acknowledges them, resends what is lost, delivers in order and controls the flow with the window size. UDP is connectionless, with no handshake and no acknowledgements, so it has less overhead, which is why real-time voice and video use it.' },
        { type: 'calc', skill: 'tcp-udp', text: 'Ack, running her finger along the pigeonholes: "Which hole does each one go in?"',
          fields: [ { key: 'ssh', label: 'SSH', check: v => String(v).trim() === '22' }, { key: 'https', label: 'HTTPS', check: v => String(v).trim() === '443' }, { key: 'dns', label: 'DNS', check: v => String(v).trim() === '53' },
            { key: 'dhcp', label: 'DHCP server', check: v => String(v).trim() === '67' }, { key: 'tftp', label: 'TFTP', check: v => String(v).trim() === '69' }, { key: 'syslog', label: 'syslog', check: v => String(v).trim() === '514' } ],
          answer: 'SSH 22 · HTTPS 443 · DNS 53 · DHCP server 67 · TFTP 69 · syslog 514', hint: 'Remote shell, secure web, names, leases, trivial files, logs.', ok: 'Syn: "All six. The pigeonholes are right."',
          why: 'Ack: SSH is TCP 22, HTTPS TCP 443, DNS port 53 on both TCP and UDP, the DHCP server UDP 67 (the client listens on 68), TFTP UDP 69 and syslog UDP 514. Telnet is TCP 23, SMTP 25, HTTP 80, POP3 110, FTP 20 and 21, SNMP UDP 161 and 162.' },
        { type: 'form', skill: 'tcp-udp', text: 'Syn: "When the laptop opens the tracker over HTTPS, what ports are on the segment?"',
          fields: [ { key: 'dst', label: 'destination port', options: ['443', '80', 'a random number'], answer: '443' },
            { key: 'src', label: 'source port', options: ['443', 'a random number from 49152 to 65535', 'always 1024'], answer: 'a random number from 49152 to 65535' },
            { key: 'wk', label: 'the well-known range', options: ['0 to 1023', '1024 to 49151', '49152 to 65535'], answer: '0 to 1023' },
            { key: 'reg', label: 'the registered range', options: ['0 to 1023', '1024 to 49151', '49152 to 65535'], answer: '1024 to 49151' } ],
          hint: 'The destination names the service. The source is picked by whoever starts.', ok: 'Ack: "And the reply comes back to that random number, so it finds the right window on the laptop."',
          why: 'Syn: The destination port names the application on the server, 443 for HTTPS. The source port is picked at random by the host that starts the conversation, from the ephemeral range 49152 to 65535, and the reply is sent back to it. IANA\'s well-known ports are 0 to 1023 and the registered ports 1024 to 49151.' },
        { type: 'cmd', skill: 'tcp-udp', text: 'Syn: "Now the list on the door. Show me what the exchange router is filtering."',
          need: [ { dev: 'R1', line: /^(do )?show (ip )?access-lists?( 130)?$/ } ], hint: 'R1> enable\nR1# show access-lists', ok: 'Ack: "Line 10. Deny TCP to the tracker, eq 443. There\'s our puddle."',
          why: 'Syn: show access-lists prints every filter on the router, line by line. List 130 denies TCP traffic to the tracker at 10.30.2.80 with destination port 443, HTTPS, and permits everything else, so plain HTTP on port 80 gets through and HTTPS does not.' },
        { type: 'cmd', skill: 'tcp-udp', text: 'Ack: "The last tech hung that list on the desk\'s port because the tracker\'s certificate kept complaining. Take it off the port so HTTPS gets through again."',
          check: (d, ctx) => ctx.net().tcp('PC1', '10.30.2.80', 443).ok && ctx.net().tcp('PC1', '10.30.2.80', 80).ok,
          hint: 'R1# configure terminal\nR1(config)# interface g0/0\nR1(config-if)# no ip access-group 130 in', ok: 'Syn: "HTTPS answers on 443. Signed for, twice."',
          why: 'Ack: ip access-group 130 in applied the list to every packet arriving on g0/0 from the courier desk. no ip access-group 130 in takes it off the interface, so TCP to port 443 reaches the tracker again. The list itself still exists on the router, doing nothing until it is applied somewhere.' },
        { type: 'form', skill: 'tcp-udp', text: 'Syn: "Last. Which courier carries each of these?"',
          fields: [ { key: 'dhcp', label: 'DHCP', options: ['TCP', 'UDP', 'both'], answer: 'UDP' }, { key: 'ssh', label: 'SSH', options: ['TCP', 'UDP', 'both'], answer: 'TCP' },
            { key: 'dns', label: 'DNS', options: ['TCP', 'UDP', 'both'], answer: 'both' }, { key: 'snmp', label: 'SNMP', options: ['TCP', 'UDP', 'both'], answer: 'UDP' }, { key: 'ftp', label: 'FTP', options: ['TCP', 'UDP', 'both'], answer: 'TCP' } ],
          hint: 'Leases, logs and counters ride the bike. Shells and file transfers need signatures.', ok: 'Ack: "Done. Osi will want that written up."',
          why: 'Syn: DHCP (67, 68), SNMP (161, 162), TFTP (69) and syslog (514) use UDP. SSH (22), Telnet (23), FTP (20, 21), SMTP (25), HTTP (80), POP3 (110) and HTTPS (443) use TCP. DNS uses port 53 on both UDP and TCP.' }
      ],
      solution: [ { order: [2, 0, 1] }, 'commit', { order: [1, 3, 0, 2] }, 'commit', { form: { rel: 'TCP', cl: 'UDP', seq: 'TCP', oh: 'UDP', fc: 'TCP', rt: 'UDP' } }, 'commit',
        { calc: { ssh: '22', https: '443', dns: '53', dhcp: '67', tftp: '69', syslog: '514' } }, 'commit',
        { form: { dst: '443', src: 'a random number from 49152 to 65535', wk: '0 to 1023', reg: '1024 to 49151' } }, 'commit',
        { dev: 'R1', type: ['enable', 'show access-lists'] }, 'commit', { dev: 'R1', type: ['configure terminal', 'interface g0/0', 'no ip access-group 130 in'] }, 'commit',
        { form: { dhcp: 'UDP', ssh: 'TCP', dns: 'both', snmp: 'UDP', ftp: 'TCP' } }, 'commit' ],
      outro: 'The tracker opens over HTTPS on the courier desk\'s laptop, padlock and all. Syn stamps the docket, Ack stamps it again, and Osi files it under the guild\'s name, not the exchange\'s.' }
  );
})();
