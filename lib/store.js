"use client";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

/* Speichert immer im Browser. Ist NEXT_PUBLIC_CONVEX_URL gesetzt, zusätzlich in Convex. */
const KEY = "startfit-v1";
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url ? new ConvexHttpClient(url) : null;
const api = anyApi;

const freshSocial = () => ({ friends: [], requests: {}, chats: {}, visible: true, typing: null });
export const fresh = () => ({ consent: false, answers: {}, plan: null, sessions: [], shift: {}, failSim: false, sample: false, simPause: 0, buddy: null, social: freshSocial() });
const merge = (s) => ({ ...fresh(), ...s, social: { ...freshSocial(), ...(s.social || {}), typing: null } });

export function deviceId() {
  try {
    let id = localStorage.getItem(KEY + "-device");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(KEY + "-device", id); }
    return id;
  } catch { return "anon"; }
}

export function loadLocal() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === "object") return merge(s); } catch {}
  return fresh();
}

export async function loadRemote() {
  if (!client) return null;
  try {
    const r = await client.query(api.profiles.get, { deviceId: deviceId() });
    if (!r?.profile) return null;
    const { consent, answers, plan, shift, extra } = r.profile;
    return merge({ consent, answers, plan, shift: shift || {}, sessions: r.sessions, buddy: extra?.buddy || null, social: extra?.social });
  } catch (e) { console.warn("Convex nicht erreichbar", e); return null; }
}

export function saveAll(S) {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  if (client && !S.sample) {
    client.mutation(api.profiles.save, { deviceId: deviceId(), consent: S.consent, answers: S.answers, plan: S.plan, shift: S.shift, extra: { buddy: S.buddy, social: { ...S.social, typing: null } } })
      .catch((e) => console.warn("Speichern in Convex fehlgeschlagen", e));
  }
}

export function pushSession(session, sample) {
  if (client && !sample) client.mutation(api.profiles.addSession, { deviceId: deviceId(), ...session }).catch((e) => console.warn(e));
}

export function wipeAll() {
  try { localStorage.removeItem(KEY); } catch {}
  if (client) client.mutation(api.profiles.wipe, { deviceId: deviceId() }).catch((e) => console.warn(e));
}
