/* protege-lines.js — the protégés' voices. Content file: extend freely. Placeholders: {name} {handle} {job} {client} {sib} {orphan}.
   danger 0 = fine, 1 = pressure, 2 = real trouble. Timers are seconds per danger level. Rep numbers are per outcome. */
window.PROTEGE_LINES = {
  timers: [60, 45, 30],
  rep: { correct: 2, wrong: 5, flatline: 15 },
  jobs: ['a router install at a noodle bar in Kabuki', 'a switch swap at the clinic annex', 'a corpo audit in Westbrook', 'a cabling job under the Charter Hill school', 'a night shift at a Watson pawn shop', 'a small office move in City Center'],
  clients: ['a corpo tech who keeps checking his watch', 'the building manager', 'a fixer I do not know', 'the owner, who is standing right behind me', 'two guys from the client who have not said a word'],
  open: {
    0: ['{name}: hey {sib}, quick one. I am on {job} and I do not want to guess. {client} is watching.', '{name}: sorry to bug you. {job}. I know you told me this once.', '{name}: you said ask before I touch anything. So. Asking.'],
    1: ['{name}: {sib} I need this one fast. {client} is not happy about the last answer.', '{name}: they took my deck. I have the console and a phone. Please.', '{name}: okay that last thing did not go well. same job. new question. please be quick.'],
    2: ['{name}: I am locked in the server room. they said one more mistake. {sib} please.', '{name}: my hands are shaking. I am not joking. one question.', '{name}: they are not letting me leave until this works. you have to be right this time.']
  },
  relief: ['{name}: that worked. that worked. thank you. I owe you a noodle bowl.', '{name}: okay. breathing. {client} nodded. I think we are good.', '{name}: you are the best in Watson and I will fight anyone who says different.'],
  escalate: {
    1: ['{name}: no. that made it worse. {client} is making a call. give me a second.', '{name}: it did not do what you said it would. they are getting loud.'],
    2: ['{name}: {sib} they took my phone the first time. I got it back. I do not think I get it back again.', '{name}: two guys just came in. I am typing under the desk. please. please be right.']
  },
  flatline: ['{name}: I think it is over for me, {sib}. They are coming in. Please take care of {orphan}. They are outside the clinic. They have nobody now. Tell them I tried.', '{name}: no time. it is done. {orphan} is at the noodle bar waiting for me. Look after them. You were the best thing that happened to me in this city.'],
  recruit: ['{name} ({handle}) joined your crew. They watched you work and asked Dispatch for your handle.', 'Dispatch: "{name} wants in. Kid has hands. Teach them or they will learn from someone worse."'],
  orphan: ['{name} showed up at Dispatch with a bag and a cracked deck. They know what happened. They asked for you by name.']
};
