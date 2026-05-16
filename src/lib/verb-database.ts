/**
 * Dutch Verb Metadata Database
 * 
 * Comprehensive dictionary of common Dutch verbs with conjugations
 * Used for verb validation and tense/conjugation error detection
 */

import { VerbMetadata } from './grammar-types';

export const verbDatabase: { [infinitive: string]: VerbMetadata } = {
  // AUXILIARY VERBS
  
  zijn: {
    infinitive: 'zijn',
    conjugations: {
      present: {
        ik: 'ben',
        jij: 'bent',
        je: 'bent',
        hij: 'is',
        zij: 'is',
        het: 'is',
        wij: 'zijn',
        jullie: 'zijn',
        ze: 'zijn'
      },
      past: {
        ik: 'was',
        jij: 'was',
        je: 'was',
        hij: 'was',
        zij: 'was',
        het: 'was',
        wij: 'waren',
        jullie: 'waren',
        ze: 'waren'
      },
      perfect: {
        ik: 'ben geweest',
        jij: 'bent geweest',
        je: 'bent geweest',
        hij: 'is geweest',
        zij: 'is geweest',
        het: 'is geweest',
        wij: 'zijn geweest',
        jullie: 'zijn geweest',
        ze: 'zijn geweest'
      }
    },
    isAuxiliary: true,
    isSeparable: false,
    perfectAuxiliary: 'zijn',
    participle: 'geweest',
    usageNote: 'Primary auxiliary verb'
  },

  hebben: {
    infinitive: 'hebben',
    conjugations: {
      present: {
        ik: 'heb',
        jij: 'hebt',
        je: 'hebt',
        hij: 'heeft',
        zij: 'heeft',
        het: 'heeft',
        wij: 'hebben',
        jullie: 'hebben',
        ze: 'hebben'
      },
      past: {
        ik: 'had',
        jij: 'had',
        je: 'had',
        hij: 'had',
        zij: 'had',
        het: 'had',
        wij: 'hadden',
        jullie: 'hadden',
        ze: 'hadden'
      },
      perfect: {
        ik: 'heb gehad',
        jij: 'hebt gehad',
        je: 'hebt gehad',
        hij: 'heeft gehad',
        zij: 'heeft gehad',
        het: 'heeft gehad',
        wij: 'hebben gehad',
        jullie: 'hebben gehad',
        ze: 'hebben gehad'
      }
    },
    isAuxiliary: true,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gehad',
    usageNote: 'Primary auxiliary verb'
  },

  // MODAL VERBS
  
  kunnen: {
    infinitive: 'kunnen',
    conjugations: {
      present: {
        ik: 'kan',
        jij: 'kunt',
        je: 'kunt',
        hij: 'kan',
        zij: 'kan',
        het: 'kan',
        wij: 'kunnen',
        jullie: 'kunnen',
        ze: 'kunnen'
      },
      past: {
        ik: 'kon',
        jij: 'kon',
        je: 'kon',
        hij: 'kon',
        zij: 'kon',
        het: 'kon',
        wij: 'konden',
        jullie: 'konden',
        ze: 'konden'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    isModal: true,
    perfectAuxiliary: 'hebben',
    participle: 'gekund',
    usageNote: 'Can / to be able to'
  },

  moeten: {
    infinitive: 'moeten',
    conjugations: {
      present: {
        ik: 'moet',
        jij: 'moet',
        je: 'moet',
        hij: 'moet',
        zij: 'moet',
        het: 'moet',
        wij: 'moeten',
        jullie: 'moeten',
        ze: 'moeten'
      },
      past: {
        ik: 'moest',
        jij: 'moest',
        je: 'moest',
        hij: 'moest',
        zij: 'moest',
        het: 'moest',
        wij: 'moesten',
        jullie: 'moesten',
        ze: 'moesten'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    isModal: true,
    perfectAuxiliary: 'hebben',
    participle: 'gemoeten',
    usageNote: 'Must / have to'
  },

  willen: {
    infinitive: 'willen',
    conjugations: {
      present: {
        ik: 'wil',
        jij: 'wilt',
        je: 'wilt',
        hij: 'wil',
        zij: 'wil',
        het: 'wil',
        wij: 'willen',
        jullie: 'willen',
        ze: 'willen'
      },
      past: {
        ik: 'wilde',
        jij: 'wilde',
        je: 'wilde',
        hij: 'wilde',
        zij: 'wilde',
        het: 'wilde',
        wij: 'wilden',
        jullie: 'wilden',
        ze: 'wilden'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    isModal: true,
    perfectAuxiliary: 'hebben',
    participle: 'gewild',
    usageNote: 'Want to / will'
  },

  // COMMON REGULAR VERBS

  werken: {
    infinitive: 'werken',
    conjugations: {
      present: {
        ik: 'werk',
        jij: 'werkt',
        je: 'werkt',
        hij: 'werkt',
        zij: 'werkt',
        het: 'werkt',
        wij: 'werken',
        jullie: 'werken',
        ze: 'werken'
      },
      past: {
        ik: 'werkte',
        jij: 'werkte',
        je: 'werkte',
        hij: 'werkte',
        zij: 'werkte',
        het: 'werkte',
        wij: 'werkten',
        jullie: 'werkten',
        ze: 'werkten'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gewerkt',
    usageNote: 'To work'
  },

  lezen: {
    infinitive: 'lezen',
    conjugations: {
      present: {
        ik: 'lees',
        jij: 'leest',
        je: 'leest',
        hij: 'leest',
        zij: 'leest',
        het: 'leest',
        wij: 'lezen',
        jullie: 'lezen',
        ze: 'lezen'
      },
      past: {
        ik: 'las',
        jij: 'las',
        je: 'las',
        hij: 'las',
        zij: 'las',
        het: 'las',
        wij: 'lazen',
        jullie: 'lazen',
        ze: 'lazen'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gelezen',
    usageNote: 'To read'
  },

  eten: {
    infinitive: 'eten',
    conjugations: {
      present: {
        ik: 'eet',
        jij: 'eet',
        je: 'eet',
        hij: 'eet',
        zij: 'eet',
        het: 'eet',
        wij: 'eten',
        jullie: 'eten',
        ze: 'eten'
      },
      past: {
        ik: 'at',
        jij: 'at',
        je: 'at',
        hij: 'at',
        zij: 'at',
        het: 'at',
        wij: 'aten',
        jullie: 'aten',
        ze: 'aten'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gegeten',
    usageNote: 'To eat'
  },

  drinken: {
    infinitive: 'drinken',
    conjugations: {
      present: {
        ik: 'drink',
        jij: 'drinkt',
        je: 'drinkt',
        hij: 'drinkt',
        zij: 'drinkt',
        het: 'drinkt',
        wij: 'drinken',
        jullie: 'drinken',
        ze: 'drinken'
      },
      past: {
        ik: 'dronk',
        jij: 'dronk',
        je: 'dronk',
        hij: 'dronk',
        zij: 'dronk',
        het: 'dronk',
        wij: 'dronken',
        jullie: 'dronken',
        ze: 'dronken'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gedronken',
    usageNote: 'To drink'
  },

  gaan: {
    infinitive: 'gaan',
    conjugations: {
      present: {
        ik: 'ga',
        jij: 'gaat',
        je: 'gaat',
        hij: 'gaat',
        zij: 'gaat',
        het: 'gaat',
        wij: 'gaan',
        jullie: 'gaan',
        ze: 'gaan'
      },
      past: {
        ik: 'ging',
        jij: 'ging',
        je: 'ging',
        hij: 'ging',
        zij: 'ging',
        het: 'ging',
        wij: 'gingen',
        jullie: 'gingen',
        ze: 'gingen'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'zijn',
    participle: 'gegaan',
    usageNote: 'To go'
  },

  komen: {
    infinitive: 'komen',
    conjugations: {
      present: {
        ik: 'kom',
        jij: 'komt',
        je: 'komt',
        hij: 'komt',
        zij: 'komt',
        het: 'komt',
        wij: 'komen',
        jullie: 'komen',
        ze: 'komen'
      },
      past: {
        ik: 'kwam',
        jij: 'kwam',
        je: 'kwam',
        hij: 'kwam',
        zij: 'kwam',
        het: 'kwam',
        wij: 'kwamen',
        jullie: 'kwamen',
        ze: 'kwamen'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'zijn',
    participle: 'gekomen',
    usageNote: 'To come'
  },

  spreken: {
    infinitive: 'spreken',
    conjugations: {
      present: {
        ik: 'spreek',
        jij: 'spreekt',
        je: 'spreekt',
        hij: 'spreekt',
        zij: 'spreekt',
        het: 'spreekt',
        wij: 'spreken',
        jullie: 'spreken',
        ze: 'spreken'
      },
      past: {
        ik: 'sprak',
        jij: 'sprak',
        je: 'sprak',
        hij: 'sprak',
        zij: 'sprak',
        het: 'sprak',
        wij: 'spraken',
        jullie: 'spraken',
        ze: 'spraken'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'gesproken',
    usageNote: 'To speak'
  },

  uitleggen: {
    infinitive: 'uitleggen',
    conjugations: {
      present: {
        ik: 'leg uit',
        jij: 'legt uit',
        je: 'legt uit',
        hij: 'legt uit',
        zij: 'legt uit',
        het: 'legt uit',
        wij: 'leggen uit',
        jullie: 'leggen uit',
        ze: 'leggen uit'
      },
      past: {
        ik: 'legde uit',
        jij: 'legde uit',
        je: 'legde uit',
        hij: 'legde uit',
        zij: 'legde uit',
        het: 'legde uit',
        wij: 'legden uit',
        jullie: 'legden uit',
        ze: 'legden uit'
      }
    },
    isAuxiliary: false,
    isSeparable: true,
    separablePrefix: 'uit',
    perfectAuxiliary: 'hebben',
    participle: 'uitgelegd',
    usageNote: 'To explain'
  },

  aankomen: {
    infinitive: 'aankomen',
    conjugations: {
      present: {
        ik: 'kom aan',
        jij: 'komt aan',
        je: 'komt aan',
        hij: 'komt aan',
        zij: 'komt aan',
        het: 'komt aan',
        wij: 'komen aan',
        jullie: 'komen aan',
        ze: 'komen aan'
      },
      past: {
        ik: 'kwam aan',
        jij: 'kwam aan',
        je: 'kwam aan',
        hij: 'kwam aan',
        zij: 'kwam aan',
        het: 'kwam aan',
        wij: 'kwamen aan',
        jullie: 'kwamen aan',
        ze: 'kwamen aan'
      }
    },
    isAuxiliary: false,
    isSeparable: true,
    separablePrefix: 'aan',
    perfectAuxiliary: 'zijn',
    participle: 'aangekomen',
    usageNote: 'To arrive'
  },

  opstaan: {
    infinitive: 'opstaan',
    conjugations: {
      present: {
        ik: 'sta op',
        jij: 'staat op',
        je: 'staat op',
        hij: 'staat op',
        zij: 'staat op',
        het: 'staat op',
        wij: 'staan op',
        jullie: 'staan op',
        ze: 'staan op'
      },
      past: {
        ik: 'stond op',
        jij: 'stond op',
        je: 'stond op',
        hij: 'stond op',
        zij: 'stond op',
        het: 'stond op',
        wij: 'stonden op',
        jullie: 'stonden op',
        ze: 'stonden op'
      }
    },
    isAuxiliary: false,
    isSeparable: true,
    separablePrefix: 'op',
    perfectAuxiliary: 'zijn',
    participle: 'opgestaan',
    usageNote: 'To get up'
  },

  afmaken: {
    infinitive: 'afmaken',
    conjugations: {
      present: {
        ik: 'maak af',
        jij: 'maakt af',
        je: 'maakt af',
        hij: 'maakt af',
        zij: 'maakt af',
        het: 'maakt af',
        wij: 'maken af',
        jullie: 'maken af',
        ze: 'maken af'
      },
      past: {
        ik: 'maakte af',
        jij: 'maakte af',
        je: 'maakte af',
        hij: 'maakte af',
        zij: 'maakte af',
        het: 'maakte af',
        wij: 'maakten af',
        jullie: 'maakten af',
        ze: 'maakten af'
      }
    },
    isAuxiliary: false,
    isSeparable: true,
    separablePrefix: 'af',
    perfectAuxiliary: 'hebben',
    participle: 'afgemaakt',
    usageNote: 'To finish'
  },

  meenemen: {
    infinitive: 'meenemen',
    conjugations: {
      present: {
        ik: 'neem mee',
        jij: 'neemt mee',
        je: 'neemt mee',
        hij: 'neemt mee',
        zij: 'neemt mee',
        het: 'neemt mee',
        wij: 'nemen mee',
        jullie: 'nemen mee',
        ze: 'nemen mee'
      },
      past: {
        ik: 'nam mee',
        jij: 'nam mee',
        je: 'nam mee',
        hij: 'nam mee',
        zij: 'nam mee',
        het: 'nam mee',
        wij: 'namen mee',
        jullie: 'namen mee',
        ze: 'namen mee'
      }
    },
    isAuxiliary: false,
    isSeparable: true,
    separablePrefix: 'mee',
    perfectAuxiliary: 'hebben',
    participle: 'meegenomen',
    usageNote: 'To take along'
  },

  schreiben: {
    infinitive: 'schrijven',
    conjugations: {
      present: {
        ik: 'schrijf',
        jij: 'schrijft',
        je: 'schrijft',
        hij: 'schrijft',
        zij: 'schrijft',
        het: 'schrijft',
        wij: 'schrijven',
        jullie: 'schrijven',
        ze: 'schrijven'
      },
      past: {
        ik: 'schreef',
        jij: 'schreef',
        je: 'schreef',
        hij: 'schreef',
        zij: 'schreef',
        het: 'schreef',
        wij: 'schreven',
        jullie: 'schreven',
        ze: 'schreven'
      }
    },
    isAuxiliary: false,
    isSeparable: false,
    perfectAuxiliary: 'hebben',
    participle: 'geschreven',
    usageNote: 'To write'
  },
};

/**
 * Get metadata for a verb
 */
export function getVerbMetadata(infinitive?: string | null): VerbMetadata | undefined {
  if (typeof infinitive !== 'string') {
    return undefined;
  }

  const normalized = infinitive.toLowerCase().trim();
  if (!normalized) {
    return undefined;
  }

  return verbDatabase[normalized];
}

/**
 * Get conjugation for a verb in specific tense and person
 */
export function getConjugation(
  infinitive: string,
  tense: 'present' | 'past' | 'perfect',
  subject: string
): string | undefined {
  const meta = getVerbMetadata(infinitive);
  if (!meta) return undefined;
  
  const normalized = subject.toLowerCase().trim();
  return meta.conjugations[tense]?.[normalized];
}

/**
 * Check if a verb is modal
 */
export function isModalVerb(infinitive: string): boolean {
  return getVerbMetadata(infinitive)?.isModal ?? false;
}

/**
 * Check if a verb is auxiliary
 */
export function isAuxiliaryVerb(infinitive: string): boolean {
  return getVerbMetadata(infinitive)?.isAuxiliary ?? false;
}

/**
 * Get the perfect auxiliary for a verb (hebben or zijn)
 */
export function getPerfectAuxiliary(infinitive: string): 'hebben' | 'zijn' | undefined {
  return getVerbMetadata(infinitive)?.perfectAuxiliary;
}

/**
 * Get the past participle for a verb
 */
export function getParticiple(infinitive: string): string | undefined {
  return getVerbMetadata(infinitive)?.participle;
}
