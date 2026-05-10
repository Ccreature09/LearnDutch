/**
 * Normalization utilities for grammar validation
 * 
 * Consistent input cleaning for grammar-aware validation
 */

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeForDisplay(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

export function stripArticle(word: string): string {
  const articles = ['de', 'het', 'een'];
  const words = normalizeAnswer(word).split(/\s+/);
  if (articles.includes(words[0]) && words.length > 1) {
    return words.slice(1).join(' ');
  }
  return word;
}
