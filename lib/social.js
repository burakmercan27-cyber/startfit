/* Demo-Profile für die Partnersuche. Im Prototyp fest hinterlegt, später echte Nutzer aus Convex. */
export const PEOPLE = [
  { id: "lena", look: { skin: "#F6D3B3", hair: "lang", hairColor: "#7A4B2A", shirt: "#F28B82" }, name: "Lena", age: 23, goal: "muskel", loc: "gym", place: "Studio in Gießen-Mitte", time: "abends", exp: "unter6", level: 4, color: "#F28B82", lastDays: 1, bio: "Studiere BWL an der THM und trainiere seit 3 Monaten. Suche jemanden für feste Abende." },
  { id: "tim", look: { skin: "#E0AC84", hair: "kurz", hairColor: "#2B1E16", shirt: "#4F8EE8" }, name: "Tim", age: 27, goal: "abnehmen", loc: "gym", place: "Studio am Bahnhof", time: "abends", exp: "neustart", level: 2, color: "#6FA8F5", lastDays: 12, bio: "Nach zwei Jahren Pause wieder dabei. Zu zweit fällt das Dranbleiben leichter." },
  { id: "mehmet", look: { skin: "#B97A55", hair: "locken", hairColor: "#2B1E16", shirt: "#F2B33D" }, name: "Mehmet", age: 24, goal: "ausdauer", loc: "gym", place: "Uni-Sportzentrum", time: "mittags", exp: "unter6", level: 5, color: "#F4B740", lastDays: 0, bio: "Trainiere in der Mittagspause, gerne auch kurz und knackig." },
  { id: "aylin", look: { skin: "#E0AC84", hair: "lang", hairColor: "#2B1E16", shirt: "#9B7BD4" }, name: "Aylin", age: 31, goal: "fitness", loc: "none", place: "Zuhause oder im Park", time: "morgens", exp: "nie", level: 1, color: "#B39DDB", lastDays: 2, bio: "Komplette Anfängerin. Würde mich über jemanden freuen, der morgens im Park mitmacht." },
  { id: "kevin", look: { skin: "#7A4A30", hair: "glatze", hairColor: "#2B1E16", shirt: "#3FAF85" }, name: "Kevin", age: 20, goal: "muskel", loc: "gym", place: "Studio in Gießen-Mitte", time: "wechselnd", exp: "unter6", level: 6, color: "#5CC8A0", lastDays: 1, bio: "Arbeite im Schichtdienst, deshalb mal früh, mal spät." },
  { id: "petra", look: { skin: "#F6D3B3", hair: "kurz", hairColor: "#E2B65C", shirt: "#F7A072" }, name: "Petra", age: 46, goal: "fitness", loc: "db", place: "Zuhause, Treffen im Park", time: "mittags", exp: "neustart", level: 3, color: "#F7A072", lastDays: 5, paused: true, bio: "Wiedereinsteigerin mit Kurzhanteln. Tausche mich gern über Übungen aus." },
];

export const person = (id) => PEOPLE.find((p) => p.id === id);

const GOAL = { muskel: "Muskelaufbau", abnehmen: "Abnehmen", ausdauer: "Ausdauer", fitness: "Allgemeine Fitness" };
const TIME = { morgens: "Morgens", mittags: "Mittags", abends: "Abends", wechselnd: "Wechselnde Zeiten" };
export const labels = { GOAL, TIME };

/* Wie gut passt jemand zum eigenen Plan? Zeit und Ort zählen am meisten, weil man zusammen trainieren will. */
export function match(p, a) {
  const reasons = [];
  let score = 0;
  if (a.time && (p.time === a.time || p.time === "wechselnd" || a.time === "wechselnd")) { score += 40; reasons.push(p.time === a.time ? `Auch ${TIME[p.time].toLowerCase()}` : "Flexible Zeiten"); }
  const home = (l) => l === "none" || l === "db";
  if (a.loc && (p.loc === a.loc || (home(p.loc) && home(a.loc)))) { score += 30; reasons.push(p.loc === "gym" ? "Auch im Studio" : "Auch zuhause"); }
  if (p.goal === a.goal) { score += 20; reasons.push(`Ziel: ${GOAL[p.goal]}`); }
  if (p.exp === a.exp) { score += 10; reasons.push("Ähnliche Erfahrung"); }
  return { score, reasons };
}

export const canNudge = (p, S) => p && !p.paused && p.lastDays >= 7 && !nudgedToday(S, p.id);
export function nudgedToday(S, id) {
  const t = S.social.nudged?.[id];
  return !!t && new Date(t).toDateString() === new Date().toDateString();
}

export function lastSeen(days, paused) {
  if (paused) return "Pausiert gerade";
  if (days === 0) return "Heute trainiert";
  if (days === 1) return "Gestern trainiert";
  return `Vor ${days} Tagen trainiert`;
}

/* Demo-Antworten im Chat, damit der Ablauf im Test echt wirkt */
export const REPLIES = [
  "Klingt gut! Wann passt es dir?",
  "Super, bin dabei.",
  "Ich schau nach der Arbeit nochmal rein, dann sag ich dir Bescheid.",
  "Gerne! Treffen wir uns direkt am Eingang?",
];

export const SEED_CHATS = {
  lena: [
    { me: false, text: "Hey! Du trainierst auch abends in der Stadt, oder?", ts: -2 },
    { me: true, text: "Ja, meistens Dienstag und Donnerstag.", ts: -2 },
    { me: false, text: "Perfekt, dann lass uns mal zusammen gehen.", ts: -1 },
  ],
  tim: [{ me: false, text: "Danke für den Tipp mit dem Latzug, fühlt sich jetzt viel besser an!", ts: -3 }],
};
