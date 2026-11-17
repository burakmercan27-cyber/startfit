/* Der Buddy: kleine Comic-Figur als SVG.
   Aussehen (Figur, Statur, Hautton, Frisur, Haarfarbe, Shirt) wählt der Nutzer.
   Level bestimmt Kraft und Ausrüstung, die Stimmung Gesicht, Haltung und Farben.
   "pause" zeigt eine angemeldete Auszeit (Urlaub, Verletzung, sonstige Pause). */
import { lookOf } from "../lib/buddy";

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

const INK = "#1D2622";
const BAND = "#E4573D";
const PANTS = "#34413C";

function Hair({ style, color, back }) {
  if (style === "glatze") return back ? null : <ellipse cx="88" cy="42" rx="10" ry="5" fill="#fff" opacity="0.25" />;
  if (style === "lang") return back
    ? <path d="M63 64Q60 30 100 29Q140 30 137 64L140 116Q128 124 118 114L120 74L80 74L82 114Q72 124 60 116Z" fill={color} />
    : <path d="M63 66Q63 30 100 30Q137 30 137 66Q128 48 106 46Q94 52 80 50Q70 54 63 66Z" fill={color} />;
  if (style === "zopf") return back
    ? <g fill={color}><circle cx="100" cy="28" r="13" /><ellipse cx="100" cy="16" rx="8" ry="7" /></g>
    : <path d="M64 66Q63 30 100 30Q137 30 136 66Q128 46 100 44Q72 46 64 66Z" fill={color} />;
  if (style === "locken") return back ? null : (
    <g fill={color}>{[[68, 56], [74, 42], [86, 34], [100, 31], [114, 34], [126, 42], [132, 56]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="12" />)}</g>
  );
  return back ? null : <path d="M64 64Q63 30 100 30Q137 30 136 64Q130 50 116 49Q108 42 98 47Q86 42 80 50Q70 50 64 64Z" fill={color} />;
}

function Face({ mood, reason, skinDark, female }) {
  const ey = 70;
  const lashes = female && !["sick", "pause"].includes(mood) ? <path d="M80 66l-4-3M120 66l4-3" stroke={INK} strokeWidth="2" strokeLinecap="round" /> : null;
  const openEyes = (ry = 5.5) => (<>
    <ellipse cx="86" cy={ey} rx="4.5" ry={ry} fill={INK} /><ellipse cx="114" cy={ey} rx="4.5" ry={ry} fill={INK} />
    <circle cx="87.5" cy={ey - 2} r="1.6" fill="#fff" /><circle cx="115.5" cy={ey - 2} r="1.6" fill="#fff" />
  </>);
  let eyes, mouth;
  const smile = <path d="M90 84q10 11 20 0z" fill={INK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
  const softSmile = <path d="M91 85q9 7 18 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  if (mood === "happy") { eyes = <>{openEyes()}<path d="M79 59q7-4 13 0M108 59q6-4 13 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /></>; mouth = smile; }
  if (mood === "tired") {
    eyes = (<>
      <ellipse cx="86" cy={ey + 1} rx="4.5" ry="4" fill={INK} /><ellipse cx="114" cy={ey + 1} rx="4.5" ry="4" fill={INK} />
      <path d={`M80 ${ey - 1}h12M108 ${ey - 1}h12`} stroke={skinDark} strokeWidth="5" strokeLinecap="round" />
      <path d={`M81 ${ey + 7}q5 2 10 0M109 ${ey + 7}q5 2 10 0`} fill="none" stroke={skinDark} strokeWidth="1.8" strokeLinecap="round" />
    </>);
    mouth = <path d="M93 88h14" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  }
  if (mood === "sad") {
    eyes = (<>
      <ellipse cx="86" cy={ey + 1} rx="4" ry="5" fill={INK} /><ellipse cx="114" cy={ey + 1} rx="4" ry="5" fill={INK} />
      <path d="M78 60l12 4M122 60l-12 4" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M80 ${ey + 8}q-3 7 0 10q3-3 0-10z`} fill="#6FB6F0" />
    </>);
    mouth = <path d="M91 91q9-7 18 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  }
  if (mood === "sick") {
    eyes = (<>
      <path d={`M81 ${ey - 5}l10 10M91 ${ey - 5}l-10 10M109 ${ey - 5}l10 10M119 ${ey - 5}l-10 10`} stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M78 60l12 3M122 60l-12 3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </>);
    mouth = <path d="M89 89q3.6-3 7.3 0t7.3 0t7.3 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  }
  if (mood === "pause") {
    if (reason === "urlaub") {
      eyes = (<g>
        <rect x="76" y="63" width="20" height="13" rx="5" fill={INK} /><rect x="104" y="63" width="20" height="13" rx="5" fill={INK} />
        <path d="M96 68h8M76 67l-10-3M124 67l10-3" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M80 66l5 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      </g>);
      mouth = smile;
    } else if (reason === "verletzung") {
      eyes = <>{openEyes(5)}</>;
      mouth = softSmile;
    } else {
      eyes = <path d="M80 71q6 5 12 0M108 71q6 5 12 0" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
      mouth = <ellipse cx="100" cy="88" rx="4" ry="3" fill={INK} />;
    }
  }
  return (<>
    {eyes}{lashes}
    <path d="M100 74q3 5 0 7" fill="none" stroke={skinDark} strokeWidth="2" strokeLinecap="round" />
    {(mood === "happy" || (mood === "pause" && reason === "urlaub")) && <><ellipse cx="78" cy="81" rx="6" ry="3.5" fill="#F28B82" opacity="0.5" /><ellipse cx="122" cy="81" rx="6" ry="3.5" fill="#F28B82" opacity="0.5" /></>}
    {mouth}
  </>);
}

function Arm({ side, pose, sx, sy, w, stage, skin, shirt, bandage }) {
  const s = side === "l" ? -1 : 1;
  const [e, h] = {
    rest: [[sx + s * 9, sy + 22], [sx + s * 12, sy + 44]],
    flex: [[sx + s * 24, sy + 6], [sx + s * 22, sy - 18]],
    hang: [[sx + s * 3, sy + 24], [sx + s * 2, sy + 48]],
    wave: [[sx + s * 20, sy - 4], [sx + s * 26, sy - 26]],
  }[pose];
  const sleeve = [sx + (e[0] - sx) * 0.5, sy + (e[1] - sy) * 0.5];
  const wb = [e[0] + (h[0] - e[0]) * 0.72, e[1] + (h[1] - e[1]) * 0.72];
  const mid = [(e[0] + h[0]) / 2, (e[1] + h[1]) / 2];
  return (<g>
    <path d={`M${sx} ${sy}L${e[0]} ${e[1]}L${h[0]} ${h[1]}`} fill="none" stroke={skin} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    {pose === "flex" && <circle cx={(sx + e[0]) / 2 + s} cy={(sy + e[1]) / 2 - 6} r={w * 0.55} fill={skin} />}
    <path d={`M${sx} ${sy}L${sleeve[0]} ${sleeve[1]}`} stroke={shirt} strokeWidth={w + 5} strokeLinecap="round" />
    {stage === 3 && !bandage && <circle cx={wb[0]} cy={wb[1]} r={w * 0.62} fill={BAND} />}
    {bandage && <path d={`M${e[0]} ${e[1]}L${mid[0]} ${mid[1]}`} stroke="#fff" strokeWidth={w + 3} strokeLinecap="round" opacity=".95" />}
    <circle cx={h[0]} cy={h[1]} r={w * 0.55} fill={skin} />
  </g>);
}

export default function Buddy({ look: lk, mood = "happy", reason, stage = 1, size = 180, animate = true, label, headOnly = false, coach = false }) {
  const look = lookOf(lk);
  const female = look.body === "w";
  const skin = mood === "sick" ? mix(look.skin, "#A9C39B", 0.35) : mood === "sad" ? mix(look.skin, "#B9B9B9", 0.15) : look.skin;
  const skinDark = mix(skin, INK, 0.3);
  const shirt = ["happy", "pause"].includes(mood) ? look.shirt : mix(look.shirt, "#8D9693", mood === "tired" ? 0.25 : 0.55);
  const base = { schlank: 60, mittel: 68, kraeftig: 78 }[look.build] || 68;
  const tw = base + (stage === 3 ? 10 : stage === 2 ? 5 : 0);
  const top = female ? tw - 8 : tw;
  const pose = coach ? "wave" : mood === "sad" || mood === "sick" ? "hang" : mood === "happy" && stage === 3 ? "flex" : "rest";
  const droop = pose === "hang";
  const armW = (stage === 3 ? 15 : stage === 2 ? 13 : 11) + (look.build === "kraeftig" ? 2 : look.build === "schlank" ? -1 : 0) - (female ? 1 : 0);
  const sy = 116;
  const shoulder = top / 2 - 5;

  const head = (
    <g transform={droop ? "rotate(-5 100 70)" : undefined}>
      <Hair style={look.hair} color={look.hairColor} back />
      <rect x="93" y="96" width="14" height="14" rx="4" fill={skinDark} />
      <circle cx="64" cy="72" r="7" fill={skin} /><circle cx="136" cy="72" r="7" fill={skin} />
      {female && look.hair !== "glatze" && <><circle cx="64" cy="80" r="2.5" fill="#F4B740" /><circle cx="136" cy="80" r="2.5" fill="#F4B740" /></>}
      <circle cx="100" cy="68" r="36" fill={skin} />
      <Hair style={look.hair} color={look.hairColor} />
      {coach ? (<>
        <path d="M64 56Q64 26 100 26Q136 26 136 56Z" fill="#D9473A" />
        <path d="M62 56Q100 48 150 58Q150 64 136 62Q100 56 64 62Z" fill="#B83A2F" />
        <circle cx="100" cy="27" r="3" fill="#B83A2F" />
      </>) : stage >= 2 && !(mood === "pause" && reason === "urlaub") && (<>
        <path d="M65 56Q100 40 135 56L135 64Q100 48 65 64Z" fill={BAND} />
        <path d="M133 57l14-6l-1 12z" fill={BAND} />
      </>)}
      {mood === "pause" && reason === "verletzung" && <g transform="rotate(-20 118 50)"><rect x="108" y="46" width="20" height="8" rx="3" fill="#F3D9B8" stroke="#D9B98F" /><path d="M116 48v4M120 48v4" stroke="#D9B98F" strokeWidth="1.2" /></g>}
      <Face mood={mood} reason={reason} skinDark={skinDark} female={female} />
    </g>
  );

  if (headOnly) return <svg width={size} height={size} viewBox="54 14 92 92" role="img" aria-label={label || "Avatar"} style={{ display: "block" }}>{head}</svg>;

  const torso = female
    ? `M${100 - top / 2} 112Q${100 - top / 2} 104 ${100 - top / 2 + 8} 104L${100 + top / 2 - 8} 104Q${100 + top / 2} 104 ${100 + top / 2} 112Q${100 + tw / 2 - 8} 130 ${100 + tw / 2 - 2} 150Q${100 + tw / 2 - 2} 156 ${100 + tw / 2 - 10} 156L${100 - tw / 2 + 10} 156Q${100 - tw / 2 + 2} 156 ${100 - tw / 2 + 2} 150Q${100 - tw / 2 + 8} 130 ${100 - top / 2} 112Z`
    : null;

  return (
    <svg className={`buddy ${animate && mood === "happy" ? "bob" : ""}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={label || "Dein Buddy"}>
      <ellipse cx="100" cy="193" rx="42" ry="6" fill="var(--shadow)" />
      {female
        ? <path d="M93 152L91 184M107 152L109 184" stroke={PANTS} strokeWidth="13" strokeLinecap="round" />
        : <path d="M92 160L90 182M108 160L110 182" stroke={skin} strokeWidth={look.build === "kraeftig" ? 13 : 11} strokeLinecap="round" />}
      <ellipse cx="88" cy="187" rx="11" ry="6" fill={INK} /><ellipse cx="112" cy="187" rx="11" ry="6" fill={INK} />
      <g transform={droop ? "translate(0 4)" : undefined}>
        {!female && <rect x={100 - tw / 2 + 4} y="148" width={tw - 8} height="22" rx="6" fill={PANTS} />}
        {female && <rect x={100 - tw / 2 + 6} y="146" width={tw - 12} height="14" rx="6" fill={PANTS} />}
        <Arm side="l" pose={pose === "wave" ? "rest" : pose} sx={100 - shoulder} sy={sy} w={armW} stage={stage} skin={skin} shirt={shirt} />
        <Arm side="r" pose={pose} sx={100 + shoulder} sy={sy} w={armW} stage={stage} skin={skin} shirt={shirt} bandage={mood === "pause" && reason === "verletzung"} />
        {female ? <path d={torso} fill={shirt} /> : <rect x={100 - tw / 2} y="104" width={tw} height="52" rx={look.build === "kraeftig" ? 22 : 16} fill={shirt} />}
        <path d="M92 104q8 8 16 0" fill="none" stroke={mix(shirt, INK, 0.25)} strokeWidth="3" strokeLinecap="round" />
        {coach && (<><path d="M93 106L100 132L107 106" fill="none" stroke="#F4F4F4" strokeWidth="2" /><rect x="95" y="131" width="12" height="8" rx="3" fill="#C9CED1" stroke="#8E979B" /></>)}
        {!coach && stage >= 2 && <path d="M100 118l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6-4.5-4 6-1z" fill="#fff" opacity="0.85" />}
        {head}
      </g>
      {mood === "sick" && <><text x="146" y="44" fontSize="20" fontWeight="800" fill="var(--muted)" fontFamily="inherit">z<tspan dy="-8" fontSize="15">z</tspan></text><path d="M140 60q-4 7 0 10q4-3 0-10z" fill="#6FB6F0" /></>}
      {mood === "pause" && !["urlaub", "verletzung"].includes(reason) && <text x="140" y="44" fontSize="20" fontWeight="800" fill="var(--muted)" fontFamily="inherit">z<tspan dy="-8" fontSize="15">z</tspan></text>}
      {mood === "pause" && reason === "urlaub" && <g><circle cx="160" cy="34" r="12" fill="#F4B740" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <path key={a} d="M160 16v-6" stroke="#F4B740" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 160 34)`} />)}</g>}
      {mood === "happy" && stage === 3 && !coach && <path d="M160 28l4 9l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1z" fill="#F4B740" />}
    </svg>
  );
}

/* Kleiner Kopf als Profilbild */
export function Portrait({ look, size = 44, label, coach = false }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <Buddy look={look} headOnly coach={coach} size={size * 0.94} label={label} />
    </span>
  );
}
