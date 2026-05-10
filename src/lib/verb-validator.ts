/**
 * Verb Validator
 * 
 * Detects verb conjugation errors in Dutch
 * - Wrong conjugation for subject (ik ben vs ik zijn)
 * - Wrong auxiliary in perfect tense
 * - Missing past participle
 * - Wrong participle form
 */

import { BaseValidator, ValidatorConfig } from './base-validator';
import { GrammarError, GrammarMetadata } from './grammar-types';
import { tokenizeNormalized, stripPunctuation } from './grammar-tokenizer';
import { normalizeAnswer } from './grammar-normalization';
import {
  getVerbMetadata,
  getConjugation,
  isModalVerb,
  isAuxiliaryVerb,
  getPerfectAuxiliary,
  getParticiple
} from './verb-database';
import { buildExplanation } from './grammar-explanations';

const SUBJECTS = ['ik', 'jij', 'je', 'hij', 'zij', 'het', 'wij', 'wij', 'jullie', 'u', 'ze'];
const AUXILIARIES = ['ben', 'bent', 'is', 'zijn', 'heb', 'hebt', 'heeft', 'hebben', 'was', 'waren', 'had', 'hadden'];

export class VerbValidator extends BaseValidator {
  constructor(config?: Partial<ValidatorConfig>) {
    super({
      name: 'verb_validator',
      category: 'verbs',
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

    // Extract subject (usually first token)
    const subject = userTokens[0];
    const expectedSubject = expectedTokens[0];

    if (!SUBJECTS.includes(subject.toLowerCase())) {
      return errors; // Can't validate without subject
    }

    // Check for perfect tense structure
    const perfectErrors = this.validatePerfectTense(userTokens, expectedTokens, subject);
    errors.push(...perfectErrors);

    // Check verb conjugations
    if (!perfectErrors.some(e => e.priority === 1)) {
      // Only check if no critical perfect tense errors
      const conjugationErrors = this.validateConjugations(userTokens, expectedTokens, subject);
      errors.push(...conjugationErrors);
    }

    return errors.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Validate perfect tense structure (auxiliary + participle)
   */
  private validatePerfectTense(
    userTokens: string[],
    expectedTokens: string[],
    subject: string
  ): GrammarError[] {
    const errors: GrammarError[] = [];

    // Check if expected is perfect tense (has auxiliary + participle)
    if (expectedTokens.length < 3) {
      return errors; // Not perfect tense
    }

    const expectedAux = expectedTokens[1];
    const userAux = userTokens[1];

    if (!AUXILIARIES.includes(expectedAux)) {
      return errors; // Expected not perfect tense
    }

    // Expected is perfect tense - check user answer
    if (AUXILIARIES.includes(userAux)) {
      // User tried perfect tense

      if (userAux !== expectedAux) {
        // Wrong auxiliary
        const infinitive = this.extractInfinitive(expectedTokens);
        const correctAux = expectedAux;
        const auxVerb = this.getAuxiliaryBaseForm(correctAux);

        const error = this.createError(
          'perfect_wrong_auxiliary',
          `Wrong auxiliary: use "${correctAux}" not "${userAux}" for this verb`,
          userAux,
          correctAux,
          1
        );
        error.explanation = buildExplanation('perfect_wrong_auxiliary', {
          verb: infinitive || '(verb)',
          userAux,
          correctAux
        });
        errors.push(error);
      }

      // Check participle
      if (userTokens.length > 2) {
        const userParticiple = userTokens[userTokens.length - 1];
        const expectedParticiple = expectedTokens[expectedTokens.length - 1];

        if (userParticiple !== expectedParticiple && !this.areSimilar(userParticiple, expectedParticiple, 1)) {
          const error = this.createError(
            'perfect_wrong_participle',
            `Wrong participle: "${expectedParticiple}" not "${userParticiple}"`,
            userParticiple,
            expectedParticiple,
            1
          );
          error.explanation = buildExplanation('perfect_wrong_participle', {
            verb: this.extractInfinitive(expectedTokens) || '(verb)',
            userPart: userParticiple,
            correctPart: expectedParticiple
          });
          errors.push(error);
        }
      }
    } else if (!isAuxiliaryVerb(userAux)) {
      // User didn't use auxiliary, but expected does
      const error = this.createError(
        'perfect_missing_auxiliary',
        `Perfect tense needs: [Subject] + [Auxiliary] + [Participle]`,
        userAux,
        expectedAux,
        1
      );
      error.explanation = buildExplanation('perfect_missing_auxiliary', {
        verb: this.extractInfinitive(expectedTokens) || '(verb)',
        aux: expectedAux
      });
      errors.push(error);
    }

    return errors;
  }

  /**
   * Validate present/past tense conjugations
   */
  private validateConjugations(
    userTokens: string[],
    expectedTokens: string[],
    subject: string
  ): GrammarError[] {
    const errors: GrammarError[] = [];

    if (userTokens.length < 2 || expectedTokens.length < 2) {
      return errors;
    }

    const userVerb = userTokens[1];
    const expectedVerb = expectedTokens[1];

    if (userVerb === expectedVerb) {
      return errors;
    }

    // Try to find the infinitive
    const infinitives = this.findVerbInfinitives([userVerb, expectedVerb]);

    for (const infinitive of infinitives) {
      const metadata = getVerbMetadata(infinitive);
      if (!metadata) continue;

      // Get correct conjugation for this subject
      const correctForm = getConjugation(infinitive, 'present', subject);

      if (correctForm && userVerb !== correctForm) {
        // Wrong conjugation
        const error = this.createError(
          'verb_wrong_conjugation',
          `For "${subject}", conjugate as "${correctForm}" not "${userVerb}"`,
          userVerb,
          correctForm,
          1
        );
        error.explanation = buildExplanation('verb_wrong_conjugation', {
          infinitive,
          userForm: userVerb,
          correctForm,
          subject
        });
        errors.push(error);
        break;
      }
    }

    return errors;
  }

  /**
   * Try to find infinitive form from conjugated or participle form
   */
  private findVerbInfinitives(forms: string[]): string[] {
    const infinitives: string[] = [];

    for (const form of forms) {
      // Try exact match in database
      if (getVerbMetadata(form)) {
        infinitives.push(form);
      }

      // Try removing ge- prefix and -t/-d suffix (common participles)
      if (form.startsWith('ge')) {
        const withoutGe = form.slice(2);
        if (getVerbMetadata(withoutGe)) {
          infinitives.push(withoutGe);
        }
      }

      // Try common verb stem guesses (this would be improved with a full lemmatizer)
      const stems = this.tryCommonStems(form);
      for (const stem of stems) {
        if (getVerbMetadata(stem)) {
          infinitives.push(stem);
        }
      }
    }

    return [...new Set(infinitives)]; // Remove duplicates
  }

  /**
   * Try common Dutch verb transformations
   */
  private tryCommonStems(form: string): string[] {
    const stems: string[] = [];

    // Remove -t/-d ending (3rd person singular or past)
    if (form.endsWith('t')) stems.push(form.slice(0, -1));
    if (form.endsWith('d')) stems.push(form.slice(0, -1));

    // Remove -te/-de ending (past tense)
    if (form.endsWith('te')) stems.push(form.slice(0, -2));
    if (form.endsWith('de')) stems.push(form.slice(0, -2));

    // Remove -en ending (infinitive suffix, sometimes doubled)
    if (form.endsWith('en')) stems.push(form.slice(0, -2));

    // Common irregular forms
    const irregularMappings: { [key: string]: string[] } = {
      'ben': ['zijn'],
      'bent': ['zijn'],
      'is': ['zijn'],
      'was': ['zijn'],
      'waren': ['zijn'],
      'heb': ['hebben'],
      'hebt': ['hebben'],
      'heeft': ['hebben'],
      'had': ['hebben'],
      'hadden': ['hebben']
    };

    if (irregularMappings[form]) {
      stems.push(...irregularMappings[form]);
    }

    return stems;
  }

  /**
   * Extract infinitive from a sentence's tokens
   */
  private extractInfinitive(tokens: string[]): string | undefined {
    // In perfect tense, infinitive is usually not present
    // Last token is participle, so check if it looks like infinitive
    if (tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      if (!lastToken.startsWith('ge')) {
        // Might be infinitive
        if (getVerbMetadata(lastToken)) {
          return lastToken;
        }
      }
    }
    return undefined;
  }

  /**
   * Get base infinitive form of auxiliary
   */
  private getAuxiliaryBaseForm(auxForm: string): string {
    const auxForms: { [key: string]: string } = {
      'ben': 'zijn', 'bent': 'zijn', 'is': 'zijn', 'zijn': 'zijn',
      'was': 'zijn', 'waren': 'zijn', 'geweest': 'zijn',
      'heb': 'hebben', 'hebt': 'hebben', 'heeft': 'hebben', 'hebben': 'hebben',
      'had': 'hebben', 'hadden': 'hebben', 'gehad': 'hebben'
    };
    return auxForms[auxForm] || auxForm;
  }

  explainError(error: GrammarError): string {
    if (error.explanation) return error.explanation;

    switch (error.type) {
      case 'verb_wrong_conjugation':
        return `Each subject pronoun in Dutch triggers a different verb form.`;

      case 'perfect_wrong_auxiliary':
        return `Most verbs use "hebben" in perfect tense, but movement verbs use "zijn".`;

      case 'perfect_wrong_participle':
        return `Regular participles end in -t or -d. Check if this verb is irregular.`;

      case 'perfect_missing_auxiliary':
        return `Perfect tense requires: subject + auxiliary (hebben/zijn) + past participle.`;

      default:
        return buildExplanation('unexpected_difference');
    }
  }
}

/**
 * Quick verb validation helper
 */
export function validateVerbs(
  userAnswer: string,
  expectedAnswer: string
): GrammarError[] {
  const validator = new VerbValidator();
  return validator.validate(userAnswer, expectedAnswer);
}
