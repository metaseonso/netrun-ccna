/* Stage 7 · The Ice — security fundamentals, ACLs, port security. Framework stub: one intro level. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'ice', arc: 'grid', title: 'STAGE 7 · THE ICE', sub: 'security fundamentals, ACLs, port security, snooping', npc: 'ace', status: 'stub', levels: [
    { id: 'ace-intro', title: 'Top to bottom, once', sub: 'Days 34–35, 48–50 · ACLs, port security, DHCP snooping, DAI', npc: 'ace', day: [34,35,48,49,50], src: [PS('Standard_Access_Control_Lists.md'), PS('Port_Security.md'), PS('DHCP_Snooping.md'), SJ('23 - Day 34 - Standard ACLs.md')], unlocks: ['acl-standard', 'port-security'],
      beats: [
        { k: 'SCENE', where: 'A gate on the corpo side of Watson · a clipboard · a dog',
          lines: [
            { who: 'narr', text: 'A woman with short red hair and a scar reads from a list. A brown dog sits beside her and watches your hands.' },
            { who: 'ace', text: 'This is an [[ACL]]. A list of rules. I read it from the top. The first line that matches you, I do what it says and I stop reading. If I get to the bottom and nothing matched, you do not get in. That last rule is not written down. It is always there. [[Implicit deny]].' },
            { who: 'you', text: 'So the order of the list matters.' },
            { who: 'ace', text: 'The order is the list. Put the permit above the deny and the deny never runs. I will not explain that twice.' }
          ],
          choice: { opts: [
            { say: 'What does the dog do?', reply: '"Sticky works the switch ports. [[Port security]]. She learns the first face that shows up on a port and keeps it. [[Sticky MAC]]. Second face on the same port, she does what I told her: shut it, drop the stranger, or drop and count. Do not pet her."' },
            { say: 'Where does a list like this go?', reply: '"A standard list only looks at where you came from, so it goes close to where you are going. An extended list looks at source, destination and port, so it goes close to where you started. Inbound or outbound on an interface. The list does nothing until it is applied."' }
          ] } },
        { k: 'LORE', text: 'Ace Elle, not looking up from the clipboard: "On 2 November 1988 a graduate student named Robert Morris released a worm that hit about a tenth of the machines on the internet in a day. First conviction under the computer fraud law. The CERT coordination centre was set up because of it. Every list I read is a descendant of that night."' },
        { k: 'KIT', text: 'A page off the clipboard.', kit: [ { cmd: 'access-list 10 deny 192.168.2.0 0.0.0.255 → access-list 10 permit any', what: 'a standard numbered list with a [[wildcard mask]]' }, { cmd: 'interface g0/2 → ip access-group 10 out', what: 'apply it, close to the destination' }, { cmd: 'switchport port-security → maximum 2 → violation restrict → mac-address sticky', what: 'Sticky\'s instructions' } ] },
        { k: 'SYNC', q: { prompt: 'Ace Elle: "Packet reaches the end of my list. No line matched. What happens?"', opts: ['It is permitted', 'It is dropped by the implicit deny', 'It is logged and permitted', 'It goes back to the top'], a: 1, yes: '"Dropped. Nobody wrote that rule. Nobody has to."', no: '"Implicit deny. If nothing matched, it does not get in."' } }
      ] }
  ] });
})();
