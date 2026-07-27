/**
 * Hayat — Mburoja e Muslimanit: Certified catalog.
 * Source: mburoja_e_muslimanit.json (certified)
 */

export const MBUROJA_CATALOG_VERSION = 2;
export const MBUROJA_REVIEW_STATUS = "qualified-review-required";

export const MBUROJA_CATEGORIES = Object.freeze([
  Object.freeze({ id: "mengjes-dhe-mbremje", titleSq: "Mëngjes dhe mbrëmje" }),
  Object.freeze({ id: "shtepia-dhe-familja", titleSq: "Shtëpia dhe familja" }),
  Object.freeze({ id: "udhetim", titleSq: "Udhëtim" }),
  Object.freeze({ id: "ushqim-dhe-pije", titleSq: "Ushqim dhe pije" }),
  Object.freeze({ id: "gezim-dhe-shqetesim", titleSq: "Gëzim dhe shqetësim" }),
  Object.freeze({ id: "namazi", titleSq: "Namazi" }),
  Object.freeze({ id: "falenderimi-ndaj-allahut", titleSq: "Falënderimi ndaj Allahut" }),
  Object.freeze({ id: "miresjellja", titleSq: "Mirësjellja" }),
  Object.freeze({ id: "haxh-dhe-umre", titleSq: "Haxh dhe Umre" }),
  Object.freeze({ id: "natyra", titleSq: "Natyra" }),
  Object.freeze({ id: "semundja-dhe-vdekja", titleSq: "Sëmundja dhe vdekja" })
]);

export const MBUROJA_CHAPTERS = Object.freeze([
  Object.freeze({ number: 1, titleSq: "KUR ZGJOHEMI", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 2, titleSq: "DHIKRI I MËNGJESIT", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 3, titleSq: "DHIKRI KUR BIEM NË GJUMË", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 4, titleSq: "DUAJA ME RASTIN E RROTULLIMIT NATËN", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 5, titleSq: "NËSE FRIKËSOHEMI NË GJUMË", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 6, titleSq: "NËSE SHOHIM ËNDËRR TË KEQE", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 7, titleSq: "DHIKRI I MBRËMJES", page: 0, categoryId: "mengjes-dhe-mbremje" }),
  Object.freeze({ number: 8, titleSq: "DUAJA KUR TË VESHIM RROBAT", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 9, titleSq: "DUAJA KUR TË VESHIM RROBA TË REJA", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 10, titleSq: "DUAJA PËR TJETRIN KUR VESH RROBA TË REJA", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 11, titleSq: "KUR E ZHVESHIM RROBËN", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 12, titleSq: "PARA SE TË HYJMË NË TUALET", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 13, titleSq: "PASI TË DALIM NË TUALET", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 14, titleSq: "KUR TË DALIM NGA SHTËPIA", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 15, titleSq: "KUR TË HYJMË NË SHTËPI", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 16, titleSq: "DUAJA PËR LARGIMIN E SHEJTANIT DHE VESVESEVE TË TIJ", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 17, titleSq: "DUAJA PËR TË POSAMARTUARIT", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 18, titleSq: "DUAJA PARA MARRDHËNIEVE INTIME", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 19, titleSq: "DUAJA E ATIJ QË FRIKËSOHET SE MOS PO MERR MËSYSH DIKË", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 20, titleSq: "ÇFARË THUHET PËR LARGIMIN E KURTHEVE TË SHEJTANIT", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 21, titleSq: "DISA PUNË TË MIRA DHE RREGULLA TË PËRGJITHSHME", page: 0, categoryId: "shtepia-dhe-familja" }),
  Object.freeze({ number: 22, titleSq: "DUAJA GJATË HIPJES NË MJETIN E UDHËTIMIT", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 23, titleSq: "DUAJA E UDHËTIMIT", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 24, titleSq: "DUAJA E HYRJES NË NDONJË FSHAT APO QYTET", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 25, titleSq: "DUAJA E HYRJES NË TREG", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 26, titleSq: "DUAJA KUR TË PENGOHET MJETI I UDHËTIMIT", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 27, titleSq: "DUAJA E UDHËTARIT PËR ATË QË NUK UDHËTON", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 28, titleSq: "DUAJA E ATIJ QË NUK UDHËTON PËR UDHËTARIN", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 29, titleSq: "TEKBIRI DHE TESBIHU GJATË UDHËTIMIT", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 30, titleSq: "DUAJA E UDHËTARIT PARA AGIMIT TË MËNGJESIT", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 31, titleSq: "DUAJA KUR TË NDALEMI NË NDONJË VEND, QOFTË NË UDHËTIM APO JO", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 32, titleSq: "DUAJA E KTHIMIT NGA UDHËTIMI", page: 0, categoryId: "udhetim" }),
  Object.freeze({ number: 33, titleSq: "DUAJA E AGJËRUESIT KUR BËN IFTAR", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 34, titleSq: "DUAJA PARA USHQIMIT", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 35, titleSq: "DUAJA PAS USHQIMIT", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 36, titleSq: "DUAJA E MYSAFIRIT PËR NIKOÇIRIN", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 37, titleSq: "DUAJA PËR ATË QË TË JEP USHQIM APO UJË", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 38, titleSq: "DUAJA KUR BËJMË IFTAR TEK NDONJË FAMILJE", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 39, titleSq: "DUAJA E AGJËRUESIT KUR I OFROHET USHQIMI DHE NUK HA", page: 0, categoryId: "ushqim-dhe-pije" }),
  Object.freeze({ number: 40, titleSq: "LUTJET NË RASTE TË BRENGOSJES DHE PIKËLLIMIT", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 41, titleSq: "KUR KEMI VËSHTIRËSI", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 42, titleSq: "KUR TAKOHEMI ME ARMIKUN OSE NJERËZIT ME POZITË", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 43, titleSq: "KUR KEMI FRIKË NGA DËMI I PUSHTETARIT", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 44, titleSq: "DUAJA KUNDËR ARMIKUT", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 45, titleSq: "KUR KEMI FRIKË NGA NJË GRUP I NJERËZVE", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 46, titleSq: "ÇFARË DUHET TË THOTË AI QË E KAPLON DYSHIMI NË BESIM", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 47, titleSq: "DUAJA E ATIJ QË ËSHTË NGARKUAR ME BORXHE", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 48, titleSq: "DUAJA ME RASTIN E FATKEQËSISË", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 49, titleSq: "DUAJA E FRIKËS NGA SHIRKU", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 50, titleSq: "DUAJA E URREJTJES TË PARASHIKIMIT", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 51, titleSq: "KUR TË MARRIM LAJM TË MIRË OSE TË KEQ", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 52, titleSq: "KUR DËGJOJMË NDONJË LAJM TË ÇUDITSHËM DHE TË GËZUESHËM", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 53, titleSq: "KUR TË MARRIM NDONJË LAJM TË MIRË", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 54, titleSq: "KUR FRIKËSOHEMI", page: 0, categoryId: "gezim-dhe-shqetesim" }),
  Object.freeze({ number: 55, titleSq: "KUR FILLOJMË ABDESIN", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 56, titleSq: "KUR MBAROJMË ABDESIN", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 57, titleSq: "GJATË RRUGËS PËR NË XHAMI", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 58, titleSq: "KUR TË HYJMË NË XHAMI", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 59, titleSq: "KUR TË DALIM NGA XHAMIA", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 60, titleSq: "DUAJA E EZANIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 61, titleSq: "DUAJA NË FILLIM TË NAMAZIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 62, titleSq: "DUATË NË RUKU", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 63, titleSq: "DUATË KUR NGRITEMI NGA RUKUJA", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 64, titleSq: "DUATË NË SEXHDE", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 65, titleSq: "DUAJA NË ULJEN MES DY SEXHDEVE", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 66, titleSq: "DUATË NË SEXHDE GJATË LEXIMIT TË KUR'ANIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 67, titleSq: "TESHEHUDI", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 68, titleSq: "SALAVATET PËR PEJGAMBERIN SAL-LALLAHU' ALEJHI UE SEL-EM PAS TESHEHUDIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 69, titleSq: "DUATË NË TESHEHUDIN E FUNDIT, PARA SELAMIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 70, titleSq: "DHIKRI PAS SELAMIT NË PËRFUNDIMIN E NAMAZIT FARZ", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 71, titleSq: "DUAJA E KUNUTIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 72, titleSq: "DHIKRI PAS SELAMIT NË NAMAZIT E VITRIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 73, titleSq: "DUAJA KUNDËR VESVESEVE NË NAMAZ DHE GJATË LEXIMIT TË KUR'ANIT", page: 0, categoryId: "namazi" }),
  Object.freeze({ number: 74, titleSq: "DUAJA E NAMAZIT ISTIHARE", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 75, titleSq: "DUAJA E ATIJ QË I VËSHTIRËSIOHET NDONJË ÇËSHTJE", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 76, titleSq: "KUR BËJMË NDONJË MËKAT", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 77, titleSq: "KUR TË NDODHË DIÇKA E PAPËLQYER APO E PAPRITUR", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 78, titleSq: "DHIKIR PËR MBROJTJEN NGA DEXHALLI", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 79, titleSq: "VLERA E SALAVATIT MBI PEJGAMBERIN SAL-LALLAHU 'ALEJHI UE SELEM", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 80, titleSq: "KËRKIMI I FALJES DHE PENDIMI", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 81, titleSq: "VLERA E DISA LUTJEVE", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 82, titleSq: "SI BËNTE TESBIH PEJGAMBERI SAL-LALLAHU 'ALEJHI UE SEL-LEM", page: 0, categoryId: "falenderimi-ndaj-allahut" }),
  Object.freeze({ number: 83, titleSq: "PËRGËZIMET PËR TË POSALINDURIT", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 84, titleSq: "PËRGJEGJIA E AGJËRUESIT NËSE OFENDOHET", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 85, titleSq: "DUAJA KUR TESHTIN", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 86, titleSq: "Ç'DUHET TË THEMI JOBESIMTARËVE KUR TESHTIJNË", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 87, titleSq: "DUAJA E DHËNDRRIT KUR MARTOHET OSE KUR BLEN KAFSHË", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 88, titleSq: "KUR TË HIDHËROHEMI", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 89, titleSq: "KUR TË SHOHIM NDONJË NJERI ME TË META", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 90, titleSq: "DHIKRI GJATË NDONJË TUBIMI", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 91, titleSq: "DUAJA PAS PËRFUNDIMIT TË TUBIMIT", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 92, titleSq: "PËRGJIGJA E DUASË PËR FALJEN E MËKATEVE", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 93, titleSq: "DUAJA PËR ATË I CILI TA BËN NDONJË TË MIRË", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 94, titleSq: "DUAJA PËR ATË QË TË THOTË QË TË DO PËR HIR TË ALLAHUT", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 95, titleSq: "DUAJA PËR ATË QË TË OFRON PASURI", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 96, titleSq: "DUAJA PËR ATË QË TA KTHEN BORXHIN", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 97, titleSq: "DUAJA PËR ATË QË TË THOTË ALLAHU TË BEKOFTË", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 98, titleSq: "VLERA E PËRHAPJES SË SELAMIT", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 99, titleSq: "SI DUHET KTHYER SELAMI JOBESIMTARËVE, NËSE JAPIN SELAM", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 100, titleSq: "DUAJA QË BËN PËR DIKË, QË MUND TA KESH OFENDUAR", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 101, titleSq: "ÇFARË DUHET TË THOTË MUSLIMANI KUR TA LAVDËROJË MUSLIMANIN", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 102, titleSq: "ÇFARË DUHET TË THOTË MUSLIMANI KUR E LAVDËRON DIKUSH", page: 0, categoryId: "miresjellja" }),
  Object.freeze({ number: 103, titleSq: "TELBIA PËR HAXHXH DHE UMRE", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 104, titleSq: "TEKBIRI KUR I AFROHEMI HAXHERUL ESVEDIT(GURIT TË ZI)", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 105, titleSq: "DUAJA NDËRMJET RUKNUL JEMANIT DHE HAXHERUL ESVEDIT", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 106, titleSq: "DUAJA E QËNDRIMIT MBI SAFFA DHE MERVE", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 107, titleSq: "DUAJA NË DITËN E ARAFATIT", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 108, titleSq: "DHIKRI TE MESH'AR EL-HARAAM", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 109, titleSq: "TEKBIRI GJATË GJUAJTJES SË GURËVE", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 110, titleSq: "ÇFARË DUHET THËNË ME RASTIN E THERRJES SË KAFSHËVE APO TË KURBANIT", page: 0, categoryId: "haxh-dhe-umre" }),
  Object.freeze({ number: 111, titleSq: "KUR TË FRYN ERA E FORTË", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 112, titleSq: "DUAJA KUR MURMURON", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 113, titleSq: "DUAJA PËR KËRKIMIN E SHIUT", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 114, titleSq: "DUAJA KUR TË BIE SHIU", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 115, titleSq: "DUAJA PASI TË BIE SHIU", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 116, titleSq: "DUAJA KUNDËR VËRSHIMIT", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 117, titleSq: "KUR TË SHIHET HËNA E RE", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 118, titleSq: "DUAJA KUR SHOHIM PEMËN E PARË TË POSAPJEKUR", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 119, titleSq: "Ç'DUHET THËNE KUR TË KËNDON GJELI DHE PËLLET GOMARI", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 120, titleSq: "Ç'DUHET THËNË KUR LEHIN QENTË NATËN", page: 0, categoryId: "natyra" }),
  Object.freeze({ number: 121, titleSq: "DUAJA PËR MBROJTEN E FËMIJËVE", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 122, titleSq: "LUTJA PËR TË SËMURIN KUR E VIZITOJMË", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 123, titleSq: "VLERA E VIZITËS TË TË SËMURIT", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 124, titleSq: "DUAJA PËR TË SËMURIN NË PRAG TË VDEKJES", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 125, titleSq: "PËRKUJTIMI I SHEHADETIT ATIJ QË ËSHTË NË PRAG TË VDEKJES", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 126, titleSq: "KUR TË VDES NDONJË NJERI", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 127, titleSq: "DUAJA PËR TË VDEKURIN GJATË NAMAZIT TË XHENAZES", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 128, titleSq: "DUAJA E XHENAZES PËR FËMIJË", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 129, titleSq: "DUAJA ME RASTIN E NGUSHËLLIMIT", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 130, titleSq: "DUAJA GJATË LËSHIMIT TË VDEKURIT NË VARR", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 131, titleSq: "DUAJA PAS VARROSJES SË TË VDEKURIT", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 132, titleSq: "DUAJA GJATË VITZITËS SË VARREZAVE", page: 0, categoryId: "semundja-dhe-vdekja" }),
  Object.freeze({ number: 133, titleSq: "KUR KEMI NDONJË DHEMBJE NË TRUP", page: 0, categoryId: "semundja-dhe-vdekja" })
]);

export function getMburojaChapter(number) {
  return MBUROJA_CHAPTERS.find(function(ch) { return ch.number === number; }) || null;
}

export function searchMburojaChapters(query, categoryId) {
  var q = (query || "").toLowerCase().trim();
  return MBUROJA_CHAPTERS.filter(function(ch) {
    if (categoryId && ch.categoryId !== categoryId) return false;
    if (!q) return true;
    return ch.titleSq.toLowerCase().indexOf(q) !== -1;
  });
}

export function validateMburojaCatalog() {
  return MBUROJA_CATEGORIES.length === 11 && MBUROJA_CHAPTERS.length === 133;
}

if (!validateMburojaCatalog()) {
  throw new Error("Mburoja catalog validation failed");
}