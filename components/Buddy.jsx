/* Der Buddy: eigene Figur, gezeichnet als SVG. Größe und Ausrüstung wachsen mit dem Level, Farbe und Gesicht zeigen die Stimmung. */

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export default function Buddy({ color = "#5CC8A0", mood = "happy", stage = 1, size = 180, animate = true, label }) {
  const body = mood === "happy" ? color : mood === "tired" ? mix(color, "#9AA3A0", 0.3) : mood === "sad" ? mix(color, "#8D9693", 0.6) : mix(color, "#A7B79A", 0.75);
  const dark = mix(body, "#1D2622", 0.35);
  const rx = stage === 3 ? 66 : stage === 2 ? 60 : 54;
  const ry = stage === 3 ? 60 : stage === 2 ? 56 : 52;
  const cy = 118;
  const droop = mood === "sad" || mood === "sick";
  const eyeY = cy - 10;
  const band = "#E4573D";
  const ink = "#1D2622";

  const eyes = {
    happy: (<>
      <circle cx="80" cy={eyeY} r="11" fill="#fff" /><circle cx="120" cy={eyeY} r="11" fill="#fff" />
      <circle cx="82" cy={eyeY + 1} r="6" fill={ink} /><circle cx="122" cy={eyeY + 1} r="6" fill={ink} />
      <circle cx="84" cy={eyeY - 2} r="2" fill="#fff" /><circle cx="124" cy={eyeY - 2} r="2" fill="#fff" />
    </>),
    tired: (<>
      <circle cx="80" cy={eyeY} r="10" fill="#fff" /><circle cx="120" cy={eyeY} r="10" fill="#fff" />
      <circle cx="80" cy={eyeY + 3} r="5" fill={ink} /><circle cx="120" cy={eyeY + 3} r="5" fill={ink} />
      <path d={`M69 ${eyeY - 1}h22M109 ${eyeY - 1}h22`} stroke={dark} strokeWidth="9" strokeLinecap="round" />
    </>),
    sad: (<>
      <circle cx="80" cy={eyeY} r="10" fill="#fff" /><circle cx="120" cy={eyeY} r="10" fill="#fff" />
      <circle cx="79" cy={eyeY + 3} r="5" fill={ink} /><circle cx="121" cy={eyeY + 3} r="5" fill={ink} />
      <path d={`M68 ${eyeY - 16}l20 6M132 ${eyeY - 16}l-20 6`} stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
      <path d={`M72 ${eyeY + 12}q-4 8 0 12q4-4 0-12z`} fill="#6FB6F0" />
    </>),
    sick: (<>
      <path d={`M72 ${eyeY - 6}l14 12M86 ${eyeY - 6}l-14 12M114 ${eyeY - 6}l14 12M128 ${eyeY - 6}l-14 12`} stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    </>),
  }[mood];

  const mouth = {
    happy: <path d={`M84 ${cy + 12}q16 16 32 0`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
    tired: <path d={`M88 ${cy + 16}h24`} stroke={ink} strokeWidth="4" strokeLinecap="round" />,
    sad: <path d={`M86 ${cy + 22}q14 -12 28 0`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
    sick: <path d={`M84 ${cy + 18}q5 -5 10 0t10 0t10 0`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />,
  }[mood];

  const armR = stage === 3 ? 14 : 11;
  return (
    <svg className={`buddy ${animate && mood === "happy" ? "bob" : ""}`} width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={label || "Dein Buddy"}>
      <ellipse cx="100" cy="186" rx={rx * 0.8} ry="7" fill="var(--shadow)" />
      <g transform={droop ? "translate(0 8) scale(1 0.95)" : undefined} style={{ transformOrigin: "100px 180px" }}>
        {/* Füße */}
        <ellipse cx="78" cy={cy + ry - 4} rx="15" ry="9" fill={dark} />
        <ellipse cx="122" cy={cy + ry - 4} rx="15" ry="9" fill={dark} />
        {/* Arme */}
        <ellipse cx={100 - rx - 2} cy={cy + (droop ? 18 : 6)} rx={armR} ry={armR + 5} fill={body} stroke={dark} strokeWidth="2" transform={droop ? undefined : `rotate(-25 ${100 - rx - 2} ${cy + 6})`} />
        <ellipse cx={100 + rx + 2} cy={cy + (droop ? 18 : 6)} rx={armR} ry={armR + 5} fill={body} stroke={dark} strokeWidth="2" transform={droop ? undefined : `rotate(25 ${100 + rx + 2} ${cy + 6})`} />
        {stage === 3 && (<>
          <rect x={100 - rx - 2 - armR} y={cy + (droop ? 22 : 10)} width={armR * 2} height="6" rx="3" fill={band} />
          <rect x={100 + rx + 2 - armR} y={cy + (droop ? 22 : 10)} width={armR * 2} height="6" rx="3" fill={band} />
        </>)}
        {/* Körper */}
        <ellipse cx="100" cy={cy} rx={rx} ry={ry} fill={body} stroke={dark} strokeWidth="2.5" />
        <ellipse cx="100" cy={cy + 20} rx={rx * 0.55} ry={ry * 0.45} fill="#fff" opacity="0.22" />
        {stage >= 2 && (<>
          <path d={`M${100 - rx + 6} ${cy - ry + 26}Q100 ${cy - ry + 12} ${100 + rx - 6} ${cy - ry + 26}l0 11Q100 ${cy - ry + 23} ${100 - rx + 6} ${cy - ry + 37}z`} fill={band} />
          <path d={`M${100 + rx - 8} ${cy - ry + 28}l16 -8l-2 13z`} fill={band} />
        </>)}
        {mood === "happy" && (<><ellipse cx="66" cy={cy + 8} rx="8" ry="5" fill="#F28B82" opacity="0.6" /><ellipse cx="134" cy={cy + 8} rx="8" ry="5" fill="#F28B82" opacity="0.6" /></>)}
        {eyes}
        {mouth}
      </g>
      {mood === "sick" && <text x="150" y="58" fontSize="22" fontWeight="800" fill="var(--muted)" fontFamily="inherit">z<tspan dy="-8" fontSize="16">z</tspan></text>}
      {mood === "happy" && stage === 3 && <path d="M156 54l4 9l9 1l-7 6l2 9l-8-5l-8 5l2-9l-7-6l9-1z" fill="#F4B740" />}
    </svg>
  );
}
