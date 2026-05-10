/**
 * Error Prioritizer
 * 
 * Sorts and groups errors by importance and type
 * Prevents overwhelming learners with too many errors at once
 * Supports adaptive learning (tracking weak areas)
 */

import { GrammarError } from './grammar-types';

/**
 * Priority levels in Dutch grammar learning
 */
export enum ErrorPriority {
  CRITICAL = 1,      // Syntax errors, word order, core structure
  HIGH = 2,          // Grammar tense, conjugation, article gender
  MEDIUM = 3,        // Article choice, style
  LOW = 4            // Typos, minor style issues
}

/**
 * Error grouping strategy
 */
export type GroupingStrategy = 'type' | 'priority' | 'token' | 'sentence';

/**
 * Error priority config
 */
export interface PriorityConfig {
  maxErrorsToShow?: number;
  showOnlyMostImportant?: boolean;
  groupBy?: GroupingStrategy;
  includeExplanations?: boolean;
}

/**
 * Prioritized error group
 */
export interface ErrorGroup {
  priority: number;
  errors: GrammarError[];
  label: string;
  count: number;
  message?: string;
}

/**
 * Error prioritizer
 */
export class ErrorPrioritizer {
  private config: Required<PriorityConfig>;

  constructor(config: PriorityConfig = {}) {
    this.config = {
      maxErrorsToShow: config.maxErrorsToShow ?? 3,
      showOnlyMostImportant: config.showOnlyMostImportant ?? false,
      groupBy: config.groupBy ?? 'priority',
      includeExplanations: config.includeExplanations ?? true
    };
  }

  /**
   * Prioritize and filter errors
   */
  prioritize(errors: GrammarError[]): GrammarError[] {
    // Sort by priority
    const sorted = [...errors].sort((a, b) => b.priority - a.priority);

    // Limit if configured
    if (this.config.showOnlyMostImportant) {
      return sorted.slice(0, 1);
    }

    return sorted.slice(0, this.config.maxErrorsToShow);
  }

  /**
   * Group errors by strategy
   */
  groupErrors(
    errors: GrammarError[],
    strategy: GroupingStrategy = 'priority'
  ): ErrorGroup[] {
    const groups = new Map<string, ErrorGroup>();

    for (const error of errors) {
      const key = this.getGroupKey(error, strategy);
      const { label, priority } = this.getGroupLabel(error, strategy);

      if (!groups.has(key)) {
        groups.set(key, {
          priority,
          errors: [],
          label,
          count: 0
        });
      }

      const group = groups.get(key)!;
      group.errors.push(error);
      group.count++;
    }

    // Convert to array and sort
    return Array.from(groups.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get group key for an error
   */
  private getGroupKey(error: GrammarError, strategy: GroupingStrategy): string {
    switch (strategy) {
      case 'type':
        return error.type;
      case 'priority':
        return `priority_${error.priority}`;
      case 'token':
        return error.userToken || 'unknown';
      case 'sentence':
        return 'sentence_errors';
      default:
        return 'default';
    }
  }

  /**
   * Get label for error group
   */
  private getGroupLabel(
    error: GrammarError,
    strategy: GroupingStrategy
  ): { label: string; priority: number } {
    switch (strategy) {
      case 'type':
        return {
          label: this.getTypeLabel(error.type),
          priority: error.priority
        };

      case 'priority':
        return {
          label: this.getPriorityLabel(error.priority),
          priority: error.priority
        };

      case 'token':
        return {
          label: `Token: "${error.userToken}"`,
          priority: error.priority
        };

      case 'sentence':
      default:
        return {
          label: 'Errors in this sentence',
          priority: error.priority
        };
    }
  }

  /**
   * Get readable priority label
   */
  private getPriorityLabel(priority: number): string {
    switch (priority) {
      case ErrorPriority.CRITICAL:
        return 'Critical: Fix the structure';
      case ErrorPriority.HIGH:
        return 'Grammar: Check tense/conjugation';
      case ErrorPriority.MEDIUM:
        return 'Style: Article or word choice';
      case ErrorPriority.LOW:
        return 'Minor: Likely a typo';
      default:
        return `Priority ${priority}`;
    }
  }

  /**
   * Get readable error type label
   */
  private getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      article_wrong_gender: 'Article gender',
      article_uncountable: 'Uncountable noun',
      article_missing: 'Missing article',
      article_unexpected: 'Unexpected article',

      verb_wrong_conjugation: 'Verb form',
      verb_wrong_tense: 'Verb tense',

      perfect_wrong_auxiliary: 'Perfect auxiliary',
      perfect_wrong_participle: 'Past participle',
      perfect_missing_auxiliary: 'Missing auxiliary',

      inversion_required: 'Word order',
      inversion_incorrect: 'Unexpected inversion',

      negation_geen_vs_niet: 'Negation',
      negation_placement: 'Negation order',

      modal_wrong_form: 'Modal verb',
      modal_wrong_order: 'Modal order',

      word_order_wrong: 'Word order',
      extra_word: 'Extra word',
      missing_word: 'Missing word',

      typo_detected: 'Typo'
    };

    return labels[type] || type;
  }

  /**
   * Filter errors by priority threshold
   */
  filterByPriority(
    errors: GrammarError[],
    minPriority: number
  ): GrammarError[] {
    return errors.filter(e => e.priority >= minPriority);
  }

  /**
   * Filter errors by type
   */
  filterByType(errors: GrammarError[], types: string[]): GrammarError[] {
    return errors.filter(e => types.includes(e.type));
  }

  /**
   * Get most important single error
   */
  getMostImportant(errors: GrammarError[]): GrammarError | undefined {
    if (errors.length === 0) return undefined;

    return errors.reduce((a, b) =>
      a.priority > b.priority ? a : b
    );
  }

  /**
   * Check if errors contain critical issues
   */
  hasCriticalErrors(errors: GrammarError[]): boolean {
    return errors.some(e => e.priority === ErrorPriority.CRITICAL);
  }

  /**
   * Generate summary message
   */
  generateSummary(errors: GrammarError[]): string {
    if (errors.length === 0) {
      return '✓ Perfect!';
    }

    if (errors.length === 1) {
      const error = errors[0];
      return `⚠️ ${this.getTypeLabel(error.type)}: ${error.explanation}`;
    }

    const summary = this.groupErrors(errors, 'priority');
    const parts: string[] = [];

    for (const group of summary.slice(0, 2)) {
      if (group.count === 1) {
        parts.push(`${group.label} (1 error)`);
      } else {
        parts.push(`${group.label} (${group.count} errors)`);
      }
    }

    if (summary.length > 2) {
      parts.push(`and more...`);
    }

    return parts.join(' • ');
  }

  /**
   * Generate detailed report
   */
  generateReport(errors: GrammarError[]): string {
    if (errors.length === 0) {
      return 'No errors found. ✓';
    }

    const lines: string[] = [];
    const groups = this.groupErrors(errors, 'priority');

    for (const group of groups) {
      lines.push(`\n${group.label}:`);

      for (const error of group.errors.slice(0, 2)) {
        lines.push(`  • ${error.explanation}`);
        if (this.config.includeExplanations && error.rule) {
          lines.push(`    💡 ${error.rule}`);
        }
      }

      if (group.count > 2) {
        lines.push(`  ... and ${group.count - 2} more`);
      }
    }

    return lines.join('\n');
  }
}

/**
 * Quick prioritization utility
 */
export function prioritizeErrors(
  errors: GrammarError[],
  maxToShow?: number
): GrammarError[] {
  const prioritizer = new ErrorPrioritizer({ maxErrorsToShow: maxToShow });
  return prioritizer.prioritize(errors);
}

/**
 * Quick error summary
 */
export function summarizeErrors(errors: GrammarError[]): string {
  const prioritizer = new ErrorPrioritizer();
  return prioritizer.generateSummary(errors);
}

/**
 * Quick detailed report
 */
export function reportErrors(errors: GrammarError[]): string {
  const prioritizer = new ErrorPrioritizer();
  return prioritizer.generateReport(errors);
}

/**
 * Adaptive learning tracker
 * Tracks which error types are problematic
 */
export class AdaptiveLearningTracker {
  private errorCounts: Map<string, number> = new Map();
  private sessionErrors: Map<string, number> = new Map();

  /**
   * Record an error
   */
  recordError(errorType: string): void {
    this.errorCounts.set(
      errorType,
      (this.errorCounts.get(errorType) ?? 0) + 1
    );

    this.sessionErrors.set(
      errorType,
      (this.sessionErrors.get(errorType) ?? 0) + 1
    );
  }

  /**
   * Get weak areas (error types with most mistakes)
   */
  getWeakAreas(limit: number = 5): Array<{ type: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get session weak areas
   */
  getSessionWeakAreas(limit: number = 3): Array<{ type: string; count: number }> {
    return Array.from(this.sessionErrors.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Reset session tracking
   */
  resetSession(): void {
    this.sessionErrors.clear();
  }

  /**
   * Get total error count
   */
  getTotalErrors(): number {
    let total = 0;
    this.errorCounts.forEach(count => total += count);
    return total;
  }
}

/**
 * Singleton adaptive tracker
 */
let globalTracker: AdaptiveLearningTracker | undefined;

export function getAdaptiveTracker(): AdaptiveLearningTracker {
  if (!globalTracker) {
    globalTracker = new AdaptiveLearningTracker();
  }
  return globalTracker;
}
