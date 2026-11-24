import Anthropic from "@anthropic-ai/sdk";
import { EX, Q, validAnswer } from "../../../lib/exercises";
import { skeleton, ruleWhy, ruleReasons, rulePlan, describeAnswers } from "../../../lib/plan";

export const runtime = "nodejs";

const SYSTEM = `Du bist der KI-Coach der App BuddyFit für Fitness-Einsteiger.
Regeln:
- Wähle pro Slot genau eine Übung, und zwar nur eine ID aus der Liste "erlaubt" dieses Slots. Keine Übung doppelt an einem Tag.
- Schreibe zu jeder Übung ein "why" auf Deutsch, in der Du-Form, max. 50 Wörter, ohne Fachjargon: welchen Muskel sie trainiert, warum sie zum Ziel passt und, wo sinnvoll, zum Alltag der Person (Art der Arbeit, Trainingszeit).
- Schreibe 3 bis 5 "reasons": kurze Sätze, warum der Plan insgesamt so aussieht.
- Keine medizinischen Ratschläge, keine Heilversprechen.
Antworte nur mit JSON in dieser Form:
{"days":[{"items":[{"id":"...","why":"..."}]}],"reasons":["..."]}`;

function validate(ai, sk, a) {
  const days = sk.days.map((d, di) => {
    const used = [];
    const items = d.items.map((slot, si) => {
      const got = ai?.days?.[di]?.items?.[si];
      let id = got && slot.options.includes(got.id) && !used.includes(got.id) ? got.id : slot.id;
      if (used.includes(id)) id = slot.id;
      used.push(id);
      let why = typeof got?.why === "string" && got.id === id ? got.why.trim() : "";
      if (!why || why.split(/\s+/).length > 60) why = ruleWhy(id, a);
      return { id, sets: slot.sets, why };
    });
    return { name: d.name, items };
  });
  const reasons = Array.isArray(ai?.reasons) && ai.reasons.length ? ai.reasons.slice(0, 5).map(String) : ruleReasons(a, sk.rest, sk.split);
  return { days, rest: sk.rest, reasons, split: sk.split, created: new Date().toISOString(), source: "ki" };
}

export async function POST(req) {
  let a;
  try {
    a = (await req.json()).answers;
  } catch {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const missing = Object.keys(Q).filter((k) => !validAnswer(k, a?.[k]));
  if (missing.length) return Response.json({ error: "Es fehlen Antworten.", missing }, { status: 400 });

  // Ohne API-Schlüssel: Regel-Logik (Prototyp-Modus)
  if (!process.env.ANTHROPIC_API_KEY) return Response.json(rulePlan(a));

  const sk = skeleton(a);
  const slots = sk.days.map((d, di) => ({
    tag: di + 1,
    name: d.name,
    slots: d.items.map((it) => ({ kategorie: it.cat, saetze: it.sets, erlaubt: it.options.map((id) => ({ id, name: EX[id].name, muskel: EX[id].muscle })) })),
  }));
  try {
    const client = new Anthropic();
    const msg = await client.messages.create(
      {
        model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
        max_tokens: 3000,
        system: SYSTEM,
        messages: [{ role: "user", content: `Antworten der Person:\n${describeAnswers(a)}\n\nPlan-Gerüst:\n${JSON.stringify(slots)}` }],
      },
      { timeout: 25000 }
    );
    const text = msg.content.filter((c) => c.type === "text").map((c) => c.text).join("");
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    return Response.json(validate(json, sk, a));
  } catch (e) {
    console.error("plan generation failed", e?.message);
    return Response.json({ error: "Die KI hat gerade nicht geantwortet." }, { status: 502 });
  }
}
