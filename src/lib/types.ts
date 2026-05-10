export type PracticeCategory =
  | "zijn-have"
  | "negation"
  | "questions-inversion"
  | "modals"
  | "omdat-want"
  | "dat-clause"
  | "fronted-inversion"
  | "demonstratives"
  | "perfect-tense"
  | "terwijl-toen"
  | "numbers"
  | "transport-location";

export type Direction = "en-to-nl" | "nl-to-en";

export interface PracticeItem {
  id: string;
  category: PracticeCategory;
  direction: Direction;
  prompt: string;
  expected: string;
  accepted: string[];
  hint: string;
  grammarNote: string;
  grammar?: import("./grammar-types").GrammarMetadata;
}

export interface VerbEntry {
  infinitive: string;
  english: string;
  imperative: string;
  auxiliary: "hebben" | "zijn";
  present: {
    ik: string;
    jij: string;
    je?: string;
    u?: string;
    hij: string;
    het?: string;
    wij: string;
    we?: string;
    jullie: string;
    zij: string;
    ze?: string;
  };
  past: {
    singular: string;
    plural: string;
  };
  pastParticiple: string;
  perfect: string;
}

export interface NounEntry {
  dutch: string;
  english: string;
  article: "de" | "het";
  gender: "common" | "neuter";
  plural: string;
  thisForm: string;
  thatForm: string;
}

/** Word class shown in the unified reference panel. */
export type LexiconCategory =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "pronoun"
  | "article"
  | "particle"
  | "numeral"
  | "determiner"
  | "name"
  | "phrase";

/** Single searchable entry: nouns/verbs link full cards; others use gloss + note. */
export interface LexiconEntry {
  dutch: string;
  english: string;
  category: LexiconCategory;
  noun?: NounEntry;
  verb?: VerbEntry;
  note?: string;
}

export interface DrillQuestionResult {
  item: PracticeItem;
  userAnswer: string;
  correct: boolean;
}

export interface DrillLogEntry {
  id: string;
  completedAt: string;
  category: PracticeCategory | "all";
  questionCount: number;
  score: number;
  percentage: number;
}

export type FlashcardType = LexiconCategory | "grammar_term";
export type FlashcardGroup =
  | "all"
  | "verbs"
  | "modal_verbs"
  | "nouns"
  | "pronouns"
  | "adjectives"
  | "prepositions"
  | "conjunctions"
  | "grammar_terms"
  | "articles"
  | "particles"
  | "numerals"
  | "determiners"
  | "adverbs"
  | "names"
  | "phrases"
  | "demonstratives";
export type DeckType = FlashcardGroup;
export type FlashcardGrade = "again" | "hard" | "good" | "easy";

export interface ConjugationTableCell {
  label: string;
  form: string;
}

export interface ConjugationTableRow {
  left: ConjugationTableCell;
  right: ConjugationTableCell;
}

export interface FlashcardExtra {
  article?: "de" | "het";
  gender?: "common" | "neuter";
  irregular?: boolean;
  modalVerb?: boolean;
  pronounType?: "subject" | "unstressed" | "formal" | "plural" | "question";
  conjugations?: ConjugationTableRow[];
  tags?: string[];
  note?: string;
}

export interface Flashcard {
  id: string;
  type: FlashcardType;
  group: FlashcardGroup;
  front: string;
  back: string;
  mastery: number;
  queueDistance: number;
  streak: number;
  recentRatings: FlashcardGrade[];
  extra?: FlashcardExtra;
  easiness: number;
  interval: number;
  repetitions: number;
  dueAt: string;
  lastReviewedAt?: string;
}

export interface Feedback {
  type: "ok" | "close" | "bad";
  text: string;
  diffTokens?: {
    token: string;
    status: "correct" | "missing" | "extra" | "replace";
    actual?: string;
  }[];
  errorTypes?: import("./grammar-types").GrammarErrorType[];
  details?: {
    correctWord: string;
    yourWord: string;
    explanation: string;
  }[];
  inversionNote?: string;
}

