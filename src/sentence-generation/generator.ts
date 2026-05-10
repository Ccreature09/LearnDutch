import { PracticeCategory } from "../lib/types";
import { GrammarMetadata } from "../lib/grammar-types";
import {
  DutchModalInfinitive,
  GrammarIntent,
  GrammarLocation,
  GrammarNoun,
  GrammarSubject,
  GrammarVerb
} from "../grammar/metadata/types";
import {
  conjugatePresent,
  englishBe,
  englishDo,
  englishHave,
  englishModal,
  englishPresent,
  questionEnglishBe
} from "../grammar/conjugation/conjugator";
import { scoreCandidate } from "../lib/quality";
import { findVerbCollocation, findNounCollocation } from "../lib/collocations";

export type GeneratedSentence = {
  english: string;
  dutch: string;
  accepted?: string[];
  hint: string;
  grammarNote: string;
  grammar: GrammarMetadata;
  intent?: GrammarIntent;
};

type SubjectSemanticType = "person" | "group" | "animal" | "thing";

const subjects: GrammarSubject[] = [
  { pronoun: "ik", english: "I", person: 1, number: "singular", semanticType: "person" },
  { pronoun: "jij", english: "you (informal)", person: 2, number: "singular", semanticType: "person" },
  { pronoun: "je", english: "you (informal)", person: 2, number: "singular", semanticType: "person" },
  { pronoun: "u", english: "you (formal)", person: 2, number: "singular", formality: "formal", semanticType: "person" },
  { pronoun: "het", english: "it", person: 3, number: "singular", semanticType: "thing" },
  { pronoun: "hij", english: "he", person: 3, number: "singular", semanticType: "person" },
  { pronoun: "zij", english: "she", person: 3, number: "singular", semanticType: "person" },
  { pronoun: "zij", english: "they", person: 3, number: "plural", semanticType: "group" },
  { pronoun: "wij", english: "we", person: 1, number: "plural", semanticType: "group" },
  { pronoun: "we", english: "we", person: 1, number: "plural", semanticType: "group" },
  { pronoun: "ze", english: "they", person: 3, number: "plural", semanticType: "group" },
  { pronoun: "jullie", english: "you all", person: 2, number: "plural", semanticType: "group" }
];

const adjectives = [
  { english: "happy", dutch: "blij" },
  { english: "funny", dutch: "leuk" },
  { english: "pretty", dutch: "mooi" },
  { english: "old", dutch: "oud" },
  { english: "young", dutch: "jong" },
  { english: "good", dutch: "goed" },
  { english: "bad", dutch: "slecht" },
  { english: "busy", dutch: "druk" },
  { english: "tired", dutch: "moe" }
];

const peopleNouns: Array<GrammarNoun & { english: string }> = [
  { word: "leraar", english: "the teacher", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "leraren" },
  { word: "voetballer", english: "the football player", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "voetballers" },
  { word: "premier", english: "the prime minister", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "premiers" },
  { word: "student", english: "the student", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "studenten" },
  { word: "leerling", english: "the scholar", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "leerlingen" },
  { word: "baas", english: "the boss", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "bazen" },
  { word: "bakker", english: "the baker", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "bakkers" },
  { word: "slager", english: "the butcher", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "slagers" },
  { word: "boer", english: "the farmer", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "boeren" },
  { word: "visser", english: "the fisherman", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "vissers" },
  { word: "advocaat", english: "the lawyer", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "advocaten" },
  { word: "dokter", english: "the doctor", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "dokters" },
  { word: "ober", english: "the waiter", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "obers" },
  { word: "politieman", english: "the police officer", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "politiemannen" },
  { word: "agent", english: "the police officer", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "agenten" },
  { word: "kapper", english: "the hairdresser", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "kappers" },
  { word: "directeur", english: "the director", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "directeuren" },
  { word: "boekhouder", english: "the accountant", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "boekhouders" },
  { word: "verkoper", english: "the salesman", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "verkopers" },
  { word: "vertegenwoordiger", english: "the representative", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "vertegenwoordigers" },
  { word: "man", english: "the man", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "mannen" },
  { word: "vrouw", english: "the woman", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "vrouwen" },
  { word: "jongen", english: "the boy", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "jongens" },
  { word: "meisje", english: "the girl", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "meisjes" }
];

const locations: GrammarLocation[] = [
  {
    noun: { word: "stad", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "in de",
    english: "in the city"
  },
  {
    noun: { word: "straat", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "in de",
    english: "in the street"
  },
  {
    noun: { word: "supermarkt", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "in de",
    english: "in the supermarket"
  },
  {
    noun: { word: "winkel", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "in de",
    english: "in the shop"
  },
  {
    noun: { word: "school", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "op",
    english: "at school"
  },
  {
    noun: { word: "universiteit", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "op de",
    english: "at the university"
  },
  {
    noun: { word: "bibliotheek", gender: "de", countability: "countable", articleAllowed: true, article: "de" },
    preposition: "in de",
    english: "in the library"
  },
  {
    noun: { word: "station", gender: "het", countability: "countable", articleAllowed: true, article: "het" },
    preposition: "op het",
    english: "at the station"
  },
  {
    noun: { word: "kantoor", gender: "het", countability: "countable", articleAllowed: true, article: "het" },
    preposition: "in het",
    english: "in the office"
  },
  {
    noun: { word: "ziekenhuis", gender: "het", countability: "countable", articleAllowed: true, article: "het" },
    preposition: "in het",
    english: "in the hospital"
  },
  {
    noun: { word: "zwembad", gender: "het", countability: "countable", articleAllowed: true, article: "het" },
    preposition: "in het",
    english: "in the swimming pool"
  },
  {
    noun: { word: "huis", gender: "het", countability: "countable", articleAllowed: true, article: "het" },
    preposition: "thuis",
    english: "at home"
  }
];

const adverbs = [
  { english: "today", dutch: "vandaag" },
  { english: "tomorrow", dutch: "morgen" },
  { english: "usually", dutch: "meestal" },
  { english: "this evening", dutch: "vanavond" },
  { english: "on Monday", dutch: "op maandag" },
  { english: "every week", dutch: "elke week" },
  { english: "in winter", dutch: "in de winter" }
];

export const questionTimes = ["today", "tomorrow", "at school", "at home", "in the city", "this evening"];

export const questionTimesDutch = ["vandaag", "morgen", "op school", "thuis", "in de stad", "vanavond"];

const demonstrativeNouns: Array<GrammarNoun & { english: string; thisForm: string; thatForm: string }> = [
  {
    word: "boek",
    english: "book",
    gender: "het",
    countability: "countable",
    articleAllowed: true,
    article: "het",
    plural: "boeken",
    thisForm: "dit boek",
    thatForm: "dat boek"
  },
  {
    word: "tafel",
    english: "table",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "tafels",
    thisForm: "deze tafel",
    thatForm: "die tafel"
  },
  {
    word: "stad",
    english: "city",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "steden",
    thisForm: "deze stad",
    thatForm: "die stad"
  },
  {
    word: "bloem",
    english: "flower",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "bloemen",
    thisForm: "deze bloem",
    thatForm: "die bloem"
  },
  {
    word: "jas",
    english: "coat",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "jassen",
    thisForm: "deze jas",
    thatForm: "die jas"
  },
  {
    word: "schoen",
    english: "shoe",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "schoenen",
    thisForm: "deze schoen",
    thatForm: "die schoen"
  },
  {
    word: "mes",
    english: "knife",
    gender: "het",
    countability: "countable",
    articleAllowed: true,
    article: "het",
    plural: "messen",
    thisForm: "dit mes",
    thatForm: "dat mes"
  },
  {
    word: "huis",
    english: "house",
    gender: "het",
    countability: "countable",
    articleAllowed: true,
    article: "het",
    plural: "huizen",
    thisForm: "dit huis",
    thatForm: "dat huis"
  },
  {
    word: "lamp",
    english: "lamp",
    gender: "de",
    countability: "countable",
    articleAllowed: true,
    article: "de",
    plural: "lampen",
    thisForm: "deze lamp",
    thatForm: "die lamp"
  }
];

const objectNouns: Array<GrammarNoun & { english: string }> = [
  { word: "fiets", english: "a bike", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "fietsen" },
  { word: "boek", english: "a book", gender: "het", countability: "countable", articleAllowed: true, article: "een", plural: "boeken" },
  { word: "bloem", english: "a flower", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "bloemen" },
  { word: "boterham", english: "a slice of bread", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "boterhammen" },
  { word: "kroket", english: "a croquette", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "kroketten" },
  { word: "pannenkoek", english: "a pancake", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "pannenkoeken" },
  { word: "stroopwafel", english: "a syrup waffle", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "stroopwafels" },
  { word: "koffie", english: "coffee", gender: "de", countability: "uncountable", articleAllowed: false },
  { word: "thee", english: "tea", gender: "de", countability: "uncountable", articleAllowed: false },
  { word: "water", english: "water", gender: "het", countability: "uncountable", articleAllowed: false }
];

const modalOptions = [
  { english: "can", dutch: "kunnen", kind: "regular" },
  { english: "must", dutch: "moeten", kind: "regular" },
  { english: "have to", dutch: "moeten", kind: "regular" },
  { english: "want to", dutch: "willen", kind: "regular" },
  { english: "may", dutch: "mogen", kind: "regular" },
  { english: "are allowed to", dutch: "mogen", kind: "regular" },
  { english: "will", dutch: "zullen", kind: "regular" },
  { english: "dare to", dutch: "durven", kind: "regular" },
  { english: "need to", dutch: "hoeven", kind: "negative-only" }
] as const satisfies ReadonlyArray<{
  english: string;
  dutch: DutchModalInfinitive;
  kind: "regular" | "negative-only";
}>;

export const modalActions = [
  { english: "work tomorrow", dutch: "morgen werken" },
  { english: "read this book", dutch: "dit boek lezen" },
  { english: "stay at home", dutch: "thuis blijven" },
  { english: "travel to the city", dutch: "naar de stad reizen" },
  { english: "drink coffee", dutch: "koffie drinken" },
  { english: "leave early", dutch: "vroeg vertrekken" },
  { english: "help the teacher", dutch: "de leraar helpen" },
  { english: "study tonight", dutch: "vanavond studeren" },
  { english: "speak Dutch", dutch: "Nederlands spreken" },
  { english: "call the doctor", dutch: "de dokter bellen" },
  { english: "pay in cash", dutch: "contant betalen" },
  { english: "wait for the bus", dutch: "op de bus wachten" },
  { english: "take the train", dutch: "de trein nemen" },
  { english: "buy bread", dutch: "brood kopen" },
  { english: "visit my parents", dutch: "mijn ouders bezoeken" },
  { english: "finish the homework", dutch: "het huiswerk afmaken" },
  { english: "swim in the pool", dutch: "in het zwembad zwemmen" },
  { english: "sing in the choir", dutch: "in het koor zingen" },
  { english: "drive to work", dutch: "naar het werk rijden" },
  { english: "answer the email", dutch: "de e-mail beantwoorden" },
  { english: "open the window", dutch: "het raam openen" },
  { english: "lock the door", dutch: "de deur op slot doen" },
  { english: "try the soup", dutch: "de soep proberen" },
  { english: "forget the keys", dutch: "de sleutels vergeten" },
  { english: "choose a gift", dutch: "een cadeau kiezen" },
  { english: "meet friends", dutch: "vrienden ontmoeten" }
] as const;

const baseVerbs = [
  { english: "work", dutch: "werken" },
  { english: "read", dutch: "lezen" },
  { english: "learn", dutch: "leren" },
  { english: "travel", dutch: "reizen" },
  { english: "smoke", dutch: "roken" },
  { english: "be", dutch: "zijn" },
  { english: "have", dutch: "hebben" },
  { english: "become", dutch: "worden" },
  { english: "go", dutch: "gaan" },
  { english: "come", dutch: "komen" },
  { english: "do", dutch: "doen" },
  { english: "to make", dutch: "maken" },
  { english: "give", dutch: "geven" },
  { english: "take", dutch: "nemen" },
  { english: "see", dutch: "zien" },
  { english: "know", dutch: "weten" },
  { english: "think", dutch: "denken" },
  { english: "say", dutch: "zeggen" },
  { english: "find", dutch: "vinden" },
  { english: "stay", dutch: "blijven" },
  { english: "let", dutch: "laten" },
  { english: "stand", dutch: "staan" },
  { english: "sit", dutch: "zitten" },
  { english: "lie", dutch: "liggen" },
  { english: "walk", dutch: "lopen" },
  { english: "live", dutch: "wonen" },
  { english: "play", dutch: "spelen" },
  { english: "understand", dutch: "begrijpen" },
  { english: "talk", dutch: "praten" },
  { english: "speak", dutch: "spreken" },
  { english: "listen", dutch: "luisteren" },
  { english: "look/watch", dutch: "kijken" },
  { english: "eat", dutch: "eten" },
  { english: "drink", dutch: "drinken" },
  { english: "sleep", dutch: "slapen" }
] as const;

const frontedVerbOptions = baseVerbs.filter((verb) =>
  ["werken", "lezen", "leren", "reizen", "lopen", "wonen", "spelen", "praten", "spreken", "luisteren", "kijken", "eten", "drinken", "slapen", "gaan", "komen", "blijven", "doen", "maken", "geven", "nemen", "vinden"].includes(verb.dutch)
);

const numberWords = [
  { english: "three", dutch: "drie" },
  { english: "four", dutch: "vier" },
  { english: "five", dutch: "vijf" },
  { english: "six", dutch: "zes" },
  { english: "seven", dutch: "zeven" },
  { english: "eight", dutch: "acht" },
  { english: "nine", dutch: "negen" },
  { english: "ten", dutch: "tien" },
  { english: "eleven", dutch: "elf" },
  { english: "twelve", dutch: "twaalf" },
  { english: "thirteen", dutch: "dertien" },
  { english: "fifteen", dutch: "vijftien" },
  { english: "sixteen", dutch: "zestien" },
  { english: "eighteen", dutch: "achttien" },
  { english: "twenty", dutch: "twintig" },
  { english: "twenty-one", dutch: "eenentwintig" },
  { english: "twenty-two", dutch: "tweeentwintig" },
  { english: "twenty-seven", dutch: "zevenentwintig" },
  { english: "thirty", dutch: "dertig" },
  { english: "thirty-three", dutch: "drieendertig" },
  { english: "thirty-six", dutch: "zesendertig" },
  { english: "forty", dutch: "veertig" },
  { english: "forty-five", dutch: "vijfenveertig" },
  { english: "fifty", dutch: "vijftig" },
  { english: "fifty-two", dutch: "tweeenvijftig" },
  { english: "sixty-one", dutch: "eenenzestig" },
  { english: "seventy-four", dutch: "vierenzeventig" },
  { english: "eighty", dutch: "tachtig" },
  { english: "ninety", dutch: "negentig" },
  { english: "one hundred", dutch: "honderd" }
];

const numberNouns = [
  { english: "books", dutch: "boeken" },
  { english: "students", dutch: "studenten" },
  { english: "bikes", dutch: "fietsen" },
  { english: "flowers", dutch: "bloemen" },
  { english: "apples", dutch: "appels" },
  { english: "chairs", dutch: "stoelen" },
  { english: "tickets", dutch: "kaartjes" },
  { english: "euros", dutch: "euro" },
  { english: "windows", dutch: "ramen" },
  { english: "trees", dutch: "bomen" },
  { english: "cups", dutch: "kopjes" },
  { english: "letters", dutch: "brieven" },
  { english: "guests", dutch: "gasten" },
  { english: "errors", dutch: "fouten" },
  { english: "photos", dutch: "foto's" }
] as const;

export const transportOptions = [
  { english: "by train", dutch: "met de trein" },
  { english: "by bike", dutch: "met de fiets" },
  { english: "by bus", dutch: "met de bus" },
  { english: "by tram", dutch: "met de tram" },
  { english: "by metro", dutch: "met de metro" },
  { english: "by boat", dutch: "met de boot" },
  { english: "by plane", dutch: "met het vliegtuig" },
  { english: "by car", dutch: "met de auto" }
];

export const travelDestinations = [
  { english: "to school", dutch: "naar school" },
  { english: "to work", dutch: "naar het werk" },
  { english: "to the city", dutch: "naar de stad" },
  { english: "to the station", dutch: "naar het station" },
  { english: "to the library", dutch: "naar de bibliotheek" },
  { english: "to the hospital", dutch: "naar het ziekenhuis" },
  { english: "home", dutch: "naar huis" },
  { english: "to the museum", dutch: "naar het museum" },
  { english: "to the airport", dutch: "naar het vliegveld" },
  { english: "to the beach", dutch: "naar het strand" },
  { english: "to the office", dutch: "naar het kantoor" }
] as const;

export const travelArrivalSpots = [
  { english: "at the station", dutch: "op het station" },
  { english: "at school", dutch: "op school" },
  { english: "at work", dutch: "op het werk" },
  { english: "in the city centre", dutch: "in het centrum" },
  { english: "at the hospital", dutch: "bij het ziekenhuis" },
  { english: "at the library", dutch: "bij de bibliotheek" },
  { english: "at home", dutch: "thuis" },
  { english: "at the airport", dutch: "op het vliegveld" }
] as const;

const perfectVerbs = [
  { infinitive: "werken", english: "worked", participle: "gewerkt", auxiliary: "hebben" as const },
  { infinitive: "lezen", english: "read", participle: "gelezen", auxiliary: "hebben" as const },
  { infinitive: "schrijven", english: "written", participle: "geschreven", auxiliary: "hebben" as const },
  { infinitive: "zingen", english: "sung", participle: "gezongen", auxiliary: "hebben" as const },
  { infinitive: "wachten", english: "waited", participle: "gewacht", auxiliary: "hebben" as const },
  { infinitive: "kopen", english: "bought", participle: "gekocht", auxiliary: "hebben" as const },
  { infinitive: "verkopen", english: "sold", participle: "verkocht", auxiliary: "hebben" as const },
  { infinitive: "bellen", english: "called", participle: "gebeld", auxiliary: "hebben" as const },
  { infinitive: "gaan", english: "gone", participle: "gegaan", auxiliary: "zijn" as const },
  { infinitive: "doen", english: "done", participle: "gedaan", auxiliary: "hebben" as const },
  { infinitive: "maken", english: "made", participle: "gemaakt", auxiliary: "hebben" as const },
  { infinitive: "geven", english: "given", participle: "gegeven", auxiliary: "hebben" as const },
  { infinitive: "nemen", english: "taken", participle: "genomen", auxiliary: "hebben" as const },
  { infinitive: "vinden", english: "found", participle: "gevonden", auxiliary: "hebben" as const },
  { infinitive: "koken", english: "cooked", participle: "gekookt", auxiliary: "hebben" as const },
  { infinitive: "studeren", english: "studied", participle: "gestudeerd", auxiliary: "hebben" as const },
  { infinitive: "drinken", english: "drunk", participle: "gedronken", auxiliary: "hebben" as const },
  { infinitive: "eten", english: "eaten", participle: "gegeten", auxiliary: "hebben" as const },
  { infinitive: "komen", english: "come", participle: "gekomen", auxiliary: "zijn" as const },
  { infinitive: "blijven", english: "stayed", participle: "gebleven", auxiliary: "zijn" as const },
  { infinitive: "lopen", english: "walked", participle: "gelopen", auxiliary: "zijn" as const },
  { infinitive: "fietsen", english: "cycled", participle: "gefietst", auxiliary: "zijn" as const },
  { infinitive: "zwemmen", english: "swum", participle: "gezwommen", auxiliary: "hebben" as const },
  { infinitive: "slapen", english: "slept", participle: "geslapen", auxiliary: "hebben" as const },
  { infinitive: "verliezen", english: "lost", participle: "verloren", auxiliary: "hebben" as const },
  { infinitive: "winnen", english: "won", participle: "gewonnen", auxiliary: "hebben" as const },
  { infinitive: "beginnen", english: "begun", participle: "begonnen", auxiliary: "zijn" as const }
] as const;

export const perfectTimePhrases = [
  { english: "today", dutch: "vandaag" },
  { english: "this week", dutch: "deze week" },
  { english: "this morning", dutch: "vanochtend" },
  { english: "this afternoon", dutch: "vanmiddag" },
  { english: "this evening", dutch: "vanavond" },
  { english: "yesterday", dutch: "gisteren" },
  { english: "last night", dutch: "gisteravond" },
  { english: "last weekend", dutch: "afgelopen weekend" },
  { english: "already", dutch: "al" },
  { english: "just now", dutch: "net" },
  { english: "at home", dutch: "thuis" },
  { english: "at school", dutch: "op school" },
  { english: "in the city", dutch: "in de stad" },
  { english: "on holiday", dutch: "met vakantie" },
  { english: "in the Netherlands", dutch: "in Nederland" }
] as const;

export const becauseReasons = [
  { english: "it is raining", dutchWant: "het regent", dutchOmdat: "het regent" },
  { english: "it is late", dutchWant: "het is laat", dutchOmdat: "het laat is" },
  { english: "the shop is closed", dutchWant: "de winkel is dicht", dutchOmdat: "de winkel dicht is" },
  { english: "I have an exam tomorrow", dutchWant: "ik heb morgen een examen", dutchOmdat: "ik morgen een examen heb" },
  { english: "we are tired", dutchWant: "wij zijn moe", dutchOmdat: "wij moe zijn" },
  { english: "the train is delayed", dutchWant: "de trein heeft vertraging", dutchOmdat: "de trein vertraging heeft" },
  { english: "the children are sleeping", dutchWant: "de kinderen slapen", dutchOmdat: "de kinderen slapen" },
  { english: "the weather is bad", dutchWant: "het weer is slecht", dutchOmdat: "het weer slecht is" },
  { english: "I feel sick", dutchWant: "ik voel me niet lekker", dutchOmdat: "ik me niet lekker voel" },
  { english: "there is a strike", dutchWant: "er is een staking", dutchOmdat: "er een staking is" },
  { english: "the road is closed", dutchWant: "de weg is afgesloten", dutchOmdat: "de weg afgesloten is" },
  { english: "my phone is dead", dutchWant: "mijn telefoon is leeg", dutchOmdat: "mijn telefoon leeg is" },
  { english: "the tickets were sold out", dutchWant: "de kaartjes waren uitverkocht", dutchOmdat: "de kaartjes uitverkocht waren" },
  { english: "I lost my wallet", dutchWant: "ik ben mijn portemonnee kwijt", dutchOmdat: "ik mijn portemonnee kwijt ben" },
  { english: "the dog is ill", dutchWant: "de hond is ziek", dutchOmdat: "de hond ziek is" },
  { english: "traffic is heavy", dutchWant: "het is druk op de weg", dutchOmdat: "het druk op de weg is" },
  { english: "the meeting ran long", dutchWant: "de vergadering duurde lang", dutchOmdat: "de vergadering lang duurde" },
  { english: "I have no time", dutchWant: "ik heb geen tijd", dutchOmdat: "ik geen tijd heb" },
  { english: "the fridge is empty", dutchWant: "de koelkast is leeg", dutchOmdat: "de koelkast leeg is" },
  { english: "prices have gone up", dutchWant: "de prijzen zijn gestegen", dutchOmdat: "de prijzen gestegen zijn" },
  { english: "the flight was cancelled", dutchWant: "de vlucht werd geannuleerd", dutchOmdat: "de vlucht geannuleerd werd" },
  { english: "I promised my mother", dutchWant: "ik heb het mijn moeder beloofd", dutchOmdat: "ik het mijn moeder heb beloofd" },
  { english: "the baby is crying", dutchWant: "de baby huilt", dutchOmdat: "de baby huilt" },
  { english: "it is too cold", dutchWant: "het is te koud", dutchOmdat: "het te koud is" },
  { english: "the bus did not come", dutchWant: "de bus kwam niet", dutchOmdat: "de bus niet kwam" },
  { english: "I forgot the appointment", dutchWant: "ik ben de afspraak vergeten", dutchOmdat: "ik de afspraak ben vergeten" },
  { english: "the film starts soon", dutchWant: "de film begint bijna", dutchOmdat: "de film bijna begint" },
  { english: "we had guests", dutchWant: "wij hadden bezoek", dutchOmdat: "wij bezoek hadden" },
  { english: "the lights went out", dutchWant: "het licht viel uit", dutchOmdat: "het licht uitviel" },
  { english: "it is snowing", dutchWant: "het sneeuwt", dutchOmdat: "het sneeuwt" },
  { english: "the homework is difficult", dutchWant: "het huiswerk is moeilijk", dutchOmdat: "het huiswerk moeilijk is" },
  { english: "everyone is on holiday", dutchWant: "iedereen is met vakantie", dutchOmdat: "iedereen met vakantie is" }
] as const;

export const datMainVerbs = [
  { english: "know", dutch: "weten" },
  { english: "think", dutch: "denken" },
  { english: "say", dutch: "zeggen" },
  { english: "hear", dutch: "horen" },
  { english: "believe", dutch: "geloven" },
  { english: "hope", dutch: "hopen" },
  { english: "fear", dutch: "vrezen" },
  { english: "see", dutch: "zien" },
  { english: "understand", dutch: "begrijpen" },
  { english: "remember", dutch: "onthouden" },
  { english: "doubt", dutch: "twijfelen" },
  { english: "read", dutch: "lezen" },
  { english: "tell/ask", dutch: "vragen" },
  { english: "notice", dutch: "merken" },
  { english: "find", dutch: "vinden" }
] as const;

export const datClauseContents = [
  { english: "the student is busy", dutch: "de student druk is" },
  { english: "the teacher works today", dutch: "de leraar vandaag werkt" },
  { english: "my friend lives in the city", dutch: "mijn vriend in de stad woont" },
  { english: "the children are tired", dutch: "de kinderen moe zijn" },
  { english: "she reads a book", dutch: "zij een boek leest" },
  { english: "we are ready", dutch: "wij klaar zijn" },
  { english: "the lesson starts at nine", dutch: "de les om negen uur begint" },
  { english: "the bus is late", dutch: "de bus te laat is" },
  { english: "the neighbours are on holiday", dutch: "de buren met vakantie zijn" },
  { english: "my sister plays the piano", dutch: "mijn zus piano speelt" },
  { english: "the film was boring", dutch: "de film saai was" },
  { english: "there is no milk left", dutch: "er geen melk meer is" },
  { english: "the keys are on the table", dutch: "de sleutels op de tafel liggen" },
  { english: "his brother speaks French", dutch: "zijn broer Frans spreekt" },
  { english: "the cake tastes good", dutch: "de taart lekker is" },
  { english: "winter is coming soon", dutch: "de winter snel komt" },
  { english: "the shop opens at eight", dutch: "de winkel om acht uur opent" },
  { english: "they have two cats", dutch: "zij twee katten hebben" },
  { english: "the soup is too salty", dutch: "de soep te zout is" },
  { english: "I need more time", dutch: "ik meer tijd nodig heb" }
] as const;

const demonstrativeAdjectives = [
  { english: "expensive", dutch: "duur" },
  { english: "cheap", dutch: "goedkoop" },
  { english: "beautiful", dutch: "mooi" },
  { english: "ugly", dutch: "lelijk" },
  { english: "new", dutch: "nieuw" },
  { english: "old", dutch: "oud" },
  { english: "interesting", dutch: "interessant" },
  { english: "boring", dutch: "saai" },
  { english: "heavy", dutch: "zwaar" },
  { english: "light", dutch: "licht" },
  { english: "small", dutch: "klein" },
  { english: "large", dutch: "groot" },
  { english: "clean", dutch: "schoon" },
  { english: "dirty", dutch: "vies" },
  { english: "soft", dutch: "zacht" },
  { english: "hard", dutch: "hard" },
  { english: "sweet", dutch: "zoet" },
  { english: "sour", dutch: "zuur" },
  { english: "fresh", dutch: "vers" },
  { english: "useful", dutch: "nuttig" },
  { english: "fragile", dutch: "breekbaar" },
  { english: "noisy", dutch: "luidruchtig" },
  { english: "quiet", dutch: "stil" }
] as const;

export const frontedComplements = [
  { english: "at home", dutch: "thuis" },
  { english: "at school", dutch: "op school" },
  { english: "in the city", dutch: "in de stad" },
  { english: "with friends", dutch: "met vrienden" },
  { english: "in the library", dutch: "in de bibliotheek" },
  { english: "at work", dutch: "op het werk" },
  { english: "in the park", dutch: "in het park" },
  { english: "on the train", dutch: "in de trein" },
  { english: "at the station", dutch: "op het station" },
  { english: "in the shop", dutch: "in de winkel" },
  { english: "with my family", dutch: "met mijn familie" },
  { english: "in Amsterdam", dutch: "in Amsterdam" },
  { english: "by the sea", dutch: "aan zee" },
  { english: "in the garden", dutch: "in de tuin" },
  { english: "at the cinema", dutch: "in de bioscoop" },
  { english: "on holiday", dutch: "met vakantie" }
] as const;

export const whileScenarios = [
  { english: "I was reading while she was cooking.", dutch: "Ik las terwijl zij kookte." },
  { english: "We were studying while they were playing.", dutch: "Wij studeerden terwijl zij speelden." },
  { english: "He was working while I was listening to music.", dutch: "Hij werkte terwijl ik naar muziek luisterde." },
  { english: "They were talking while we were waiting.", dutch: "Zij praatten terwijl wij wachtten." },
  { english: "You were writing while I was cleaning.", dutch: "Jij schreef terwijl ik schoonmaakte." },
  { english: "She was cycling while it was raining.", dutch: "Zij fietste terwijl het regende." },
  { english: "We were eating while the children were sleeping.", dutch: "Wij aten terwijl de kinderen sliepen." },
  { english: "He was driving while she was navigating.", dutch: "Hij reed terwijl zij de weg wees." },
  { english: "I was swimming while you were sunbathing.", dutch: "Ik zwom terwijl jij lag te zonnebaden." },
  { english: "They were laughing while we were presenting.", dutch: "Zij lachten terwijl wij presenteerden." },
  { english: "The dog was barking while the cat was hiding.", dutch: "De hond blafte terwijl de kat zich verstopte." },
  { english: "I was fixing the bike while he was holding the light.", dutch: "Ik repareerde de fiets terwijl hij het licht vasthield." },
  { english: "She was painting while her brother was building a shelf.", dutch: "Zij schilderde terwijl haar broer een plank bouwde." },
  { english: "We were queueing while the shop was still closed.", dutch: "Wij stonden in de rij terwijl de winkel nog dicht was." },
  { english: "He was taking notes while the professor was speaking.", dutch: "Hij maakte aantekeningen terwijl de professor sprak." }
] as const;

export const toenEvents = [
  { english: "Then I came home.", dutch: "Toen kwam ik thuis." },
  { english: "Then we left early.", dutch: "Toen vertrokken wij vroeg." },
  { english: "Then she felt better.", dutch: "Toen voelde zij zich beter." },
  { english: "Then they started the lesson.", dutch: "Toen begonnen zij met de les." },
  { english: "Then he sat down.", dutch: "Toen ging hij zitten." },
  { english: "Then the bus arrived.", dutch: "Toen kwam de bus aan." },
  { english: "Then it stopped raining.", dutch: "Toen stopte het met regenen." },
  { english: "Then we ordered coffee.", dutch: "Toen bestelden wij koffie." },
  { english: "Then she called her mother.", dutch: "Toen belde zij haar moeder." },
  { english: "Then the lights went out.", dutch: "Toen ging het licht uit." },
  { english: "Then I realised my mistake.", dutch: "Toen realiseerde ik me mijn fout." },
  { english: "Then they paid the bill.", dutch: "Toen betaalden zij de rekening." },
  { english: "Then he missed the train.", dutch: "Toen miste hij de trein." },
  { english: "Then we laughed about it.", dutch: "Toen lachten wij erom." },
  { english: "Then the doctor arrived.", dutch: "Toen kwam de dokter binnen." }
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value && value.trim())))];
}

function pickSubject(allowedTypes: SubjectSemanticType[] = ["person", "group"]): GrammarSubject {
  const matching = subjects.filter((subject) => allowedTypes.includes(subject.semanticType ?? "person"));
  return pick(matching.length ? matching : subjects);
}

function withTeInfinitive(phrase: string) {
  const tokens = phrase.trim().split(/\s+/);
  if (tokens.length <= 1) return `te ${phrase}`;
  const infinitive = tokens.pop();
  return `${tokens.join(" ")} te ${infinitive}`;
}

function pickObjectForVerb(infinitive: string) {
  const vmeta = findVerbCollocation(infinitive);
  if (vmeta?.commonObjects && vmeta.commonObjects.length) {
    const pickObj = pick(vmeta.commonObjects);
    // return as object with article where provided
    // commonObjects entries may include article already (e.g., 'de trein')
    const hasArticle = /^(de |het |een )/.test(pickObj);
    if (hasArticle) {
      const parts = pickObj.split(/\s+/);
      const article = parts.shift()!;
      const word = parts.join(" ");
      return { word, articleAllowed: true, article, english: word } as any;
    }
    return { word: pickObj, articleAllowed: false, english: pickObj } as any;
  }
  // fallback to a generic object noun
  return pick(objectNouns) as any;
}

function renderLocation(location: GrammarLocation): string {
  if (location.preposition === "thuis") return "thuis";
  if (location.preposition === "op") return `op ${location.noun.word}`;
  const hasArticleInPrep = /\b(de|het)$/.test(location.preposition.trim());
  if (hasArticleInPrep) return `${location.preposition} ${location.noun.word}`;
  return `${location.preposition} ${location.noun.article} ${location.noun.word}`;
}

function stripLeadingThe(value: string): string {
  return value.replace(/^the\s+/i, "");
}

function withIndefiniteArticle(value: string): string {
  const article = /^[aeiou]/i.test(value) ? "an" : "a";
  return `${article} ${value}`;
}

function pluralizeEnglish(value: string): string {
  if (value.endsWith("y") && !/[aeiou]y$/i.test(value)) return `${value.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(value)) return `${value}es`;
  return `${value}s`;
}

function buildMetadata(intent: GrammarIntent): GrammarMetadata {
  return {
    topic: intent.grammarType,
    subject: `${intent.subject.pronoun}:${intent.subject.number}`,
    verb: intent.verb.infinitive,
    noun: intent.object?.word ?? intent.location?.noun.word,
    tense: intent.verb.tense,
    hasArticle: Boolean(intent.object?.article ?? intent.location?.noun.article),
    inverted: intent.clause?.inversionRequired ?? false,
    auxiliaryVerb: intent.verb.auxiliary,
    participle: intent.verb.tense === "perfect" ? intent.verb.infinitive : undefined,
    modalVerb: intent.verb.modalInfinitive
  };
}

/**
 * Generate a hint that clarifies which "you" form should be used
 */
function getSubjectHint(subject: GrammarSubject, verbForm: string, genericHint: string): string {
  if (subject.english.includes("you")) {
    if (subject.english === "you (informal)") {
      return `Use "jij/je": jij/je ${verbForm}`;
    }
    if (subject.english === "you (formal)") {
      return `Use formal "u": u ${verbForm}`;
    }
    if (subject.english === "you all") {
      return `Use "jullie" (plural): jullie ${verbForm}`;
    }
  }
  return genericHint;
}

function generateStructuredSentenceInternal(category: PracticeCategory): GeneratedSentence | null {
  const subject = pick(subjects);

  function postProcess(candidate: GeneratedSentence, intent: any): GeneratedSentence | null {
    // quick english spelling fixes
    function cleanEnglish(text: string) {
      const fixes: Record<string,string> = {
        'staies': 'stays'
      };
      return Object.keys(fixes).reduce((t, k) => t.replace(new RegExp(k, 'gi'), fixes[k]), text);
    }

    candidate.english = cleanEnglish(candidate.english);
    const scores = scoreCandidate({ dutch: candidate.dutch, english: candidate.english }, intent);
    if (scores.overall < 0.45) return null;
    candidate.intent = intent;
    candidate.hint = candidate.hint ? `${candidate.hint} (quality:${scores.overall.toFixed(2)})` : `Quality: ${scores.overall.toFixed(2)}`;
    // Add collocation-specific hint when available
    try {
      const verbInf = intent?.verb?.infinitive;
      const vmeta = verbInf ? findVerbCollocation(verbInf) : undefined;
      if (vmeta) {
        if (vmeta.requiresDirectObject) {
          const sample = vmeta.commonObjects?.[0] ?? 'een object';
          candidate.hint = `${candidate.hint} Tip: '${vmeta.verb}' usually takes an object, e.g. '${sample}'.`;
        }
        if (vmeta.requiresPreposition) {
          candidate.hint = `${candidate.hint} Tip: '${vmeta.verb}' commonly uses '${vmeta.requiresPreposition}' before its object.`;
        } else if (vmeta.preferredPreposition) {
          candidate.hint = `${candidate.hint} Tip: '${vmeta.verb}' often pairs with '${vmeta.preferredPreposition}'.`;
        }
      }
    } catch (e) {
      // ignore
    }
    return candidate;
  }

  if (category === "negation") {
    const variant = pick(["location", "adjective", "possession"] as const);
    const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };

    if (variant === "adjective") {
      const adjective = pick(adjectives);
      const intent: GrammarIntent = {
        grammarType: "negation",
        subject,
        verb,
        negation: true,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject);
      return {
        english: `${subject.english} ${englishBe(subject)} not ${adjective.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} niet ${adjective.dutch}.`,
        hint: getSubjectHint(subject, dutchVerb, "Use niet to negate adjectives."),
        grammarNote: "Negation usually comes after the finite verb.",
        grammar: buildMetadata(intent)
      };
    }

    if (variant === "possession") {
      const object = pick(objectNouns);
      const haveVerb: GrammarVerb = { infinitive: "hebben", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "negation",
        subject,
        verb: haveVerb,
        object,
        negation: true,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent(haveVerb.infinitive, subject);
      const dutchObject = object.articleAllowed
        ? `${object.article ?? "een"} ${object.word}`
        : object.word;
      return {
        english: `${subject.english} ${englishDo(subject).toLowerCase()} not have ${object.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} geen ${object.word}.`,
        hint: getSubjectHint(subject, dutchVerb, "Use geen to negate indefinite nouns."),
        grammarNote: "Geen replaces een in negative noun phrases.",
        grammar: buildMetadata(intent)
      };
    }

    const location = pick(locations);
    const intent: GrammarIntent = {
      grammarType: "negation",
      subject,
      verb,
      location,
      negation: true,
      clause: { type: "main", inversionRequired: false }
    };

    const dutchVerb = conjugatePresent(verb.infinitive, subject);
    const dutch = `${subject.pronoun} ${dutchVerb} niet ${renderLocation(location)}.`;
    const english = `${subject.english} ${englishBe(subject)} not ${location.english}.`;

    return {
      english,
      dutch,
      hint: getSubjectHint(subject, dutchVerb, "Use niet to negate verbs or adjectives."),
      grammarNote: "Negation usually comes after the finite verb.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "fronted-inversion") {
    const subject = pickSubject(["person", "group"]);
    const adverb = pick(adverbs);
    const verbChoice = pick(frontedVerbOptions);
    // If the verb implies movement, prefer destinations (naar...) instead of in-place 'in de ...'
    const movementVerbs = ["lopen", "reizen", "gaan", "komen", "fietsen"];
    const complement = movementVerbs.includes(verbChoice.dutch) ? pick(travelDestinations) : pick(frontedComplements);
    // ensure direct object if verb requires it
    const vmetaFront = findVerbCollocation(verbChoice.dutch);
    let objDutch = "";
    let objEnglish = "";
    if (vmetaFront?.requiresDirectObject) {
      const obj = pickObjectForVerb(verbChoice.dutch);
      objDutch = obj.articleAllowed ? `${obj.article} ${obj.word}` : obj.word;
      objEnglish = obj.english ?? obj.word;
    }
    const verb: GrammarVerb = { infinitive: verbChoice.dutch, tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "fronted-inversion",
      subject,
      verb,
      clause: { type: "fronted_time", inversionRequired: true },
      adverb
    };

    const dutchVerb = conjugatePresent(verb.infinitive, subject, true);
    const dutch = `${adverb.dutch} ${dutchVerb} ${subject.pronoun}${objDutch ? ' ' + objDutch : ''} ${complement.dutch}.`;
    const english = `${adverb.english.charAt(0).toUpperCase()}${adverb.english.slice(1)}, ${subject.english} ${englishPresent(subject, verbChoice.english)}${objEnglish ? ' ' + objEnglish : ''} ${complement.english}.`;

    return postProcess({
      english,
      dutch,
      hint: "Fronted time expressions trigger inversion.",
      grammarNote: "When a sentence starts with time/place, the verb comes before the subject.",
      grammar: buildMetadata(intent)
    }, intent);
  }

  if (category === "questions-inversion") {
    const subject = pickSubject(["person", "group"]);
    const variant = pick(["verb", "adjective", "possession"] as const);

    if (variant === "adjective") {
      const adjective = pick(adjectives);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "questions-inversion",
        subject,
        verb,
        clause: { type: "question", inversionRequired: true }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject, true);
      const englishAux = questionEnglishBe(subject);
      return {
        english: `${englishAux} ${subject.english} ${adjective.english}?`,
        dutch: `${dutchVerb.charAt(0).toUpperCase()}${dutchVerb.slice(1)} ${subject.pronoun} ${adjective.dutch}?`,
        hint: "Verb comes first in Dutch questions.",
        grammarNote: "Yes/no questions invert the verb and subject.",
        grammar: buildMetadata(intent)
      };
    }

    if (variant === "possession") {
      const object = pick(objectNouns);
      const verb: GrammarVerb = { infinitive: "hebben", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "questions-inversion",
        subject,
        verb,
        object,
        clause: { type: "question", inversionRequired: true }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject, true);
      const dutchObject = object.articleAllowed
        ? `${object.article ?? "een"} ${object.word}`
        : object.word;
      return {
        english: `${englishDo(subject)} ${subject.english} have ${object.english}?`,
        dutch: `${dutchVerb.charAt(0).toUpperCase()}${dutchVerb.slice(1)} ${subject.pronoun} ${dutchObject}?`,
        hint: "Use hebben for possession questions.",
        grammarNote: "Verb-first word order in Dutch questions.",
        grammar: buildMetadata(intent)
      };
    }

    const verbChoice = pick(baseVerbs);
    const verb: GrammarVerb = { infinitive: verbChoice.dutch, tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "questions-inversion",
      subject,
      verb,
      clause: { type: "question", inversionRequired: true }
    };

    // If the verb requires an object, attach a compatible one
    const vmeta = findVerbCollocation(verbChoice.dutch);
    let objectDutch = "";
    let objectEnglish = "";
    if (vmeta?.requiresDirectObject) {
      const obj = pickObjectForVerb(verbChoice.dutch);
      objectDutch = obj.articleAllowed ? `${obj.article} ${obj.word}` : obj.word;
      objectEnglish = obj.english ?? obj.word;
    }

    const dutchVerb = conjugatePresent(verb.infinitive, subject, true);
    const dutchTime = pick(questionTimesDutch);
    const englishTime = pick(questionTimes);
    const dutch = `${dutchVerb.charAt(0).toUpperCase()}${dutchVerb.slice(1)} ${subject.pronoun}${objectDutch ? ' ' + objectDutch : ''} ${dutchTime}?`;
    const english = `${englishDo(subject)} ${subject.english} ${verbChoice.english}${objectEnglish ? ' ' + objectEnglish : ''} ${englishTime}?`;

    return postProcess({
      english,
      dutch,
      hint: "Yes/no questions put the verb first.",
      grammarNote: "Dutch questions invert the verb and subject.",
      grammar: buildMetadata(intent)
    }, intent);
  }

  if (category === "modals") {
    const subject = pickSubject(["person", "group"]);
    const modal = pick(modalOptions);
    const action = pick(modalActions);
    const verb: GrammarVerb = {
      infinitive: modal.dutch,
      tense: "present",
      isModal: true,
      modalInfinitive: modal.dutch
    };
    const intent: GrammarIntent = {
      grammarType: "modals",
      subject,
      verb,
      clause: { type: "main", inversionRequired: false }
    };
    const dutchModal = conjugatePresent(modal.dutch, subject);
    if (modal.kind === "negative-only") {
      const dutch = `${subject.pronoun} ${dutchModal} niet ${withTeInfinitive(action.dutch)}.`;
      const english = `${subject.english} ${englishDo(subject).toLowerCase()} not need to ${action.english}.`;
      return {
        english,
        dutch,
        hint: getSubjectHint(subject, dutchModal, "Use 'te' + infinitive after hoeven."),
        grammarNote: "Hoeven is commonly used with niet in Dutch.",
        grammar: buildMetadata(intent)
      };
    }
    const dutch = `${subject.pronoun} ${dutchModal} ${action.dutch}.`;
    const english = `${subject.english} ${englishModal(subject, modal.english)} ${action.english}.`;

    return {
      english,
      dutch,
      hint: getSubjectHint(subject, dutchModal, "Modal in position 2, infinitive at the end."),
      grammarNote: "Modal verbs keep the main verb in infinitive at the end.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "omdat-want") {
    const subject = pickSubject(["person", "group"]);
    const variant = pick(["omdat", "want"] as const);
    const adjective = pick(adjectives);
    const reason = pick(becauseReasons);

    if (variant === "want") {
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "omdat-want",
        subject,
        verb,
        clause: { type: "main", inversionRequired: false, conjunction: "want" }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject);
      const dutch = `${subject.pronoun} ${dutchVerb} ${adjective.dutch} want ${reason.dutchWant}.`;
      const english = `${subject.english} ${englishBe(subject)} ${adjective.english} because ${reason.english}.`;

      return {
        english,
        dutch,
        hint: "Want keeps normal word order.",
        grammarNote: "Want is a coordinating conjunction; verb stays in position 2.",
        grammar: buildMetadata(intent)
      };
    }

    const verb: GrammarVerb = { infinitive: "blijven", tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "omdat-want",
      subject,
      verb,
      clause: { type: "subordinate", inversionRequired: false, conjunction: "omdat" }
    };

    const dutchVerb = conjugatePresent(verb.infinitive, subject);
    const location = pick(frontedComplements);
    const dutch = `${subject.pronoun} ${dutchVerb} ${location.dutch} omdat ${reason.dutchOmdat}.`;
    const english = `${subject.english} ${englishPresent(subject, "stay")} ${location.english} because ${reason.english}.`;

    return {
      english,
      dutch,
      hint: "Omdat clauses move the verb to the end.",
      grammarNote: "In subordinate clauses, the verb appears at the end.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "dat-clause") {
    const subject = pickSubject(["person", "group"]);
    const mainVerb = pick(datMainVerbs);
    const content = pick(datClauseContents);
    const verb: GrammarVerb = { infinitive: mainVerb.dutch, tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "dat-clause",
      subject,
      verb,
      clause: { type: "subordinate", inversionRequired: false, conjunction: "dat" }
    };

    const connector = mainVerb.dutch === "twijfelen" || mainVerb.dutch === "vragen" ? "of" : "dat";
    const dutchVerb = conjugatePresent(verb.infinitive, subject);
    const dutch = `${subject.pronoun} ${dutchVerb} ${connector} ${content.dutch}.`;
    const english = `${subject.english} ${englishPresent(subject, mainVerb.english)} ${connector === "of" ? "if" : "that"} ${content.english}.`;

    return {
      english,
      dutch,
      hint: getSubjectHint(subject, dutchVerb, connector === "of" ? "Use of after twijfel/vraag-clauses." : "Dat introduces a subordinate clause."),
      grammarNote: connector === "of" ? "Use of for yes/no indirect questions and twijfelen." : "Use dat to introduce reported information; verb goes to the end of the clause.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "perfect-tense") {
    const subject = pickSubject(["person", "group"]);
    const verbChoice = pick(perfectVerbs);
    const phrase = pick(perfectTimePhrases);
    const verb: GrammarVerb = {
      infinitive: verbChoice.infinitive,
      tense: "perfect",
      auxiliary: verbChoice.auxiliary
    };
    const intent: GrammarIntent = {
      grammarType: "perfect-tense",
      subject,
      verb,
      clause: { type: "main", inversionRequired: false }
    };

    const auxVerb = conjugatePresent(verbChoice.auxiliary, subject);
    // If verb requires a direct object, attach it before the participle: subject aux object participle
    const vmeta = findVerbCollocation(verbChoice.infinitive);
    let objDutch = "";
    let objEnglish = "";
    if (vmeta?.requiresDirectObject) {
      const obj = pickObjectForVerb(verbChoice.infinitive);
      objDutch = obj.articleAllowed ? `${obj.article} ${obj.word}` : obj.word;
      objEnglish = obj.english ?? obj.word;
    }
    const dutch = `${subject.pronoun} ${auxVerb}${objDutch ? ' ' + objDutch : ''} ${phrase.dutch} ${verbChoice.participle}.`;
    const english = `${subject.english} ${englishHave(subject)} ${objEnglish ? objEnglish + ' ' : ''}${verbChoice.english} ${phrase.english}.`;

    return {
      english,
      dutch,
      accepted: undefined,
        hint: getSubjectHint(subject, auxVerb, `Place "${phrase.dutch}" before the participle.`),
      grammarNote: "Movement verbs often use zijn in the perfect tense.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "terwijl-toen") {
    const subject = pickSubject(["person", "group"]);
    const variant = pick(["terwijl", "toen"] as const);
    if (variant === "toen") {
      const verb: GrammarVerb = { infinitive: "zijn", tense: "past" };
      const intent: GrammarIntent = {
        grammarType: "terwijl-toen",
        subject,
        verb,
        clause: { type: "fronted_time", inversionRequired: true, conjunction: "toen" }
      };
      const event = pick(toenEvents);
      return {
        english: event.english,
        dutch: event.dutch,
        accepted: event.dutch === "Toen lachten wij erom."
          ? uniqueStrings([event.dutch, "Toen hebben wij erom gelachen.", "Toen hebben we erom gelachen."])
          : undefined,
        hint: "Toen refers to a specific moment in the past.",
        grammarNote: "Toen often triggers inversion in the main clause.",
        grammar: buildMetadata(intent)
      };
    }

    const verb: GrammarVerb = { infinitive: "lezen", tense: "past" };
    const intent: GrammarIntent = {
      grammarType: "terwijl-toen",
      subject,
      verb,
      clause: { type: "subordinate", inversionRequired: false, conjunction: "terwijl" }
    };

    const scenario = pick(whileScenarios);
    const dutch = scenario.dutch;
    const english = scenario.english;

    return {
      english,
      dutch,
      hint: "Gebruik terwijl voor gelijktijdige acties.",
      grammarNote: "Terwijl links parallel actions in the past.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "numbers") {
    const numberChoice = pick(numberWords);
    const variant = pick(["money", "objects", "age"] as const);
    const verb: GrammarVerb = { infinitive: variant === "age" ? "zijn" : "hebben", tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "numbers",
      subject,
      verb,
      clause: { type: "main", inversionRequired: false }
    };

    const dutchVerb = conjugatePresent(verb.infinitive, subject);
    if (variant === "age") {
      const dutch = `${subject.pronoun} ${dutchVerb} ${numberChoice.dutch} jaar oud.`;
      const english = `${subject.english} ${englishBe(subject)} ${numberChoice.english} years old.`;
      return {
        english,
        dutch,
        hint: "Dutch age uses zijn + number + jaar oud.",
        grammarNote: "For age, Dutch uses zijn, not hebben.",
        grammar: buildMetadata(intent)
      };
    }
    if (variant === "objects") {
      const counted = pick(numberNouns);
      const dutch = `${subject.pronoun} ${dutchVerb} ${numberChoice.dutch} ${counted.dutch}.`;
      const english = `${subject.english} ${englishHave(subject)} ${numberChoice.english} ${counted.english}.`;
      return {
        english,
        dutch,
        hint: "Practice number words with plural nouns.",
        grammarNote: "Dutch number compounds place unit before ten.",
        grammar: buildMetadata(intent)
      };
    }
    const dutch = `${subject.pronoun} ${dutchVerb} ${numberChoice.dutch} euro.`;
    const english = `${subject.english} ${englishHave(subject)} ${numberChoice.english} euros.`;

    return {
      english,
      dutch,
      hint: "Dutch number compounds place unit before ten.",
      grammarNote: "Example: vijf-en-veertig (45).",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "transport-location") {
    const subject = pickSubject(["person", "group"]);
    const variant = pick(["trip", "cycle", "walk", "walk_on_foot", "arrive", "drive"] as const);
    const metaLocation = pick(locations);

    if (variant === "trip") {
      const transport = pick(transportOptions);
      const destination = pick(travelDestinations);
      const pattern = pick(["go", "travel", "leave"] as const);
      const verbMap = {
        go: "gaan",
        travel: "reizen",
        leave: "vertrekken"
      } as const;
      const verb: GrammarVerb = { infinitive: verbMap[pattern], tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "transport-location",
        subject,
        verb,
        location: metaLocation,
        clause: { type: "main", inversionRequired: false }
      };

      const dutchVerb = conjugatePresent(verb.infinitive, subject);
      let dutch = `${subject.pronoun} ${dutchVerb} ${transport.dutch} ${destination.dutch}.`;
      let english = `${subject.english} ${englishPresent(subject, "go")} ${transport.english} ${destination.english}.`;

      if (pattern === "travel") {
        english = `${subject.english} ${englishPresent(subject, "travel")} ${transport.english} ${destination.english}.`;
      }
      if (pattern === "leave") {
        english = `${subject.english} ${englishPresent(subject, "leave")} ${transport.english} for ${destination.english.replace(/^to\s+/, "")}.`;
        dutch = `${subject.pronoun} ${dutchVerb} ${transport.dutch} ${destination.dutch}.`;
      }

      return postProcess({
        english,
        dutch,
        hint: "Use met + vehicle for means of transport.",
        grammarNote: "Dutch often uses gaan/reizen + met de … + naar …",
        grammar: buildMetadata(intent)
      }, intent);
    }

    if (variant === "cycle") {
      const destination = pick(travelDestinations);
      const verb: GrammarVerb = { infinitive: "fietsen", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "transport-location",
        subject,
        verb,
        location: metaLocation,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent("fietsen", subject);
      return postProcess({
        english: `${subject.english} ${englishPresent(subject, "cycle")} ${destination.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${destination.dutch}.`,
        hint: "Fietsen + naar + place.",
        grammarNote: "No met is needed when the verb itself is fietsen.",
        grammar: buildMetadata(intent)
      }, intent);
    }

    if (variant === "walk") {
      const destination = pick(travelDestinations);
      const verb: GrammarVerb = { infinitive: "lopen", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "transport-location",
        subject,
        verb,
        location: metaLocation,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent("lopen", subject);
      return postProcess({
        english: `${subject.english} ${englishPresent(subject, "walk")} ${destination.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${destination.dutch}.`,
        hint: "Lopen + naar …",
        grammarNote: "Loop naar … covers walking to a destination.",
        grammar: buildMetadata(intent)
      }, intent);
    }

    if (variant === "walk_on_foot") {
      const toDestinations = travelDestinations.filter((d) => d.english.startsWith("to "));
      const destination = pick(toDestinations);
      const verb: GrammarVerb = { infinitive: "lopen", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "transport-location",
        subject,
        verb,
        location: metaLocation,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent("lopen", subject);
      const place = destination.english.slice(4);
      return postProcess({
        english: `${subject.english} ${englishPresent(subject, "walk")} to ${place} on foot.`,
        dutch: `${subject.pronoun} ${dutchVerb} te voet ${destination.dutch}.`,
        hint: "Te voet stresses on foot.",
        grammarNote: "Te voet sits after the verb: loop te voet naar …",
        grammar: buildMetadata(intent)
      }, intent);
    }

    if (variant === "arrive") {
      const transport = pick(transportOptions);
      const spot = pick(travelArrivalSpots);
      const verb: GrammarVerb = { infinitive: "komen", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "transport-location",
        subject,
        verb,
        location: metaLocation,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent("komen", subject, true);
      return postProcess({
        english: `${subject.english} ${englishPresent(subject, "arrive")} ${transport.english} ${spot.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${transport.dutch} ${spot.dutch} aan.`,
        accepted: uniqueStrings([
          `${subject.pronoun} ${dutchVerb} ${transport.dutch} ${spot.dutch} aan.`,
          `${subject.pronoun} ${dutchVerb} aan ${transport.dutch} ${spot.dutch}.`
        ]),
        hint: "Aankomen splits as kom … aan.",
        grammarNote: "The particle aan often comes after the place phrase in main clauses.",
        grammar: buildMetadata(intent)
      }, intent);
    }

    const destination = pick(travelDestinations);
    const verb: GrammarVerb = { infinitive: "rijden", tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "transport-location",
      subject,
      verb,
      location: metaLocation,
      clause: { type: "main", inversionRequired: false }
    };
    const dutchVerb = conjugatePresent("rijden", subject);
    return postProcess({
      english: `${subject.english} ${englishPresent(subject, "drive")} ${destination.english}.`,
      dutch: `${subject.pronoun} ${dutchVerb} met de auto ${destination.dutch}.`,
      hint: "Rijden met de auto + naar …",
      grammarNote: "Rijden pairs with met de auto for going by car as driver.",
      grammar: buildMetadata(intent)
    }, intent);
  }

  if (category === "zijn-have") {
    const variant = pick(["adjective", "profession", "possession"] as const);

    if (variant === "adjective") {
      const adjective = pick(adjectives);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "zijn-have",
        subject,
        verb,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject);
      return {
        english: `${subject.english} ${englishBe(subject)} ${adjective.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${adjective.dutch}.`,
        hint: getSubjectHint(subject, dutchVerb, "Use zijn for descriptions."),
        grammarNote: "Zijn changes by subject in the present tense.",
        grammar: buildMetadata(intent)
      };
    }

    if (variant === "profession") {
      const subject = pickSubject(["person", "group"]);
      const person = pick(peopleNouns);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = {
        grammarType: "zijn-have",
        subject,
        verb,
        object: person,
        clause: { type: "main", inversionRequired: false }
      };
      const dutchVerb = conjugatePresent(verb.infinitive, subject);
      const englishBase = stripLeadingThe(person.english);
      const englishProfession = subject.number === "plural"
        ? pluralizeEnglish(englishBase)
        : withIndefiniteArticle(englishBase);
      const dutchProfession = subject.number === "plural"
        ? (person.plural ?? `${person.word}en`)
        : person.word;
      return postProcess({
        english: `${subject.english} ${englishBe(subject)} ${englishProfession}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${dutchProfession}.`,
        hint: getSubjectHint(subject, dutchVerb, "Use zijn for professions."),
        grammarNote: "Professions often follow zijn directly.",
        grammar: buildMetadata(intent)
      }, intent);
    }

    const object = pick(objectNouns);
    const verb: GrammarVerb = { infinitive: "hebben", tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "zijn-have",
      subject,
      verb,
      object,
      clause: { type: "main", inversionRequired: false }
    };
    const dutchVerb = conjugatePresent(verb.infinitive, subject);
    const dutchObject = object.articleAllowed
      ? `${object.article ?? "een"} ${object.word}`
      : object.word;
    return {
      english: `${subject.english} ${englishHave(subject)} ${object.english}.`,
      dutch: `${subject.pronoun} ${dutchVerb} ${dutchObject}.`,
      hint: getSubjectHint(subject, dutchVerb, "Use hebben for possession."),
      grammarNote: "Hebben changes by subject in the present tense.",
      grammar: buildMetadata(intent)
    };
  }

  if (category === "demonstratives") {
    const noun = pick(demonstrativeNouns);
    // pick adjective compatible with noun when possible
    const nounMeta = findNounCollocation(noun.word);
    let adjective = pick(demonstrativeAdjectives);
    if (nounMeta) {
      const compatible = demonstrativeAdjectives.filter((a) => nounMeta.compatibleAdjectives.includes(a.dutch));
      if (compatible.length) adjective = pick(compatible);
    }
    const useThis = Math.random() > 0.5;
    const englishDemonstrative = useThis ? "This" : "That";
    const dutchDemonstrative = useThis ? noun.thisForm : noun.thatForm;
    const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "demonstratives",
      subject,
      verb,
      object: noun,
      clause: { type: "main", inversionRequired: false }
    };

    const dutch = `${dutchDemonstrative} is ${adjective.dutch}.`;
    const english = `${englishDemonstrative} ${noun.english} is ${adjective.english}.`;

    return postProcess({
      english,
      dutch,
      hint: "Use dit/dat with het words and deze/die with de words.",
      grammarNote: "Demonstratives agree with the noun's article.",
      grammar: buildMetadata(intent)
    }, intent);
  }

  return null;
}

export function generateStructuredSentence(category: PracticeCategory): GeneratedSentence | null {
  const maxAttempts = 6;
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = generateStructuredSentenceInternal(category);
    if (candidate) return candidate;
  }
  return null;
}
