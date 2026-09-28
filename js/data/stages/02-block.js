/* District 02 · The Block — Cider's bar, where address blocks get divided.
   Nights 7, 8, 10 (IPv4 addresses, the IPv4 header) and 13–15 (subnetting, VLSM).
   Written to docs/STORY_BIBLE.md (Voice) and docs/CAMPAIGN_MAP.md. */
(function(){
  const { PS, SJ } = SRC;
  STAGES.push({ id: 'block', arc: 'grid', title: 'STAGE 2 · THE BLOCK', sub: 'IPv4 addressing and subnetting', npc: 'cider', status: 'live', levels: [
    // ------------------------------------------------------------ night 7 · IPv4 addresses, part 1
    { id: 'n07-the-counter', title: 'Thirty-two notches', sub: 'IPv4 addresses, binary and classes', npc: 'cider', day: [7], src: [PS('IPv4_Addressing_Part1.md')], unlocks: ['ipv4-addr'],
      beats: [
        { k: 'SCENE', where: 'The Block · Cider\'s bar · late',
          lines: [
            { who: 'narr', text: 'The bar smells of cut apples and warm sugar, and a fan in the corner turns slowly without cooling anything. The steel counter is scored along its whole length with fine notches in groups of eight. Behind it a woman with a copper-red bun is cutting a sheet of clear acrylic along a steel ruler, one slow pass of the knife at a time.' },
            { who: 'cider', text: 'Osi says you can read a label and Mac says you can read a table. Sit down. On this block I hand out addresses, and I want to know you can count before I let you near one.' },
            { who: 'cider', text: 'An [[IPv4 address]] is thirty-two bits, four bytes. I split it into four groups of eight, the [[octet]]s, and write each one as a number with a dot between them. 192.168.7.20 is four octets.' },
            { who: 'cider', text: 'Every bit in an octet is worth something, from the left: 128, 64, 32, 16, 8, 4, 2 and 1. You add up the ones that are switched on. 11000000 is 128 plus 64, so 192. All eight on is 255, and that\'s as high as an octet goes.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'How do I go the other way, from 192 to binary?', reply: 'Cider: "Start at 128. If the number is at least 128, write a 1 and take 128 away; if not, write a 0. Then do the same with 64, then 32, all the way down to 1. For 168 that\'s 1, leaving 40; 0 for 64; 1 for 32, leaving 8; 0, 1, 0, 0, 0. So 10101000."' },
            { tone: 'press', say: 'Why thirty-two bits? Why not more?', reply: 'Cider: "Because in 1981 four billion addresses looked like more than anyone would ever need. Two to the thirty-second is 4,294,967,296. Sixx across the street will tell you what happened next, at length, if you let him."' },
            { tone: 'joke', say: 'Do I get a drink while I count?', reply: 'Cider slides a glass of cloudy cider across the counter without looking up from the ruler. "It\'s on the house until you get one wrong."' }
          ] } },
        { k: 'SCENE', where: 'Cider\'s bar · the counter',
          lines: [
            { who: 'cider', text: 'Every address has two parts: the network it belongs to, and the host on that network. The [[prefix length]] tells you where one ends and the other starts. /24 means the first twenty-four bits are network and the last eight are host, and the [[subnet mask]] writes the same thing out as 255.255.255.0.' },
            { who: 'cider', text: 'The old way of cutting the block used fixed sizes, by the first octet. Class A is 0 to 127, first bit 0, with a /8. Class B is 128 to 191, starting 10, with a /16. Class C is 192 to 223, starting 110, with a /24. Class D, 224 to 239, starting 1110, is [[multicast]]. Class E, 240 to 255, is kept for experiments.' },
            { who: 'cider', text: 'Two addresses on every network are never handed out. With the host bits all zero you get the [[network address]], which names the network itself. With the host bits all ones you get the [[broadcast address]], which reaches every host on it. And anything starting 127 is a [[loopback address]], a machine talking to itself to test its own stack.' },
            { who: 'narr', text: 'She lifts the acrylic sheet and holds it against the light. It is cut into strips of different widths, each one etched with a range of numbers.' },
            { who: 'cider', text: 'The corp towers bought their addresses by the million, and they count them exactly the way you\'re counting them now, at my counter.' }
          ],
          choice: { opts: [
            { tone: 'ask', say: 'What\'s the network address of 172.16.40.9?', reply: 'Cider: "172 is class B, so the first two octets are network and the last two are host. Set the host bits to zero and you get 172.16.0.0. Set them all to one and you get the broadcast, 172.16.255.255."' },
            { tone: 'press', say: 'If classes are the old way, why learn them?', reply: 'Cider: "Because half the boxes you\'ll touch still assume them when you don\'t tell them otherwise, and because the Board asks. Nobody hands out whole classes any more. You\'ll see how we cut them now, later this week."' },
            { tone: 'care', say: 'Is Marrow\'s hot plate on the shelf really yours?', reply: 'She snorts. "He borrowed it four years ago and tells everyone it came with the stall. He does make a better bowl of noodles than I do, but don\'t tell him I said so."' }
          ] } },
        { k: 'LORE', title: 'FOUR BILLION SEEMED LIKE PLENTY', year: 1981, real: ['ietf'], vibe: 'Tubular. Four billion addresses and not one person could picture running out.',
          text: 'Cider, wiping the ruler clean: "IPv4 is RFC 791, published in September 1981 with Jon Postel as its editor. Thirty-two bits, four billion addresses, for a network of a few hundred machines. My grandmother ran a bar on this block when there were more stools in it than computers on the whole internet."' },
        { k: 'KIT', text: 'Cider writes on a coaster in pencil and slides it over.', real: ['ietf'], kit: [
          { cmd: '128 64 32 16 8 4 2 1', what: 'the value of each bit in an octet. 11111111 = 255' },
          { cmd: 'A 0–127 (0…) /8 · B 128–191 (10…) /16 · C 192–223 (110…) /24', what: 'the classes, by the first octet' },
          { cmd: 'D 224–239 (1110…) multicast · E 240–255 (1111…) experimental · 127 loopback', what: 'never handed to a host' },
          { cmd: '/8 255.0.0.0 · /16 255.255.0.0 · /24 255.255.255.0', what: 'prefix length and mask' },
          { cmd: 'host bits all 0 = network address · all 1 = broadcast address', what: 'the two you never give out' } ] },
        { k: 'SYNC', q: { prompt: 'A regular at the end of the bar, turning a coaster over: "My landlord says our block is 172.20.0.0. What class is that, and what\'s the broadcast?"', opts: ['Class B, broadcast 172.20.255.255', 'Class C, broadcast 172.20.0.255', 'Class A, broadcast 172.255.255.255', 'Class B, broadcast 172.20.0.255'], a: 0,
          yes: 'Cider: "Class B. Two octets of host, all ones."', no: 'Cider: "172 is class B, a /16, so the last two octets are host. All ones is 172.20.255.255."',
          why: 'Cider: The first octet, 172, is between 128 and 191, so it is class B with a /16 mask, 255.255.0.0. The host part is the last two octets. Setting every host bit to 1 gives the broadcast address, 172.20.255.255.' } }
      ] },
  ] });
})();
