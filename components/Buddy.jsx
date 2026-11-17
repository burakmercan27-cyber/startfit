/* Der Buddy: eine kleine Figur im Comic-Stil, gezeichnet als SVG.
   Aussehen (Hautton, Frisur, Haarfarbe, Shirt) wählt der Nutzer.
   Level bestimmt Statur und Ausrüstung, die Stimmung Gesicht, Haltung und Farben. */
import { lookOf } from "../lib/buddy";

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const INK = "#1D2622";
const BAND = "#E4573D";

function Hair({ style, color, back }) {
  if (style === "glatze") return back ? null : <ellipse cx="88" cy="42" rx="10" ry="5" fill="#fff" opacity="0.25" />;
  if (style === "lang") return back
    ? <path d="M63 64Q60 30 100 29Q140 30 137 64L140 116Q128 124 118 114L120 74L80 74L82 114Q72 124 60 116Z" fill={color} />
    : <path d="M63 66Q63 30 100 30Q137 30 137 66Q128 48 106 46Q94 52 80 50Q70 54 63 66Z" fill={color} />;
  if (style === "locken") return back ? null : (
    <g fill={color}>
      {[[68, 56], [74, 42], [86, 34], [100, 31], [114, 34], [126, 42], [132, 56]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="12" />)}
    </g>
  );
  // kurz
  return back ? null : <path d="M64 64Q63 30 100 30Q137 30 136 64Q130 50 116 49Q108 42 98 47Q86 42 80 50Q70 50 64 64Z" fill={color} />;
}

function Face({ mood, skinDark }) {
  const ey = 70;
  const eyes = {
    happy: (<>
      <ellipse cx="86" cy={ey} rx="4.5" ry="5.5" fill={INK} /><ellipse cx="114" cy={ey} rx="4.5" ry="5.5" fill={INK} />
      <circle cx="87.5" cy={ey - 2} r="1.6" fill="#fff" /><circle cx="115.5" cy={ey - 2} r="1.6" fill="#fff" />
      <path d="M79 59q7-4 13 0M108 59q6-4 13 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </>),
    tired: (<>
      <ellipse cx="86" cy={ey + 1} rx="4.5" ry="4" fill={INK} /><ellipse cx="114" cy={ey + 1} rx="4.5" ry="4" fill={INK} />
      <path d={`M80 ${ey - 1}h12M108 ${ey - 1}h12`} stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
      <path d={`M81 ${ey + 7}q5 2 10 0M109 ${ey + 7}q5 2 10 0`} fill="none" stroke={skinDark} strokeWidth="1.8" strokeLinecap="round" />
    </>),
    sad: (<>
      <ellipse cx="86" cy={ey + 1} rx="4" ry="5" fill={INK} /><ellipse cx="114" cy={ey + 1} rx="4" ry="5" fill={INK} />
      <path d="M78 60l12 4M122 60l-12 4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M80 ${ey + 8}q-3 7 0 10q3-3 0-10z`} fill="#6FB6F0" />
    </>),
    sick: (<>
      <path d={`M81 ${ey - 5}l10 10M91 ${ey - 5}l-10 10M109 ${ey - 5}l10 10M119 ${ey - 5}l-10 10`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M78 60l12 3M122 60l-12 3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </>),
  }[mood];
  const mouth = {
    happy: <path d="M90 84q10 11 20 0z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />,
    tired: <path d="M93 88h14" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
    sad: <path d="M91 91q9-7 18 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
    sick: <path d="M89 89q3.6-3 7.3 0t7.3 0t7.3 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />,
  }[mood];
  return (<>
    {eyes}
    <path d="M100 74q3 5 0 7" fill="none" stroke={skinDark} strokeWidth="2" strokeLinecap="round" />
    {mood === "happy" && <><ellipse cx="78" cy="81" rx="6" ry="3.5" fill="#F28B82" opacity="0.5" /><ellipse cx="122" cy="81" rx="6" ry="3.5" fill="#F28B82" opacity="0.5" /></>}
    {mouth}
  </>);
}

function Arm({ side, pose, stage, skin, shirt }) {
  const s = side === "l" ? -1 : 1;
  const tw = stage === 3 ? 80 : stage === 2 ? 72 : 66;
  const sx = 100 + s * (tw / 2 - 5), sy = 116;
  const P = {
    rest: [[sx + s * 9, sy + 22], [sx + s * 12, sy + 44]],
    flex: [[sx + s * 24, sy + 6], [sx + s * 22, sy - 18]],
    hang: [[sx + s * 3, sy + 24], [sx + s * 2, sy + 48]],
  }[pose];
  const [e, h] = P;
  const w = stage === 3 ? 15 : stage === 2 ? 13 : 11;
  const sleeve = [sx + (e[0] - sx) * 0.5, sy + (e[1] - sy) * 0.5];
  const wb = [e[0] + (h[0] - e[0]) * 0.72, e[1] + (h[1] - e[1]) * 0.72];
  return (<g>
    <path d={`M${sx} ${sy}L${e[0]} ${e[1]}L${h[0]} ${h[1]}`} fill="none" stroke={skin} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    {pose === "flex" && <circle cx={(sx + e[0]) / 2 + s * 1} cy={(sy + e[1]) / 2 - 6} r={w * 0.55} fill={skin} />}
    <path d={`M${sx} ${sy}L${sleeve[0]} ${sleeve[1]}`} stroke={shirt} strokeWidth={w + 5} strokeLinecap="round" />
    {stage === 3 && <circle cx={wb[0]} cy={wb[1]} r={w * 0.62} fill={BAND} />}
    <circle cx={h[0]} cy={h[1]} r={w * 0.55} fill={skin} />
  </g>);
}

export default function Buddy({ look: lk, mood = "happy", stage = 1, size = 180, animate = true, label, headOnly = false }) {
  const look = lookOf(lk);
  const skin = mood === "sick" ? mix(look.skin, "#A9C39B", 0.35) : mood === "sad" ? mix(look.skin, "#B9B9B9", 0.15) : look.skin;
  const skinDark = mix(skin, INK, 0.3);
  const shirt = mood === "happy" ? look.shirt : mix(look.shirt, "#8D9693", mood === "tired" ? 0.25 : 0.55);
  const hair = look.hairColor;
  const tw = stage === 3 ? 80 : stage === 2 ? 72 : 66;
  const pose = mood === "sad" || mood === "sick" ? "hang" : mood === "happy" && stage === 3 ? "flex" : "rest";
  const droop = pose === "hang";

  const head = (
    <g transform={droop ? "rotate(-5 100 70)" : undefined}>
      <Hair style={look.hair} color={hair} back />
      <rect x="93" y="96" width="14" height="14" rx="4" fill={skinDark} />
      <circle cx="64" cy="72" r="7" fill={skin} /><circle cx="136" cy="72" r="7" fill={skin} />
      <circle cx="100" cy="68" r="36" fill={skin} />
      <Hair style={look.hair} color={hair} />
      {stage >= 2 && (<>
        <path d="M65 56Q100 40 135 56L135 64Q100 48 65 64Z" fill={BAND} />
        <path d="M133 57l14-6l-1 12z" fill={BAND} />
      </>)}
      <Face mood={mood} skinDark={skinDark} />
    </g>
  );

  if (headOnly) return (
    <svg width={size} height={size} viewBox="56 22 88 88" role="img" aria-label={label || "Avatar"} style={{ display: "block" }}>{head}</svg>
  );

  return (
    <svg className={`buddy ${animate && mood === "happy" ? "bob" : ""}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={label || "Dein Buddy"}>
      <ellipse cx="100" cy="193" rx="42" ry="6" fill="var(--shadow)" />
      {/* Beine und Schuhe */}
      <path d="M92 160L90 182M108 160L110 182" stroke={skin} strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="88" cy="187" rx="11" ry="6" fill={INK} /><ellipse cx="112" cy="187" rx="11" ry="6" fill={INK} />
      <g transform={droop ? "translate(0 4)" : undefined}>
        <rect x={100 - tw / 2 + 4} y="148" width={tw - 8} height="22" rx="6" fill="#3B4A44" />
        <Arm side="l" pose={pose} stage={stage} skin={skin} shirt={shirt} />
        <Arm side="r" pose={pose} stage={stage} skin={skin} shirt={shirt} />
        <rect x={100 - tw / 2} y="104" width={tw} height="52" rx="16" fill={shirt} />
        <path d={`M92 104q8 8 16 0`} fill="none" stroke={mix(shirt, INK, 0.25)} strokeWidth="3" strokeLinecap="round" />
        {stage >= 2 && <path d="M100 118l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#fff" opacity="0.85" />}
        {head}
      </g>
      {mood === "sick" && <text x="146" y="44" fontSize="20" fontWeight="800" fill="var(--muted)" fontFamily="inherit">z<tspan dy="-8" fontSize="15">z</tspan></text>}
      {mood === "sick" && <path d="M140 60q-4 7 0 10q4-3 0-10z" fill="#6FB6F0" />}
      {mood === "happy" && stage === 3 && <path d="M160 28l4 9l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1z" fill="#F4B740" />}
    </svg>
  );
}

/* Kleiner Kopf als Profilbild */
export function Portrait({ look, size = 44, label }) {
  return (
    <span className="avatar" style={{ width: size, height: size, background: "var(--accent-soft)" }}>
      <Buddy look={look} headOnly size={size * 0.92} label={label} />
    </span>
  );
}
