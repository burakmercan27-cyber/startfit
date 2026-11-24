/* Kuratierte Übungsliste: die KI darf nur Übungen aus dieser Liste verwenden. */
export const EX = {
  beinpresse:{name:"Beinpresse",cat:"squat",loc:["gym"],muscle:"Oberschenkel und Gesäß",
    steps:["Rücken fest an die Lehne, Füße schulterbreit auf die Platte.","Schlitten entriegeln und langsam beugen, bis die Knie etwa 90° haben.","Über die ganze Fußsohle zurückdrücken, Knie nicht ganz durchstrecken."],
    errors:["Gesäß hebt sich vom Polster","Knie fallen nach innen"]},
  goblet:{name:"Goblet Squat",cat:"squat",loc:["db"],muscle:"Oberschenkel, Gesäß und Rumpf",
    steps:["Kurzhantel senkrecht vor der Brust halten, Füße etwas breiter als die Hüfte.","Hüfte nach hinten unten senken, Brust bleibt aufrecht.","So tief, wie es mit geradem Rücken geht, dann hochdrücken."],
    errors:["Fersen heben ab","Rücken rundet sich"]},
  kniebeuge:{name:"Kniebeuge",cat:"squat",loc:["none"],muscle:"Oberschenkel und Gesäß",
    steps:["Füße schulterbreit, Arme nach vorne strecken.","Wie auf einen Stuhl hinsetzen, Knie zeigen in Richtung Zehen.","Unten kurz halten, dann über die Fersen aufstehen."],
    errors:["Knie fallen nach innen","Oberkörper kippt weit nach vorne"]},
  ausfall:{name:"Ausfallschritt rückwärts",cat:"squat",loc:["none"],muscle:"Oberschenkel, Gesäß und Gleichgewicht",
    steps:["Aufrecht stehen, ein Bein großen Schritt nach hinten setzen.","Hinteres Knie Richtung Boden senken.","Über die vordere Ferse zurück in den Stand. Seiten abwechseln."],
    errors:["Vorderes Knie schiebt weit über die Zehen","Oberkörper fällt nach vorne"]},
  beinbeuger:{name:"Beinbeuger an der Maschine",cat:"hinge",loc:["gym"],muscle:"Oberschenkelrückseite",
    steps:["Polster knapp über die Fersen einstellen.","Fersen kontrolliert Richtung Gesäß ziehen.","Langsam zurück, ohne das Gewicht abzulegen."],
    errors:["Schwung aus der Hüfte","Zu schnelles Ablassen"]},
  rdl:{name:"Rumänisches Kreuzheben mit Kurzhanteln",cat:"hinge",loc:["db"],muscle:"Oberschenkelrückseite, Gesäß und unterer Rücken",
    steps:["Kurzhanteln vor den Oberschenkeln, Knie leicht gebeugt.","Hüfte nach hinten schieben, Hanteln nah am Bein nach unten führen.","Bei Dehnung hinten im Bein: Hüfte nach vorne, aufrichten."],
    errors:["Runder Rücken","Knie zu stark gebeugt (wird zur Kniebeuge)"]},
  bridge:{name:"Glute Bridge",cat:"hinge",loc:["none"],muscle:"Gesäß und Oberschenkelrückseite",
    steps:["Rückenlage, Füße hüftbreit aufgestellt.","Gesäß anspannen und Becken anheben, bis Knie, Hüfte und Schultern eine Linie bilden.","Oben 1 Sek. halten, langsam absenken."],
    errors:["Hohlkreuz statt Gesäß","Füße zu weit vom Körper"]},
  brustpresse:{name:"Brustpresse an der Maschine",cat:"push",loc:["gym"],muscle:"Brust, Schultern und Trizeps",
    steps:["Sitz so einstellen, dass die Griffe auf Brusthöhe sind.","Griffe nach vorne drücken, Schulterblätter bleiben am Polster.","Kontrolliert zurück bis kurz vor den Anschlag."],
    errors:["Schultern ziehen nach oben","Arme ganz durchgestreckt"]},
  schulterpresse:{name:"Schulterdrücken an der Maschine",cat:"push",loc:["gym"],muscle:"Schultern und Trizeps",
    steps:["Griffe auf Schulterhöhe einstellen.","Nach oben drücken, ohne ins Hohlkreuz zu gehen.","Langsam zurück auf Schulterhöhe."],
    errors:["Hohlkreuz","Gewicht fällt nach unten"]},
  khboden:{name:"Kurzhantel-Bodendrücken",cat:"push",loc:["db"],muscle:"Brust, Schultern und Trizeps",
    steps:["Rückenlage, Knie aufgestellt, Hanteln über der Brust.","Ellbogen etwa 45° zum Körper absenken, bis die Oberarme den Boden berühren.","Wieder nach oben drücken."],
    errors:["Ellbogen weit seitlich","Hanteln prallen auf"]},
  khschulter:{name:"Kurzhantel-Schulterdrücken im Sitzen",cat:"push",loc:["db"],muscle:"Schultern und Trizeps",
    steps:["Aufrecht sitzen, Hanteln auf Schulterhöhe.","Nach oben drücken, bis die Arme fast gestreckt sind.","Langsam zurück auf Schulterhöhe."],
    errors:["Hohlkreuz","Hanteln schlagen oben zusammen"]},
  liegestuetz:{name:"Liegestütz an erhöhter Fläche",cat:"push",loc:["none"],muscle:"Brust, Schultern und Trizeps",
    steps:["Hände schulterbreit auf Tisch, Bank oder Sofalehne.","Körper gerade wie ein Brett, Brust Richtung Kante senken.","Kräftig zurückdrücken. Je tiefer die Fläche, desto schwerer."],
    errors:["Hüfte hängt durch","Kopf schiebt nach vorne"]},
  stuhldips:{name:"Trizeps-Dips am Stuhl",cat:"push",loc:["none"],muscle:"Trizeps und vordere Schultern",
    steps:["Hände hinter dem Körper auf eine stabile Stuhlkante, Finger zeigen nach vorne.","Ellbogen nach hinten beugen und den Körper langsam absenken.","Zurück nach oben drücken. Mit gebeugten Knien ist es leichter."],
    errors:["Schultern ziehen zu den Ohren","Zu tief absenken"]},
  trizepskabel:{name:"Trizepsdrücken am Kabelzug",cat:"push",loc:["gym"],muscle:"Trizeps",
    steps:["Seil oder Stange oben greifen, Oberarme eng am Körper.","Unterarme nach unten strecken, bis die Arme gerade sind.","Langsam zurück, Ellbogen bleiben am Platz."],
    errors:["Ellbogen wandern nach vorne","Oberkörper drückt mit"]},
  seitheben:{name:"Seitheben mit Kurzhanteln",cat:"push",loc:["db","gym"],muscle:"seitliche Schultern",
    steps:["Aufrecht stehen, leichte Kurzhanteln neben dem Körper.","Arme leicht gebeugt seitlich bis auf Schulterhöhe heben.","Langsam absenken, nicht ablegen."],
    errors:["Mit Schwung arbeiten","Schultern zu den Ohren ziehen"]},
  latzug:{name:"Latzug",cat:"pull",loc:["gym"],muscle:"oberer Rücken und Bizeps",
    steps:["Griff etwas breiter als schulterbreit, Oberschenkel unter das Polster.","Stange zur oberen Brust ziehen, Brust bleibt aufrecht.","Langsam nach oben führen, bis die Arme gestreckt sind."],
    errors:["Weit nach hinten lehnen","Stange hinter den Nacken"]},
  kabelrudern:{name:"Rudern am Kabelzug",cat:"pull",loc:["gym"],muscle:"mittlerer Rücken und Bizeps",
    steps:["Aufrecht sitzen, Knie leicht gebeugt.","Griff zum Bauch ziehen, Schulterblätter zusammen.","Kontrolliert nach vorne lassen, Rücken bleibt gerade."],
    errors:["Mit dem Oberkörper schwingen","Schultern ziehen hoch"]},
  khrudern:{name:"Einarmiges Kurzhantel-Rudern",cat:"pull",loc:["db"],muscle:"Rücken und Bizeps",
    steps:["Eine Hand und ein Knie auf Bank oder Stuhl, Rücken gerade.","Hantel Richtung Hüfte ziehen, Ellbogen nah am Körper.","Langsam absenken. Seiten wechseln."],
    errors:["Oberkörper dreht auf","Ruckartiges Ziehen"]},
  superman:{name:"Rückenstrecker in Bauchlage",cat:"pull",loc:["none"],muscle:"unterer und oberer Rücken",
    steps:["Bauchlage, Arme nach vorne, Blick zum Boden.","Arme und Beine leicht anheben, 2 Sek. halten.","Langsam ablegen."],
    errors:["Kopf in den Nacken","Zu hoch und ruckartig"]},
  snowangel:{name:"Reverse Snow Angels",cat:"pull",loc:["none"],muscle:"oberer Rücken und hintere Schultern",
    steps:["Bauchlage, Arme neben dem Körper, Daumen nach oben.","Arme leicht anheben und im Halbkreis über den Kopf führen.","Auf gleichem Weg zurück."],
    errors:["Arme berühren den Boden","Hohlkreuz"]},
  bizepscurl:{name:"Bizepscurls mit Kurzhanteln",cat:"pull",loc:["db","gym"],muscle:"Bizeps",
    steps:["Aufrecht stehen, Kurzhanteln neben dem Körper, Handflächen nach vorne.","Unterarme beugen und die Hanteln Richtung Schultern führen.","Langsam absenken, Ellbogen bleiben am Körper."],
    errors:["Mit dem Oberkörper schwingen","Ellbogen nach vorne schieben"]},
  handtuchcurl:{name:"Handtuch-Curls mit Gegendruck",cat:"pull",loc:["none"],muscle:"Bizeps",unit:"sec",
    steps:["Ein Handtuch unter einen Fuß legen, Enden mit beiden Händen greifen.","Mit den Armen nach oben ziehen, der Fuß drückt dagegen.","Spannung halten, ruhig weiteratmen."],
    errors:["Luft anhalten","Rücken rundet sich"]},
  plank:{name:"Unterarmstütz (Plank)",cat:"core",loc:["none"],muscle:"Rumpf",unit:"sec",
    steps:["Unterarme unter den Schultern, Beine gestreckt.","Körper bildet eine gerade Linie, Bauch fest.","Ruhig weiteratmen und halten."],
    errors:["Hüfte hängt durch","Po zu hoch"]},
  deadbug:{name:"Dead Bug",cat:"core",loc:["none"],muscle:"tiefe Bauchmuskulatur",
    steps:["Rückenlage, Arme zur Decke, Knie über der Hüfte gebeugt.","Gegengleich einen Arm und ein Bein langsam strecken.","Unterer Rücken bleibt am Boden. Seiten abwechseln."],
    errors:["Rücken hebt ab","Zu schnell"]},
  hueftdehnung:{name:"Hüftbeuger-Dehnung im Kniestand",cat:"mobility",loc:["none"],muscle:"Hüftbeuger",unit:"side",
    steps:["Halber Kniestand, hinteres Knie auf einer weichen Unterlage.","Gesäß anspannen und Hüfte leicht nach vorne schieben.","Dehnung vorne in der Hüfte halten, ruhig atmen."],
    errors:["Ins Hohlkreuz ausweichen","Oberkörper kippt nach vorne"]},
  katzekuh:{name:"Katze-Kuh",cat:"mobility",loc:["none"],muscle:"Wirbelsäule",unit:"reps",
    steps:["Vierfüßlerstand, Hände unter den Schultern.","Beim Ausatmen den Rücken rund machen.","Beim Einatmen Brust nach vorne, Rücken leicht durchhängen lassen."],
    errors:["Zu schnell","Nur im unteren Rücken bewegen"]},
  bwsrotation:{name:"Brustwirbel-Rotation im Vierfüßlerstand",cat:"mobility",loc:["none"],muscle:"Brustwirbelsäule",unit:"side",
    steps:["Vierfüßlerstand, eine Hand an den Hinterkopf.","Ellbogen zur Decke aufdrehen, Blick folgt.","Zurück zur anderen Hand. Seiten wechseln."],
    errors:["Hüfte dreht mit","Schwung statt Kontrolle"]}
};

export const Q = {
  goal:{label:"Was ist dein Ziel?",desc:{muskel:"Kraft aufbauen und sichtbare Muskeln",abnehmen:"Fett verlieren und Muskeln erhalten",ausdauer:"Länger durchhalten, fitter im Alltag",fitness:"Beweglich, gesund, mehr Energie"},opts:{muskel:"Muskelaufbau",abnehmen:"Abnehmen",ausdauer:"Ausdauer",fitness:"Allgemeine Fitness"}},
  exp:{label:"Wie viel Erfahrung hast du?",desc:{nie:"Du startest bei null",unter6:"Erste Erfahrungen gesammelt",neustart:"Früher trainiert, jetzt Wiedereinstieg"},opts:{nie:"Nie trainiert",unter6:"Unter 6 Monate",neustart:"Neustart nach Pause"}},
  days:{label:"Wie viele Tage pro Woche?",range:[1,7,1],def:3,unit:(v)=>v==1?"Tag":"Tage"},
  mins:{label:"Wie lange pro Training?",range:[15,90,5],def:45,unit:()=>"Min."},
  loc:{label:"Wo trainierst du?",opts:{gym:"Fitnessstudio",none:"Zuhause ohne Geräte",db:"Zuhause mit Kurzhanteln"},
    desc:{gym:"Geräte, Hanteln und Kabelzug",none:"Nur mit deinem Körpergewicht",db:"Körpergewicht und ein paar Kurzhanteln"}},
  work:{label:"Wie arbeitest du?",desc:{sitzend:"Büro, Homeoffice, Studium",gemischt:"Verkauf, Labor, Pflege im Wechsel",schwer:"Handwerk, Lager, Bau"},opts:{sitzend:"Überwiegend sitzend",gemischt:"Stehend oder gemischt",schwer:"Körperlich schwer"}},
  time:{label:"Wann trainierst du meistens?",desc:{morgens:"Vor der Arbeit oder Uni",mittags:"In der Pause",abends:"Nach der Arbeit",wechselnd:"Schicht oder unregelmäßig"},opts:{morgens:"Morgens",mittags:"Mittags",abends:"Abends",wechselnd:"Wechselnd, z. B. Schicht"}},
  age:{label:"Wie alt bist du?",range:[16,80,1],def:25,unit:()=>"Jahre",optional:true}
};
export const STEPS = [
  {title:"Dein Ziel",keys:["goal"]},
  {title:"Deine Erfahrung",keys:["exp"]},
  {title:"Deine Zeit",keys:["days","mins"]},
  {title:"Dein Trainingsort",keys:["loc"]},
  {title:"Dein Alltag",keys:["work","time"]},
  {title:"Über dich",keys:["age"],body:true}
];

/* Muskelfokus für Split-Pläne */
export const FOCUS = {
  brustpresse:"brust", khboden:"brust", liegestuetz:"brust",
  schulterpresse:"schulter", khschulter:"schulter", seitheben:"schulter", snowangel:"schulter",
  stuhldips:"trizeps", trizepskabel:"trizeps",
  latzug:"ruecken", kabelrudern:"ruecken", khrudern:"ruecken", superman:"ruecken",
  bizepscurl:"bizeps", handtuchcurl:"bizeps",
};

/* Antwort als Text, z. B. für Profil und KI-Prompt */
export function answerText(k, v) {
  const q = Q[k];
  if (v === undefined || v === null || v === "") return "Keine Angabe";
  if (q.range) return `${v} ${q.unit(v)}`;
  return q.opts[v];
}
export function validAnswer(k, v) {
  const q = Q[k];
  if (v === undefined || v === null || v === "") return !!q.optional;
  if (q.range) { const n = +v; return Number.isFinite(n) && n >= q.range[0] && n <= q.range[1]; }
  return String(v) in q.opts;
}
