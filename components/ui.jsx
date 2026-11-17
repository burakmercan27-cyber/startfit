"use client";
import { useEffect } from "react";

const P = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  plan: "M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  coach: "M12 3a6 6 0 0 1 6 6v2a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6zM5 21a7 7 0 0 1 14 0M9.5 9.5h.01M14.5 9.5h.01",
  people: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M18 14a6 6 0 0 1 4 7",
  me: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 21a8 8 0 0 1 16 0",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-5M12 8h.01",
  lock: "M6 11h12v10H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11",
  send: "M4 12 20 4l-6 16-3-7z",
  check: "M5 12.5l4.5 4.5L19 7.5",
  play: "M8 5v14l11-7z",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 2 1.5 3 2.5 3-1-3 0-6 0-8z",
};

export function Icon({ name, size = 22, label }) {
  const filled = name === "play";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={label ? undefined : true} role={label ? "img" : undefined} aria-label={label}>
      <path d={P[name]} />
    </svg>
  );
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.undo ? 6000 : 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" size={18} />
      <span className="grow">{toast.text}</span>
      {toast.undo && <button className="toast-undo" onClick={() => { toast.undo(); onClose(); }}>Rückgängig</button>}
    </div>
  );
}

export function Header({ title, onBack, right }) {
  return (
    <header className="subhead">
      {onBack ? <button className="iconbtn" onClick={onBack} aria-label="Zurück"><Icon name="back" /></button> : <span />}
      <h2>{title}</h2>
      {right || <span />}
    </header>
  );
}

export function Bar({ pct, label, tone = "accent" }) {
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct * 100)} aria-valuemin="0" aria-valuemax="100">
      <i className={tone} style={{ width: `${Math.max(3, pct * 100)}%` }} />
    </div>
  );
}

export function Avatar({ color, name, size = 44 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: color }} aria-hidden="true">
      <svg viewBox="0 0 40 40" width={size * 0.7} height={size * 0.7}>
        <circle cx="14" cy="17" r="3.5" fill="#1D2622" /><circle cx="26" cy="17" r="3.5" fill="#1D2622" />
        <path d="M14 25q6 6 12 0" fill="none" stroke="#1D2622" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{name}</span>
    </span>
  );
}

const TABS = [["home", "Start"], ["plan", "Plan"], ["coach", "Coach"], ["community", "Freunde"], ["me", "Profil"]];
export function TabBar({ current, onTab, badge }) {
  return (
    <nav className="tabs" aria-label="Hauptnavigation"><div className="in">
      {TABS.map(([t, l]) => (
        <button key={t} className="tab" aria-current={current === t ? "page" : undefined} onClick={() => onTab(t)}>
          <span className="tabicon"><Icon name={t === "community" ? "people" : t} />{badge?.[t] ? <i className="dot" /> : null}</span>
          <span>{l}</span>
        </button>
      ))}
    </div></nav>
  );
}
