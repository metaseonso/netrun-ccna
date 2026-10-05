/* js/data/patch-notes.js — what changed for players, newest first. One entry per release that goes live.
   Read by the PATCH NOTES screen (ARCHIVE menu) and by patch-notes.html (linked from the door).
   Every change that reaches players gets a line here before it is pushed: plain words, what a runner will notice. */
window.PATCH_NOTES = [
  { v: '1.2.0', date: '2026-10-06', build: 96, items: [
    ['new', 'SHARD: your own notes. Press JOT in the top bar on any screen, even mid-dive, and type. The note is tagged with where you were, like a night or a gig floor.'],
    ['new', 'ARCHIVE > SHARD lists every note, newest first. Search them, edit them, delete them, or tap a tag to go back to that night or gig.'],
    ['new', 'Notes stay with your record, follow your Google sign-in to other devices, and survive a flatline. A note you have not saved yet is kept if you close the box.']
  ] },
  { v: '1.1.0', date: '2026-10-06', build: 95, items: [
    ['new', 'DISPATCH DRILL on the CREW screen. Pick 5, 10, 20, all, or any number of practice calls and Dispatch puts them on a quiet line one after another. Drill calls pay no rep or creds and put nobody on your crew at risk. The questions you miss come back sooner on real calls. (Suggestion S0005)'],
    ['new', 'Every talk shows a COURSE NOTES link for its night, under the title. (Suggestions S0003 and S0004)'],
    ['new', 'Each quickhack you have slotted on the DECK links the course notes of the night that taught it.'],
    ['new', 'PATCH NOTES, under ARCHIVE and on the door.'],
    ['fix', 'Thirteen nights linked to course notes that did not exist, night 10 among them. All of them now open the right page. (Suggestion S0002)']
  ] },
  { v: '1.0.4', date: '2026-09-29', build: 92, items: [
    ['new', 'A dive in progress survives a reload or a log-out. Only JACK OUT, a clear or a flatline ends it.'],
    ['new', 'Lit words open a term card with the meaning, the course notes for the night it first comes up, and an official source. CODEX > WORDS lists the words you have heard.'],
    ['change', 'Handles are ALL CAPS. Older handles were renamed once.'],
    ['change', 'Crew calls offer wrong answers shaped like the right one, and ring on their own without waiting for a click.'],
    ['change', 'A reload returns you to the same screen.'],
    ['fix', 'On phones the top bar fits at every width, the account menu is no longer cut off, and the dive map is easier to tap.'],
    ['fix', 'Leaving the first dive refunds what it cost, so a new runner cannot starve on retries.'],
    ['fix', 'Keyboard focus stays on the control you used.']
  ] },
  { v: '1.0.3', date: '2026-09-29', build: 87, items: [
    ['new', 'The first night: Dispatch walks a new runner through one loop. A talk, the first gig, the pay, Marrow’s stall, a first crew call, and where the ARCHIVE keeps what you learned. Runners can skip it.'],
    ['new', 'Sound: 21 new cues for menus, results, crew calls, cleared gigs and new clearance.'],
    ['change', 'The game loads much faster: the door draws first and portraits load when they are shown.']
  ] },
  { v: '1.0.2', date: '2026-09-29', build: 84, items: [
    ['change', 'Sign in with Google once per device. No more hourly reconnects. Your record is kept in the Watson DB. Old Drive records did not carry over.'],
    ['new', 'The door shows four screens from inside a night. Click one to see it full size.']
  ] },
  { v: '1.0.1', date: '2026-09-28', build: 79, items: [
    ['new', 'Vesper Kade has a portrait.'],
    ['fix', 'Company logos show on the beats that name a real company or person.']
  ] },
  { v: '1.0.0', date: '2026-09-28', build: 78, items: [
    ['new', 'Alpha 1.0. The whole campaign is in: 63 nights across nine districts, 68 gigs, three rites of passage, the Board, the crew and the license at the end.']
  ] }
];
