import { GeneratedSentence } from "../sentence-generation/generator";
import { findVerbCollocation, findNounCollocation } from "./collocations";

export type QualityScores = {
  grammarScore: number;
  semanticScore: number;
  naturalnessScore: number;
  educationalScore: number;
  overall: number;
};

export function scoreCandidate(candidate: { dutch: string; english: string }, intent: any): QualityScores {
  // Start optimistic
  let grammarScore = 1;
  let semanticScore = 1;
  let naturalnessScore = 1;
  let educationalScore = 1;

  // 1) Verb requirements
  try {
    const verb = intent?.verb?.infinitive;
    if (verb) {
      const vmeta = findVerbCollocation(verb);
      if (vmeta) {
        if (vmeta.requiresDirectObject) {
          const hasObject = Boolean(intent.object || candidate.dutch.match(/\b(de|het|een)\s+\w+/));
          if (!hasObject) semanticScore *= 0.2;
        }
        if (vmeta.requiresPreposition) {
          const prep = vmeta.requiresPreposition;
          if (!candidate.dutch.includes(` ${prep} `) && !candidate.dutch.includes(`${prep} `)) semanticScore *= 0.2;
        }
        if (vmeta.naturalLocationRelations && intent.location) {
          // prefer naar/door for movement verbs; penalize 'in de' when movement implied
          if (/\b(in de|in het)\b/.test(candidate.dutch)) {
            naturalnessScore *= 0.3;
          }
        }
      }
    }

    // 2) Adjective-noun compatibility
    const noun = intent?.object?.word ?? intent?.location?.noun?.word ?? intent?.object;
    const adjMatch = candidate.dutch.match(/\b(is|zijn)\s+([^.]+)/);
    if (noun && adjMatch) {
      const nmeta = findNounCollocation(noun);
      if (nmeta) {
        const adj = adjMatch[2].trim().split(/[\s,.!?]/)[0];
        if (!nmeta.compatibleAdjectives.includes(adj)) {
          naturalnessScore *= 0.2;
        }
      }
    }

    // 3) Causal coherence simple checks
    if (intent?.grammarType === 'omdat-want') {
      const adj = intent?.verb?.infinitive === 'zijn' ? candidate.dutch.split(' ').slice(-1)[0] : null;
      // crude rule: if adjective is age words, don't accept homework reason
      if (adj && ['oud','jong'].includes(adj)) {
        if (candidate.dutch.includes('huiswerk') || candidate.dutch.includes('het huiswerk')) semanticScore *= 0.2;
      }
    }

    // 4) Subject semantic filtering
    const subjType = intent?.subject?.semanticType;
    if (intent?.verb?.infinitive) {
      const vmeta = findVerbCollocation(intent.verb.infinitive);
      if (vmeta && vmeta.allowedSubjectTypes && subjType && !vmeta.allowedSubjectTypes.includes(subjType)) {
        semanticScore *= 0.2;
      }
    }
  } catch (e) {
    // don't fail scoring on unexpected structure
    console.warn('quality scoring error', e);
  }

  // Combine scores simply
  const overall = (grammarScore + semanticScore + naturalnessScore + educationalScore) / 4;
  return {
    grammarScore,
    semanticScore,
    naturalnessScore,
    educationalScore,
    overall
  };
}
