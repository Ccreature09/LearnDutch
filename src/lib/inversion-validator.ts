/**
 * Inversion Validator
 * 
 * Detects word order errors related to inversion in Dutch
 * - Subject-verb inversion after fronted time expressions
 * - Word order in subordinate clauses
 * - Verb position errors
 */

import { BaseValidator, ValidatorConfig } from './base-validator';
import { GrammarError, GrammarMetadata } from './grammar-types';
import { tokenizeNormalized, stripPunctuation, wordDistance } from './grammar-tokenizer';
import { normalizeAnswer } from './grammar-normalization';
import { buildExplanation } from './grammar-explanations';

// Adverbs/time expressions that trigger inversion
const INVERSION_TRIGGERS = [
  'toen', 'dan', 'daarna', 'later', 'eerder',
  'gisteren', 'vandaag', 'morgen', 'nu',
  'hier', 'daar', 'overal',
  'altijd', 'nooit', 'soms', 'meestal',
  'misschien', 'zeker'
];

// Words that introduce subordinate clauses (no inversion needed)
const SUBORDINATORS = [
  'dat', 'omdat', 'want', 'terwijl', 'toen', 'als', 'voor',
  'nadat', 'totdat', 'zolang', 'since', 'if'
];

export class InversionValidator extends BaseValidator {
  constructor(config?: Partial<ValidatorConfig>) {
    super({
      name: 'inversion_validator',
      category: 'inversion',
      ...config
    });
  }

  validate(
    userAnswer: string,
    expectedAnswer: string,
    metadata?: GrammarMetadata
  ): GrammarError[] {
    const errors: GrammarError[] = [];

    const userNorm = normalizeAnswer(userAnswer);
    const expectedNorm = normalizeAnswer(expectedAnswer);

    if (userNorm === expectedNorm) {
      return errors;
    }

    const userTokens = tokenizeNormalized(userAnswer);
    const expectedTokens = tokenizeNormalized(expectedAnswer);

    if (metadata?.inverted !== undefined) {
      const inverted = metadata.inverted;
      const userSecond = userTokens[1];
      const looksInverted = Boolean(userSecond && this.isFronted(userSecond));

      if (inverted && !looksInverted && userTokens.length >= 3) {
        const userPair = `${userTokens[1] ?? ""} ${userTokens[2] ?? ""}`.trim();
        const expectedPair = `${expectedTokens[1] ?? ""} ${expectedTokens[2] ?? ""}`.trim();
        errors.push(
          this.createError(
            "inversion_required",
            "Fronted elements require inversion in Dutch.",
            userPair,
            expectedPair,
            1
          )
        );
      }

      // Do not force an inversion-incorrect error from metadata=false alone;
      // regular declaratives like "zij is ..." are valid and have verb second.
    }

    // Check for inversion errors
    const inversionError = this.detectInversionError(userTokens, expectedTokens);
    if (inversionError) {
      inversionError.priority = 1; // Syntax errors are high priority
      errors.push(inversionError);
    }

    return errors;
  }

  /**
   * Detect if there's an inversion mistake
   */
  private detectInversionError(
    userTokens: string[],
    expectedTokens: string[]
  ): GrammarError | undefined {
    if (userTokens.length < 3 || expectedTokens.length < 3) {
      return undefined; // Too short to have inversion issues
    }

    // Check first token - is it a fronted adverb?
    const firstToken = userTokens[0];
    const expectedFirst = expectedTokens[0];

    const isFronted = INVERSION_TRIGGERS.includes(firstToken);
    const isInSubordinateExpected = SUBORDINATORS.includes(expectedFirst);

    if (!isFronted) {
      return undefined; // Normal word order expected
    }

    // Check if inversion is required
    if (isInSubordinateExpected) {
      // Subordinate clause - no inversion needed
      return undefined;
    }

    // Main clause with fronted adverb - check for inversion
    // Pattern: [Fronted] [Verb] [Subject] or [Fronted] [Subject] [Verb]
    const userSecond = userTokens[1];
    const expectedSecond = expectedTokens[1];

    const isUserInverted = this.isFronted(userSecond);
    const isExpectedInverted = this.isFronted(expectedSecond);

    // Check word order mismatch
    if (userTokens.length >= 3 && expectedTokens.length >= 3) {
      const userThird = userTokens[2];
      const expectedThird = expectedTokens[2];

      // If expected has inversion but user doesn't
      if (isExpectedInverted && !isUserInverted) {
        return this.createError(
          'inversion_required',
          `After fronted adverb "${firstToken}", verb must come before subject`,
          `${userSecond} ${userThird}`,
          `${expectedSecond} ${expectedThird}`,
          1
        );
      }

      // If user has inversion but expected doesn't (shouldn't happen but check)
      if (!isExpectedInverted && isUserInverted) {
        return this.createError(
          'inversion_incorrect',
          `No inversion needed here`,
          `${userSecond} ${userThird}`,
          `${expectedSecond} ${expectedThird}`,
          1
        );
      }
    }

    return undefined;
  }

  /**
   * Check if a word looks like a fronted element (verb or adverb)
   */
  private isFronted(token: string): boolean {
    // Common Dutch verbs that appear early
    const commonVerbs = [
      'ben', 'bent', 'is', 'zijn', 'was', 'waren',
      'heb', 'hebt', 'heeft', 'hebben', 'had', 'hadden',
      'kan', 'kunt', 'moet', 'wil', 'wilt',
      'kom', 'gaat', 'ga', 'gaan', 'ging'
    ];

    return commonVerbs.includes(token);
  }

  explainError(error: GrammarError): string {
    if (error.explanation) return error.explanation;

    switch (error.type) {
      case 'inversion_required':
        return `In Dutch, when you start a sentence with a time expression or adverb, the verb must come before the subject. Example: "Toen was ik student" not "Toen ik was student".`;

      case 'inversion_incorrect':
        return `In subordinate clauses (with dat, omdat, etc.), inversion is NOT used. The normal word order applies.`;

      default:
        return buildExplanation('word_order_wrong');
    }
  }
}

/**
 * Quick inversion validation helper
 */
export function validateInversion(
  userAnswer: string,
  expectedAnswer: string
): GrammarError[] {
  const validator = new InversionValidator();
  return validator.validate(userAnswer, expectedAnswer);
}

/**
 * Check if sentence has fronted adverb (for preprocessing)
 */
export function hasFrontedAdverb(sentence: string): boolean {
  const tokens = tokenizeNormalized(sentence);
  if (tokens.length === 0) return false;

  return INVERSION_TRIGGERS.includes(tokens[0]);
}

/**
 * Check if sentence is subordinate clause
 */
export function isSubordinateClause(sentence: string): boolean {
  const tokens = tokenizeNormalized(sentence);
  if (tokens.length === 0) return false;

  return SUBORDINATORS.includes(tokens[0]);
}
