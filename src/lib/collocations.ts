export type VerbCollocation = {
  verb: string;
  requiresDirectObject?: boolean;
  requiresObjectOrClause?: boolean;
  requiresInfinitive?: boolean;
  requiresPreposition?: string; // e.g., 'naar' or 'op' meaning must use that prep
  preferredPreposition?: string;
  commonObjects?: string[]; // Dutch noun words (with article or not)
  allowedSubjectTypes?: Array<'person'|'group'|'animal'|'thing'>;
  naturalLocationRelations?: string[]; // e.g., ['naar','door']
};

export type NounCollocation = {
  noun: string;
  compatibleAdjectives: string[]; // dutch adjectives
};

export const verbCollocations: VerbCollocation[] = [
  {
    verb: 'nemen',
    requiresDirectObject: true,
    commonObjects: ['de trein', 'de bus', 'een beslissing', 'een pauze'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'geven',
    requiresDirectObject: true,
    commonObjects: ['een cadeau', 'een boek', 'een les'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'maken',
    requiresDirectObject: true,
    commonObjects: ['huiswerk', 'een plan', 'een afspraak', 'een foto'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'luisteren',
    requiresPreposition: 'naar',
    commonObjects: ['muziek', 'de radio', 'podcast', 'vogels'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'kijken',
    preferredPreposition: 'naar',
    commonObjects: ['een film', 'televisie', 'vogels'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'lopen',
    naturalLocationRelations: ['naar','door'],
    allowedSubjectTypes: ['person','animal']
  },
  {
    verb: 'doen',
    requiresDirectObject: true,
    commonObjects: ['huiswerk', 'boodschappen', 'werk'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'vinden',
    requiresDirectObject: true,
    commonObjects: ['een boek', 'de sleutels', 'een cadeau', 'het restaurant'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'spreken',
    requiresDirectObject: true,
    commonObjects: ['Nederlands', 'Engels', 'Frans'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'zeggen',
    requiresObjectOrClause: true,
    commonObjects: ['dat', 'iets', 'het'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'weten',
    requiresObjectOrClause: true,
    commonObjects: ['dat', 'het'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'denken',
    requiresObjectOrClause: true,
    commonObjects: ['dat', 'eraan'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'willen',
    requiresInfinitive: true,
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'moeten',
    requiresInfinitive: true,
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'kunnen',
    requiresInfinitive: true,
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'mogen',
    requiresInfinitive: true,
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'reizen',
    naturalLocationRelations: ['naar','door'],
    allowedSubjectTypes: ['person','group']
  },
  {
    verb: 'fietsen',
    naturalLocationRelations: ['naar','door'],
    allowedSubjectTypes: ['person','group']
  }
];

export const nounCollocations: NounCollocation[] = [
  { noun: 'bloem', compatibleAdjectives: ['mooi','rood','groot','klein'] },
  { noun: 'koffie', compatibleAdjectives: ['warm','sterk','lekker'] },
  { noun: 'huiswerk', compatibleAdjectives: ['moeilijk','saai'] },
  { noun: 'tafel', compatibleAdjectives: ['groot','oud','lelijk','schoon'] },
  { noun: 'boek', compatibleAdjectives: ['interessant','nieuw','oud'] },
  { noun: 'stad', compatibleAdjectives: ['groot','druk','modern','mooi'] },
  { noun: 'soep', compatibleAdjectives: ['warm','koud','zout','lekker'] },
  { noun: 'mes', compatibleAdjectives: ['scherp','schoon'] },
  { noun: 'project', compatibleAdjectives: ['nieuw','groot','belangrijk'] },
  { noun: 'les', compatibleAdjectives: ['moeilijk','interessant','kort'] },
  { noun: 'lamp', compatibleAdjectives: ['groot','klein','oud','modern'] },
  { noun: 'jas', compatibleAdjectives: ['warm','koud','mooi','lelijk'] }
];

export type ProfessionNoun = { word: string; isProfession: boolean };

export const professionNouns: ProfessionNoun[] = [
  { word: 'dokter', isProfession: true },
  { word: 'leraar', isProfession: true },
  { word: 'verpleegster', isProfession: true },
  { word: 'politieagent', isProfession: true },
  { word: 'boer', isProfession: true },
  { word: 'visser', isProfession: true },
  { word: 'advocaat', isProfession: true },
  { word: 'bakker', isProfession: true },
  { word: 'slager', isProfession: true },
  { word: 'ober', isProfession: true },
  { word: 'kapper', isProfession: true },
  { word: 'meisje', isProfession: false },
  { word: 'jongen', isProfession: false },
  { word: 'student', isProfession: false }
];

export function isProfessionNoun(word: string): boolean {
  const pnoun = professionNouns.find(p => p.word === word);
  return pnoun?.isProfession ?? false;
}

export type VerbComplementRequirement =
  | 'direct_object'
  | 'object_or_clause'
  | 'infinitive'
  | `preposition:${string}`;

export function getVerbComplementRequirements(verb: string): VerbComplementRequirement[] {
  const collocation = findVerbCollocation(verb);
  const requirements: VerbComplementRequirement[] = [];

  if (collocation?.requiresDirectObject) requirements.push('direct_object');
  if (collocation?.requiresObjectOrClause) requirements.push('object_or_clause');
  if (collocation?.requiresInfinitive) requirements.push('infinitive');
  if (collocation?.requiresPreposition) requirements.push(`preposition:${collocation.requiresPreposition}`);

  return requirements;
}

export function findVerbCollocation(verb: string) {
  return verbCollocations.find((v) => v.verb === verb);
}

export function findNounCollocation(noun: string) {
  return nounCollocations.find((n) => n.noun === noun);
}
