/**
 * Base Validator Class
 * 
 * Abstract base class for all grammar validators
 * Provides common interface and utilities for validation
 */

import {
  ValidationResult,
  GrammarError,
  GrammarMetadata,
  EnhancedSentence
} from './grammar-types';
import { tokenizeNormalized, stripPunctuation } from './grammar-tokenizer';
import { normalizeAnswer } from './grammar-normalization';

export interface ValidatorConfig {
  name: string;
  category?: string;
  enabled?: boolean;
}

/**
 * Abstract base validator
 * All grammar validators inherit from this
 */
export abstract class BaseValidator {
  protected config: ValidatorConfig;

  constructor(config: ValidatorConfig) {
    this.config = {
      enabled: true,
      ...config
    };
  }

  /**
   * Main validation method - must be implemented by subclasses
   */
  abstract validate(
    userAnswer: string,
    expectedAnswer: string,
    metadata?: GrammarMetadata
  ): GrammarError[];

  /**
   * Generate explanation for an error
   */
  abstract explainError(error: GrammarError): string;

  /**
   * Helper: Create a grammar error
   */
  protected createError(
    type: GrammarError["type"],
    message: string,
    userToken: string,
    expectedToken: string,
    priority: GrammarError["priority"] = 2
  ): GrammarError {
    const baseError: GrammarError = {
      type,
      userToken,
      expectedToken,
      priority,
      explanation: message,
      rule: message
    };
    return {
      ...baseError,
      explanation: this.explainError(baseError)
    };
  }

  /**
   * Helper: Normalize answers consistently
   */
  protected normalizeAnswers(user: string, expected: string) {
    return {
      user: normalizeAnswer(user),
      expected: normalizeAnswer(expected),
      userTokens: tokenizeNormalized(user),
      expectedTokens: tokenizeNormalized(expected)
    };
  }

  /**
   * Helper: Extract token at position
   */
  protected getTokenAt(tokens: string[], position: number): string | undefined {
    return tokens[position];
  }

  /**
   * Helper: Check if token is in list
   */
  protected isIn(token: string, list: string[]): boolean {
    return list.includes(token.toLowerCase());
  }

  /**
   * Helper: Find token position
   */
  protected findTokenPosition(tokens: string[], word: string): number {
    const normalized = stripPunctuation(word).toLowerCase();
    return tokens.findIndex(t => t === normalized);
  }

  /**
   * Helper: Check if two tokens are similar (typo)
   */
  protected areSimilar(token1: string, token2: string, maxDistance: number = 2): boolean {
    return this.levenshteinDistance(token1, token2) <= maxDistance;
  }

  /**
   * Levenshtein distance for typo detection
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }

  /**
   * Helper: Get validator name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Helper: Check if validator is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled !== false;
  }
}

/**
 * Simple no-op validator for testing
 */
export class NoOpValidator extends BaseValidator {
  validate(): GrammarError[] {
    return [];
  }

  explainError(): string {
    return 'No error';
  }
}

/**
 * Validator registry for managing multiple validators
 */
export class ValidatorRegistry {
  private validators: Map<string, BaseValidator> = new Map();

  register(validator: BaseValidator): void {
    this.validators.set(validator.getName(), validator);
  }

  unregister(name: string): void {
    this.validators.delete(name);
  }

  get(name: string): BaseValidator | undefined {
    return this.validators.get(name);
  }

  getAll(): BaseValidator[] {
    return Array.from(this.validators.values());
  }

  getEnabled(): BaseValidator[] {
    return this.getAll().filter(v => v.isEnabled());
  }

  count(): number {
    return this.validators.size;
  }
}
