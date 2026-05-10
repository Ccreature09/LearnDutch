/**
 * Grammar-Aware Validation System Types
 * 
 * Core TypeScript interfaces for the Dutch grammar validation engine.
 * Supports deterministic, rule-based grammar checking and educational feedback.
 */

/**
 * Grammar metadata for a sentence
 */
export interface GrammarMetadata {
  topic: string;
  subject?: string;
  verb?: string;
  noun?: string;
  tense?: 'present' | 'past' | 'perfect';
  hasArticle?: boolean;
  inverted?: boolean;
  auxiliaryVerb?: 'hebben' | 'zijn';
  participle?: string;
  modalVerb?: string;
}

/**
 * Single grammar error detected in user input
 */
export type GrammarErrorType =
  | 'article'
  | 'verb'
  | 'inversion'
  | 'tense'
  | 'negation'
  | 'modal'
  | 'separable_verb'
  | 'subject'
  | 'typo'
  | 'article_wrong_gender'
  | 'article_missing'
  | 'article_uncountable'
  | 'article_uncountable_no_article'
  | 'article_unexpected'
  | 'verb_wrong_conjugation'
  | 'verb_wrong_tense'
  | 'perfect_wrong_auxiliary'
  | 'perfect_wrong_participle'
  | 'perfect_missing_auxiliary'
  | 'inversion_required'
  | 'inversion_incorrect'
  | 'modal_wrong_form'
  | 'modal_wrong_order'
  | 'word_order_wrong'
  | 'extra_word'
  | 'missing_word'
  | 'negation_geen_vs_niet'
  | 'negation_placement'
  | 'typo_detected'
  | 'unexpected_difference';

export interface GrammarError {
  type: GrammarErrorType;
  priority: 1 | 2 | 3;
  userToken?: string;
  expectedToken?: string;
  position?: number;
  explanation: string;
  rule?: string;
  isCritical?: boolean;
}

/**
 * Complete validation result for a user's answer
 */
export interface ValidationResult {
  isCorrect: boolean;
  isClose: boolean;
  errors: GrammarError[];
  explanation?: string;
  detailedExplanations?: string[];
  category?: string;
  confidence?: number;
  userAnswer?: string;
  expectedAnswer?: string;
  matchScore?: number;
  errorCount?: number;
  hasErrors?: boolean;
  validatorResults?: { [key: string]: GrammarError[] };
  metadata?: GrammarMetadata;
}

/**
 * Metadata about Dutch nouns
 */
export interface NounMetadata {
  type: 'countable' | 'uncountable';
  gender: 'de' | 'het';
  articleAllowed: boolean;
  pluralForm?: string;
  usageNote?: string;
}

/**
 * Metadata about Dutch verbs
 */
export interface VerbMetadata {
  infinitive: string;
  conjugations: {
    present?: { [subject: string]: string };
    past?: { [subject: string]: string };
    perfect?: { [subject: string]: string };
  };
  isAuxiliary: boolean;
  isSeparable: boolean;
  separablePrefix?: string;
  perfectAuxiliary?: 'hebben' | 'zijn';
  infinitiveType?: 'bare' | 'te';
  requiredClauseConnector?: 'dat' | 'of';
  requiresDirectObject?: boolean;
  requiresObjectOrClause?: boolean;
  allowedComplements?: Array<'direct_object' | 'dat_clause' | 'of_clause' | 'quote' | 'naar_phrase' | 'te_infinitive'>;
  semanticSubjectTypes?: Array<'person' | 'group' | 'animal' | 'thing'>;
  semanticObjectTypes?: Array<'person' | 'object' | 'location' | 'activity' | 'clause'>;
  participle?: string;
  isModal?: boolean;
  usageNote?: string;
}

/**
 * Subject pronoun metadata
 */
export interface PronounMetadata {
  formality: 'formal' | 'informal' | 'both';
  number: 'singular' | 'plural';
  person: 1 | 2 | 3;
}

/**
 * Naturalness level of a sentence
 */
export type Naturalness = 'common' | 'formal' | 'archaic' | 'unnatural';

/**
 * User's grammar weaknesses
 */
export interface GrammarWeakness {
  [grammarTopic: string]: number;
}

/**
 * Configuration for a grammar validator
 */
export interface ValidatorConfig {
  categories: string[];
  enabled: boolean;
  priority: 1 | 2 | 3;
  options?: { [key: string]: unknown };
}

/**
 * Extended sentence type with grammar metadata
 */
export interface EnhancedSentence {
  english: string;
  dutch: string;
  accepted?: string[];
  hint: string;
  category: string;
  grammar?: GrammarMetadata;
  naturalness?: Naturalness;
}
