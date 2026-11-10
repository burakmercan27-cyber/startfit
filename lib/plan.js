import { EX, Q } from "./exercises";

/* Regel-Logik: erzeugt immer einen gültigen Plan. Die KI darf danach nur innerhalb dieser Grenzen auswählen und begründen. */
const POOL = ["squat", "hinge", "push", "pull", "core"];
const TEMPL = {
  A: { name: "Ganzkörper A", slots: ["squat", "push", "pull", "hinge", "core", "push"] },
  B: { name: "Ganzkörper B", slots: ["hinge", "pull", "push", "squat", "core", "pull"] },
  O: { name: "Oberkörper", slots: ["push", "pull", "push", "pull", "core", "push"] },
  U: { name: "Unterkörper", slots: ["squat", "hinge", "core", "squat", "hinge", "core"] },
};
const MOBILITY = ["hueftdehnung", "bwsrotation", "katzekuh"];

export function allowed(id, loc) {
  const l = EX[id].loc;
  if (loc === "gym") return true;
  if (loc === "db") return l.includes("db") || l.includes("none");
  return l.includes("none");
}

export function candidates(cat, loc) {
  let c = Object.keys(EX).filter((id) => EX[id].cat === cat && allowed(id, loc));
  if (loc === "gym" && cat !== "core") {
    const g = c.filter((id) => EX[id].loc.includes("gym"));
    if (g.length) c = g;
  }
  return c;
}

function pick(cat, loc, used, seed) {
  const c = candidates(cat, loc);
  for (let i = 0; i < c.length; i++) {
    const id = c[(seed + i) % c.length];
    if (!used.includes(id)) return id;
  }
  const alt = Object.keys(EX).filter((id) => POOL.includes(EX[id].cat) && allowed(id, loc) && !used.includes(id));
  return alt.length ? alt[seed % alt.length] : c[seed % c.length];
}

export function settings(a) {
  const days = +a.days, mins = +a.mins;
  const seq = days <= 3 ? ["A", "B", "A"].slice(0, days) : days === 4 ? ["O", "U", "O", "U"] : ["O", "U", "A", "O", "U"];
  const n = mins <= 30 ? 4 : mins === 45 ? 5 : 6;
  let sets = a.exp === "unter6" ? 3 : 2;
  if (mins === 20) sets = 2;
  if (a.work === "schwer") sets = Math.max(2, sets - 1);
  const rest = { muskel: 90, abnehmen: 60, ausdauer: 45, fitness: 75 }[a.goal] + (a.work === "schwer" ? 15 : 0);
  return { seq, n, sets, rest };
}

/* Gerüst mit Slots: pro Slot Kategorie, Vorschlag und erlaubte Alternativen */
export function skeleton(a, standard = false) {
  const { seq, n, sets, rest } = settings(a);
  const days = seq.map((t, d) => {
    const used = [];
    const items = [];
    if (a.work === "sitzend") {
      const m = MOBILITY[d % 3];
      used.push(m);
      items.push({ id: m, sets: 1, cat: "mobility", options: MOBILITY });
    }
    let k = 0;
    while (items.length < n) {
      const cat = TEMPL[t].slots[k % 6];
      const id = pick(cat, a.loc, used, d + Math.floor(k / 6) + (standard ? 0 : k));
      used.push(id);
      items.push({ id, sets, cat, options: candidates(cat, a.loc) });
      k++;
    }
    return { name: `Training ${d + 1} · ${TEMPL[t].name}`, items };
  });
  return { days, rest };
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

export function ruleReasons(a, rest) {
  const r = [];
  r.push(`${a.days} Trainings pro Woche à ${a.mins} Minuten, so wie du es angegeben hast.`);
  r.push(+a.days <= 3
    ? "Ganzkörper-Training: jeder Muskel wird mindestens zweimal pro Woche trainiert, ideal für den Einstieg."
    : "Wechsel aus Ober- und Unterkörper: so hat jede Muskelgruppe zwischen den Trainings Zeit zur Erholung.");
  r.push({ gym: "Nur Übungen mit Geräten aus deinem Studio.", none: "Nur Übungen ohne Geräte, machbar im Wohnzimmer.", db: "Übungen mit Kurzhanteln und Körpergewicht." }[a.loc]);
  if (a.work === "sitzend") r.push("Jedes Training startet mit einer Mobilitätsübung, weil du viel sitzt.");
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
    reasons: ruleReasons(a, sk.rest),
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
  return Object.keys(Q).map((k) => `${Q[k].label} ${Q[k].opts[a[k]]}${k === "mins" ? " Minuten" : ""}`).join("\n");
}
