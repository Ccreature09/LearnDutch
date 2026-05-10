/**
 * Grammar Validation Engine
 * 
 * Orchestrates all validators for unified grammar checking
 * - Runs all relevant validators
 * - Collects and deduplicates errors
 * - Prioritizes errors by importance
 * - Returns comprehensive validation result
 */

import { GrammarError, GrammarMetadata, ValidationResult } from './grammar-types';
import { BaseValidator, ValidatorRegistry } from './base-validator';
import { ArticleValidator } from './article-validator';
import { VerbValidator } from './verb-validator';
import { InversionValidator } from './inversion-validator';

/**
 * Main validation engine
 */
export class ValidationEngine {
  private registry: ValidatorRegistry;
  private validators: BaseValidator[];
  private category?: string;

  constructor(category?: string) {
    this.category = category;
    this.registry = new ValidatorRegistry();
    this.validators = this.createDefaultValidators();

    // Register all validators
    for (const validator of this.validators) {
      this.registry.register(validator);
    }
  }

  /**
   * Create default validators
   */
  private createDefaultValidators(): BaseValidator[] {
    return [
      new ArticleValidator(),
      new VerbValidator(),
      new InversionValidator()
    ];
  }

  /**
   * Add custom validator
   */
  addValidator(validator: BaseValidator): void {
    this.registry.register(validator);
    this.validators.push(validator);
  }

  /**
   * Remove validator by name
   */
  removeValidator(name: string): void {
    this.registry.unregister(name);
    this.validators = this.validators.filter(v => v.getName() !== name);
  }

  /**
   * Main validation method
   */
  validate(
    userAnswer: string,
    expectedAnswer: string | string[],
    metadata?: GrammarMetadata
  ): ValidationResult {
    if (Array.isArray(expectedAnswer)) {
      const results = expectedAnswer.map((candidate) => this.validate(userAnswer, candidate, metadata));
      return this.pickBestResult(results, userAnswer, expectedAnswer, metadata);
    }

    const allErrors: GrammarError[] = [];
    const validatorResults: { [key: string]: GrammarError[] } = {};

    // Run all enabled validators
    const enabledValidators = this.registry.getEnabled();

    for (const validator of enabledValidators) {
      const errors = validator.validate(userAnswer, expectedAnswer, metadata);
      validatorResults[validator.getName()] = errors;

      // Add to collection
      allErrors.push(...errors);
    }

    // Deduplicate errors (same position, type)
    const deduplicated = this.deduplicateErrors(allErrors);

    // Sort by priority
    const sorted = this.prioritizeErrors(deduplicated);

    // Determine overall correctness
    const isCorrect = sorted.length === 0;
    const matchScore = this.calculateMatchScore(userAnswer, expectedAnswer);

    return {
      userAnswer,
      expectedAnswer,
      isCorrect,
      isClose: false,
      matchScore,
      errors: sorted,
      errorCount: sorted.length,
      hasErrors: sorted.length > 0,
      validatorResults,
      metadata
    };
  }

  private pickBestResult(
    results: ValidationResult[],
    userAnswer: string,
    expectedAnswers: string[],
    metadata?: GrammarMetadata
  ): ValidationResult {
    const exact = results.find((result) => result.isCorrect);
    if (exact) {
      return {
        ...exact,
        expectedAnswer: exact.expectedAnswer ?? expectedAnswers[0],
        metadata
      };
    }

    const sorted = [...results].sort((a, b) => {
      const scoreA = a.matchScore ?? 0;
      const scoreB = b.matchScore ?? 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
      return (a.errorCount ?? 0) - (b.errorCount ?? 0);
    });

    const best = sorted[0];
    return {
      ...best,
      userAnswer,
      expectedAnswer: best.expectedAnswer ?? expectedAnswers[0],
      metadata
    };
  }

  /**
   * Deduplicate errors from multiple validators
   */
  private deduplicateErrors(errors: GrammarError[]): GrammarError[] {
    const seen = new Set<string>();
    const deduped: GrammarError[] = [];

    for (const error of errors) {
      const key = `${error.type}:${error.userToken}:${error.expectedToken}`;

      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(error);
      }
    }

    return deduped;
  }

  /**
   * Prioritize errors by importance
   * Priority levels: 1 (critical) to 4 (minor)
   */
  private prioritizeErrors(errors: GrammarError[]): GrammarError[] {
    // Sort by priority (descending), then by error type consistency
    return errors.sort((a, b) => {
      // Higher priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Same priority: sort by error type for consistency
      return a.type.localeCompare(b.type);
    });
  }

  /**
   * Calculate overall match score (0-100)
   */
  private calculateMatchScore(userAnswer: string, expectedAnswer: string): number {
    const userTokens = userAnswer.toLowerCase().trim().split(/\s+/);
    const expectedTokens = expectedAnswer.toLowerCase().trim().split(/\s+/);

    if (expectedTokens.length === 0) return 100;

    let matches = 0;
    const maxLen = Math.max(userTokens.length, expectedTokens.length);

    for (let i = 0; i < Math.min(userTokens.length, expectedTokens.length); i++) {
      if (userTokens[i] === expectedTokens[i]) {
        matches++;
      }
    }

    return Math.round((matches / maxLen) * 100);
  }

  /**
   * Get single most important error (useful for UI)
   */
  getMostImportantError(
    userAnswer: string,
    expectedAnswer: string,
    metadata?: GrammarMetadata
  ): GrammarError | undefined {
    const result = this.validate(userAnswer, expectedAnswer, metadata);
    return result.errors[0];
  }

  /**
   * Quick validation (just true/false)
   */
  isCorrect(userAnswer: string, expectedAnswer: string): boolean {
    return this.validate(userAnswer, expectedAnswer).isCorrect;
  }

  /**
   * Get error count
   */
  getErrorCount(
    userAnswer: string,
    expectedAnswer: string,
    metadata?: GrammarMetadata
  ): number {
    return this.validate(userAnswer, expectedAnswer, metadata).errorCount ?? 0;
  }

  /**
   * Get all errors of specific type
   */
  getErrorsOfType(
    errors: GrammarError[],
    type: string
  ): GrammarError[] {
    return errors.filter(e => e.type === type);
  }

  /**
   * Get validator by name
   */
  getValidator(name: string): BaseValidator | undefined {
    return this.registry.get(name);
  }

  /**
   * Get all validators
   */
  getAllValidators(): BaseValidator[] {
    return this.registry.getAll();
  }

  /**
   * Get validator count
   */
  getValidatorCount(): number {
    return this.registry.count();
  }
}

/**
 * Singleton instance for common usage
 */
let globalEngine: ValidationEngine | undefined;

/**
 * Get or create global engine
 */
export function getValidationEngine(category?: string): ValidationEngine {
  if (!globalEngine) {
    globalEngine = new ValidationEngine(category);
  }
  return globalEngine;
}

/**
 * Quick validation function
 */
export function validateSentence(
  userAnswer: string,
  expectedAnswer: string | string[],
  category?: string
): ValidationResult {
  const engine = new ValidationEngine(category);
  return engine.validate(userAnswer, expectedAnswer);
}

/**
 * Quick check if answer is correct
 */
export function isAnswerCorrect(
  userAnswer: string,
  expectedAnswer: string | string[]
): boolean {
  return validateSentence(userAnswer, expectedAnswer).isCorrect;
}

/**
 * Get all errors for an answer
 */
export function getAnswerErrors(
  userAnswer: string,
  expectedAnswer: string | string[]
): GrammarError[] {
  return validateSentence(userAnswer, expectedAnswer).errors;
}

/**
 * Get detailed validation report
 */
export function getValidationReport(
  userAnswer: string,
  expectedAnswer: string | string[],
  category?: string
): {
  correct: boolean;
  score: number;
  errorCount: number;
  errors: Array<{
    type: string;
    message: string;
    suggestion: string;
    priority: number;
  }>;
} {
  const result = validateSentence(userAnswer, expectedAnswer, category);

  return {
    correct: result.isCorrect,
    score: result.matchScore ?? 0,
    errorCount: result.errorCount ?? 0,
    errors: result.errors.map(e => ({
      type: e.type,
      message: e.explanation,
      suggestion: e.rule || e.explanation,
      priority: e.priority
    }))
  };
}
