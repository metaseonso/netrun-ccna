# CREW — archetypes, bond, favors, rites

The crew is the emotional engine. Every protégé is born into one archetype and every word they say comes from that
archetype's voice (`js/data/protege-lines.js` → `arch.<id>`). Same event, six different people. Extend the lines;
never let an archetype fall back to `common` for a situation a player will see often.

## The gritty truth (say it in the world)

You do not send them because you want to. The street has no junior tier. The corpo cores train juniors in
sandboxes; Watson trains them on a live box with a client behind them. Everybody was somebody's risk once.
Dispatch says this on the first recruit. The CREW screen says it every time. The player's job is to be the voice
on the line that makes the risk survivable.

## Archetypes

| id | who they are | how they call | what saving them reveals |
|---|---|---|---|
| **kid** | eager, apologizes twice, calls you big sib before you agreed | caps lock, "sorry sorry", froze | a little brother in the dorms; wants their mum to admit the deck was a good idea |
| **ghost** | few words, hides the fear | one line, sometimes one word | a brother who ran and had nobody to call; opens all at once at bond 7 |
| **hustler** | fast talker, jokes under pressure, owes people | bits, stalling, charm with a shelf life | a debt under the debt; sleeps for the first time in years when it is paid |
| **scholar** | precise, over-explains, terrified of being wrong | "I have read the section twice" | a notebook with one page that is not about a protocol |
| **soldier** | ex-corpo security, formal, calm in danger | sitreps, "awaiting instruction" | left because orders came without reasons; you give reasons |
| **heart** | looks after everyone, asks if you have eaten | tea, soup, checks on you last | nobody ever asked them how they are; you did |

Rules for new lines: short, spoken, one thought; the archetype shows in rhythm and habit, not in labels; danger
2 is quiet, not loud; flatline lines name the orphan and give one instruction ("get them a key, not a door").

## Bond

Saves raise the bond: closed → guarded → talking → trusts you → family (0 / 1 / 2 / 4 / 7 saves). The DM header shows
it. At each threshold the protégé sends one trust line after the relief. Milestones at 3 / 6 / 10 saves are letters:
why they do this, their first solo dive, their Class D. The bond is what a player loses when a runner is flatlined,
and the orphan arrives already knowing the player's handle.

## Gifts, burners, favors

From Marrow's stall (`js/data/shop.js`), given from the CREW screen: noodles calm one notch; an antenna adds seconds to
that runner's calls for good; a burner forgives one bad call. **A favor from Dispatch** pulls a runner in real trouble
off the job: danger resets, the gig is lost, Dispatch remembers. Hold one at a time. It is expensive on purpose.

## Rites of passage

Each class has a rite: a big job with a big payday and a big payoff in the story. Flag it `rite: true` on the gig; the
board shows RITE OF PASSAGE and the result screen frames it as one. The Board does not test what you know. It tests
whether people can put their lives in your hands. Write the rite's outro as the moment the district starts calling
the player by their class.
