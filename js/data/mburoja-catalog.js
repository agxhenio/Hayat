/**
 * Hayat — Validated catalog of the 132 chapters in “Mburoja e Muslimanit”.
 * Catalog metadata only; no dua text is stored here.
 */

export const MBUROJA_CATALOG_VERSION = 1;
export const MBUROJA_REVIEW_STATUS = 'qualified-review-required';

export const MBUROJA_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'daily', titleSq: 'Rutina ditore' }),
  Object.freeze({ id: 'home-mosque', titleSq: 'Shtëpia dhe xhamia' }),
  Object.freeze({ id: 'prayer', titleSq: 'Namazi' }),
  Object.freeze({ id: 'distress', titleSq: 'Ankthi, frika dhe sprovat' }),
  Object.freeze({ id: 'health-death', titleSq: 'Shëndeti, familja dhe vdekja' }),
  Object.freeze({ id: 'nature', titleSq: 'Moti dhe natyra' }),
  Object.freeze({ id: 'food-family', titleSq: 'Ushqimi, agjërimi dhe familja' }),
  Object.freeze({ id: 'social-protection', titleSq: 'Marrëdhëniet dhe mbrojtja' }),
  Object.freeze({ id: 'travel', titleSq: 'Udhëtimi' }),
  Object.freeze({ id: 'social', titleSq: 'Sjellja dhe marrëdhëniet' }),
  Object.freeze({ id: 'hajj-umrah', titleSq: 'Haxhi dhe Umra' }),
  Object.freeze({ id: 'protection', titleSq: 'Mbrojtja dhe shërimi' }),
  Object.freeze({ id: 'remembrance', titleSq: 'Pendimi dhe përkujtimi' })
]);

var RAW_CHAPTERS = [
  { number: 1, titleSq: "DHIKRI SAPO ZGJOHEMI NGA GJUMI", page: 11, categoryId: "daily" },
  { number: 2, titleSq: "KUR VESH RROBËN", page: 14, categoryId: "daily" },
  { number: 3, titleSq: "KUR VESH NJË RROBË TË RE", page: 14, categoryId: "daily" },
  { number: 4, titleSq: "LUTJA PËR DIKË TJETËR, QË KA VESHUR NJË RROBË TË RE", page: 15, categoryId: "daily" },
  { number: 5, titleSq: "KUR ZHVESH RROBAT", page: 15, categoryId: "daily" },
  { number: 6, titleSq: "KUR HYN NË TUALET", page: 16, categoryId: "daily" },
  { number: 7, titleSq: "KUR DEL NGA TUALETI", page: 16, categoryId: "daily" },
  { number: 8, titleSq: "DHIKRI PARA SE TË MARRËSH ABDES", page: 17, categoryId: "daily" },
  { number: 9, titleSq: "DHIKRI PAS MBARIMIT TË ABDESIT", page: 17, categoryId: "daily" },
  { number: 10, titleSq: "DHIKRI KUR DEL NGA SHTËPIA", page: 18, categoryId: "home-mosque" },
  { number: 11, titleSq: "DHIKRI KUR HYJMË NË SHTËPI", page: 18, categoryId: "home-mosque" },
  { number: 12, titleSq: "LUTJA QË THUHET KUR SHKON NË XHAMI", page: 19, categoryId: "home-mosque" },
  { number: 13, titleSq: "KUR HYJMË NË XHAMI", page: 21, categoryId: "home-mosque" },
  { number: 14, titleSq: "KUR DALIM NGA XHAMIA", page: 21, categoryId: "home-mosque" },
  { number: 15, titleSq: "KUR THIRRET EZANI", page: 22, categoryId: "prayer" },
  { number: 16, titleSq: "LUTJA PAS TEKBIRIT FILLESTAR, KUR HAPIM NAMAZIN", page: 24, categoryId: "prayer" },
  { number: 17, titleSq: "LUTJET NË RUKU", page: 30, categoryId: "prayer" },
  { number: 18, titleSq: "KUR NGRIHEMI NGA RUKUJA E NAMAZIT", page: 31, categoryId: "prayer" },
  { number: 19, titleSq: "LUTJET NË SEXHDE", page: 33, categoryId: "prayer" },
  { number: 20, titleSq: "LUTJA NË ULJEN NDËRMJET DY SEXHDEVE", page: 35, categoryId: "prayer" },
  { number: 21, titleSq: "LUTJET QË BËHEN NË SEXHDEN E LEXIMIT TË KURANIT", page: 36, categoryId: "prayer" },
  { number: 22, titleSq: "TEHIJATI GJATË TË NDENJURIT ULUR NË NAMAZ", page: 37, categoryId: "prayer" },
  { number: 23, titleSq: "SALAVATET PËR PROFETIN ﷺ PAS TEHIJATIT", page: 38, categoryId: "prayer" },
  { number: 24, titleSq: "LUTJA NË ULJEN E FUNDIT PARA SELAMIT", page: 39, categoryId: "prayer" },
  { number: 25, titleSq: "DHIKRI PAS SELAMIT", page: 45, categoryId: "prayer" },
  { number: 26, titleSq: "LUTJA E NAMAZIT TË ISTIHARES", page: 51, categoryId: "prayer" },
  { number: 27, titleSq: "DHIKRI I MËNGJESIT DHE I MBRËMJES", page: 53, categoryId: "prayer" },
  { number: 28, titleSq: "DHIKRI KUR BIEM NË GJUMË", page: 67, categoryId: "prayer" },
  { number: 29, titleSq: "NATËN, KUR LËVIZ NË SHTRAT NGA NJË ANË NË TJETRËN", page: 76, categoryId: "prayer" },
  { number: 30, titleSq: "KUR TREMBEMI NË GJUMË OSE KUR KEMI FRIKË NGA VETMIA", page: 76, categoryId: "prayer" },
  { number: 31, titleSq: "KUR SHEH ËNDËRR TË KEQE", page: 77, categoryId: "prayer" },
  { number: 32, titleSq: "LUTJA E KUNUT-IT NË NAMAZIN E VITRIT", page: 77, categoryId: "prayer" },
  { number: 33, titleSq: "DHIKRI PAS SELAMIT NË NAMAZIN E VITRIT", page: 79, categoryId: "prayer" },
  { number: 34, titleSq: "LUTJA PËR LARGIMIN E ANKTHIT DHE TRISHTIMIT", page: 80, categoryId: "distress" },
  { number: 35, titleSq: "LUTJA KUR JEMI NË GJENDJE SPROVE DHE MUNDIMI", page: 82, categoryId: "distress" },
  { number: 36, titleSq: "LUTJA QË THEMI KUR PËRBALLEMI ME ARMIKUN DHE ME NJERIUN ME PUSHTET", page: 83, categoryId: "distress" },
  { number: 37, titleSq: "KUR KEMI FRIKË NGA ZULLUMI I SUNDIMTARIT", page: 84, categoryId: "distress" },
  { number: 38, titleSq: "LUTJA KUNDËR ARMIKUT", page: 86, categoryId: "distress" },
  { number: 39, titleSq: "KUR KEMI FRIKË PREJ NJË GRUP NJERËZISH", page: 86, categoryId: "distress" },
  { number: 40, titleSq: "KUR VUAJMË NGA NGACMIMI I DYSHIMIT NË BESIM", page: 86, categoryId: "distress" },
  { number: 41, titleSq: "LUTJA PËR SHLYERJEN E BORXHEVE", page: 87, categoryId: "distress" },
  { number: 42, titleSq: "KUR KEMI NGACMIME NGA SHEJTANI NË NAMAZ DHE GJATË LEXIMIT TË KURANIT", page: 88, categoryId: "distress" },
  { number: 43, titleSq: "KUR NA VËSHTIRËSOHEN ÇËSHTJET", page: 88, categoryId: "distress" },
  { number: 44, titleSq: "KUR DIKUSH BËN NDONJË GJYNAH", page: 89, categoryId: "distress" },
  { number: 45, titleSq: "PËR LARGIMIN E SHEJTANIT DHE VESVESEVE (NGACMIMEVE) TË TIJ", page: 89, categoryId: "distress" },
  { number: 46, titleSq: "KUR NDODH DIÇKA QË NUK TË PËLQEN OSE KUR JE NË KUSHTE PAMUNDËSIE", page: 90, categoryId: "distress" },
  { number: 47, titleSq: "URIMI PËR LINDJEN E NJË FËMIJE DHE PËRGJIGJJA", page: 90, categoryId: "health-death" },
  { number: 48, titleSq: "LUTJA PËR MBROJTJEN E FËMIJËVE", page: 91, categoryId: "health-death" },
  { number: 49, titleSq: "KUR VIZITOJMË TË SËMURIN", page: 91, categoryId: "health-death" },
  { number: 50, titleSq: "VLERA E VIZITËS SË TË SËMURIT", page: 92, categoryId: "health-death" },
  { number: 51, titleSq: "LUTJA E TË SËMURIT QË NUK KA MË SHPRESË PËR JETËN", page: 92, categoryId: "health-death" },
  { number: 52, titleSq: "TELKINI PËR NJERIUN NË PRAG TË VDEKJES", page: 94, categoryId: "health-death" },
  { number: 53, titleSq: "KUR DIKUJT I BIE NDONJË FATKEQËSI", page: 94, categoryId: "health-death" },
  { number: 54, titleSq: "KUR I MBYLL SYTË TË PORSAVDEKURIT", page: 94, categoryId: "health-death" },
  { number: 55, titleSq: "LUTJA PËR TË VDEKURIN NË NAMAZIN E XHENAZES", page: 95, categoryId: "health-death" },
  { number: 56, titleSq: "LUTJA QË BËHET PËR FËMIJËN E VDEKUR, KUR I FALET NAMAZI I XHENAZES", page: 97, categoryId: "health-death" },
  { number: 57, titleSq: "LUTJA E NGUSHËLLIMIT", page: 99, categoryId: "health-death" },
  { number: 58, titleSq: "KUR I VDEKURI VENDOSET NË VARR", page: 100, categoryId: "health-death" },
  { number: 59, titleSq: "PAS VARRIMIT", page: 101, categoryId: "health-death" },
  { number: 60, titleSq: "KUR VIZITOJMË VARREZAT", page: 101, categoryId: "health-death" },
  { number: 61, titleSq: "KUR FRYN ERË", page: 102, categoryId: "nature" },
  { number: 62, titleSq: "KUR GJËMON", page: 102, categoryId: "nature" },
  { number: 63, titleSq: "LUTJET PËR TË RËNË SHI 103 (LUTJA E ISTISKASË)", page: 103, categoryId: "nature" },
  { number: 64, titleSq: "KUR BIE SHI", page: 104, categoryId: "nature" },
  { number: 65, titleSq: "PAS RESHJEVE TË SHIUT", page: 104, categoryId: "nature" },
  { number: 66, titleSq: "LUTJET PËR KTHJELLIMIN E MOTIT", page: 104, categoryId: "nature" },
  { number: 67, titleSq: "KUR SHOHIM HËNËZËN E RE", page: 105, categoryId: "nature" },
  { number: 68, titleSq: "KUR ÇELIM IFTAR", page: 105, categoryId: "food-family" },
  { number: 69, titleSq: "PARA USHQIMIT", page: 106, categoryId: "food-family" },
  { number: 70, titleSq: "PAS NGRËNIES SË USHQIMIT", page: 107, categoryId: "food-family" },
  { number: 71, titleSq: "LUTJA QË BËN MIKU PËR TË ZOTIN E USHQIMIT", page: 108, categoryId: "food-family" },
  { number: 72, titleSq: "KËRKIMI I USHQIMIT OSE PIJES, TËRTHORAZI, NËPËRMJET LUTJES", page: 108, categoryId: "food-family" },
  { number: 73, titleSq: "KUR ÇELIM IFTARIN SI TË FTUAR", page: 109, categoryId: "food-family" },
  { number: 74, titleSq: "LUTJA QË BËN AGJËRUESI, NËSE NUK E PRISH AGJËRIMIN, KUR E FTOJNË PËR TË NGRËNË", page: 109, categoryId: "food-family" },
  { number: 75, titleSq: "PËRGJIGJJA QË JEP AGJËRUESI KUR DIKUSH E FYEN", page: 109, categoryId: "food-family" },
  { number: 76, titleSq: "KUR SHOHIM FRUTAT E PARA TË PJEKURA", page: 110, categoryId: "food-family" },
  { number: 77, titleSq: "KUR TESHTIJMË", page: 110, categoryId: "food-family" },
  { number: 78, titleSq: "KUR NJË JOBESIMTAR TESHTIN DHE TH OTË ‘ELḤAMDU LIL-LÃH!’", page: 111, categoryId: "food-family" },
  { number: 79, titleSq: "LUTJA PËR TË SAPOMARTUARIN", page: 111, categoryId: "food-family" },
  { number: 80, titleSq: "LUTJA QË BËN I PORSAMARTUARI PËR VETVETEN, DHE LUTJA QË BËHET NË RASTIN E BLERJES SË KAFSHËS", page: 112, categoryId: "food-family" },
  { number: 81, titleSq: "LUTJA PËRPARA SE TË KRYHEN MARRËDHËNIE INTIME", page: 112, categoryId: "food-family" },
  { number: 82, titleSq: "KUR NEVRIKOSEMI", page: 113, categoryId: "social-protection" },
  { number: 83, titleSq: "KUR SHOHIM NJË PERSON TË SPROVUAR ME SËMUNDJE, TË METË FIZIKE A MENDORE, GJYMTIM OSE GJYNAH", page: 113, categoryId: "social-protection" },
  { number: 84, titleSq: "GJATË KUVENDIT", page: 113, categoryId: "social-protection" },
  { number: 85, titleSq: "LUTJA PËR SHLYERJEN E GJYNAHEVE , KUR MBARON TAKIMI A KUVENDI", page: 114, categoryId: "social-protection" },
  { number: 86, titleSq: "KUR DIKUSH TË THOTË: “ALLAHU TË FALTË”", page: 114, categoryId: "social-protection" },
  { number: 87, titleSq: "LUTJA PËR DIKË, QË TË BËN NDONJË TË MIRË", page: 114, categoryId: "social-protection" },
  { number: 88, titleSq: "PËR TË NA RUAJTUR ALLAHU PREJ DEXHALIT", page: 115, categoryId: "social-protection" },
  { number: 89, titleSq: "PËR DIKË, QË TË THOTË «INNĨ UḤIBUKE FIL-LAH – TË DUA PËR HIR TË ALLAHUT»", page: 115, categoryId: "social-protection" },
  { number: 90, titleSq: "PËR DIKË, QË DËSHIRON TË TË FALË PASURI", page: 115, categoryId: "social-protection" },
  { number: 91, titleSq: "KUR I KTHEJMË BORXHIN HUADHËNËSIT", page: 116, categoryId: "social-protection" },
  { number: 92, titleSq: "LUTJA E FRIKËS NGA SHIRKU", page: 116, categoryId: "social-protection" },
  { number: 93, titleSq: "LUTJA PËR DIKË, QË TË THOTË: “BÃRAKALL-LLÃHU FĨKE – ALLAHU TË BEGATOFTË”", page: 116, categoryId: "social-protection" },
  { number: 94, titleSq: "KUR PARANDJEN DIÇKA TË URRYER NGA NJË SHENJË BESËTYTNORE (OGURZEZË)", page: 117, categoryId: "social-protection" },
  { number: 95, titleSq: "LUTJA KUR HIPIM NË MJETIN E UDHËTIMIT", page: 117, categoryId: "travel" },
  { number: 96, titleSq: "LUTJA E UDHËTIMIT", page: 118, categoryId: "travel" },
  { number: 97, titleSq: "LUTJA KUR HYJMË NË NJË QYTET OSE VENDBANIM", page: 119, categoryId: "travel" },
  { number: 98, titleSq: "LUTJA KUR HYJMË NË TREG", page: 120, categoryId: "travel" },
  { number: 99, titleSq: "KUR KAFSHA E UDHËTIMIT PENGOHET", page: 121, categoryId: "travel" },
  { number: 100, titleSq: "LUTJA E UDHËTARIT PËR NJERËZIT, KUR NDAHET ME TA PËR UDHËTIM", page: 121, categoryId: "travel" },
  { number: 101, titleSq: "LUTJA PËR UDHËTARIN KUR NISET PËR UDHËTIM", page: 121, categoryId: "travel" },
  { number: 102, titleSq: "THËNIA ALLÃHU EKBER DHE SUBḤÃN-ALLÃH GJATË ECJES NË UDHËTIM", page: 122, categoryId: "travel" },
  { number: 103, titleSq: "LUTJA QË BËN UDHËTARI NGA FUNDI I NATËS, PAK PARA AGIMIT", page: 122, categoryId: "travel" },
  { number: 104, titleSq: "LUTJA KUR QËNDROJMË DIKU NË NJË VEND, QOFSHIM UDHËTARË APO JO", page: 123, categoryId: "travel" },
  { number: 105, titleSq: "DHIKRI GJATË KTHIMIT NGA UDHËTIMI", page: 123, categoryId: "travel" },
  { number: 106, titleSq: "KUR NA VJEN DIÇKA QË NA GËZON OSE DIÇKA QË NUK NA PËLQEN", page: 124, categoryId: "travel" },
  { number: 107, titleSq: "MIRËSIA QË KEMI, KUR BËJMË ‘SALAVAT’ PËR PEJGAMBERIN ﷺ", page: 125, categoryId: "social" },
  { number: 108, titleSq: "PËRSHËNDETJA ME SELAM", page: 126, categoryId: "social" },
  { number: 109, titleSq: "KUR NJË JOMUSLIMAN NA JEP SELAM", page: 126, categoryId: "social" },
  { number: 110, titleSq: "KUR DËGJON KËNDIMIN E GJELIT DHE PËLLITJEN E GOMARIT127", page: 127, categoryId: "social" },
  { number: 111, titleSq: "LUTJA KUR DËGJOJMË QENTË DUKE LEHUR NATËN", page: 127, categoryId: "social" },
  { number: 112, titleSq: "LUTJA QË BËN PËR DIKË, QË MUND TA KESH OFENDUAR", page: 128, categoryId: "social" },
  { number: 113, titleSq: "FJALËT QË DUHET TË THUASH KUR LAVDËRON NJË MUSLIMAN", page: 128, categoryId: "social" },
  { number: 114, titleSq: "LUTJA QË BËN MUSLIMANI KUR DIKUSH E LAVDËRON", page: 129, categoryId: "social" },
  { number: 115, titleSq: "SI BËJMË TELBIJE KUR JEMI NË GJENDJE IHRAMI PËR HAXH OSE UMRE", page: 129, categoryId: "hajj-umrah" },
  { number: 116, titleSq: "KUR FILLON TAVAFIN TEK KËNDI I GURIT TË ZI, DHE SA HERË QË FILLON XHIROT E TAVAFIT ATY, BËN TEKBIRE", page: 130, categoryId: "hajj-umrah" },
  { number: 117, titleSq: "LUTJA KUR KALON MES KËNDIT TË JEMENIT DHE GURIT TË ZI130", page: 130, categoryId: "hajj-umrah" },
  { number: 118, titleSq: "LUTJA KUR QËNDRON MBI SAFA DHE MBI MERVE", page: 130, categoryId: "hajj-umrah" },
  { number: 119, titleSq: "LUTJA E DITËS SË ARAFATIT", page: 132, categoryId: "hajj-umrah" },
  { number: 120, titleSq: "DHIKRI QË BËHET NË MESH’AR EL HARAM", page: 132, categoryId: "hajj-umrah" },
  { number: 121, titleSq: "KUR HEDHIM GURËT TEK XHEMERAT-ËT, ÇDO GUR E SHOQËROJMË ME TEKBIR", page: 133, categoryId: "hajj-umrah" },
  { number: 122, titleSq: "KUR SHPREHIM HABI DHE KUR DIÇKA NA GËZON", page: 133, categoryId: "protection" },
  { number: 123, titleSq: "KUR NA VJEN NJË LAJM I GËZUESHËM", page: 133, categoryId: "protection" },
  { number: 124, titleSq: "KUR NDIEN DHIMBJE NË TRUP", page: 134, categoryId: "protection" },
  { number: 125, titleSq: "KUR NDONJËRI KA FRIKË SE MERR DIÇKA MËSYSH", page: 134, categoryId: "protection" },
  { number: 126, titleSq: "KUR TREMBEMI NGA DIÇKA", page: 135, categoryId: "protection" },
  { number: 127, titleSq: "KUR THERIM NJË BAGËTI", page: 135, categoryId: "protection" },
  { number: 128, titleSq: "LUTJA QË THUHET PËR LARGIMIN E KURTHIT TË SHEJTANËVE MË TË KËQIJ", page: 135, categoryId: "protection" },
  { number: 129, titleSq: "KËRKIMI I FALJES (ISTIGFARI) DHE PENDIMI (TEUBEJA)", page: 136, categoryId: "remembrance" },
  { number: 130, titleSq: "MIRËSIA QË KEMI KUR THEMI:", page: 138, categoryId: "remembrance" },
  { number: 131, titleSq: "SI E BËNTE DHIKRIN I DËRGUARI I ALLAHUT ﷺ", page: 141, categoryId: "remembrance" },
  { number: 132, titleSq: "DISA NORMA QË PËRFSHIJNË TË MIRAT E DYNJASË DHE TË AHIRETIT", page: 142, categoryId: "remembrance" }
];

export const MBUROJA_CHAPTERS = Object.freeze(RAW_CHAPTERS.map(function (chapter) {
  return Object.freeze(Object.assign({}, chapter, {
    id: 'mburoja-' + String(chapter.number).padStart(3, '0'),
    reviewStatus: MBUROJA_REVIEW_STATUS
  }));
}));

var BY_NUMBER = new Map(MBUROJA_CHAPTERS.map(function (chapter) { return [chapter.number, chapter]; }));

function normalize(value) {
  return String(value || '').toLocaleLowerCase('sq').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9çë]+/g, ' ').trim();
}

export function getMburojaChapter(number) {
  var value = typeof number === 'string' && /^\d+$/.test(number) ? Number(number) : number;
  return Number.isInteger(value) ? (BY_NUMBER.get(value) || null) : null;
}

export function searchMburojaChapters(query, categoryId) {
  var needle = normalize(query);
  return MBUROJA_CHAPTERS.filter(function (chapter) {
    return (!categoryId || chapter.categoryId === categoryId) &&
      (!needle || normalize(chapter.number + ' ' + chapter.titleSq).indexOf(needle) !== -1);
  });
}

export function validateMburojaCatalog() {
  var categoryIds = new Set(MBUROJA_CATEGORIES.map(function (category) { return category.id; }));
  return MBUROJA_CHAPTERS.length === 132 && BY_NUMBER.size === 132 &&
    MBUROJA_CHAPTERS.every(function (chapter, index) {
      return chapter.number === index + 1 && chapter.id === 'mburoja-' + String(index + 1).padStart(3, '0') &&
        typeof chapter.titleSq === 'string' && Boolean(chapter.titleSq.trim()) &&
        Number.isInteger(chapter.page) && chapter.page >= 11 && chapter.page <= 142 &&
        categoryIds.has(chapter.categoryId) && chapter.reviewStatus === MBUROJA_REVIEW_STATUS &&
        Object.isFrozen(chapter);
    });
}

if (!validateMburojaCatalog()) throw new Error('Mburoja catalog failed validation');
