/**
 * Hayat — Static Quran surah metadata.
 *
 * Contains navigation metadata only. Quran verse text remains provider-backed.
 */

var RAW_SURAHS = [
  { number: 1, nameArabic: 'الفاتحة', nameTransliteration: 'El-Fatiha', ayahCount: 7, revelationType: 'meccan' },
  { number: 2, nameArabic: 'البقرة', nameTransliteration: 'El-Bekare', ayahCount: 286, revelationType: 'medinan' },
  { number: 3, nameArabic: 'آل عمران', nameTransliteration: 'Ali Imran', ayahCount: 200, revelationType: 'medinan' },
  { number: 4, nameArabic: 'النساء', nameTransliteration: 'En-Nisa', ayahCount: 176, revelationType: 'medinan' },
  { number: 5, nameArabic: 'المائدة', nameTransliteration: 'El-Maide', ayahCount: 120, revelationType: 'medinan' },
  { number: 6, nameArabic: 'الأنعام', nameTransliteration: "El-En'am", ayahCount: 165, revelationType: 'meccan' },
  { number: 7, nameArabic: 'الأعراف', nameTransliteration: "El-A'raf", ayahCount: 206, revelationType: 'meccan' },
  { number: 8, nameArabic: 'الأنفال', nameTransliteration: 'El-Enfal', ayahCount: 75, revelationType: 'medinan' },
  { number: 9, nameArabic: 'التوبة', nameTransliteration: 'Et-Teube', ayahCount: 129, revelationType: 'medinan' },
  { number: 10, nameArabic: 'يونس', nameTransliteration: 'Junus', ayahCount: 109, revelationType: 'meccan' },
  { number: 11, nameArabic: 'هود', nameTransliteration: 'Hud', ayahCount: 123, revelationType: 'meccan' },
  { number: 12, nameArabic: 'يوسف', nameTransliteration: 'Jusuf', ayahCount: 111, revelationType: 'meccan' },
  { number: 13, nameArabic: 'الرعد', nameTransliteration: "Er-Ra'd", ayahCount: 43, revelationType: 'medinan' },
  { number: 14, nameArabic: 'إبراهيم', nameTransliteration: 'Ibrahim', ayahCount: 52, revelationType: 'meccan' },
  { number: 15, nameArabic: 'الحجر', nameTransliteration: 'El-Hixhr', ayahCount: 99, revelationType: 'meccan' },
  { number: 16, nameArabic: 'النحل', nameTransliteration: 'En-Nahl', ayahCount: 128, revelationType: 'meccan' },
  { number: 17, nameArabic: 'الإسراء', nameTransliteration: 'El-Isra', ayahCount: 111, revelationType: 'meccan' },
  { number: 18, nameArabic: 'الكهف', nameTransliteration: 'El-Kehf', ayahCount: 110, revelationType: 'meccan' },
  { number: 19, nameArabic: 'مريم', nameTransliteration: 'Merjem', ayahCount: 98, revelationType: 'meccan' },
  { number: 20, nameArabic: 'طه', nameTransliteration: 'Ta-Ha', ayahCount: 135, revelationType: 'meccan' },
  { number: 21, nameArabic: 'الأنبياء', nameTransliteration: 'El-Enbija', ayahCount: 112, revelationType: 'meccan' },
  { number: 22, nameArabic: 'الحج', nameTransliteration: 'El-Haxh', ayahCount: 78, revelationType: 'medinan' },
  { number: 23, nameArabic: 'المؤمنون', nameTransliteration: "El-Mu'minun", ayahCount: 118, revelationType: 'meccan' },
  { number: 24, nameArabic: 'النور', nameTransliteration: 'En-Nur', ayahCount: 64, revelationType: 'medinan' },
  { number: 25, nameArabic: 'الفرقان', nameTransliteration: 'El-Furkan', ayahCount: 77, revelationType: 'meccan' },
  { number: 26, nameArabic: 'الشعراء', nameTransliteration: 'Esh-Shuara', ayahCount: 227, revelationType: 'meccan' },
  { number: 27, nameArabic: 'النمل', nameTransliteration: 'En-Neml', ayahCount: 93, revelationType: 'meccan' },
  { number: 28, nameArabic: 'القصص', nameTransliteration: 'El-Kasas', ayahCount: 88, revelationType: 'meccan' },
  { number: 29, nameArabic: 'العنكبوت', nameTransliteration: 'El-Ankebut', ayahCount: 69, revelationType: 'meccan' },
  { number: 30, nameArabic: 'الروم', nameTransliteration: 'Er-Rum', ayahCount: 60, revelationType: 'meccan' },
  { number: 31, nameArabic: 'لقمان', nameTransliteration: 'Lukman', ayahCount: 34, revelationType: 'meccan' },
  { number: 32, nameArabic: 'السجدة', nameTransliteration: 'Es-Sexhde', ayahCount: 30, revelationType: 'meccan' },
  { number: 33, nameArabic: 'الأحزاب', nameTransliteration: 'El-Ahzab', ayahCount: 73, revelationType: 'medinan' },
  { number: 34, nameArabic: 'سبأ', nameTransliteration: 'Sebe', ayahCount: 54, revelationType: 'meccan' },
  { number: 35, nameArabic: 'فاطر', nameTransliteration: 'Fatir', ayahCount: 45, revelationType: 'meccan' },
  { number: 36, nameArabic: 'يس', nameTransliteration: 'Ja-Sin', ayahCount: 83, revelationType: 'meccan' },
  { number: 37, nameArabic: 'الصافات', nameTransliteration: 'Es-Saffat', ayahCount: 182, revelationType: 'meccan' },
  { number: 38, nameArabic: 'ص', nameTransliteration: 'Sad', ayahCount: 88, revelationType: 'meccan' },
  { number: 39, nameArabic: 'الزمر', nameTransliteration: 'Ez-Zumer', ayahCount: 75, revelationType: 'meccan' },
  { number: 40, nameArabic: 'غافر', nameTransliteration: 'Gafir', ayahCount: 85, revelationType: 'meccan' },
  { number: 41, nameArabic: 'فصلت', nameTransliteration: 'Fussilet', ayahCount: 54, revelationType: 'meccan' },
  { number: 42, nameArabic: 'الشورى', nameTransliteration: 'Esh-Shura', ayahCount: 53, revelationType: 'meccan' },
  { number: 43, nameArabic: 'الزخرف', nameTransliteration: 'Ez-Zuhruf', ayahCount: 89, revelationType: 'meccan' },
  { number: 44, nameArabic: 'الدخان', nameTransliteration: 'Ed-Duhan', ayahCount: 59, revelationType: 'meccan' },
  { number: 45, nameArabic: 'الجاثية', nameTransliteration: 'El-Xhathije', ayahCount: 37, revelationType: 'meccan' },
  { number: 46, nameArabic: 'الأحقاف', nameTransliteration: 'El-Ahkaf', ayahCount: 35, revelationType: 'meccan' },
  { number: 47, nameArabic: 'محمد', nameTransliteration: 'Muhammed', ayahCount: 38, revelationType: 'medinan' },
  { number: 48, nameArabic: 'الفتح', nameTransliteration: "El-Fet'h", ayahCount: 29, revelationType: 'medinan' },
  { number: 49, nameArabic: 'الحجرات', nameTransliteration: 'El-Huxhurat', ayahCount: 18, revelationType: 'medinan' },
  { number: 50, nameArabic: 'ق', nameTransliteration: 'Kaf', ayahCount: 45, revelationType: 'meccan' },
  { number: 51, nameArabic: 'الذاريات', nameTransliteration: 'Edh-Dharijat', ayahCount: 60, revelationType: 'meccan' },
  { number: 52, nameArabic: 'الطور', nameTransliteration: 'Et-Tur', ayahCount: 49, revelationType: 'meccan' },
  { number: 53, nameArabic: 'النجم', nameTransliteration: 'En-Nexhm', ayahCount: 62, revelationType: 'meccan' },
  { number: 54, nameArabic: 'القمر', nameTransliteration: 'El-Kamer', ayahCount: 55, revelationType: 'meccan' },
  { number: 55, nameArabic: 'الرحمن', nameTransliteration: 'Er-Rahman', ayahCount: 78, revelationType: 'medinan' },
  { number: 56, nameArabic: 'الواقعة', nameTransliteration: 'El-Vakia', ayahCount: 96, revelationType: 'meccan' },
  { number: 57, nameArabic: 'الحديد', nameTransliteration: 'El-Hadid', ayahCount: 29, revelationType: 'medinan' },
  { number: 58, nameArabic: 'المجادلة', nameTransliteration: 'El-Muxhadele', ayahCount: 22, revelationType: 'medinan' },
  { number: 59, nameArabic: 'الحشر', nameTransliteration: 'El-Hashr', ayahCount: 24, revelationType: 'medinan' },
  { number: 60, nameArabic: 'الممتحنة', nameTransliteration: 'El-Mumtehine', ayahCount: 13, revelationType: 'medinan' },
  { number: 61, nameArabic: 'الصف', nameTransliteration: 'Es-Saff', ayahCount: 14, revelationType: 'medinan' },
  { number: 62, nameArabic: 'الجمعة', nameTransliteration: 'El-Xhumua', ayahCount: 11, revelationType: 'medinan' },
  { number: 63, nameArabic: 'المنافقون', nameTransliteration: 'El-Munafikun', ayahCount: 11, revelationType: 'medinan' },
  { number: 64, nameArabic: 'التغابن', nameTransliteration: 'Et-Tegabun', ayahCount: 18, revelationType: 'medinan' },
  { number: 65, nameArabic: 'الطلاق', nameTransliteration: 'Et-Talak', ayahCount: 12, revelationType: 'medinan' },
  { number: 66, nameArabic: 'التحريم', nameTransliteration: 'Et-Tahrim', ayahCount: 12, revelationType: 'medinan' },
  { number: 67, nameArabic: 'الملك', nameTransliteration: 'El-Mulk', ayahCount: 30, revelationType: 'meccan' },
  { number: 68, nameArabic: 'القلم', nameTransliteration: 'El-Kalem', ayahCount: 52, revelationType: 'meccan' },
  { number: 69, nameArabic: 'الحاقة', nameTransliteration: 'El-Hakka', ayahCount: 52, revelationType: 'meccan' },
  { number: 70, nameArabic: 'المعارج', nameTransliteration: 'El-Mearixh', ayahCount: 44, revelationType: 'meccan' },
  { number: 71, nameArabic: 'نوح', nameTransliteration: 'Nuh', ayahCount: 28, revelationType: 'meccan' },
  { number: 72, nameArabic: 'الجن', nameTransliteration: 'El-Xhinn', ayahCount: 28, revelationType: 'meccan' },
  { number: 73, nameArabic: 'المزمل', nameTransliteration: 'El-Muzemmil', ayahCount: 20, revelationType: 'meccan' },
  { number: 74, nameArabic: 'المدثر', nameTransliteration: 'El-Mudethir', ayahCount: 56, revelationType: 'meccan' },
  { number: 75, nameArabic: 'القيامة', nameTransliteration: 'El-Kijame', ayahCount: 40, revelationType: 'meccan' },
  { number: 76, nameArabic: 'الإنسان', nameTransliteration: 'El-Insan', ayahCount: 31, revelationType: 'medinan' },
  { number: 77, nameArabic: 'المرسلات', nameTransliteration: 'El-Murselat', ayahCount: 50, revelationType: 'meccan' },
  { number: 78, nameArabic: 'النبأ', nameTransliteration: 'En-Nebe', ayahCount: 40, revelationType: 'meccan' },
  { number: 79, nameArabic: 'النازعات', nameTransliteration: 'En-Naziat', ayahCount: 46, revelationType: 'meccan' },
  { number: 80, nameArabic: 'عبس', nameTransliteration: 'Abese', ayahCount: 42, revelationType: 'meccan' },
  { number: 81, nameArabic: 'التكوير', nameTransliteration: 'Et-Tekvir', ayahCount: 29, revelationType: 'meccan' },
  { number: 82, nameArabic: 'الانفطار', nameTransliteration: 'El-Infitar', ayahCount: 19, revelationType: 'meccan' },
  { number: 83, nameArabic: 'المطففين', nameTransliteration: 'El-Mutaffifin', ayahCount: 36, revelationType: 'meccan' },
  { number: 84, nameArabic: 'الانشقاق', nameTransliteration: 'El-Inshikak', ayahCount: 25, revelationType: 'meccan' },
  { number: 85, nameArabic: 'البروج', nameTransliteration: 'El-Buruxh', ayahCount: 22, revelationType: 'meccan' },
  { number: 86, nameArabic: 'الطارق', nameTransliteration: 'Et-Tarik', ayahCount: 17, revelationType: 'meccan' },
  { number: 87, nameArabic: 'الأعلى', nameTransliteration: "El-A'la", ayahCount: 19, revelationType: 'meccan' },
  { number: 88, nameArabic: 'الغاشية', nameTransliteration: 'El-Gashije', ayahCount: 26, revelationType: 'meccan' },
  { number: 89, nameArabic: 'الفجر', nameTransliteration: 'El-Fexhr', ayahCount: 30, revelationType: 'meccan' },
  { number: 90, nameArabic: 'البلد', nameTransliteration: 'El-Beled', ayahCount: 20, revelationType: 'meccan' },
  { number: 91, nameArabic: 'الشمس', nameTransliteration: 'Esh-Shems', ayahCount: 15, revelationType: 'meccan' },
  { number: 92, nameArabic: 'الليل', nameTransliteration: 'El-Lejl', ayahCount: 21, revelationType: 'meccan' },
  { number: 93, nameArabic: 'الضحى', nameTransliteration: 'Ed-Duha', ayahCount: 11, revelationType: 'meccan' },
  { number: 94, nameArabic: 'الشرح', nameTransliteration: 'Esh-Sherh', ayahCount: 8, revelationType: 'meccan' },
  { number: 95, nameArabic: 'التين', nameTransliteration: 'Et-Tin', ayahCount: 8, revelationType: 'meccan' },
  { number: 96, nameArabic: 'العلق', nameTransliteration: 'El-Alak', ayahCount: 19, revelationType: 'meccan' },
  { number: 97, nameArabic: 'القدر', nameTransliteration: 'El-Kadr', ayahCount: 5, revelationType: 'meccan' },
  { number: 98, nameArabic: 'البينة', nameTransliteration: 'El-Bejjine', ayahCount: 8, revelationType: 'medinan' },
  { number: 99, nameArabic: 'الزلزلة', nameTransliteration: 'Ez-Zelzele', ayahCount: 8, revelationType: 'medinan' },
  { number: 100, nameArabic: 'العاديات', nameTransliteration: 'El-Adijat', ayahCount: 11, revelationType: 'meccan' },
  { number: 101, nameArabic: 'القارعة', nameTransliteration: 'El-Karia', ayahCount: 11, revelationType: 'meccan' },
  { number: 102, nameArabic: 'التكاثر', nameTransliteration: 'Et-Tekathur', ayahCount: 8, revelationType: 'meccan' },
  { number: 103, nameArabic: 'العصر', nameTransliteration: 'El-Asr', ayahCount: 3, revelationType: 'meccan' },
  { number: 104, nameArabic: 'الهمزة', nameTransliteration: 'El-Humeze', ayahCount: 9, revelationType: 'meccan' },
  { number: 105, nameArabic: 'الفيل', nameTransliteration: 'El-Fil', ayahCount: 5, revelationType: 'meccan' },
  { number: 106, nameArabic: 'قريش', nameTransliteration: 'Kurejsh', ayahCount: 4, revelationType: 'meccan' },
  { number: 107, nameArabic: 'الماعون', nameTransliteration: 'El-Maun', ayahCount: 7, revelationType: 'meccan' },
  { number: 108, nameArabic: 'الكوثر', nameTransliteration: 'El-Keuther', ayahCount: 3, revelationType: 'meccan' },
  { number: 109, nameArabic: 'الكافرون', nameTransliteration: 'El-Kafirun', ayahCount: 6, revelationType: 'meccan' },
  { number: 110, nameArabic: 'النصر', nameTransliteration: 'En-Nasr', ayahCount: 3, revelationType: 'medinan' },
  { number: 111, nameArabic: 'المسد', nameTransliteration: 'El-Leheb', ayahCount: 5, revelationType: 'meccan' },
  { number: 112, nameArabic: 'الإخلاص', nameTransliteration: 'El-Ihlas', ayahCount: 4, revelationType: 'meccan' },
  { number: 113, nameArabic: 'الفلق', nameTransliteration: 'El-Felek', ayahCount: 5, revelationType: 'meccan' },
  { number: 114, nameArabic: 'الناس', nameTransliteration: 'En-Nas', ayahCount: 6, revelationType: 'meccan' }
];

var ALLOWED_FIELDS = ['number', 'nameArabic', 'nameTransliteration', 'ayahCount', 'revelationType'];

function validateMetadata(surahs) {
  if (surahs.length !== 114) throw new Error('Quran metadata must contain exactly 114 surahs');
  surahs.forEach(function (surah, index) {
    var fields = Object.keys(surah).sort();
    var expectedFields = ALLOWED_FIELDS.slice().sort();
    if (fields.length !== expectedFields.length || fields.some(function (field, fieldIndex) {
      return field !== expectedFields[fieldIndex];
    }) || surah.number !== index + 1 ||
        typeof surah.nameArabic !== 'string' || !surah.nameArabic.trim() ||
        typeof surah.nameTransliteration !== 'string' || !surah.nameTransliteration.trim() ||
        !Number.isInteger(surah.ayahCount) || surah.ayahCount < 1 ||
        ['meccan', 'medinan'].indexOf(surah.revelationType) === -1) {
      throw new Error('Invalid Quran metadata at surah ' + (index + 1));
    }
  });
}

validateMetadata(RAW_SURAHS);

export const QURAN_SURAHS = Object.freeze(RAW_SURAHS.map(function (surah) {
  return Object.freeze({
    number: surah.number,
    nameArabic: surah.nameArabic,
    nameTransliteration: surah.nameTransliteration,
    ayahCount: surah.ayahCount,
    revelationType: surah.revelationType
  });
}));

var SURAH_BY_NUMBER = new Map(QURAN_SURAHS.map(function (surah) {
  return [surah.number, surah];
}));

function toInteger(value) {
  if (Number.isInteger(value)) return value;
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null;
}

function normalizeSearchValue(value) {
  return value.toLocaleLowerCase('sq')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s'’ʼ`´\-‐‑‒–—_]+/g, '');
}

export function getSurahMetadata(number) {
  var normalized = toInteger(number);
  return normalized === null ? null : (SURAH_BY_NUMBER.get(normalized) || null);
}

export function isValidSurahAyah(surah, ayah) {
  var metadata = getSurahMetadata(surah);
  var normalizedAyah = toInteger(ayah);
  return Boolean(metadata && normalizedAyah !== null &&
    normalizedAyah >= 1 && normalizedAyah <= metadata.ayahCount);
}

export function searchSurahs(query) {
  var input = query === null || query === undefined ? '' : String(query).trim();
  if (!input) return QURAN_SURAHS.slice();
  var normalizedQuery = normalizeSearchValue(input);
  if (!normalizedQuery) return QURAN_SURAHS.slice();
  return QURAN_SURAHS.filter(function (surah) {
    return String(surah.number).indexOf(normalizedQuery) !== -1 ||
      normalizeSearchValue(surah.nameArabic).indexOf(normalizedQuery) !== -1 ||
      normalizeSearchValue(surah.nameTransliteration).indexOf(normalizedQuery) !== -1;
  });
}
