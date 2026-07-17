/**
 * Hayat — Daily Dhikr v1 curated content.
 *
 * Quran items contain references only. Their Arabic text and Albanian
 * translation are loaded at runtime through the Quran Content Service.
 */

import { isValidSurahAyah } from './quran-surahs.js';

export const DAILY_DHIKR_CONTENT_VERSION = 2;
export const DAILY_DHIKR_REVIEW_STATUS = 'qualified-review-required';

var ROUTINE_FIELDS = ['id', 'titleSq', 'descriptionSq', 'reviewStatus', 'items'];
var QURAN_ITEM_FIELDS = [
  'id', 'type', 'titleSq', 'quranReference', 'repetitions', 'source', 'reviewStatus'
];
var TEXT_ITEM_FIELDS = [
  'id', 'type', 'titleSq', 'arabic', 'transliterationSq', 'translationSq',
  'repetitions', 'source', 'reviewStatus'
];
var QURAN_REFERENCE_FIELDS = ['surah', 'ayahStart', 'ayahEnd'];
var SOURCE_FIELDS = [
  'collection', 'reference', 'noteSq', 'sourceWork', 'sourceChapter',
  'sourcePages', 'sourceUrl', 'author', 'translator', 'religiousEditor',
  'languageEditor'
];
var ROUTINE_IDS = ['morning', 'evening', 'bedtime'];

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
  return Object.freeze(value);
}

var MBUROJA_SOURCE = Object.freeze({
  work: 'Mburoja e Muslimanit — Dhikri i Kuranit dhe Sunetit',
  url: 'https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.pdf',
  author: 'Seid el Kahtani',
  translator: 'Azem Bardhoshi',
  religiousEditor: 'Ismail Bardhoshi',
  languageEditor: 'Ilir E. Haxhiaj'
});

function source(collection, reference, noteSq, sourceChapter, sourcePages) {
  return {
    collection: collection,
    reference: reference,
    noteSq: noteSq,
    sourceWork: MBUROJA_SOURCE.work,
    sourceChapter: sourceChapter,
    sourcePages: sourcePages.slice(),
    sourceUrl: MBUROJA_SOURCE.url,
    author: MBUROJA_SOURCE.author,
    translator: MBUROJA_SOURCE.translator,
    religiousEditor: MBUROJA_SOURCE.religiousEditor,
    languageEditor: MBUROJA_SOURCE.languageEditor
  };
}

var ABU_DAWUD_5082 = source(
  'Sunan Abu Dawud',
  '5082 · Libri 43, Hadithi 310',
  'Numërtimi mund të ndryshojë sipas botimit.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [54, 55, 56]
);
var MUSLIM_2692 = source(
  'Sahih Muslim',
  '2692 · Libri 48, Hadithi 39',
  'Numërtimi mund të ndryshojë sipas botimit.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [64, 65]
);
var BUKHARI_2311 = source(
  'Sahih al-Bukhari',
  '2311 · Libri 40, Hadithi 11',
  'Numërtimi mund të ndryshojë sipas botimit.',
  '28 — Dhikri kur biem në gjumë',
  [69, 70]
);
var BUKHARI_5009 = source(
  'Sahih al-Bukhari',
  '5009 · Libri 66, Hadithi 31',
  'Hadithi përmend leximin gjatë natës. Numërtimi mund të ndryshojë sipas botimit.',
  '28 — Dhikri kur biem në gjumë',
  [70, 71]
);
var BUKHARI_6324 = source(
  'Sahih al-Bukhari',
  '6324 · Libri 80, Hadithi 21',
  'Numërtimi mund të ndryshojë sipas botimit.',
  '28 — Dhikri kur biem në gjumë',
  [72]
);
var BUKHARI_5362 = source(
  'Sahih al-Bukhari',
  '5362 · Libri 69, Hadithi 12',
  'Numërtimi mund të ndryshojë sipas botimit.',
  '28 — Dhikri kur biem në gjumë',
  [72, 73]
);

function quranItem(id, titleSq, surah, ayahStart, ayahEnd, repetitions, itemSource) {
  return {
    id: id,
    type: 'quran',
    titleSq: titleSq,
    quranReference: {
      surah: surah,
      ayahStart: ayahStart,
      ayahEnd: ayahEnd
    },
    repetitions: repetitions,
    source: itemSource,
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS
  };
}

function textItem(id, titleSq, arabic, transliterationSq, translationSq, repetitions, itemSource) {
  return {
    id: id,
    type: 'text',
    titleSq: titleSq,
    arabic: arabic,
    transliterationSq: transliterationSq,
    translationSq: translationSq,
    repetitions: repetitions,
    source: itemSource,
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS
  };
}

var routines = [
  {
    id: 'morning',
    titleSq: 'Dhikri i mëngjesit',
    descriptionSq: 'Përkujtimet e mëngjesit, për t’i lexuar me qetësi.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: [
      quranItem('morning_al_ikhlas', 'Sureja El-Ihlas', 112, 1, 4, 3, ABU_DAWUD_5082),
      quranItem('morning_al_falaq', 'Sureja El-Felek', 113, 1, 5, 3, ABU_DAWUD_5082),
      quranItem('morning_an_nas', 'Sureja En-Nas', 114, 1, 6, 3, ABU_DAWUD_5082),
      textItem(
        'morning_subhanallahi_wa_bihamdihi',
        'Subḥãnall-llãhi we biḥamdihi',
        'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        'Subḥãnall-llãhi we biḥamdihi',
        '(Them shprehjen e lartësimit se) Allahu është pa të meta dhe ngre lart lavdinë e Tij.',
        100,
        MUSLIM_2692
      )
    ]
  },
  {
    id: 'evening',
    titleSq: 'Dhikri i mbrëmjes',
    descriptionSq: 'Përkujtimet e mbrëmjes, për t’i lexuar me qetësi.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: [
      quranItem('evening_al_ikhlas', 'Sureja El-Ihlas', 112, 1, 4, 3, ABU_DAWUD_5082),
      quranItem('evening_al_falaq', 'Sureja El-Felek', 113, 1, 5, 3, ABU_DAWUD_5082),
      quranItem('evening_an_nas', 'Sureja En-Nas', 114, 1, 6, 3, ABU_DAWUD_5082),
      textItem(
        'evening_subhanallahi_wa_bihamdihi',
        'Subḥãnall-llãhi we biḥamdihi',
        'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        'Subḥãnall-llãhi we biḥamdihi',
        '(Them shprehjen e lartësimit se) Allahu është pa të meta dhe ngre lart lavdinë e Tij.',
        100,
        MUSLIM_2692
      )
    ]
  },
  {
    id: 'bedtime',
    titleSq: 'Dhikri para gjumit',
    descriptionSq: 'Përkujtimet dhe duatë para gjumit.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: [
      quranItem('bedtime_ayat_al_kursi', 'Ajetul Kursij', 2, 255, 255, 1, BUKHARI_2311),
      quranItem(
        'bedtime_last_two_al_baqarah',
        'Dy ajetet e fundit të El-Bekares',
        2,
        285,
        286,
        1,
        BUKHARI_5009
      ),
      textItem(
        'bedtime_bismika_allahumma',
        'Dua para gjumit',
        'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        'Bismikall-llãhumme emũtu we aḥjã',
        'Duke përmendur emrin Tënd, o Allah, vdes dhe jetoj!',
        1,
        BUKHARI_6324
      ),
      textItem(
        'bedtime_subhanallah_33',
        'Subḥãnall-llãh',
        'سُبْحَانَ اللَّهِ',
        'Subḥãnall-llãh',
        'I Lartësuar qoftë Allahu.',
        33,
        BUKHARI_5362
      ),
      textItem(
        'bedtime_alhamdulillah_33',
        'Elḥamdu lil-lãh',
        'الْحَمْدُ لِلَّهِ',
        'Elḥamdu lil-lãh',
        'Lavdia i takon Allahut.',
        33,
        BUKHARI_5362
      ),
      textItem(
        'bedtime_allahu_akbar_34',
        'All-llãhu Ekber',
        'اللَّهُ أَكْبَرُ',
        'All-llãhu Ekber',
        'Allahu është më i Madhi.',
        34,
        BUKHARI_5362
      )
    ]
  }
];

export const DAILY_DHIKR_ROUTINES = deepFreeze(routines);

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function hasOnlyFields(value, allowedFields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  var keys = Object.keys(value).sort();
  var allowed = allowedFields.slice().sort();
  return keys.length === allowed.length && keys.every(function (key, index) {
    return key === allowed[index];
  });
}

function validSource(value) {
  return hasOnlyFields(value, SOURCE_FIELDS) &&
    nonEmptyString(value.collection) && nonEmptyString(value.reference) &&
    typeof value.noteSq === 'string' && nonEmptyString(value.sourceWork) &&
    nonEmptyString(value.sourceChapter) && Array.isArray(value.sourcePages) &&
    value.sourcePages.length > 0 && value.sourcePages.every(function (page) {
      return Number.isInteger(page) && page >= 1 && page <= 148;
    }) && nonEmptyString(value.sourceUrl) &&
    nonEmptyString(value.author) && nonEmptyString(value.translator) &&
    nonEmptyString(value.religiousEditor) && nonEmptyString(value.languageEditor);
}

function validQuranReference(value) {
  return hasOnlyFields(value, QURAN_REFERENCE_FIELDS) &&
    Number.isInteger(value.surah) && Number.isInteger(value.ayahStart) &&
    Number.isInteger(value.ayahEnd) && value.ayahEnd >= value.ayahStart &&
    value.ayahEnd - value.ayahStart + 1 <= 20 &&
    isValidSurahAyah(value.surah, value.ayahStart) &&
    isValidSurahAyah(value.surah, value.ayahEnd);
}

export function validateDailyDhikrContent() {
  if (!Array.isArray(DAILY_DHIKR_ROUTINES) || DAILY_DHIKR_ROUTINES.length !== 3) return false;
  var routineIds = new Set();
  var itemIds = new Set();

  for (var i = 0; i < DAILY_DHIKR_ROUTINES.length; i += 1) {
    var routine = DAILY_DHIKR_ROUTINES[i];
    if (!hasOnlyFields(routine, ROUTINE_FIELDS) ||
        ROUTINE_IDS[i] !== routine.id || routineIds.has(routine.id) ||
        !nonEmptyString(routine.titleSq) || !nonEmptyString(routine.descriptionSq) ||
        routine.reviewStatus !== DAILY_DHIKR_REVIEW_STATUS ||
        !Array.isArray(routine.items) || !routine.items.length) return false;
    routineIds.add(routine.id);

    for (var j = 0; j < routine.items.length; j += 1) {
      var item = routine.items[j];
      var allowedFields = item && item.type === 'quran' ? QURAN_ITEM_FIELDS : TEXT_ITEM_FIELDS;
      if (!hasOnlyFields(item, allowedFields) ||
          ['quran', 'text'].indexOf(item.type) === -1 ||
          !nonEmptyString(item.id) || itemIds.has(item.id) ||
          !nonEmptyString(item.titleSq) ||
          !Number.isInteger(item.repetitions) || item.repetitions < 1 || item.repetitions > 100 ||
          !validSource(item.source) ||
          item.reviewStatus !== DAILY_DHIKR_REVIEW_STATUS) return false;
      itemIds.add(item.id);

      if (item.type === 'quran') {
        if (!validQuranReference(item.quranReference)) return false;
      } else if (!nonEmptyString(item.arabic) || !/[\u0600-\u06ff]/.test(item.arabic) ||
          !nonEmptyString(item.transliterationSq) || !nonEmptyString(item.translationSq)) {
        return false;
      }
    }
  }
  return routineIds.size === 3 && itemIds.size > 0;
}

export function getDailyDhikrRoutine(routineId) {
  if (typeof routineId !== 'string') return null;
  return DAILY_DHIKR_ROUTINES.find(function (routine) {
    return routine.id === routineId;
  }) || null;
}

export function getDailyDhikrItem(routineId, itemId) {
  var routine = getDailyDhikrRoutine(routineId);
  if (!routine || typeof itemId !== 'string') return null;
  return routine.items.find(function (item) { return item.id === itemId; }) || null;
}

if (!validateDailyDhikrContent()) {
  throw new Error('Daily Dhikr content failed validation');
}
