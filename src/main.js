var rus = {};

rus.alphabete = //#put dictToArray("dicts/alphabete.txt", {format: "letter", join: ""});
rus.vowels = //#put dictToArray("dicts/alphabete.txt", {filter: "vowel", join:"", format: "letter"})
rus.consonants = //#put dictToArray("dicts/alphabete.txt", {filter: "consonant", join:"", format: "letter"})
rus.voiced = //#put dictToArray("dicts/alphabete.txt", {filter: "voiced", join:"", format: "letter"})
rus.unvoiced = //#put dictToArray("dicts/alphabete.txt", {filter: "unvoiced", join:"", format: "letter"})
rus.sibilant = //#put dictToArray("dicts/alphabete.txt", {filter: "sibilant", join:"", format: "letter"})

rus.prepositions = //#put dictToArray("dicts/prepositions.txt");
rus.prefixes = //#put dictToArray("dicts/prefixes.txt");
rus.pronouns = //#put dictToArray("dicts/pronouns.txt");

//#if DEV
rus.patronimics = //#put dictToArray("dicts/patronimics.txt");
//#endif


//TODO: generate these groups automatically
//generate groups
rus.groups = {
    //general groups
    V: rus.vowels,
    C: rus.consonants,
    D: rus.voiced,
    T: rus.unvoiced,
    S: rus.sibilant,

    //sonant groups
    α: "ая",
    θ: "оё",
    υ: "ую",
    ε: "эе",
    ι: "ыи",

    //consonant groups
    β: "бп",
    ν: "вф",
    γ: "гк",
    δ: "дт",
    η: "жш",
    ζ: "зс",

    //softeners
    s: "ьй"
};

//generalized groups (chained)
//TODO: pick groups so to minify form groups of words
rus.genGroups = {
    //sonants
    а: "α",
    я: "α",
    о: "θ",
    ё: "θ",
    у: "υ",
    ю: "υ",
    э: "ε",
    е: "ε",
    ы: "ι",
    и: "ι",

    α: "A",
    θ: "A",
    υ: "A",
    ε: "A",
    ι: "A",

    //consonants
    б: "β",
    п: "β",
    в: "ν",
    ф: "ν",
    г: "γ",
    к: "γ",
    д: "δ",
    т: "δ",
    //ж: "η",
    //ш: "η",
    з: "ζ",
    с: "ζ",

    β: "C",
    ν: "C",
    γ: "C",
    δ: "C",
    η: "C",
    ζ: "C",

    л: "C",
    м: "C",
    н: "C",
    р: "C",

    ъ: "ъ",

    й: "s",
    ь: "s",

    s: "C",

    ж: "S",
    ш: "S",
    ч: "S",
    щ: "S",
    х: "S",
    ц: "S",

    S: "C"
}