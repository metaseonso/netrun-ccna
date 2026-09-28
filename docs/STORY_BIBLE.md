# NETRUNNER://CCNA — Story Bible

This is the brief for rewriting every level and gig as lived-in story. The current text in
`js/data/grid.js` and `js/data/jobs.js` is a placeholder: correct facts, wrong form. It explains.
It should not explain. It should put the player inside a situation where the fact is the way out.

## The one rule

**The player learns because a person in the world needs something from them right now.**
No lecture voice. No "here is what X is". A character has a problem, a history with that problem,
and an opinion about it. The CCNA fact is what they know from living with it. The player gets the
fact by being in the room, asking, choosing, and doing.

Test for every beat: cover the NPC's name. Could this line have come from a textbook? Cut it.

## The world

Night City is not the setting. The setting is one district, **Watson**, where small businesses,
a clinic, a school, and a few corpo satellite offices share aging infrastructure. Everything the
player fixes is somebody's livelihood. Networks here are old, patched, and half-documented. People
remember the outages by what they lost: the night the clinic went to paper, the week the school
had no internet before exams.

Netrunners in Watson are not glamorous. They are the people who get called at 02:00. Reputation is
who trusts you with their building. Class D means you get the jobs nobody else wants. Class A
means the hospital calls you first.

## The player

The player has a handle and one thing we know: they are new, they need work, and somebody vouched
for them. Dispatch took a chance. Every gig is that chance being tested. The player never gets a
monologue about "your journey". The world reacts to what they did: a client mentions it, an NPC
heard, the next job comes with more trust or less.

## The cast are people first

Each NPC embodies a system, and the name gives that away. But in-world they are people with jobs,
history, and relationships with each other. The system is their trade, not their personality.

- **Old Root** kept the switches at the clinic for twenty years. He was on shift the night a loop
  took the building down and a nurse walked charts by hand. He talks about loops the way a
  retired firefighter talks about smoke. He does not give speeches. He asks you to look, then asks
  what you saw. He and Vee Lan argue about whose fault a bad VLAN topology is.
- **Vee Lan** draws the borders. Practical, fast, tired of people plugging things where they
  do not belong. She owes Old Root and hates that she does.
- **Mac** works the door on the switch floor. Friendly, remembers everyone, forgets on schedule.
  He is the first person to notice when a face shows up on two doors at once.
- **Dispatch** runs the job board from a booth. Short messages. Knows everyone's history. Never
  says "good job"; sends a better job instead.
- **Enable** guards the console. Three doors. Will not open one you did not ask for. Respects
  people who save their work.
- **Cider** runs the bar where the address blocks get divided. Precise. Has a straight edge and
  no patience for waste.
- The rest of the cast (Nexthop, Ospef, Syn, Sixx, Denise, Shell, Nat, Ace Elle and her dog
  Sticky, Beacon, Prof. Hypervisor, Jason, Ansible) follow the same pattern: a trade, a history,
  a reason they care, a relationship with at least one other NPC.

NPCs talk to each other, disagree, and refer to past gigs. That is what "lived in" means.

## The demo story: Stage 4, The Bridges

Six levels and six gigs, one continuous story over about a week in Watson.

1. **The keeper** — The player is sent to the clinic annex where Old Root is packing up his desk
   after twenty years. He will not leave until someone understands why the redundant cable is
   plugged in but dark. He tells the story of the outage night. The player learns what a loop does
   by hearing what it did.
2. **The election** — Old Root walks the player through the three switches in the annex and asks
   them to find who is in charge. Nobody chose it. The oldest switch won by accident. The player
   reads the tree and names the root. Old Root asks whether that is a plan.
3. **Port states and timers** — A nurse complains that every workstation takes half a minute to
   come up after a reboot. Old Root has the player watch a port wake up, state by state, with a
   stopwatch. Fifteen, fifteen. Then he explains why he would never make it faster on the uplinks.
4. **The hello message** — Mac reports frames he does not recognize arriving every two seconds
   from a port in reception. Old Root has the player read the destination address and tell him
   which dialect is talking. Someone plugged something in.
5. **The toolkit** — The thing in reception is a small switch a temp brought from home. Vee Lan
   is furious. Old Root is calm. The player learns PortFast and BPDU Guard as the two things that
   would have made this impossible, and applies them.
6. **Shaping the tree** — Old Root's last day. Two departments, two uplinks, one idle. He hands
   the player the console and sits back. The player chooses roots on purpose, per VLAN, and
   verifies it from a third switch. He leaves. The building stays up.

The six gigs are the same week seen from the job board: Dispatch's messages, the client's
complaint, the practicum, and the aftermath. Class C and above bring back earlier problems in new
buildings, because that is what work is.

## Scene format

Levels are written as scenes, not paragraphs. Use the `SCENE` beat type:

```js
{ k: 'SCENE', where: 'Clinic annex, switch closet, 22:40',
  lines: [
    { who: 'narr', text: 'The closet door sticks, then gives. Warm air rolls out over you, thick with dust and the smell of a fan that has been dying for years. Three switches blink on the rack, and one cable wears a paper tag in shaky capitals: DO NOT UNPLUG.' },
    { who: 'root', text: 'You see that second cable to SW2? It has been plugged in for six years and it has never carried a frame.' },
    { who: 'you',  text: 'Then why is it there?' },
    { who: 'root', text: 'Because the night we did not have it, a nurse carried charts up three floors.' }
  ],
  choice: { opts: [
    { tone: 'ask', say: 'What went wrong that night?', reply: 'A broadcast went round the two cables and never stopped, because nothing in a frame counts down. The switches flooded until their CPUs gave out.' },
    { tone: 'press', say: 'So why not unplug it now?', reply: 'Because the next cut fibre would take the building down again, so the cable stays and something has to keep it quiet.' },
    { tone: 'quiet', say: '(Say nothing. Let him get there.)', reply: 'He winds the last of the cable round his fist. "Spanning tree. That\'s what keeps it quiet. Sit down, this part matters."' }
  ] } }
```

- `narr` lines are the dungeon master at the table: second person, present tense, senses first (heat, smell, sound, then sight). Let a long sentence roll, then land it. Never tell the player what to feel or what they learned.
- NPC lines are one thought each. People interrupt, deflect, tell a memory, ask the player a
  question. Facts arrive as answers to what the player asked.
- `you` lines are the player's spoken words. Keep them short and human.
- A `choice` is not a quiz. Every option is a reasonable thing to say, and each reply teaches something different;
  the player can go back and hear the others. Give each option a `tone` so the player picks a stance, not an answer:
  `ask`, `press`, `quiet`, `joke` or `care` (shown as [ASK], [PRESS] and so on).
- Keep `KIT` beats: the deck is the tangible thing the player carries out of the scene.
  Frame it in the scene: Old Root writes the commands on the back of a work order.
- Keep one `SYNC` beat per level, but write the question as something an NPC would actually ask:
  "Vee Lan wants to know: if I move the cable to the Gigabit port, which path does SW2 use now?"
- `LORE` stays: real history, told as something the character lived through or was told by
  someone who did. Dates and names stay exact.

## Gigs

The brief is Dispatch's message plus one line from the client in their own words. The step
prompts are the NPC on the phone with the player, in the building, in the moment. The success
lines are reactions, not confirmations. The outro is what changed for someone: the nurse got
her workstation back, the temp got a lecture, Old Root got to leave.

## Voice (owner's rule, 2026-09-28: this replaces the old Language rules)

The owner reads every line. Lines that sound like an AI explaining the game break the world and get thrown out.

**Who is talking.** Every line in a scene, a gig, a call or on a shelf belongs to someone: the narrator, an NPC,
Dispatch, a client, a runner, Marrow. Write it the way that person talks. Cover the name: if you cannot tell who said
it, rewrite it.

**The narrator is a dungeon master.** Second person, present tense, senses first. Sentences of different lengths,
the way a person tells a story out loud. No morals, no summaries, no "you realise".

**Never write these:**
- A statement followed by a short second sentence that twists, echoes or caps it. "Dispatch pins it. You pick."
  "Eight districts under one sky of cable. Four of them know your name." Say the thing once and stop.
- "That is not X. That is Y." Aphorisms. Stacked one-word sentences for drama. Tidy lists of three.
- Taglines and subtitles that add no information. If a header needs no subtitle, it gets none.
- The game explaining itself inside a scene ("this counts as help", "you are at 100/100").

**Interface text is plain.** Labels, tooltips, warnings and popups say what the thing does in one plain sentence,
with the real numbers: "A dive at your class costs 15 hunger. At zero you flatline. Eat at Marrow's stall."
Rules and numbers live there, never in a character's mouth.

**Voices of the cast** (keep adding one line per new NPC):

| Who | Sounds like |
|---|---|
| Narrator | the DM: you, now, heat and smell before sight |
| Old Root | slow and gruff, drops words he does not need, asks what you saw before he tells you anything |
| Enable | formal, few words, talks in doors, respects anyone who saves their work |
| Marrow | dry and fond, talks through food, never asks where the creds came from |
| Dispatch | clipped like a radio with a bad battery, no pleasantries, sends a better gig instead of praise |
| The Kid (crew) | types in bursts, caps when scared, lowercase when relieved, apologises twice |
| Nat | smooth and unhurried, paints while talking, jokes about temporary fixes that outlived everyone, talks about addresses as faces |
| Ace Elle | plain and exact, reads things out in order, says a rule once; keeps her suspicions on a clipboard, not in her mouth |
| Denise | an operator on a long shift: warm, quick, practical, thinks in order of events, apologises for the coffee |
| Dora (walk-on) | Denise's intern: eager, checks her own answers aloud, writes everything on a clipboard, admits what she got wrong |
| Shell | a locksmith in a hood and a mask: quiet, careful, short practical sentences, talks with the hands busy, never says a password aloud |
| Prof. Hypervisor | cheerful and a little scattered, thinks out loud, calls every machine a little instance, talks to the cat |
| Clerk Adebayo | formal and exact, says what the record needs, reads the minutes back word for word |
| Beacon | loud and warm, talks like she is still on air, takes channel 6 personally, always knows how many are listening |
| Ansible | calm and spare, short sentences in the order he would run them, finishes typing before he looks up |
| Jason | neat and exact, says things once in the right order, dry about sloppy data, proud of a file that parses |
| Osi Sevenfold | orderly and kind under the clipboard; counts and sorts as she talks, remembers dates, never raises her voice |
| Mac | quick and friendly, keeps a ledger, jokes to fill the silence, notices a face twice before anyone else does |
| Cider | precise and dry, shows her working, wastes nothing, patient with people who count on paper; family history of the block |
| Vee Lan | practical and fast, few pleasantries, gets on her knees to fix things, owes Old Root and hates it; almost smiles, once |
| Nexthop | chatty cab driver, streetwise, one stop at a time, notices when something is too tidy to be a mistake |
| Vesper Kade | polished and patient, never raises her voice, speaks for Halvorsen as if it were the weather, knows people's names before they say them |
| Imani (walk-on) | a ward nurse: direct, tired, protective of patients, remembers the night the clinic went to paper |
| Ma Tsai, Tomas, Hanna, Voss (walk-ons) | shopkeepers and a landlord: short, concrete, about their own business and what it costs them |
| Hollis (walk-on) | the Kabuki market pharmacist: careful, counts pills and change aloud, worries about the card reader more than the money |

**Still true:**
- Slang is seasoning: "gig", "jack in", "deck", "rep", "corpo". One per scene at most, never in the sentence that
  carries the fact.
- Every exam number and command stays exact. The story bends around the fact, never the reverse.

---

# Part II · The world holds. (Canon added 2026-09-27.)

## 1. Never break the world

Nothing on screen, in a scene, in a gig, in a DM, in a menu, may use the language of study. Banned in
player-facing text: *flash card, Anki, deck of cards, exam, quiz, lesson, tutorial, study, revise,
step N, terminal, console, framework, stub, level up (as a phrase), XP, content, feature, UI, demo,
CCNA, 200-301, Jeremy, notes, source.* The lint (`npm test`) flags these as warnings; treat them as errors.

Use the world's words instead. This table is binding for Opus and for every screen:

| Out of world | In world |
|---|---|
| a gig's steps | **floors** of the dive (floor 1 of 5) |
| commit / submit | **EXECUTE** |
| console / terminal | the **shell** (your deck talking to the box) |
| hint | **ping Dispatch** |
| walk me through it | a **fixer** (paid; that run pays nothing and the notes go to the CODEX) |
| flash card / quiz | a **call** from your crew; a **Board question** |
| the exam / the cert | **the Board** (Netrunner Certification Board, classes D → A) |
| stats | your **RECORD** |
| answer key | the **CODEX** (your own notes, kept in your deck) |
| log | **JOURNAL** |
| lore / history | a **braindance** (BD) |
| tutorial gig | your **first dive** |
| level up | a quickhack goes **SYNCED → WIRED → BURNED-IN** |
| content / a day | a **district**, a **street**, a **night** |

## 2. Legacy is the point

Watson runs old gear. The corpo cores downtown run something the street never sees. A netrunner's
deck speaks the old tongue, the shell you type into, because that is what the street's boxes
understand. This is why the interface looks the way it does, and it is said out loud, early:

> Enable, first dive: "The box only listens in the old tongue. Your deck translates. Speak plainly to it."

Every stage has at least one character who says, in their own way, that the shiny stuff is built on
this. Prof. Hypervisor: "Every cloud you have ever heard of is forty of these boxes and a very good lie."
Ansible: "The corps automate it because it works. It works because someone learned it by hand first."
Dispatch: "Street gigs pay in creds. They also pay in the only thing the corps cannot buy: you knowing why."

The player lives in the future and is retracing the past on purpose. That framing must always be present
and never preachy: one line per stage, said by a person, about a thing in front of them.

## 3. Jacking in is a dive

Starting a gig runs the **dive** sequence (engine-provided, two seconds, skippable): deck online,
legacy shell mounted, intent translation ready, ICE reading, then the run. Jacking out fades. Inside
the run, each objective is a **floor**. Clearing the last floor is **DIVE COMPLETE**. The map is the
NET architecture of the building. Red is ICE. Gold is the root.

## 4. History arrives as braindances

A `LORE` beat is a BD recording someone hands the player. It has a **title** and a **year**, shown
as a title card, then the recording in the character's voice. Titles are how humans file memories:

- THE NIGHT THE NET CAUGHT FIRE · 1988 (the Morris worm)
- FOUR DAYS ON PAPER · 2002 (Beth Israel Deaconess STP meltdown)
- ALGORHYME · 1985 (Perlman writes the tree)
- LO · 1969 (the first message crashes after two letters)
- THE LAST FIVE BLOCKS · 2011 (IANA runs out of IPv4)

Rules: exact dates and names inside the recording; the title is a phrase, not a fact; the character
says why they kept this one. A player should be able to recite the title and the year without ever
having tried to.

## 5. Titles, not facts. Numbers become places.

Every number that must be remembered is attached to a person, a place or a thing in the world:
4096 is the size of Old Root's door key; 24576 is "six keys"; 50 seconds is the length of the walk
from the closet to reception; 01:00:0C:CC:CC:CD is "the Cisco knock". Repetition is designed, not
hoped for: a command the Board expects appears in at least three gigs across two stages before the
campaign considers it known, and the deck levels only rise on clean use. Spaced returns come through
the crew's calls. The player should feel they are enjoying the world and find the reflexes already there.

## 6. Loss drives. Payoff is emotional.

Protégés are people. Each has a want (a sibling, a debt, a dream deck) that shows up in their calls.
Save them three, six, ten times and they send something personal: a photo, a first solo dive story, a
thank-you that costs them something. Lose one and the orphan arrives carrying a keepsake and the dead
runner's handle in their notes. Clients come back: Imani sends a message when the clinic passes an
inspection. Old Root invites the player to the roof at Class B. Rep opens doors. The reward is people.

## 7. Creds and the shop

Gigs pay **creds** as well as rep. Creds buy things that feed the loops, never things that skip them:

- **Gifts for the crew** (noodles, a better antenna, a burner): buy a protégé time on their next call,
  or calm them by one danger level.
- **Insurance chip**: one call forgiven, once. Expensive. Emotional.
- **Braindances**: bonus recordings, more history, a character's past.
- **Deck skins and frames**: how the HUD looks. Pure vanity. People love vanity.
- **Dispatch priority**: see the next gig a class early.

The vendor is a person with a stall and opinions. Prices rise with class. Spending should feel like
buying a friend a drink, not like buying a level.

## 8. The Board

The in-world certification body. Classes D, C, B, A. Board questions are the sync checks and the
crew's calls. NPCs refer to "what the Board asks" the way tradespeople refer to their licence. The
player is preparing for the Board without ever leaving the story.


## 9. How the braindance card works on memory (design notes)

The date is the hero: one huge number on an otherwise quiet card. A single distinctive element is recalled first and
best (the isolation effect, von Restorff, 1933). The title under it is a phrase, not a fact, so it becomes a retrieval
cue rather than a thing to retrieve. The line of era slang gives the card a mood; feeling attached to information is
consolidated faster and held longer (emotional modulation of memory, McGaugh). Number + phrase + picture is two or
three routes back to the same memory (dual coding, Paivio). Then the crew asks for the year on a later night, spaced
out, without warning: retrieval practice beats re-reading by a wide margin (the testing effect, Roediger and Karpicke,
2006), and spacing those retrievals is the oldest result in the field (Ebbinghaus, 1885). The player never studies the
date. They watch a card, feel something, and get asked by someone they care about a week later. That is the design.

Every LORE beat therefore carries `title`, `year`, `vibe`. The engine turns each one into a crew call automatically.
Archetypes, bond, favors and rites are specified in `docs/CREW_ARCHETYPES.md`.

## 10. The body, the sync, the flatline

A netrunner is a body on a street with a deck in it. The body eats and the chrome needs a hand on it, and neither is
free. Two meters, FOOD and CHROME, sit in the HUD next to the creds. Nothing but work drains them: every gig costs
both at jack-in, and every bad call inside a dive burns a point of chrome. Getting paid is how you fill them again.
Marrow sells food (a bar, a bowl, a hot plate at Cider's) and knows a ripperdoc two doors down who does not do
partials: one price, full service, every time. For a runner who can't pay the doc, Marrow keeps sealant and tape under
the counter that puts back part of it. Prices climb with class, like everything at the stall.

The cost is never hidden. The board says what a dive costs and what you have. When a dive would kill you, the board
says so in red and the button says JACK IN ANYWAY. A flatline is therefore a choice the player made with open eyes,
which is the only kind of death that teaches anything.

The screen is not subtle. **FLATLINED.** in red across the whole deck, then GAME OVER, CHOOM. in small caps, then one
plain sentence about how ("you went in hungry. the dive took the rest."), then the last sync and how long ago it was.
Two buttons: BACK TO THE LAST SYNC and OUT TO THE DOOR. The street keeps count of flatlines on a handle, and the count
shows on the RECORD. A flatlined runner comes back to the last sync with the journal, the record and the count intact:
the world remembers even when the runner rewinds.

A sync is the only save. The deck syncs after every talk and every gig, on its own, and says so once. There are no
chips, no export, no manual save; the pacing belongs to the street, not the player. Words: **food**, **chrome**,
**sync**, **flatline**, **ripperdoc**, **the tab**. Never "health", "HP", "hunger bar", "save game", "checkpoint",
"respawn". "Game over" appears in exactly one place: the flatline screen.

When the player is broke and under 30 food, Marrow puts one bowl on the tab, once per class. He is not kind about it.
That is the whole safety net, and it is enough.
