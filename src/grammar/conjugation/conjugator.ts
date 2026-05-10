import type { ConjugationTableRow, VerbEntry } from "../../lib/types";
import { GrammarSubject } from "../metadata/types";

const irregularPresent: Record<string, Record<string, string>> = {
  zijn: {
    "1s": "ben",
    "2s": "bent",
    "3s": "is",
    "1p": "zijn",
    "3p": "zijn"
  },
  hebben: {
    "1s": "heb",
    "2s": "hebt",
    "3s": "heeft",
    "1p": "hebben",
    "3p": "hebben"
  },
  kunnen: {
    "1s": "kan",
    "2s": "kunt",
    "3s": "kan",
    "1p": "kunnen",
    "3p": "kunnen"
  },
  moeten: {
    "1s": "moet",
    "2s": "moet",
    "3s": "moet",
    "1p": "moeten",
    "3p": "moeten"
  },
  willen: {
    "1s": "wil",
    "2s": "wilt",
    "3s": "wil",
    "1p": "willen",
    "3p": "willen"
  },
  mogen: {
    "1s": "mag",
    "2s": "mag",
    "3s": "mag",
    "1p": "mogen",
    "3p": "mogen"
  },
  zullen: {
    "1s": "zal",
    "2s": "zult",
    "3s": "zal",
    "1p": "zullen",
    "3p": "zullen"
  },
  hoeven: {
    "1s": "hoef",
    "2s": "hoeft",
    "3s": "hoeft",
    "1p": "hoeven",
    "3p": "hoeven"
  },
  durven: {
    "1s": "durf",
    "2s": "durft",
    "3s": "durft",
    "1p": "durven",
    "3p": "durven"
  },
  reizen: {
    "1s": "reis",
    "2s": "reist",
    "3s": "reist",
    "1p": "reizen",
    "3p": "reizen"
  },
  lopen: {
    "1s": "loop",
    "2s": "loopt",
    "3s": "loopt",
    "1p": "lopen",
    "3p": "lopen"
  },
  vertrekken: {
    "1s": "vertrek",
    "2s": "vertrekt",
    "3s": "vertrekt",
    "1p": "vertrekken",
    "3p": "vertrekken"
  },
  nemen: {
    "1s": "neem",
    "2s": "neemt",
    "3s": "neemt",
    "1p": "nemen",
    "3p": "nemen"
  },
  rijden: {
    "1s": "rij",
    "2s": "rijdt",
    "3s": "rijdt",
    "1p": "rijden",
    "3p": "rijden"
  },
  weten: {
    "1s": "weet",
    "2s": "weet",
    "3s": "weet",
    "1p": "weten",
    "3p": "weten"
  },
  zeggen: {
    "1s": "zeg",
    "2s": "zegt",
    "3s": "zegt",
    "1p": "zeggen",
    "3p": "zeggen"
  },
  horen: {
    "1s": "hoor",
    "2s": "hoort",
    "3s": "hoort",
    "1p": "horen",
    "3p": "horen"
  },
  geloven: {
    "1s": "geloof",
    "2s": "gelooft",
    "3s": "gelooft",
    "1p": "geloven",
    "3p": "geloven"
  },
  hopen: {
    "1s": "hoop",
    "2s": "hoopt",
    "3s": "hoopt",
    "1p": "hopen",
    "3p": "hopen"
  },
  vrezen: {
    "1s": "vrees",
    "2s": "vreest",
    "3s": "vreest",
    "1p": "vrezen",
    "3p": "vrezen"
  },
  zien: {
    "1s": "zie",
    "2s": "ziet",
    "3s": "ziet",
    "1p": "zien",
    "3p": "zien"
  },
  begrijpen: {
    "1s": "begrijp",
    "2s": "begrijpt",
    "3s": "begrijpt",
    "1p": "begrijpen",
    "3p": "begrijpen"
  },
  onthouden: {
    "1s": "onthoud",
    "2s": "onthoudt",
    "3s": "onthoudt",
    "1p": "onthouden",
    "3p": "onthouden"
  },
  lezen: {
    "1s": "lees",
    "2s": "leest",
    "3s": "leest",
    "1p": "lezen",
    "3p": "lezen"
  },
  denken: {
    "1s": "denk",
    "2s": "denkt",
    "3s": "denkt",
    "1p": "denken",
    "3p": "denken"
  }
  ,
  worden: {
    "1s": "word",
    "2s": "wordt",
    "3s": "wordt",
    "1p": "worden",
    "3p": "worden"
  },
  gaan: {
    "1s": "ga",
    "2s": "gaat",
    "3s": "gaat",
    "1p": "gaan",
    "3p": "gaan"
  },
  komen: {
    "1s": "kom",
    "2s": "komt",
    "3s": "komt",
    "1p": "komen",
    "3p": "komen"
  },
  doen: {
    "1s": "doe",
    "2s": "doet",
    "3s": "doet",
    "1p": "doen",
    "3p": "doen"
  },
  maken: {
    "1s": "maak",
    "2s": "maakt",
    "3s": "maakt",
    "1p": "maken",
    "3p": "maken"
  },
  geven: {
    "1s": "geef",
    "2s": "geeft",
    "3s": "geeft",
    "1p": "geven",
    "3p": "geven"
  },
  vinden: {
    "1s": "vind",
    "2s": "vindt",
    "3s": "vindt",
    "1p": "vinden",
    "3p": "vinden"
  },
  blijven: {
    "1s": "blijf",
    "2s": "blijft",
    "3s": "blijft",
    "1p": "blijven",
    "3p": "blijven"
  },
  laten: {
    "1s": "laat",
    "2s": "laat",
    "3s": "laat",
    "1p": "laten",
    "3p": "laten"
  },
  staan: {
    "1s": "sta",
    "2s": "staat",
    "3s": "staat",
    "1p": "staan",
    "3p": "staan"
  },
  zitten: {
    "1s": "zit",
    "2s": "zit",
    "3s": "zit",
    "1p": "zitten",
    "3p": "zitten"
  },
  liggen: {
    "1s": "lig",
    "2s": "ligt",
    "3s": "ligt",
    "1p": "liggen",
    "3p": "liggen"
  },
  werken: {
    "1s": "werk",
    "2s": "werkt",
    "3s": "werkt",
    "1p": "werken",
    "3p": "werken"
  },
  wonen: {
    "1s": "woon",
    "2s": "woont",
    "3s": "woont",
    "1p": "wonen",
    "3p": "wonen"
  },
  leven: {
    "1s": "leef",
    "2s": "leeft",
    "3s": "leeft",
    "1p": "leven",
    "3p": "leven"
  },
  spelen: {
    "1s": "speel",
    "2s": "speelt",
    "3s": "speelt",
    "1p": "spelen",
    "3p": "spelen"
  },
  praten: {
    "1s": "praat",
    "2s": "praat",
    "3s": "praat",
    "1p": "praten",
    "3p": "praten"
  },
  spreken: {
    "1s": "spreek",
    "2s": "spreekt",
    "3s": "spreekt",
    "1p": "spreken",
    "3p": "spreken"
  },
  luisteren: {
    "1s": "luister",
    "2s": "luistert",
    "3s": "luistert",
    "1p": "luisteren",
    "3p": "luisteren"
  },
  kijken: {
    "1s": "kijk",
    "2s": "kijkt",
    "3s": "kijkt",
    "1p": "kijken",
    "3p": "kijken"
  },
  eten: {
    "1s": "eet",
    "2s": "eet",
    "3s": "eet",
    "1p": "eten",
    "3p": "eten"
  },
  drinken: {
    "1s": "drink",
    "2s": "drinkt",
    "3s": "drinkt",
    "1p": "drinken",
    "3p": "drinken"
  },
  slapen: {
    "1s": "slaap",
    "2s": "slaapt",
    "3s": "slaapt",
    "1p": "slapen",
    "3p": "slapen"
  }
};

function subjectKey(subject: GrammarSubject): "1s" | "2s" | "3s" | "1p" | "3p" {
  if (subject.number === "plural") {
    return subject.person === 1 ? "1p" : "3p";
  }
  return (subject.person === 1 ? "1s" : subject.person === 2 ? "2s" : "3s");
}

export function conjugatePresent(infinitive: string, subject: GrammarSubject, inverted = false): string {
  const key = subjectKey(subject);
  const irregular = irregularPresent[infinitive];

  // Hard inversion rule: jij/je lose -t when they follow the finite verb.
  // Formal u keeps the normal finite verb form.
  if (inverted && subject.person === 2 && subject.number === "singular" && subject.formality !== "formal") {
    if (irregular?.["1s"]) return irregular["1s"];
    const stem = infinitive.endsWith("en") ? infinitive.slice(0, -2) : infinitive;
    return stem;
  }

  if (irregular?.[key]) return irregular[key];

  const stem = infinitive.endsWith("en") ? infinitive.slice(0, -2) : infinitive;
  if (subject.number === "plural") return infinitive;
  if (subject.person === 1) return stem;
  return `${stem}t`;
}

function conjugationCell(label: string, subject: GrammarSubject, infinitive: string): { label: string; form: string } {
  return { label, form: conjugatePresent(infinitive, subject) };
}

function conjugationRowsFromPresent(present: VerbEntry["present"]): ConjugationTableRow[] {
  return [
    {
      left: { label: "Ik", form: present.ik },
      right: { label: "Wij/We", form: present.wij }
    },
    {
      left: { label: "Jij/Je/U", form: present.jij },
      right: { label: "Jullie", form: present.jullie }
    },
    {
      left: { label: "Hij/Zij/Het", form: present.hij },
      right: { label: "Zij/Ze", form: present.zij }
    }
  ];
}

export function conjugationRowsFromVerb(verb: Pick<VerbEntry, "present">): ConjugationTableRow[] {
  return conjugationRowsFromPresent(verb.present);
}

/**
 * Return a compact present-tense table grouped the way the app displays it.
 */
export function presentConjugationTable(infinitive: string): ConjugationTableRow[] {
  return [
    {
      left: conjugationCell("Ik", { pronoun: "ik", english: "I", person: 1, number: "singular" }, infinitive),
      right: conjugationCell("Wij/We", { pronoun: "wij", english: "we", person: 1, number: "plural" }, infinitive)
    },
    {
      left: conjugationCell("Jij/Je/U", { pronoun: "jij", english: "you", person: 2, number: "singular" }, infinitive),
      right: conjugationCell("Jullie", { pronoun: "jullie", english: "you", person: 2, number: "plural" }, infinitive)
    },
    {
      left: conjugationCell("Hij/Zij/Het", { pronoun: "hij", english: "he", person: 3, number: "singular" }, infinitive),
      right: conjugationCell("Zij/Ze", { pronoun: "zij", english: "they", person: 3, number: "plural" }, infinitive)
    }
  ];
}

export function englishBe(subject: GrammarSubject): string {
  if (subject.person === 1 && subject.number === "singular") return "am";
  if (subject.person === 3 && subject.number === "singular") return "is";
  return "are";
}

/** Capitalized be-auxiliary for yes/no questions (avoids "Is I …?" / "Is we …?"). */
export function questionEnglishBe(subject: GrammarSubject): string {
  if (subject.english === "I") return "Am";
  if (subject.english === "he" || subject.english === "she" || subject.english === "it") return "Is";
  return "Are";
}

export function englishHave(subject: GrammarSubject): string {
  return subject.person === 3 && subject.number === "singular" ? "has" : "have";
}

export function englishModal(subject: GrammarSubject, modal: string): string {
  const sg3 = subject.person === 3 && subject.number === "singular";
  if (modal === "want to" && sg3) return "wants to";
  if (modal === "need to" && sg3) return "needs to";
  if (modal === "dare to" && sg3) return "dares to";
  if (modal === "have to" && sg3) return "has to";
  if (modal === "are allowed to") {
    if (subject.english === "I") return "am allowed to";
    if (subject.english === "he" || subject.english === "she" || subject.english === "it") return "is allowed to";
    return "are allowed to";
  }
  return modal;
}

export function englishDo(subject: GrammarSubject): string {
  return subject.person === 3 && subject.number === "singular" ? "Does" : "Do";
}

export function englishPresent(subject: GrammarSubject, base: string): string {
  if (!(subject.person === 3 && subject.number === "singular")) return base;
  if (base.endsWith("y")) return `${base.slice(0, -1)}ies`;
  if (base.endsWith("o") || base.endsWith("ch") || base.endsWith("sh") || base.endsWith("x") || base.endsWith("s")) {
    return `${base}es`;
  }
  return `${base}s`;
}
