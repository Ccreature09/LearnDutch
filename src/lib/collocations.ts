export type VerbCollocation = {
  verb: string;
  requiresDirectObject?: boolean;
  requiresObjectOrClause?: boolean;
  requiresInfinitive?: boolean;
  requiresPreposition?: string;
  preferredPreposition?: string;
  commonObjects?: string[];
  allowedSubjectTypes?: Array<"person" | "group" | "animal" | "thing">;
  naturalLocationRelations?: string[];
};

export type NounCollocation = {
  noun: string;
  compatibleAdjectives: string[];
};

export const verbCollocations: VerbCollocation[] = [
  {
    verb: "nemen",
    requiresDirectObject: true,
    commonObjects: ["de trein", "de bus", "de metro", "de tram", "een beslissing", "een pauze"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "geven",
    requiresDirectObject: true,
    commonObjects: ["een cadeau", "een boek", "een les", "een presentatie"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "maken",
    requiresDirectObject: true,
    commonObjects: ["huiswerk", "een plan", "een afspraak", "een foto", "een fout"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "luisteren",
    requiresPreposition: "naar",
    commonObjects: ["muziek", "de radio", "een podcast", "de les"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "kijken",
    preferredPreposition: "naar",
    // FIX: use proper articles so English side never gets bare "televisie"
    commonObjects: ["een film", "de televisie", "het nieuws"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "lopen",
    naturalLocationRelations: ["naar", "door"],
    allowedSubjectTypes: ["person", "animal"],
  },
  {
    verb: "doen",
    requiresDirectObject: true,
    // FIX: "werk" removed — only "huiswerk" and "boodschappen" are natural with doen
    commonObjects: ["huiswerk", "boodschappen"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "vinden",
    requiresDirectObject: true,
    commonObjects: ["een boek", "de sleutels", "een cadeau"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "spreken",
    requiresDirectObject: true,
    commonObjects: ["Nederlands", "Engels", "Frans"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "zeggen",
    requiresObjectOrClause: true,
    commonObjects: ["dat", "iets", "het"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "weten",
    requiresObjectOrClause: true,
    commonObjects: ["dat", "het"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "denken",
    requiresObjectOrClause: true,
    commonObjects: ["dat", "eraan"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "reizen",
    naturalLocationRelations: ["naar", "door"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "fietsen",
    naturalLocationRelations: ["naar", "door"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "rijden",
    naturalLocationRelations: ["naar"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "schrijven",
    requiresDirectObject: true,
    commonObjects: ["een brief", "een e-mail", "een programma", "de opdracht"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "betalen",
    requiresDirectObject: true,
    commonObjects: ["de rekening", "contant", "de huur"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "zoeken",
    requiresDirectObject: true,
    commonObjects: ["een kamer", "een stage", "de sleutels", "een baan"],
    allowedSubjectTypes: ["person", "group"],
  },
  {
    verb: "vragen",
    requiresObjectOrClause: true,
    commonObjects: ["of", "dat", "de weg"],
    allowedSubjectTypes: ["person", "group"],
  },
];

export const nounCollocations: NounCollocation[] = [
  { noun: "bloem", compatibleAdjectives: ["mooi", "rood", "groot", "klein", "vers"] },
  { noun: "koffie", compatibleAdjectives: ["warm", "sterk", "lekker", "koud"] },
  { noun: "huiswerk", compatibleAdjectives: ["moeilijk", "saai", "interessant"] },
  { noun: "tafel", compatibleAdjectives: ["groot", "oud", "lelijk", "schoon", "klein"] },
  { noun: "boek", compatibleAdjectives: ["interessant", "nieuw", "oud", "saai"] },
  { noun: "stad", compatibleAdjectives: ["groot", "druk", "mooi", "oud"] },
  { noun: "soep", compatibleAdjectives: ["warm", "koud", "zout", "lekker"] },
  { noun: "mes", compatibleAdjectives: ["schoon", "klein", "groot"] },
  { noun: "project", compatibleAdjectives: ["nieuw", "groot", "interessant", "moeilijk"] },
  { noun: "les", compatibleAdjectives: ["moeilijk", "interessant", "kort", "saai"] },
  { noun: "lamp", compatibleAdjectives: ["groot", "klein", "oud", "nieuw"] },
  { noun: "jas", compatibleAdjectives: ["warm", "mooi", "oud", "nieuw", "groot"] },
  { noun: "huis", compatibleAdjectives: ["groot", "klein", "oud", "nieuw", "mooi"] },
  { noun: "schoen", compatibleAdjectives: ["nieuw", "oud", "schoon", "klein", "groot"] },
  { noun: "laptop", compatibleAdjectives: ["nieuw", "oud", "snel", "groot", "klein"] },
];

export function findVerbCollocation(verb: string) {
  return verbCollocations.find((v) => v.verb === verb);
}

export function findNounCollocation(noun: string) {
  return nounCollocations.find((n) => n.noun === noun);
}

export type VerbComplementRequirement =
  | "direct_object"
  | "object_or_clause"
  | "infinitive"
  | `preposition:${string}`;

export function getVerbComplementRequirements(verb: string): VerbComplementRequirement[] {
  const collocation = findVerbCollocation(verb);
  const requirements: VerbComplementRequirement[] = [];
  if (collocation?.requiresDirectObject) requirements.push("direct_object");
  if (collocation?.requiresObjectOrClause) requirements.push("object_or_clause");
  if (collocation?.requiresInfinitive) requirements.push("infinitive");
  if (collocation?.requiresPreposition) requirements.push(`preposition:${collocation.requiresPreposition}`);
  return requirements;
}