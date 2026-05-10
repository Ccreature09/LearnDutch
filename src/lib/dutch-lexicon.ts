import type { LexiconCategory, LexiconEntry, NounEntry, VerbEntry } from "./types";
import { nounReference, verbReference } from "./dutch-data";

/** Short labels for the reference sidebar (e.g. "Verb", "Noun"). */
export const LEXICON_CATEGORY_LABEL: Record<LexiconCategory, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  pronoun: "Pronoun",
  article: "Article",
  particle: "Particle",
  numeral: "Numeral",
  determiner: "Determiner",
  name: "Name",
  phrase: "Phrase"
};

const supplement: LexiconEntry[] = [
  { dutch: "ik", english: "I", category: "pronoun" },
  { dutch: "jij", english: "you (informal)", category: "pronoun" },
  { dutch: "je", english: "you (unstressed)", category: "pronoun" },
  { dutch: "u", english: "you (formal)", category: "pronoun" },
  { dutch: "hij", english: "he", category: "pronoun" },
  { dutch: "zij", english: "she / they", category: "pronoun" },
  { dutch: "ze", english: "they / she (unstressed)", category: "pronoun" },
  { dutch: "zij (pl)", english: "they (plural)", category: "pronoun", note: "formal/plural subject form" },
  { dutch: "ze (pl)", english: "they (plural, unstressed)", category: "pronoun", note: "unstressed plural subject form" },
  { dutch: "wij", english: "we", category: "pronoun" },
  { dutch: "we", english: "we (unstressed)", category: "pronoun" },
  { dutch: "jullie", english: "you (plural)", category: "pronoun" },
  { dutch: "wie", english: "who", category: "pronoun" },
  { dutch: "de", english: "the (common gender)", category: "article" },
  { dutch: "het", english: "the (neuter) / it", category: "article" },
  { dutch: "een", english: "a / an / one", category: "article" },
  { dutch: "deze", english: "this (de words)", category: "determiner" },
  { dutch: "die", english: "that (de words) / who", category: "determiner" },
  { dutch: "dit", english: "this (het words)", category: "determiner" },
  { dutch: "dat", english: "that (het words)", category: "determiner" },
  { dutch: "elke", english: "each / every", category: "determiner" },
  { dutch: "er", english: "there / it (dummy)", category: "particle", note: "e.g. er is, er zijn" },
  { dutch: "geen", english: "no / none", category: "determiner" },
  { dutch: "meer", english: "more", category: "determiner" },
  { dutch: "niet", english: "not", category: "particle" },
  { dutch: "wel", english: "indeed / does (contrast)", category: "particle" },
  { dutch: "naar", english: "to / towards", category: "preposition" },
  { dutch: "op", english: "on / at", category: "preposition" },
  { dutch: "in", english: "in / into", category: "preposition" },
  { dutch: "bij", english: "at / by / near", category: "preposition" },
  { dutch: "aan", english: "on / at (attached)", category: "preposition" },
  { dutch: "met", english: "with / by (means)", category: "preposition" },
  { dutch: "om", english: "at (time); for (om … te)", category: "preposition", note: "om 8 uur; om te + infinitive" },
  { dutch: "voor", english: "for / before", category: "preposition" },
  { dutch: "te", english: "to (infinitive) / too", category: "particle", note: "te + infinitive; te voet" },
  { dutch: "uit", english: "out / from", category: "preposition" },
  { dutch: "over", english: "over / about", category: "preposition" },
  { dutch: "onder", english: "under", category: "preposition" },
  { dutch: "door", english: "through / by", category: "preposition" },
  { dutch: "van", english: "of / from", category: "preposition" },
  { dutch: "tot", english: "until", category: "preposition" },
  { dutch: "zonder", english: "without", category: "preposition" },
  { dutch: "tussen", english: "between", category: "preposition" },
  { dutch: "want", english: "because (coord.)", category: "conjunction" },
  { dutch: "omdat", english: "because (subord.)", category: "conjunction" },
  { dutch: "dat", english: "that (subord.)", category: "conjunction" },
  { dutch: "terwijl", english: "while", category: "conjunction" },
  { dutch: "toen", english: "when / then (past)", category: "conjunction" },
  { dutch: "en", english: "and", category: "conjunction" },
  { dutch: "of", english: "or / whether", category: "conjunction" },
  { dutch: "maar", english: "but", category: "conjunction" },
  { dutch: "dus", english: "so / therefore", category: "conjunction" },
  { dutch: "Nederlands", english: "Dutch (language)", category: "name", note: "capitalized adjective used as noun" },
  { dutch: "Frans", english: "French (language)", category: "name" },
  { dutch: "Amsterdam", english: "Amsterdam", category: "name" },
  { dutch: "Nederland", english: "Netherlands", category: "name" },
  { dutch: "contant", english: "cash (in cash)", category: "adverb" },
  { dutch: "vroeg", english: "early", category: "adjective" },
  { dutch: "nodig", english: "necessary", category: "adjective", note: "nodig hebben" },
  { dutch: "lekker", english: "tasty / nice", category: "adjective" },
  { dutch: "zout", english: "salty", category: "adjective" },
  { dutch: "laat", english: "late", category: "adjective" },
  { dutch: "dicht", english: "closed", category: "adjective" },
  { dutch: "leeg", english: "empty", category: "adjective" },
  { dutch: "ziek", english: "ill", category: "adjective" },
  { dutch: "klaar", english: "ready / finished", category: "adjective" },
  { dutch: "snel", english: "fast / soon", category: "adjective" },
  { dutch: "moeilijk", english: "difficult", category: "adjective" },
  { dutch: "vakantie", english: "holiday", category: "noun", note: "met vakantie = on holiday" },
  { dutch: "euro", english: "euro (currency)", category: "noun" },
  { dutch: "slot", english: "lock (op slot)", category: "noun", note: "de deur op slot doen" },
  { dutch: "muziek", english: "music", category: "noun" },
  { dutch: "thuis", english: "at home", category: "adverb" },
  { dutch: "straks", english: "in a bit / soon", category: "adverb" },
  { dutch: "binnen", english: "inside", category: "adverb" },
  { dutch: "buiten", english: "outside", category: "adverb" },
  { dutch: "te voet", english: "on foot", category: "phrase" },
  { dutch: "met de trein", english: "by train", category: "phrase" },
  { dutch: "met vakantie", english: "on holiday", category: "phrase" },
  { dutch: "in de winter", english: "in winter", category: "phrase" },
  { dutch: "op maandag", english: "on Monday", category: "phrase" },
  { dutch: "elke week", english: "every week", category: "phrase" },
  { dutch: "maandag", english: "Monday", category: "noun" },
  { dutch: "twee", english: "two", category: "numeral" },
  { dutch: "acht", english: "eight", category: "numeral" },
  { dutch: "negen", english: "nine", category: "numeral" },
  { dutch: "tien", english: "ten", category: "numeral" },
  { dutch: "honderd", english: "hundred", category: "numeral" },
  { dutch: "duizend", english: "thousand", category: "numeral" },
  { dutch: "afgelopen", english: "last / past (weekend)", category: "adjective", note: "afgelopen weekend" },
  { dutch: "geannuleerd", english: "cancelled", category: "adjective", note: "past participle" },
  { dutch: "uitverkocht", english: "sold out", category: "adjective" },
  { dutch: "gestegen", english: "risen", category: "adjective", note: "past participle" },
  { dutch: "beloofd", english: "promised", category: "adjective", note: "past participle" },
  { dutch: "vergeten", english: "forgotten", category: "adjective", note: "also verb infinitive" },
  { dutch: "kwijt", english: "lost (missing)", category: "adjective", note: "kwijt zijn" },
  { dutch: "druk", english: "busy / crowded", category: "adjective" },
  { dutch: "muziek", english: "music", category: "noun" }
];


function verbSearchStrings(v: VerbEntry): string[] {
  const present = v.present;
  const out = [
    v.infinitive,
    v.imperative,
    v.english,
    v.pastParticiple,
    v.perfect,
    v.past.singular,
    v.past.plural,
    present.ik,
    present.jij,
    present.je ?? present.jij,
    present.u ?? present.jij,
    present.hij,
    present.het ?? present.hij,
    present.wij,
    present.we ?? present.wij,
    present.jullie,
    present.zij,
    present.ze ?? present.zij
  ];
  return out.filter(Boolean).map((s) => s.toLowerCase());
}

function nounSearchStrings(n: NounEntry): string[] {
  return [n.dutch, n.english, n.plural, n.thisForm, n.thatForm, n.article].filter(Boolean).map((s) => s.toLowerCase());
}

export function lexiconMatchesQuery(entry: LexiconEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (entry.dutch.toLowerCase().includes(q)) return true;
  if (entry.english.toLowerCase().includes(q)) return true;
  if (entry.note?.toLowerCase().includes(q)) return true;
  if (entry.verb && verbSearchStrings(entry.verb).some((s) => s.includes(q))) return true;
  if (entry.noun && nounSearchStrings(entry.noun).some((s) => s.includes(q))) return true;
  return false;
}

function buildDutchLexicon(): LexiconEntry[] {
  const byKey = new Map<string, LexiconEntry>();

  for (const n of nounReference) {
    const key = n.dutch.toLowerCase();
    byKey.set(key, { dutch: n.dutch, english: n.english, category: "noun", noun: n });
  }

  for (const v of verbReference) {
    const key = v.infinitive.toLowerCase();
    const existing = byKey.get(key);
    if (existing?.category === "noun") {
      byKey.set(`${key} (verb)`, {
        dutch: v.infinitive,
        english: v.english,
        category: "verb",
        verb: v,
        note: `Also a noun: ${existing.dutch} (${existing.english})`
      });
    } else {
      byKey.set(key, { dutch: v.infinitive, english: v.english, category: "verb", verb: v });
    }
  }

  for (const s of supplement) {
    const key = s.dutch.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, s);
    }
  }

  return [...byKey.values()].sort((a, b) => a.dutch.localeCompare(b.dutch, "nl"));
}

export const dutchLexicon: LexiconEntry[] = buildDutchLexicon();
