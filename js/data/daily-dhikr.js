/**
 * Hayat — Daily Dhikr v1 curated content.
 *
 * Quran items contain references only. Their Arabic text and Albanian
 * translation are loaded at runtime through the Quran Content Service.
 */

import { isValidSurahAyah } from './quran-surahs.js';

export const DAILY_DHIKR_CONTENT_VERSION = 4;
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
var MORNING_AYAT_KURSI_SOURCE = source(
  'El-Hakim; vlerësuar i saktë nga Albani',
  'Mburoja e Muslimanit · shënimi 108',
  'Referenca e librit për leximin kur gdhihemi dhe kur ngrysemi.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [53, 54]
);
var SAYYID_AL_ISTIGHFAR_SOURCE = source(
  'Sahih al-Bukhari',
  'Mburoja e Muslimanit · shënimi 115',
  'Në libër paraqitet si forma më e mirë e istigfarit.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [58]
);
var MORNING_HEALTH_SOURCE = source(
  'Sunan Abu Dawud; Musnad Ahmad',
  'Mburoja e Muslimanit · shënimi 120',
  'Thuhet tri herë në mëngjes dhe në mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [60]
);
var HASBIYALLAH_SOURCE = source(
  'Ibn es-Sunni; Sunan Abu Dawud',
  'Mburoja e Muslimanit · shënimi 121',
  'Thuhet shtatë herë në mëngjes dhe në mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [60]
);
var AFWA_WAL_AFIYAH_SOURCE = source(
  'Sunan Abu Dawud; Sunan Ibn Majah',
  'Mburoja e Muslimanit · shënimi 122',
  '',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [61]
);
var BISMILLAH_PROTECTION_SOURCE = source(
  'Sunan Abu Dawud; Jami at-Tirmidhi; Sunan Ibn Majah',
  'Mburoja e Muslimanit · shënimi 124',
  'Thuhet tri herë në mëngjes dhe në mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [62]
);
var BEDTIME_THREE_SURAHS_SOURCE = source(
  'Sahih al-Bukhari; Sahih Muslim',
  'Mburoja e Muslimanit · shënimet 140–141',
  'Leximi dhe fshirja e trupit përsëriten tri herë sipas udhëzimit të botimit.',
  '28 — Dhikri kur biem në gjumë',
  [67, 68, 69]
);
var BEDTIME_BISMIKA_RABBI_SOURCE = source(
  'Sahih al-Bukhari; Sahih Muslim',
  'Mburoja e Muslimanit · shënimi 144',
  '',
  '28 — Dhikri kur biem në gjumë',
  [71]
);
var BEDTIME_SOUL_SOURCE = source(
  'Sahih Muslim',
  'Mburoja e Muslimanit · shënimi 146',
  '',
  '28 — Dhikri kur biem në gjumë',
  [72]
);
var BEDTIME_PUNISHMENT_SOURCE = source(
  'Sunan Abu Dawud; Jami at-Tirmidhi',
  'Mburoja e Muslimanit · shënimi 147',
  'Në burim lidhet me vendosjen e dorës së djathtë poshtë faqes së djathtë.',
  '28 — Dhikri kur biem në gjumë',
  [72]
);
var BEDTIME_SURRENDER_SOURCE = source(
  'Sahih al-Bukhari; Sahih Muslim',
  'Mburoja e Muslimanit · kapitulli 28',
  '',
  '28 — Dhikri kur biem në gjumë',
  [75]
);
var KINGDOM_DAY_NIGHT_SOURCE = source(
  'Sahih Muslim',
  'Mburoja e Muslimanit · shënimi 111',
  'Botimi jep variante të plota për ditën dhe natën.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [56, 57]
);
var BIKA_ASBAHNA_SOURCE = source(
  'Jami at-Tirmidhi',
  'Mburoja e Muslimanit · shënimi 114',
  'Botimi jep variante të veçanta për mëngjesin dhe mbrëmjen.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [57]
);
var BLESSINGS_SOURCE = source(
  'Sunan Abu Dawud',
  'Mburoja e Muslimanit · shënimi 119',
  'Varianti ndryshon mes “aṣbaḥa” dhe “emsã”.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [59]
);
var ALIM_AL_GHAYB_SOURCE = source(
  'Jami at-Tirmidhi; Sunan Abu Dawud',
  'Mburoja e Muslimanit · shënimi 123',
  '',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [61, 62]
);
var RADITU_SOURCE = source(
  'Musnad Ahmad; Sunan Abu Dawud; Jami at-Tirmidhi',
  'Mburoja e Muslimanit · shënimet 124–125',
  'Thuhet tri herë në mëngjes dhe në mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [62, 63]
);
var YA_HAYYU_SOURCE = source(
  'El-Hakim; Sahih et-Tergib ue et-Terhib',
  'Mburoja e Muslimanit · shënimi 126',
  '',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [63]
);
var FITRAH_SOURCE = source(
  'Musnad Ahmad; Sahih el-Xhami',
  'Mburoja e Muslimanit · shënimi 130',
  'Botimi jep “Aṣbaḥnã” për mëngjes dhe “Emsejnã” për mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [64]
);
var MORNING_EVENING_SALAWAT_SOURCE = source(
  'Et-Taberani; Sahih et-Tergib ue et-Terhib',
  'Mburoja e Muslimanit · shënimi 139',
  'Thuhet dhjetë herë në mëngjes dhe dhjetë herë në mbrëmje.',
  '27 — Dhikri i mëngjesit dhe i mbrëmjes',
  [66, 67]
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

function morningEveningItems(prefix) {
  var morning = prefix === 'morning';
  return [
    quranItem(prefix + '_ayat_al_kursi', 'Ajetul Kursij', 2, 255, 255, 1,
      MORNING_AYAT_KURSI_SOURCE),
    quranItem(prefix + '_al_ikhlas', 'Sureja El-Ihlas', 112, 1, 4, 3, ABU_DAWUD_5082),
    quranItem(prefix + '_al_falaq', 'Sureja El-Felek', 113, 1, 5, 3, ABU_DAWUD_5082),
    quranItem(prefix + '_an_nas', 'Sureja En-Nas', 114, 1, 6, 3, ABU_DAWUD_5082),
    textItem(
      prefix + '_kingdom',
      morning ? 'U gdhimë dhe sundimi i përket Allahut' : 'U ngrysëm dhe sundimi i përket Allahut',
      morning
        ? 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ. رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ. رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ'
        : 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا. رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ. رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      morning
        ? 'Aṣbaḥnã we aṣbaḥal mulku lil-lãh, welḥamdu lil-lãhi, lã ilãhe il-lall-llãhu waḥdehu lã sherĩke leh, lehul mulku we lehul ḥamdu, we huwe ‘alã kul-li shej’in ḳadĩr. Rabbi es’eluke ḣajra mã fĩ hãdhel jewmi, we ḣajra mã ba’ëdehu, we e’ũdhu bike min sherri mã fĩ hãdhel jewmi, we sherri mã ba’ëdehu. Rabbi e’ũdhu bike minel keseli, we sũil kiber. Rabbi e’ũdhu bike min ‘adhãbin fin-nãri, we ‘adhãbin fil ḳabri.'
        : 'Emsejnã we emsel mulku lil-lãh, welḥamdu lil-lãhi, lã ilãhe il-lall-llãhu waḥdehu lã sherĩke leh, lehul mulku we lehul ḥamdu, we huwe ‘alã kul-li shej’in ḳadĩr. Rabbi es’eluke ḣajra mã fĩ hãdhihil-lejleti, we ḣajra mã ba’ëdehã, we e’ũdhu bike min sherri mã fĩ hãdhihil-lejleti, we sherri mã ba’ëdehã. Rabbi e’ũdhu bike minel keseli, we sũil kiber. Rabbi e’ũdhu bike min ‘adhãbin fin-nãri, we ‘adhãbin fil ḳabri.',
      morning
        ? 'U gdhimë dhe ndërkohë ne jemi në dorë të Allahut! I gjithë sundimi i përket Allahut dhe e gjithë lavdia i takon Atij! Nuk ka të adhuruar me të drejtë përveç Allahut, i Cili është Një dhe i Pashoq! Atij i takon sundimi dhe lavdia! Ai është i fuqishëm për çdo gjë! O Zoti im! Unë të kërkoj të mirën që do të krijohet dhe do të ndodhë në këtë ditë, dhe të mirën që do të krijohet në ditët e tjera pas saj! Ty të lutem të më mbrosh nga sherri i gjithçkaje që ndodh në këtë ditë dhe sherri i gjithçkaje në ditët pas saj! O Zoti im! Kërkoj të më ruash nga përtacia dhe pleqëria e keqe! O Zoti im! Kërkoj të më mbrosh nga dënimi në Zjarr dhe dënimi në varr!'
        : 'U ngrysëm dhe ndërkohë ne jemi në dorë të Allahut! I gjithë sundimi i përket Allahut dhe e gjithë lavdia i takon Atij! Nuk ka të adhuruar me të drejtë përveç Allahut, i Cili është Një dhe i Pashoq! Atij i takon sundimi dhe lavdia! Ai është i fuqishëm për çdo gjë! O Zoti im! Unë të kërkoj të mirën që do të krijohet dhe do të ndodhë në këtë natë, dhe të mirën që do të krijohet në netët e tjera pas saj! Ty të lutem të më mbrosh nga sherri i gjithçkaje në këtë natë dhe në netët pas saj! O Zoti im! Kërkoj të më ruash nga përtacia dhe pleqëria e keqe! O Zoti im! Kërkoj të më mbrosh nga dënimi në Zjarr dhe dënimi në varr!',
      1,
      KINGDOM_DAY_NIGHT_SOURCE
    ),
    textItem(
      prefix + '_bika_asbahna',
      morning ? 'Nën kujdesin Tënd u gdhimë' : 'Nën kujdesin Tënd u ngrysëm',
      morning
        ? 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ'
        : 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
      morning
        ? 'All-llãhumme bike aṣbaḥnã, we bike emsejnã, we bike naḥjã, we bike nemũtu, we ilejken-nushũr.'
        : 'All-llãhumme bike emsejnã, we bike aṣbaḥnã, we bike naḥjã, we bike nemũtu, we ilejkel meṣĩr.',
      morning
        ? 'O Allah! U gdhimë duke qenë nën kujdesin Tënd dhe u ngrysëm nën kujdesin Tënd! Ti na ngjall dhe Ti na vdes, dhe pas ringjalljes, tek Ti do të kthehemi!'
        : 'O Allah! U ngrysëm nën kujdesin Tënd dhe u gdhimë nën kujdesin Tënd! Ti na ngjall dhe Ti na vdes, dhe tek Ti është kthimi!',
      1,
      BIKA_ASBAHNA_SOURCE
    ),
    textItem(
      prefix + '_sayyid_al_istighfar',
      'Forma më e mirë e istigfarit',
      'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      'All-llãhumme Ente Rabbĩ, lã ilãhe il-lã Ente, ḣalaḳtenĩ we ene ‘abduke, we ene ‘alã ‘ahdike we wa’ëdike mesteṭa’ëtu, e’ũdhu bike min sherri mã ṣana’ëtu, ebũ’u leke bi ni’ëmetike ‘alejje, we ebũ’u bi dhenbĩ, feġfir lĩ fe innehu lã jeġfirudh-dhunũbe il-lã Ente.',
      'O Allah! Ti je Zoti im! Askush nuk meriton të adhurohet, përveç Teje! Ti më krijove dhe unë jam robi Yt! Unë do t’i qëndroj besnik besës dhe premtimit që të kam dhënë, sa të mundem! Kërkoj që të më mbrosh nga e keqja që vjen si pasojë e asaj që kam bërë! Të jam mirënjohës për të gjitha mirësitë që më ke bërë dhe i pranoj gjynahet e mia, prandaj më fal, sepse, në të vërtetë, gjynahet nuk i fal askush tjetër, përveç Teje!',
      1,
      SAYYID_AL_ISTIGHFAR_SOURCE
    ),
    textItem(
      prefix + '_health',
      'Lutja për shëndet dhe mbrojtje',
      'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
      'All-llãhumme ‘ãfinĩ fĩ bedenĩ, All-llãhumme ‘ãfinĩ fĩ sem’ĩ, All-llãhumme ‘ãfinĩ fĩ beṣarĩ! Lã ilãhe il-lã Ente. All-llãhumme innĩ e’ũdhu bike minel kufri wel faḳri, we e’ũdhu bike min ‘adhãbil ḳabri, lã ilãhe il-lã Ente.',
      'O Allah, më jep shëndet në trupin tim, në të dëgjuarit tim dhe në shikimin tim. Nuk ka të adhuruar me të drejtë përveç Teje. O Allah! Më ruaj nga kufri dhe varfëria! Më ruaj nga dënimi i varrit. Nuk ka të adhuruar me të drejtë përveç Teje.',
      3,
      MORNING_HEALTH_SOURCE
    ),
    textItem(
      prefix + '_hasbiyallah',
      'Më mjafton Allahu',
      'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
      'Ḥasbijall-llãhu lã ilãhe il-lã huwe, ‘alejhi tewekkeltu we huwe rabbul ‘arshil ‘aḍhĩm.',
      'Më mjafton Allahu për rregullimin dhe mbarëvajtjen e punëve! S’ka të adhuruar me të drejtë përveç Tij! Tek Ai unë mbështetem plotësisht dhe Ai është Zoti i arshit madhështor!',
      7,
      HASBIYALLAH_SOURCE
    ),
    textItem(
      prefix + '_afwa_wal_afiyah',
      'Lutja për falje dhe mirëqenie',
      'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
      'All-llãhumme innĩ es’elukel ‘afwe wel ‘ãfijete fid-dun’jã wel ãḣirah. All-llãhumme innĩ es’elukel ‘afwe wel ‘ãfijete fĩ dĩnĩ we dun’jãje we ehlĩ we mãlĩ. All-llãhummestur ‘awrãtĩ, we ãmin raw’ãtĩ. All-llãhumme iḥfeḍhnĩ min bejni jedejje, we min ḣalfĩ, we ‘an jemĩnĩ, we ‘an shimãlĩ, we min fewḳĩ, we e’ũdhu bi aḍhametike en uġtãle min taḥtĩ.',
      'O Allah! Të kërkoj të më falësh dhe të më ruash nga çdo e keqe në këtë botë dhe në botën tjetër. O Allah! Të lutem të më falësh dhe të më ruash nga të këqijat e të metat në fenë time, në jetën time të këtushme, në familjen time dhe në pasurinë time. O Allah! M’i mbulo të metat dhe më qetëso nga gjërat frikësuese. O Allah! Më ruaj nga para dhe nga prapa, nga e djathta dhe nga e majta, si dhe nga lart. Mbrohem me madhërinë Tënde, që të mos më përpijë toka nga poshtë.',
      1,
      AFWA_WAL_AFIYAH_SOURCE
    ),
    textItem(
      prefix + '_bismillah_protection',
      'Mbrojtja me emrin e Allahut',
      'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
      'Bismil-lãhil-ledhĩ lã jeḍurr-rru me’asmihi shej’un fil erḍi we lã fis-semãi we huwes-Semĩ’ul ‘Alĩm.',
      'Kërkoj mbrojtje me emrin e Allahut nga çdo keqbërës, emër ky me përmendjen e të cilit nuk mund të bëjë dëm asgjë në tokë dhe asnjë sprovë që zbret nga qielli! Allahu është Ai i Cili i dëgjon të gjitha thëniet dhe i di të gjitha gjendjet!',
      3,
      BISMILLAH_PROTECTION_SOURCE
    ),
    textItem(
      prefix + '_alim_al_ghayb',
      'Mbrojtja nga e keqja e vetes dhe e shejtanit',
      'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
      'All-llãhumme ‘ãlimel ġajbi wesh-shehãdeti, Fãṭiras-semãwãti wel erḍi, Rabbe kul-li shej’in we melĩkehu, eshhedu en lã ilãhe il-lã Ente, e’ũdhu bike min sherri nefsĩ, we min sherrish-shejṭãni we shirkihi, we en eḳterife ‘alã nefsĩ sũen ew exhurr-rrahu ilã muslim.',
      'O Allah! Njohës i së fshehtës dhe së dukshmes, Krijues i qiejve dhe i tokës, Zot dhe Sundues i çdo gjëje! Dëshmoj se askush nuk meriton të adhurohet përveç Teje! Më mbroj nga e keqja e vetvetes, nga e keqja e shejtanit dhe thirrja e përpjekja e tij për të bërë shirk, si dhe që të mos i bëj vetes keq e as ndonjë muslimani!',
      1,
      ALIM_AL_GHAYB_SOURCE
    ),
    textItem(
      prefix + '_raditu',
      'Jam i kënaqur me Allahun si Zot',
      'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
      'Raḍĩtu bil-lãhi Rabben, we bil islãmi dĩnen, we bi Muḥammedin ṣal-lallãhu ‘alejhi we sel-leme nebijjen.',
      'Jam i kënaqur me Allahun si Zot, me Islamin si fe dhe me Muhamedin (lavdërimi dhe paqja qofshin për të) si Pejgamber.',
      3,
      RADITU_SOURCE
    ),
    textItem(
      prefix + '_ya_hayyu',
      'O i Gjallë, o i Përjetshëm',
      'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
      'Jã Ḥajju, jã Ḳajjũmu, bi raḥmetike esteġĩthu, aṣliḥ lĩ she’nĩ kul-lehu, we lã tekilnĩ ilã nefsĩ ṭarfete ‘ajnin.',
      'O i Gjallë e i Përjetshëm! O Mbajtësi i gjithçkaje! Me mëshirën Tënde të kërkoj ndihmë! Rregulloji të gjitha punët e mia dhe mos më lër të mbështetem në veten time as sa një hapje e mbyllje e syrit!',
      1,
      YA_HAYYU_SOURCE
    ),
    textItem(
      prefix + '_fitrah',
      morning ? 'U gdhimë në natyrshmërinë islame' : 'U ngrysëm në natyrshmërinë islame',
      morning
        ? 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ'
        : 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا، وَمَا كَانَ مِنَ الْمُشْرِكِينَ',
      morning
        ? 'Aṣbaḥnã ‘alã fiṭratil Islãm, we ‘alã kelimetil iḣlãṣ, we ‘alã dĩni nebijjinã Muḥammedin ṣal-lallãhu ‘alejhi we sel-leme, we ‘alã mil-leti ebĩnã Ibrãhĩme ḥanĩfen muslimen, we mã kãne minel mushrikĩn.'
        : 'Emsejnã ‘alã fiṭratil Islãm, we ‘alã kelimetil iḣlãṣ, we ‘alã dĩni nebijjinã Muḥammedin ṣal-lallãhu ‘alejhi we sel-leme, we ‘alã mil-leti ebĩnã Ibrãhĩme ḥanĩfen muslimen, we mã kãne minel mushrikĩn.',
      morning
        ? 'U gdhimë në natyrshmërinë islame, në thënien e sinqeritetit, në fenë e Pejgamberit tonë Muhamedit (lavdërimi dhe paqja qofshin për të), si dhe në besimin monoteist të pastër të babait tonë Ibrahim, i cili ka qenë larg besimeve të kota, i nënshtruar ndaj Allahut dhe nuk ka qenë prej idhujtarëve.'
        : 'U ngrysëm në natyrshmërinë islame, në thënien e sinqeritetit, në fenë e Pejgamberit tonë Muhamedit (lavdërimi dhe paqja qofshin për të), si dhe në besimin monoteist të pastër të babait tonë Ibrahim, i cili ka qenë larg besimeve të kota, i nënshtruar ndaj Allahut dhe nuk ka qenë prej idhujtarëve.',
      1,
      FITRAH_SOURCE
    ),
    textItem(
      prefix + '_salawat',
      'Salavat dhe selam për Profetin ﷺ',
      'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
      'All-llãhumme ṣal-li we sel-lim ‘alã nebijjinã Muḥammed.',
      'O Allah, bëj salavat dhe selam Profetit tonë Muhamedit.',
      10,
      MORNING_EVENING_SALAWAT_SOURCE
    ),
    textItem(
      prefix + '_subhanallahi_wa_bihamdihi',
      'Subḥãnall-llãhi we biḥamdihi',
      'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      'Subḥãnall-llãhi we biḥamdihi',
      '(Them shprehjen e lartësimit se) Allahu është pa të meta dhe ngre lart lavdinë e Tij.',
      100,
      MUSLIM_2692
    )
  ];
}

var routines = [
  {
    id: 'morning',
    titleSq: 'Dhikri i mëngjesit',
    descriptionSq: 'Përkujtimet e mëngjesit, për t’i lexuar me qetësi.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: morningEveningItems('morning')
  },
  {
    id: 'evening',
    titleSq: 'Dhikri i mbrëmjes',
    descriptionSq: 'Përkujtimet e mbrëmjes, për t’i lexuar me qetësi.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: morningEveningItems('evening')
  },
  {
    id: 'bedtime',
    titleSq: 'Dhikri para gjumit',
    descriptionSq: 'Përkujtimet dhe duatë para gjumit.',
    reviewStatus: DAILY_DHIKR_REVIEW_STATUS,
    items: [
      quranItem('bedtime_al_ikhlas', 'Sureja El-Ihlas', 112, 1, 4, 3,
        BEDTIME_THREE_SURAHS_SOURCE),
      quranItem('bedtime_al_falaq', 'Sureja El-Felek', 113, 1, 5, 3,
        BEDTIME_THREE_SURAHS_SOURCE),
      quranItem('bedtime_an_nas', 'Sureja En-Nas', 114, 1, 6, 3,
        BEDTIME_THREE_SURAHS_SOURCE),
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
        'bedtime_bismika_rabbi',
        'Duke përmendur emrin Tënd, o Zoti im',
        'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ',
        'Bismike rabbĩ weḍa’tu xhenbĩ, we bike erfe’uhu, fe in emsekte nefsĩ ferḥamhã, we in erseltehã faḥfeḍhhã bimã taḥfeḍhu bihi ‘ibãdekeṣ-ṣãlihĩn.',
        'Duke përmendur emrin Tënd, o Zoti im, u shtriva për të fjetur dhe duke përmendur emrin Tënd ngrihem nga gjumi. Nëse ma mban shpirtin (më vdes), mëshiroje atë e, nëse ma kthen shpirtin në trup, ruaje atë ashtu siç ruan robërit e Tu të mirë.',
        1,
        BEDTIME_BISMIKA_RABBI_SOURCE
      ),
      textItem(
        'bedtime_soul',
        'Lutja për shpirtin dhe mirëqenien',
        'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ',
        'All-llãhumme inneke ḣaleḳte nefsĩ we Ente teweffãhã, leke memãtuhã we maḥjãhã, in aḥjejtehã faḥfeḍhhã, we in emettehã feġfir lehã. All-llãhumme innĩ es’elukel ‘ãfijeh.',
        'O Allah, Ti e ke krijuar shpirtin tim dhe Ti ma merr atë; në dorën Tënde është vdekja dhe jeta e tij. Nëse e lë të jetojë, ruaje atë, e nëse e vdes, fale atë. O Allah, të lutem të më ruash nga çdo e keqe.',
        1,
        BEDTIME_SOUL_SOURCE
      ),
      textItem(
        'bedtime_punishment',
        'Mbrojtja nga dënimi Ditën e Ringjalljes',
        'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        'All-llãhumme ḳinĩ ‘adhãbeke jewme teb’athu ‘ibãdeke.',
        'O Allah, më mbroj prej dënimit Tënd atë Ditë, kur do të ringjallësh robërit e Tu.',
        1,
        BEDTIME_PUNISHMENT_SOURCE
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
      ),
      textItem(
        'bedtime_surrender',
        'Dorëzimi dhe mbështetja tek Allahu',
        'اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ الَّذِي أَنْزَلْتَ، وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ',
        'All-llãhumme eslemtu nefsĩ ilejke, we fewweḍtu emrĩ ilejke, we wexhxhehtu wexhhĩ ilejke, we elxhe’tu ḍhahrĩ ilejke, raġbeten we rahbeten ilejke, lã melxhe’e we lã menxhã minke il-lã ilejke. Ãmentu bi kitãbikel-ledhĩ enzelte, we bi nebijjikel-ledhĩ erselte.',
        'O Allah, unë ta dorëzoj veten time Ty, t’i besoj Ty të gjitha çështjet e mia dhe mbështetem tek Ti të më ndihmosh në të gjitha punët që janë në dobinë time, duke pasur njëkohësisht shpresë tek shpërblimi Yt dhe frikë nga dënimi Yt! Nuk ka strehë dhe shpëtim prej Teje përveçse tek Ti!',
        1,
        BEDTIME_SURRENDER_SOURCE
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
