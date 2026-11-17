"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Q, STEPS, answerText } from "../lib/exercises";
import Question from "../components/Questions";
import { rulePlan } from "../lib/plan";
import { fresh, loadLocal, loadRemote, saveAll, pushSession, wipeAll } from "../lib/store";
import { SKINS, DEFAULT_LOOK, PAUSE_REASONS, activePause, buddyState, weekDays, xpOfSession } from "../lib/buddy";
import { EX } from "../lib/exercises";
import { person, REPLIES, SEED_CHATS, lastSeen } from "../lib/social";
import Buddy from "../components/Buddy";
import BuddyEditor from "../components/BuddyEditor";
import { Portrait } from "../components/Buddy";
import { Toast, TabBar, Header, Icon, Bar } from "../components/ui";
import { Plan, Exercise, Workout, Success, Progress, nextDay, short } from "../components/Training";
import { Community, Person, Chat } from "../components/Social";
import Coach from "../components/Coach";
import { Privacy, Imprint } from "../components/Legal";

const TAB_OF = { home: "home", plan: "plan", coach: "coach", community: "community", me: "me", exercise: "plan", progress: "home", person: "community" };
const NO_TABS = ["chat", "workout"];

export default function App() {
  const [S, setS] = useState(fresh);
  const [ready, setReady] = useState(false);
  const [stack, setStack] = useState([{ screen: "welcome" }]);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({});
  const [day, setDay] = useState(0);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const ref = useRef(S);
  ref.current = S;

  const { screen, param } = stack[stack.length - 1];

  const mutate = useCallback((fn) => setS((prev) => { const next = fn(prev); saveAll(next); return next; }), []);
  const go = (s, p) => { setErr(""); setStack((st) => (TAB_OF[s] === s ? [{ screen: s }] : [...st, { screen: s, param: p }])); };
  const reset = (s, p) => { setErr(""); setStack(p === undefined ? [{ screen: s }] : [{ screen: TAB_OF[s] || "home" }, { screen: s, param: p }]); };
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));

  useEffect(() => {
    const local = loadLocal();
    setS(local);
    if (local.plan) { setStack([{ screen: local.buddy ? "home" : "meet" }]); setDay(nextDay(local)); }
    setReady(true);
    loadRemote().then((r) => { if (r?.plan) { setS(r); setDay(nextDay(r)); setStack((st) => (st[0].screen === "welcome" ? [{ screen: r.buddy ? "home" : "meet" }] : st)); } });
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, step, param]);

  /* ---------- Aktionen ---------- */
  async function makePlan(answers, standard) {
    reset("generating");
    mutate((s) => ({ ...s, answers }));
    const done = (plan) => {
      mutate((s) => ({ ...s, answers, plan, failSim: false }));
      setDay(0);
      if (S.buddy) { reset("plan"); setToast({ text: "Dein neuer Plan ist fertig." }); } else reset("meet");
    };
    if (standard) return setTimeout(() => done(rulePlan(answers, true)), 600);
    if (S.failSim) { mutate((s) => ({ ...s, failSim: false })); return setTimeout(() => reset("failed"), 900); }
    try {
      const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      if (!r.ok) throw new Error(String(r.status));
      done(await r.json());
    } catch { reset("failed"); }
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
    const chats = Object.fromEntries(Object.entries(SEED_CHATS).map(([k, v]) => [k, v.map((m) => ({ ...m, ts: now + m.ts * d }))]));
    const next = {
      ...fresh(), sample: true, consent: true, answers, plan,
      sessions: [mk(16, 0, [0, 60, 30, 35, 0]), mk(14, 1, [0, 25, 35, 30, 0]), mk(11, 2, [0, 65, 32.5, 37.5, 0]), mk(7, 0, [0, 70, 32.5, 40, 0]), mk(5, 1, [0, 30, 37.5, 32.5, 0]), mk(2, 2, [0, 70, 35, 40, 0])],
      buddy: { name: "Fitti", look: { skin: "#E0AC84", hair: "kurz", hairColor: "#2B1E16", shirt: "#3FAF85" }, created: new Date(now - 20 * d).toISOString() },
      social: { friends: ["lena", "tim"], requests: {}, chats, visible: true, typing: null },
    };
    setS(next); saveAll(next); setDay(nextDay(next)); setToast(null); reset("home");
  }

  const app = {
    S, mutate, go, back, day, setDay, toast: (text) => setToast({ text }),
    startWorkout: (d) => go("workout", d),
    startPause(reason, weeks) {
      const until = weeks ? new Date(Date.now() + weeks * 7 * 864e5).toISOString() : null;
      mutate((s) => ({ ...s, pause: { from: new Date().toISOString(), until, reason }, simPause: 0 }));
      setToast({ text: `Pause gestartet. ${S.buddy.name} baut in der Zeit nicht ab.` });
    },
    endPause() {
      mutate((s) => ({ ...s, pause: null, pauseEnded: new Date().toISOString() }));
      setToast({ text: `Willkommen zurück! ${S.buddy.name} freut sich auf das nächste Training.` });
    },
    nudge(id) {
      const p = person(id);
      mutate((s) => ({ ...s, social: { ...s.social, nudged: { ...(s.social.nudged || {}), [id]: new Date().toISOString() } } }));
      setToast({ text: `${p.name} wurde erinnert, mal wieder zu trainieren.` });
    },
    finishWorkout(session, feel) {
      const before = buddyState(S);
      const shift = { ...S.shift };
      if (feel === "leicht") shift[session.day] = (shift[session.day] || 0) + 1;
      if (feel === "schwer") shift[session.day] = (shift[session.day] || 0) - 1;
      const next = { ...S, sample: false, simPause: 0, shift, sessions: [...S.sessions, session], ...(activePause(S) ? { pause: null, pauseEnded: new Date().toISOString() } : {}) };
      setS(next); saveAll(next); pushSession(session, S.sample);
      const after = buddyState(next);
      setDay(nextDay(next));
      reset("success", {
        gained: xpOfSession(session), level: after.level, levelUp: after.level > before.level, stage: after.stage, stageUp: after.stage > before.stage, toNext: after.toNext,
        message: { leicht: `Training ${session.day + 1} wird beim nächsten Mal anspruchsvoller: 2 Wiederholungen mehr pro Satz.`, schwer: `Training ${session.day + 1} wird beim nächsten Mal leichter: 2 Wiederholungen weniger pro Satz. Saubere Technik geht vor.`, passt: "Schaffst du alle Wiederholungen sauber, nimm beim nächsten Mal etwas mehr Gewicht." }[feel],
      });
    },
    abortWorkout(session) {
      if (session) { const next = { ...S, sample: false, simPause: 0, sessions: [...S.sessions, session] }; setS(next); saveAll(next); pushSession(session, S.sample); setDay(nextDay(next)); }
      reset("plan");
      setToast({ text: session ? "Training abgebrochen. Deine erledigten Sätze sind gespeichert." : "Training abgebrochen." });
    },
    sendRequest(id) {
      const name = person(id).name;
      mutate((s) => ({ ...s, social: { ...s.social, requests: { ...s.social.requests, [id]: "sent" } } }));
      setToast({ text: `Anfrage an ${name} gesendet.`, undo: () => mutate((s) => { const r = { ...s.social.requests }; delete r[id]; return { ...s, social: { ...s.social, requests: r } }; }) });
      setTimeout(() => {
        if (ref.current.social.requests[id] !== "sent") return;
        mutate((s) => {
          const r = { ...s.social.requests }; delete r[id];
          return { ...s, social: { ...s.social, requests: r, friends: s.social.friends.includes(id) ? s.social.friends : [...s.social.friends, id] } };
        });
        setToast({ text: `${name} hat deine Anfrage angenommen. Ihr seid jetzt Freunde.` });
      }, 7000);
    },
    removeFriend(id) {
      const name = person(id).name;
      mutate((s) => ({ ...s, social: { ...s.social, friends: s.social.friends.filter((f) => f !== id) } }));
      back();
      setToast({ text: `${name} ist nicht mehr in deinen Freunden.`, undo: () => mutate((s) => ({ ...s, social: { ...s.social, friends: [...s.social.friends, id] } })) });
    },
    sendMessage(id, text, invite) {
      const push = (s, m) => ({ ...s, social: { ...s.social, chats: { ...s.social.chats, [id]: [...(s.social.chats[id] || []), m] } } });
      mutate((s) => { const n = push(s, { me: true, text, ts: Date.now() }); return { ...n, social: { ...n.social, typing: id } }; });
      if (invite) { go("chat", id); setToast({ text: `Einladung an ${person(id).name} gesendet.` }); }
      setTimeout(() => {
        mutate((s) => {
          const n = (s.social.chats[id] || []).length;
          const reply = invite ? "Bin dabei! Treffen wir uns direkt am Eingang?" : REPLIES[n % REPLIES.length];
          const next = push(s, { me: false, text: reply, ts: Date.now() });
          return { ...next, social: { ...next.social, typing: null } };
        });
      }, 1800);
    },
  };

  if (!ready) return <div className="app" />;

  /* ---------- Bildschirme ---------- */
  let body = null;
  const b = S.buddy ? buddyState(S) : null;

  if (screen === "welcome") body = (
    <div className="stack center-text pad-top">
      <p className="brand">Buddy<span>Fit</span></p>
      <div className="center"><Buddy look={DEFAULT_LOOK} stage={2} size={180} label="Ein Buddy" /></div>
      <h1 className="hero">Dein Plan. Dein Buddy. Dein Fortschritt.</h1>
      <p className="muted">Schluss mit widersprüchlichen Tipps. Beantworte 5 kurze Fragen und bekomm einen Trainingsplan, der zu deinem Alltag passt. Dein Buddy wächst mit jedem Training.</p>
      <button className="btn" onClick={() => { const base = S.sample ? fresh() : S; if (S.sample) setS(base); setDraft({ ...base.answers }); setStep(0); go(base.consent ? "onboarding" : "consent"); }}>Loslegen</button>
      <button className="btn secondary" onClick={seedSample}>Beispiel ansehen</button>
      <p className="muted small"><button className="linkbtn small" onClick={() => go("privacy")}>Datenschutz</button> · <button className="linkbtn small" onClick={() => go("imprint")}>Impressum</button></p>
    </div>
  );

  if (screen === "consent") body = <Consent initial={S.consent} err={err} openPrivacy={() => go("privacy")} onBack={back} onOk={() => { mutate((s) => ({ ...s, consent: true })); setStep(0); go("onboarding"); }} onErr={() => setErr("Bitte bestätige die Hinweise, um weiterzumachen.")} />;

  if (screen === "onboarding") {
    const st = STEPS[step];
    body = (
      <div className="stack">
        <Header title={`Frage ${step + 1} von 5`} onBack={() => (step ? (setStep(step - 1), setErr("")) : back())} />
        <div className="steps-bar" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
        <h1>{st.title}</h1>
        {st.keys.map((k) => <Question key={k} k={k} value={draft[k]} showError={!!err} onChange={(v) => { setDraft((d) => ({ ...d, [k]: v })); setErr(""); }} />)}
        <div className="sticky-cta">
          <button className="btn" onClick={() => {
            const filled = { ...draft };
            st.keys.forEach((k) => { if (Q[k].range && filled[k] == null) filled[k] = Q[k].def; });
            setDraft(filled);
            if (st.keys.some((k) => !filled[k])) { setErr("missing"); return; }
            if (step < 4) { setStep(step + 1); setErr(""); } else makePlan(filled, false);
          }}>{step === 4 ? "Plan erstellen" : "Weiter"}</button>
        </div>
      </div>
    );
  }

  if (screen === "generating") body = (
    <div className="stack center-text pad-top">
      <div className="spinner" aria-hidden="true" />
      <h2>Dein Plan wird erstellt</h2>
      <p className="muted small">Wir wählen passende Übungen für deine Zeit, deinen Ort und deinen Alltag und begründen jede einzelne.</p>
    </div>
  );

  if (screen === "failed") body = (
    <div className="stack pad-top">
      <h1>Der Plan konnte nicht erstellt werden</h1>
      <p className="muted">Der Server hat nicht rechtzeitig geantwortet. Deine Antworten sind gespeichert, du musst nichts neu eingeben.</p>
      <button className="btn" onClick={() => makePlan(S.answers, false)}>Nochmal versuchen</button>
      <button className="btn secondary" onClick={() => makePlan(S.answers, true)}>Standardplan für mein Ziel nutzen</button>
    </div>
  );

  if (screen === "meet") body = <Meet onDone={(name, look) => { mutate((s) => ({ ...s, buddy: { name, look, created: new Date().toISOString() } })); reset("home"); setToast({ text: `${name} ist bereit für dein erstes Training.` }); }} />;

  if (screen === "home" && S.plan && b) {
    const nd = nextDay(S), d = S.plan.days[nd], week = weekDays(S.sessions);
    const weekCount = week.filter((w) => w.trained).length, goal = +S.answers.days;
    const friend = S.social.friends.map(person).filter((p) => p && !p.paused).sort((x, y) => x.lastDays - y.lastDays)[0];
    body = (
      <div className="stack">
        <section className={`card buddy-card mood-${b.mood.key}`}>
          <div className="between"><div><p className="eyebrow">Dein Buddy</p><h1>{S.buddy.name}</h1></div><span className={`pill mood ${b.mood.key}`}>{b.mood.label}</span></div>
          <div className="center"><Buddy look={S.buddy} mood={b.mood.key} reason={b.pause?.reason} stage={b.stage} size={210} label={`${S.buddy.name}, ${b.mood.label}`} /></div>
          <div className="stack-sm">
            <div className="between small"><b>Level {b.level}</b><span className="muted">{b.xp - b.cur} / {b.next - b.cur} XP</span></div>
            <Bar pct={b.pct} label="Erfahrung bis zum nächsten Level" />
            <div className="between small"><b>Energie</b><span className="muted">{b.pause ? "Pausiert, Energie bleibt erhalten" : b.days === 0 ? "Heute trainiert" : b.days === 1 ? "Gestern trainiert" : `${b.days} Tage ohne Training`}</span></div>
            <Bar pct={b.mood.energy / 100} label="Energie" tone={b.mood.key === "happy" ? "good" : b.mood.key === "pause" ? "pause" : b.mood.key === "tired" ? "warn" : "bad"} />
          </div>
          {b.mood.key !== "happy" && <p className="banner" role="status">{b.mood.text}</p>}
          {b.pause && <button className="btn secondary" onClick={app.endPause}>Pause beenden</button>}
        </section>

        <section className="card stack">
          <div><p className="eyebrow">Als Nächstes</p><h2>Training {nd + 1} · {short(d.name)}</h2><p className="muted small">{d.items.length} Übungen · ca. {S.answers.mins} Min.</p></div>
          <button className="btn" onClick={() => { setDay(nd); app.startWorkout(nd); }}><Icon name="play" size={18} /> Training starten</button>
          <button className="linkbtn small" onClick={() => { setDay(nd); go("plan"); }}>Übungen ansehen</button>
        </section>

        <section className="card stack-sm">
          <div className="between"><b>Diese Woche</b><span className="muted small">{weekCount} von {goal} Trainings</span></div>
          <div className="week">{week.map((w) => <span key={w.label} className={`wd ${w.trained ? "on" : ""} ${w.today ? "today" : ""}`}><i>{w.trained ? <Icon name="check" size={14} /> : null}</i>{w.label}</span>)}</div>
          <button className="linkbtn small" onClick={() => go("progress")}>Fortschritt ansehen</button>
        </section>

        {friend ? (
          <button className="card row-card" onClick={() => go("person", friend.id)}>
            <Portrait look={friend.look} label={friend.name} />
            <span className="grow"><b>{friend.name}</b><span className="muted small block">{lastSeen(friend.lastDays, friend.paused)}. Zusammen trainieren?</span></span>
            <Icon name="chevron" size={18} />
          </button>
        ) : (
          <button className="card row-card" onClick={() => go("community")}>
            <span className="grow"><b>Finde deinen Gym Buddy</b><span className="muted small block">Zu zweit fällt Dranbleiben leichter.</span></span>
            <Icon name="chevron" size={18} />
          </button>
        )}
      </div>
    );
  }

  if (screen === "plan" && S.plan) body = <Plan app={app} />;
  if (screen === "exercise") body = <Exercise app={app} idx={param} />;
  if (screen === "workout") body = <Workout app={app} dayIdx={param} />;
  if (screen === "success") body = <Success app={app} info={param} />;
  if (screen === "progress") body = <Progress app={app} />;
  if (screen === "coach" && S.plan) body = <Coach app={app} />;
  if (screen === "community") body = <Community app={app} />;
  if (screen === "person") body = <Person app={app} id={param} />;
  if (screen === "chat") body = <Chat app={app} id={param} />;
  if (screen === "privacy") body = <Privacy back={back} />;
  if (screen === "imprint") body = <Imprint back={back} />;
  if (screen === "me" && b) body = <Me app={app} b={b} onEdit={() => { setDraft({ ...S.answers }); setStep(0); go("onboarding"); }} onWipe={() => { wipeAll(); setS(fresh()); reset("welcome"); setToast({ text: "Alle Daten wurden gelöscht." }); }} />;

  if (!body) body = <div className="empty">Diese Seite gibt es nicht. <button className="linkbtn" onClick={() => reset(S.plan ? "home" : "welcome")}>Zum Start</button></div>;

  const tabbed = !!TAB_OF[screen] && S.plan && S.buddy && !NO_TABS.includes(screen);
  return (
    <>
      <div className={`app ${tabbed ? "with-tabs" : ""}`}>
        {S.sample && tabbed && <p className="sample-note">Beispieldaten · <button className="linkbtn small" onClick={() => { setS(fresh()); saveAll(fresh()); reset("welcome"); }}>Eigenen Plan erstellen</button></p>}
        {body}
      </div>
      {tabbed && <TabBar current={TAB_OF[screen]} onTab={(t) => go(t)} badge={{ home: b && b.mood.key !== "happy" }} />}
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

function Consent({ initial, err, onOk, onErr, onBack, openPrivacy }) {
  const [ok, setOk] = useState(initial);
  return (
    <div className="stack">
      <Header title="Kurz vorab" onBack={onBack} />
      <h1>Bevor es losgeht</h1>
      <div className="card stack">
        <p><b>BuddyFit ersetzt keine ärztliche Beratung.</b> Hast du Schmerzen, Verletzungen oder Vorerkrankungen, kläre das Training vorher mit einer Ärztin oder einem Arzt ab.</p>
        <p className="muted small">Wir fragen keine Gesundheitsdaten ab und speichern nur, was wir für deinen Plan brauchen. Du kannst alles jederzeit löschen.</p>
        <label className="toggle"><input type="checkbox" id="consent-box" checked={ok} onChange={(e) => setOk(e.target.checked)} /><span>Ich habe die Hinweise und die <button type="button" className="linkbtn inline" onClick={openPrivacy}>Datenschutzerklärung</button> gelesen.</span></label>
        {err && <p className="err" role="alert">{err}</p>}
      </div>
      <button className="btn" onClick={() => (ok ? onOk() : onErr())}>Weiter</button>
    </div>
  );
}

function Meet({ onDone }) {
  const [name, setName] = useState("Fitti");
  const [look, setLook] = useState(DEFAULT_LOOK);
  const [err, setErr] = useState("");
  const n = name.trim() || "Dein Buddy";
  return (
    <div className="stack">
      <div className="center-text"><p className="eyebrow">Dein Plan ist fertig</p><h1>Gestalte deinen Buddy</h1></div>
      <div className="buddy-stage"><Buddy look={look} stage={1} size={200} label={n} /></div>
      <p className="muted center-text small">Mit jedem Training sammelt {n} Erfahrung und wird stärker. Machst du länger als eine Woche Pause, geht es {n} sichtbar schlechter.</p>
      <div className="stack-sm">
        <label className="label" htmlFor="buddy-name">Name</label>
        <input id="buddy-name" className="field" value={name} maxLength={16} onChange={(e) => { setName(e.target.value); setErr(""); }} />
        {err && <p className="err" role="alert">{err}</p>}
      </div>
      <BuddyEditor look={look} onChange={setLook} />
      <p className="muted small">Du kannst das Aussehen jederzeit im Profil ändern.</p>
      <div className="sticky-cta"><button className="btn" onClick={() => (name.trim() ? onDone(name.trim(), look) : setErr("Gib deinem Buddy einen Namen."))}>Los geht's</button></div>
    </div>
  );
}

function Me({ app, b, onEdit, onWipe }) {
  const { S, mutate, go } = app;
  const [name, setName] = useState(S.buddy.name);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [reason, setReason] = useState("urlaub");
  const [weeks, setWeeks] = useState(2);
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("buddyfit-theme") || "system"; } catch { return "system"; } });
  const pickTheme = (t) => {
    setTheme(t);
    try { t === "system" ? localStorage.removeItem("buddyfit-theme") : localStorage.setItem("buddyfit-theme", t); } catch {}
    if (t === "system") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", t);
  };
  const a = S.answers;
  return (
    <div className="stack">
      <h1>Profil</h1>
      <section className="card stack">
        <div className="between"><h3>Dein Buddy</h3><span className="pill">Level {b.level}</span></div>
        <div className="buddy-stage small"><Buddy look={S.buddy} mood={b.mood.key} reason={b.pause?.reason} stage={b.stage} size={150} animate={false} label={S.buddy.name} /></div>
        <div className="stack-sm">
          <label className="label" htmlFor="rename">Name</label>
          <div className="row2"><input id="rename" className="field" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
            <button className="btn secondary compact" disabled={!name.trim() || name.trim() === S.buddy.name} onClick={() => { mutate((s) => ({ ...s, buddy: { ...s.buddy, name: name.trim() } })); app.toast(`Name geändert: ${name.trim()}`); }}>Speichern</button></div>
        </div>
        {editing ? (<>
          <BuddyEditor look={S.buddy} onChange={(look) => mutate((s) => ({ ...s, buddy: { ...s.buddy, look, color: undefined } }))} />
          <button className="btn secondary" onClick={() => setEditing(false)}>Fertig</button>
        </>) : <button className="btn secondary" onClick={() => setEditing(true)}>Aussehen ändern</button>}
        <div><p className="label">Skins · bald verfügbar</p><div className="skins">{SKINS.map((k) => <span key={k} className="skin"><Icon name="lock" size={18} />{k}</span>)}</div></div>
      </section>

      <section className="card stack-sm">
        <h3>Deine Angaben</h3>
        <dl className="facts">{Object.keys(Q).map((k) => <div key={k}><dt>{Q[k].label.replace("?", "")}</dt><dd>{answerText(k, a[k])}</dd></div>)}</dl>
        <button className="btn secondary" onClick={onEdit}>Angaben ändern und Plan neu erstellen</button>
        <p className="muted small">Dein Trainingsverlauf und dein Buddy bleiben erhalten.</p>
      </section>

      <section className="card stack-sm">
        <h3>Auszeit</h3>
        {b.pause ? (<>
          <p className="small">Dein Profil ist pausiert{b.pause.until ? ` bis ${new Date(b.pause.until).toLocaleDateString("de-DE", { day: "numeric", month: "long" })}` : ""}. {S.buddy.name} baut in der Zeit nicht ab.</p>
          <button className="btn secondary" onClick={app.endPause}>Pause beenden</button>
        </>) : pausing ? (<>
          <p className="muted small">Verletzt, krank oder im Urlaub? Pausiere dein Profil, dann wartet {S.buddy.name} auf dich, ohne schlapp zu werden.</p>
          <fieldset className="stack-sm"><legend className="label">Grund (nur für dich sichtbar)</legend>
            <div className="options">{PAUSE_REASONS.map((r) => <button key={r.id} className="option" aria-pressed={reason === r.id} onClick={() => setReason(r.id)}>{r.name}</button>)}</div></fieldset>
          <fieldset className="stack-sm"><legend className="label">Wie lange?</legend>
            <div className="options">{[[1, "1 Woche"], [2, "2 Wochen"], [4, "4 Wochen"], [0, "Offen"]].map(([w, l]) => <button key={w} className="option" aria-pressed={weeks === w} onClick={() => setWeeks(w)}>{l}</button>)}</div></fieldset>
          <p className="muted small">Freunde sehen nur „Pausiert“, nicht den Grund. Ein Training beendet die Pause automatisch.</p>
          <div className="row2"><button className="btn secondary" onClick={() => setPausing(false)}>Abbrechen</button><button className="btn" onClick={() => { app.startPause(reason, weeks); setPausing(false); }}>Pause starten</button></div>
        </>) : (<>
          <p className="muted small">Für Verletzung oder Urlaub: {S.buddy.name} wartet, ohne schlapp zu werden.</p>
          <button className="btn secondary" onClick={() => setPausing(true)}>Profil pausieren</button>
        </>)}
      </section>

      <section className="card stack-sm">
        <h3>Darstellung</h3>
        <div className="segmented" role="radiogroup" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[["system", "Automatisch"], ["light", "Hell"], ["dark", "Dunkel"]].map(([t, l]) => <button key={t} role="radio" aria-checked={theme === t} onClick={() => pickTheme(t)}>{l}</button>)}
        </div>
      </section>

      <section className="card stack-sm">
        <h3>Gym Buddys</h3>
        <label className="toggle"><input type="checkbox" checked={S.social.visible} onChange={(e) => mutate((s) => ({ ...s, social: { ...s.social, visible: e.target.checked } }))} /><span>Andere dürfen mich als Gym Buddy finden<span className="muted small block">Sichtbar sind nur Vorname, Ziel, Trainingszeit und Ort.</span></span></label>
      </section>

      <button className="card row-card" onClick={() => go("progress")}><span className="grow"><b>Fortschritt</b><span className="muted small block">{S.sessions.length} Trainings · {b.xp} XP</span></span><Icon name="chevron" size={18} /></button>

      <section className="card stack-sm">
        <h3>Zum Testen</h3>
        <label className="toggle"><input type="checkbox" checked={!!S.failSim} onChange={(e) => mutate((s) => ({ ...s, failSim: e.target.checked }))} /><span className="small">Fehler beim nächsten Plan simulieren</span></label>
        <p className="label">Pause simulieren</p>
        <div className="options">{[0, 10, 16, 25].map((n) => <button key={n} className="option" aria-pressed={(S.simPause || 0) === n} onClick={() => mutate((s) => ({ ...s, simPause: n }))}>{n === 0 ? "Keine" : `+${n} Tage`}</button>)}</div>
        <p className="muted small">Zeigt, wie es deinem Buddy nach einer Pause geht. Das nächste Training setzt das zurück.</p>
      </section>

      <section className="card stack-sm">
        <h3>Konto und Daten</h3>
        <p className="muted small">Noch ohne Konto: Deine Daten gehören zu diesem Gerät. Login folgt.</p>
        {confirm ? (<>
          <p className="small"><b>Wirklich alles löschen?</b> Plan, Trainings, Buddy und Freunde sind danach weg.</p>
          <div className="row2"><button className="btn secondary" onClick={() => setConfirm(false)}>Behalten</button><button className="btn danger" onClick={onWipe}>Alles löschen</button></div>
        </>) : <button className="btn secondary" onClick={() => setConfirm(true)}>Alle Daten löschen</button>}
      </section>

      <p className="muted small center-text"><button className="linkbtn small" onClick={() => go("privacy")}>Datenschutz</button> · <button className="linkbtn small" onClick={() => go("imprint")}>Impressum</button></p>
    </div>
  );
}
