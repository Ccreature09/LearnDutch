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
import { getVerbMetadata, isModalVerb } from "../lib/verb-database";

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
  { pronoun: "hij", english: "he", person: 3, number: "singular", semanticType: "person" },
  { pronoun: "zij", english: "she", person: 3, number: "singular", semanticType: "person" },
  { pronoun: "zij", english: "they", person: 3, number: "plural", semanticType: "group" },
  { pronoun: "wij", english: "we", person: 1, number: "plural", semanticType: "group" },
  { pronoun: "we", english: "we", person: 1, number: "plural", semanticType: "group" },
  { pronoun: "ze", english: "they", person: 3, number: "plural", semanticType: "group" },
  { pronoun: "jullie", english: "you all", person: 2, number: "plural", semanticType: "group" }
];

// NOTE: "het" (thing) is intentionally removed from the general subject pool.
// It caused inanimate-subject possession sentences ("het heeft een stroopwafel").
// "het" as a dummy/weather subject is generated only where it makes sense.

const adjectives = [
  { english: "happy", dutch: "blij" },
  { english: "funny", dutch: "leuk" },
  { english: "pretty", dutch: "mooi" },
  { english: "old", dutch: "oud" },
  { english: "young", dutch: "jong" },
  { english: "good", dutch: "goed" },
  { english: "bad", dutch: "slecht" },
  { english: "busy", dutch: "druk" },
  { english: "tired", dutch: "moe" },
  { english: "sick", dutch: "ziek" },
  { english: "late", dutch: "laat" },
  { english: "early", dutch: "vroeg" },
  { english: "ready", dutch: "klaar" },
  { english: "hungry", dutch: "hongerig" },
  { english: "thirsty", dutch: "dorstig" },
  { english: "cold", dutch: "koud" },
  { english: "warm", dutch: "warm" },
  { english: "right", dutch: "gelijk" },
  { english: "wrong", dutch: "fout" },
  { english: "alone", dutch: "alleen" },
  { english: "afraid", dutch: "bang" },
  { english: "angry", dutch: "boos" },
  { english: "surprised", dutch: "verrast" },
  { english: "proud", dutch: "trots" },
  { english: "quiet", dutch: "stil" },
  { english: "nervous", dutch: "zenuwachtig" },
  { english: "useful", dutch: "nuttig" },
  { english: "interesting", dutch: "interessant" },
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
  { word: "meisje", english: "the girl", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "meisjes" },
  { word: "docent", english: "the lecturer", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "docenten" },
];

const locations: GrammarLocation[] = [
  { noun: { word: "stad", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "in de", english: "in the city" },
  { noun: { word: "straat", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "in de", english: "in the street" },
  { noun: { word: "supermarkt", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "in de", english: "in the supermarket" },
  { noun: { word: "winkel", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "in de", english: "in the shop" },
  { noun: { word: "school", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "op", english: "at school" },
  { noun: { word: "universiteit", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "op de", english: "at the university" },
  { noun: { word: "bibliotheek", gender: "de", countability: "countable", articleAllowed: true, article: "de" }, preposition: "in de", english: "in the library" },
  { noun: { word: "station", gender: "het", countability: "countable", articleAllowed: true, article: "het" }, preposition: "op het", english: "at the station" },
  { noun: { word: "kantoor", gender: "het", countability: "countable", articleAllowed: true, article: "het" }, preposition: "in het", english: "in the office" },
  { noun: { word: "ziekenhuis", gender: "het", countability: "countable", articleAllowed: true, article: "het" }, preposition: "in het", english: "in the hospital" },
  { noun: { word: "zwembad", gender: "het", countability: "countable", articleAllowed: true, article: "het" }, preposition: "in het", english: "in the swimming pool" },
  { noun: { word: "huis", gender: "het", countability: "countable", articleAllowed: true, article: "het" }, preposition: "thuis", english: "at home" },
];

const adverbs = [
  { english: "today", dutch: "vandaag" },
  { english: "tomorrow", dutch: "morgen" },
  { english: "usually", dutch: "meestal" },
  { english: "this evening", dutch: "vanavond" },
  { english: "on Monday", dutch: "op maandag" },
  { english: "every week", dutch: "elke week" },
  { english: "in winter", dutch: "in de winter" },
];

// Paired so English and Dutch always match (fixes the question-inversion mismatch)
const pairedTimes = [
  { english: "today", dutch: "vandaag" },
  { english: "tomorrow", dutch: "morgen" },
  { english: "at school", dutch: "op school" },
  { english: "at home", dutch: "thuis" },
  { english: "in the city", dutch: "in de stad" },
  { english: "this evening", dutch: "vanavond" },
];

export const questionTimes = pairedTimes.map((t) => t.english);
export const questionTimesDutch = pairedTimes.map((t) => t.dutch);

const demonstrativeNouns: Array<GrammarNoun & { english: string; thisForm: string; thatForm: string }> = [
  { word: "boek", english: "book", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "boeken", thisForm: "dit boek", thatForm: "dat boek" },
  { word: "tafel", english: "table", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "tafels", thisForm: "deze tafel", thatForm: "die tafel" },
  { word: "stad", english: "city", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "steden", thisForm: "deze stad", thatForm: "die stad" },
  { word: "bloem", english: "flower", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "bloemen", thisForm: "deze bloem", thatForm: "die bloem" },
  { word: "jas", english: "coat", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "jassen", thisForm: "deze jas", thatForm: "die jas" },
  { word: "schoen", english: "shoe", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "schoenen", thisForm: "deze schoen", thatForm: "die schoen" },
  { word: "mes", english: "knife", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "messen", thisForm: "dit mes", thatForm: "dat mes" },
  { word: "huis", english: "house", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "huizen", thisForm: "dit huis", thatForm: "dat huis" },
  { word: "lamp", english: "lamp", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "lampen", thisForm: "deze lamp", thatForm: "die lamp" },
  { word: "project", english: "project", gender: "het", countability: "countable", articleAllowed: true, article: "het", plural: "projecten", thisForm: "dit project", thatForm: "dat project" },
  { word: "laptop", english: "laptop", gender: "de", countability: "countable", articleAllowed: true, article: "de", plural: "laptops", thisForm: "deze laptop", thatForm: "die laptop" },
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
  { word: "water", english: "water", gender: "het", countability: "uncountable", articleAllowed: false },
  { word: "laptop", english: "a laptop", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "laptops" },
  { word: "sleutel", english: "a key", gender: "de", countability: "countable", articleAllowed: true, article: "een", plural: "sleutels" },
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
  { english: "need to", dutch: "hoeven", kind: "negative-only" },
] as const satisfies ReadonlyArray<{ english: string; dutch: DutchModalInfinitive; kind: "regular" | "negative-only" }>;

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
  { english: "open the window", dutch: "het raam openen" },
  { english: "lock the door", dutch: "de deur op slot doen" },
  { english: "try the soup", dutch: "de soep proberen" },
  { english: "forget the keys", dutch: "de sleutels vergeten" },
  { english: "choose a gift", dutch: "een cadeau kiezen" },
  { english: "meet friends", dutch: "vrienden ontmoeten" },
  { english: "hand in the assignment", dutch: "de opdracht inleveren" },
  { english: "write a program", dutch: "een programma schrijven" },
  { english: "install the software", dutch: "de software installeren" },
  { english: "submit the project", dutch: "het project inleveren" },
] as const;

const baseVerbs = [
  { english: "work", dutch: "werken" },
  { english: "read", dutch: "lezen" },
  { english: "learn", dutch: "leren" },
  { english: "travel", dutch: "reizen" },
  { english: "go", dutch: "gaan" },
  { english: "come", dutch: "komen" },
  { english: "stay", dutch: "blijven" },
  { english: "find", dutch: "vinden" },
  { english: "make", dutch: "maken" },
  { english: "give", dutch: "geven" },
  { english: "take", dutch: "nemen" },
  { english: "speak", dutch: "spreken" },
  { english: "stand", dutch: "staan" },
  { english: "sit", dutch: "zitten" },
  { english: "lie", dutch: "liggen" },
  { english: "walk", dutch: "lopen" },
  { english: "live", dutch: "wonen" },
  { english: "play", dutch: "spelen" },
  { english: "understand", dutch: "begrijpen" },
  { english: "talk", dutch: "praten" },
  { english: "listen", dutch: "luisteren" },
  { english: "look/watch", dutch: "kijken" },
  { english: "eat", dutch: "eten" },
  { english: "drink", dutch: "drinken" },
  { english: "sleep", dutch: "slapen" },
  { english: "cycle", dutch: "fietsen" },
  { english: "swim", dutch: "zwemmen" },
  { english: "sing", dutch: "zingen" },
  { english: "help", dutch: "helpen" },
  { english: "cook", dutch: "koken" },
  { english: "buy", dutch: "kopen" },
  { english: "study", dutch: "studeren" },
  { english: "call", dutch: "bellen" },
  { english: "try", dutch: "proberen" },
  { english: "wait", dutch: "wachten" },
] as const;

// Verbs that need naar/door for complements — don't pair with "in de" locations
const movementVerbs = new Set(["lopen", "reizen", "gaan", "komen", "fietsen", "rijden", "vertrekken"]);
const modalInfinitives = new Set(["willen", "moeten", "kunnen", "mogen", "zullen", "hoeven", "durven"]);
const clauseVerbs = new Set(["weten", "denken", "zeggen", "vragen", "merken", "verwachten", "beseffen", "beweren", "uitleggen"]);

const VERB_ALLOWED_LOCATION_WORDS = new Map<string, ReadonlySet<string>>([
  ["lezen",    new Set(["bibliotheek", "park", "tuin", "huis", "school", "trein", "bed"])],
  ["leren",    new Set(["school", "universiteit", "bibliotheek", "huis", "kantoor"])],
  ["studeren", new Set(["bibliotheek", "universiteit", "huis", "school", "kantoor"])],
  ["slapen",   new Set(["huis", "ziekenhuis"])],
  ["koken",    new Set(["huis", "school"])],
  ["zwemmen",  new Set(["zwembad", "strand"])],
  ["zingen",   new Set(["school", "universiteit", "huis"])],
  ["werken",   new Set(["kantoor", "stad", "school", "universiteit", "ziekenhuis", "winkel", "station"])],
  ["praten",   new Set(["kantoor", "school", "universiteit", "stad", "station", "huis", "bibliotheek"])],
  ["wachten",  new Set(["station", "school", "universiteit", "stad", "winkel", "straat"])],
  ["kijken",   new Set(["huis", "school", "universiteit", "stad", "bibliotheek"])],
  ["liggen",   new Set(["huis", "ziekenhuis", "strand", "park"])],
  ["zitten",   new Set(["school", "universiteit", "bibliotheek", "huis", "kantoor", "station", "park"])],
]);
 
function locationAllowedForVerb(verbInfinitive: string, locationNounWord: string): boolean {
  const allowed = VERB_ALLOWED_LOCATION_WORDS.get(verbInfinitive);
  if (!allowed) return true; // no restriction
  return allowed.has(locationNounWord);
}

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
  { english: "fifteen", dutch: "vijftien" },
  { english: "twenty", dutch: "twintig" },
  { english: "twenty-one", dutch: "eenentwintig" },
  { english: "twenty-two", dutch: "tweeentwintig" },
  { english: "thirty", dutch: "dertig" },
  { english: "thirty-six", dutch: "zesendertig" },
  { english: "forty", dutch: "veertig" },
  { english: "forty-five", dutch: "vijfenveertig" },
  { english: "fifty", dutch: "vijftig" },
  { english: "sixty", dutch: "zestig" },
  { english: "seventy", dutch: "zeventig" },
  { english: "eighty", dutch: "tachtig" },
  { english: "ninety", dutch: "negentig" },
  { english: "one hundred", dutch: "honderd" },
];

const numberNouns = [
  { english: "books", dutch: "boeken" },
  { english: "students", dutch: "studenten" },
  { english: "bikes", dutch: "fietsen" },
  { english: "flowers", dutch: "bloemen" },
  { english: "chairs", dutch: "stoelen" },
  { english: "tickets", dutch: "kaartjes" },
  { english: "euros", dutch: "euro" },
  { english: "windows", dutch: "ramen" },
  { english: "trees", dutch: "bomen" },
  { english: "cups", dutch: "kopjes" },
  { english: "errors", dutch: "fouten" },
  { english: "guests", dutch: "gasten" },
] as const;

export const transportOptions = [
  { english: "by train", dutch: "met de trein" },
  { english: "by bike", dutch: "met de fiets" },
  { english: "by bus", dutch: "met de bus" },
  { english: "by tram", dutch: "met de tram" },
  { english: "by metro", dutch: "met de metro" },
  { english: "by boat", dutch: "met de boot" },
  { english: "by plane", dutch: "met het vliegtuig" },
  { english: "by car", dutch: "met de auto" },
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
  { english: "to the office", dutch: "naar het kantoor" },
  { english: "to the university", dutch: "naar de universiteit" },
] as const;

export const travelArrivalSpots = [
  { english: "at the station", dutch: "op het station" },
  { english: "at school", dutch: "op school" },
  { english: "at work", dutch: "op het werk" },
  { english: "in the city centre", dutch: "in het centrum" },
  { english: "at the hospital", dutch: "bij het ziekenhuis" },
  { english: "at the library", dutch: "bij de bibliotheek" },
  { english: "at home", dutch: "thuis" },
  { english: "at the airport", dutch: "op het vliegveld" },
] as const;

const perfectVerbs = [
  { infinitive: "werken",    english: "worked",       participle: "gewerkt",     auxiliary: "hebben" as const },
  { infinitive: "lezen",     english: "read",         participle: "gelezen",     auxiliary: "hebben" as const },
  { infinitive: "schrijven", english: "written",      participle: "geschreven",  auxiliary: "hebben" as const },
  { infinitive: "zingen",    english: "sung",         participle: "gezongen",    auxiliary: "hebben" as const },
  { infinitive: "wachten",   english: "waited",       participle: "gewacht",     auxiliary: "hebben" as const },
  { infinitive: "kopen",     english: "bought",       participle: "gekocht",     auxiliary: "hebben" as const },
  { infinitive: "verkopen",  english: "sold",         participle: "verkocht",    auxiliary: "hebben" as const },
  { infinitive: "bellen",    english: "called",       participle: "gebeld",      auxiliary: "hebben" as const },
  { infinitive: "gaan",      english: "gone",         participle: "gegaan",      auxiliary: "zijn" as const },
  { infinitive: "maken",     english: "made",         participle: "gemaakt",     auxiliary: "hebben" as const },
  { infinitive: "vinden",    english: "found",        participle: "gevonden",    auxiliary: "hebben" as const },
  { infinitive: "koken",     english: "cooked",       participle: "gekookt",     auxiliary: "hebben" as const },
  { infinitive: "studeren",  english: "studied",      participle: "gestudeerd",  auxiliary: "hebben" as const },
  { infinitive: "drinken",   english: "drunk",        participle: "gedronken",   auxiliary: "hebben" as const },
  { infinitive: "eten",      english: "eaten",        participle: "gegeten",     auxiliary: "hebben" as const },
  { infinitive: "komen",     english: "come",         participle: "gekomen",     auxiliary: "zijn" as const },
  { infinitive: "blijven",   english: "stayed",       participle: "gebleven",    auxiliary: "zijn" as const },
  { infinitive: "lopen",     english: "walked",       participle: "gelopen",     auxiliary: "zijn" as const },
  { infinitive: "fietsen",   english: "cycled",       participle: "gefietst",    auxiliary: "zijn" as const },
  { infinitive: "zwemmen",   english: "swum",         participle: "gezwommen",   auxiliary: "hebben" as const },
  { infinitive: "slapen",    english: "slept",        participle: "geslapen",    auxiliary: "hebben" as const },
  { infinitive: "verliezen", english: "lost",         participle: "verloren",    auxiliary: "hebben" as const },
  { infinitive: "winnen",    english: "won",          participle: "gewonnen",    auxiliary: "hebben" as const },
  { infinitive: "spreken",   english: "spoken",       participle: "gesproken",   auxiliary: "hebben" as const },
  { infinitive: "beginnen",  english: "begun",        participle: "begonnen",    auxiliary: "zijn" as const },
  { infinitive: "betalen",   english: "paid",         participle: "betaald",     auxiliary: "hebben" as const },
  { infinitive: "helpen",    english: "helped",       participle: "geholpen",    auxiliary: "hebben" as const },
  { infinitive: "proberen",  english: "tried",        participle: "geprobeerd",  auxiliary: "hebben" as const },
  { infinitive: "vergeten",  english: "forgotten",    participle: "vergeten",    auxiliary: "hebben" as const },
  { infinitive: "vertrekken",english: "left",         participle: "vertrokken",  auxiliary: "zijn" as const },
  { infinitive: "rijden",    english: "driven",       participle: "gereden",     auxiliary: "hebben" as const },
  { infinitive: "kiezen",    english: "chosen",       participle: "gekozen",     auxiliary: "hebben" as const },
  { infinitive: "ontmoeten", english: "met",          participle: "ontmoet",     auxiliary: "hebben" as const },
  { infinitive: "bezoeken",  english: "visited",      participle: "bezocht",     auxiliary: "hebben" as const },
  { infinitive: "luisteren", english: "listened",     participle: "geluisterd",  auxiliary: "hebben" as const },
  // REMOVED: zijn, hebben, weten, denken, willen, zeggen — all incomplete without a complement
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
  { english: "recently", dutch: "onlangs" },
  { english: "at school", dutch: "op school" },
  { english: "in the city", dutch: "in de stad" },
  { english: "on holiday", dutch: "met vakantie" },
] as const;

export const becauseReasons = [
  { english: "it is raining", dutchWant: "het regent", dutchOmdat: "het regent" },
  { english: "it is late", dutchWant: "het is laat", dutchOmdat: "het laat is" },
  { english: "the shop is closed", dutchWant: "de winkel is dicht", dutchOmdat: "de winkel dicht is" },
  { english: "I have an exam tomorrow", dutchWant: "ik heb morgen een examen", dutchOmdat: "ik morgen een examen heb" },
  { english: "we are tired", dutchWant: "wij zijn moe", dutchOmdat: "wij moe zijn" },
  { english: "the train is delayed", dutchWant: "de trein heeft vertraging", dutchOmdat: "de trein vertraging heeft" },
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
  { english: "it is snowing", dutchWant: "het sneeuwt", dutchOmdat: "het sneeuwt" },
  { english: "the homework is difficult", dutchWant: "het huiswerk is moeilijk", dutchOmdat: "het huiswerk moeilijk is" },
  { english: "everyone is on holiday", dutchWant: "iedereen is met vakantie", dutchOmdat: "iedereen met vakantie is" },
] as const;

// Semantically coherent adjective–reason pairings.
// Each entry guarantees the omdat/want sentence actually makes sense.
const coherentOmdatPairs: Array<{
  adjective: { english: string; dutch: string };
  reason: typeof becauseReasons[number];
}> = [
  { adjective: { english: "tired", dutch: "moe" },        reason: becauseReasons[3]  }, // exam tomorrow
  { adjective: { english: "tired", dutch: "moe" },        reason: becauseReasons[15] }, // meeting ran long
  { adjective: { english: "tired", dutch: "moe" },        reason: becauseReasons[22] }, // baby crying
  { adjective: { english: "busy", dutch: "druk" },        reason: becauseReasons[3]  }, // exam tomorrow
  { adjective: { english: "busy", dutch: "druk" },        reason: becauseReasons[15] }, // meeting ran long
  { adjective: { english: "busy", dutch: "druk" },        reason: becauseReasons[26] }, // we had guests
  { adjective: { english: "angry", dutch: "boos" },       reason: becauseReasons[5]  }, // train delayed
  { adjective: { english: "angry", dutch: "boos" },       reason: becauseReasons[19] }, // flight cancelled
  { adjective: { english: "angry", dutch: "boos" },       reason: becauseReasons[23] }, // bus did not come
  { adjective: { english: "sick", dutch: "ziek" },        reason: becauseReasons[22] }, // too cold
  { adjective: { english: "sick", dutch: "ziek" },        reason: becauseReasons[6]  }, // weather bad
  { adjective: { english: "late", dutch: "laat" },        reason: becauseReasons[5]  }, // train delayed
  { adjective: { english: "late", dutch: "laat" },        reason: becauseReasons[14] }, // traffic heavy
  { adjective: { english: "late", dutch: "laat" },        reason: becauseReasons[23] }, // bus did not come
  { adjective: { english: "nervous", dutch: "zenuwachtig" }, reason: becauseReasons[3] }, // exam tomorrow
  { adjective: { english: "nervous", dutch: "zenuwachtig" }, reason: becauseReasons[25] }, // film starts soon
  { adjective: { english: "afraid", dutch: "bang" },      reason: becauseReasons[22] }, // too cold
  { adjective: { english: "afraid", dutch: "bang" },      reason: becauseReasons[13] }, // dog is ill
  { adjective: { english: "proud", dutch: "trots" },      reason: becauseReasons[28] }, // homework difficult
  { adjective: { english: "wrong", dutch: "fout" },       reason: becauseReasons[24] }, // forgot appointment
  { adjective: { english: "wrong", dutch: "fout" },       reason: becauseReasons[12] }, // lost wallet
  { adjective: { english: "useful", dutch: "nuttig" },    reason: becauseReasons[3]  }, // exam tomorrow
  { adjective: { english: "happy", dutch: "blij" },       reason: becauseReasons[26] }, // we had guests
  { adjective: { english: "happy", dutch: "blij" },       reason: becauseReasons[25] }, // film starts soon
].filter((p) => p.adjective && p.reason);

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
  { english: "read", dutch: "lezen" },
  { english: "tell/ask", dutch: "vragen" },
  { english: "notice", dutch: "merken" },
  { english: "find", dutch: "vinden" },
  { english: "expect", dutch: "verwachten" },
  { english: "realise", dutch: "beseffen" },
  { english: "claim", dutch: "beweren" },
] as const;
// NOTE: "twijfelen" removed — it requires "of" not "dat", handled separately if needed.

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
  { english: "the keys are on the table", dutch: "de sleutels op de tafel liggen" },
  { english: "his brother speaks French", dutch: "zijn broer Frans spreekt" },
  { english: "the cake tastes good", dutch: "de taart lekker is" },
  { english: "winter is coming soon", dutch: "de winter snel komt" },
  { english: "the shop opens at eight", dutch: "de winkel om acht uur opent" },
  { english: "they have two cats", dutch: "zij twee katten hebben" },
  { english: "the soup is too salty", dutch: "de soep te zout is" },
  { english: "I need more time", dutch: "ik meer tijd nodig heb" },
  { english: "the project is ready", dutch: "het project klaar is" },
  { english: "the lecturer explains the lesson", dutch: "de docent de les uitlegt" },
  { english: "the student expects good news", dutch: "de student goed nieuws verwacht" },
  { english: "the assignment is difficult", dutch: "de opdracht moeilijk is" },
  { english: "the weather will be good", dutch: "het weer goed zal zijn" },
  { english: "he is never late", dutch: "hij nooit te laat is" },
  { english: "she is afraid", dutch: "zij bang is" },
  { english: "the train is on time", dutch: "de trein op tijd is" },
] as const;
// Note: no content items contain a nested "dat" clause — prevents double-embedding.

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
  { english: "small", dutch: "klein" },
  { english: "large", dutch: "groot" },
  { english: "clean", dutch: "schoon" },
  { english: "dirty", dutch: "vies" },
  { english: "soft", dutch: "zacht" },
  { english: "hard", dutch: "hard" },
  { english: "fresh", dutch: "vers" },
  { english: "useful", dutch: "nuttig" },
  { english: "fragile", dutch: "breekbaar" },
  { english: "quiet", dutch: "stil" },
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
  { english: "on holiday", dutch: "met vakantie" },
  { english: "at the university", dutch: "op de universiteit" },
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
  { english: "He was taking notes while the professor was speaking.", dutch: "Hij maakte aantekeningen terwijl de professor sprak." },
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
  { english: "Then the doctor arrived.", dutch: "Toen kwam de dokter binnen." },
] as const;

// ─── helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueStrings(values: Array<string | undefined>) {
  return [...new Set(values.filter((v): v is string => Boolean(v?.trim())))];
}

function pickSubject(allowedTypes: SubjectSemanticType[] = ["person", "group"]): GrammarSubject {
  const matching = subjects.filter((s) => allowedTypes.includes(s.semanticType ?? "person"));
  return pick(matching.length ? matching : subjects);
}

function withTeInfinitive(phrase: string) {
  const tokens = phrase.trim().split(/\s+/);
  if (tokens.length <= 1) return `te ${phrase}`;
  const infinitive = tokens.pop();
  return `${tokens.join(" ")} te ${infinitive}`;
}

type PickedObject = (GrammarNoun & { english: string }) | { word: string; articleAllowed: boolean; article?: string; english?: string };

function pickObjectForVerb(infinitive: string): PickedObject {
  const vmeta = findVerbCollocation(infinitive);
  if (vmeta?.commonObjects?.length) {
    const raw = pick(vmeta.commonObjects);
    const hasArticle = /^(de |het |een )/.test(raw);
    if (hasArticle) {
      const parts = raw.split(/\s+/);
      const article = parts.shift()!;
      const word = parts.join(" ");
      return { word, articleAllowed: true, article, english: word };
    }
    return { word: raw, articleAllowed: false, english: raw };
  }
  return pick(objectNouns);
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
  return `${/^[aeiou]/i.test(value) ? "an" : "a"} ${value}`;
}

function pluralizeEnglish(value: string): string {
  const irregulars: Record<string, string> = {
    man: "men",
    woman: "women",
    policeman: "policemen",
    policewoman: "policewomen",
    child: "children",
    person: "people",
    mouse: "mice",
    tooth: "teeth",
    foot: "feet",
  };
  const lower = value.toLowerCase();
  if (irregulars[lower]) return irregulars[lower];
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
    modalVerb: intent.verb.modalInfinitive,
  };
}

function getSubjectHint(subject: GrammarSubject, verbForm: string, genericHint: string): string {
  if (subject.english.includes("you")) {
    if (subject.english === "you (informal)") return `Use "jij/je": jij/je ${verbForm}`;
    if (subject.english === "you (formal)") return `Use formal "u": u ${verbForm}`;
    if (subject.english === "you all") return `Use "jullie" (plural): jullie ${verbForm}`;
  }
  return genericHint;
}

function addHints(candidate: GeneratedSentence, intent: GrammarIntent): GeneratedSentence {
  try {
    const vmeta = findVerbCollocation(intent.verb.infinitive);
    if (vmeta?.requiresDirectObject) {
      const sample = vmeta.commonObjects?.[0] ?? "een object";
      candidate.hint += ` Tip: '${vmeta.verb}' usually takes an object, e.g. '${sample}'.`;
    } else if (vmeta?.requiresPreposition) {
      candidate.hint += ` Tip: '${vmeta.verb}' requires '${vmeta.requiresPreposition}' before its object.`;
    } else if (vmeta?.preferredPreposition) {
      candidate.hint += ` Tip: '${vmeta.verb}' often pairs with '${vmeta.preferredPreposition}'.`;
    }
  } catch (_) { /* non-fatal */ }
  return candidate;
}

function postProcess(candidate: GeneratedSentence, intent: GrammarIntent): GeneratedSentence | null {
  candidate.english = candidate.english.replace(/\bstaies\b/gi, "stays");
  const scores = scoreCandidate({ dutch: candidate.dutch, english: candidate.english }, intent);
  if (scores.overall < 0.45) return null;
  candidate.intent = intent;
  candidate.hint = `${candidate.hint} (quality:${scores.overall.toFixed(2)})`;
  return addHints(candidate, intent);
}

// ─── main generator ───────────────────────────────────────────────────────────

function generateStructuredSentenceInternal(category: PracticeCategory): GeneratedSentence | null {
  const subject = pick(subjects);

  // ── ZIJN-HAVE ────────────────────────────────────────────────────────────────
  if (category === "zijn-have") {
    const variant = pick(["adjective", "profession", "possession"] as const);

    if (variant === "adjective") {
      const adj = pick(adjectives);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = { grammarType: "zijn-have", subject, verb, clause: { type: "main", inversionRequired: false } };
      const dutchVerb = conjugatePresent("zijn", subject);
      return {
        english: `${subject.english} ${englishBe(subject)} ${adj.english}.`,
        dutch: `${subject.pronoun} ${dutchVerb} ${adj.dutch}.`,
        hint: getSubjectHint(subject, dutchVerb, "Use zijn for descriptions."),
        grammarNote: "Zijn changes by subject in the present tense.",
        grammar: buildMetadata(intent),
      };
    }

    if (variant === "profession") {
      const personSubject = pickSubject(["person", "group"]);
      const person = pick(peopleNouns);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = { grammarType: "zijn-have", subject: personSubject, verb, object: person, clause: { type: "main", inversionRequired: false } };
      const dutchVerb = conjugatePresent("zijn", personSubject);
      const englishBase = stripLeadingThe(person.english);
      const engProfession = personSubject.number === "plural" ? pluralizeEnglish(englishBase) : withIndefiniteArticle(englishBase);
      const dutchProfession = personSubject.number === "plural" ? (person.plural ?? `${person.word}en`) : person.word;
      return postProcess({
        english: `${personSubject.english} ${englishBe(personSubject)} ${engProfession}.`,
        dutch: `${personSubject.pronoun} ${dutchVerb} ${dutchProfession}.`,
        hint: getSubjectHint(personSubject, dutchVerb, "Use zijn for professions."),
        grammarNote: "Professions often follow zijn directly without an article.",
        grammar: buildMetadata(intent),
      }, intent);
    }

    // possession — person/group subjects only
    const possSubject = pickSubject(["person", "group"]);
    const object = pick(objectNouns);
    const verb: GrammarVerb = { infinitive: "hebben", tense: "present" };
    const intent: GrammarIntent = { grammarType: "zijn-have", subject: possSubject, verb, object, clause: { type: "main", inversionRequired: false } };
    const dutchVerb = conjugatePresent("hebben", possSubject);
    const dutchObject = object.articleAllowed ? `${object.article ?? "een"} ${object.word}` : object.word;
    return {
      english: `${possSubject.english} ${englishHave(possSubject)} ${object.english}.`,
      dutch: `${possSubject.pronoun} ${dutchVerb} ${dutchObject}.`,
      hint: getSubjectHint(possSubject, dutchVerb, "Use hebben for possession."),
      grammarNote: "Hebben changes by subject in the present tense.",
      grammar: buildMetadata(intent),
    };
  }

  // ── NEGATION ─────────────────────────────────────────────────────────────────
  if (category === "negation") {
    const variant = pick(["location", "adjective", "possession"] as const);
    const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };

    if (variant === "adjective") {
      const adj = pick(adjectives);
      const intent: GrammarIntent = { grammarType: "negation", subject, verb, negation: true, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent("zijn", subject);
      return {
        english: `${subject.english} ${englishBe(subject)} not ${adj.english}.`,
        dutch: `${subject.pronoun} ${dv} niet ${adj.dutch}.`,
        hint: getSubjectHint(subject, dv, "Use niet to negate adjectives."),
        grammarNote: "Negation usually comes after the finite verb.",
        grammar: buildMetadata(intent),
      };
    }

    if (variant === "possession") {
      const object = pick(objectNouns);
      const hv: GrammarVerb = { infinitive: "hebben", tense: "present" };
      const intent: GrammarIntent = { grammarType: "negation", subject, verb: hv, object, negation: true, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent("hebben", subject);
      return {
        english: `${subject.english} ${englishDo(subject).toLowerCase()} not have ${object.english}.`,
        dutch: `${subject.pronoun} ${dv} geen ${object.word}.`,
        hint: getSubjectHint(subject, dv, "Use geen to negate indefinite nouns."),
        grammarNote: "Geen replaces een in negative noun phrases.",
        grammar: buildMetadata(intent),
      };
    }

    const location = pick(locations);
    const intent: GrammarIntent = { grammarType: "negation", subject, verb, location, negation: true, clause: { type: "main", inversionRequired: false } };
    const dv = conjugatePresent("zijn", subject);
    return {
      english: `${subject.english} ${englishBe(subject)} not ${location.english}.`,
      dutch: `${subject.pronoun} ${dv} niet ${renderLocation(location)}.`,
      hint: getSubjectHint(subject, dv, "Use niet to negate verbs or adjectives."),
      grammarNote: "niet usually comes after the finite verb.",
      grammar: buildMetadata(intent),
    };
  }

  // ── QUESTIONS-INVERSION ──────────────────────────────────────────────────────
  if (category === "questions-inversion") {
    const qSubject = pickSubject(["person", "group"]);
    const variant = pick(["verb", "adjective", "possession"] as const);

    if (variant === "adjective") {
      const adj = pick(adjectives);
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = { grammarType: "questions-inversion", subject: qSubject, verb, clause: { type: "question", inversionRequired: true } };
      const dv = conjugatePresent("zijn", qSubject, true);
      return {
        english: `${questionEnglishBe(qSubject)} ${qSubject.english} ${adj.english}?`,
        dutch: `${dv.charAt(0).toUpperCase()}${dv.slice(1)} ${qSubject.pronoun} ${adj.dutch}?`,
        hint: "Verb comes first in Dutch questions.",
        grammarNote: "Yes/no questions invert the verb and subject.",
        grammar: buildMetadata(intent),
      };
    }

    if (variant === "possession") {
      const object = pick(objectNouns);
      const verb: GrammarVerb = { infinitive: "hebben", tense: "present" };
      const intent: GrammarIntent = { grammarType: "questions-inversion", subject: qSubject, verb, object, clause: { type: "question", inversionRequired: true } };
      const dv = conjugatePresent("hebben", qSubject, true);
      const dutchObject = object.articleAllowed ? `${object.article ?? "een"} ${object.word}` : object.word;
      return {
        english: `${englishDo(qSubject)} ${qSubject.english} have ${object.english}?`,
        dutch: `${dv.charAt(0).toUpperCase()}${dv.slice(1)} ${qSubject.pronoun} ${dutchObject}?`,
        hint: "Use hebben for possession questions.",
        grammarNote: "Verb-first word order in Dutch questions.",
        grammar: buildMetadata(intent),
      };
    }

    // verb variant — pick a paired time so English and Dutch always match
    const verbChoice = pick(baseVerbs);
    const verb: GrammarVerb = { infinitive: verbChoice.dutch, tense: "present" };
    const intent: GrammarIntent = { grammarType: "questions-inversion", subject: qSubject, verb, clause: { type: "question", inversionRequired: true } };
    const dv = conjugatePresent(verbChoice.dutch, qSubject, true);
    const timeIdx = Math.floor(Math.random() * pairedTimes.length);
    const chosenTime = pairedTimes[timeIdx];
    const dutch = `${dv.charAt(0).toUpperCase()}${dv.slice(1)} ${qSubject.pronoun} ${chosenTime.dutch}?`;
    const english = `${englishDo(qSubject)} ${qSubject.english} ${verbChoice.english} ${chosenTime.english}?`;
    return postProcess({ english, dutch, hint: "Yes/no questions put the verb first.", grammarNote: "Dutch questions invert the verb and subject.", grammar: buildMetadata(intent) }, intent);
  }

  // ── MODALS ───────────────────────────────────────────────────────────────────
  if (category === "modals") {
    const mSubject = pickSubject(["person", "group"]);
    const modal = pick(modalOptions);
    const action = pick(modalActions);
    const verb: GrammarVerb = { infinitive: modal.dutch, tense: "present", isModal: true, modalInfinitive: modal.dutch };
    const intent: GrammarIntent = { grammarType: "modals", subject: mSubject, verb, clause: { type: "main", inversionRequired: false } };
    const dutchModal = conjugatePresent(modal.dutch, mSubject);
    if (modal.kind === "negative-only") {
      return {
        english: `${mSubject.english} ${englishDo(mSubject).toLowerCase()} not need to ${action.english}.`,
        dutch: `${mSubject.pronoun} ${dutchModal} niet ${withTeInfinitive(action.dutch)}.`,
        hint: getSubjectHint(mSubject, dutchModal, "Use 'te' + infinitive after hoeven."),
        grammarNote: "Hoeven is commonly used with niet in Dutch.",
        grammar: buildMetadata(intent),
      };
    }
    return {
      english: `${mSubject.english} ${englishModal(mSubject, modal.english)} ${action.english}.`,
      dutch: `${mSubject.pronoun} ${dutchModal} ${action.dutch}.`,
      hint: getSubjectHint(mSubject, dutchModal, "Modal in position 2, infinitive at the end."),
      grammarNote: "Modal verbs keep the main verb in infinitive at the end.",
      grammar: buildMetadata(intent),
    };
  }

  // ── OMDAT-WANT ───────────────────────────────────────────────────────────────
  if (category === "omdat-want") {
    const oSubject = pickSubject(["person", "group"]);
    const variant = pick(["omdat", "want"] as const);
    // Use coherent pairs — no more random adjective + random reason
    const chosen = pick(coherentOmdatPairs);
    const adjective = chosen.adjective;
    const reason = chosen.reason;

    if (variant === "want") {
      const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
      const intent: GrammarIntent = { grammarType: "omdat-want", subject: oSubject, verb, clause: { type: "main", inversionRequired: false, conjunction: "want" } };
      const dv = conjugatePresent("zijn", oSubject);
      return {
        english: `${oSubject.english} ${englishBe(oSubject)} ${adjective.english} because ${reason.english}.`,
        dutch: `${oSubject.pronoun} ${dv} ${adjective.dutch} want ${reason.dutchWant}.`,
        hint: "Want keeps normal word order.",
        grammarNote: "Want is a coordinating conjunction; verb stays in position 2.",
        grammar: buildMetadata(intent),
      };
    }

    const verb: GrammarVerb = { infinitive: "blijven", tense: "present" };
    const intent: GrammarIntent = { grammarType: "omdat-want", subject: oSubject, verb, clause: { type: "subordinate", inversionRequired: false, conjunction: "omdat" } };
    const dv = conjugatePresent("blijven", oSubject);
    const location = pick(frontedComplements);
    return {
      english: `${oSubject.english} ${englishPresent(oSubject, "stay")} ${location.english} because ${reason.english}.`,
      dutch: `${oSubject.pronoun} ${dv} ${location.dutch} omdat ${reason.dutchOmdat}.`,
      hint: "Omdat clauses move the verb to the end.",
      grammarNote: "In subordinate clauses, the verb appears at the end.",
      grammar: buildMetadata(intent),
    };
  }

  // ── DAT-CLAUSE ───────────────────────────────────────────────────────────────
  if (category === "dat-clause") {
    const dSubject = pickSubject(["person", "group"]);
    const mainVerb = pick(datMainVerbs);
    // Block double-embedded dat-clauses: content must not itself contain "dat" or "of"
    const eligibleContents = datClauseContents.filter((c) => !c.dutch.includes(" dat ") && !c.dutch.includes(" of "));
    const content = eligibleContents.length ? pick(eligibleContents) : pick(datClauseContents);
    const verb: GrammarVerb = { infinitive: mainVerb.dutch, tense: "present" };
    const intent: GrammarIntent = { grammarType: "dat-clause", subject: dSubject, verb, clause: { type: "subordinate", inversionRequired: false, conjunction: "dat" } };
    const dv = conjugatePresent(mainVerb.dutch, dSubject);
    return {
      english: `${dSubject.english} ${englishPresent(dSubject, mainVerb.english)} that ${content.english}.`,
      dutch: `${dSubject.pronoun} ${dv} dat ${content.dutch}.`,
      hint: getSubjectHint(dSubject, dv, "Dat introduces a subordinate clause."),
      grammarNote: "Use dat to introduce reported information; verb goes to end of the clause.",
      grammar: buildMetadata(intent),
    };
  }

  // ── FRONTED-INVERSION ────────────────────────────────────────────────────────
   if (category === "fronted-inversion") {
    const fSubject = pickSubject(["person", "group"]);
    const adverb = pick(adverbs);
 
    // Exclude verbs that require a direct object or clause — they produce broken
    // sentences in this simple [Adv] [Verb] [Subj] [Location] template.
    const verbsForFronted = baseVerbs.filter((v) => {
      const c = findVerbCollocation(v.dutch);
      return !c?.requiresDirectObject && !c?.requiresObjectOrClause;
    });
    const verbChoice = pick(verbsForFronted.length ? verbsForFronted : baseVerbs);
 
    const verb: GrammarVerb = { infinitive: verbChoice.dutch, tense: "present" };
    const intent: GrammarIntent = {
      grammarType: "fronted-inversion",
      subject: fSubject,
      verb,
      clause: { type: "fronted_time", inversionRequired: true },
      adverb,
    };
    const dv = conjugatePresent(verbChoice.dutch, fSubject, true);
 
    let complement: { english: string; dutch: string };
    if (movementVerbs.has(verbChoice.dutch)) {
      complement = pick(travelDestinations);
    } else {
      // Filter static complements to only those compatible with this verb.
      // Extract noun word as last token of Dutch phrase.
      const validComplements = frontedComplements.filter((loc) => {
        const locWord = loc.dutch.trim().split(/\s+/).pop() ?? "";
        return locationAllowedForVerb(verbChoice.dutch, locWord);
      });
      complement = pick(validComplements.length >= 2 ? validComplements : frontedComplements);
    }
 
    const dutch = `${adverb.dutch} ${dv} ${fSubject.pronoun} ${complement.dutch}.`;
    const english = `${adverb.english.charAt(0).toUpperCase()}${adverb.english.slice(1)}, ${fSubject.english} ${englishPresent(fSubject, verbChoice.english)} ${complement.english}.`;
    return postProcess({
      english,
      dutch,
      hint: "Fronted time expressions trigger inversion.",
      grammarNote: "When a sentence starts with time/place, the verb comes before the subject.",
      grammar: buildMetadata(intent),
    }, intent);
  }

  // ── PERFECT-TENSE ─────────────────────────────────────────────────────────────
  if (category === "perfect-tense") {
    const pSubject = pickSubject(["person", "group"]);
    // Exclude verbs that are incomplete/awkward without a complement in perfect
    const incompleteInPerfect = new Set(["zijn", "hebben", "weten", "denken", "willen", "zeggen", "mogen", "kunnen", "moeten"]);
    let verbChoice = pick(perfectVerbs);
    let attempts = 0;
    while (incompleteInPerfect.has(verbChoice.infinitive) && attempts < 10) {
      verbChoice = pick(perfectVerbs);
      attempts++;
    }
    if (incompleteInPerfect.has(verbChoice.infinitive)) return null;

    const phrase = pick(perfectTimePhrases);
    const verb: GrammarVerb = { infinitive: verbChoice.infinitive, tense: "perfect", auxiliary: verbChoice.auxiliary };
    const intent: GrammarIntent = { grammarType: "perfect-tense", subject: pSubject, verb, clause: { type: "main", inversionRequired: false } };
    const auxVerb = conjugatePresent(verbChoice.auxiliary, pSubject);

    // Attach required object if verb demands one
    const vmeta = findVerbCollocation(verbChoice.infinitive);
    let objDutch = "";
    let objEnglish = "";
    if (vmeta?.requiresDirectObject) {
      // IMPORTANT: do NOT use pickObjectForVerb here.
      // Its commonObjects are Dutch phrases (e.g. "de huur", "de sleutels") that
      // would leak Dutch into the English prompt.
      // objectNouns has clean .english fields for every entry.
      const countableObjects = objectNouns.filter((o) => o.countability === "countable");
      const obj = pick(countableObjects);
      objDutch = `${obj.article ?? "een"} ${obj.word}`;
      objEnglish = obj.english; // always proper English, e.g. "a book", "a key"
    }

    const dutch1 = `${pSubject.pronoun} ${auxVerb}${objDutch ? ` ${objDutch}` : ""} ${phrase.dutch} ${verbChoice.participle}.`;
    const dutch2 = `${pSubject.pronoun} ${auxVerb}${objDutch ? ` ${objDutch}` : ""} ${verbChoice.participle} ${phrase.dutch}.`;
    const english = `${pSubject.english} ${englishHave(pSubject)} ${objEnglish ? `${objEnglish} ` : ""}${verbChoice.english} ${phrase.english}.`;

    // Pronoun variants
    function pronVars(s: string): string[] {
      return [s,
        s.replace(/\bjij\b/g, "je"), s.replace(/\bje\b/g, "jij"),
        s.replace(/\bwij\b/g, "we"), s.replace(/\bwe\b/g, "wij"),
        s.replace(/\bzij\b/g, "ze"), s.replace(/\bze\b/g, "zij"),
      ];
    }
    const accepted = [...new Set([...pronVars(dutch1), ...pronVars(dutch2)])];

    return {
      english,
      dutch: dutch1,
      accepted,
      hint: getSubjectHint(pSubject, auxVerb, `Both "${phrase.dutch} ${verbChoice.participle}" and "${verbChoice.participle} ${phrase.dutch}" are accepted.`),
      grammarNote: "Movement verbs (gaan, komen, blijven…) use zijn; most others use hebben.",
      grammar: buildMetadata(intent),
    };
  }

  // ── TERWIJL-TOEN ─────────────────────────────────────────────────────────────
  if (category === "terwijl-toen") {
    const tSubject = pickSubject(["person", "group"]);
    const variant = pick(["terwijl", "toen"] as const);
    if (variant === "toen") {
      const verb: GrammarVerb = { infinitive: "zijn", tense: "past" };
      const intent: GrammarIntent = { grammarType: "terwijl-toen", subject: tSubject, verb, clause: { type: "fronted_time", inversionRequired: true, conjunction: "toen" } };
      const event = pick(toenEvents);
      return {
        english: event.english,
        dutch: event.dutch,
        accepted: event.dutch === "Toen lachten wij erom."
          ? uniqueStrings([event.dutch, "Toen hebben wij erom gelachen.", "Toen hebben we erom gelachen."])
          : undefined,
        hint: "Toen refers to a specific moment in the past.",
        grammarNote: "Toen often triggers inversion in the main clause.",
        grammar: buildMetadata(intent),
      };
    }
    const verb: GrammarVerb = { infinitive: "lezen", tense: "past" };
    const intent: GrammarIntent = { grammarType: "terwijl-toen", subject: tSubject, verb, clause: { type: "subordinate", inversionRequired: false, conjunction: "terwijl" } };
    const scenario = pick(whileScenarios);
    return {
      english: scenario.english,
      dutch: scenario.dutch,
      hint: "Gebruik terwijl voor gelijktijdige acties.",
      grammarNote: "Terwijl links parallel actions in the past.",
      grammar: buildMetadata(intent),
    };
  }

  // ── NUMBERS ──────────────────────────────────────────────────────────────────
  if (category === "numbers") {
    const nSubject = pickSubject(["person", "group"]);
    const numberChoice = pick(numberWords);
    const variant = pick(["money", "objects", "age"] as const);
    const verb: GrammarVerb = { infinitive: variant === "age" ? "zijn" : "hebben", tense: "present" };
    const intent: GrammarIntent = { grammarType: "numbers", subject: nSubject, verb, clause: { type: "main", inversionRequired: false } };
    const dv = conjugatePresent(verb.infinitive, nSubject);

    if (variant === "age") {
      return {
        english: `${nSubject.english} ${englishBe(nSubject)} ${numberChoice.english} years old.`,
        dutch: `${nSubject.pronoun} ${dv} ${numberChoice.dutch} jaar oud.`,
        hint: "Dutch age uses zijn + number + jaar oud.",
        grammarNote: "For age, Dutch uses zijn, not hebben.",
        grammar: buildMetadata(intent),
      };
    }
    if (variant === "objects") {
      const counted = pick(numberNouns);
      return {
        english: `${nSubject.english} ${englishHave(nSubject)} ${numberChoice.english} ${counted.english}.`,
        dutch: `${nSubject.pronoun} ${dv} ${numberChoice.dutch} ${counted.dutch}.`,
        hint: "Practice number words with plural nouns.",
        grammarNote: "Dutch number compounds place unit before ten.",
        grammar: buildMetadata(intent),
      };
    }
    return {
      english: `${nSubject.english} ${englishHave(nSubject)} ${numberChoice.english} euros.`,
      dutch: `${nSubject.pronoun} ${dv} ${numberChoice.dutch} euro.`,
      hint: "Dutch number compounds place unit before ten.",
      grammarNote: "Example: vijf-en-veertig (45).",
      grammar: buildMetadata(intent),
    };
  }

  // ── DEMONSTRATIVES ────────────────────────────────────────────────────────────
  if (category === "demonstratives") {
    const noun = pick(demonstrativeNouns);
    const nounMeta = findNounCollocation(noun.word);
    let adj = pick(demonstrativeAdjectives);
    if (nounMeta) {
      const compatible = demonstrativeAdjectives.filter((a) => nounMeta.compatibleAdjectives.includes(a.dutch));
      if (compatible.length) adj = pick(compatible);
    }
    const useThis = Math.random() > 0.5;
    const dutchDemo = useThis ? noun.thisForm : noun.thatForm;
    const englishDemo = useThis ? "This" : "That";
    const verb: GrammarVerb = { infinitive: "zijn", tense: "present" };
    const intent: GrammarIntent = { grammarType: "demonstratives", subject, verb, object: noun, clause: { type: "main", inversionRequired: false } };
    return postProcess({
      english: `${englishDemo} ${noun.english} is ${adj.english}.`,
      dutch: `${dutchDemo} is ${adj.dutch}.`,
      hint: "Use dit/dat with het words and deze/die with de words.",
      grammarNote: "Demonstratives agree with the noun's article.",
      grammar: buildMetadata(intent),
    }, intent);
  }

  // ── TRANSPORT-LOCATION ───────────────────────────────────────────────────────
  if (category === "transport-location") {
    const trSubject = pickSubject(["person", "group"]);
    const variant = pick(["trip", "cycle", "walk", "arrive", "drive"] as const);
    const metaLoc = pick(locations);

    if (variant === "trip") {
      const transport = pick(transportOptions);
      const destination = pick(travelDestinations);
      const pattern = pick(["go", "travel"] as const);
      const verbInf = pattern === "go" ? "gaan" : "reizen";
      const verb: GrammarVerb = { infinitive: verbInf, tense: "present" };
      const intent: GrammarIntent = { grammarType: "transport-location", subject: trSubject, verb, location: metaLoc, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent(verbInf, trSubject);
      const english = pattern === "go"
        ? `${trSubject.english} ${englishPresent(trSubject, "go")} ${transport.english} ${destination.english}.`
        : `${trSubject.english} ${englishPresent(trSubject, "travel")} ${transport.english} ${destination.english}.`;
      const dutch = `${trSubject.pronoun} ${dv} ${transport.dutch} ${destination.dutch}.`;
      return postProcess({ english, dutch, hint: "Use met + vehicle for means of transport.", grammarNote: "Dutch: gaan/reizen + met de … + naar …", grammar: buildMetadata(intent) }, intent);
    }

    if (variant === "cycle") {
      const destination = pick(travelDestinations);
      const verb: GrammarVerb = { infinitive: "fietsen", tense: "present" };
      const intent: GrammarIntent = { grammarType: "transport-location", subject: trSubject, verb, location: metaLoc, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent("fietsen", trSubject);
      return postProcess({
        english: `${trSubject.english} ${englishPresent(trSubject, "cycle")} ${destination.english}.`,
        dutch: `${trSubject.pronoun} ${dv} ${destination.dutch}.`,
        hint: "Fietsen + naar + place.",
        grammarNote: "No met is needed when the verb itself is fietsen.",
        grammar: buildMetadata(intent),
      }, intent);
    }

    if (variant === "walk") {
      const destination = pick(travelDestinations);
      const verb: GrammarVerb = { infinitive: "lopen", tense: "present" };
      const intent: GrammarIntent = { grammarType: "transport-location", subject: trSubject, verb, location: metaLoc, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent("lopen", trSubject);
      return postProcess({
        english: `${trSubject.english} ${englishPresent(trSubject, "walk")} ${destination.english}.`,
        dutch: `${trSubject.pronoun} ${dv} ${destination.dutch}.`,
        hint: "Lopen + naar …",
        grammarNote: "Loop naar … covers walking to a destination.",
        grammar: buildMetadata(intent),
      }, intent);
    }

    if (variant === "arrive") {
      const transport = pick(transportOptions);
      const spot = pick(travelArrivalSpots);
      const verb: GrammarVerb = { infinitive: "komen", tense: "present" };
      const intent: GrammarIntent = { grammarType: "transport-location", subject: trSubject, verb, location: metaLoc, clause: { type: "main", inversionRequired: false } };
      const dv = conjugatePresent("komen", trSubject, true);
      return postProcess({
        english: `${trSubject.english} ${englishPresent(trSubject, "arrive")} ${transport.english} ${spot.english}.`,
        dutch: `${trSubject.pronoun} ${dv} ${transport.dutch} ${spot.dutch} aan.`,
        accepted: uniqueStrings([
          `${trSubject.pronoun} ${dv} ${transport.dutch} ${spot.dutch} aan.`,
          `${trSubject.pronoun} ${dv} aan ${transport.dutch} ${spot.dutch}.`,
        ]),
        hint: "Aankomen splits as kom … aan.",
        grammarNote: "The particle aan often comes after the place phrase in main clauses.",
        grammar: buildMetadata(intent),
      }, intent);
    }

    // drive
    const destination = pick(travelDestinations);
    const verb: GrammarVerb = { infinitive: "rijden", tense: "present" };
    const intent: GrammarIntent = { grammarType: "transport-location", subject: trSubject, verb, location: metaLoc, clause: { type: "main", inversionRequired: false } };
    const dv = conjugatePresent("rijden", trSubject);
    return postProcess({
      english: `${trSubject.english} ${englishPresent(trSubject, "drive")} ${destination.english}.`,
      dutch: `${trSubject.pronoun} ${dv} met de auto ${destination.dutch}.`,
      hint: "Rijden met de auto + naar …",
      grammarNote: "Rijden pairs with met de auto for going by car as driver.",
      grammar: buildMetadata(intent),
    }, intent);
  }

  return null;
}

export function generateStructuredSentence(category: PracticeCategory): GeneratedSentence | null {
  for (let i = 0; i < 8; i++) {
    const candidate = generateStructuredSentenceInternal(category);
    if (candidate) return candidate;
  }
  return null;
}