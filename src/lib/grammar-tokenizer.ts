/**
 * Grammar Tokenizer
 * 
 * Utilities for splitting and analyzing text into tokens
 * Used throughout validation system for consistent tokenization
 */

/**
 * Tokenize a sentence into words
 * Handles common punctuation and contractions
 */
export function tokenize(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Tokenize and normalize (lowercase, no punctuation)
 */
export function tokenizeNormalized(sentence: string): string[] {
  return tokenize(sentence)
    .map(word => stripPunctuation(word).toLowerCase())
    .filter(word => word.length > 0);
}

/**
 * Strip punctuation from a single word
 */
export function stripPunctuation(word: string): string {
  return word.replace(/[^\w'-]/g, '');
}

/**
 * Split sentence into words preserving original case/punctuation
 */
export interface Token {
  word: string;
  normalized: string;
  position: number;
}

export function tokenizeWithMetadata(sentence: string): Token[] {
  const words = tokenize(sentence);
  return words.map((word, idx) => ({
    word,
    normalized: stripPunctuation(word).toLowerCase(),
    position: idx
  }));
}

/**
 * Get token at position (0-indexed)
 */
export function getTokenAt(tokens: Token[], position: number): Token | undefined {
  return tokens[position];
}

/**
 * Find token by word (normalized comparison)
 */
export function findToken(tokens: Token[], word: string): Token | undefined {
  const normalized = stripPunctuation(word).toLowerCase();
  return tokens.find(t => t.normalized === normalized);
}

/**
 * Extract subject pronoun from sentence start
 */
export function extractSubjectPronoun(sentence: string): string | undefined {
  const tokens = tokenizeNormalized(sentence);
  if (tokens.length === 0) return undefined;

  const pronouns = ['ik', 'jij', 'je', 'hij', 'zij', 'het', 'wij', 'wij', 'jullie', 'u', 'ze'];
  const firstWord = tokens[0];
  
  return pronouns.includes(firstWord) ? firstWord : undefined;
}

/**
 * Extract verb from sentence
 * Simplified: assumes second position or marked position
 */
export function extractVerb(sentence: string, verbPosition?: number): string | undefined {
  const tokens = tokenizeNormalized(sentence);
  if (tokens.length < 2) return undefined;

  const pos = verbPosition ?? 1;
  return tokens[pos];
}

/**
 * Check if sentence contains a word
 */
export function containsWord(sentence: string, word: string): boolean {
  const tokens = tokenizeNormalized(sentence);
  const normalized = stripPunctuation(word).toLowerCase();
  return tokens.some(t => t === normalized);
}

/**
 * Get distance between two words in sentence
 */
export function wordDistance(sentence: string, word1: string, word2: string): number {
  const tokens = tokenizeNormalized(sentence);
  const norm1 = stripPunctuation(word1).toLowerCase();
  const norm2 = stripPunctuation(word2).toLowerCase();

  const idx1 = tokens.indexOf(norm1);
  const idx2 = tokens.indexOf(norm2);

  if (idx1 === -1 || idx2 === -1) return -1;
  return Math.abs(idx1 - idx2);
}

/**
 * Check if word order is correct
 * Returns true if word1 comes before word2
 */
export function checkWordOrder(sentence: string, word1: string, word2: string): boolean {
  const tokens = tokenizeNormalized(sentence);
  const norm1 = stripPunctuation(word1).toLowerCase();
  const norm2 = stripPunctuation(word2).toLowerCase();

  const idx1 = tokens.indexOf(norm1);
  const idx2 = tokens.indexOf(norm2);

  if (idx1 === -1 || idx2 === -1) return false;
  return idx1 < idx2;
}

/**
 * Slice tokens from position
 */
export function tokensFromPosition(tokens: Token[], position: number): Token[] {
  return tokens.slice(position);
}

/**
 * Reconstruct sentence from tokens
 */
export function reconstructSentence(tokens: Token[]): string {
  return tokens.map(t => t.word).join(' ');
}

/**
 * Compare two tokenized sentences
 * Returns aligned pairs of tokens
 */
export interface TokenAlignment {
  expectedToken: Token | undefined;
  userToken: Token | undefined;
  matched: boolean;
}

export function alignTokens(
  expected: Token[],
  user: Token[]
): TokenAlignment[] {
  const maxLen = Math.max(expected.length, user.length);
  const alignments: TokenAlignment[] = [];

  for (let i = 0; i < maxLen; i++) {
    const expectedTok = expected[i];
    const userTok = user[i];

    alignments.push({
      expectedToken: expectedTok,
      userToken: userTok,
      matched: expectedTok?.normalized === userTok?.normalized
    });
  }

  return alignments;
}

/**
 * Count matching tokens
 */
export function countMatches(alignments: TokenAlignment[]): number {
  return alignments.filter(a => a.matched).length;
}

/**
 * Calculate similarity score (0-100)
 */
export function calculateSimilarity(
  expected: Token[],
  user: Token[]
): number {
  if (expected.length === 0 && user.length === 0) return 100;
  if (expected.length === 0 || user.length === 0) return 0;

  const alignments = alignTokens(expected, user);
  const matches = countMatches(alignments);
  const maxLen = Math.max(expected.length, user.length);

  return Math.round((matches / maxLen) * 100);
}
