import { Direction, NounEntry, PracticeCategory, PracticeItem, VerbEntry } from "@/lib/types";
import { GrammarIntent } from "../grammar/metadata/types";
import {
  becauseReasons,
  datClauseContents,
  datMainVerbs,
  frontedComplements,
  modalActions,
  perfectTimePhrases,
  questionTimes,
  questionTimesDutch,
  toenEvents,
  travelArrivalSpots,
  travelDestinations,
  whileScenarios,
  generateStructuredSentence,
  transportOptions
} from "../sentence-generation/generator";
import { findVerbCollocation } from "./collocations";

type SubjectRole = "first-singular" | "second-singular" | "third-singular" | "first-plural" | "third-plural";

type Subject = {
  en: string;
  nl: string;
  role: SubjectRole;
};

const subjects: Subject[] = [
  { en: "I", nl: "ik", role: "first-singular" },
  { en: "you (informal)", nl: "jij", role: "second-singular" },
  { en: "you (informal)", nl: "je", role: "second-singular" },
  { en: "you (formal)", nl: "u", role: "second-singular" },
  { en: "it", nl: "het", role: "third-singular" },
  { en: "you all", nl: "jullie", role: "third-plural" },
  { en: "he", nl: "hij", role: "third-singular" },
  { en: "she", nl: "zij", role: "third-singular" },
  { en: "we", nl: "we", role: "first-plural" },
  { en: "we", nl: "wij", role: "first-plural" },
  { en: "they", nl: "ze", role: "third-plural" },
  { en: "they", nl: "zij", role: "third-plural" }
];

const adjectives = [
  { en: "busy", nl: "druk" },
  { en: "happy", nl: "blij" },
  { en: "tired", nl: "moe" },
  { en: "ready", nl: "klaar" }
];

const places = [
  { en: "at home", nl: "thuis" },
  { en: "at school", nl: "op school" },
  { en: "in the city", nl: "in de stad" }
];

const adverbs = [
  { en: "today", nl: "vandaag" },
  { en: "tomorrow", nl: "morgen" },
  { en: "usually", nl: "meestal" }
];

const objects = [
  { en: "a bike", nl: "een fiets" },
  { en: "a book", nl: "een boek" },
  { en: "coffee", nl: "koffie" }
];

const modalVerbs = [
  { en: "can", nlInf: "kunnen" },
  { en: "must", nlInf: "moeten" },
  { en: "have to", nlInf: "moeten" },
  { en: "want to", nlInf: "willen" },
  { en: "may", nlInf: "mogen" },
  { en: "are allowed to", nlInf: "mogen" },
  { en: "will", nlInf: "zullen" },
  { en: "dare to", nlInf: "durven" }
] as const;

type ModalInfinitive = (typeof modalVerbs)[number]["nlInf"];

type VerbShape = {
  en: string;
  nlInf: string;
  nlSingular: string;
  nlIk: string;
  nlPlural: string;
};

const baseVerbs = [
  { en: "work", nlInf: "werken", nlSingular: "werkt", nlIk: "werk", nlPlural: "werken" },
  { en: "learn", nlInf: "leren", nlSingular: "leert", nlIk: "leer", nlPlural: "leren" },
  { en: "read", nlInf: "lezen", nlSingular: "leest", nlIk: "lees", nlPlural: "lezen" },
  { en: "travel", nlInf: "reizen", nlSingular: "reist", nlIk: "reis", nlPlural: "reizen" },
  { en: "be", nlInf: "zijn", nlSingular: "is", nlIk: "ben", nlPlural: "zijn" },
  { en: "have", nlInf: "hebben", nlSingular: "heeft", nlIk: "heb", nlPlural: "hebben" },
  { en: "go", nlInf: "gaan", nlSingular: "gaat", nlIk: "ga", nlPlural: "gaan" },
  { en: "come", nlInf: "komen", nlSingular: "komt", nlIk: "kom", nlPlural: "komen" },
  { en: "want", nlInf: "willen", nlSingular: "wil", nlIk: "wil", nlPlural: "willen" },
  { en: "must", nlInf: "moeten", nlSingular: "moet", nlIk: "moet", nlPlural: "moeten" },
  { en: "can", nlInf: "kunnen", nlSingular: "kan", nlIk: "kan", nlPlural: "kunnen" },
  { en: "may", nlInf: "mogen", nlSingular: "mag", nlIk: "mag", nlPlural: "mogen" },
  { en: "know", nlInf: "weten", nlSingular: "weet", nlIk: "weet", nlPlural: "weten" },
  { en: "think", nlInf: "denken", nlSingular: "denkt", nlIk: "denk", nlPlural: "denken" },
  { en: "stay", nlInf: "blijven", nlSingular: "blijft", nlIk: "blijf", nlPlural: "blijven" },
  { en: "find", nlInf: "vinden", nlSingular: "vindt", nlIk: "vind", nlPlural: "vinden" },
  { en: "make", nlInf: "maken", nlSingular: "maakt", nlIk: "maak", nlPlural: "maken" },
  { en: "give", nlInf: "geven", nlSingular: "geeft", nlIk: "geef", nlPlural: "geven" },
  { en: "take", nlInf: "nemen", nlSingular: "neemt", nlIk: "neem", nlPlural: "nemen" },
  { en: "speak", nlInf: "spreken", nlSingular: "spreekt", nlIk: "spreek", nlPlural: "spreken" }
 ] as const satisfies readonly VerbShape[];

type BaseVerb = (typeof baseVerbs)[number];

const participles = [
  { en: "worked", nl: "gewerkt" },
  { en: "learned", nl: "geleerd" },
  { en: "read", nl: "gelezen" },
  { en: "traveled", nl: "gereisd" },
  { en: "been", nl: "geweest" },
  { en: "had", nl: "gehad" },
  { en: "been able to", nl: "gekund" },
  { en: "had to", nl: "gemoeten" },
  { en: "wanted", nl: "gewild" },
  { en: "been allowed to", nl: "gemogen" },
  { en: "known", nl: "geweten" },
  { en: "thought", nl: "gedacht" },
  { en: "stayed", nl: "gebleven" },
  { en: "spoken", nl: "gesproken" }
];

const numbers = [
  { en: "twenty-two", nl: "tweeentwintig" },
  { en: "thirty", nl: "dertig" },
  { en: "forty-five", nl: "vijfenveertig" }
];

const transport = [
  { en: "by train", nl: "met de trein" },
  { en: "by bike", nl: "met de fiets" },
  { en: "by bus", nl: "met de bus" }
];

export const nounReference: NounEntry[] = [
  { dutch: "koffie", english: "coffee", article: "de", gender: "common", plural: "", thisForm: "deze koffie", thatForm: "die koffie" },
  { dutch: "thee", english: "tea", article: "de", gender: "common", plural: "", thisForm: "deze thee", thatForm: "die thee" },
  { dutch: "melk", english: "milk", article: "de", gender: "common", plural: "", thisForm: "deze melk", thatForm: "die melk" },
  { dutch: "water", english: "water", article: "het", gender: "neuter", plural: "", thisForm: "dit water", thatForm: "dat water" },
  { dutch: "wijn", english: "wine", article: "de", gender: "common", plural: "", thisForm: "deze wijn", thatForm: "die wijn" },
  { dutch: "bier", english: "beer", article: "het", gender: "neuter", plural: "", thisForm: "dit bier", thatForm: "dat bier" },
  { dutch: "brood", english: "bread", article: "het", gender: "neuter", plural: "", thisForm: "dit brood", thatForm: "dat brood" },
  { dutch: "kaas", english: "cheese", article: "de", gender: "common", plural: "", thisForm: "deze kaas", thatForm: "die kaas" },
  { dutch: "vlees", english: "meat", article: "het", gender: "neuter", plural: "", thisForm: "dit vlees", thatForm: "dat vlees" },
  { dutch: "fruit", english: "fruit", article: "het", gender: "neuter", plural: "", thisForm: "dit fruit", thatForm: "dat fruit" },
  { dutch: "stad", english: "city", article: "de", gender: "common", plural: "steden", thisForm: "deze stad", thatForm: "die stad" },
  { dutch: "man", english: "man", article: "de", gender: "common", plural: "mannen", thisForm: "deze man", thatForm: "die man" },
  { dutch: "vrouw", english: "woman", article: "de", gender: "common", plural: "vrouwen", thisForm: "deze vrouw", thatForm: "die vrouw" },
  { dutch: "kind", english: "child", article: "het", gender: "neuter", plural: "kinderen", thisForm: "dit kind", thatForm: "dat kind" },
  { dutch: "tafel", english: "table", article: "de", gender: "common", plural: "tafels", thisForm: "deze tafel", thatForm: "die tafel" },
  { dutch: "stoel", english: "chair", article: "de", gender: "common", plural: "stoelen", thisForm: "deze stoel", thatForm: "die stoel" },
  { dutch: "deur", english: "door", article: "de", gender: "common", plural: "deuren", thisForm: "deze deur", thatForm: "die deur" },
  { dutch: "fiets", english: "bike", article: "de", gender: "common", plural: "fietsen", thisForm: "deze fiets", thatForm: "die fiets" },
  { dutch: "auto", english: "car", article: "de", gender: "common", plural: "auto's", thisForm: "deze auto", thatForm: "die auto" },
  { dutch: "trein", english: "train", article: "de", gender: "common", plural: "treinen", thisForm: "deze trein", thatForm: "die trein" },
  { dutch: "bus", english: "bus", article: "de", gender: "common", plural: "bussen", thisForm: "deze bus", thatForm: "die bus" },
  { dutch: "kat", english: "cat", article: "de", gender: "common", plural: "katten", thisForm: "deze kat", thatForm: "die kat" },
  { dutch: "hond", english: "dog", article: "de", gender: "common", plural: "honden", thisForm: "deze hond", thatForm: "die hond" },
  { dutch: "boom", english: "tree", article: "de", gender: "common", plural: "bomen", thisForm: "deze boom", thatForm: "die boom" },
  { dutch: "school", english: "school", article: "de", gender: "common", plural: "scholen", thisForm: "deze school", thatForm: "die school" },
  { dutch: "dag", english: "day", article: "de", gender: "common", plural: "dagen", thisForm: "deze dag", thatForm: "die dag" },
  { dutch: "nacht", english: "night", article: "de", gender: "common", plural: "nachten", thisForm: "deze nacht", thatForm: "die nacht" },
  { dutch: "werk", english: "work", article: "het", gender: "neuter", plural: "werken", thisForm: "dit werk", thatForm: "dat werk" },
  { dutch: "huis", english: "house", article: "het", gender: "neuter", plural: "huizen", thisForm: "dit huis", thatForm: "dat huis" },
  { dutch: "boek", english: "book", article: "het", gender: "neuter", plural: "boeken", thisForm: "dit boek", thatForm: "dat boek" },
  { dutch: "raam", english: "window", article: "het", gender: "neuter", plural: "ramen", thisForm: "dit raam", thatForm: "dat raam" },
  { dutch: "bed", english: "bed", article: "het", gender: "neuter", plural: "bedden", thisForm: "dit bed", thatForm: "dat bed" },
  { dutch: "jaar", english: "year", article: "het", gender: "neuter", plural: "jaren", thisForm: "dit jaar", thatForm: "dat jaar" },
  { dutch: "uur", english: "hour", article: "het", gender: "neuter", plural: "uren", thisForm: "dit uur", thatForm: "dat uur" },
  { dutch: "moment", english: "moment", article: "het", gender: "neuter", plural: "momenten", thisForm: "dit moment", thatForm: "dat moment" },
  { dutch: "spel", english: "game", article: "het", gender: "neuter", plural: "spelen", thisForm: "dit spel", thatForm: "dat spel" },
  { dutch: "leraar", english: "teacher", article: "de", gender: "common", plural: "leraren", thisForm: "deze leraar", thatForm: "die leraar" },
  { dutch: "voetballer", english: "football player", article: "de", gender: "common", plural: "voetballers", thisForm: "deze voetballer", thatForm: "die voetballer" },
  { dutch: "premier", english: "prime minister", article: "de", gender: "common", plural: "premiers", thisForm: "deze premier", thatForm: "die premier" },
  { dutch: "student", english: "student", article: "de", gender: "common", plural: "studenten", thisForm: "deze student", thatForm: "die student" },
  { dutch: "leerling", english: "scholar", article: "de", gender: "common", plural: "leerlingen", thisForm: "deze leerling", thatForm: "die leerling" },
  { dutch: "baas", english: "boss", article: "de", gender: "common", plural: "bazen", thisForm: "deze baas", thatForm: "die baas" },
  { dutch: "bakker", english: "baker", article: "de", gender: "common", plural: "bakkers", thisForm: "deze bakker", thatForm: "die bakker" },
  { dutch: "slager", english: "butcher", article: "de", gender: "common", plural: "slagers", thisForm: "deze slager", thatForm: "die slager" },
  { dutch: "boer", english: "farmer", article: "de", gender: "common", plural: "boeren", thisForm: "deze boer", thatForm: "die boer" },
  { dutch: "visser", english: "fisherman", article: "de", gender: "common", plural: "vissers", thisForm: "deze visser", thatForm: "die visser" },
  { dutch: "advocaat", english: "lawyer", article: "de", gender: "common", plural: "advocaten", thisForm: "deze advocaat", thatForm: "die advocaat" },
  { dutch: "dokter", english: "doctor", article: "de", gender: "common", plural: "dokters", thisForm: "deze dokter", thatForm: "die dokter" },
  { dutch: "ober", english: "waiter", article: "de", gender: "common", plural: "obers", thisForm: "deze ober", thatForm: "die ober" },
  { dutch: "politieman", english: "police officer", article: "de", gender: "common", plural: "politiemannen", thisForm: "deze politieman", thatForm: "die politieman" },
  { dutch: "agent", english: "police officer", article: "de", gender: "common", plural: "agenten", thisForm: "deze agent", thatForm: "die agent" },
  { dutch: "kapper", english: "hairdresser", article: "de", gender: "common", plural: "kappers", thisForm: "deze kapper", thatForm: "die kapper" },
  { dutch: "directeur", english: "director", article: "de", gender: "common", plural: "directeuren", thisForm: "deze directeur", thatForm: "die directeur" },
  { dutch: "boekhouder", english: "accountant", article: "de", gender: "common", plural: "boekhouders", thisForm: "deze boekhouder", thatForm: "die boekhouder" },
  { dutch: "verkoper", english: "salesman", article: "de", gender: "common", plural: "verkopers", thisForm: "deze verkoper", thatForm: "die verkoper" },
  { dutch: "vertegenwoordiger", english: "representative", article: "de", gender: "common", plural: "vertegenwoordigers", thisForm: "deze vertegenwoordiger", thatForm: "die vertegenwoordiger" },
  { dutch: "jongen", english: "boy", article: "de", gender: "common", plural: "jongens", thisForm: "deze jongen", thatForm: "die jongen" },
  { dutch: "meisje", english: "girl", article: "het", gender: "neuter", plural: "meisjes", thisForm: "dit meisje", thatForm: "dat meisje" },
  { dutch: "bloem", english: "flower", article: "de", gender: "common", plural: "bloemen", thisForm: "deze bloem", thatForm: "die bloem" },
  { dutch: "groente", english: "vegetables", article: "de", gender: "common", plural: "groentes", thisForm: "deze groente", thatForm: "die groente" },
  { dutch: "boterham", english: "slice of bread", article: "de", gender: "common", plural: "boterhammen", thisForm: "deze boterham", thatForm: "die boterham" },
  { dutch: "hagelslag", english: "chocolate sprinkles", article: "de", gender: "common", plural: "", thisForm: "deze hagelslag", thatForm: "die hagelslag" },
  { dutch: "pindakaas", english: "peanut butter", article: "de", gender: "common", plural: "", thisForm: "deze pindakaas", thatForm: "die pindakaas" },
  { dutch: "aardappel", english: "potato", article: "de", gender: "common", plural: "aardappelen", thisForm: "deze aardappel", thatForm: "die aardappel" },
  { dutch: "aardappeleter", english: "potato-eater", article: "de", gender: "common", plural: "aardappeleters", thisForm: "deze aardappeleter", thatForm: "die aardappeleter" },
  { dutch: "kip", english: "chicken", article: "de", gender: "common", plural: "kippen", thisForm: "deze kip", thatForm: "die kip" },
  { dutch: "friet", english: "french fries", article: "de", gender: "common", plural: "", thisForm: "deze friet", thatForm: "die friet" },
  { dutch: "frikandel", english: "dutch meat sausage", article: "de", gender: "common", plural: "frikandellen", thisForm: "deze frikandel", thatForm: "die frikandel" },
  { dutch: "kroket", english: "dutch fried ragout bar", article: "de", gender: "common", plural: "kroketten", thisForm: "deze kroket", thatForm: "die kroket" },
  { dutch: "pannenkoek", english: "pancake", article: "de", gender: "common", plural: "pannenkoeken", thisForm: "deze pannenkoek", thatForm: "die pannenkoek" },
  { dutch: "stroopwafel", english: "syrup waffle", article: "de", gender: "common", plural: "stroopwafels", thisForm: "deze stroopwafel", thatForm: "die stroopwafel" },
  { dutch: "drop", english: "liquorice", article: "de", gender: "common", plural: "", thisForm: "deze drop", thatForm: "die drop" },
  { dutch: "snoep", english: "sweets", article: "het", gender: "neuter", plural: "", thisForm: "dit snoep", thatForm: "dat snoep" },
  { dutch: "straat", english: "street", article: "de", gender: "common", plural: "straten", thisForm: "deze straat", thatForm: "die straat" },
  { dutch: "weg", english: "road", article: "de", gender: "common", plural: "wegen", thisForm: "deze weg", thatForm: "die weg" },
  { dutch: "snelweg", english: "highway", article: "de", gender: "common", plural: "snelwegen", thisForm: "deze snelweg", thatForm: "die snelweg" },
  { dutch: "tram", english: "tram", article: "de", gender: "common", plural: "trams", thisForm: "deze tram", thatForm: "die tram" },
  { dutch: "halte", english: "stopping place", article: "de", gender: "common", plural: "haltes", thisForm: "deze halte", thatForm: "die halte" },
  { dutch: "metro", english: "metro", article: "de", gender: "common", plural: "metro's", thisForm: "deze metro", thatForm: "die metro" },
  { dutch: "boot", english: "boat", article: "de", gender: "common", plural: "boten", thisForm: "deze boot", thatForm: "die boot" },
  { dutch: "vliegtuig", english: "airplane", article: "het", gender: "neuter", plural: "vliegtuigen", thisForm: "dit vliegtuig", thatForm: "dat vliegtuig" },
  { dutch: "vliegveld", english: "airport", article: "het", gender: "neuter", plural: "vliegvelden", thisForm: "dit vliegveld", thatForm: "dat vliegveld" },
  { dutch: "haven", english: "port", article: "de", gender: "common", plural: "havens", thisForm: "deze haven", thatForm: "die haven" },
  { dutch: "station", english: "railway station", article: "het", gender: "neuter", plural: "stations", thisForm: "dit station", thatForm: "dat station" },
  { dutch: "kantoor", english: "office", article: "het", gender: "neuter", plural: "kantoren", thisForm: "dit kantoor", thatForm: "dat kantoor" },
  { dutch: "winkel", english: "shop", article: "de", gender: "common", plural: "winkels", thisForm: "deze winkel", thatForm: "die winkel" },
  { dutch: "supermarkt", english: "supermarket", article: "de", gender: "common", plural: "supermarkten", thisForm: "deze supermarkt", thatForm: "die supermarkt" },
  { dutch: "ziekenhuis", english: "hospital", article: "het", gender: "neuter", plural: "ziekenhuizen", thisForm: "dit ziekenhuis", thatForm: "dat ziekenhuis" },
  { dutch: "apotheek", english: "pharmacy", article: "de", gender: "common", plural: "apotheken", thisForm: "deze apotheek", thatForm: "die apotheek" },
  { dutch: "zwembad", english: "swimming pool", article: "het", gender: "neuter", plural: "zwembaden", thisForm: "dit zwembad", thatForm: "dat zwembad" },
  { dutch: "sporthal", english: "sports hall", article: "de", gender: "common", plural: "sporthallen", thisForm: "deze sporthal", thatForm: "die sporthal" },
  { dutch: "politiebureau", english: "police station", article: "het", gender: "neuter", plural: "politiebureaus", thisForm: "dit politiebureau", thatForm: "dat politiebureau" },
  { dutch: "bibliotheek", english: "library", article: "de", gender: "common", plural: "bibliotheken", thisForm: "deze bibliotheek", thatForm: "die bibliotheek" },
  { dutch: "universiteit", english: "university", article: "de", gender: "common", plural: "universiteiten", thisForm: "deze universiteit", thatForm: "die universiteit" },
  { dutch: "film", english: "film / movie", article: "de", gender: "common", plural: "films", thisForm: "deze film", thatForm: "die film" },
  { dutch: "soep", english: "soup", article: "de", gender: "common", plural: "soepen", thisForm: "deze soep", thatForm: "die soep" },
  { dutch: "sleutel", english: "key", article: "de", gender: "common", plural: "sleutels", thisForm: "deze sleutel", thatForm: "die sleutel" },
  { dutch: "cadeau", english: "gift", article: "het", gender: "neuter", plural: "cadeaus", thisForm: "dit cadeau", thatForm: "dat cadeau" },
  { dutch: "les", english: "lesson", article: "de", gender: "common", plural: "lessen", thisForm: "deze les", thatForm: "die les" },
  { dutch: "centrum", english: "centre / downtown", article: "het", gender: "neuter", plural: "centra", thisForm: "dit centrum", thatForm: "dat centrum" },
  { dutch: "museum", english: "museum", article: "het", gender: "neuter", plural: "musea", thisForm: "dit museum", thatForm: "dat museum" },
  { dutch: "strand", english: "beach", article: "het", gender: "neuter", plural: "stranden", thisForm: "dit strand", thatForm: "dat strand" },
  { dutch: "park", english: "park", article: "het", gender: "neuter", plural: "parken", thisForm: "dit park", thatForm: "dat park" },
  { dutch: "tuin", english: "garden", article: "de", gender: "common", plural: "tuinen", thisForm: "deze tuin", thatForm: "die tuin" },
  { dutch: "bioscoop", english: "cinema", article: "de", gender: "common", plural: "bioscopen", thisForm: "deze bioscoop", thatForm: "die bioscoop" },
  { dutch: "buur", english: "neighbour", article: "de", gender: "common", plural: "buren", thisForm: "deze buur", thatForm: "die buur" },
  { dutch: "zus", english: "sister", article: "de", gender: "common", plural: "zussen", thisForm: "deze zus", thatForm: "die zus" },
  { dutch: "vriend", english: "friend", article: "de", gender: "common", plural: "vrienden", thisForm: "deze vriend", thatForm: "die vriend" },
  { dutch: "piano", english: "piano", article: "de", gender: "common", plural: "piano's", thisForm: "deze piano", thatForm: "die piano" },
  { dutch: "taart", english: "cake", article: "de", gender: "common", plural: "taarten", thisForm: "deze taart", thatForm: "die taart" },
  { dutch: "winter", english: "winter", article: "de", gender: "common", plural: "winters", thisForm: "deze winter", thatForm: "die winter" },
  { dutch: "huiswerk", english: "homework", article: "het", gender: "neuter", plural: "", thisForm: "dit huiswerk", thatForm: "dat huiswerk" },
  { dutch: "koor", english: "choir", article: "het", gender: "neuter", plural: "koren", thisForm: "dit koor", thatForm: "dat koor" },
  { dutch: "moeder", english: "mother", article: "de", gender: "common", plural: "moeders", thisForm: "deze moeder", thatForm: "die moeder" },
  { dutch: "vader", english: "father", article: "de", gender: "common", plural: "vaders", thisForm: "deze vader", thatForm: "die vader" },
  { dutch: "ouder", english: "parent", article: "de", gender: "common", plural: "ouders", thisForm: "deze ouder", thatForm: "die ouder" },
  { dutch: "broer", english: "brother", article: "de", gender: "common", plural: "broers", thisForm: "deze broer", thatForm: "die broer" },
  { dutch: "baby", english: "baby", article: "de", gender: "common", plural: "baby's", thisForm: "deze baby", thatForm: "die baby" },
  { dutch: "e-mail", english: "email", article: "de", gender: "common", plural: "e-mails", thisForm: "deze e-mail", thatForm: "die e-mail" },
  { dutch: "rekening", english: "bill / account", article: "de", gender: "common", plural: "rekeningen", thisForm: "deze rekening", thatForm: "die rekening" },
  { dutch: "staking", english: "strike", article: "de", gender: "common", plural: "stakingen", thisForm: "deze staking", thatForm: "die staking" },
  { dutch: "vertraging", english: "delay", article: "de", gender: "common", plural: "vertragingen", thisForm: "deze vertraging", thatForm: "die vertraging" },
  { dutch: "vlucht", english: "flight", article: "de", gender: "common", plural: "vluchten", thisForm: "deze vlucht", thatForm: "die vlucht" },
  { dutch: "portemonnee", english: "wallet", article: "de", gender: "common", plural: "portemonnees", thisForm: "deze portemonnee", thatForm: "die portemonnee" },
  { dutch: "afspraak", english: "appointment", article: "de", gender: "common", plural: "afspraken", thisForm: "deze afspraak", thatForm: "die afspraak" },
  { dutch: "vergadering", english: "meeting", article: "de", gender: "common", plural: "vergaderingen", thisForm: "deze vergadering", thatForm: "die vergadering" },
  { dutch: "koelkast", english: "fridge", article: "de", gender: "common", plural: "koelkasten", thisForm: "deze koelkast", thatForm: "die koelkast" },
  { dutch: "prijs", english: "price", article: "de", gender: "common", plural: "prijzen", thisForm: "deze prijs", thatForm: "die prijs" },
  { dutch: "jas", english: "coat", article: "de", gender: "common", plural: "jassen", thisForm: "deze jas", thatForm: "die jas" },
  { dutch: "schoen", english: "shoe", article: "de", gender: "common", plural: "schoenen", thisForm: "deze schoen", thatForm: "die schoen" },
  { dutch: "mes", english: "knife", article: "het", gender: "neuter", plural: "messen", thisForm: "dit mes", thatForm: "dat mes" },
  { dutch: "lamp", english: "lamp", article: "de", gender: "common", plural: "lampen", thisForm: "deze lamp", thatForm: "die lamp" },
  { dutch: "professor", english: "professor", article: "de", gender: "common", plural: "professoren", thisForm: "deze professor", thatForm: "die professor" },
  // ── NEW: academic / ICT vocabulary for Fontys context ─────────────────────
  { dutch: "opdracht", english: "assignment", article: "de", gender: "common", plural: "opdrachten", thisForm: "deze opdracht", thatForm: "die opdracht" },
  { dutch: "tentamen", english: "exam", article: "het", gender: "neuter", plural: "tentamens", thisForm: "dit tentamen", thatForm: "dat tentamen" },
  { dutch: "cijfer", english: "grade / mark", article: "het", gender: "neuter", plural: "cijfers", thisForm: "dit cijfer", thatForm: "dat cijfer" },
  { dutch: "vak", english: "subject / course", article: "het", gender: "neuter", plural: "vakken", thisForm: "dit vak", thatForm: "dat vak" },
  { dutch: "docent", english: "lecturer", article: "de", gender: "common", plural: "docenten", thisForm: "deze docent", thatForm: "die docent" },
  { dutch: "medestudent", english: "fellow student", article: "de", gender: "common", plural: "medestudenten", thisForm: "deze medestudent", thatForm: "die medestudent" },
  { dutch: "laptop", english: "laptop", article: "de", gender: "common", plural: "laptops", thisForm: "deze laptop", thatForm: "die laptop" },
  { dutch: "software", english: "software", article: "de", gender: "common", plural: "", thisForm: "deze software", thatForm: "die software" },
  { dutch: "programma", english: "program", article: "het", gender: "neuter", plural: "programma's", thisForm: "dit programma", thatForm: "dat programma" },
  { dutch: "code", english: "code", article: "de", gender: "common", plural: "", thisForm: "deze code", thatForm: "die code" },
  { dutch: "project", english: "project", article: "het", gender: "neuter", plural: "projecten", thisForm: "dit project", thatForm: "dat project" },
  { dutch: "stageplek", english: "internship position", article: "de", gender: "common", plural: "stageplekken", thisForm: "deze stageplek", thatForm: "die stageplek" },
  { dutch: "kamer", english: "room", article: "de", gender: "common", plural: "kamers", thisForm: "deze kamer", thatForm: "die kamer" },
  { dutch: "huurcontract", english: "rental contract", article: "het", gender: "neuter", plural: "huurcontracten", thisForm: "dit huurcontract", thatForm: "dat huurcontract" },
  { dutch: "supermarkt", english: "supermarket", article: "de", gender: "common", plural: "supermarkten", thisForm: "deze supermarkt", thatForm: "die supermarkt" },
];

export const verbReference: VerbEntry[] = [
  {
    infinitive: "zijn",
    english: "to be",
    imperative: "wees",
    auxiliary: "zijn",
    present: { ik: "ben", jij: "bent", hij: "is", wij: "zijn", jullie: "zijn", zij: "zijn" },
    past: { singular: "was", plural: "waren" },
    pastParticiple: "geweest",
    perfect: "is geweest"
  },
  {
    infinitive: "hebben",
    english: "to have",
    imperative: "heb",
    auxiliary: "hebben",
    present: { ik: "heb", jij: "hebt", hij: "heeft", wij: "hebben", jullie: "hebben", zij: "hebben" },
    past: { singular: "had", plural: "hadden" },
    pastParticiple: "gehad",
    perfect: "heeft gehad"
  },
  {
    infinitive: "kunnen",
    english: "can / to be able",
    imperative: "kan",
    auxiliary: "hebben",
    present: { ik: "kan", jij: "kunt", hij: "kan", wij: "kunnen", jullie: "kunnen", zij: "kunnen" },
    past: { singular: "kon", plural: "konden" },
    pastParticiple: "gekund",
    perfect: "heeft gekund"
  },
  {
    infinitive: "moeten",
    english: "must / have to",
    imperative: "moet",
    auxiliary: "hebben",
    present: { ik: "moet", jij: "moet", hij: "moet", wij: "moeten", jullie: "moeten", zij: "moeten" },
    past: { singular: "moest", plural: "moesten" },
    pastParticiple: "gemoeten",
    perfect: "heeft gemoeten"
  },
  {
    infinitive: "willen",
    english: "want to",
    imperative: "wil",
    auxiliary: "hebben",
    present: { ik: "wil", jij: "wilt", hij: "wil", wij: "willen", jullie: "willen", zij: "willen" },
    past: { singular: "wilde", plural: "wilden" },
    pastParticiple: "gewild",
    perfect: "heeft gewild"
  },
  {
    infinitive: "werken",
    english: "to work",
    imperative: "werk",
    auxiliary: "hebben",
    present: { ik: "werk", jij: "werkt", hij: "werkt", wij: "werken", jullie: "werken", zij: "werken" },
    past: { singular: "werkte", plural: "werkten" },
    pastParticiple: "gewerkt",
    perfect: "heeft gewerkt"
  },
  {
    infinitive: "lezen",
    english: "to read",
    imperative: "lees",
    auxiliary: "hebben",
    present: { ik: "lees", jij: "leest", hij: "leest", wij: "lezen", jullie: "lezen", zij: "lezen" },
    past: { singular: "las", plural: "lazen" },
    pastParticiple: "gelezen",
    perfect: "heeft gelezen"
  },
  {
    infinitive: "eten",
    english: "to eat",
    imperative: "eet",
    auxiliary: "hebben",
    present: { ik: "eet", jij: "eet", hij: "eet", wij: "eten", jullie: "eten", zij: "eten" },
    past: { singular: "at", plural: "aten" },
    pastParticiple: "gegeten",
    perfect: "heeft gegeten"
  },
  {
    infinitive: "drinken",
    english: "to drink",
    imperative: "drink",
    auxiliary: "hebben",
    present: { ik: "drink", jij: "drinkt", hij: "drinkt", wij: "drinken", jullie: "drinken", zij: "drinken" },
    past: { singular: "dronk", plural: "dronken" },
    pastParticiple: "gedronken",
    perfect: "heeft gedronken"
  },
  {
    infinitive: "gaan",
    english: "to go",
    imperative: "ga",
    auxiliary: "zijn",
    present: { ik: "ga", jij: "gaat", hij: "gaat", wij: "gaan", jullie: "gaan", zij: "gaan" },
    past: { singular: "ging", plural: "gingen" },
    pastParticiple: "gegaan",
    perfect: "is gegaan"
  },
  {
    infinitive: "komen",
    english: "to come",
    imperative: "kom",
    auxiliary: "zijn",
    present: { ik: "kom", jij: "komt", hij: "komt", wij: "komen", jullie: "komen", zij: "komen" },
    past: { singular: "kwam", plural: "kwamen" },
    pastParticiple: "gekomen",
    perfect: "is gekomen"
  },
  {
    infinitive: "spreken",
    english: "to speak",
    imperative: "spreek",
    auxiliary: "hebben",
    present: { ik: "spreek", jij: "spreekt", hij: "spreekt", wij: "spreken", jullie: "spreken", zij: "spreken" },
    past: { singular: "sprak", plural: "spraken" },
    pastParticiple: "gesproken",
    perfect: "heeft gesproken"
  },
  {
    infinitive: "schrijven",
    english: "to write",
    imperative: "schrijf",
    auxiliary: "hebben",
    present: { ik: "schrijf", jij: "schrijft", hij: "schrijft", wij: "schrijven", jullie: "schrijven", zij: "schrijven" },
    past: { singular: "schreef", plural: "schreven" },
    pastParticiple: "geschreven",
    perfect: "heeft geschreven"
  },
  {
    infinitive: "roken",
    english: "to smoke",
    imperative: "rook",
    auxiliary: "hebben",
    present: { ik: "rook", jij: "rookt", hij: "rookt", wij: "roken", jullie: "roken", zij: "roken" },
    past: { singular: "rookte", plural: "rookten" },
    pastParticiple: "gerookt",
    perfect: "heeft gerookt"
  },
  {
    infinitive: "mogen",
    english: "may / to be allowed to",
    imperative: "mag",
    auxiliary: "hebben",
    present: { ik: "mag", jij: "mag", hij: "mag", wij: "mogen", jullie: "mogen", zij: "mogen" },
    past: { singular: "mocht", plural: "mochten" },
    pastParticiple: "gemoogen",
    perfect: "heeft gemoogen (uncommon)"
  },
  {
    infinitive: "zullen",
    english: "will / shall (future)",
    imperative: "—",
    auxiliary: "hebben",
    present: { ik: "zal", jij: "zult", hij: "zal", wij: "zullen", jullie: "zullen", zij: "zullen" },
    past: { singular: "zou", plural: "zouden" },
    pastParticiple: "—",
    perfect: "—"
  },
  {
    infinitive: "hoeven",
    english: "to need to (often with negation)",
    imperative: "hoef",
    auxiliary: "hebben",
    present: { ik: "hoef", jij: "hoeft", hij: "hoeft", wij: "hoeven", jullie: "hoeven", zij: "hoeven" },
    past: { singular: "hoefde", plural: "hoefden" },
    pastParticiple: "gehoeven",
    perfect: "heeft gehoeven"
  },
  {
    infinitive: "durven",
    english: "to dare",
    imperative: "durf",
    auxiliary: "hebben",
    present: { ik: "durf", jij: "durft", hij: "durft", wij: "durven", jullie: "durven", zij: "durven" },
    past: { singular: "durfde", plural: "durfden" },
    pastParticiple: "gedurfd",
    perfect: "heeft gedurfd"
  },
  {
    infinitive: "blijven",
    english: "to stay / remain",
    imperative: "blijf",
    auxiliary: "zijn",
    present: { ik: "blijf", jij: "blijft", hij: "blijft", wij: "blijven", jullie: "blijven", zij: "blijven" },
    past: { singular: "bleef", plural: "bleven" },
    pastParticiple: "gebleven",
    perfect: "is gebleven"
  },
  {
    infinitive: "leren",
    english: "to learn / teach",
    imperative: "leer",
    auxiliary: "hebben",
    present: { ik: "leer", jij: "leert", hij: "leert", wij: "leren", jullie: "leren", zij: "leren" },
    past: { singular: "leerde", plural: "leerden" },
    pastParticiple: "geleerd",
    perfect: "heeft geleerd"
  },
  {
    infinitive: "reizen",
    english: "to travel",
    imperative: "reis",
    auxiliary: "hebben",
    present: { ik: "reis", jij: "reist", hij: "reist", wij: "reizen", jullie: "reizen", zij: "reizen" },
    past: { singular: "reisde", plural: "reisden" },
    pastParticiple: "gereisd",
    perfect: "heeft gereisd"
  },
  {
    infinitive: "studeren",
    english: "to study",
    imperative: "studeer",
    auxiliary: "hebben",
    present: { ik: "studeer", jij: "studeert", hij: "studeert", wij: "studeren", jullie: "studeren", zij: "studeren" },
    past: { singular: "studeerde", plural: "studeerden" },
    pastParticiple: "gestudeerd",
    perfect: "heeft gestudeerd"
  },
  {
    infinitive: "koken",
    english: "to cook",
    imperative: "kook",
    auxiliary: "hebben",
    present: { ik: "kook", jij: "kookt", hij: "kookt", wij: "koken", jullie: "koken", zij: "koken" },
    past: { singular: "kookte", plural: "kookten" },
    pastParticiple: "gekookt",
    perfect: "heeft gekookt"
  },
  {
    infinitive: "vertrekken",
    english: "to leave / depart",
    imperative: "vertrek",
    auxiliary: "zijn",
    present: { ik: "vertrek", jij: "vertrekt", hij: "vertrekt", wij: "vertrekken", jullie: "vertrekken", zij: "vertrekken" },
    past: { singular: "vertrok", plural: "vertrokken" },
    pastParticiple: "vertrokken",
    perfect: "is vertrokken"
  },
  {
    infinitive: "fietsen",
    english: "to cycle",
    imperative: "fiets",
    auxiliary: "hebben",
    present: { ik: "fiets", jij: "fietst", hij: "fietst", wij: "fietsen", jullie: "fietsen", zij: "fietsen" },
    past: { singular: "fietste", plural: "fietsten" },
    pastParticiple: "gefietst",
    perfect: "is gefietst"
  },
  {
    infinitive: "lopen",
    english: "to walk",
    imperative: "loop",
    auxiliary: "zijn",
    present: { ik: "loop", jij: "loopt", hij: "loopt", wij: "lopen", jullie: "lopen", zij: "lopen" },
    past: { singular: "liep", plural: "liepen" },
    pastParticiple: "gelopen",
    perfect: "is gelopen"
  },
  {
    infinitive: "rijden",
    english: "to ride / drive",
    imperative: "rij",
    auxiliary: "hebben",
    present: { ik: "rij", jij: "rijdt", hij: "rijdt", wij: "rijden", jullie: "rijden", zij: "rijden" },
    past: { singular: "reed", plural: "reden" },
    pastParticiple: "gereden",
    perfect: "heeft gereden"
  },
  {
    infinitive: "nemen",
    english: "to take",
    imperative: "neem",
    auxiliary: "hebben",
    present: { ik: "neem", jij: "neemt", hij: "neemt", wij: "nemen", jullie: "nemen", zij: "nemen" },
    past: { singular: "nam", plural: "namen" },
    pastParticiple: "genomen",
    perfect: "heeft genomen"
  },
  {
    infinitive: "helpen",
    english: "to help",
    imperative: "help",
    auxiliary: "hebben",
    present: { ik: "help", jij: "helpt", hij: "helpt", wij: "helpen", jullie: "helpen", zij: "helpen" },
    past: { singular: "hielp", plural: "hielpen" },
    pastParticiple: "geholpen",
    perfect: "heeft geholpen"
  },
  {
    infinitive: "bellen",
    english: "to call (phone)",
    imperative: "bel",
    auxiliary: "hebben",
    present: { ik: "bel", jij: "belt", hij: "belt", wij: "bellen", jullie: "bellen", zij: "bellen" },
    past: { singular: "belde", plural: "belden" },
    pastParticiple: "gebeld",
    perfect: "heeft gebeld"
  },
  {
    infinitive: "betalen",
    english: "to pay",
    imperative: "betaal",
    auxiliary: "hebben",
    present: { ik: "betaal", jij: "betaalt", hij: "betaalt", wij: "betalen", jullie: "betalen", zij: "betalen" },
    past: { singular: "betaalde", plural: "betaalden" },
    pastParticiple: "betaald",
    perfect: "heeft betaald"
  },
  {
    infinitive: "kopen",
    english: "to buy",
    imperative: "koop",
    auxiliary: "hebben",
    present: { ik: "koop", jij: "koopt", hij: "koopt", wij: "kopen", jullie: "kopen", zij: "kopen" },
    past: { singular: "kocht", plural: "kochten" },
    pastParticiple: "gekocht",
    perfect: "heeft gekocht"
  },
  {
    infinitive: "zwemmen",
    english: "to swim",
    imperative: "zwem",
    auxiliary: "hebben",
    present: { ik: "zwem", jij: "zwemt", hij: "zwemt", wij: "zwemmen", jullie: "zwemmen", zij: "zwemmen" },
    past: { singular: "zwom", plural: "zwommen" },
    pastParticiple: "gezwommen",
    perfect: "heeft gezwommen"
  },
  {
    infinitive: "zingen",
    english: "to sing",
    imperative: "zing",
    auxiliary: "hebben",
    present: { ik: "zing", jij: "zingt", hij: "zingt", wij: "zingen", jullie: "zingen", zij: "zingen" },
    past: { singular: "zong", plural: "zongen" },
    pastParticiple: "gezongen",
    perfect: "heeft gezongen"
  },
  {
    infinitive: "wachten",
    english: "to wait",
    imperative: "wacht",
    auxiliary: "hebben",
    present: { ik: "wacht", jij: "wacht", hij: "wacht", wij: "wachten", jullie: "wachten", zij: "wachten" },
    past: { singular: "wachtte", plural: "wachtten" },
    pastParticiple: "gewacht",
    perfect: "heeft gewacht"
  },
  {
    infinitive: "vergeten",
    english: "to forget",
    imperative: "vergeet",
    auxiliary: "hebben",
    present: { ik: "vergeet", jij: "vergeet", hij: "vergeet", wij: "vergeten", jullie: "vergeten", zij: "vergeten" },
    past: { singular: "vergat", plural: "vergaten" },
    pastParticiple: "vergeten",
    perfect: "heeft vergeten"
  },
  {
    infinitive: "kiezen",
    english: "to choose",
    imperative: "kies",
    auxiliary: "hebben",
    present: { ik: "kies", jij: "kiest", hij: "kiest", wij: "kiezen", jullie: "kiezen", zij: "kiezen" },
    past: { singular: "koos", plural: "kozen" },
    pastParticiple: "gekozen",
    perfect: "heeft gekozen"
  },
  {
    infinitive: "ontmoeten",
    english: "to meet",
    imperative: "ontmoet",
    auxiliary: "hebben",
    present: { ik: "ontmoet", jij: "ontmoet", hij: "ontmoet", wij: "ontmoeten", jullie: "ontmoeten", zij: "ontmoeten" },
    past: { singular: "ontmoette", plural: "ontmoetten" },
    pastParticiple: "ontmoet",
    perfect: "heeft ontmoet"
  },
  {
    infinitive: "bezoeken",
    english: "to visit",
    imperative: "bezoek",
    auxiliary: "hebben",
    present: { ik: "bezoek", jij: "bezoekt", hij: "bezoekt", wij: "bezoeken", jullie: "bezoeken", zij: "bezoeken" },
    past: { singular: "bezocht", plural: "bezochten" },
    pastParticiple: "bezocht",
    perfect: "heeft bezocht"
  },
  {
    infinitive: "afmaken",
    english: "to finish",
    imperative: "maak af",
    auxiliary: "hebben",
    present: { ik: "maak af", jij: "maakt af", hij: "maakt af", wij: "maken af", jullie: "maken af", zij: "maken af" },
    past: { singular: "maakte af", plural: "maakten af" },
    pastParticiple: "afgemaakt",
    perfect: "heeft afgemaakt"
  },
  {
    infinitive: "openen",
    english: "to open",
    imperative: "open",
    auxiliary: "hebben",
    present: { ik: "open", jij: "opent", hij: "opent", wij: "openen", jullie: "openen", zij: "openen" },
    past: { singular: "opende", plural: "openden" },
    pastParticiple: "geopend",
    perfect: "heeft geopend"
  },
  {
    infinitive: "proberen",
    english: "to try",
    imperative: "probeer",
    auxiliary: "hebben",
    present: { ik: "probeer", jij: "probeert", hij: "probeert", wij: "proberen", jullie: "proberen", zij: "proberen" },
    past: { singular: "probeerde", plural: "probeerden" },
    pastParticiple: "geprobeerd",
    perfect: "heeft geprobeerd"
  },
  {
    infinitive: "weten",
    english: "to know (a fact)",
    imperative: "weet",
    auxiliary: "hebben",
    present: { ik: "weet", jij: "weet", hij: "weet", wij: "weten", jullie: "weten", zij: "weten" },
    past: { singular: "wist", plural: "wisten" },
    pastParticiple: "geweten",
    perfect: "heeft geweten"
  },
  {
    infinitive: "denken",
    english: "to think",
    imperative: "denk",
    auxiliary: "hebben",
    present: { ik: "denk", jij: "denkt", hij: "denkt", wij: "denken", jullie: "denken", zij: "denken" },
    past: { singular: "dacht", plural: "dachten" },
    pastParticiple: "gedacht",
    perfect: "heeft gedacht"
  },
  {
    infinitive: "zeggen",
    english: "to say",
    imperative: "zeg",
    auxiliary: "hebben",
    present: { ik: "zeg", jij: "zegt", hij: "zegt", wij: "zeggen", jullie: "zeggen", zij: "zeggen" },
    past: { singular: "zei", plural: "zeiden" },
    pastParticiple: "gezegd",
    perfect: "heeft gezegd"
  },
  {
    infinitive: "horen",
    english: "to hear",
    imperative: "hoor",
    auxiliary: "hebben",
    present: { ik: "hoor", jij: "hoort", hij: "hoort", wij: "horen", jullie: "horen", zij: "horen" },
    past: { singular: "hoorde", plural: "hoorden" },
    pastParticiple: "gehoord",
    perfect: "heeft gehoord"
  },
  {
    infinitive: "geloven",
    english: "to believe",
    imperative: "geloof",
    auxiliary: "hebben",
    present: { ik: "geloof", jij: "gelooft", hij: "gelooft", wij: "geloven", jullie: "geloven", zij: "geloven" },
    past: { singular: "geloofde", plural: "geloofden" },
    pastParticiple: "geloofd",
    perfect: "heeft geloofd"
  },
  {
    infinitive: "hopen",
    english: "to hope",
    imperative: "hoop",
    auxiliary: "hebben",
    present: { ik: "hoop", jij: "hoopt", hij: "hoopt", wij: "hopen", jullie: "hopen", zij: "hopen" },
    past: { singular: "hoopte", plural: "hoopten" },
    pastParticiple: "gehoopt",
    perfect: "heeft gehoopt"
  },
  {
    infinitive: "vrezen",
    english: "to fear",
    imperative: "vrees",
    auxiliary: "hebben",
    present: { ik: "vrees", jij: "vreest", hij: "vreest", wij: "vrezen", jullie: "vrezen", zij: "vrezen" },
    past: { singular: "vreeste", plural: "vreesten" },
    pastParticiple: "gevreesd",
    perfect: "heeft gevreesd"
  },
  {
    infinitive: "zien",
    english: "to see",
    imperative: "zie",
    auxiliary: "hebben",
    present: { ik: "zie", jij: "ziet", hij: "ziet", wij: "zien", jullie: "zien", zij: "zien" },
    past: { singular: "zag", plural: "zagen" },
    pastParticiple: "gezien",
    perfect: "heeft gezien"
  },
  {
    infinitive: "begrijpen",
    english: "to understand",
    imperative: "begrijp",
    auxiliary: "hebben",
    present: { ik: "begrijp", jij: "begrijpt", hij: "begrijpt", wij: "begrijpen", jullie: "begrijpen", zij: "begrijpen" },
    past: { singular: "begreep", plural: "begrepen" },
    pastParticiple: "begrepen",
    perfect: "heeft begrepen"
  },
  {
    infinitive: "onthouden",
    english: "to remember / retain",
    imperative: "onthoud",
    auxiliary: "hebben",
    present: { ik: "onthoud", jij: "onthoudt", hij: "onthoudt", wij: "onthouden", jullie: "onthouden", zij: "onthouden" },
    past: { singular: "onthield", plural: "onthielden" },
    pastParticiple: "onthouden",
    perfect: "heeft onthouden"
  },
  {
    infinitive: "twijfelen",
    english: "to doubt",
    imperative: "twijfel",
    auxiliary: "hebben",
    present: { ik: "twijfel", jij: "twijfelt", hij: "twijfelt", wij: "twijfelen", jullie: "twijfelen", zij: "twijfelen" },
    past: { singular: "twijfelde", plural: "twijfelden" },
    pastParticiple: "getwijfeld",
    perfect: "heeft getwijfeld"
  },
  {
    infinitive: "verkopen",
    english: "to sell",
    imperative: "verkoop",
    auxiliary: "hebben",
    present: { ik: "verkoop", jij: "verkoopt", hij: "verkoopt", wij: "verkopen", jullie: "verkopen", zij: "verkopen" },
    past: { singular: "verkocht", plural: "verkochten" },
    pastParticiple: "verkocht",
    perfect: "heeft verkocht"
  },
  {
    infinitive: "verliezen",
    english: "to lose",
    imperative: "verlies",
    auxiliary: "hebben",
    present: { ik: "verlies", jij: "verliest", hij: "verliest", wij: "verliezen", jullie: "verliezen", zij: "verliezen" },
    past: { singular: "verloor", plural: "verloren" },
    pastParticiple: "verloren",
    perfect: "heeft verloren"
  },
  {
    infinitive: "winnen",
    english: "to win",
    imperative: "win",
    auxiliary: "hebben",
    present: { ik: "win", jij: "wint", hij: "wint", wij: "winnen", jullie: "winnen", zij: "winnen" },
    past: { singular: "won", plural: "wonnen" },
    pastParticiple: "gewonnen",
    perfect: "heeft gewonnen"
  },
  {
    infinitive: "beginnen",
    english: "to begin",
    imperative: "begin",
    auxiliary: "hebben",
    present: { ik: "begin", jij: "begint", hij: "begint", wij: "beginnen", jullie: "beginnen", zij: "beginnen" },
    past: { singular: "begon", plural: "begonnen" },
    pastParticiple: "begonnen",
    perfect: "heeft begonnen"
  },
  {
    infinitive: "luisteren",
    english: "to listen",
    imperative: "luister",
    auxiliary: "hebben",
    present: { ik: "luister", jij: "luistert", hij: "luistert", wij: "luisteren", jullie: "luisteren", zij: "luisteren" },
    past: { singular: "luisterde", plural: "luisterden" },
    pastParticiple: "geluisterd",
    perfect: "heeft geluisterd"
  },
  {
    infinitive: "regenen",
    english: "to rain",
    imperative: "—",
    auxiliary: "hebben",
    present: { ik: "—", jij: "—", hij: "regent", wij: "—", jullie: "—", zij: "—" },
    past: { singular: "regende", plural: "regenden" },
    pastParticiple: "geregend",
    perfect: "heeft geregend"
  },
  {
    infinitive: "slapen",
    english: "to sleep",
    imperative: "slaap",
    auxiliary: "hebben",
    present: { ik: "slaap", jij: "slaapt", hij: "slaapt", wij: "slapen", jullie: "slapen", zij: "slapen" },
    past: { singular: "sliep", plural: "sliepen" },
    pastParticiple: "geslapen",
    perfect: "heeft geslapen"
  },
  {
    infinitive: "liggen",
    english: "to lie (recline)",
    imperative: "lig",
    auxiliary: "hebben",
    present: { ik: "lig", jij: "ligt", hij: "ligt", wij: "liggen", jullie: "liggen", zij: "liggen" },
    past: { singular: "lag", plural: "lagen" },
    pastParticiple: "gelegen",
    perfect: "heeft gelegen"
  },
  {
    infinitive: "wijzen",
    english: "to point / show the way",
    imperative: "wijs",
    auxiliary: "hebben",
    present: { ik: "wijs", jij: "wijst", hij: "wijst", wij: "wijzen", jullie: "wijzen", zij: "wijzen" },
    past: { singular: "wees", plural: "wezen" },
    pastParticiple: "gewezen",
    perfect: "heeft gewezen"
  },
  {
    infinitive: "voelen",
    english: "to feel",
    imperative: "voel",
    auxiliary: "hebben",
    present: { ik: "voel", jij: "voelt", hij: "voelt", wij: "voelen", jullie: "voelen", zij: "voelen" },
    past: { singular: "voelde", plural: "voelden" },
    pastParticiple: "gevoeld",
    perfect: "heeft gevoeld"
  },
  // ── NEW: academic/ICT verbs ────────────────────────────────────────────────
  {
    infinitive: "verwachten",
    english: "to expect",
    imperative: "verwacht",
    auxiliary: "hebben",
    present: { ik: "verwacht", jij: "verwacht", hij: "verwacht", wij: "verwachten", jullie: "verwachten", zij: "verwachten" },
    past: { singular: "verwachtte", plural: "verwachtten" },
    pastParticiple: "verwacht",
    perfect: "heeft verwacht"
  },
  {
    infinitive: "beseffen",
    english: "to realise",
    imperative: "besef",
    auxiliary: "hebben",
    present: { ik: "besef", jij: "beseft", hij: "beseft", wij: "beseffen", jullie: "beseffen", zij: "beseffen" },
    past: { singular: "besefte", plural: "beseften" },
    pastParticiple: "beseft",
    perfect: "heeft beseft"
  },
  {
    infinitive: "beweren",
    english: "to claim",
    imperative: "beweer",
    auxiliary: "hebben",
    present: { ik: "beweer", jij: "beweert", hij: "beweert", wij: "beweren", jullie: "beweren", zij: "beweren" },
    past: { singular: "beweerde", plural: "beweerden" },
    pastParticiple: "beweerd",
    perfect: "heeft beweerd"
  },
  {
    infinitive: "uitleggen",
    english: "to explain",
    imperative: "leg uit",
    auxiliary: "hebben",
    present: { ik: "leg uit", jij: "legt uit", hij: "legt uit", wij: "leggen uit", jullie: "leggen uit", zij: "leggen uit" },
    past: { singular: "legde uit", plural: "legden uit" },
    pastParticiple: "uitgelegd",
    perfect: "heeft uitgelegd"
  },
  {
    infinitive: "inleveren",
    english: "to hand in / submit",
    imperative: "lever in",
    auxiliary: "hebben",
    present: { ik: "lever in", jij: "levert in", hij: "levert in", wij: "leveren in", jullie: "leveren in", zij: "leveren in" },
    past: { singular: "leverde in", plural: "leverden in" },
    pastParticiple: "ingeleverd",
    perfect: "heeft ingeleverd"
  },
  {
    infinitive: "programmeren",
    english: "to program",
    imperative: "programmeer",
    auxiliary: "hebben",
    present: { ik: "programmeer", jij: "programmeert", hij: "programmeert", wij: "programmeren", jullie: "programmeren", zij: "programmeren" },
    past: { singular: "programmeerde", plural: "programmeerden" },
    pastParticiple: "geprogrammeerd",
    perfect: "heeft geprogrammeerd"
  },
  {
    infinitive: "installeren",
    english: "to install",
    imperative: "installeer",
    auxiliary: "hebben",
    present: { ik: "installeer", jij: "installeert", hij: "installeert", wij: "installeren", jullie: "installeren", zij: "installeren" },
    past: { singular: "installeerde", plural: "installeerden" },
    pastParticiple: "geïnstalleerd",
    perfect: "heeft geïnstalleerd"
  },
];

export const categoryLabels: Record<PracticeCategory, string> = {
  "zijn-have": "Zijn + have",
  negation: "Negation",
  "questions-inversion": "Questions/inversion",
  modals: "Modal verbs",
  "omdat-want": "Omdat/want",
  "dat-clause": "Dat-clause",
  "fronted-inversion": "Fronted adverbs",
  demonstratives: "Demonstratives",
  "perfect-tense": "Perfect tense",
  "terwijl-toen": "Terwijl/toen",
  numbers: "Numbers",
  "transport-location": "Transport/location"
};

export const allCategories = Object.keys(categoryLabels) as PracticeCategory[];

function pick<T extends readonly unknown[]>(arr: T): T[number] {
  return arr[Math.floor(Math.random() * arr.length)] as T[number];
}

function englishBe(subject: Subject) {
  if (subject.role === "first-singular") return "am";
  if (subject.role === "third-singular") return "is";
  return "are";
}

function englishHave(subject: Subject) {
  return subject.role === "third-singular" ? "has" : "have";
}

function englishDo(subject: Subject) {
  return subject.role === "third-singular" ? "Does" : "Do";
}

function englishPresent(subject: Subject, base: string) {
  if (subject.role !== "third-singular") return base;
  if (base.endsWith("y")) return `${base.slice(0, -1)}ies`;
  if (base.endsWith("o") || base.endsWith("ch") || base.endsWith("sh") || base.endsWith("x") || base.endsWith("s")) {
    return `${base}es`;
  }
  return `${base}s`;
}

function englishModal(subject: Subject, modal: string) {
  const sg3 = subject.role === "third-singular";
  if (modal === "want to" && sg3) return "wants to";
  if (modal === "need to" && sg3) return "needs to";
  if (modal === "dare to" && sg3) return "dares to";
  if (modal === "have to" && sg3) return "has to";
  if (modal === "are allowed to") {
    if (subject.role === "first-singular") return "am allowed to";
    if (subject.role === "third-singular") return "is allowed to";
    return "are allowed to";
  }
  return modal;
}

function dutchZijn(subject: Subject) {
  if (subject.role === "first-singular") return "ben";
  if (subject.role === "second-singular") return "bent";
  if (subject.role === "third-singular") return "is";
  return "zijn";
}

function dutchHebben(subject: Subject) {
  if (subject.role === "first-singular") return "heb";
  if (subject.role === "second-singular") return "hebt";
  if (subject.role === "third-singular") return "heeft";
  return "hebben";
}

function dutchConjugated(subject: Subject, verb: VerbShape, inverted = false) {
  if (subject.role === "first-singular") return verb.nlIk as string;
  if (subject.role === "second-singular") {
    if (inverted) {
      return subject.nl === "u" ? (verb.nlSingular as string) : (verb.nlIk as string);
    }
    return verb.nlSingular as string;
  }
  if (subject.role === "third-singular") return verb.nlSingular as string;
  return verb.nlPlural as string;
}

function dutchModal(subject: Subject, modalInfinitive: ModalInfinitive) {
  const plural = subject.role === "first-plural" || subject.role === "third-plural";
  if (modalInfinitive === "kunnen") {
    if (subject.role === "first-singular" || subject.role === "third-singular") return "kan";
    if (subject.role === "second-singular") return "kunt";
    return "kunnen";
  }
  if (modalInfinitive === "moeten") {
    if (plural) return "moeten";
    return "moet";
  }
  if (modalInfinitive === "mogen") {
    if (plural) return "mogen";
    return "mag";
  }
  if (modalInfinitive === "zullen") {
    if (subject.role === "first-singular" || subject.role === "third-singular") return "zal";
    if (subject.role === "second-singular") return "zult";
    return "zullen";
  }
  if (modalInfinitive === "durven") {
    if (plural) return "durven";
    if (subject.role === "second-singular" || subject.role === "third-singular") return "durft";
    return "durf";
  }
  if (plural) return "willen";
  return "wil";
}

function capitalize(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getSubjectHint(subject: Subject, verbForm: string): string {
  if (subject.en.includes("you")) {
    if (subject.en === "you (informal)") {
      return `Use "jij/je": ${subject.nl} ${verbForm}`;
    }
    if (subject.en === "you (formal)") {
      return `Use formal "u": ${subject.nl} ${verbForm}`;
    }
    if (subject.en === "you all") {
      return `Use "jullie" (plural): ${subject.nl} ${verbForm}`;
    }
  }
  return "";
}

type SentencePayload = {
  en: string;
  nl: string;
  hint: string;
  grammarNote: string;
  grammar?: import("./grammar-types").GrammarMetadata;
  accepted?: string[];
};

function uniqueSentences(sentences: Array<string | undefined>) {
  return [...new Set(sentences.filter((sentence): sentence is string => Boolean(sentence && sentence.trim())))];
}

// ─────────────────────────────────────────────────────────────────────────────
// COHERENCE VALIDATOR — replaces the vocabulary-whitelist approach.
//
// Instead of checking every word against a known-words set (which caused ~18%
// fallback rate), we check three structural rules:
//   1. The sentence has at least one recognisable Dutch finite verb form.
//   2. The Dutch and English sides are not identical (catches copy-paste bugs).
//   3. The sentence doesn't contain obviously unnatural verb+object combos
//      that slipped past the generator's collocation filters.
//
// The old sentenceUsesKnownVocabulary / sentenceIsReferenceComplete functions
// are removed entirely and replaced by this function.
// ─────────────────────────────────────────────────────────────────────────────

// Known finite verb forms drawn from the conjugation tables above.
const KNOWN_DUTCH_FINITE_FORMS = new Set([
  // zijn
  "ben","bent","is","zijn","was","waren",
  // hebben
  "heb","hebt","heeft","hebben","had","hadden",
  // common present
  "werk","werkt","werken","leer","leert","leren",
  "lees","leest","lezen","reis","reist","reizen",
  "ga","gaat","gaan","kom","komt","komen",
  "doe","doet","doen","maak","maakt","maken",
  "geef","geeft","geven","neem","neemt","nemen",
  "zie","ziet","zien","denk","denkt","denken",
  "zeg","zegt","zeggen","vind","vindt","vinden",
  "blijf","blijft","blijven","laat","laten",
  "sta","staat","staan","zit","zitten",
  "lig","ligt","liggen","loop","loopt","lopen",
  "woon","woont","wonen","speel","speelt","spelen",
  "praat","praten","spreek","spreekt","spreken",
  "luister","luistert","luisteren",
  "kijk","kijkt","kijken","eet","eten",
  "drink","drinkt","drinken","slaap","slaapt","slapen",
  "rij","rijdt","rijden","fiets","fietst","fietsen",
  "bel","belt","bellen","koop","koopt","kopen",
  "betaal","betaalt","betalen","zwem","zwemt","zwemmen",
  "zing","zingt","zingen","wacht","wachten",
  "help","helpt","helpen","kook","kookt","koken",
  "studeer","studeert","studeren","rook","rookt","roken",
  "vertrek","vertrekt","vertrekken",
  "vergeet","vergeten","kies","kiest","kiezen",
  "ontmoet","ontmoeten","bezoek","bezoekt","bezoeken",
  "probeer","probeert","proberen","weet","weten",
  "hoor","hoort","horen","geloof","gelooft","geloven",
  "hoop","hoopt","hopen","vrees","vreest","vrezen",
  "begrijp","begrijpt","begrijpen",
  "onthoud","onthoudt","onthouden",
  "twijfel","twijfelt","twijfelen",
  "verkoop","verkoopt","verkopen",
  "verlies","verliest","verliezen",
  "win","wint","winnen","begin","begint","beginnen",
  "verwacht","verwachten","besef","beseft","beseffen",
  "beweer","beweert","beweren",
  "leg","legt","leggen",
  "kom","komt","komen","sta","staat","staan",
  "maak","maakt","maken","neem","neemt","nemen",
  // modals
  "kan","kunt","kunnen","moet","moeten",
  "wil","wilt","willen","mag","mogen",
  "zal","zult","zullen","hoef","hoeft","hoeven",
  "durf","durft","durven",
]);

const BAD_VERB_OBJECT_COMBOS = [
  // "doen werk" — "werk doen" is unnatural; should be "huiswerk doen"
  /\bdoen\s+werk\b/,
  /\bdoe\s+werk\b/,
  /\bdoet\s+werk\b/,
  // "nemen school" — nemen needs a concrete transport/decision object
  /\bnemen\s+school\b/,
  // Walking/cycling combined with "in de" for destinations (should be "naar")
  /\b(loopt?|fiets[t]?)\s+in\s+de\s/,
];

function sentencePassesHardRules(sentence: SentencePayload, intent?: GrammarIntent): boolean {
  const nl = sentence.nl.toLowerCase();
  const en = sentence.en.toLowerCase();

  // Rule 1: Dutch and English sides must differ
  if (nl.replace(/[^a-z]/g, "") === en.replace(/[^a-z]/g, "")) return false;

  // Rule 2: Dutch sentence must contain at least one known finite verb form
  const nlTokens = nl.match(/[\p{L}]+/gu) ?? [];
  const hasFiniteVerb = nlTokens.some((token) => KNOWN_DUTCH_FINITE_FORMS.has(token));
  if (!hasFiniteVerb) return false;

  // Rule 3: Bad verb-object combos
  for (const pattern of BAD_VERB_OBJECT_COMBOS) {
    if (pattern.test(nl)) return false;
  }

  // Rule 4: Inverted jij — forms like "vindt jij" / "blijft jij" are wrong
  if (/\b(?:bent|vindt|blijft|loopt|neemt|doet|spreekt|luistert|kijkt|heeft|is|kan|mag|wil|moet|hoeft|durft|gaat|komt|wordt|ziet|denkt|vraagt)\s+(?:jij|je)\b/i.test(nl)) {
    return false;
  }

  // Rule 5: location word must match preposition convention
  // (keep the precise checks from before for location words we know about)
  if (intent?.location?.noun?.word) {
    const locationWord = intent.location.noun.word;
    if (locationWord === "school" && !nl.includes("op school") && !nl.includes("naar school")) return false;
    if (locationWord === "kantoor" && !nl.includes("op kantoor") && !nl.includes("op het werk") && !nl.includes("naar het kantoor")) return false;
    if (locationWord === "huis" && !nl.includes("thuis") && !nl.includes("naar huis")) return false;
  }

  // Rule 6: verb collocation checks (keep the valuable ones, skip the vocab check)
  if (intent?.verb?.infinitive) {
    const verb = intent.verb.infinitive;
    const collocation = findVerbCollocation(verb);

    if (collocation?.requiresPreposition && !nl.includes(` ${collocation.requiresPreposition} `)) {
      return false;
    }

    if (verb === "luisteren") {
      if (!nl.includes("naar")) return false;
    }

    // doen must use one of its approved objects
    if (verb === "doen") {
      const allowedDoen = ["huiswerk", "boodschappen"];
      if (!allowedDoen.some((obj) => nl.includes(obj))) return false;
    }

    // nemen must have a concrete transport/decision object
    if (verb === "nemen") {
      const allowedNemen = ["trein", "bus", "metro", "tram", "beslissing", "pauze"];
      if (!allowedNemen.some((obj) => nl.includes(obj))) return false;
    }

    if (collocation?.allowedSubjectTypes && intent?.subject?.semanticType) {
      if (!collocation.allowedSubjectTypes.includes(intent.subject.semanticType)) return false;
    }
  }

  // Rule 7: object/location sync (keep from original — catches intent mismatches)
  if (intent?.object?.word) {
    const objectWord = String(intent.object.word).toLowerCase();
    if (!nl.includes(objectWord)) return false;
  }

  if (intent?.location?.english && !en.includes(String(intent.location.english).toLowerCase())) {
    return false;
  }

  return true;
}

function buildSentenceOnce(category: PracticeCategory): SentencePayload | null {
  const structured = generateStructuredSentence(category);
  if (structured) {
    const sentence: SentencePayload = {
      en: structured.english,
      nl: structured.dutch,
      hint: structured.hint,
      grammarNote: structured.grammarNote,
      grammar: structured.grammar,
      accepted: structured.accepted
    };
    return sentencePassesHardRules(sentence, structured.intent) ? sentence : null;
  }

  switch (category) {
    case "zijn-have": {
      const s = pick(subjects);
      const a = pick(adjectives);
      const o = pick(objects);
      if (Math.random() > 0.5) {
        const zijn = dutchZijn(s);
        const sentence: SentencePayload = {
          en: `${s.en} ${englishBe(s)} ${a.en}.`,
          nl: `${s.nl} ${zijn} ${a.nl}.`,
          hint: getSubjectHint(s, zijn) || "Use the right form of zijn (ben/bent/is/zijn).",
          grammarNote: "Dutch zijn changes by subject: ik ben, jij bent, hij/zij is, wij/jullie/zij zijn."
        };
        return sentencePassesHardRules(sentence) ? sentence : null;
      }
      const hebben = dutchHebben(s);
      const sentence: SentencePayload = {
        en: `${s.en} ${englishHave(s)} ${o.en}.`,
        nl: `${s.nl} ${hebben} ${o.nl}.`,
        hint: getSubjectHint(s, hebben) || "Have-constructions use hebben forms.",
        grammarNote: "Use hebben for possession: ik heb, jij hebt, hij/zij heeft, wij/jullie/zij hebben."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "negation": {
      const s = pick(subjects);
      const p = pick(places);
      const zijn = dutchZijn(s);
      const sentence: SentencePayload = {
        en: `${s.en} ${englishBe(s)} not ${p.en}.`,
        nl: `${s.nl} ${zijn} niet ${p.nl}.`,
        hint: getSubjectHint(s, zijn) || "Use niet to negate verbs/adjectives.",
        grammarNote: "niet usually comes after the finite verb and before place/time complements."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "questions-inversion": {
      const s = pick(subjects);
      const v = pick(baseVerbs);
      const conjugated = dutchConjugated(s, v, true);
      const sentence: SentencePayload = {
        en: `${englishDo(s)} ${s.en} ${v.en} today?`,
        nl: `${capitalize(conjugated)} ${s.nl} vandaag?`,
        hint: getSubjectHint(s, conjugated) || "In yes/no questions, verb comes before subject.",
        grammarNote: "Dutch inversion: finite verb first, then subject in questions."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "modals": {
      const s = pick(subjects);
      const m = pick(modalVerbs);
      const v = pick(baseVerbs);
      const modal = dutchModal(s, m.nlInf);
      const sentence: SentencePayload = {
        en: `${s.en} ${englishModal(s, m.en)} ${v.en}.`,
        nl: `${s.nl} ${modal} ${v.nlInf}.`,
        hint: getSubjectHint(s, modal) || "Modal in position 2, infinitive at sentence end.",
        grammarNote: "With modal verbs, the main verb moves to the end as infinitive."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "omdat-want": {
      const s = pick(subjects);
      const p = pick(places);
      const stayVerb = { en: "stay", nlInf: "blijven", nlSingular: "blijft", nlIk: "blijf", nlPlural: "blijven" };
      const conjugated = dutchConjugated(s, stayVerb);
      const sentence: SentencePayload = {
        en: `${s.en} ${englishPresent(s, "stay")} ${p.en} because it is raining.`,
        nl: `${s.nl} ${conjugated} ${p.nl} omdat het regent.`,
        hint: getSubjectHint(s, conjugated) || "Omdat pushes the conjugated verb to clause end.",
        grammarNote: "Subordinate clause with omdat uses end-position verb."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "dat-clause": {
      const s = pick(subjects);
      const knowVerb = { en: "know", nlInf: "weten", nlSingular: "weet", nlIk: "weet", nlPlural: "weten" };
      const conjugated = dutchConjugated(s, knowVerb);
      const sentence: SentencePayload = {
        en: `${s.en} ${englishPresent(s, "know")} that she is busy.`,
        nl: `${s.nl} ${conjugated} dat zij druk is.`,
        hint: getSubjectHint(s, conjugated) || "In dat-clauses, verb tends toward final position.",
        grammarNote: "dat introduces subordinate word order; finite verb appears later/end."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "fronted-inversion": {
      const s = pick(subjects);
      const adv = pick(adverbs);
      const v = pick(baseVerbs);
      const conjugated = dutchConjugated(s, v);
      const sentence: SentencePayload = {
        en: `${capitalize(adv.en)}, ${s.en} ${englishPresent(s, v.en)} at home.`,
        nl: `${capitalize(adv.nl)} ${conjugated} ${s.nl} thuis.`,
        hint: getSubjectHint(s, conjugated) || "Fronted adverb causes inversion in Dutch.",
        grammarNote: "When time/place starts the sentence, finite verb must be in second position."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "demonstratives": {
      const n = pick(nounReference);
      const sentence: SentencePayload = {
        en: `This ${n.english} is expensive.`,
        nl: `${n.thisForm} is duur.`,
        hint: "Use dit/dat with het words and deze/die with de words.",
        grammarNote: "Demonstratives agree with noun gender/article."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "perfect-tense": {
      const s = pick(subjects);
      const p = pick(participles);
      const hebben = dutchHebben(s);
      const adverb = pick(adverbs);
      const useAdverb = Math.random() > 0.5;
      // FIX: provide both word-order variants as accepted answers
      const nlWithAdverb = `${s.nl} ${hebben} ${adverb.nl} ${p.nl}.`;
      const nlAdverbLast = `${s.nl} ${hebben} ${p.nl} ${adverb.nl}.`;
      const nlNoAdverb = `${s.nl} ${hebben} ${p.nl}.`;
      const sentence: SentencePayload = {
        en: `${s.en} ${englishHave(s)} ${p.en}.`,
        nl: useAdverb ? nlWithAdverb : nlNoAdverb,
        accepted: useAdverb
          ? uniqueSentences([nlWithAdverb, nlAdverbLast, nlNoAdverb])
          : uniqueSentences([nlNoAdverb]),
        hint: getSubjectHint(s, hebben) || (useAdverb ? `Place "${adverb.nl}" before or after the participle — both are accepted.` : "Perfect tense uses hebben/zijn + past participle."),
        grammarNote: "Most verbs take hebben + participle; movement verbs often use zijn."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "terwijl-toen": {
      if (Math.random() > 0.5) {
        const nl = "Toen lachten wij erom.";
        const sentence: SentencePayload = {
          en: "Then we laughed about it.",
          nl,
          accepted: uniqueSentences([
            nl,
            "Toen hebben wij erom gelachen.",
            "Toen hebben we erom gelachen."
          ]),
          hint: "Toen can introduce a past event and also allows a perfect-tense paraphrase.",
          grammarNote: "Toen often triggers inversion in the main clause."
        };
        return sentencePassesHardRules(sentence) ? sentence : null;
      }

      const sentence: SentencePayload = {
        en: "I was reading while she was cooking.",
        nl: "Ik las terwijl zij kookte.",
        hint: "Use terwijl for simultaneous actions.",
        grammarNote: "terwijl links parallel actions; toen often marks a one-time past event."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "numbers": {
      const n = pick(numbers);
      const sentence: SentencePayload = {
        en: `I have ${n.en} euros.`,
        nl: `Ik heb ${n.nl} euro.`,
        hint: "Practice Dutch number words.",
        grammarNote: "Dutch number compounds place unit before ten (e.g., vijf-en-veertig)."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
    case "transport-location": {
      const t = pick(transport);
      const p = pick(places);
      const nl = `Wij gaan ${t.nl} en komen ${p.nl} aan.`;
      const sentence: SentencePayload = {
        en: `We go ${t.en} and arrive ${p.en}.`,
        nl,
        accepted: uniqueSentences([nl, `Wij gaan ${t.nl} en komen aan ${p.nl}.`]),
        hint: "Transport phrases often start with met.",
        grammarNote: "Separable verbs split in main clauses (aankomen -> komen ... aan)."
      };
      return sentencePassesHardRules(sentence) ? sentence : null;
    }
  }
}

function buildSentence(category: PracticeCategory): SentencePayload {
  // Increased retries from 10 to 20 to further reduce fallback rate
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const sentence = buildSentenceOnce(category);
    if (sentence) return sentence;
  }

  // Last-ditch attempt without the intent object so rule 5/6/7 don't block it
  const last = buildSentenceOnce(category);
  if (last) return last;

  return {
    en: "I am ready.",
    nl: "Ik ben klaar.",
    hint: "Fallback sentence.",
    grammarNote: "Fallback when generation fails."
  };
}

export function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function isCloseAnswer(answer: string, expected: string) {
  const answerTokens = new Set(normalizeAnswer(answer).split(" "));
  const expectedTokens = normalizeAnswer(expected).split(" ");
  if (!answerTokens.size || !expectedTokens.length) return false;
  const overlap = expectedTokens.filter((token) => answerTokens.has(token)).length;
  return overlap / expectedTokens.length >= 0.65;
}

export function createPracticeItem(direction: Direction, category: PracticeCategory): PracticeItem {
  const sentence = buildSentence(category);
  const prompt = direction === "en-to-nl" ? sentence.en : sentence.nl;
  const expected = direction === "en-to-nl" ? sentence.nl : sentence.en;

  // Build accepted list: start from sentence.accepted if available, then add
  // common pronoun variants (jij/je, wij/we, zij/ze).
  const base = sentence.accepted?.length ? sentence.accepted : [expected];
  const withVariants = base.flatMap((ans) => [
    ans,
    ans.replace(/\bjij\b/g, "je"),
    ans.replace(/\bje\b/g, "jij"),
    ans.replace(/\bwij\b/g, "we"),
    ans.replace(/\bwe\b/g, "wij"),
    ans.replace(/\bzij\b/g, "ze"),
    ans.replace(/\bze\b/g, "zij"),
  ]);
  const accepted = [...new Set(withVariants.map((s) => s.trim()).filter(Boolean))];

  return {
    id: crypto.randomUUID(),
    category,
    direction,
    prompt,
    expected,
    accepted,
    hint: sentence.hint,
    grammarNote: sentence.grammarNote,
    grammar: sentence.grammar
  };
}

export function buildQuestionSet(
  count: number,
  category: PracticeCategory | "all",
  direction: Direction
): PracticeItem[] {
  const questions: PracticeItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const selected = category === "all" ? pick(allCategories) : category;
    questions.push(createPracticeItem(direction, selected));
  }
  return questions;
}