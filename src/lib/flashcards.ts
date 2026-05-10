import { dutchLexicon } from "./dutch-lexicon";
import { conjugationRowsFromVerb } from "../grammar/conjugation/conjugator";
import {
  DeckType,
  Flashcard,
  FlashcardExtra,
  FlashcardGrade,
  FlashcardGroup,
  LexiconEntry
} from "./types";

const MODAL_VERBS = new Set(["kunnen", "mogen", "moeten", "willen", "zullen", "hoeven"]);
const DEMONSTRATIVES = new Set(["deze", "die", "dit", "dat"]);

export const FLASHCARD_GROUP_LABEL: Record<Exclude<FlashcardGroup, "all">, string> = {
  verbs: "Verbs",
  modal_verbs: "Modal Verbs",
  nouns: "Nouns",
  pronouns: "Pronouns",
  adjectives: "Adjectives",
  prepositions: "Prepositions",
  conjunctions: "Conjunctions",
  grammar_terms: "Grammar Terms",
  articles: "Articles",
  particles: "Particles",
  numerals: "Numerals",
  determiners: "Determiners",
  adverbs: "Adverbs",
  names: "Names",
  phrases: "Phrases",
  demonstratives: "Demonstratives"
};

const GRAMMAR_TERM_CARDS: Flashcard[] = [
  makeGrammarCard("grammar-inversion", "inversion", "woordvolgorde met werkwoord op plek 2", "Verb moves to second position after a fronted element.", ["word order", "inversion"]),
  makeGrammarCard("grammar-participle", "participle", "voltooid deelwoord", "Used in the perfect tense.", ["past participle"]),
  makeGrammarCard("grammar-auxiliary", "auxiliary verb", "hulpwerkwoord", "Hebben and zijn are the main auxiliaries.", ["auxiliary"]),
  makeGrammarCard("grammar-subordinate", "subordinate clause", "bijzin", "A clause introduced by dat, omdat, terwijl, etc.", ["subordinate"]),
  makeGrammarCard("grammar-finite", "finite verb", "persoonsvorm", "The conjugated verb form in the clause.", ["finite"]),
  makeGrammarCard("grammar-demonstrative", "demonstrative", "aanwijzend voornaamwoord", "This / that / these / those forms.", ["demonstrative"])
];

function makeGrammarCard(id: string, front: string, back: string, note: string, tags: string[]): Flashcard {
  return {
    id,
    type: "grammar_term",
    group: "grammar_terms",
    front,
    back,
    mastery: 0.35,
    queueDistance: 0,
    streak: 0,
    recentRatings: [],
    extra: {
      note,
      tags
    },
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: new Date().toISOString()
  };
}

function baseFlashcard(card: Pick<Flashcard, "id" | "type" | "group" | "front" | "back"> & Partial<Flashcard>): Flashcard {
  return {
    mastery: 0.4,
    queueDistance: 0,
    streak: 0,
    recentRatings: [],
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: new Date().toISOString(),
    ...card
  };
}

function groupForEntry(entry: LexiconEntry): FlashcardGroup {
  if (entry.verb) {
    return MODAL_VERBS.has(entry.verb.infinitive) ? "modal_verbs" : "verbs";
  }

  switch (entry.category) {
    case "noun":
      return "nouns";
    case "pronoun":
      return "pronouns";
    case "adjective":
      return "adjectives";
    case "preposition":
      return "prepositions";
    case "conjunction":
      return "conjunctions";
    case "article":
      return "articles";
    case "particle":
      return "particles";
    case "numeral":
      return "numerals";
    case "determiner":
      return DEMONSTRATIVES.has(entry.dutch.toLowerCase()) ? "demonstratives" : "determiners";
    case "adverb":
      return "adverbs";
    case "name":
      return "names";
    case "phrase":
      return "phrases";
    default:
      return "grammar_terms";
  }
}

function createFlashcardFromEntry(entry: LexiconEntry): Flashcard {
  const group = groupForEntry(entry);

  if (entry.noun) {
    const noun = entry.noun;
    return baseFlashcard({
      id: `noun-${noun.dutch}`,
      type: "noun",
      group,
      front: noun.english,
      back: `${noun.article} ${noun.dutch}${noun.plural ? ` · plural: ${noun.plural}` : ""}`,
      extra: {
        article: noun.article,
        gender: noun.gender,
        tags: [noun.article, noun.gender],
        note: noun.plural ? `Plural: ${noun.plural}` : undefined
      }
    });
  }

  if (entry.verb) {
    const verb = entry.verb;
    const conjugations = conjugationRowsFromVerb(verb);
    // Ensure the English front does not accidentally contain the Dutch infinitive
    let front = (verb.english || "").trim();
    try {
      const infRegex = new RegExp(`\\b${verb.infinitive}\\b`, "i");
      if (infRegex.test(front)) front = front.replace(infRegex, "").trim();
    } catch (e) {
      // If regex construction fails for any unusual infinitive, fallback silently
      front = front;
    }

    return baseFlashcard({
      id: `verb-${verb.infinitive}`,
      type: "verb",
      group,
      front: front || verb.english,
      back: verb.infinitive,
      extra: {
        modalVerb: MODAL_VERBS.has(verb.infinitive),
        irregular: MODAL_VERBS.has(verb.infinitive) || verb.infinitive === "zijn" || verb.infinitive === "hebben",
        conjugations,
        tags: [group, verb.auxiliary, verb.infinitive],
        note: `Past: ${verb.past.singular}/${verb.past.plural} · pp: ${verb.pastParticiple}`
      }
    });
  }

  return baseFlashcard({
    id: `${group}-${entry.dutch}`,
    type: entry.category,
    group,
    front: entry.english,
    back: entry.dutch,
    extra: {
      tags: [group],
      note: entry.note
    }
  });
}

function cloneCard(card: Flashcard): Flashcard {
  return {
    ...card,
    recentRatings: [...(card.recentRatings ?? [])],
    extra: card.extra ? { ...card.extra, conjugations: card.extra.conjugations ? [...card.extra.conjugations] : undefined, tags: card.extra.tags ? [...card.extra.tags] : undefined } : undefined
  };
}

function normalizeCardText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function cardContentKey(type: Flashcard["type"], front: string, back: string) {
  return `${type}|${normalizeCardText(front)}|${normalizeCardText(back)}`;
}

function inferGroupFromCardType(
  type: Flashcard["type"],
  front: string,
  extra?: FlashcardExtra
): FlashcardGroup {
  if (type === "grammar_term") return "grammar_terms";
  if (type === "verb") return extra?.modalVerb ? "modal_verbs" : "verbs";

  switch (type) {
    case "noun":
      return "nouns";
    case "pronoun":
      return "pronouns";
    case "adjective":
      return "adjectives";
    case "preposition":
      return "prepositions";
    case "conjunction":
      return "conjunctions";
    case "article":
      return "articles";
    case "particle":
      return "particles";
    case "numeral":
      return "numerals";
    case "determiner":
      return ["deze", "die", "dit", "dat"].includes(front.toLowerCase()) ? "demonstratives" : "determiners";
    case "adverb":
      return "adverbs";
    case "name":
      return "names";
    case "phrase":
      return "phrases";
    default:
      return "grammar_terms";
  }
}

export function createDefaultFlashcards(): Flashcard[] {
  return [...dutchLexicon.map((entry) => createFlashcardFromEntry(entry)), ...GRAMMAR_TERM_CARDS].map(cloneCard);
}

export function normalizeFlashcard(
  card: Partial<Flashcard> & Pick<Flashcard, "id" | "type" | "front" | "back">
): Flashcard {
  const extra = card.extra;
  const group = card.group ?? inferGroupFromCardType(card.type, card.front, extra);
  const recentRatings = Array.isArray(card.recentRatings) ? card.recentRatings : [];

  const result: Flashcard = {
    ...card,
    mastery: card.mastery ?? 0.4,
    queueDistance: card.queueDistance ?? 0,
    streak: card.streak ?? 0,
    recentRatings,
    easiness: card.easiness ?? 2.5,
    interval: card.interval ?? 0,
    repetitions: card.repetitions ?? 0,
    dueAt: card.dueAt ?? new Date().toISOString(),
    lastReviewedAt: card.lastReviewedAt,
    extra,
    group
  };

  // Defensive language-purity checks
  try {
    if (result.type === "verb" && result.front && result.back) {
      const backEsc = result.back.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(backEsc, "ig");
      if (re.test(result.front)) {
        result.front = result.front.replace(re, "").trim();
      }
    }

    if (result.type === "pronoun" && result.front && result.back) {
      const dutchPronouns = ["ik","jij","je","u","hij","zij","ze","het","wij","we","jullie","hen","hun","mij","jou","ons"];
      if (dutchPronouns.includes(result.front.toLowerCase())) {
        const tmp = result.front;
        result.front = result.back;
        result.back = tmp;
      }
    }
  } catch (e) {
    // Non-fatal: if anything goes wrong with purity checks, return normalized card unchanged
  }

  return result;
}

export function gradeFlashcard(card: Flashcard, grade: FlashcardGrade): Flashcard {
  const recentRatings = Array.isArray(card.recentRatings) ? card.recentRatings : [];
  const nextRatings = [...recentRatings, grade].slice(-5);
  const masteryDelta = {
    again: -0.18,
    hard: 0.05,
    good: 0.1,
    easy: 0.18
  }[grade];
  const nextMastery = Math.max(0, Math.min(1, (card.mastery ?? 0.4) + masteryDelta));
  const queueDistance = grade === "again" ? 1 : grade === "hard" ? 10 : grade === "good" ? 20 : 0;

  return {
    ...card,
    mastery: nextMastery,
    queueDistance,
    streak: grade === "again" ? 0 : (card.streak ?? 0) + 1,
    recentRatings: nextRatings,
    easiness: Math.max(1.3, (card.easiness ?? 2.5) + masteryDelta * 0.5),
    interval: queueDistance,
    repetitions: grade === "again" ? 0 : (card.repetitions ?? 0) + 1,
    dueAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString()
  };
}

export function cardBelongsToDeck(card: Flashcard, deck: DeckType) {
  if (deck === "all") return true;
  return card.group === deck;
}

export function mergeFlashcards(existingCards: Flashcard[], defaultCards: Flashcard[]) {
  const byId = new Map<string, Flashcard>();
  const byContent = new Map<string, Flashcard>();

  for (const card of defaultCards) {
    const normalized = normalizeFlashcard(card);
    byId.set(card.id, normalized);
    byContent.set(cardContentKey(normalized.type, normalized.front, normalized.back), normalized);
    byContent.set(cardContentKey(normalized.type, normalized.back, normalized.front), normalized);
  }

  for (const card of existingCards) {
    const defaultCard = byId.get(card.id) ?? byContent.get(cardContentKey(card.type, card.front, card.back));
    const normalized = defaultCard
      ? normalizeFlashcard({
          ...defaultCard,
          mastery: card.mastery,
          queueDistance: card.queueDistance,
          streak: card.streak,
          recentRatings: card.recentRatings,
          easiness: card.easiness,
          interval: card.interval,
          repetitions: card.repetitions,
          dueAt: card.dueAt,
          lastReviewedAt: card.lastReviewedAt
        })
      : normalizeFlashcard(card);
    byId.set(defaultCard?.id ?? card.id, normalized);
  }

  return [...byId.values()];
}

