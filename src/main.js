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

rus.names = //#put dictToArray("dicts/names.txt", {format: "name"});

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
    ã: "ая",
    õ: "оё",
    ũ: "ую",
    ẽ: "эе",
    ĩ: "ыи",

    //consonant groups
    β: "бп",
    ν: "вф",
    γ: "гк",
    δ: "дт",
    ξ: "жш",
    ζ: "зс",

    //softeners
    s: "ьй"
};

//generalized groups (chained)
//TODO: pick groups so to minify form groups of words
rus.genGroups = {
    //sonants
    а: "ã",
    я: "ã",
    о: "õ",
    ё: "õ",
    у: "ũ",
    ю: "ũ",
    э: "ẽ",
    е: "ẽ",
    ы: "ĩ",
    и: "ĩ",

    ã: "V",
    õ: "V",
    ũ: "V",
    ẽ: "V",
    ĩ: "V",

    //consonants
    б: "β",
    п: "β",
    в: "ν",
    ф: "ν",
    г: "γ",
    к: "γ",
    д: "δ",
    т: "δ",
    //ж: "ξ",
    //ш: "ξ",
    з: "ζ",
    с: "ζ",

    β: "C",
    ν: "C",
    γ: "C",
    δ: "C",
    ξ: "C",
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

//#define patronimics = dictToArray("dicts/patronimics.txt");
//#if DEV
rus.patronimics = //#put patronimics;
//#endif

rus.patrNfSfx = //#put getEndingScheme(getNfDict(toLowerCaseList(patronimics), 0)); 
rus.patrMfSfx = //#put getEndingScheme(getNfDict(toLowerCaseList(patronimics), 1)); 
rus.patrFfSfx = //#put getEndingScheme(getNfDict(toLowerCaseList(patronimics), 2)); 


//Methods
rus.getForms = getForms;