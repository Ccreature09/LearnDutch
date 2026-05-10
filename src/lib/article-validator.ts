/**
 * Article Validator
 * 
 * Detects de/het/een article errors in Dutch
 * - Wrong article gender (de vs het)
 * - Article with uncountable nouns (een koffie → incorrect)
 * - Missing articles
 * - Unexpected articles
 */

import { BaseValidator, ValidatorConfig } from './base-validator';
import { GrammarError, GrammarMetadata } from './grammar-types';
import { tokenizeNormalized, stripPunctuation, findToken, tokenizeWithMetadata, Token } from './grammar-tokenizer';
import { normalizeAnswer } from './grammar-normalization';
import {
  getNounMetadata,
  isUncountable,
  getArticleForNoun,
  canHaveArticle,
  nounDatabase
} from './noun-database';
import { buildExplanation } from './grammar-explanations';

const ARTICLES = ['de', 'het', 'een'];

export class ArticleValidator extends BaseValidator {
  constructor(config?: Partial<ValidatorConfig>) {
    super({
      name: 'article_validator',
      category: 'articles',
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

    // If they match exactly, no article errors
    if (userNorm === expectedNorm) {
      return errors;
    }

    const userTokens = tokenizeNormalized(userAnswer);
    const expectedTokens = tokenizeNormalized(expectedAnswer);
    const userTokensMeta = tokenizeWithMetadata(userAnswer);

    if (metadata?.noun) {
      const expectedArticle = getArticleForNoun(metadata.noun) ?? undefined;
      const userArticle = userTokens.find((token) => ARTICLES.includes(token));

      if (metadata.hasArticle === false && userArticle) {
        const error = this.createError(
          "article_unexpected",
          `Unexpected article "${userArticle}" with "${metadata.noun}"`,
          userArticle,
          "(no article)",
          2
        );
        error.explanation = buildExplanation("article_unexpected", {
          article: userArticle,
          noun: metadata.noun
        });
        errors.push(error);
      }

      if (metadata.hasArticle !== false && expectedArticle && userArticle && userArticle !== expectedArticle) {
        const error = this.createError(
          "article_wrong_gender",
          `Wrong article: "${userArticle}" should be "${expectedArticle}"`,
          userArticle,
          expectedArticle,
          1
        );
        error.explanation = buildExplanation("article_wrong_gender", {
          noun: metadata.noun,
          correctArticle: expectedArticle,
          wrongArticle: userArticle
        });
        errors.push(error);
      }
    }

    // Check each position for article errors
    for (let i = 0; i < Math.min(userTokens.length, expectedTokens.length); i++) {
      const userToken = userTokens[i];
      const expectedToken = expectedTokens[i];

      // Check if comparing articles
      if (ARTICLES.includes(expectedToken)) {
        // User has an article
        if (ARTICLES.includes(userToken)) {
          if (userToken !== expectedToken) {
            // Wrong article gender
            const nextNoun = expectedTokens[i + 1] || expectedToken;
            const userNextNoun = userTokens[i + 1] || userToken;

            const nounMeta = getNounMetadata(nextNoun);
            if (nounMeta) {
              const error = this.createError(
                'article_wrong_gender',
                `Wrong article: "${userToken} ${userNextNoun}" should be "${expectedToken} ${nextNoun}"`,
                userToken,
                expectedToken,
                1
              );
              error.explanation = buildExplanation('article_wrong_gender', {
                noun: nextNoun,
                correctArticle: expectedToken,
                wrongArticle: userToken
              });
              errors.push(error);
            }
          }
        } else if (!ARTICLES.includes(userToken)) {
          // User missing article
          const noun = expectedTokens[i + 1] || expectedToken;
          const error = this.createError(
            'article_missing',
            `Missing article before "${noun}"`,
            '',
            expectedToken,
            2
          );
          error.explanation = buildExplanation('article_missing', {
            noun,
            article: expectedToken
          });
          errors.push(error);
        }
      }

      // Check if user has wrong article with uncountable noun
      if (userToken === 'een' && i + 1 < userTokens.length) {
        const possibleNoun = userTokens[i + 1];
        if (isUncountable(possibleNoun)) {
          const error = this.createError(
            'article_uncountable',
            `"${possibleNoun}" is uncountable, so don't use "een"`,
            'een',
            '(no article)',
            1
          );
          error.explanation = buildExplanation('article_uncountable_no_article', {
            noun: possibleNoun
          });
          errors.push(error);
          break; // Priority: this is a major mistake
        }
      }
    }

    // Check for extra articles
    if (userTokens.length > expectedTokens.length) {
      const extraTokens = userTokens.slice(expectedTokens.length);
      for (const token of extraTokens) {
        if (ARTICLES.includes(token)) {
          const nextIdx = userTokens.indexOf(token) + 1;
          const followingWord = userTokens[nextIdx] || '(end)';
          const error = this.createError(
            'article_unexpected',
            `Unexpected article "${token}" before "${followingWord}"`,
            token,
            '(no article)',
            2
          );
          error.explanation = buildExplanation('article_unexpected', {
            article: token,
            noun: followingWord
          });
          errors.push(error);
        }
      }
    }

    return errors.sort((a, b) => b.priority - a.priority);
  }

  explainError(error: GrammarError): string {
    if (error.explanation) return error.explanation;

    switch (error.type) {
      case 'article_wrong_gender':
        return `Wrong article. In Dutch, nouns have gender: use "de" or "het". Check your expected vs. user answer.`;

      case 'article_missing':
        return `Countable nouns need an article (de, het, or een) in Dutch.`;

      case 'article_uncountable':
        return `Uncountable nouns (like koffie, water, brood) cannot use "een".`;

      case 'article_unexpected':
        return `This article shouldn't be here.`;

      default:
        return buildExplanation('unexpected_difference');
    }
  }
}

/**
 * Quick article validation helper
 */
export function validateArticles(
  userAnswer: string,
  expectedAnswer: string
): GrammarError[] {
  const validator = new ArticleValidator();
  return validator.validate(userAnswer, expectedAnswer);
}

/**
 * Check if noun is properly articled
 */
export function checkArticleUsage(
  article: string | undefined,
  noun: string
): { valid: boolean; reason?: string } {
  if (article === 'een' && isUncountable(noun)) {
    return {
      valid: false,
      reason: `"een" cannot be used with uncountable noun "${noun}"`
    };
  }

  if (article && !ARTICLES.includes(article.toLowerCase())) {
    return {
      valid: false,
      reason: `"${article}" is not a valid Dutch article`
    };
  }

  if (!article && canHaveArticle(noun)) {
    return {
      valid: false,
      reason: `Noun "${noun}" should have an article`
    };
  }

  return { valid: true };
}
