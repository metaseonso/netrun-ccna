/* jobs/01-wires.js — District 01 · The Wires (nights 1–4): devices, cables, the OSI model, the CLI. */
(function(){
  JOBS.push(
    // ------------------------------------------------------------------ D · First Jack-In
    { id: 'd-first-jack', cls: 'D', rep: 30, from: 'enable', title: 'First Jack-In', requires: ['cli-intro'], devices: ['R1'],
      brief: 'DISPATCH » Enable has a pop-up router in Kabuki with nothing on it yet. Name it, put a password on the second door, save. That is the whole gig. Do not overthink it.\n\nCLIENT (a noodle bar owner) » "The man said it needs a name and a password. I do not know what that means. Please do not break the card reader."',
      map: { w: 520, h: 200, nodes: [ { id: 'R1', label: 'R1', type: 'router', x: 260, y: 90 }, { id: 'PC', label: 'your deck', type: 'pc', x: 90, y: 90 } ], links: [ { a: 'PC', b: 'R1' } ] },
      shows: { R1: { 'show version': 'Cisco IOS Software, C2900 Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4\nR1 uptime is 3 minutes\nSystem image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"' } },
      day: [4], team: null,
      solution: [ { dev: 'R1', type: ['enable', 'configure terminal'] }, 'commit', { dev: 'R1', type: ['hostname NC-R1'] }, 'commit', { dev: 'R1', type: ['enable secret cyber'] }, 'commit', { choose: 1 }, 'commit', { dev: 'R1', type: ['end', 'copy run start'] }, 'commit' ],
      steps: [
        { type: 'cmd', skill: 'cli-modes', text: 'Enable, from his stool: "Door one, door two, door three. Get to global configuration on R1. I want to see (config)# in the prompt."', need: [ { dev: 'R1', mode: 'priv', line: 'configure terminal' } ], hint: 'R1> enable\nR1# configure terminal', ok: '"Third door. In."',
          why: 'Enable: Three doors. When you arrive the prompt ends in > and you can only look. Type enable to open door two. The prompt changes to #. Type configure terminal to open door three. The prompt changes to (config)#. Only behind door three can you change the box. Short forms work: en, then conf t.' },
        { type: 'cmd', skill: 'cli-modes', text: '"The owner wants it called NC-R1. The prompt will change when you get it right."', need: [ { dev: 'R1', mode: 'config', line: 'hostname nc-r1' } ], hint: 'R1(config)# hostname NC-R1', ok: '"It knows its name."',
          why: 'Enable: The box has a name and it shows at the start of every prompt. Behind door three, type hostname NC-R1. Look at the prompt. If it now says NC-R1(config)#, it worked. If it still says R1, you are behind the wrong door or the name is misspelled.' },
        { type: 'cmd', skill: 'cli-modes', text: '"Lock door two. The hashed kind. Any password you like, I will not read it."', need: [ { dev: 'R1', mode: 'config', line: /^enable secret \S+/ } ], hint: 'NC-R1(config)# enable secret <password>', ok: '"Hashed. The other command stores it in plain text. I have never understood who chooses that."',
          why: 'Enable: This is the password for door two. Type enable secret followed by any word. The word secret matters. It scrambles the password before saving it, so anyone reading the config sees nonsense. The other command, enable password, saves it as plain readable text. Never that one.' },
        { type: 'choice', skill: 'cli-modes', text: 'The owner, from behind the counter: "So it is done? If the power goes, it stays?"', opts: ['Yes, it is in the startup-config now', 'No. It is in the running-config, in memory. A reboot loses it until it is saved', 'Yes, it is in flash with the software', 'It is only in the terminal history'], a: 1, hint: 'Memory is now. NVRAM is after a reboot.', ok: 'Enable: "Correct. So do something about it."',
          why: 'Enable: The box keeps two copies of its settings. The running-config is what it is doing right now, and it lives in memory. Memory forgets when the power goes. The startup-config is the saved copy the box reads when it turns on. Nothing you typed has been saved yet. So the honest answer to the owner is: not yet.' },
        { type: 'cmd', skill: 'cli-modes', text: '"Save it."', need: [ { dev: 'R1', line: /^(do )?write memory$/ } ], hint: 'NC-R1# write memory   (or copy running-config startup-config)', ok: '"[OK]. Door closes behind you."',
          why: 'Enable: Saving copies memory into the startup file. Two ways to say it: write memory, or copy running-config startup-config. Short forms: wr, or copy run start. The box answers [OK]. If you are still behind door three, type end first, or say do write memory. After that, a power cut cannot take your work.' }
      ], outro: 'The owner brings you a bowl of noodles you did not order. Enable nods once, which is as much as anyone gets. Dispatch: "Rep credited. Old Root is asking for someone at the clinic."' }
  );
})();
