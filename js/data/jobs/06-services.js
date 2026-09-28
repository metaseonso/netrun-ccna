/* jobs/06-services.js — District 06 · The Services (the exchange hall): TCP and UDP, IPv6, NTP, DNS, DHCP, SNMP, syslog, SSH, FTP and TFTP, NAT, QoS. */
(function(){
  const IMG = 'c2900-universalk9-mz.spa.155-3.m4a.bin';
  JOBS.push(
    // ------------------------------------------------------------------ night 43 · from Lab 43 (FTP and TFTP)
    { id: 'b-n43-image-in-the-basement', cls: 'B', rep: 20, from: 'shell', title: 'The Image in the Basement', day: [43], requires: ['n43-the-image'], devices: ['R1', 'R2'],
      brief: 'DISPATCH » Clinic routers. Old image, known hole. Shell has the new one on the basement server. Both boxes upgraded before the four o\'clock restart.\n\nCLIENT (Imani, the clinic) » "Shell says the ward phones go quiet for a few minutes at four. I have told the night shift. Please keep it to a few minutes."',
      net: {
        devices: {
          R1: { kind: 'router' }, R2: { kind: 'router' }, SW1: { kind: 'switch', mac: '0011.4343.0001' },
          SRV1: { kind: 'server', ip: '10.43.0.100', mask: '255.255.255.0', gw: '10.43.0.1', files: [{ name: IMG, size: 97794040 }], ftp: { user: 'shell', pass: 'onetime' } }
        },
        links: [ { a: 'R1', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/1' }, { a: 'R2', ap: 'gigabitethernet0/0', b: 'SW1', bp: 'gigabitethernet0/2' }, { a: 'SW1', ap: 'fastethernet0/1', b: 'SRV1' } ],
        preconfig: { R1: ['interface gigabitethernet0/0', 'ip address 10.43.0.1 255.255.255.0', 'no shutdown'], R2: ['interface gigabitethernet0/0', 'ip address 10.43.0.2 255.255.255.0', 'no shutdown'] }
      },
      map: { w: 520, h: 300, nodes: [
          { id: 'R1', label: 'clinic router 1', type: 'router', x: 130, y: 60 }, { id: 'R2', label: 'clinic router 2', type: 'router', x: 390, y: 60 },
          { id: 'SW1', label: 'basement switch', type: 'switch', x: 260, y: 160 }, { id: 'SRV1', label: 'image server 10.43.0.100', type: 'server', x: 260, y: 256 } ],
        links: [ { a: 'R1', b: 'SW1' }, { a: 'R2', b: 'SW1' }, { a: 'SW1', b: 'SRV1' } ] },
      steps: [
        { type: 'form', skill: 'ftp-tftp', text: 'Shell, laptop open on the cabinet shelf: "Before anything moves, tell me what each of them runs on."',
          fields: [ { key: 'tt', label: 'TFTP runs over', options: ['TCP', 'UDP'], answer: 'UDP' }, { key: 'tp', label: 'TFTP server port', options: ['20', '21', '22', '69'], answer: '69' },
            { key: 'fc', label: 'FTP control connection', options: ['TCP 20', 'TCP 21', 'UDP 69', 'TCP 22'], answer: 'TCP 21' }, { key: 'fd', label: 'FTP data connection', options: ['TCP 20', 'TCP 21', 'UDP 69', 'TCP 22'], answer: 'TCP 20' } ],
          hint: 'Trivial means UDP. FTP has two connections, one for commands and one for the file.', ok: 'Shell: "Good. Now look at what the router has."',
          why: 'Shell: TFTP runs over UDP and the server listens on port 69. FTP runs over TCP with two connections: the control connection on port 21 carries the login and the commands, and the data connection on port 20 carries the file.' },
        { type: 'cmd', skill: 'ftp-tftp', text: 'Shell: "Open R1 and look in flash. I want the name of the image it runs now and how much room is left."',
          need: [ { dev: 'R1', line: /^(do )?show flash:?$/ } ], hint: 'R1> enable\nR1# show flash', ok: 'Shell: "One-five-one. Old enough to have the hole, and there is room for the new one beside it."',
          why: 'Shell: show flash lists every file in flash with its size, and the last line says how many bytes are free. The new image is ninety-seven million bytes, so check it fits before you copy it in.' },
        { type: 'cmd', skill: 'ftp-tftp', text: 'Shell: "R1 takes it over TFTP. The server is 10.43.0.100 and the file is ' + IMG + '. Answer the questions it asks."',
          check: (d) => (d.R1.flash || []).some(f => f.name === IMG),
          hint: 'R1# copy tftp: flash:\nAddress or name of remote host []? 10.43.0.100\nSource filename []? ' + IMG + '\nDestination filename [' + IMG + ']? (press Enter)', ok: 'Shell: "Every exclamation mark is a block the server sent and R1 acknowledged. It is in."',
          why: 'Shell: copy tftp: flash: copies a file from a TFTP server into flash. The router asks for the server\'s address, the file name on the server, and the name to save it under, and pressing Enter keeps the same name. TFTP asks for no login, so anyone who can reach the server could do the same.' },
        { type: 'cmd', skill: 'ftp-tftp', text: 'Shell: "R2 gets it over FTP, so the server can see who took it. Give R2 the login first, username shell and password onetime, then copy it in."',
          check: (d, ctx) => (d.R2.flash || []).some(f => f.name === IMG) && ctx.cfg('R2').ftpUser === 'shell',
          hint: 'R2> enable\nR2# configure terminal\nR2(config)# ip ftp username shell\nR2(config)# ip ftp password onetime\nR2(config)# end\nR2# copy ftp: flash:\n(same answers as R1)', ok: 'Shell: "The server logged the login. So would anyone with a laptop on that switch, which is why the login dies tonight."',
          why: 'Shell: FTP asks for a username and a password, so the router needs them before it can fetch anything: ip ftp username and ip ftp password in global configuration. Then copy ftp: flash: asks the same questions as TFTP. Without the login the server refuses with Incorrect Login/Password.' },
        { type: 'cmd', skill: 'ftp-tftp', text: 'Shell: "Both have the file. Now tell each router to load it at the next restart, and save, or at four they come back up on the old one."',
          check: (d, ctx) => ['R1', 'R2'].every(r => (ctx.cfg(r).bootSystem || []).includes(IMG) && /boot system flash:c2900-universalk9-mz\.spa\.155-3\.m4a\.bin/.test(d[r].startup || '')),
          hint: 'On R1 and on R2:\n# configure terminal\n(config)# boot system flash:' + IMG + '\n(config)# end\n# write memory', ok: 'Shell: "Saved on both. They will come up on the new image."',
          why: 'Shell: boot system flash:FILE tells the router which image to load when it starts. It is a line of config like any other, so it only survives the restart if you save it with write memory. Until the restart the router keeps running the old image.' },
        { type: 'cmd', skill: 'ftp-tftp', text: 'Shell: "One more file before four. If R1 comes up wrong, I want its config somewhere else. Copy R1\'s running-config to the server over TFTP and keep the name it offers."',
          check: (d) => (d.R1.sent || []).some(x => x.what === 'running-config' && x.host === '10.43.0.100'),
          hint: 'R1# copy running-config tftp:\nAddress or name of remote host []? 10.43.0.100\nDestination filename [r1-confg]? (press Enter)', ok: 'Shell: "r1-confg is on the server. Now I have R1 on paper, near enough."',
          why: 'Shell: copy running-config tftp: sends the router\'s current config to a TFTP server as a file, named hostname-confg unless you change it. It is the quickest backup there is, and it crosses the wire in cleartext, so it goes to a server on a network nobody else is on.' },
        { type: 'form', skill: 'ftp-tftp', text: 'Imani, on the stairs with a flask of tea: "Shell keeps saying flash and nvram like they are places. What kind of place is each one?"',
          fields: [ { key: 'fl', label: 'flash:', options: ['disk', 'nvram', 'network', 'opaque'], answer: 'disk' }, { key: 'nv', label: 'nvram:', options: ['disk', 'nvram', 'network', 'opaque'], answer: 'nvram' },
            { key: 'tf', label: 'tftp:', options: ['disk', 'nvram', 'network', 'opaque'], answer: 'network' }, { key: 'sy', label: 'system:', options: ['disk', 'nvram', 'network', 'opaque'], answer: 'opaque' } ],
          hint: 'show file systems lists the type of every one.', ok: 'Imani: "So the image lives on a disk, and the server is a place on the network. Fine."',
          why: 'Shell: show file systems lists them. Flash is storage for images and files, type disk. NVRAM holds the startup-config, type nvram. tftp: and ftp: are servers reached over the network, type network. system: and the other internal ones are type opaque.' },
        { type: 'choice', skill: 'ftp-tftp', text: 'Shell, closing the cabinet: "Next month the server moves behind a firewall that drops any connection started from outside it. The routers are the clients. Which FTP mode still works, and why?"',
          opts: ['Passive, because the client opens the data connection as well as the control connection', 'Active, because the server opens the data connection', 'Either, because FTP only uses port 21', 'Neither, because FTP cannot cross a firewall'], a: 0,
          hint: 'In one mode the server calls the client back for the data. In the other the client makes both calls.', ok: 'Shell: "Passive. I will set it before the move."',
          why: 'Shell: In active mode the client opens the control connection to port 21, and then the server opens the data connection back to the client. In passive mode the client opens both. A firewall that drops connections started from outside will stop the server calling back, so passive mode is the one that gets through.' }
      ],
      solution: [ { form: { tt: 'UDP', tp: '69', fc: 'TCP 21', fd: 'TCP 20' } }, 'commit', { dev: 'R1', type: ['enable', 'show flash'] }, 'commit',
        { dev: 'R1', type: ['copy tftp: flash:', '10.43.0.100', IMG, ''] }, 'commit',
        { dev: 'R2', type: ['enable', 'configure terminal', 'ip ftp username shell', 'ip ftp password onetime', 'end', 'copy ftp: flash:', '10.43.0.100', IMG, ''] }, 'commit',
        { dev: 'R1', type: ['configure terminal', 'boot system flash:' + IMG, 'end', 'write memory'] }, { dev: 'R2', type: ['configure terminal', 'boot system flash:' + IMG, 'end', 'write memory'] }, 'commit',
        { dev: 'R1', type: ['copy running-config tftp:', '10.43.0.100', ''] }, 'commit',
        { form: { fl: 'disk', nv: 'nvram', tf: 'network', sy: 'opaque' } }, 'commit', { choose: 0 }, 'commit' ],
      outro: 'At four the routers restart one after the other and both come back on the new image. The ward phones are quiet for four minutes and ten seconds, and Imani writes the time on the whiteboard by the nurses\' station. Shell deletes the FTP login from the server before he goes up the stairs.' }
  );
})();
