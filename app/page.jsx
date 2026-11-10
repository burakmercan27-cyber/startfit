"use client";
import { useEffect, useState } from "react";
import { EX, Q, STEPS } from "../lib/exercises";
import { rulePlan, dose } from "../lib/plan";
import { fresh, loadLocal, loadRemote, saveAll, pushSession, wipeAll } from "../lib/store";

const nextDay = (S) => (S.plan ? S.sessions.length % S.plan.days.length : 0);
const short = (name) => name.split(" · ")[1] || name;

export default function App() {
  const [S, setS] = useState(fresh);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState("welcome");
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({});
  const [day, setDay] = useState(0);
  const [ex, setEx] = useState(null);
  const [live, setLive] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Laden: erst Browser, dann (falls vorhanden) Convex
  useEffect(() => {
    const local = loadLocal();
    setS(local);
    if (local.plan) { setScreen("plan"); setDay(nextDay(local)); }
    setReady(true);
    loadRemote().then((r) => { if (r && r.plan) { setS(r); setScreen((s) => (s === "welcome" ? "plan" : s)); setDay(nextDay(r)); } });
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [screen, step]);

  const update = (next) => { setS(next); saveAll(next); };
  const go = (s) => { setErr(""); setScreen(s); };

  async function makePlan(answers, standard) {
    go("generating");
    const base = { ...S, answers };
    if (standard) { finish(base, rulePlan(answers, true)); return; }
    if (S.failSim) { update({ ...base, failSim: false }); setTimeout(() => go("failed"), 800); return; }
    try {
      const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      if (!r.ok) throw new Error(String(r.status));
      finish(base, await r.json());
    } catch { setS(base); saveAll(base); go("failed"); }
  }
  function finish(base, plan) {
    const next = { ...base, plan, failSim: false };
    update(next); setDay(nextDay(next)); setMsg(""); go("plan");
  }

  function seedSample() {
    const answers = { goal: "muskel", exp: "neustart", days: "3", mins: "45", loc: "gym", work: "sitzend", time: "abends" };
    const plan = rulePlan(answers);
    const now = Date.now(), d = 864e5;
    const mk = (ago, di, kgs) => {
      const sets = [];
      plan.days[di].items.forEach((it, i) => { for (let j = 0; j < it.sets; j++) sets.push({ id: it.id, reps: 10, kg: ["mobility", "core"].includes(EX[it.id].cat) ? 0 : kgs[i] || 0 }); });
      return { date: new Date(now - ago * d).toISOString(), day: di, sets, feel: "passt" };
    };
    const next = { ...fresh(), sample: true, consent: true, answers, plan,
      sessions: [mk(12, 0, [0, 60, 30, 35, 0]), mk(10, 1, [0, 25, 35, 30, 0]), mk(7, 2, [0, 65, 32.5, 37.5, 0]), mk(5, 0, [0, 70, 32.5, 40, 0]), mk(2, 1, [0, 30, 37.5, 32.5, 0])] };
    update(next); setDay(nextDay(next)); go("plan");
  }

  function storeSession(feel) {
    const d = S.plan.days[live.day], sets = [];
    live.sets.forEach((arr, i) => arr.forEach((st) => { if (st.done) sets.push({ id: d.items[i].id, reps: +st.reps || 0, kg: +st.kg || 0 }); }));
    const session = { date: new Date().toISOString(), day: live.day, sets, feel: feel || null };
    pushSession(session, S.sample);
    return session;
  }

  if (!ready) return <div className="app" />;

  const tabbed = ["plan", "progress", "profile", "exercise", "myth"].includes(screen);
  const current = screen === "exercise" || screen === "myth" ? "plan" : screen;

  /* ---------- Bildschirme ---------- */
  let body = null;
  if (screen === "welcome") body = (
    <div className="stack">
      <h1>Ein Plan, dem du vertrauen kannst.</h1>
      <p className="muted">Schluss mit widersprüchlichen Tipps aus YouTube und TikTok. Beantworte 5 kurze Fragen und du bekommst einen Trainingsplan, der zu deinem Alltag passt und jede Übung erklärt.</p>
      <div className="card stack small">
        <div><b>1.</b> 5 Fragen zu Ziel, Zeit, Ort und Alltag</div>
        <div><b>2.</b> Dein Plan mit einem „Warum“ zu jeder Übung</div>
        <div><b>3.</b> Training abhaken und Fortschritt sehen</div>
      </div>
      <button className="btn" onClick={() => { const base = S.sample ? fresh() : S; if (S.sample) setS(base); setDraft({ ...base.answers }); setStep(0); go(base.consent ? "onboarding" : "consent"); }}>Los geht's</button>
      <button className="btn secondary" onClick={seedSample}>Beispiel ansehen (Persona Daniel)</button>
    </div>
  );

  if (screen === "consent") body = <Consent initial={S.consent} err={err} onOk={() => { update({ ...S, consent: true }); setStep(0); go("onboarding"); }} onErr={() => setErr("Bitte bestätige die Hinweise, um fortzufahren.")} />;

  if (screen === "onboarding") {
    const st = STEPS[step];
    body = (
      <div className="stack">
        <div className="progress" aria-label={`Frage ${step + 1} von 5`}>{STEPS.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
        <p className="small muted">Frage {step + 1} von 5</p>
        <h1>{st.title}</h1>
        <div className="card stack" style={{ gap: 18 }}>
          {st.keys.map((k) => (
            <div className="stack" style={{ gap: 8 }} key={k}>
              <div className="qlabel">{Q[k].label}</div>
              <div className="chips" role="group" aria-label={Q[k].label}>
                {Object.entries(Q[k].opts).map(([v, l]) => (
                  <button key={v} className="chip" aria-pressed={String(draft[k]) === v} onClick={() => { setDraft({ ...draft, [k]: v }); setErr(""); }}>{l}</button>
                ))}
              </div>
              {err && !draft[k] && <p className="err" role="alert">Bitte wähle aus: {Q[k].label.replace("?", "")}.</p>}
            </div>
          ))}
        </div>
        <button className="btn" onClick={() => {
          if (st.keys.some((k) => !draft[k])) { setErr("missing"); return; }
          if (step < 4) { setStep(step + 1); setErr(""); } else makePlan({ ...draft }, false);
        }}>{step === 4 ? "Plan erstellen" : "Weiter"}</button>
        {step > 0 && <button className="btn link" onClick={() => { setStep(step - 1); setErr(""); }}>Zurück</button>}
      </div>
    );
  }

  if (screen === "generating") body = (
    <div className="stack" style={{ textAlign: "center", paddingTop: 40 }}>
      <div className="spinner" aria-hidden="true" />
      <h2>Dein Plan wird erstellt</h2>
      <p className="muted small">Die KI wählt passende Übungen aus der geprüften Übungsliste und begründet jede einzelne.</p>
    </div>
  );

  if (screen === "failed") body = (
    <div className="stack">
      <h1>Der Plan konnte nicht erstellt werden</h1>
      <p className="muted">Die KI hat gerade nicht geantwortet. Deine Antworten sind gespeichert.</p>
      <button className="btn" onClick={() => makePlan(S.answers, false)}>Nochmal versuchen</button>
      <button className="btn secondary" onClick={() => makePlan(S.answers, true)}>Standardplan für mein Ziel nutzen</button>
    </div>
  );

  if (screen === "plan" && S.plan) {
    const p = S.plan, d = p.days[day] || p.days[0], nd = nextDay(S);
    body = (
      <div className="stack">
        {msg && <div className="banner" role="status">{msg}</div>}
        <div>
          <p className="qlabel">Dein Plan · {Q.goal.opts[S.answers.goal]}</p>
          <h1>{short(d.name)}</h1>
          <p className="small muted">{d.items.length} Übungen · ca. {S.answers.mins} Min. · {p.rest} Sek. Pause zwischen den Sätzen{p.source === "standard" ? " · Standardplan" : ""}</p>
        </div>
        <div className="daytabs">
          {p.days.map((x, i) => <button key={i} className="chip" aria-pressed={i === day} onClick={() => { setDay(i); setMsg(""); }}>Training {i + 1}{i === nd ? " · als Nächstes" : ""}</button>)}
        </div>
        <div className="card" style={{ paddingBlock: 4 }}>
          {d.items.map((it, i) => (
            <button key={i} className="row" onClick={() => { setEx(i); go("exercise"); }}>
              <div className="grow"><h3>{EX[it.id].name}</h3><p className="small muted">{EX[it.id].muscle}</p></div>
              <span className="dose">{dose(it, S.answers.goal, S.shift[day] || 0)}</span><span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
        <button className="btn" onClick={() => { setLive({ day, sets: d.items.map((it) => Array.from({ length: it.sets }, () => ({ reps: "", kg: "", done: false }))) }); setEx(null); go("workout"); }}>Training {day + 1} starten</button>
        <details className="card" open>
          <summary><b>Warum sieht dein Plan so aus?</b></summary>
          <ul className="list small" style={{ marginTop: 8 }}>{p.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </details>
        <button className="btn secondary" onClick={() => go("myth")}>Tipp aus TikTok oder YouTube prüfen</button>
        <p className="small muted">{p.source === "ki" ? "Erstellt von einer KI auf Basis deiner Antworten, nur mit Übungen aus unserer geprüften Liste." : "Erstellt auf Basis deiner Antworten mit unserer geprüften Übungsliste."} Videos sind noch Platzhalter.</p>
      </div>
    );
  }

  if (screen === "exercise" && S.plan) {
    const it = S.plan.days[day].items[ex], e = EX[it.id];
    body = (
      <div className="stack">
        <button className="btn link" onClick={() => go("plan")}>‹ Zurück zum Plan</button>
        <h1>{e.name}</h1>
        <p className="dose">{dose(it, S.answers.goal, S.shift[day] || 0)} · {S.plan.rest} Sek. Pause</p>
        <div className="why"><b>Warum?</b> {it.why}</div>
        <div className="card" style={{ aspectRatio: "16/9", display: "grid", placeItems: "center", maxWidth: "100%" }}><span className="muted small">Video: {e.name} (Platzhalter)</span></div>
        <div className="card"><h3>So geht's</h3><ol className="list" style={{ marginTop: 6 }}>{e.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>
        <div className="card"><h3>Häufige Fehler</h3><ul className="list" style={{ marginTop: 6 }}>{e.errors.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        {e.cat !== "mobility" && e.unit !== "sec" && <p className="small muted">Gewicht wählen: Die letzten 2 Wiederholungen sollen anstrengend sein, aber sauber gehen.</p>}
      </div>
    );
  }

  if (screen === "myth") body = <Myth onBack={() => go("plan")} />;

  if (screen === "workout" && live) {
    const d = S.plan.days[live.day];
    const all = live.sets.flat(), doneCount = all.filter((s) => s.done).length;
    const setVal = (i, j, f, v) => setLive({ ...live, sets: live.sets.map((a, x) => (x !== i ? a : a.map((s, y) => (y !== j ? s : { ...s, [f]: v })))) });
    body = (
      <div className="stack">
        <div className="next"><div><p className="qlabel">Training läuft</p><h2>{short(d.name)}</h2></div><span className="dose">{doneCount}/{all.length} Sätze</span></div>
        {d.items.map((it, i) => {
          const e = EX[it.id], timed = e.unit === "sec" || e.cat === "mobility", bw = timed || (e.loc.length === 1 && e.loc[0] === "none");
          return (
            <div className="card stack" style={{ gap: 10 }} key={i}>
              <div className="next">
                <div><h3>{e.name}</h3><p className="dose">{dose(it, S.answers.goal, S.shift[live.day] || 0)}</p></div>
                <button className="btn link small" onClick={() => setEx(ex === i ? null : i)}>Warum? ›</button>
              </div>
              {ex === i && <div className="why small"><b>Warum?</b> {it.why}</div>}
              <div className="setgrid">
                <span className="h">Satz</span><span className="h">{timed ? "Sek." : "Wdh."}</span><span className="h">{bw ? "" : "kg"}</span><span />
                {live.sets[i].map((st, j) => [
                  <span key={`n${j}`} className="dose">{j + 1}</span>,
                  <input key={`r${j}`} id={`r-${i}-${j}`} type="number" inputMode="numeric" value={st.reps} placeholder={timed ? "Sek." : "Wdh."} aria-label={`${e.name} Satz ${j + 1}`} onChange={(ev) => setVal(i, j, "reps", ev.target.value)} />,
                  bw ? <span key={`k${j}`} className="small muted">Körpergewicht</span>
                     : <input key={`k${j}`} id={`k-${i}-${j}`} type="number" inputMode="decimal" step="0.5" value={st.kg} placeholder="kg" aria-label={`${e.name} Satz ${j + 1} Kilogramm`} onChange={(ev) => setVal(i, j, "kg", ev.target.value)} />,
                  <button key={`c${j}`} className="check" aria-pressed={st.done} aria-label={`Satz ${j + 1} erledigt`} onClick={() => { setVal(i, j, "done", !st.done); setErr(""); }}>✓</button>,
                ])}
              </div>
            </div>
          );
        })}
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn" onClick={() => { if (!doneCount) { setErr("Hake mindestens einen Satz ab, bevor du das Training beendest."); return; } go("checkin"); }}>Training beenden</button>
        <button className="btn secondary" onClick={() => {
          if (doneCount) { const s = storeSession(null); update({ ...S, sample: false, sessions: [...S.sessions, s] }); }
          setMsg(doneCount ? "Training abgebrochen. Deine erledigten Sätze sind gespeichert." : "Training abgebrochen. Es wurde nichts gespeichert.");
          setLive(null); go("plan");
        }}>Abbrechen und bisherige Sätze speichern</button>
      </div>
    );
  }

  if (screen === "checkin") {
    const feel = (f) => {
      const di = live.day, s = storeSession(f === "skip" ? null : f), shift = { ...S.shift };
      if (f === "leicht") shift[di] = (shift[di] || 0) + 1;
      if (f === "schwer") shift[di] = (shift[di] || 0) - 1;
      const next = { ...S, sample: false, shift, sessions: [...S.sessions, s] };
      update(next);
      setMsg({
        leicht: `Training ${di + 1} wird anspruchsvoller: 2 Wiederholungen mehr pro Satz. Grund: Du hattest noch Reserven, ein neuer Reiz bringt dich weiter.`,
        schwer: `Training ${di + 1} wird leichter: 2 Wiederholungen weniger pro Satz. Grund: Saubere Technik ist wichtiger als Masse, so baust du sicher auf.`,
        passt: `Training ${di + 1} bleibt so. Tipp: Schaffst du alle Wiederholungen sauber, nimm nächstes Mal etwas mehr Gewicht.`,
        skip: "Training gespeichert.",
      }[f]);
      setLive(null); setDay(nextDay(next)); go("progress");
    };
    body = (
      <div className="stack">
        <h1>Gut gemacht!</h1>
        <p className="muted">Wie war das Training? Danach passt sich dein nächstes Training {live.day + 1} an.</p>
        <button className="btn secondary" onClick={() => feel("leicht")}>Zu leicht</button>
        <button className="btn secondary" onClick={() => feel("passt")}>Passt genau</button>
        <button className="btn secondary" onClick={() => feel("schwer")}>Zu schwer</button>
        <button className="btn link" onClick={() => feel("skip")}>Überspringen</button>
      </div>
    );
  }

  if (screen === "progress") body = <Progress S={S} msg={msg} toPlan={() => go("plan")} />;

  if (screen === "profile") body = (
    <div className="stack">
      <h1>Profil</h1>
      <div className="card">
        {Object.keys(Q).map((k) => (
          <div className="next" key={k} style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>
            <span className="small muted">{Q[k].label.replace("?", "")}</span>
            <span className="small" style={{ textAlign: "right" }}>{Q[k].opts[S.answers[k]]}{k === "mins" ? " Min." : ""}</span>
          </div>
        ))}
      </div>
      <button className="btn secondary" onClick={() => { setDraft({ ...S.answers }); setStep(0); go("onboarding"); }}>Antworten ändern und Plan neu erstellen</button>
      <p className="small muted">Dein Trainingsverlauf bleibt dabei erhalten.</p>
      <div className="card stack">
        <h3>Zum Testen</h3>
        <label className="toggle"><input type="checkbox" id="failsim" checked={!!S.failSim} onChange={(e) => update({ ...S, failSim: e.target.checked })} /><span className="small">KI-Fehler beim nächsten Plan simulieren (Unhappy Path)</span></label>
      </div>
      <div className="card stack">
        <h3>Daten löschen</h3>
        <p className="small muted">Entfernt Antworten, Plan und Verlauf.</p>
        {confirmDelete ? (<>
          <p className="small"><b>Wirklich alles löschen?</b></p>
          <button className="btn" style={{ background: "var(--danger)" }} onClick={() => { wipeAll(); setS(fresh()); setConfirmDelete(false); go("welcome"); }}>Ja, alles löschen</button>
          <button className="btn link" onClick={() => setConfirmDelete(false)}>Abbrechen</button>
        </>) : <button className="btn secondary" onClick={() => setConfirmDelete(true)}>Alle Daten löschen</button>}
      </div>
    </div>
  );

  return (
    <>
      <div className="app">
        <header className="top"><div className="brand">Start<span>Fit</span></div><span className="tag">{S.sample ? "Beispieldaten" : "Prototyp"}</span></header>
        {body}
      </div>
      {tabbed && (
        <nav className="tabs"><div className="in">
          {[["plan", "Plan"], ["progress", "Fortschritt"], ["profile", "Profil"]].map(([t, l]) => (
            <button key={t} className="tab" aria-current={current === t ? "page" : "false"} onClick={() => { setMsg(""); go(t); }}>{l}</button>
          ))}
        </div></nav>
      )}
    </>
  );
}

function Consent({ initial, err, onOk, onErr }) {
  const [ok, setOk] = useState(initial);
  return (
    <div className="stack">
      <h1>Kurz vorab</h1>
      <div className="card stack">
        <p><b>StartFit ersetzt keine ärztliche Beratung.</b> Hast du Schmerzen, Verletzungen oder Vorerkrankungen, kläre das Training vorher mit einer Ärztin oder einem Arzt ab.</p>
        <p className="small muted">Datenschutz: Wir fragen keine Gesundheitsdaten ab und speichern nur deine Antworten und dein Training. Pläne und Begründungen werden von einer KI erstellt. Du kannst alle Daten im Profil löschen.</p>
        <label className="toggle"><input type="checkbox" id="consent-box" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Ich habe die Hinweise gelesen und verstanden.</span></label>
        {err && <p className="err" role="alert">{err}</p>}
      </div>
      <button className="btn" onClick={() => (ok ? onOk() : onErr())}>Weiter</button>
    </div>
  );
}

function Myth({ onBack }) {
  const [text, setText] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function check() {
    if (!text.trim()) { setError("Füge zuerst einen Tipp ein."); return; }
    setBusy(true); setError(""); setRes(null);
    try {
      const r = await fetch("/api/myth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const j = await r.json();
      if (!r.ok) setError(j.error || "Die Prüfung hat nicht geklappt."); else setRes(j);
    } catch { setError("Keine Verbindung. Versuch es gleich nochmal."); }
    setBusy(false);
  }
  return (
    <div className="stack">
      <button className="btn link" onClick={onBack}>‹ Zurück zum Plan</button>
      <h1>Tipp prüfen</h1>
      <p className="muted">Du hast auf TikTok oder YouTube etwas gehört und bist unsicher? Füge den Tipp ein, die KI ordnet ihn ein.</p>
      <label className="qlabel" htmlFor="myth-text">Tipp</label>
      <textarea id="myth-text" maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="z. B. „Bauchübungen verbrennen Bauchfett“" />
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn" onClick={check} disabled={busy}>{busy ? "Wird geprüft …" : "Tipp prüfen"}</button>
      {res && <div className="card stack"><p className="verdict">{res.verdict === "kein Fitness-Thema" ? "Kein Fitness-Thema" : `Das ${res.verdict}${res.verdict === "teilweise" ? " stimmt" : ""}`}</p><p>{res.reason}</p><p className="small muted">KI-generierte Einschätzung, keine ärztliche Beratung.</p></div>}
    </div>
  );
}

function Spark({ vals }) {
  if (vals.length < 2) return null;
  const w = 300, h = 48, p = 6, mn = Math.min(...vals), mx = Math.max(...vals), sp = mx - mn || 1;
  const pts = vals.map((v, i) => [p + (i * (w - 2 * p)) / (vals.length - 1), h - p - ((v - mn) / sp) * (h - 2 * p)]);
  const d = pts.map((q, i) => (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1)).join("");
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={`Verlauf von ${mn} bis ${mx} kg`}>
      <line x1="0" x2={w} y1={h - p} y2={h - p} stroke="var(--line)" strokeWidth="1" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--signal)" />
    </svg>
  );
}

function Progress({ S, msg, toPlan }) {
  const ss = S.sessions;
  if (!ss.length) return (
    <div className="stack"><h1>Fortschritt</h1>
      <div className="card stack"><p><b>Starte dein erstes Training.</b></p><p className="muted small">Nach dem ersten Training siehst du hier deine Einheiten und wie sich deine Gewichte entwickeln.</p>
        <button className="btn" onClick={toPlan}>Zum Plan</button></div></div>
  );
  const sets = ss.reduce((n, s) => n + s.sets.length, 0);
  const byEx = {};
  ss.forEach((s) => { const best = {}; s.sets.forEach((x) => { if (x.kg > 0) best[x.id] = Math.max(best[x.id] || 0, x.kg); }); Object.entries(best).forEach(([id, kg]) => (byEx[id] = byEx[id] || []).push(kg)); });
  const last = ss[ss.length - 1];
  return (
    <div className="stack"><h1>Fortschritt</h1>
      {msg && <div className="banner" role="status">{msg}</div>}
      <div className="stats">
        <div className="card stat"><b>{ss.length}</b><span className="small muted">Trainings</span></div>
        <div className="card stat"><b>{sets}</b><span className="small muted">Sätze geschafft</span></div>
      </div>
      <p className="small muted">Letztes Training: {new Date(last.date).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</p>
      {Object.keys(byEx).length ? Object.entries(byEx).map(([id, v]) => {
        const diff = v[v.length - 1] - v[0];
        return (
          <div className="card stack" style={{ gap: 6 }} key={id}>
            <div className="next"><h3>{EX[id].name}</h3><span className="dose">{v[v.length - 1]} kg{v.length > 1 ? ` · ${diff >= 0 ? "+" : ""}${diff} kg` : ""}</span></div>
            <Spark vals={v} />
          </div>
        );
      }) : <div className="card small muted">Trag bei deinen Übungen ein Gewicht ein, dann siehst du hier deinen Kraftverlauf.</div>}
    </div>
  );
}
