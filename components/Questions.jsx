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
  const ticks = k === "days" ? [1, 2, 3, 4, 5, 6, 7] : k === "age" ? [16, 30, 45, 60, 80] : [15, 30, 45, 60, 75, 90];
  return (
    <div className="slider">
      <label className="label" htmlFor={`range-${k}`}>{q.label}</label>
      <output className="slider-value" htmlFor={`range-${k}`} aria-live="polite">{v}<span>{q.unit(v)}{k === "days" ? " pro Woche" : k === "mins" ? " pro Training" : ""}</span></output>
      <input id={`range-${k}`} type="range" min={min} max={max} step={step} value={v} onChange={(e) => onChange(+e.target.value)}
        aria-valuetext={`${v} ${q.unit(v)}`} />
      <div className="ticks" aria-hidden="true">{ticks.map((t) => <span key={t}>{t}</span>)}</div>
      {k === "days" && v >= 6 && <p className="help small">Tipp: Plane mindestens einen Ruhetag ein. Muskeln wachsen in der Pause.</p>}
      {k === "age" && v >= 50 && <p className="help small">Dein Plan startet jedes Training mit Mobilität und gibt dir etwas längere Pausen.</p>}
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

function ChoiceList({ k, value, onChange }) {
  const q = Q[k];
  return (
    <fieldset className="stack-sm">
      <legend className="label">{q.label}</legend>
      <div className="choice-list" role="radiogroup">
        {Object.entries(q.opts).map(([id, name]) => (
          <button key={id} type="button" role="radio" aria-checked={String(value) === id} className="choice" onClick={() => onChange(id)}>
            <span className="grow"><b>{name}</b>{q.desc?.[id] && <span className="muted small block">{q.desc[id]}</span>}</span>
            <span className="radio" aria-hidden="true" />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* Größe und Gewicht: freiwillig, für gelenkschonende Übungen und als Startwert im Fortschritt */
export function BodyFields({ height, weight, onChange }) {
  return (
    <fieldset className="stack-sm">
      <legend className="label">Größe und Gewicht <span className="opt">freiwillig</span></legend>
      <div className="row2">
        <label className="unit-field"><span className="sr-only">Größe</span><input type="number" inputMode="numeric" min="120" max="230" placeholder="Größe" value={height ?? ""} onChange={(e) => onChange({ height: e.target.value === "" ? null : +e.target.value })} /><span>cm</span></label>
        <label className="unit-field"><span className="sr-only">Gewicht</span><input type="number" inputMode="decimal" min="30" max="250" step="0.1" placeholder="Gewicht" value={weight ?? ""} onChange={(e) => onChange({ weight: e.target.value === "" ? null : +e.target.value })} /><span>kg</span></label>
      </div>
      <p className="muted small">Hilft uns, gelenkschonende Übungen auszuwählen, und ist dein Startwert im Fortschritt. Bleibt privat und ist jederzeit löschbar.</p>
    </fieldset>
  );
}

export default function Question({ k, value, onChange, showError }) {
  const q = Q[k];
  if (q.range) return <Slider k={k} value={value} onChange={onChange} />;
  return (
    <div className="stack-sm">
      {k === "loc" ? <Places value={value} onChange={onChange} /> : <ChoiceList k={k} value={value} onChange={onChange} />}
      {showError && !value && <p className="err" role="alert">Bitte wähle eine Antwort aus.</p>}
    </div>
  );
}
