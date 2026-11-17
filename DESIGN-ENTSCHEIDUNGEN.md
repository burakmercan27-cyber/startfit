# Design- und Produktentscheidungen (für den Projektbericht)

Stand: 17.11.2026 · Prototyp v3. Grundlage: Vorlesung 6 (UX Design, Make it real) und Owner-Vorgaben der Gruppe.

## Was sich geändert hat und warum

| Änderung | Warum |
| --- | --- |
| **Buddy** (eigene Figur) wächst mit jedem Training: XP, Level, ab Level 3 Stirnband, ab Level 5 Schweißbänder und Stern | Owner-Vorgabe (Prinzip Pou/Tamagotchi). Motivation ist laut Interviews der Hauptgrund fürs Aufhören. |
| Buddy baut ab: ab 8 Tagen müde, ab 15 traurig, ab 22 schlapp. Farbe, Gesicht, Haltung und Energie-Balken ändern sich | „Wenn man mehr als 1-2 Wochen pausiert, geht es dem Character sichtlich schlechter.“ Erste Woche bleibt bewusst neutral, damit normale Ruhetage nicht bestraft werden. |
| Buddy als menschliche Comic-Figur statt Fantasie-Wesen; anpassbar: Name, Hautton (4), Frisur (4), Haarfarbe (4), Shirt (4). Demo-Personen nutzen dieselbe Figur als Profilbild | Owner-Feedback: „Buddy sollte menschlicher aussehen“. Bewusst wenige Optionen, damit das Onboarding kurz bleibt; jederzeit im Profil änderbar. Stärke zeigt sich über Statur, Stirnband, Schweißbänder und Pose. |
| Skins nur als gesperrte Vorschau | Owner: „Später Skins, zu Beginn einfach halten.“ |
| **Freunde**: Partner finden (sortiert nach Trainingszeit, Ort, Ziel), Anfrage senden, Chat, „Zusammen trainieren“-Einladung zu einem Training aus dem eigenen Plan | Owner-Vorgabe. Matching nutzt die Onboarding-Antworten, damit Partner zum Plan passen. |
| **Coach** als Vorschau mit Beispielantworten, klar gekennzeichnet | Owner: KI erst später verbinden. Vorlesung: „Say it's AI“, Erwartungen ehrlich setzen. |
| Untere Navigation mit 5 Tabs: Start, Plan, Coach, Freunde, Profil | Jakob's Law, max. 5 Tabs (Folie „Don't reinvent“). |
| Startseite: Buddy oben, dann *eine* Hauptaktion „Training starten“ | Hierarchie und „Less is more“: eine Hauptaktion pro Screen. |
| 1 Schrift (Nunito), 1 Akzentfarbe (Grün) nur für Aktionen, Abstände 4/8/12/16/24/32 | Folie „Better UI with AI: fix your style“. Status-Farben (gelb, rot) nur für Buddy-Stimmung. |
| Alle Bildschirme haben die 4 Zustände: leer, lädt, Fehler, Erfolg | Folie „The details AI usually forgets“. Beispiele: „Noch keine Freunde“, Plan wird erstellt, Plan-Fehler mit Ausweg, Erfolgsseite mit XP. |
| Rückmeldung mit „Rückgängig“ (Anfrage, Freund entfernen), Abbrechen-Bestätigung im Training | Heuristik 3 „Let users undo“ und 1 „Show what's happening“. |
| Hilfe direkt am Ort: „Was bedeutet 3 × 8-12 Wdh.?“ | Heuristik 10 „Help when needed“. |
| Datenschutzerklärung, Impressum, Einwilligung mit Link | Sicherheits-Checkliste der Vorlesung. Platzhalter in [Klammern] vor dem Test ausfüllen. |
| Partnersuche: nur Vorname, Ziel, Zeit, Ort; Sichtbarkeit abschaltbar | Datenminimierung (DSGVO). Hinweis „Trefft euch an öffentlichen Orten“. |
| Testhilfen im Profil: Pause simulieren, Plan-Fehler simulieren | Damit Buddy-Zustände und Unhappy Path in Demo und Usability-Test zeigbar sind. |

## Bewusst noch nicht umgesetzt

- **Login** (E-Mail + Passwort laut Vorlesung „Start here“): nötig, sobald echte Nutzer sich gegenseitig finden. Bis dahin Demo-Profile.
- **Echte KI** im Coach und bei der Planerstellung: Code ist vorbereitet (`app/api`), Schlüssel kommt in die Umgebungsvariablen.
- **Skins, Videos**: später.

## Vorschlag Usability-Test (3-5 Einsteiger)

1. *5-Sekunden-Test* Startseite: Was ist das? Was macht der Buddy?
2. *Aufgabe*: „Starte dein nächstes Training und hake 2 Sätze ab.“
3. *Aufgabe*: „Finde jemanden, der abends im Studio trainiert, und lade ihn ein.“
4. *Preference*: Buddy-Pause-Zustände zeigen: motivierend oder nervig?
