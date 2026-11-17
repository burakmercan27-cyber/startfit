import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Nutzer sehen nur ihre eigenen Daten: alles ist an eine zufällige Geräte-ID gebunden (Prototyp, noch ohne Login).
export const get = query({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    const profile = await ctx.db.query("profiles").withIndex("by_device", (q) => q.eq("deviceId", deviceId)).unique();
    const sessions = await ctx.db.query("sessions").withIndex("by_device", (q) => q.eq("deviceId", deviceId)).collect();
    return { profile, sessions: sessions.map(({ date, day, sets, feel }) => ({ date, day, sets, feel })) };
  },
});

export const save = mutation({
  args: { deviceId: v.string(), consent: v.boolean(), answers: v.any(), plan: v.any(), shift: v.any(), extra: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("profiles").withIndex("by_device", (q) => q.eq("deviceId", args.deviceId)).unique();
    const doc = { ...args, updatedAt: Date.now() };
    if (existing) await ctx.db.patch(existing._id, doc);
    else await ctx.db.insert("profiles", doc);
  },
});

export const addSession = mutation({
  args: {
    deviceId: v.string(),
    date: v.string(),
    day: v.number(),
    sets: v.array(v.object({ id: v.string(), reps: v.number(), kg: v.number() })),
    feel: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sessions", args);
  },
});

// DSGVO: alle Daten eines Geräts löschen
export const wipe = mutation({
  args: { deviceId: v.string() },
  handler: async (ctx, { deviceId }) => {
    for (const t of ["profiles", "sessions"]) {
      const rows = await ctx.db.query(t).withIndex("by_device", (q) => q.eq("deviceId", deviceId)).collect();
      for (const r of rows) await ctx.db.delete(r._id);
    }
  },
});
