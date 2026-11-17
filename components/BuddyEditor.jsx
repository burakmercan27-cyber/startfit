"use client";
import { SKIN, HAIR, HAIR_COLOR, SHIRT, lookOf } from "../lib/buddy";

function Swatches({ label, items, value, onPick }) {
  return (
    <fieldset className="stack-sm">
      <legend className="label">{label}</legend>
      <div className="swatches">
        {items.map((it) => (
          <button key={it.id} type="button" className="swatch-btn" aria-pressed={value === it.hex} aria-label={`${label}: ${it.name}`} title={it.name} onClick={() => onPick(it.hex)}>
            <i style={{ background: it.hex }} />
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/* Wenige, klare Optionen: Hautton, Frisur, Haarfarbe, Shirt. Skins folgen später. */
export default function BuddyEditor({ look: lk, onChange }) {
  const look = lookOf(lk);
  const set = (k, v) => onChange({ ...look, [k]: v });
  return (
    <div className="stack">
      <Swatches label="Hautton" items={SKIN} value={look.skin} onPick={(v) => set("skin", v)} />
      <fieldset className="stack-sm">
        <legend className="label">Frisur</legend>
        <div className="options">
          {HAIR.map((h) => <button key={h.id} type="button" className="option" aria-pressed={look.hair === h.id} onClick={() => set("hair", h.id)}>{h.name}</button>)}
        </div>
      </fieldset>
      {look.hair !== "glatze" && <Swatches label="Haarfarbe" items={HAIR_COLOR} value={look.hairColor} onPick={(v) => set("hairColor", v)} />}
      <Swatches label="Shirt" items={SHIRT} value={look.shirt} onPick={(v) => set("shirt", v)} />
    </div>
  );
}
