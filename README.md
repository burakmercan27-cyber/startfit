# BuddyFit

Fitness-App für Einsteiger: 5 Fragen, ein begründeter Trainingsplan, ein Buddy, der mit jedem Training wächst, und Trainingspartner in der Nähe.
Design- und Produktentscheidungen: siehe `DESIGN-ENTSCHEIDUNGEN.md`.
Prototyp im Modul AI Product Development & Management (THM, WS 2026/27). Anforderungen: siehe PRD v1.

## Was die App kann

| Bereich | Stand |
| --- | --- |
| Hinweis (Arzt, Datenschutz), Onboarding mit 5 Fragen | fertig |
| Plan nach Ziel, Erfahrung, Zeit, Ort, Arbeit, Trainingszeit | fertig (KI oder Regel-Logik) |
| „Warum“ pro Übung und für den ganzen Plan | fertig |
| Übungsseite mit Ausführung und häufigen Fehlern | fertig, Videos sind Platzhalter |
| Training abhaken, Check-in, Fortschritt | fertig |
| Tipp-Check (Mythen-Check) | fertig, braucht API-Schlüssel |
| Unhappy Paths: fehlende Antwort, KI-Fehler, Abbruch | fertig |
| Login | noch nicht (Daten hängen an einer Geräte-ID) |

Die KI wählt nur Übungen aus der kuratierten Liste in `lib/exercises.js`. Jede Antwort wird geprüft (`app/api/plan/route.js`); passt sie nicht, greift die Regel-Logik aus `lib/plan.js`.

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Schlüssel eintragen (optional)
npm run dev
```

Ohne `ANTHROPIC_API_KEY` erstellt die App Pläne per Regel-Logik. Ohne `NEXT_PUBLIC_CONVEX_URL` speichert sie nur im Browser.

## Online stellen (Vercel + Convex)

1. **Convex:** auf convex.dev mit GitHub anmelden, Projekt anlegen. Unter *Settings → Deploy Keys* einen **Production Deploy Key** erzeugen.
2. **Vercel:** auf vercel.com mit GitHub anmelden, *Add New → Project*, dieses Repo importieren.
3. In Vercel unter *Settings → Environment Variables* eintragen:
   - `CONVEX_DEPLOY_KEY` = Deploy Key aus Schritt 1
   - `ANTHROPIC_API_KEY` = Schlüssel von console.anthropic.com
   - optional `ANTHROPIC_MODEL` (Standard: `claude-haiku-5-5`)
4. Neu deployen. Der Build-Befehl steht in `vercel.json`: Mit Deploy Key werden die Convex-Funktionen mit veröffentlicht und `NEXT_PUBLIC_CONVEX_URL` automatisch gesetzt.

API-Schlüssel nie in den Code schreiben, nur als Umgebungsvariable.

## Aufbau

```
app/page.jsx            Alle Bildschirme (Client)
app/api/plan/route.js   Plan per KI, mit Prüfung und Rückfallebene
app/api/myth/route.js   Tipp-Check per KI
lib/exercises.js        Kuratierte Übungen und Onboarding-Fragen
lib/plan.js             Regel-Logik, Dosierung, Begründungen
lib/store.js            Speichern im Browser und in Convex
convex/                 Datenbank-Schema und Funktionen
```
