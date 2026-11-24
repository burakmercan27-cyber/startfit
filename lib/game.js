/* Gamification rund um den Buddy: Wochen-Quests, Serien, Erfolge, Belohnungspfad, Körpermaße. */

const DAY = 864e5;

export function weekStart(d = new Date()) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate() - ((x.getDay() + 6) % 7));
}
export const weekKey = (d = new Date()) => weekStart(d).toISOString().slice(0, 10);
const inWeek = (iso, start) => { const t = Date.parse(iso); return t >= +start && t < +start + 7 * DAY; };

export const bonusXp = (S) => (S.bonus || []).reduce((n, b) => n + b.xp, 0);
export const claimed = (S, id) => (S.bonus || []).some((b) => b.id === id);
const events = (S, type, start) => (S.events || []).filter((e) => e.type === type && (!start || inWeek(e.date, start)));

/* Wochenziel: so viele Trainings, wie im Onboarding angegeben (max. 5, damit es erreichbar bleibt) */
export const weekGoal = (S) => Math.min(5, Math.max(1, +S.answers.days || 3));

/* ---------- Wochen-Quests ---------- */
export function quests(S, now = new Date()) {
  const start = weekStart(now), wk = weekKey(now);
  const sessions = S.sessions.filter((s) => inWeek(s.date, start));
  const goal = weekGoal(S);
  const full = sessions.some((s) => {
    const day = S.plan?.days[s.day];
    const total = day ? day.items.reduce((n, it) => n + it.sets, 0) : 99;
    return s.sets.length >= total;
  });
  const prevBest = {};
  S.sessions.filter((s) => Date.parse(s.date) < +start).forEach((s) => s.sets.forEach((x) => { prevBest[x.id] = Math.max(prevBest[x.id] || 0, x.kg); }));
  const pr = sessions.some((s) => s.sets.some((x) => x.kg > 0 && prevBest[x.id] && x.kg > prevBest[x.id]));
  const social = events(S, "nudge", start).length + events(S, "invite", start).length > 0;
  const measured = (S.body?.entries || []).some((e) => inWeek(e.date, start));
  const list = [
    { key: "goal", title: `${goal} ${goal === 1 ? "Training" : "Trainings"} diese Woche`, xp: 100, have: Math.min(sessions.length, goal), need: goal },
    { key: "full", title: "Ein Training komplett durchziehen", xp: 50, have: full ? 1 : 0, need: 1 },
    pr
      ? { key: "pr", title: "Ein Gewicht steigern", xp: 40, have: 1, need: 1 }
      : { key: "pr", title: "Ein Gewicht steigern", xp: 40, have: 0, need: 1, hint: "Nimm bei einer Übung mehr Gewicht als letzte Woche." },
    S.social.friends.length
      ? { key: "social", title: "Einen Gym Buddy erinnern oder einladen", xp: 30, have: social ? 1 : 0, need: 1 }
      : { key: "social", title: "Einen Gym Buddy finden", xp: 30, have: S.social.friends.length ? 1 : 0, need: 1 },
  ];
  if (S.body?.consent) list.push({ key: "measure", title: "Körpermaße eintragen", xp: 20, have: measured ? 1 : 0, need: 1 });
  return list.map((q) => ({ ...q, id: `q-${q.key}-${wk}`, done: q.have >= q.need, claimed: claimed(S, `q-${q.key}-${wk}`) }));
}

/* ---------- Serie: Wochen in Folge mit erreichtem Wochenziel ---------- */
export function streak(S, now = new Date()) {
  const goal = weekGoal(S);
  const pauseFrom = S.pause?.from ? Date.parse(S.pause.from) : null;
  let n = 0;
  let start = weekStart(now);
  const countIn = (st) => S.sessions.filter((s) => inWeek(s.date, st)).length;
  if (countIn(start) >= goal) n++;
  for (let i = 0; i < 104; i++) {
    start = new Date(+start - 7 * DAY);
    const paused = pauseFrom && +start + 7 * DAY > pauseFrom;
    if (countIn(start) >= goal) n++;
    else if (!paused) break;
  }
  return n;
}

/* ---------- Erfolge ---------- */
export const BADGES = [
  { id: "first", name: "Erster Schritt", desc: "Dein erstes Training", icon: "1", test: (S) => S.sessions.length >= 1 },
  { id: "five", name: "Dranbleiber", desc: "5 Trainings geschafft", icon: "5", test: (S) => S.sessions.length >= 5 },
  { id: "ten", name: "Routine", desc: "10 Trainings geschafft", icon: "10", test: (S) => S.sessions.length >= 10 },
  { id: "streak2", name: "Im Flow", desc: "2 Wochen in Folge Ziel erreicht", icon: "2W", test: (S, c) => c.streak >= 2 },
  { id: "streak4", name: "Monatsheld", desc: "4 Wochen in Folge Ziel erreicht", icon: "4W", test: (S, c) => c.streak >= 4 },
  { id: "lv3", name: "Aufsteiger", desc: "Buddy erreicht Level 3", icon: "L3", test: (S, c) => c.level >= 3 },
  { id: "lv5", name: "Kraftpaket", desc: "Buddy erreicht Level 5", icon: "L5", test: (S, c) => c.level >= 5 },
  { id: "friend", name: "Gym Buddy", desc: "Erster Freund in der App", icon: "♥", test: (S) => S.social.friends.length >= 1 },
  { id: "comeback", name: "Comeback", desc: "Nach einer Pause wieder trainiert", icon: "↺", test: (S) => events(S, "comeback").length > 0 },
  { id: "measure", name: "Maßband", desc: "Körpermaße eingetragen", icon: "cm", test: (S) => (S.body?.entries || []).length > 0 },
];
export const badgesOf = (S, ctx) => BADGES.map((b) => ({ ...b, earned: !!b.test(S, ctx) }));

/* ---------- Belohnungspfad ---------- */
export const REWARDS = [
  { level: 2, title: "Neue Shirtfarben", desc: "Rot und Schwarz für deinen Buddy" },
  { level: 3, title: "Stirnband und 3er-Split", desc: "Push, Pull, Beine freigeschaltet" },
  { level: 4, title: "Buddy-Jubel", desc: "Dein Buddy feiert jeden Satz mit" },
  { level: 5, title: "Schweißbänder und 4er-Split", desc: "Mehr Kraft, mehr Muskelfokus" },
  { level: 7, title: "Goldstern und 5er-Split", desc: "Jeden Tag eine Muskelgruppe" },
  { level: 10, title: "Skins", desc: "Ninja, Astronaut, Pirat und mehr (bald)" },
];

/* ---------- Körpermaße (optional) ---------- */
export const MEASURES = {
  weight: { name: "Gewicht", unit: "kg", min: 30, max: 250, step: 0.1 },
  waist: { name: "Bauchumfang", unit: "cm", min: 40, max: 200, step: 0.5, how: "Auf Höhe des Bauchnabels, entspannt ausatmen." },
  arm: { name: "Oberarm", unit: "cm", min: 15, max: 70, step: 0.5, how: "Dickste Stelle, Arm locker hängend." },
  chest: { name: "Brust", unit: "cm", min: 60, max: 180, step: 0.5, how: "Auf Höhe der Brustwarzen, normal atmen." },
};
export const measuresFor = (goal) => ({ abnehmen: ["weight", "waist"], muskel: ["arm", "chest", "weight"], ausdauer: ["weight"], fitness: ["weight", "waist"] }[goal] || ["weight"]);
export const MEASURE_XP = 20;
export function canEarnMeasureXp(S) {
  const last = (S.body?.entries || []).map((e) => Date.parse(e.date)).sort().pop();
  return !last || Date.now() - last >= 13 * DAY;
}

/* Sprüche, wenn man den Buddy antippt */
export const LINES = {
  happy: ["Los geht's, ich bin bereit!", "Heute holen wir uns XP!", "Fühl mal meinen Bizeps!", "Zusammen schaffen wir das!", "Noch ein Training und ich wachse!"],
  tired: ["Ich bin ein bisschen müde ...", "Ein kurzes Training würde mir guttun.", "Gehen wir bald mal wieder?"],
  sad: ["Ich vermisse unser Training.", "Kommst du bald wieder?", "Schon 10 Minuten würden helfen."],
  sick: ["Ich bin ganz schlapp ...", "Bitte trainier mit mir.", "Ich brauche dich!"],
  pause: ["Ich warte auf dich, keine Eile.", "Erhol dich gut!", "Wir machen später weiter."],
};
