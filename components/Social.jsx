"use client";
import { useEffect, useRef, useState } from "react";
import { PEOPLE, person, match, labels, lastSeen, canNudge, nudgedToday } from "../lib/social";
import { short } from "./Training";
import { Header, Icon } from "./ui";
import { Portrait } from "./Buddy";

/* ---------- Freunde & Partnersuche ---------- */
export function Community({ app }) {
  const { S, go, mutate } = app;
  const [tab, setTab] = useState(S.social.friends.length ? "friends" : "find");
  const friends = S.social.friends.map(person).filter(Boolean);
  const others = PEOPLE.filter((p) => !S.social.friends.includes(p.id))
    .map((p) => ({ p, m: match(p, S.answers) }))
    .sort((a, b) => b.m.score - a.m.score);

  return (
    <div className="stack">
      <div><h1>Freunde</h1><p className="muted small">Trainiert zusammen, motiviert euch gegenseitig.</p></div>
      <div className="segmented" role="tablist">
        <button role="tab" aria-selected={tab === "friends"} onClick={() => setTab("friends")}>Meine Freunde{friends.length ? ` (${friends.length})` : ""}</button>
        <button role="tab" aria-selected={tab === "find"} onClick={() => setTab("find")}>Gym Buddys finden</button>
      </div>

      {tab === "friends" && (friends.length ? (
        <div className="card list">
          {friends.map((p) => {
            const msgs = S.social.chats[p.id] || [];
            const last = msgs[msgs.length - 1];
            return (
              <div key={p.id} className="row">
                <button className="person-head" onClick={() => go("person", p.id)}>
                  <Portrait look={p.look} label={p.name} />
                  <span className="grow"><b>{p.name}</b><span className="muted small block ellipsis">{last ? `${last.me ? "Du: " : ""}${last.text}` : lastSeen(p.lastDays, p.paused)}</span></span>
                </button>
                {p.paused ? <span className="status away">Pausiert</span>
                  : canNudge(p, S) ? <button className="nudge" onClick={() => app.nudge(p.id)}>Erinnern</button>
                  : p.lastDays >= 7 ? <span className="status late">Erinnert</span>
                  : <span className="pill">Lv {p.level}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <b>Noch keine Freunde.</b>
          <p className="muted small">Finde Gym Buddys, die zur gleichen Zeit und am gleichen Ort trainieren wie du.</p>
          <button className="btn" onClick={() => setTab("find")}>Gym Buddys finden</button>
        </div>
      ))}

      {tab === "find" && (<>
        <p className="muted small">Sortiert danach, wie gut die Person zu deinem Plan passt: Trainingszeit, Ort und Ziel.</p>
        {others.length ? others.map(({ p, m }) => {
          const req = S.social.requests[p.id];
          return (
            <article className="card stack-sm" key={p.id}>
              <button className="person-head" onClick={() => go("person", p.id)}>
                <Portrait look={p.look} label={p.name} size={52} />
                <span className="grow"><b className="lg">{p.name}, {p.age}</b><span className="muted small block">{p.place} · Lv {p.level}{p.paused ? " · pausiert" : ""}</span></span>
                {m.score > 0 ? <span className="match"><b>{m.score}%</b><span className="small">passt</span></span> : <span className="muted small">Wenig gemeinsam</span>}
              </button>
              {m.reasons.length > 0 && <div className="chips">{m.reasons.map((r) => <span key={r} className="tagchip">{r}</span>)}</div>}
              {req === "sent"
                ? <button className="btn secondary" disabled>Anfrage gesendet</button>
                : <button className="btn secondary" onClick={() => app.sendRequest(p.id)}>Anfrage senden</button>}
            </article>
          );
        }) : <div className="empty small">Du bist mit allen Personen in deiner Nähe befreundet.</div>}
        <p className="muted small">Demo-Profile im Prototyp. Mit Login seht ihr hier echte Gym Buddys aus eurer Stadt.</p>
      </>)}
    </div>
  );
}

/* ---------- Profil einer Person ---------- */
export function Person({ app, id }) {
  const { S, go, back } = app;
  const p = person(id);
  const [invite, setInvite] = useState(false);
  const [dayIdx, setDayIdx] = useState(0);
  const [when, setWhen] = useState("Morgen");
  if (!p) return <div className="stack"><Header title="Profil" onBack={back} /><div className="empty">Dieses Profil gibt es nicht mehr.</div></div>;
  const isFriend = S.social.friends.includes(id);
  const req = S.social.requests[id];
  const m = match(p, S.answers);
  return (
    <div className="stack">
      <Header title={p.name} onBack={back} />
      <div className="center-text stack-sm">
        <div className="center"><Portrait look={p.look} label={p.name} size={88} /></div>
        <h1>{p.name}, {p.age}</h1>
        <p className="muted small">{lastSeen(p.lastDays, p.paused)} · Buddy Level {p.level}</p>
      </div>
      <div className="card">
        <dl className="facts">
          <div><dt>Ziel</dt><dd>{labels.GOAL[p.goal]}</dd></div>
          <div><dt>Trainiert</dt><dd>{labels.TIME[p.time]}</dd></div>
          <div><dt>Ort</dt><dd>{p.place}</dd></div>
        </dl>
        <p className="small pad-top-sm">{p.bio}</p>
      </div>
      {m.reasons.length > 0 && <div className="chips">{m.reasons.map((r) => <span key={r} className="tagchip">{r}</span>)}</div>}

      {isFriend && !p.paused && p.lastDays >= 7 && (
        <div className="card stack-sm">
          <p className="small"><b>{p.name} war seit {p.lastDays} Tagen nicht trainieren.</b> Ein kleiner Schubs hilft beim Dranbleiben.</p>
          <button className="btn secondary" disabled={nudgedToday(S, id)} onClick={() => app.nudge(id)}>{nudgedToday(S, id) ? "Heute schon erinnert" : `${p.name} ans Training erinnern`}</button>
        </div>
      )}
      {isFriend && p.paused && <p className="help small">{p.name} hat das Profil gerade pausiert. Einladungen kommen nach der Pause wieder an.</p>}
      {isFriend ? (<>
        {!invite ? (<>
          <button className="btn" onClick={() => setInvite(true)}>Zusammen trainieren</button>
          <button className="btn secondary" onClick={() => go("chat", id)}>Nachricht schreiben</button>
        </>) : (
          <div className="card stack">
            <b>Zu welchem Training lädst du {p.name} ein?</b>
            <div className="chips">{S.plan.days.map((d, i) => <button key={i} className="chip" aria-pressed={dayIdx === i} onClick={() => setDayIdx(i)}>{short(d.name)}</button>)}</div>
            <div className="chips">{["Heute", "Morgen", "Übermorgen"].map((w) => <button key={w} className="chip" aria-pressed={when === w} onClick={() => setWhen(w)}>{w}</button>)}</div>
            <button className="btn" onClick={() => app.sendMessage(id, `Lust auf ${short(S.plan.days[dayIdx].name)} ${when.toLowerCase()} ${S.answers.time === "wechselnd" ? "" : S.answers.time}? Ich hab Training ${dayIdx + 1} im Plan.`.replace(/\s+/g, " "), true)}>Einladung senden</button>
            <button className="linkbtn" onClick={() => setInvite(false)}>Abbrechen</button>
          </div>
        )}
        <p className="help small">Tipp: Trefft euch beim ersten Mal im Studio oder an einem öffentlichen Ort.</p>
      </>) : req === "sent"
        ? <button className="btn secondary" disabled>Anfrage gesendet</button>
        : <button className="btn" onClick={() => app.sendRequest(id)}>Anfrage senden</button>}
      {isFriend && <button className="linkbtn small muted" onClick={() => app.removeFriend(id)}>Freundschaft beenden</button>}
    </div>
  );
}

/* ---------- Chat ---------- */
export function Chat({ app, id }) {
  const { S, back } = app;
  const p = person(id);
  const [text, setText] = useState("");
  const end = useRef(null);
  const msgs = S.social.chats[id] || [];
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs.length]);
  const send = () => { if (!text.trim()) return; app.sendMessage(id, text.trim()); setText(""); };
  return (
    <div className="stack chat">
      <Header title={p.name} onBack={back} />
      <div className="msgs" aria-live="polite">
        {msgs.length === 0 && <div className="empty small">Schreib {p.name} die erste Nachricht, zum Beispiel wann du trainierst.</div>}
        {msgs.map((m, i) => <div key={i} className={`msg ${m.me ? "me" : ""}`}>{m.text}</div>)}
        {S.social.typing === id && <div className="msg typing" aria-label={`${p.name} schreibt`}><i /><i /><i /></div>}
        <div ref={end} />
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <label htmlFor="chat-input" className="sr-only">Nachricht an {p.name}</label>
        <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nachricht schreiben" autoComplete="off" maxLength={500} />
        <button className="iconbtn accent" type="submit" aria-label="Senden" disabled={!text.trim()}><Icon name="send" /></button>
      </form>
    </div>
  );
}
