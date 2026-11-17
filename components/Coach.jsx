"use client";
import { useEffect, useRef, useState } from "react";
import { EX } from "../lib/exercises";
import { candidates } from "../lib/plan";
import { Icon } from "./ui";
import Buddy, { Portrait } from "./Buddy";
import { COACH } from "../lib/buddy";

/* KI-Coach: im Prototyp nur als Vorschau. Antworten sind feste Beispiele, die KI wird später angebunden. */
function examples(S) {
  const d = S.plan.days[0];
  const first = d.items.find((it) => !["mobility", "core"].includes(EX[it.id].cat)) || d.items[0];
  const alt = candidates(EX[first.id].cat, S.answers.loc).find((id) => id !== first.id);
  return [
    { q: "Ich habe heute nur 15 Minuten.", a: `Kein Problem. Mach aus ${d.name.split(" · ")[1]} die ersten 3 Übungen mit je 2 Sätzen und 60 Sekunden Pause. Kurz trainieren ist viel besser als gar nicht, und dein Buddy freut sich trotzdem.` },
    { q: `${EX[first.id].name} ist mir zu schwer.`, a: alt ? `Dann tausch sie gegen ${EX[alt].name}. Sie trainiert ähnliche Muskeln (${EX[alt].muscle}), ist aber leichter zu lernen. Nimm erst wenig Gewicht und achte auf saubere Technik.` : `Nimm weniger Gewicht oder mach 2 Wiederholungen weniger pro Satz. Saubere Technik geht vor.` },
    { q: "Ich habe Muskelkater. Soll ich trotzdem trainieren?", a: "Leichter Muskelkater ist normal und harmlos. Lockere Bewegung hilft sogar. Trainiere heute eine andere Muskelgruppe oder etwas leichter. Hast du stechende Schmerzen oder Schmerzen im Gelenk, mach Pause und lass es ärztlich abklären." },
    { q: "Stimmt das: Bauchübungen verbrennen Bauchfett?", a: "Stimmt nicht. Du kannst nicht gezielt an einer Stelle Fett verlieren. Fett nimmt am ganzen Körper ab, wenn du mehr Energie verbrauchst, als du aufnimmst. Bauchübungen stärken deine Rumpfmuskeln, und das ist trotzdem sinnvoll." },
    { q: "Wie viel Gewicht soll ich nehmen?", a: "Wähle das Gewicht so, dass die letzten 2 Wiederholungen eines Satzes anstrengend sind, aber noch sauber gehen. Schaffst du alle Wiederholungen locker, nimm beim nächsten Mal etwas mehr." },
  ];
}

export default function Coach({ app }) {
  const { S } = app;
  const ex = examples(S);
  const [log, setLog] = useState([{ me: false, text: `Hey, ich bin Toni, dein Coach! Ich kenne deinen Plan und helfe dir bei allen Fragen rund ums Training. Tipp unten auf eine Frage, dann zeig ich dir, wie ich antworte.` }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [log.length, busy]);

  const ask = (q, a) => {
    setLog((l) => [...l, { me: true, text: q }]);
    setBusy(true);
    setTimeout(() => { setLog((l) => [...l, { me: false, text: a, example: true }]); setBusy(false); }, 900);
  };

  return (
    <div className="stack chat">
      <section className="card coach-head">
        <Buddy look={COACH.look} coach stage={2} size={96} animate={false} label={COACH.name} />
        <div className="grow stack-sm">
          <div className="between"><h2>{COACH.name}</h2><span className="pill soon">Vorschau</span></div>
          <p className="muted small">Dein persönlicher Trainer. Motiviert dich, erklärt Übungen und passt deinen Plan an.</p>
        </div>
      </section>
      <p className="help small"><Icon name="info" size={16} /> Der KI-Coach wird bald verbunden. Bis dahin siehst du hier Beispielantworten.</p>
      <div className="msgs" aria-live="polite">
        {log.map((m, i) => m.me ? <div key={i} className="msg me">{m.text}</div> : (
          <div key={i} className="msg-row">
            <Portrait look={COACH.look} coach size={34} label="Toni" />
            <div className="msg coach">{m.text}{m.example && <span className="msg-note">Beispielantwort · KI folgt bald</span>}</div>
          </div>
        ))}
        {busy && <div className="msg-row"><Portrait look={COACH.look} coach size={34} label="Toni" /><div className="msg typing" aria-label="Toni schreibt"><i /><i /><i /></div></div>}
        <div ref={end} />
      </div>
      <div className="chips scroll" aria-label="Beispielfragen">
        {ex.map((e) => <button key={e.q} className="chip" disabled={busy} onClick={() => ask(e.q, e.a)}>{e.q}</button>)}
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; ask(text.trim(), "Freie Fragen kann ich noch nicht beantworten, die KI wird gerade angebunden. Probier bis dahin eine der Beispielfragen."); setText(""); }}>
        <label htmlFor="coach-input" className="sr-only">Frage an den Coach</label>
        <input id="coach-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Frag Toni" autoComplete="off" maxLength={500} />
        <button className="iconbtn accent" type="submit" aria-label="Senden" disabled={!text.trim() || busy}><Icon name="send" /></button>
      </form>
    </div>
  );
}
