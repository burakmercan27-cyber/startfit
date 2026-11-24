/* Buddy: wächst mit jedem Training (XP, Level) und baut ab, wenn länger nicht trainiert wird. */

export const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];

/* Anpassung: bewusst wenige Optionen zum Start */
export const SKIN = [
  { id: "hell", name: "Hell", hex: "#F6D3B3" },
  { id: "mittel", name: "Mittel", hex: "#E0AC84" },
  { id: "braun", name: "Braun", hex: "#B97A55" },
  { id: "dunkel", name: "Dunkel", hex: "#7A4A30" },
];
export const BODY = [
  { id: "m", name: "Männlich" },
  { id: "w", name: "Weiblich" },
];
export const BUILD = [
  { id: "schlank", name: "Schlank" },
  { id: "mittel", name: "Mittel" },
  { id: "kraeftig", name: "Kräftig" },
];
export const HAIR = [
  { id: "kurz", name: "Kurz" },
  { id: "lang", name: "Lang" },
  { id: "zopf", name: "Dutt" },
  { id: "locken", name: "Locken" },
  { id: "glatze", name: "Ohne" },
];
export const HAIR_COLOR = [
  { id: "schwarz", name: "Schwarz", hex: "#2B1E16" },
  { id: "braun", name: "Braun", hex: "#7A4B2A" },
  { id: "blond", name: "Blond", hex: "#E2B65C" },
  { id: "rot", name: "Rot", hex: "#B5482A" },
];
export const SHIRT = [
  { id: "gruen", name: "Grün", hex: "#3FAF85" },
  { id: "blau", name: "Blau", hex: "#4F8EE8" },
  { id: "gelb", name: "Gelb", hex: "#F2B33D" },
  { id: "lila", name: "Lila", hex: "#9B7BD4" },
  { id: "rot", name: "Rot", hex: "#E0533F", level: 2 },
  { id: "schwarz", name: "Schwarz", hex: "#2C3532", level: 2 },
];
export const DEFAULT_LOOK = { body: "m", build: "mittel", skin: SKIN[1].hex, hair: "kurz", hairColor: HAIR_COLOR[1].hex, shirt: SHIRT[0].hex };

/* Der Coach hat eine eigene Figur (Kappe, Pfeife) */
export const COACH = { name: "Coach Toni", look: { body: "m", build: "kraeftig", skin: "#C58C62", hair: "kurz", hairColor: "#2B1E16", shirt: "#E4573D" } };

/* Angemeldete Auszeit: Buddy baut in der Zeit nicht ab */
export const PAUSE_REASONS = [
  { id: "urlaub", name: "Urlaub" },
  { id: "verletzung", name: "Verletzung" },
  { id: "sonstiges", name: "Andere Auszeit" },
];
export function activePause(S, now = Date.now()) {
  const p = S.pause;
  if (!p) return null;
  if (p.until && now >= Date.parse(p.until)) return null;
  return p;
}

/* Ältere Speicherstände hatten nur eine Farbe: die wird zum Shirt */
export function lookOf(x) {
  if (!x) return DEFAULT_LOOK;
  if (x.look) return { ...DEFAULT_LOOK, ...x.look };
  if (x.skin || x.hair || x.shirt) return { ...DEFAULT_LOOK, ...x };
  if (x.color) return { ...DEFAULT_LOOK, shirt: x.color };
  return DEFAULT_LOOK;
}

/* Skins kommen später, im Prototyp nur als Vorschau */
export const SKINS = ["Ninja", "Astronaut", "Gold", "Pirat"];

export const xpOfSession = (s) => 50 + 10 * s.sets.length;
export const xpOf = (sessions) => sessions.reduce((n, s) => n + xpOfSession(s), 0);

export function levelOf(xp) {
  let level = 1;
  LEVELS.forEach((t, i) => { if (xp >= t) level = i + 1; });
  const cur = LEVELS[level - 1];
  const next = LEVELS[level] ?? cur + 800;
  return { level, cur, next, toNext: next - xp, pct: Math.min(1, (xp - cur) / (next - cur)) };
}

/* Wachstumsstufe: 1 = klein, 2 = Stirnband, 3 = Stirnband + Schweißbänder, größer */
export const stageOf = (level) => (level >= 5 ? 3 : level >= 3 ? 2 : 1);
export const goldOf = (level) => level >= 7;

export function lastActivity(S) {
  const dates = S.sessions.map((s) => Date.parse(s.date));
  dates.push(Date.parse(S.buddy?.created || new Date().toISOString()));
  if (S.pauseEnded) dates.push(Date.parse(S.pauseEnded));
  if (S.pause?.until && Date.now() >= Date.parse(S.pause.until)) dates.push(Date.parse(S.pause.until));
  return Math.max(...dates.filter(Number.isFinite));
}

export function daysSince(S, now = Date.now()) {
  return Math.max(0, Math.floor((now - lastActivity(S)) / 864e5)) + (S.simPause || 0);
}

export function moodOf(days, name = "Dein Buddy") {
  const energy = Math.max(5, Math.min(100, 100 - Math.max(0, days - 2) * 4));
  if (days <= 7) return { key: "happy", label: "Topfit", energy, text: `${name} ist topfit. Weiter so!` };
  if (days <= 14) return { key: "tired", label: "Müde", energy, text: `${name} wird langsam müde. Ein Training diese Woche hält ${name} fit.` };
  if (days <= 21) return { key: "sad", label: "Traurig", energy, text: `${name} vermisst dich: ${days} Tage ohne Training. Ein kurzes Training bringt die Energie zurück.` };
  return { key: "sick", label: "Schlapp", energy, text: `${name} ist schlapp und kraftlos, ${days} Tage ohne Training. Schon ein Training hilft.` };
}

export function buddyState(S) {
  const xp = xpOf(S.sessions) + (S.bonus || []).reduce((n, b) => n + b.xp, 0);
  const lv = levelOf(xp);
  const name = S.buddy?.name || "Dein Buddy";
  const pause = activePause(S);
  if (pause) {
    const until = pause.until ? ` bis ${new Date(pause.until).toLocaleDateString("de-DE", { day: "numeric", month: "long" })}` : "";
    const text = { urlaub: `${name} macht mit dir Urlaub${until}. Erhol dich gut!`, verletzung: `${name} wartet geduldig, bis du wieder fit bist${until}. Gute Besserung!`, sonstiges: `${name} ruht sich mit dir aus${until}.` }[pause.reason] || `${name} ruht sich aus${until}.`;
    return { xp, ...lv, stage: stageOf(lv.level), days: 0, pause, mood: { key: "pause", label: "Pause", energy: 100, text } };
  }
  const days = daysSince(S);
  return { xp, ...lv, stage: stageOf(lv.level), days, mood: moodOf(days, name) };
}

/* Trainings in der aktuellen Woche (Mo-So) */
export function weekDays(sessions, now = new Date()) {
  const d = new Date(now);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const start = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const trained = sessions.some((s) => { const t = Date.parse(s.date); return t >= start && t < end; });
    return { label: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i], trained, today: start.toDateString() === d.toDateString() };
  });
}
