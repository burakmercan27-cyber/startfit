"use client";
import { Q } from "../lib/exercises";

const PLACE_ICON = {
  gym: "M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10",
  none: "M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5",
  db: "M2 10v4M5 8v8M11 8v8M14 10v4M5 12h6M16 20l3-8 3 8M17 17h4",
};

function Slider({ k, value, onChange }) {
  const q = Q[k];
  const [min, max, step] = q.range;
  const v = value ?? q.def;
  const ticks = k === "days" ? [1, 2, 3, 4, 5, 6, 7] : [15, 30, 45, 60, 75, 90];
  return (
    <div className="slider">
      <label className="label" htmlFor={`range-${k}`}>{q.label}</label>
      <output className="slider-value" htmlFor={`range-${k}`} aria-live="polite">{v}<span>{q.unit(v)}{k === "days" ? " pro Woche" : " pro Training"}</span></output>
      <input id={`range-${k}`} type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)}
        aria-valuetext={`${v} ${q.unit(v)}`} />
      <div className="ticks" aria-hidden="true">{ticks.map((t) => <span key={t}>{t}</span>)}</div>
      {k === "days" && v >= 6 && <p className="help small">Tipp: Plane mindestens einen Ruhetag ein. Muskeln wachsen in der Pause.</p>}
      {k === "mins" && v <= 20 && <p className="help small">Kurze Einheiten sind super für den Einstieg. Dein Plan hat dann 3 Übungen.</p>}
    </div>
  );
}

function Places({ value, onChange }) {
  const q = Q.loc;
  return (
    <fieldset className="stack-sm">
      <legend className="label">{q.label}</legend>
      <div className="place-cards" role="radiogroup">
        {Object.entries(q.opts).map(([id, name]) => (
          <button key={id} type="button" role="radio" aria-checked={value === id} className="place" onClick={() => onChange(id)}>
            <span className="ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PLACE_ICON[id]} /></svg></span>
            <span className="grow"><b>{name}</b><span className="muted small">{q.desc[id]}</span></span>
            <span className="radio" aria-hidden="true" />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function Question({ k, value, onChange, showError }) {
  const q = Q[k];
  if (q.range) return <Slider k={k} value={value} onChange={onChange} />;
  return (
    <div className="stack-sm">
      {k === "loc" ? <Places value={value} onChange={onChange} /> : (
        <fieldset className="stack-sm">
          <legend className="label">{q.label}</legend>
          <div className="options">
            {Object.entries(q.opts).map(([v, l]) => <button key={v} type="button" className="option" aria-pressed={String(value) === v} onClick={() => onChange(v)}>{l}</button>)}
          </div>
        </fieldset>
      )}
      {showError && !value && <p className="err" role="alert">Bitte wähle eine Antwort aus.</p>}
    </div>
  );
}
