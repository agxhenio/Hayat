/**
 * Hayat — Albanian-readable Quran transliteration and translation references used in Dhikr.
 *
 * This module contains transliteration for all referenced verses and
 * Albanian translation for surahs 112, 113, 114 from Mburoja e Muslimanit.
 * Arabic remains provider-backed through QuranEnc.
 */

export const QURAN_TRANSLITERATION_SQ_VERSION = 1;
export const QURAN_TRANSLITERATION_REVIEW_STATUS = 'qualified-review-required';

var SOURCE = Object.freeze({
  work: 'Mburoja e Muslimanit — Dhikri i Kuranit dhe Sunetit',
  url: 'https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.pdf',
  author: 'Seid el Kahtani',
  translator: 'Azem Bardhoshi',
  religiousEditor: 'Ismail Bardhoshi'
});

var RAW_ENTRIES = [
  {
    verseKey: '2:255',
    transliterationSq: 'All-llãhu lã ilãhe il-lã huwel Ḥajjul Ḳajjũm. Lã te’ḣudhuhu sinetun we lã newm. Lehu mã fis-semãwãti we mã fil erḍ. Men dhel-ledhĩ jeshfe’u ‘indehu il-lã bi idhnihi. Ja’ëlemu mã bejne ejdĩhim we mã ḣalfehum, we lã juḥĩṭũne bi shej’in min ‘ilmihi il-lã bimã shãe. Wesi’a kursijjuhus-semãwãti wel erḍa, we lã je’ũduhu ḥifḍhuhumã we huwel ‘Alijjul ‘Aḍhĩm.',
    sourcePages: [53, 54, 69, 70]
  },
  {
    verseKey: '2:285',
    transliterationSq: 'Ãmenerr-rrasũlu bimã unzile ilejhi mirr-rrabbihi wel mu’minũn. Kul-lun ãmene bil-lãhi we melãiketihi we kutubihi we rusulihi, lã nuferr-rriḳu bejne eḥadin-mirr-rrusulih. We ḳãlũ semi’ënã we eṭa’ënã, ġufrãneke rabbenã we ilejkel meṣĩr.',
    sourcePages: [70]
  },
  {
    verseKey: '2:286',
    transliterationSq: 'Lã jukel-lifull-llãhu nefsen il-lã wus’ahã, lehã mã kesebet we ‘alejhã mektesebet. Rabbenã lã tu’ãḣidhnã in nesĩnã ew eḣta’nã. Rabbenã we lã taḥmil ‘alejnã iṣran kemã ḥameltehũ ‘alel-ledhĩne min ḳablinã. Rabbenã we lã tuḥammilnã mã lã ṭãḳate lenã bihi, wa’ëfu ‘annã weġfir lenã werḥamnã. Ente mewlãnã fenṣurnã ‘alel ḳawmil kãfirĩn.',
    sourcePages: [70]
  },
  { verseKey: '112:1', transliterationSq: 'Ḳul huwall-llãhu eḥad.', translationSq: 'Thuaj: "Ai është Allahu, Një dhe i Vetëm!', sourcePages: [55, 68] },
  { verseKey: '112:2', transliterationSq: 'All-llãhuṣ-Ṣamed.', translationSq: 'Allahu është Absoluti, të Cilit i përgjërohet gjithçka në amshim.', sourcePages: [55, 68] },
  { verseKey: '112:3', transliterationSq: 'Lem jelid we lem jũled.', translationSq: 'Ai as nuk lind, as nuk është i lindur.', sourcePages: [55, 68] },
  { verseKey: '112:4', transliterationSq: 'We lem jekun lehũ kufuwen eḥad.', translationSq: 'Dhe askush nuk është i barabartë (a i krahasueshëm) me Atë!"', sourcePages: [55, 68] },
  { verseKey: '113:1', transliterationSq: 'Ḳul e’ũdhu bi rabbil feleḳ.', translationSq: 'Thuaj: "Kërkoj mbështetje te Zoti i agimit,', sourcePages: [55, 68] },
  { verseKey: '113:2', transliterationSq: 'Min sherri mã ḣaleḳ.', translationSq: 'që të më mbrojë nga sherri i gjithçkaje që Ai ka krijuar', sourcePages: [55, 68] },
  { verseKey: '113:3', transliterationSq: 'We min sherri ġãsiḳin idhã weḳab.', translationSq: 'dhe nga sherri i natës, kur kaplon terri', sourcePages: [55, 68] },
  { verseKey: '113:4', transliterationSq: 'We min sherrin-neffãthãti fil ‘uḳad.', translationSq: 'dhe nga sherri i falltarëve, që fryjnë në nyje (duke bërë magji)', sourcePages: [55, 68] },
  { verseKey: '113:5', transliterationSq: 'We min sherri ḥãsidin idhã ḥased.', translationSq: 'dhe nga sherri i smirëziut, kur vepron me smirë."', sourcePages: [55, 68] },
  { verseKey: '114:1', transliterationSq: 'Ḳul e’ũdhu bi rabbin-nãs.', translationSq: 'Thuaj: "Kërkoj mbështetje te Zoti i njerëzve,', sourcePages: [55, 68] },
  { verseKey: '114:2', transliterationSq: 'Melikin-nãs.', translationSq: 'Sundimtari i njerëzve,', sourcePages: [55, 68] },
  { verseKey: '114:3', transliterationSq: 'Ilãhin-nãs.', translationSq: 'i Adhuruari (i vetëm me të drejtë) i njerëzve,', sourcePages: [55, 68] },
  { verseKey: '114:4', transliterationSq: 'Min sherril weswãsil ḣan-nãs.', translationSq: 'nga sherri i djallit cytës që fshihet (pas qyt)', sourcePages: [56, 69] },
  { verseKey: '114:5', transliterationSq: 'El-ledhĩ juweswisu fĩ ṣudũrin-nãs.', translationSq: 'e që hedh dyshime në gjokset e njerëzve,', sourcePages: [56, 69] },
  { verseKey: '114:6', transliterationSq: 'Minel xhinneti wen-nãs.', translationSq: '(qoftë ai djall) prej xhindeve apo njerëzve!"', sourcePages: [56, 69] }
];

function freezeEntry(entry) {
  var frozen = {
    verseKey: entry.verseKey,
    transliterationSq: entry.transliterationSq,
    sourcePages: Object.freeze(entry.sourcePages.slice()),
    sourceWork: SOURCE.work,
    sourceUrl: SOURCE.url,
    author: SOURCE.author,
    translator: SOURCE.translator,
    religiousEditor: SOURCE.religiousEditor,
    reviewStatus: QURAN_TRANSLITERATION_REVIEW_STATUS
  };
  if (entry.translationSq) {
    frozen.translationSq = entry.translationSq;
  }
  return Object.freeze(frozen);
}

export const QURAN_TRANSLITERATIONS_SQ = Object.freeze(RAW_ENTRIES.map(freezeEntry));

var BY_VERSE_KEY = new Map(QURAN_TRANSLITERATIONS_SQ.map(function (entry) {
  return [entry.verseKey, entry];
}));

export function validateQuranTransliterationsSq() {
  if (QURAN_TRANSLITERATIONS_SQ.length !== 18 || BY_VERSE_KEY.size !== 18) return false;
  return QURAN_TRANSLITERATIONS_SQ.every(function (entry) {
    return /^\d{1,3}:\d{1,3}$/.test(entry.verseKey) &&
      typeof entry.transliterationSq === 'string' && Boolean(entry.transliterationSq.trim()) &&
      Array.isArray(entry.sourcePages) && entry.sourcePages.length > 0 &&
      entry.sourcePages.every(function (page) {
        return Number.isInteger(page) && page >= 1 && page <= 148;
      }) && entry.sourceWork === SOURCE.work && entry.sourceUrl === SOURCE.url &&
      entry.translator === SOURCE.translator &&
      entry.reviewStatus === QURAN_TRANSLITERATION_REVIEW_STATUS &&
      Object.isFrozen(entry) && Object.isFrozen(entry.sourcePages);
  });
}

export function getQuranTransliterationSq(verseKey) {
  return typeof verseKey === 'string' ? (BY_VERSE_KEY.get(verseKey) || null) : null;
}

export function getQuranTranslationSq(verseKey) {
  if (typeof verseKey !== 'string') return null;
  var entry = BY_VERSE_KEY.get(verseKey);
  return entry && entry.translationSq ? entry.translationSq : null;
}

if (!validateQuranTransliterationsSq()) {
  throw new Error('Quran transliteration data failed validation');
}
