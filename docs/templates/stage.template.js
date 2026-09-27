/* stage.template.js — copy to js/data/stages/NN-name.js and register it in index.html.
   One stage = one district location, one lead NPC, several levels (one per day or topic).
   Write scenes, not lectures: docs/STORY_BIBLE.md. Every level: SCENE(s) · LORE · KIT · SYNC(with why). */
(function(){
  const { PS, SJ } = SRC;   // source-link helpers (psaumur / sparrowjumpy note files)
  STAGES.push({ id: 'services-example', arc: 'grid', title: 'STAGE 6 · THE SERVICES'  /* rename to the real stage id and delete the stub */, sub: 'DNS, DHCP, NTP and the rest', npc: 'denise', status: 'stub', levels: [
    { id: 'dhcp-lease', title: 'Four messages and a lease', sub: 'DHCP', npc: 'denise', day: [39], src: [PS('DHCP.md')], unlocks: ['dhcp'],
      cards: [ { q: 'Which DHCP message does the client send first?', opts: ['Offer', 'Discover', 'Request', 'Acknowledge'], a: 1, why: 'The client has no address yet, so it broadcasts a Discover.' } ],
      beats: [
        { k: 'SCENE', where: 'The exchange · Dora\'s desk · a queue of laptops',
          lines: [
            { who: 'narr', text: 'A line of students holding laptops. Dora, the intern, is writing addresses on sticky notes and handing them out one by one.' },
            { who: 'denise', text: 'She is doing it by hand because the router that used to do it was replaced last week and nobody set the pool up again.' },
            { who: 'you', text: 'What does the router actually do when it works?' },
            { who: 'denise', text: 'Four messages. The laptop shouts Discover. The router answers Offer, with an address. The laptop says Request, that one please. The router says Acknowledge. Then the laptop has an address, a mask, a gateway and a DNS server for a set time. That is a [[DHCP]] lease.' }
          ],
          choice: { opts: [
            { say: 'What if the router is on another floor?', reply: '"Then the shout never reaches it, because a broadcast stays on its own floor. You put ip helper-address on the router interface that hears the shout, and it forwards it to the server as a normal packet. That is a [[DHCP relay]]."' },
            { say: 'Why exclude addresses?', reply: '"Because the printer and the server have addresses you typed by hand. If the pool hands one of those out, two machines fight over it. Exclude what you assign by hand before you turn the pool on."' }
          ] } },
        { k: 'LORE', text: 'Denise: "DHCP is RFC 2131, 1997. It grew out of BOOTP from 1985, which needed a table of every machine\'s hardware address typed in by hand. Dora is, at this moment, BOOTP."' },
        { k: 'KIT', text: 'A card from the drawer.', kit: [ { cmd: 'ip dhcp excluded-address 10.0.10.1 10.0.10.9', what: 'first: what you assign by hand' }, { cmd: 'ip dhcp pool NAME → network 10.0.10.0 255.255.255.0 → default-router 10.0.10.1 → dns-server 10.0.10.5', what: 'the pool' }, { cmd: 'ip helper-address 10.0.9.5', what: 'relay, on the interface that hears the broadcast' }, { cmd: 'show ip dhcp binding', what: 'who has what' } ] },
        { k: 'SYNC', q: { prompt: 'Dora: "The laptop got an address but it cannot reach anything outside this floor. What did I forget in the pool?"', opts: ['dns-server', 'default-router', 'lease', 'network'], a: 1, yes: 'Denise: "The gateway. Without default-router the laptop has nowhere to send anything that is not on its own floor."', no: 'Denise: "It has an address, so network was fine. It cannot leave the floor, so it has no gateway. default-router."', why: 'Denise: A lease has four parts: address, mask, gateway, DNS. The pool line default-router sets the gateway. Leave it out and the machine works locally and nowhere else.' } }
      ] }
  ] });
})();
