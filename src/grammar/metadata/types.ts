export type Person = 1 | 2 | 3;
export type NumberValue = "singular" | "plural";
export type Tense = "present" | "past" | "perfect";
export type Countability = "countable" | "uncountable";
export type Gender = "de" | "het";
export type ClauseType = "main" | "fronted_time" | "subordinate" | "question";

export type GrammarIntentType =
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

export type DutchModalInfinitive =
  | "kunnen"
  | "moeten"
  | "willen"
  | "mogen"
  | "zullen"
  | "hoeven"
  | "durven";

export interface GrammarSubject {
  pronoun: string;
  english: string;
  person: Person;
  number: NumberValue;
  formality?: "formal" | "informal" | "both";
  semanticType?: "person" | "group" | "animal" | "thing";
}

export interface GrammarVerb {
  infinitive: string;
  tense: Tense;
  auxiliary?: "hebben" | "zijn";
  isModal?: boolean;
  modalInfinitive?: DutchModalInfinitive;
}

export interface GrammarNoun {
  word: string;
  gender: Gender;
  countability: Countability;
  articleAllowed: boolean;
  article?: "de" | "het" | "een";
  plural?: string;
  english?: string;
}

export interface GrammarLocation {
  noun: GrammarNoun;
  preposition: string;
  english: string;
}

export interface GrammarClause {
  type: ClauseType;
  inversionRequired: boolean;
  conjunction?: string;
}

export interface GrammarIntent {
  grammarType: GrammarIntentType;
  subject: GrammarSubject;
  verb: GrammarVerb;
  object?: GrammarNoun;
  location?: GrammarLocation;
  negation?: boolean;
  clause?: GrammarClause;
  adverb?: { english: string; dutch: string };
}
