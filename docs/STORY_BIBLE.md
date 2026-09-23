# NETRUN://CCNA — Story Bible

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
    { who: 'narr', text: 'The closet smells like warm dust. Three switches, one with a hand-written label: DO NOT UNPLUG.' },
    { who: 'root', text: 'You see that second cable to SW2? It has been plugged in for six years and it has never carried a frame.' },
    { who: 'you',  text: 'Then why is it there?' },
    { who: 'root', text: 'Because the night we did not have it, a nurse carried charts up three floors.' }
  ],
  choice: { opts: [
    { say: 'What went wrong that night?', reply: 'A broadcast went around the two cables and never stopped. Nothing in a frame counts down. The switches flooded until the CPUs fell over.' },
    { say: 'So why not unplug it now?', reply: 'Because then the next cut fibre takes the building down again. The cable stays. Something has to keep it quiet. That is my whole job.' }
  ] } }
```

- `narr` lines are short and physical: what the player sees, hears, smells.
- NPC lines are one thought each. People interrupt, deflect, tell a memory, ask the player a
  question. Facts arrive as answers to what the player asked.
- `you` lines are the player's spoken words. Keep them short and human.
- A `choice` is not a quiz. Both options are reasonable things to say. Each reply teaches
  something different; the player can go back and hear the other one.
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

## Language

- Full sentences. One idea each. Short is fine; fragments used as drama are not.
- No aphorisms. No "That is not X. That is Y." No stacked one-word sentences.
- Slang is seasoning: "gig", "jack in", "deck", "rep", "corpo". One per scene at most, and
  never in the sentence that carries the fact.
- Every exam number and command stays exact. The story bends around the fact, never the reverse.
- Read every line aloud as the character. If it sounds like a narrator, rewrite it.
