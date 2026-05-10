/**
 * Dutch Noun Metadata Database
 * 
 * Comprehensive dictionary of common Dutch nouns with grammar properties
 * Used for article validation and grammar-aware feedback
 */

import { NounMetadata } from './grammar-types';

export const nounDatabase: { [noun: string]: NounMetadata } = {
  // UNCOUNTABLE NOUNS (cannot use "een", always use "de" or "het")
  
  // "de" uncountable nouns
  koffie: {
    type: 'uncountable',
    gender: 'de',
    articleAllowed: false,
    usageNote: 'Coffee is uncountable in Dutch'
  },
  thee: {
    type: 'uncountable',
    gender: 'de',
    articleAllowed: false,
    usageNote: 'Tea is uncountable'
  },
  melk: {
    type: 'uncountable',
    gender: 'de',
    articleAllowed: false,
    usageNote: 'Milk is uncountable'
  },
  water: {
    type: 'uncountable',
    gender: 'het',
    articleAllowed: false,
    usageNote: 'Water is uncountable'
  },
  wijn: {
    type: 'uncountable',
    gender: 'de',
    articleAllowed: false,
    usageNote: 'Wine is uncountable'
  },
  bier: {
    type: 'uncountable',
    gender: 'het',
    articleAllowed: false,
    usageNote: 'Beer is uncountable'
  },
  brood: {
    type: 'uncountable',
    gender: 'het',
    articleAllowed: false,
    usageNote: 'Bread is uncountable'
  },
  kaas: {
    type: 'uncountable',
    gender: 'de',
    articleAllowed: false,
    usageNote: 'Cheese is uncountable'
  },
  vlees: {
    type: 'uncountable',
    gender: 'het',
    articleAllowed: false,
    usageNote: 'Meat is uncountable'
  },
  fruit: {
    type: 'uncountable',
    gender: 'het',
    articleAllowed: false,
    usageNote: 'Fruit is uncountable'
  },
  
  // COUNTABLE NOUNS (can use "een", plural with "s")
  
  // "de" countable nouns
  stad: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'steden',
    usageNote: 'City - common noun'
  },
  man: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'mannen',
    usageNote: 'Man - common noun'
  },
  vrouw: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'vrouwen',
    usageNote: 'Woman - common noun'
  },
  kind: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'kinderen',
    usageNote: 'Child - neuter noun'
  },
  tafel: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'tafels',
    usageNote: 'Table - common noun'
  },
  stoel: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'stoelen',
    usageNote: 'Chair - common noun'
  },
  deur: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'deuren',
    usageNote: 'Door - common noun'
  },
  fiets: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'fietsen',
    usageNote: 'Bicycle - common noun'
  },
  auto: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'auto\'s',
    usageNote: 'Car - common noun'
  },
  trein: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'treinen',
    usageNote: 'Train - common noun'
  },
  bus: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'bussen',
    usageNote: 'Bus - common noun'
  },
  kat: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'katten',
    usageNote: 'Cat - common noun'
  },
  hond: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'honden',
    usageNote: 'Dog - common noun'
  },
  boom: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'bomen',
    usageNote: 'Tree - common noun'
  },
  school: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'scholen',
    usageNote: 'School - common noun'
  },
  dag: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'dagen',
    usageNote: 'Day - common noun'
  },
  nacht: {
    type: 'countable',
    gender: 'de',
    articleAllowed: true,
    pluralForm: 'nachten',
    usageNote: 'Night - common noun'
  },
  werk: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'werken',
    usageNote: 'Work/job - neuter noun'
  },
  
  // "het" countable nouns
  huis: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'huizen',
    usageNote: 'House - neuter noun'
  },
  boek: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'boeken',
    usageNote: 'Book - neuter noun'
  },
  raam: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'ramen',
    usageNote: 'Window - neuter noun'
  },
  bed: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'bedden',
    usageNote: 'Bed - neuter noun'
  },
  jaar: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'jaren',
    usageNote: 'Year - neuter noun'
  },
  uur: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'uren',
    usageNote: 'Hour - neuter noun'
  },
  moment: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'momenten',
    usageNote: 'Moment - neuter noun'
  },
  spel: {
    type: 'countable',
    gender: 'het',
    articleAllowed: true,
    pluralForm: 'spelen',
    usageNote: 'Game - neuter noun'
  },
};

/**
 * Check if a noun is uncountable
 */
export function isUncountable(noun: string): boolean {
  const normalized = noun.toLowerCase().trim();
  const meta = nounDatabase[normalized];
  return meta?.type === 'uncountable';
}

/**
 * Get the correct article for a noun
 */
export function getArticleForNoun(noun: string): 'de' | 'het' | undefined {
  const normalized = noun.toLowerCase().trim();
  return nounDatabase[normalized]?.gender;
}

/**
 * Check if a noun can have an article
 */
export function canHaveArticle(noun: string): boolean {
  const normalized = noun.toLowerCase().trim();
  return nounDatabase[normalized]?.articleAllowed ?? true;
}

/**
 * Get metadata for a noun
 */
export function getNounMetadata(noun: string): NounMetadata | undefined {
  const normalized = noun.toLowerCase().trim();
  return nounDatabase[normalized];
}
