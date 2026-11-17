import { Header } from "./ui";

/* Platzhalter in [eckigen Klammern] vor dem Test mit echten Nutzern ausfüllen. */
export function Privacy({ back }) {
  return (
    <div className="stack legal">
      <Header title="Datenschutz" onBack={back} />
      <h1>Datenschutzerklärung</h1>
      <p className="help small">StartFit ist ein Studienprojekt an der THM (Modul AI Product Development &amp; Management, WS 2026/27) und kein kommerzielles Angebot.</p>
      <h3>Wer ist verantwortlich?</h3>
      <p>Projektgruppe StartFit, [Namen der Gruppenmitglieder], [Postanschrift], [E-Mail-Adresse].</p>
      <h3>Welche Daten speichern wir?</h3>
      <ul className="bullets">
        <li>Deine Antworten aus dem Einstieg: Ziel, Erfahrung, Trainingszeit, Ort, Art der Arbeit</li>
        <li>Deinen Trainingsplan und deine Trainings: Sätze, Wiederholungen, Gewichte</li>
        <li>Den Namen und die Farbe deines Buddys</li>
        <li>Freundschaften und Nachrichten in der App</li>
      </ul>
      <p>Wir fragen keine Gesundheitsdaten, keinen Klarnamen und keine genaue Adresse ab.</p>
      <h3>Wofür?</h3>
      <p>Nur um dir einen passenden Plan zu erstellen, deinen Fortschritt zu zeigen und dich mit Trainingspartnern zu verbinden. Für unseren Projektbericht werten wir die Nutzung anonym aus.</p>
      <h3>Welche Dienste verarbeiten die Daten?</h3>
      <ul className="bullets">
        <li>Vercel Inc. (Hosting der App)</li>
        <li>Convex Inc. (Datenbank)</li>
        <li>Später: ein KI-Anbieter für den Coach. Wir informieren dich, bevor er aktiviert wird.</li>
      </ul>
      <h3>Wie lange?</h3>
      <p>Bis du deine Daten löschst, spätestens nach Ende des Projekts. Dann löschen wir alle Testdaten.</p>
      <h3>Wie lösche ich meine Daten?</h3>
      <p>Unter Profil → „Alle Daten löschen“. Du kannst uns auch per E-Mail schreiben. Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner Daten.</p>
    </div>
  );
}

export function Imprint({ back }) {
  return (
    <div className="stack legal">
      <Header title="Impressum" onBack={back} />
      <h1>Impressum</h1>
      <p>Angaben gemäß § 5 DDG</p>
      <p>[Vor- und Nachname der verantwortlichen Person]<br />[Straße und Hausnummer]<br />[PLZ und Ort]</p>
      <p>E-Mail: [E-Mail-Adresse]</p>
      <p className="muted small">Studienprojekt an der Technischen Hochschule Mittelhessen. Kein kommerzielles Angebot.</p>
    </div>
  );
}
