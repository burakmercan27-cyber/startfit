import { EX, Q, FOCUS, answerText } from "./exercises";

/* Regel-Logik: erzeugt immer einen gültigen Plan. Die KI darf danach nur innerhalb dieser Grenzen auswählen und begründen. */
const POOL = ["squat", "hinge", "push", "pull", "core"];
const TEMPL = {
  A: { name: "Ganzkörper A", slots: ["squat", "push", "pull", "hinge", "core", "push"] },
  B: { name: "Ganzkörper B", slots: ["hinge", "pull", "push", "squat", "core", "pull"] },
  O: { name: "Oberkörper", slots: ["push", "pull", "push", "pull", "core", "push"] },
  U: { name: "Unterkörper", slots: ["squat", "hinge", "core", "squat", "hinge", "core"] },
  // Split-Tage (Muskelfokus aus FOCUS, sonst Kategorie)
  PUSH: { name: "Push: Brust, Schultern, Trizeps", slots: ["brust", "schulter", "brust", "trizeps", "schulter", "core"] },
  PULL: { name: "Pull: Rücken, Bizeps", slots: ["ruecken", "ruecken", "bizeps", "ruecken", "core", "bizeps"] },
  BEINE: { name: "Beine und Po", slots: ["squat", "hinge", "squat", "hinge", "core", "core"] },
  BT: { name: "Brust und Trizeps", slots: ["brust", "brust", "trizeps", "brust", "trizeps", "core"] },
  RB: { name: "Rücken und Bizeps", slots: ["ruecken", "ruecken", "bizeps", "ruecken", "bizeps", "core"] },
  SB: { name: "Schultern und Bauch", slots: ["schulter", "schulter", "core", "schulter", "core", "core"] },
  BRUST: { name: "Brust", slots: ["brust", "brust", "brust", "trizeps", "core", "brust"] },
  RUECKEN: { name: "Rücken", slots: ["ruecken", "ruecken", "ruecken", "core", "ruecken", "bizeps"] },
  SCHULTER: { name: "Schultern", slots: ["schulter", "schulter", "schulter", "core", "schulter", "trizeps"] },
  ARME: { name: "Arme", slots: ["bizeps", "trizeps", "bizeps", "trizeps", "core", "bizeps"] },
};
const MOBILITY = ["hueftdehnung", "bwsrotation", "katzekuh"];

/* Trainingsaufbau: Ganzkörper für alle, Splits werden mit dem Buddy-Level freigeschaltet */
export const SPLITS = {
  ganz: { name: "Ganzkörper", level: 1, minDays: 1, desc: "Jedes Training trainiert den ganzen Körper. Ideal für den Einstieg." },
  "3er": { name: "3er-Split", level: 3, minDays: 3, days: ["PUSH", "PULL", "BEINE"], desc: "Push, Pull, Beine: mehr Übungen pro Muskelgruppe." },
  "4er": { name: "4er-Split", level: 5, minDays: 4, days: ["BT", "RB", "BEINE", "SB"], desc: "Brust/Trizeps, Rücken/Bizeps, Beine, Schultern/Bauch." },
  "5er": { name: "5er-Split", level: 7, minDays: 5, days: ["BRUST", "RUECKEN", "BEINE", "SCHULTER", "ARME"], desc: "Jeden Tag eine Muskelgruppe, für Fortgeschrittene." },
};

export function allowed(id, loc) {
  const l = EX[id].loc;
  if (loc === "gym") return true;
  if (loc === "db") return l.includes("db") || l.includes("none");
  return l.includes("none");
}

const isCat = (slot) => [...POOL, "mobility"].includes(slot);

const ISOLATION = ["bizeps", "trizeps"];
export function candidates(slot, loc) {
  if (isCat(slot)) {
    // Ganzkörper-Slots: nur Grundübungen, keine Isolationsübungen (Curls, Trizeps, Seitheben)
    let c = Object.keys(EX).filter((id) => EX[id].cat === slot && allowed(id, loc) && !ISOLATION.includes(FOCUS[id]) && id !== "seitheben");
    if (loc === "gym" && slot !== "core") { const g = c.filter((id) => EX[id].loc.includes("gym")); if (g.length) c = g; }
    return c;
  }
  // Split-Slots nach Muskelfokus: im Studio zuerst Geräte und Hanteln
  const c = Object.keys(EX).filter((id) => FOCUS[id] === slot && allowed(id, loc));
  if (loc !== "none") { const eq = c.filter((id) => !EX[id].loc.includes("none")); if (eq.length) return eq; }
  return c;
}

function pick(slot, loc, used, seed) {
  const c = candidates(slot, loc);
  for (let i = 0; i < c.length; i++) {
    const id = c[(seed + i) % c.length];
    if (!used.includes(id)) return id;
  }
  // Fallback: gleiche Bewegungsart, sonst irgendeine erlaubte Kraftübung
  const cat = isCat(slot) ? slot : { brust: "push", schulter: "push", trizeps: "push", ruecken: "pull", bizeps: "pull" }[slot];
  const same = Object.keys(EX).filter((id) => EX[id].cat === cat && allowed(id, loc) && !used.includes(id) && (isCat(slot) || !ISOLATION.includes(FOCUS[id]) || FOCUS[id] === slot));
  if (same.length) return same[seed % same.length];
  if (!isCat(slot)) return null; // Split-Tag: lieber eine Übung weniger als eine unpassende
  const alt = Object.keys(EX).filter((id) => POOL.includes(EX[id].cat) && allowed(id, loc) && !used.includes(id));
  return alt.length ? alt[seed % alt.length] : (c[0] || "plank");
}

const bmi = (a) => (a.height && a.weight ? a.weight / (a.height / 100) ** 2 : null);
export const jointFriendly = (a) => (+a.age >= 50) || (bmi(a) || 0) >= 30;

export function settings(a) {
  const days = Math.min(7, Math.max(1, +a.days));
  const mins = +a.mins;
  const split = SPLITS[a.split] && a.split !== "ganz" && days >= SPLITS[a.split].minDays ? a.split : "ganz";
  const seq = split === "ganz"
    ? { 1: ["A"], 2: ["A", "B"], 3: ["A", "B", "A"], 4: ["O", "U", "O", "U"], 5: ["O", "U", "A", "O", "U"], 6: ["O", "U", "A", "O", "U", "B"], 7: ["O", "U", "A", "O", "U", "B", "A"] }[days]
    : Array.from({ length: days }, (_, i) => SPLITS[split].days[i % SPLITS[split].days.length]);
  const n = mins <= 20 ? 3 : mins <= 30 ? 4 : mins <= 50 ? 5 : 6;
  let sets = a.exp === "unter6" ? 3 : 2;
  if (mins <= 25) sets = 2;
  if (mins >= 75) sets += 1;
  if (a.work === "schwer") sets = Math.max(2, sets - 1);
  let rest = { muskel: 90, abnehmen: 60, ausdauer: 45, fitness: 75 }[a.goal] + (a.work === "schwer" ? 15 : 0);
  if (jointFriendly(a)) rest += 15;
  return { seq, n, sets, rest, split };
}

/* Gerüst mit Slots: pro Slot Kategorie, Vorschlag und erlaubte Alternativen */
export function skeleton(a, standard = false) {
  const { seq, n, sets, rest, split } = settings(a);
  const gentle = jointFriendly(a);
  const days = seq.map((t, d) => {
    const used = gentle ? ["ausfall"] : [];
    const items = [];
    if (a.work === "sitzend" || +a.age >= 50) {
      const m = MOBILITY[d % 3];
      used.push(m);
      items.push({ id: m, sets: 1, cat: "mobility", options: MOBILITY });
    }
    let k = 0;
    while (items.length < n && k < 12) {
      const slot = TEMPL[t].slots[k % 6];
      const id = pick(slot, a.loc, used, d + Math.floor(k / 6) + (standard ? 0 : k));
      if (!id) { k++; continue; }
      used.push(id);
      items.push({ id, sets, cat: slot, options: candidates(slot, a.loc).filter((x) => !(gentle && x === "ausfall")) });
      k++;
    }
    return { name: `Training ${d + 1} · ${TEMPL[t].name}`, items };
  });
  return { days, rest, split };
}

export function ruleWhy(id, a) {
  const e = EX[id];
  const goal = {
    muskel: "Mit 8-12 kontrollierten Wiederholungen bis kurz vor die Erschöpfung setzt du einen klaren Reiz für Muskelaufbau.",
    abnehmen: "Große Muskelgruppen zu trainieren hilft, beim Abnehmen Muskeln zu erhalten statt nur Gewicht zu verlieren.",
    ausdauer: "Viele Wiederholungen mit kurzer Pause trainieren deine Kraftausdauer.",
    fitness: "Du trainierst ein Bewegungsmuster, das du im Alltag ständig brauchst: heben, tragen, aufstehen.",
  }[a.goal];
  let s = `Trainiert ${e.muscle}. `;
  if (e.cat === "mobility") s += "Macht dich beweglicher und bereitet den Körper aufs Training vor. ";
  else if (e.cat === "core") s += "Ein stabiler Rumpf schützt den Rücken bei allen anderen Übungen. ";
  else s += goal + " ";
  if (a.work === "sitzend" && ["hinge", "pull", "mobility"].includes(e.cat)) s += "Gleicht langes Sitzen aus.";
  if (a.work === "schwer" && ["squat", "hinge"].includes(e.cat)) s += "Wenige Sätze, damit du dich neben der Arbeit erholst.";
  return s.trim();
}

export function ruleReasons(a, rest, split = "ganz") {
  const r = [];
  r.push(`${a.days} ${+a.days === 1 ? "Training" : "Trainings"} pro Woche à ${a.mins} Minuten, so wie du es angegeben hast.`);
  if (+a.days >= 6) r.push("Bei so vielen Trainingstagen wechseln sich die Muskelgruppen ab. Gönn dir trotzdem mindestens einen Ruhetag pro Woche.");
  if (split !== "ganz") r.push(`${SPLITS[split].name}: ${SPLITS[split].desc} Freigeschaltet mit deinem Buddy-Level.`);
  else r.push(+a.days <= 3
    ? "Ganzkörper-Training: jeder Muskel wird mindestens zweimal pro Woche trainiert, ideal für den Einstieg."
    : "Wechsel aus Ober- und Unterkörper: so hat jede Muskelgruppe zwischen den Trainings Zeit zur Erholung.");
  r.push({ gym: "Nur Übungen mit Geräten aus deinem Studio.", none: "Nur Übungen ohne Geräte, machbar im Wohnzimmer.", db: "Übungen mit Kurzhanteln und Körpergewicht." }[a.loc]);
  if (a.work === "sitzend") r.push("Jedes Training startet mit einer Mobilitätsübung, weil du viel sitzt.");
  if (+a.age >= 50) r.push("Mit einer Mobilitätsübung zum Start und etwas längeren Pausen schonst du Gelenke und Sehnen.");
  else if (jointFriendly(a)) r.push("Gelenkschonend: keine Sprung- oder Ausfallschritt-Übungen und etwas längere Pausen.");
  if (a.work === "schwer") r.push(`Weniger Sätze und ${rest} Sek. Pause, weil deine Arbeit dich schon körperlich fordert.`);
  r.push({
    morgens: "Morgens: nimm dir 5 Minuten zum Aufwärmen, der Körper ist noch steif.",
    mittags: "Mittags: kurze Einheiten passen in die Pause, plane 10 Minuten zum Umziehen ein.",
    abends: "Abends: der Plan passt nach der Arbeit, die Einheiten bleiben bei deiner angegebenen Dauer.",
    wechselnd: "Keine festen Wochentage: mach einfach das nächste Training im Plan, egal an welchem Tag.",
  }[a.time]);
  return r;
}

/* Fertiger Plan ohne KI (Standardplan und Rückfallebene) */
export function rulePlan(a, standard = false) {
  const sk = skeleton(a, standard);
  return {
    days: sk.days.map((d) => ({ name: d.name, items: d.items.map((it) => ({ id: it.id, sets: it.sets, why: ruleWhy(it.id, a) })) })),
    rest: sk.rest,
    reasons: ruleReasons(a, sk.rest, sk.split),
    split: sk.split,
    created: new Date().toISOString(),
    source: standard ? "standard" : "regel",
  };
}

export function dose(item, goal, shift = 0) {
  const e = EX[item.id];
  if (e.cat === "mobility") return e.unit === "reps" ? "1 × 10 langsam" : "30 Sek. je Seite";
  if (e.unit === "sec") {
    const b = { muskel: [20, 40], abnehmen: [30, 45], ausdauer: [40, 60], fitness: [20, 40] }[goal];
    return `${item.sets} × ${b[0] + shift * 10}-${b[1] + shift * 10} Sek.`;
  }
  const r = { muskel: [8, 12], abnehmen: [12, 15], ausdauer: [15, 20], fitness: [10, 12] }[goal];
  const lo = Math.max(5, r[0] + shift * 2), hi = Math.max(lo + 2, r[1] + shift * 2);
  return `${item.sets} × ${lo}-${hi} Wdh.`;
}

export function describeAnswers(a) {
  return Object.keys(Q).map((k) => `${Q[k].label} ${answerText(k, a[k])}`).join("\n");
}
