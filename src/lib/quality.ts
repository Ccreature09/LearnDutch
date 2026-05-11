import { GeneratedSentence } from "../sentence-generation/generator";
import { findVerbCollocation, findNounCollocation, getVerbComplementRequirements } from "./collocations";
import { GrammarIntent } from "../grammar/metadata/types";

export type QualityScores = {
  grammarScore: number;
  semanticScore: number;
  naturalnessScore: number;
  educationalScore: number;
  overall: number;
};

export function scoreCandidate(candidate: { dutch: string; english: string }, intent?: GrammarIntent): QualityScores {
  // Start optimistic
  const grammarScore = 1;
  let semanticScore = 1;
  let naturalnessScore = 1;
  const educationalScore = 1;

  // 1) Verb requirements
  try {
    const verb = intent?.verb?.infinitive;
    if (verb) {
      const vmeta = findVerbCollocation(verb);
      const requirements = getVerbComplementRequirements(verb);
      if (vmeta) {
        if (vmeta.requiresDirectObject) {
          const hasObject = Boolean(intent.object || candidate.dutch.match(/\b(de|het|een)\s+\w+/));
          if (!hasObject) semanticScore *= 0.2;
        }
        if (vmeta.requiresPreposition) {
          const prep = vmeta.requiresPreposition;
          if (!candidate.dutch.includes(` ${prep} `) && !candidate.dutch.includes(`${prep} `)) semanticScore *= 0.2;
        }
        if (vmeta.requiresObjectOrClause) {
          const hasClause = /\b(dat|of|omdat|terwijl|want)\b/.test(candidate.dutch);
          const hasObject = Boolean(intent.object || candidate.dutch.match(/\b(de|het|een)\s+\w+/));
          if (!hasClause && !hasObject) semanticScore *= 0.15;
        }
        if (vmeta.naturalLocationRelations && intent.location) {
          // prefer naar/door for movement verbs; penalize 'in de' when movement implied
          if (/\b(in de|in het)\b/.test(candidate.dutch)) {
            naturalnessScore *= 0.3;
          }
        }
      }

      if (requirements.includes("infinitive")) {
        const tokens = candidate.dutch.toLowerCase().split(/\s+/);
        if (tokens.length < 4) {
          semanticScore *= 0.1;
        }
      }
    }

    // 2) Adjective-noun compatibility
    const noun = typeof intent?.object === 'string'
      ? intent.object
      : intent?.object?.word ?? intent?.location?.noun?.word;
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

    if (intent?.grammarType === 'questions-inversion' || intent?.grammarType === 'fronted-inversion') {
      if (/(\bwil\b|\bmoet\b|\bkan\b|\bmag\b|\bzal\b|\bhoef\b|\bdurf\b)/.test(candidate.dutch) && !/\b(te|dat|naar|op|mee|uit|aan)\b/.test(candidate.dutch)) {
        semanticScore *= 0.2;
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
