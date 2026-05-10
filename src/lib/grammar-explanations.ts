/**
 * Grammar Explanation System
 * 
 * Educational explanations for grammar errors
 * Teaches learners WHY they made mistakes, not just what they are
 */

import { GrammarError } from './grammar-types';

type Template = {
  message?: string | ((...args: string[]) => string);
  example?: string | ((...args: string[]) => string);
  tip?: string;
};

export const explanationTemplates: Record<string, Template> = {
  // ARTICLE ERRORS
  article_uncountable_no_article: {
    message: (noun: string) =>
      `"${noun}" is uncountable in Dutch, so it doesn't take an article.`,
    example: (article: string, noun: string) =>
      `Correct: "de ${noun}" or "${noun}", not "${article} ${noun}".`,
    tip: 'Uncountable nouns (like koffie, water, brood) cannot use "een".'
  },

  article_wrong_gender: {
    message: (noun: string, correctArticle: string, wrongArticle: string) =>
      `"${noun}" uses "${correctArticle}" (not "${wrongArticle}") in Dutch.`,
    example: (noun: string, correctArticle: string, wrongArticle: string) =>
      `Correct: "${correctArticle} ${noun}", not "${wrongArticle} ${noun}".`,
    tip: 'Dutch nouns have gender: use "de" or "het". Learning by heart helps!'
  },

  article_missing: {
    message: (noun: string, article: string) =>
      `"${noun}" needs an article "${article}" in this context.`,
    example: (noun: string, article: string) =>
      `Correct: "${article} ${noun}"`,
    tip: 'Countable nouns usually need an article (de, het, een) in Dutch.'
  },

  article_unexpected: {
    message: (article: string, noun: string) =>
      `Don't use "${article}" with "${noun}" here.`,
    example: (article: string, noun: string) =>
      `Correct: "${noun}" (without "${article}")`,
    tip: 'Some contexts allow noun without article, especially in lists.'
  },

  // VERB CONJUGATION ERRORS
  verb_wrong_conjugation: {
    message: (infinitive: string, userForm: string, correctForm: string, subject: string) =>
      `For "${subject}", the verb "${infinitive}" becomes "${correctForm}" (not "${userForm}").`,
    example: (correctForm: string, subject: string) =>
      `Correct: "${subject} ${correctForm}"`,
    tip: 'Each subject pronoun triggers a different verb ending in Dutch.'
  },

  verb_wrong_tense: {
    message: (verb: string, wrongTense: string, correctTense: string) =>
      `Use ${correctTense} tense, not ${wrongTense} tense, for "${verb}".`,
    example: () => `Check your tense choice in this sentence.`,
    tip: 'Perfect tense = auxiliary + past participle. Present tense = verb only.'
  },

  // PERFECT TENSE ERRORS
  perfect_wrong_auxiliary: {
    message: (verb: string, userAux: string, correctAux: string) =>
      `The verb "${verb}" uses "${correctAux}" in perfect tense, not "${userAux}".`,
    example: (correctAux: string, participle: string) =>
      `Correct: "${correctAux} ${participle}"`,
    tip: 'Most verbs use "hebben", but movement verbs (gaan, komen) use "zijn".'
  },

  perfect_wrong_participle: {
    message: (verb: string, userPart: string, correctPart: string) =>
      `The past participle of "${verb}" is "${correctPart}", not "${userPart}".`,
    example: (aux: string, correctPart: string) =>
      `Correct: "${aux} ${correctPart}"`,
    tip: 'Participles often start with "ge-". Regular verbs add "-t" or "-d" at the end.'
  },

  perfect_missing_auxiliary: {
    message: (verb: string, aux: string) =>
      `Perfect tense needs an auxiliary. Use "${aux}" + past participle.`,
    example: (aux: string, participle: string) =>
      `Correct: "${aux} ${participle}"`,
    tip: 'Structure: Subject + auxiliary (hebben/zijn) + main verb (past participle).'
  },

  // INVERSION ERRORS
  inversion_required: {
    message: (fronted: string) =>
      `The fronted element "${fronted}" requires verb-subject inversion.`,
    example: () => `Correct word order: [Fronted element] [Verb] [Subject] [Rest]`,
    tip: 'Time expressions and adverbs at sentence start trigger inversion in Dutch.'
  },

  inversion_incorrect: {
    message: () =>
      `This sentence doesn't need inversion here.`,
    example: () => `Check: Is there a fronted time expression or adverb?`,
    tip: 'Inversion only happens with certain fronted elements, not in subordinate clauses.'
  },

  // NEGATION ERRORS
  negation_geen_vs_niet: {
    message: (correction: string) =>
      `Use "${correction}" in this context.`,
    example: (correction: string, context: string) =>
      `Correct: "${correction}" + ${context}`,
    tip: 'Use "geen" for indefinite nouns and "niet" for verbs or definite nouns.'
  },

  negation_placement: {
    message: () =>
      `The negation word is in the wrong position.`,
    example: () => `Negation usually comes after verb in main clauses.`,
    tip: 'Word order for negation: Subject + Verb + NOT + Object'
  },

  // MODAL VERB ERRORS
  modal_wrong_form: {
    message: (modal: string, subject: string, userForm: string, correctForm: string) =>
      `For "${subject}", modal "${modal}" becomes "${correctForm}", not "${userForm}".`,
    example: (correctForm: string, subject: string, infinitive: string) =>
      `Correct: "${subject} ${correctForm} ${infinitive}"`,
    tip: 'Modal verbs (can, must, want) have irregular conjugations per person.'
  },

  modal_wrong_order: {
    message: () =>
      `Word order with modal: Modal verb + infinitive at the end.`,
    example: () => `[Subject] + [Modal] + [Object] + [Infinitive]`,
    tip: 'The main verb infinitive goes at the end of the clause with modals.'
  },

  // WORD ORDER / SYNTAX ERRORS
  word_order_wrong: {
    message: (word1: string, word2: string) =>
      `"${word1}" and "${word2}" are in the wrong order.`,
    example: () => `Try swapping these words.`,
    tip: 'Check Dutch word order rules for main vs. subordinate clauses.'
  },

  extra_word: {
    message: (word: string) =>
      `Remove the extra word: "${word}"`,
    example: () => `This word shouldn't be here.`,
    tip: 'Check if every word has a purpose in the sentence.'
  },

  missing_word: {
    message: (word: string) =>
      `Add the missing word: "${word}"`,
    example: () => `This word is needed in Dutch.`,
    tip: 'Compare with the expected sentence structure.'
  },

  // TYPOS / CLOSE MATCHES
  typo_detected: {
    message: (userWord: string, correctWord: string) =>
      `Did you mean "${correctWord}" instead of "${userWord}"?`,
    example: () => `Very close! Just fix this spelling.`,
    tip: 'This looks like a typo, not a grammar mistake.'
  },

  // GENERIC
  unexpected_difference: {
    message: () =>
      `This doesn't match the expected answer.`,
    example: () => `Compare your answer word-by-word.`,
    tip: 'Try again or ask your teacher for help.'
  }
};

/**
 * Build an explanation for a specific error
 */
export function buildExplanation(
  errorType: string,
  params: { [key: string]: string | undefined } = {}
): string {
  const template = explanationTemplates[errorType];
  if (!template) {
    const fallback = explanationTemplates.unexpected_difference?.message;
    if (typeof fallback === 'function') return fallback();
    return typeof fallback === 'string' ? fallback : 'Grammar error detected.';
  }

  try {
    const messages: string[] = [];

    // Main message
    if (template.message) {
      if (typeof template.message === 'function') {
        const args = Object.values(params).map(value => value ?? '');
        messages.push(template.message(...args));
      } else {
        messages.push(template.message);
      }
    }

    // Example (optional)
    if (template.example && params.showExample !== 'false') {
      const args = Object.values(params).map(value => value ?? '');
      const exampleText = typeof template.example === 'function'
        ? template.example(...args)
        : template.example;
      messages.push(`Example: ${exampleText}`);
    }

    // Tip (optional)
    if (template.tip && params.showTip !== 'false') {
      messages.push(`💡 ${template.tip}`);
    }

    return messages.join('\n');
  } catch (error) {
    if (typeof template.message === 'function') return template.message();
    return template.message || 'Grammar error detected.';
  }
}

/**
 * Quick message for a specific error type
 */
export function getQuickMessage(errorType: string, ...params: string[]): string {
  const template = explanationTemplates[errorType];
  if (!template?.message) return 'Grammar error detected.';

  try {
    return typeof template.message === 'function'
      ? template.message(...params)
      : template.message;
  } catch {
    return 'Grammar error detected.';
  }
}

/**
 * Get tip for error type
 */
export function getTip(errorType: string): string | undefined {
  return explanationTemplates[errorType]?.tip;
}

/**
 * Common explanation builders
 */
export const ExplanationBuilder = {
  /**
   * For article errors
   */
  article: (type: string, noun: string, article?: string, wrongArticle?: string) =>
    buildExplanation(`article_${type}`, { noun, article, wrongArticle }),

  /**
   * For verb errors
   */
  verb: (type: string, verb: string, subject?: string, correct?: string, wrong?: string) =>
    buildExplanation(`verb_${type}`, { verb, subject, correctForm: correct, userForm: wrong }),

  /**
   * For perfect tense errors
   */
  perfectTense: (type: string, verb: string, aux?: string, part?: string) =>
    buildExplanation(`perfect_${type}`, { verb, aux, correctAux: aux, participle: part }),

  /**
   * For word order errors
   */
  wordOrder: (word1?: string, word2?: string) =>
    buildExplanation('word_order_wrong', { word1, word2 }),

  /**
   * For negation errors
   */
  negation: (correction: string, context?: string) =>
    buildExplanation('negation_geen_vs_niet', { correction, context }),

  /**
   * For typos
   */
  typo: (userWord: string, correctWord: string) =>
    buildExplanation('typo_detected', { userWord, correctWord })
};
