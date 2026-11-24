"use client";
import { useState } from "react";
import { quests, badgesOf, REWARDS, MEASURES, measuresFor, MEASURE_XP, canEarnMeasureXp, streak } from "../lib/game";
import { SPLITS } from "../lib/plan";
import { Header, Icon, Bar } from "./ui";

/* ---------- Wochen-Quests ---------- */
export function Quests({ app }) {
  const { S } = app;
  const list = quests(S);
  const open = list.filter((q) => !q.claimed);
  const doneCount = list.filter((q) => q.claimed).length;
  return (
    <section className="card stack-sm">
      <div className="between"><h3>Wochen-Quests</h3><span className="muted small">{doneCount} von {list.length} geschafft</span></div>
      {open.length === 0 && <p className="muted small">Alle Quests geschafft! Montag gibt es neue.</p>}
      {open.map((q) => (
        <div key={q.id} className={`quest ${q.done ? "ready" : ""}`}>
          <div className="grow stack-xs">
            <b>{q.title}</b>
            {q.need > 1 ? <Bar pct={q.have / q.need} label={q.title} /> : q.hint && !q.done ? <span className="muted small">{q.hint}</span> : null}
          </div>
          {q.done
            ? <button className="btn compact claim" onClick={() => app.claim(q)}>+{q.xp} XP</button>
            : <span className="xp-tag">{q.need > 1 ? `${q.have}/${q.need} · ` : ""}+{q.xp} XP</span>}
        </div>
      ))}
    </section>
  );
}

/* ---------- Erfolge und Belohnungspfad ---------- */
export function Achievements({ app, b }) {
  const { S, back } = app;
  const st = streak(S);
  const badges = badgesOf(S, { level: b.level, streak: st });
  const earned = badges.filter((x) => x.earned).length;
  return (
    <div className="stack">
      <Header title="Erfolge" onBack={back} />
      <div className="stats three">
        <div className="card stat"><b>{b.level}</b><span className="muted small">Level</span></div>
        <div className="card stat"><b>{st}</b><span className="muted small">Wochen-Serie</span></div>
        <div className="card stat"><b>{earned}/{badges.length}</b><span className="muted small">Abzeichen</span></div>
      </div>
      <h3>Abzeichen</h3>
      <div className="badges">
        {badges.map((x) => (
          <div key={x.id} className={`badge ${x.earned ? "on" : ""}`}>
            <span className="medal" aria-hidden="true">{x.earned ? x.icon : <Icon name="lock" size={18} />}</span>
            <b>{x.name}</b>
            <span className="muted small">{x.desc}</span>
          </div>
        ))}
      </div>
      <h3>Belohnungspfad</h3>
      <ol className="path">
        {REWARDS.map((r) => {
          const on = b.level >= r.level;
          return (
            <li key={r.level} className={on ? "on" : b.level + 1 === r.level ? "next" : ""}>
              <span className="lvl">L{r.level}</span>
              <span className="grow"><b>{r.title}</b><span className="muted small block">{r.desc}</span></span>
              {on ? <span className="status ok">Frei</span> : <Icon name="lock" size={18} />}
            </li>
          );
        })}
      </ol>
      <p className="muted small">XP gibt es für jedes Training (50 + 10 pro Satz), für Wochen-Quests und fürs Eintragen deiner Körpermaße.</p>
    </div>
  );
}

/* ---------- Trainingsaufbau (Splits) ---------- */
export function SplitPicker({ app, b }) {
  const { S } = app;
  const cur = S.plan?.split || "ganz";
  const days = +S.answers.days;
  return (
    <details className="card">
      <summary><b>Trainingsaufbau: {SPLITS[cur].name}</b><span className="muted small block">Mit höherem Level schaltest du Split-Training frei.</span></summary>
      <div className="choice-list pad-top-sm" role="radiogroup">
        {Object.entries(SPLITS).map(([id, sp]) => {
          const lockedLevel = b.level < sp.level;
          const tooFew = days < sp.minDays;
          const disabled = lockedLevel || tooFew;
          return (
            <button key={id} type="button" role="radio" aria-checked={cur === id} aria-disabled={disabled} className={`choice ${disabled ? "locked" : ""}`}
              onClick={() => (lockedLevel ? app.toast(`${sp.name} schaltest du mit Level ${sp.level} frei.`) : tooFew ? app.toast(`${sp.name} braucht mindestens ${sp.minDays} Trainingstage pro Woche.`) : cur !== id && app.changeSplit(id))}>
              <span className="grow"><b>{sp.name}</b><span className="muted small block">{lockedLevel ? `Ab Level ${sp.level}` : tooFew ? `Ab ${sp.minDays} Tagen pro Woche` : sp.desc}</span></span>
              {lockedLevel ? <Icon name="lock" size={18} /> : <span className="radio" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </details>
  );
}

/* ---------- Körpermaße (optional) ---------- */
function Spark({ vals, unit }) {
  if (vals.length < 2) return null;
  const w = 300, h = 44, p = 6, mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const pts = vals.map((v, i) => [p + (i * (w - 2 * p)) / (vals.length - 1), h - p - ((v - mn) / sp) * (h - 2 * p)]);
  const d = pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={`Verlauf von ${vals[0]} auf ${vals[vals.length - 1]} ${unit}`}>
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="var(--accent)" />
    </svg>
  );
}

export function Body({ app }) {
  const { S, back, mutate } = app;
  const body = S.body || { consent: false, entries: [] };
  const rec = measuresFor(S.answers.goal);
  const [vals, setVals] = useState({});
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);

  if (!body.consent) return (
    <div className="stack">
      <Header title="Körpermaße" onBack={back} />
      <h1>Fortschritt, den du siehst</h1>
      <p className="muted">Die Waage schwankt jeden Tag. Umfänge zeigen besser, ob du Fett verlierst oder Muskeln aufbaust. Für dein Ziel empfehlen wir: <b>{rec.map((k) => MEASURES[k].name).join(", ")}</b>.</p>
      <div className="card stack-sm">
        <p className="small"><b>Freiwillig und privat.</b> Körpermaße können Gesundheitsdaten sein. Sie bleiben für Freunde unsichtbar, und du kannst sie jederzeit löschen.</p>
        <label className="toggle"><input type="checkbox" id="body-consent" onChange={(e) => setErr(e.target.checked ? "" : err)} /><span className="small">Ich bin einverstanden, dass BuddyFit meine Körpermaße speichert.</span></label>
        {err && <p className="err" role="alert">{err}</p>}
      </div>
      <button className="btn" onClick={() => (document.getElementById("body-consent").checked ? mutate((s) => ({ ...s, body: { ...body, consent: true } })) : setErr("Bitte bestätige die Einwilligung."))}>Körpermaße aktivieren</button>
    </div>
  );

  const keys = [...rec, ...Object.keys(MEASURES).filter((k) => !rec.includes(k))];
  const save = () => {
    const entry = {};
    for (const k of Object.keys(vals)) {
      if (vals[k] === "" || vals[k] == null) continue;
      const m = MEASURES[k], v = +vals[k];
      if (!(v >= m.min && v <= m.max)) { setErr(`${m.name}: bitte einen Wert zwischen ${m.min} und ${m.max} ${m.unit} eingeben.`); return; }
      entry[k] = v;
    }
    if (!Object.keys(entry).length) { setErr("Trag mindestens einen Wert ein."); return; }
    app.addMeasure(entry);
    setVals({}); setErr("");
  };
  const series = (k) => body.entries.filter((e) => e[k] != null).map((e) => e[k]);

  return (
    <div className="stack">
      <Header title="Körpermaße" onBack={back} />
      <section className="card stack">
        <div className="between"><h3>Neu eintragen</h3>{canEarnMeasureXp(S) && <span className="xp-tag">+{MEASURE_XP} XP</span>}</div>
        {keys.map((k) => {
          const m = MEASURES[k];
          return (
            <div key={k} className="stack-xs">
              <label className="label" htmlFor={`m-${k}`}>{m.name}{rec.includes(k) && <span className="opt rec">empfohlen</span>}</label>
              <label className="unit-field"><input id={`m-${k}`} type="number" inputMode="decimal" step={m.step} min={m.min} max={m.max} value={vals[k] ?? ""} onChange={(e) => { setVals({ ...vals, [k]: e.target.value }); setErr(""); }} placeholder={series(k).at(-1) ? `zuletzt ${series(k).at(-1)}` : ""} /><span>{m.unit}</span></label>
              {m.how && <span className="muted small">{m.how}</span>}
            </div>
          );
        })}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" onClick={save}>Speichern</button>
        <p className="muted small">Tipp: Alle 2 bis 4 Wochen morgens messen, immer an derselben Stelle.</p>
      </section>
      {Object.keys(MEASURES).filter((k) => series(k).length).map((k) => {
        const v = series(k), m = MEASURES[k], diff = +(v.at(-1) - v[0]).toFixed(1);
        return (
          <section className="card stack-xs" key={k}>
            <div className="between"><b>{m.name}</b><span className="dose">{v.at(-1)} {m.unit}{v.length > 1 ? ` · ${diff > 0 ? "+" : ""}${diff} ${m.unit}` : ""}</span></div>
            <Spark vals={v} unit={m.unit} />
          </section>
        );
      })}
      <section className="card stack-sm">
        <h3>Körpermaße löschen</h3>
        {confirm ? <div className="row2"><button className="btn secondary" onClick={() => setConfirm(false)}>Behalten</button><button className="btn danger" onClick={() => { mutate((s) => ({ ...s, body: { consent: false, entries: [] } })); app.toast("Körpermaße gelöscht."); back(); }}>Löschen</button></div>
          : <button className="btn secondary" onClick={() => setConfirm(true)}>Alle Körpermaße löschen</button>}
      </section>
    </div>
  );
}
