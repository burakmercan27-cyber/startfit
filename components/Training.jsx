"use client";
import { useState } from "react";
import { EX, Q } from "../lib/exercises";
import { dose } from "../lib/plan";
import Buddy from "./Buddy";
import { Header, Icon, Bar } from "./ui";
import { SplitPicker } from "./Game";
import { Portrait } from "./Buddy";

export const short = (name) => name.split(" · ")[1] || name;
export const nextDay = (S) => (S.plan ? S.sessions.length % S.plan.days.length : 0);

/* ---------- Plan ---------- */
export function Plan({ app }) {
  const { S, day, setDay, go } = app;
  const p = S.plan, d = p.days[day] || p.days[0], nd = nextDay(S);
  const [help, setHelp] = useState(false);
  return (
    <div className="stack">
      <div>
        <p className="eyebrow">Dein Plan · {Q.goal.opts[S.answers.goal]}</p>
        <h1>{short(d.name)}</h1>
        <p className="muted small">{d.items.length} Übungen · ca. {S.answers.mins} Min. · {p.rest} Sek. Pause</p>
      </div>
      {app.b && <SplitPicker app={app} b={app.b} />}
      <div className="chips scroll" role="tablist" aria-label="Trainingstage">
        {p.days.map((x, i) => (
          <button key={i} role="tab" className="chip" aria-selected={i === day} aria-pressed={i === day} onClick={() => setDay(i)}>
            Training {i + 1}{i === nd ? " · als Nächstes" : ""}
          </button>
        ))}
      </div>
      <div className="card list">
        {d.items.map((it, i) => (
          <button key={i} className="row" onClick={() => go("exercise", i)}>
            <span className="num">{i + 1}</span>
            <span className="grow"><b>{EX[it.id].name}</b><span className="muted small block">{EX[it.id].muscle}</span></span>
            <span className="dose">{dose(it, S.answers.goal, S.shift[day] || 0)}</span>
            <Icon name="chevron" size={18} />
          </button>
        ))}
      </div>
      <button className="linkbtn small" onClick={() => setHelp(!help)} aria-expanded={help}><Icon name="info" size={16} /> Was bedeutet „3 × 8-12 Wdh.“?</button>
      {help && <p className="help small">3 Sätze mit je 8 bis 12 Wiederholungen. Nach jedem Satz {p.rest} Sekunden Pause. Wähle das Gewicht so, dass die letzten 2 Wiederholungen anstrengend sind, aber sauber gehen.</p>}
      <button className="btn" onClick={() => app.startWorkout(day)}><Icon name="play" size={18} /> Training {day + 1} starten</button>
      <details className="card">
        <summary><b>Warum sieht dein Plan so aus?</b></summary>
        <ul className="bullets small">{p.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
      </details>
      <p className="muted small">Erstellt auf Basis deiner Antworten, nur mit Übungen aus unserer geprüften Liste. Videos folgen.</p>
    </div>
  );
}

/* ---------- Übung ---------- */
export function Exercise({ app, idx }) {
  const { S, day, back } = app;
  const it = S.plan.days[day].items[idx], e = EX[it.id];
  return (
    <div className="stack">
      <Header title="Übung" onBack={back} />
      <div>
        <h1>{e.name}</h1>
        <p className="dose big">{dose(it, S.answers.goal, S.shift[day] || 0)} · {S.plan.rest} Sek. Pause</p>
      </div>
      <div className="why"><b>Warum diese Übung?</b> {it.why}</div>
      <div className="video" aria-label="Video folgt"><Icon name="play" size={28} /><span className="small">Video: {e.name} (folgt)</span></div>
      <div className="card"><h3>So geht's</h3><ol className="steps">{e.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
      <div className="card"><h3>Häufige Fehler</h3><ul className="bullets">{e.errors.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
    </div>
  );
}

/* ---------- Training läuft ---------- */
export function Workout({ app, dayIdx }) {
  const { S } = app;
  const d = S.plan.days[dayIdx];
  const [sets, setSets] = useState(() => d.items.map((it) => Array.from({ length: it.sets }, () => ({ reps: "", kg: "", done: false }))));
  const [open, setOpen] = useState(null);
  const [err, setErr] = useState("");
  const [confirmAbort, setConfirmAbort] = useState(false);
  const [checkin, setCheckin] = useState(false);
  const [cheer, setCheer] = useState("");
  const cheers = ["Stark!", "Sauber gemacht!", "Weiter so!", "Noch einer, du schaffst das!", "Das gibt XP!"];
  const jubel = app.b && app.b.level >= 4;
  const all = sets.flat(), doneCount = all.filter((s) => s.done).length;
  const setVal = (i, j, f, v) => setSets(sets.map((a, x) => (x !== i ? a : a.map((s, y) => (y !== j ? s : { ...s, [f]: v })))));
  const session = (feel) => {
    const out = [];
    sets.forEach((arr, i) => arr.forEach((st) => { if (st.done) out.push({ id: d.items[i].id, reps: +st.reps || 0, kg: +st.kg || 0 }); }));
    return { date: new Date().toISOString(), day: dayIdx, sets: out, feel: feel || null };
  };

  if (checkin) return (
    <div className="stack center-text pad-top">
      <h1>Geschafft!</h1>
      <p className="muted">Wie war Training {dayIdx + 1}? Dein nächstes Training passt sich daran an.</p>
      <div className="stack">
        {[["leicht", "Zu leicht"], ["passt", "Genau richtig"], ["schwer", "Zu schwer"]].map(([k, l]) => (
          <button key={k} className="btn secondary" onClick={() => app.finishWorkout(session(k), k)}>{l}</button>
        ))}
      </div>
      <button className="linkbtn" onClick={() => app.finishWorkout(session(null), null)}>Überspringen</button>
    </div>
  );

  return (
    <div className="stack">
      <Header title={`Training ${dayIdx + 1}`} onBack={() => setConfirmAbort(true)} right={<span className="pill">{doneCount}/{all.length}</span>} />
      <Bar pct={all.length ? doneCount / all.length : 0} label="Erledigte Sätze" />
      {jubel && cheer && <div className="cheer" role="status"><Portrait look={S.buddy} size={36} label={S.buddy.name} /><span><b>{S.buddy.name}:</b> {cheer}</span></div>}
      {confirmAbort && (
        <div className="card warn stack">
          <b>Training abbrechen?</b>
          <p className="small">{doneCount ? `Deine ${doneCount} erledigten Sätze werden gespeichert.` : "Es ist noch kein Satz erledigt, es wird nichts gespeichert."}</p>
          <div className="row2">
            <button className="btn secondary" onClick={() => setConfirmAbort(false)}>Weitertrainieren</button>
            <button className="btn ghost" onClick={() => app.abortWorkout(doneCount ? session(null) : null)}>Abbrechen</button>
          </div>
        </div>
      )}
      {d.items.map((it, i) => {
        const e = EX[it.id], timed = e.unit === "sec" || e.cat === "mobility", bw = timed || (e.loc.length === 1 && e.loc[0] === "none");
        const exDone = sets[i].every((s) => s.done);
        return (
          <section className={`card stack-sm ${exDone ? "done" : ""}`} key={i}>
            <div className="between">
              <div><h3>{e.name}</h3><p className="dose">{dose(it, S.answers.goal, S.shift[dayIdx] || 0)}</p></div>
              <button className="linkbtn small" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>{open === i ? "Schließen" : "Anleitung"}</button>
            </div>
            {open === i && <div className="why small"><b>Warum?</b> {it.why}<ol className="steps">{e.steps.map((s, k) => <li key={k}>{s}</li>)}</ol></div>}
            <div className="setgrid">
              <span className="h">Satz</span><span className="h">{timed ? "Sek." : "Wdh."}</span><span className="h">{bw ? "" : "kg"}</span><span />
              {sets[i].map((st, j) => [
                <span key={`n${j}`} className="dose">{j + 1}</span>,
                <input key={`r${j}`} id={`r-${i}-${j}`} type="number" inputMode="numeric" value={st.reps} placeholder={timed ? "Sek." : "Wdh."} aria-label={`${e.name}, Satz ${j + 1}, ${timed ? "Sekunden" : "Wiederholungen"}`} onChange={(ev) => setVal(i, j, "reps", ev.target.value)} />,
                bw ? <span key={`k${j}`} className="muted small">Körpergewicht</span>
                  : <input key={`k${j}`} id={`k-${i}-${j}`} type="number" inputMode="decimal" step="0.5" value={st.kg} placeholder="kg" aria-label={`${e.name}, Satz ${j + 1}, Kilogramm`} onChange={(ev) => setVal(i, j, "kg", ev.target.value)} />,
                <button key={`c${j}`} className="check" aria-pressed={st.done} aria-label={`${e.name}, Satz ${j + 1} erledigt`} onClick={() => { setVal(i, j, "done", !st.done); setErr(""); if (!st.done && jubel) setCheer(cheers[(doneCount + 1) % cheers.length]); }}><Icon name="check" size={20} /></button>,
              ])}
            </div>
          </section>
        );
      })}
      {err && <p className="err" role="alert">{err}</p>}
      <div className="sticky-cta">
        <button className="btn" onClick={() => (doneCount ? setCheckin(true) : setErr("Hake mindestens einen Satz ab, dann kannst du das Training beenden."))}>Training beenden</button>
      </div>
    </div>
  );
}

/* ---------- Erfolg ---------- */
export function Success({ app, info }) {
  const { S } = app;
  return (
    <div className="stack center-text pad-top">
      <Buddy look={S.buddy} mood="happy" stage={info.stage} size={190} label={`${S.buddy.name} freut sich`} />
      <h1>{info.levelUp ? `Level ${info.level}!` : `+${info.gained} XP`}</h1>
      <p className="muted">{info.levelUp ? `${S.buddy.name} ist gewachsen. ${info.stageUp ? "Neue Ausrüstung freigeschaltet!" : "Weiter so!"}` : `${S.buddy.name} hat neue Energie. Noch ${info.toNext} XP bis Level ${info.level + 1}.`}</p>
      {info.message && <p className="help small">{info.message}</p>}
      <button className="btn" onClick={() => app.go("home")}>Zurück zum Start</button>
      <button className="linkbtn" onClick={() => app.go("progress")}>Fortschritt ansehen</button>
    </div>
  );
}

/* ---------- Fortschritt ---------- */
function Spark({ vals }) {
  if (vals.length < 2) return null;
  const w = 300, h = 48, p = 6, mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const pts = vals.map((v, i) => [p + (i * (w - 2 * p)) / (vals.length - 1), h - p - ((v - mn) / sp) * (h - 2 * p)]);
  const d = pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={`Verlauf von ${mn} auf ${mx} kg`}>
      <line x1="0" x2={w} y1={h - p} y2={h - p} stroke="var(--line)" strokeWidth="1" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="var(--accent)" />
    </svg>
  );
}

export function Progress({ app }) {
  const { S, back, go } = app;
  const ss = S.sessions;
  if (!ss.length) return (
    <div className="stack">
      <Header title="Fortschritt" onBack={back} />
      <div className="empty"><b>Noch kein Training gespeichert.</b><p className="muted small">Nach deinem ersten Training siehst du hier, wie deine Gewichte steigen.</p><button className="btn" onClick={() => go("plan")}>Zum Plan</button></div>
    </div>
  );
  const sets = ss.reduce((n, s) => n + s.sets.length, 0);
  const byEx = {};
  ss.forEach((s) => { const best = {}; s.sets.forEach((x) => { if (x.kg > 0) best[x.id] = Math.max(best[x.id] || 0, x.kg); }); Object.entries(best).forEach(([id, kg]) => (byEx[id] = byEx[id] || []).push(kg)); });
  return (
    <div className="stack">
      <Header title="Fortschritt" onBack={back} />
      <div className="stats">
        <div className="card stat"><b>{ss.length}</b><span className="muted small">Trainings</span></div>
        <div className="card stat"><b>{sets}</b><span className="muted small">Sätze</span></div>
      </div>
      <button className="card row-card" onClick={() => go("body")}><span className="grow"><b>Körpermaße</b><span className="muted small block">{S.body?.consent ? "Umfänge und Gewicht im Verlauf" : "Optional: Bauch, Oberarm, Gewicht verfolgen"}</span></span><Icon name="chevron" size={18} /></button>
      <h3>Kraftverlauf</h3>
      {Object.keys(byEx).length ? Object.entries(byEx).map(([id, v]) => {
        const diff = v[v.length - 1] - v[0];
        return (
          <div className="card stack-sm" key={id}>
            <div className="between"><b>{EX[id].name}</b><span className="dose">{v[v.length - 1]} kg{v.length > 1 ? ` · ${diff >= 0 ? "+" : ""}${diff} kg` : ""}</span></div>
            <Spark vals={v} />
          </div>
        );
      }) : <div className="empty small">Trag beim Training ein Gewicht ein, dann siehst du hier deinen Kraftverlauf.</div>}
      <h3>Letzte Trainings</h3>
      <div className="card list">
        {[...ss].reverse().slice(0, 6).map((s, i) => (
          <div className="row static" key={i}>
            <span className="grow"><b>Training {s.day + 1}</b><span className="muted small block">{new Date(s.date).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</span></span>
            <span className="dose">{s.sets.length} Sätze</span>
          </div>
        ))}
      </div>
    </div>
  );
}
