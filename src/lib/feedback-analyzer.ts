import { Feedback } from "./types";
import { GrammarMetadata } from "./grammar-types";
import { ValidationEngine } from "./validation-engine";

// Common noun articles in Dutch
const nounArticles: Record<string, "de" | "het"> = {
  // "de" words (common nouns)
  stad: "de",
  tafel: "de",
  stoel: "de",
  deur: "de",
  fiets: "de",
  auto: "de",
  trein: "de",
  bus: "de",
  boom: "de",
  kat: "de",
  hond: "de",
  man: "de",
  vrouw: "de",
  kind: "de",
  school: "de",
  dag: "de",
  nacht: "de",
  neus: "de",
  mond: "de",
  hand: "de",
  voet: "de",
  arm: "de",
  been: "de",
  oog: "de",
  oor: "de",
  // "het" words (neuter nouns)
  huis: "het",
  boek: "het",
  raam: "het",
  bed: "het",
  eten: "het",
  spel: "het",
  spil: "het",
  uur: "het",
  jaar: "het",
  moment: "het",
  stuk: "het",
  deel: "het",
  licht: "het",
  geluid: "het",
  water: "het",
  papier: "het",
  potlood: "het",
};

// Conjugation rules for common verbs
const verbConjugations: Record<string, Record<string, string>> = {
  zijn: {
    ik: "ben",
    jij: "bent",
    "je": "bent",
    hij: "is",
    zij: "is",
    "het": "is",
    wij: "zijn",
    jullie: "zijn",
  },
  hebben: {
    ik: "heb",
    jij: "hebt",
    je: "hebt",
    hij: "heeft",
    zij: "heeft",
    het: "heeft",
    wij: "hebben",
    jullie: "hebben",
  }
};

export function analyzeAnswer(
  userAnswer: string,
  expected: string,
  category?: string,
  metadata?: GrammarMetadata
): Feedback {
  const userAnswerNormalized = normalizeAnswerForComparison(userAnswer);
  const expectedNormalized = normalizeAnswerForComparison(expected);

  const userWords = userAnswerNormalized.toLowerCase().trim().split(/\s+/);
  const expectedWords = expectedNormalized.toLowerCase().trim().split(/\s+/);

  if (metadata) {
    const engine = new ValidationEngine(category);
    const result = engine.validate(userAnswer, expected, metadata);

    if (result.isCorrect) {
      return { type: "ok", text: "✓ Perfect!" };
    }

    const details = result.errors.map((error) => ({
      correctWord: error.expectedToken ?? "",
      yourWord: error.userToken ?? "",
      explanation: error.explanation
    }));

    const diffTokens = buildDiffTokens(userWords, expectedWords);

    const inversionNote = result.errors.some((error) =>
      error.type === "inversion_required" || error.type === "inversion_incorrect"
    )
      ? "Fronted time expressions trigger inversion in Dutch."
      : undefined;

    const score = result.matchScore ?? 0;
    const type = score >= 70 ? "close" : "bad";
    const text = score >= 70
      ? "Some grammar issues to fix."
      : `Expected: ${expected}`;

    return {
      type,
      text,
      diffTokens,
      errorTypes: result.errors.map((error) => error.type),
      details: details.slice(0, 3),
      inversionNote
    };
  }

  // Exact match (after normalizing)
  if (userAnswerNormalized.toLowerCase().trim() === expectedNormalized.toLowerCase().trim()) {
    return { type: "ok", text: "✓ Perfect!" };
  }

  // Check for word order inversion issues FIRST (before word differences)
  const inversionIssue = detectInversionError(userWords, expectedWords, category);

  // Detect specific errors
  const details: Feedback["details"] = [];
  const errors = findWordDifferences(userWords, expectedWords);
  const diffTokens = buildDiffTokens(userWords, expectedWords);

  errors.forEach((error) => {
    details.push({
      correctWord: error.expected,
      yourWord: error.actual,
      explanation: getExplanation(error.expected, error.actual, category),
    });
  });

  // If we detected an inversion issue AND have word differences, mention both
  if (inversionIssue && errors.length > 0) {
    const text = `${errors.length} word${errors.length === 1 ? "" : "s"} differ and word order is incorrect`;
    return {
      type: "close",
      text,
      diffTokens,
      details: details.slice(0, 3),
      inversionNote: inversionIssue,
    };
  }

  // Close answer with details
  if (errors.length > 0 && errors.length <= 2) {
    const text =
      errors.length === 1
        ? `One word differs: "${errors[0].actual}" should be "${errors[0].expected}"`
        : `${errors.length} words differ`;

    return {
      type: "close",
      text,
      diffTokens,
      details: details.slice(0, 3),
      inversionNote: inversionIssue,
    };
  }

  return {
    type: "bad",
    text: `Expected: ${expected}`,
    diffTokens,
    details: details.slice(0, 2),
    inversionNote: inversionIssue,
  };
}

// Helper function to normalize answers the same way as dutch-data.ts
function normalizeAnswerForComparison(value: string): string {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function stripPunctuation(word: string): string {
  // Remove trailing punctuation but keep the word itself
  return word.replace(/[.,!?;:—\-\'"()[\]{}]+$/g, "");
}

function findWordDifferences(
  userWords: string[],
  expectedWords: string[]
): { actual: string; expected: string }[] {
  const differences: { actual: string; expected: string }[] = [];

  const maxLen = Math.max(userWords.length, expectedWords.length);
  for (let i = 0; i < maxLen; i++) {
    const userWord = userWords[i];
    const expectedWord = expectedWords[i];

    // Strip punctuation for comparison, but keep original for display
    const userWordClean = userWord ? stripPunctuation(userWord.toLowerCase()) : "";
    const expectedWordClean = expectedWord ? stripPunctuation(expectedWord.toLowerCase()) : "";

    // Only flag as different if the actual words (without punctuation) differ
    if (userWordClean !== expectedWordClean) {
      differences.push({
        actual: userWord || "(missing)",
        expected: expectedWord || "(extra)",
      });
    }
  }

  return differences;
}

function buildDiffTokens(userWords: string[], expectedWords: string[]) {
  const tokens: Feedback["diffTokens"] = [];
  const maxLen = Math.max(userWords.length, expectedWords.length);

  for (let i = 0; i < maxLen; i++) {
    const userWord = userWords[i];
    const expectedWord = expectedWords[i];
    const userClean = userWord ? stripPunctuation(userWord.toLowerCase()) : "";
    const expectedClean = expectedWord ? stripPunctuation(expectedWord.toLowerCase()) : "";

    if (!expectedWord && userWord) {
      tokens?.push({ token: userWord, status: "extra" });
      continue;
    }
    if (expectedWord && !userWord) {
      tokens?.push({ token: expectedWord, status: "missing" });
      continue;
    }
    if (userClean === expectedClean) {
      tokens?.push({ token: expectedWord ?? "", status: "correct" });
      continue;
    }
    tokens?.push({ token: expectedWord ?? "", status: "replace", actual: userWord ?? "" });
  }

  return tokens;
}

function getExplanation(
  expectedWord: string,
  actualWord: string,
  category?: string
): string {
  const expected = stripPunctuation(expectedWord.toLowerCase());
  const actual = stripPunctuation(actualWord.toLowerCase());

  // Perfect tense auxiliary vs wrong verb form
  if ((expected === "hebben" || expected === "ben" || expected === "zijn") && 
      (actual.includes("werk") || actual.includes("eet") || actual.includes("loop"))) {
    return `Use the auxiliary verb "${expected}" here, not the main verb "${actual}". Perfect tense uses: ${expected} + past participle`;
  }

  // Past participle detection
  if ((actual === "hebben" || actual === "ben" || actual === "zijn") &&
      (expected.endsWith("t") || expected.endsWith("d") || expected.endsWith("en"))) {
    return `Use the past participle "${expected}" here, not the auxiliary. Example structure: hebben ${expected}`;
  }

  // Article errors (de vs het)
  if ((expected === "de" || expected === "het") && actual !== expected) {
    if (actual === "de" || actual === "het") {
      const baseWord = expected === "de" ? "common noun (de)" : "neuter noun (het)";
      return `This noun uses "${expected}" (${baseWord})`;
    }
  }

  if ((actual === "de" || actual === "het") && expected !== actual) {
    return `Incorrect article. This should be "${expected}" not "${actual}"`;
  }

  // Verb conjugation errors  
  for (const [verb, conjugations] of Object.entries(verbConjugations)) {
    if (Object.values(conjugations).includes(expected)) {
      // Find which pronoun this should be
      for (const [pronoun, form] of Object.entries(conjugations)) {
        if (form === expected && (actual === "ben" || actual === "bent" || actual === "is" || actual === "zijn")) {
          return `Use "${expected}" with "${pronoun}" (verb: ${verb})`;
        }
      }
    }
  }

  // Specific gender/article patterns
  if (expected in nounArticles) {
    const article = nounArticles[expected];
    return `"${expected}" is a ${article === "de" ? "common" : "neuter"} noun (uses "${article}")`;
  }

  // Word order/inversion hints
  if (category?.includes("inversion") || category?.includes("question")) {
    return "Check if verbs need to be inverted (moved to front in questions)";
  }

  // Close words
  if (levenshteinDistance(actual, expected) <= 2) {
    return `Very close! Did you mean "${expected}"?`;
  }

  return `Use "${expected}" instead`;
}

// Simple Levenshtein distance for typo detection
function levenshteinDistance(a: string, b: string): number {
  const len1 = a.length;
  const len2 = b.length;
  const d: number[][] = [];

  for (let i = 0; i <= len1; i++) d[i] = [i];
  for (let j = 0; j <= len2; j++) d[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }

  return d[len1][len2];
}

function detectInversionError(
  userWords: string[],
  expectedWords: string[],
  category?: string
): string | undefined {
  // Check if words are in different order but contain similar elements
  const userLower = userWords.map((w) => w.toLowerCase());
  const expectedLower = expectedWords.map((w) => w.toLowerCase());

  // Pattern 1: Perfect tense detection (hebben/zijn + past participle)
  // Expected: "hebben gewerkt", User: "werken hebt" or similar
  const perfectionAuxiliaries = ["hebben", "ben", "bent", "is", "zijn"];
  const userHasAux = userLower.some((w) => perfectionAuxiliaries.some((a) => w.includes(a)));
  const expectedHasAux = expectedLower.some((w) => perfectionAuxiliaries.some((a) => w.includes(a)));
  const expectedHasPastParticiple = expectedLower.some((w) => w.endsWith("t") || w.endsWith("d") || w.endsWith("en"));

  if (expectedHasAux && expectedHasPastParticiple) {
    // Find auxiliary and participle positions
    const userAuxIdx = userLower.findIndex((w) => perfectionAuxiliaries.some((a) => w.includes(a)));
    const expectedAuxIdx = expectedLower.findIndex((w) => perfectionAuxiliaries.some((a) => w.includes(a)));

    // Perfect tense structure: auxiliary should be in position 2, participle at end
    if (userAuxIdx !== -1 && expectedAuxIdx !== -1 && userAuxIdx !== expectedAuxIdx) {
      const auxWord = expectedLower[expectedAuxIdx];
      return `📍 Perfect tense: Use "${auxWord}" in position ${expectedAuxIdx + 1}, with the past participle at the end. Example: "Wij hebben gewerkt" (We have worked)`;
    }
  }

  // Pattern 2: General word order (same words, wrong order)
  const userSet = new Set(userLower.filter((w) => w.length > 0));
  const expectedSet = new Set(expectedLower.filter((w) => w.length > 0));

  if (userSet.size === expectedSet.size && userSet.size > 0) {
    let sameWords = true;
    for (const word of userSet) {
      if (!expectedSet.has(word)) {
        sameWords = false;
        break;
      }
    }

    if (sameWords && userLower.join(" ") !== expectedLower.join(" ")) {
      // Find verb positions for inversion detection
      const verbPatterns = ["ben", "bent", "is", "zijn", "heb", "hebt", "heeft", "hebben", "kom", "gaat", "werk", "werkt"];
      const userVerbIdx = userLower.findIndex((w) => verbPatterns.some((v) => w.includes(v)));
      const expectedVerbIdx = expectedLower.findIndex((w) => verbPatterns.some((v) => w.includes(v)));

      if (userVerbIdx !== -1 && expectedVerbIdx !== -1 && userVerbIdx !== expectedVerbIdx) {
        const verb = expectedLower[expectedVerbIdx];
        return `📍 Word order: The verb "${verb}" should be at position ${expectedVerbIdx + 1}, not ${userVerbIdx + 1}. You have the right words but in wrong order!`;
      }

      return "💡 Word order: You have the right words but they're in the wrong order!";
    }
  }

  return undefined;
}

export function shouldDisableFeedback(feedback: Feedback | null): boolean {
  return feedback !== null && feedback.type === "ok";
}
