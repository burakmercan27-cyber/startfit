import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SYSTEM = `Du prüfst Fitness-Tipps aus Social Media für Einsteiger.
Antworte nur mit JSON: {"verdict":"stimmt"|"teilweise"|"stimmt nicht"|"kein Fitness-Thema","reason":"..."}
- "reason": Deutsch, Du-Form, max. 100 Wörter, verständlich, stütze dich auf den sportwissenschaftlichen Konsens.
- Bei Fragen zu Schmerzen, Verletzungen oder Krankheiten: verweise auf eine Ärztin oder einen Arzt.
- Ist der Text kein Fitness- oder Trainingsthema, nutze "kein Fitness-Thema" und erkläre freundlich, was du prüfen kannst.`;

export async function POST(req) {
  let text = "";
  try {
    text = String((await req.json()).text || "").trim().slice(0, 600);
  } catch {}
  if (!text) return Response.json({ error: "Füge zuerst einen Tipp ein." }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "Der Tipp-Check ist in dieser Version noch nicht freigeschaltet." }, { status: 503 });
  try {
    const client = new Anthropic();
    const msg = await client.messages.create(
      { model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 500, system: SYSTEM, messages: [{ role: "user", content: text }] },
      { timeout: 20000 }
    );
    const out = msg.content.filter((c) => c.type === "text").map((c) => c.text).join("");
    const json = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
    const ok = ["stimmt", "teilweise", "stimmt nicht", "kein Fitness-Thema"];
    if (!ok.includes(json.verdict) || typeof json.reason !== "string") throw new Error("bad format");
    return Response.json({ verdict: json.verdict, reason: json.reason });
  } catch (e) {
    console.error("myth check failed", e?.message);
    return Response.json({ error: "Die Prüfung hat nicht geklappt. Versuch es gleich nochmal." }, { status: 502 });
  }
}
