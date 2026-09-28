/* District 07 · The ICE — the gate. Nights 34 and 35 (standard and extended ACLs); nights 48–51 follow (security
   fundamentals, port security, DHCP snooping, DAI). Ace Elle and her dog Sticky. Written to docs/STORY_BIBLE.md (Voice)
   and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS } = SRC;
  STAGES.push({ id: 'ice', arc: 'grid', title: 'STAGE 7 · THE ICE', sub: 'ACLs, security fundamentals, port security, snooping', npc: 'ace', status: 'live', levels: [
    // ------------------------------------------------------------ night 34 · standard ACLs
    { id: 'n34-top-to-bottom', title: 'Top to bottom, once', sub: 'standard ACLs', npc: 'ace', day: [34], src: [PS('Standard_Access_Control_Lists.md')], unlocks: ['acl-standard'],
      beats: [
        { k: 'SCENE', where: 'The gate · Ace Elle\'s booth · twenty to two in the morning',
          lines: [
            { who: 'narr', text: 'Rain drums on the booth\'s tin roof, and a space heater under the desk blows hot air that smells of wet dog. Two routers hum on a shelf above a steel door. A woman with short red hair and a scar through one eyebrow reads a clipboard with her finger, line by line, from the top. A brown dog lies across the doorway and watches your hands.' },
            { who: 'ace', text: 'You\'re the one who brought Every Road Home back up. Dispatch says you\'re Class B now, so you get my problems. Sit where Sticky can see you.' },
            { who: 'ace', text: 'Last night somebody at a market kiosk reached the clinic\'s records server. They didn\'t take anything that I can find. They knocked, the door opened, and they walked away again, and I want that door shut before they come back.' },
            { who: 'ace', text: 'The door is an [[ACL]], an access control list. Every line on it is an [[access control entry]]. I read it from the top, and the first line that matches the packet decides: permit or deny, and I stop reading. If I reach the bottom and nothing matched, it doesn\'t get in. Nobody types that last rule. It\'s the [[implicit deny]], and it\'s at the bottom of every list.' },
            { who: 'you', text: 'What does a line check?' },
            { who: 'ace', text: 'On a [[standard ACL]], only the source address, where the packet came from. It can\'t see where it\'s going. So I put it as close to the destination as I can, right in front of the records server, or it will turn away people who were headed somewhere else.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do you write a line?', reply: 'Ace: "Standard lists get a number from 1 to 99, or 1300 to 1999 when those run out. access-list 10 permit, then an address and a [[wildcard mask]]. A 0 bit in the mask means that bit has to match, a 1 means I don\'t care, so 0.0.0.255 takes the whole /24. The words any and host save typing: any is everyone, host is one address."' },
            { tone: 'press', say: 'Why not stop them at the gate, where they come in?', reply: 'Ace: "Because this list only knows who you are, not where you\'re going. Put it on the market\'s port and that kiosk can\'t reach anything at all: the council\'s page, the noodle bars, my office. I want to stop one knock at one door."' },
            { tone: 'quiet', say: '(Hold your hand out, low, for the dog.)', reply: 'Sticky sniffs your knuckles once and puts her head back down on her paws. Ace watches, then writes something on the clipboard. "She remembers the first face on a port. Now she\'ll remember yours."' }
          ] } },
        { k: 'SCENE', where: 'The booth · the router shelf',
          lines: [
            { who: 'ace', text: 'A list does nothing sitting in the config. You apply it to an interface, inbound or outbound. Inbound, the router checks the packet as it arrives, before it looks at its routing table. Outbound, it checks it on the way out of the port. One list per direction on each interface, so two at most.' },
            { who: 'ace', text: 'The records server hangs off R2\'s g0/0. Outbound on that port is the last door before the server, and that\'s where the list goes.' },
            { who: 'ace', text: 'You can name a list instead of numbering it. ip access-list standard, then the name, and every line inside gets a sequence number, 10, 20, 30, so you can find it again. show access-lists reads them all back to you in order.' },
            { who: 'narr', text: 'She turns the clipboard round. Under the rules, somebody has written a date in pencil and underlined it twice: the night a switch nobody owned wiped the market floor\'s VLANs. Below it is a column of dates and times, one for every door tried since.' },
            { who: 'ace', text: 'Whoever it is knows which kiosk still has the clinic\'s old cable running under the market floor. Not many people are left who do.' },
            { who: 'narr', text: 'She reaches up and lays two fingers on the warm lid of R2, the way you would check on a sleeping animal.' },
            { who: 'ace', text: 'The towers downtown guard their doors with this same kind of list, on this same kind of box, read top to bottom.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'Inbound or outbound, how do I choose?', reply: 'Ace: "Ask what the router should throw away. Inbound on the market\'s port, the kiosk loses everything past it. Outbound on the records port, it only loses the records. With a standard list, outbound near the destination is nearly always right."' },
            { tone: 'press', say: 'Who do you think it is?', reply: 'She taps the pencilled date with one fingernail. "When I can prove it, I\'ll say it, and not before." Sticky\'s ears go up at her tone and settle again.' },
            { tone: 'joke', say: 'Does Sticky get a list too?', reply: 'Ace: "Sticky\'s is shorter. The first face she sees on a port is allowed, and nobody else. She doesn\'t need to read it twice."' }
          ] } },
        { k: 'LORE', title: 'THE LIST AT THE GATEWAY', year: 1988, real: ['dec'], vibe: 'Bodacious. A computer that finally asked who you were before it let you in.',
          text: 'Ace, feeding Sticky a biscuit from her pocket: "My first boss kept a photocopy of this taped inside the booth. In 1988 engineers at Digital Equipment Corporation, DEC, built the first packet filters: a gateway that read the addresses on every packet and checked them against a list before it let one through. In 1989 one of them, Jeff Mogul, published how it worked so that anyone could build one. He built the first filter at this gate from that paper."' },
        { k: 'KIT', text: 'Ace writes the gate\'s rules on the back of a visitor pass and hands it over.', kit: [
          { cmd: 'access-list 10 permit 192.168.1.0 0.0.0.255', what: 'standard, numbered 1–99 or 1300–1999. Source address only. Top to bottom, first match wins' },
          { cmd: 'access-list 10 deny host 192.168.2.10 · access-list 10 permit any', what: 'host is one address, any is everyone. Nothing matched at the bottom: implicit deny' },
          { cmd: 'access-list 10 remark TEXT', what: 'a note on the list for the next person' },
          { cmd: 'interface g0/0 · ip access-group 10 out', what: 'apply it close to the destination. One list per interface per direction' },
          { cmd: 'ip access-list standard NAME · 10 permit host 192.168.1.10 · 20 deny any', what: 'a named standard list. Every line has a sequence number' },
          { cmd: 'show access-lists · show ip access-lists', what: 'read every list back, in order' } ] },
        { k: 'SYNC', q: { prompt: 'Nurse Imani comes to the gate for her night-shift badge and reads the list over your shoulder: "It only says permit 192.168.1.0 0.0.0.255. Our new pharmacy laptop is on 192.168.5.20. Can it open the records?"', opts: ['No. It matches no line, so the implicit deny drops it', 'Yes. Nothing on the list denies it', 'Yes, because the list is only applied outbound', 'Only after the clinic desks have used it first'], a: 0,
          yes: 'Ace: "No. It needs its own line."', no: 'Ace: "No. It matches nothing, and the bottom of the list says no to everything."',
          why: 'Ace: The list has one line, a permit for 192.168.1.0 with wildcard 0.0.0.255, which is the clinic\'s 192.168.1.x desks. 192.168.5.20 doesn\'t match it, so the router reaches the bottom of the list, where the implicit deny drops everything that matched nothing. If the pharmacy should get in, add access-list 10 permit 192.168.5.0 0.0.0.255.' } }
      ] }
  ] });
})();
