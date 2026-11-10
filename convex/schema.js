import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  profiles: defineTable({
    deviceId: v.string(),
    consent: v.boolean(),
    answers: v.any(),
    plan: v.any(),
    shift: v.any(),
    updatedAt: v.number(),
  }).index("by_device", ["deviceId"]),
  sessions: defineTable({
    deviceId: v.string(),
    date: v.string(),
    day: v.number(),
    sets: v.array(v.object({ id: v.string(), reps: v.number(), kg: v.number() })),
    feel: v.union(v.string(), v.null()),
  }).index("by_device", ["deviceId"]),
});
