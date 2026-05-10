import { generateStructuredSentence } from "../sentence-generation/generator";
import { PracticeCategory } from "../lib/types";

function sample(category: PracticeCategory, iterations = 200) {
  const seen = new Set<string>();
  for (let i = 0; i < iterations; i++) {
    const s = generateStructuredSentence(category);
    if (!s) continue;
    seen.add(s.dutch);
  }
  return Array.from(seen);
}

function assertDoesNotInclude(list: string[], bad: string[]) {
  for (const b of bad) {
    if (list.includes(b)) {
      console.error('Bad example generated:', b);
      process.exitCode = 2;
      throw new Error('Generated bad example');
    }
  }
}

function assertIncludes(list: string[], good: string[]) {
  for (const g of good) {
    if (list.some((s) => s.includes(g))) return; // accept partial match
  }
  console.error('None of the good examples found in samples');
  console.error(list.slice(0,20));
  process.exitCode = 3;
  throw new Error('Missing good examples');
}

(async function run() {
  console.log('Sampling transport-location...');
  const transport = sample('transport-location', 300);
  assertDoesNotInclude(transport, ['morgen loopt hij in de winkel', 'je bent oud want het huiswerk is moeilijk']);
  assertIncludes(transport, ['de trein', 'naar het station', 'met de trein', 'naar de stad']);

  console.log('Sampling demonstratives...');
  const demos = sample('demonstratives', 200);
  assertDoesNotInclude(demos, ['die bloem is zuur']);
  assertIncludes(demos, ['bloem', 'boek', 'tafel']);

  console.log('Sampling omdat-want...');
  const omdat = sample('omdat-want', 300);
  assertDoesNotInclude(omdat, ['jij bent oud want het huiswerk is moeilijk']);
  assertIncludes(omdat, ['omdat', 'want']);

  console.log('All semantic tests passed (sampled outputs).');
})();
