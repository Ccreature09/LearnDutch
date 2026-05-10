import { GrammarError } from "../../lib/grammar-types";
import { buildExplanation } from "../../lib/grammar-explanations";

export function explainGrammarError(error: GrammarError): string {
  if (error.explanation) return error.explanation;
  return buildExplanation(error.type);
}
