/**
 * Hayat — Post-Prayer Dhikr Content Data
 * 
 * Curated content for post-prayer dhikr (remembrance after obligatory prayers).
 * This is optional/Sunnah content, not a required checklist.
 * 
 * IMPORTANT: All content requires qualified human review before public release.
 * 
 * @module data/post-prayer-dhikr
 */

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function (key) { deepFreeze(value[key]); });
  return Object.freeze(value);
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const POST_PRAYER_DHIKR_VERSION = 1;
export const POST_PRAYER_DHIKR_REVIEW_STATUS = 'qualified-review-required';

// ============================================================================
// VARIANT METADATA
// ============================================================================

export const POST_PRAYER_DHIKR_VARIANT = deepFreeze({
  id: 'standard_33_33_33_completion',
  titleSq: 'Dhikri pas namazit',
  descriptionSq: 'Një përmbledhje e dhikreve të transmetuara pas namazeve farz.',
  obligationSq: 'Këto dhikre nuk janë pjesë e namazit farz dhe regjistrimi në Hayat është opsional.',
  exhaustive: false,
  reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS,
  referenceNoteSq: 'Numërtimi i haditheve mund të ndryshojë sipas botimit.'
});

// ============================================================================
// CONTENT ITEMS
// ============================================================================

const items = [
  {
    id: 'seek_forgiveness',
    order: 1,
    type: 'text',
    titleSq: 'Kërkimi i faljes',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliterationSq: 'Estagfirullah',
    translationSq: 'Kërkoj falje prej Allahut.',
    repetitions: {
      default: 3
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 591
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'allahumma_antas_salam',
    order: 2,
    type: 'text',
    titleSq: 'O Allah, Ti je Paqja',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    transliterationSq: 'Allahumme entes-selamu ve minkes-selamu, tebarekte ja dhel-xhelali vel-ikram.',
    translationSq: 'O Allah, Ti je Paqja dhe prej Teje vjen paqja. I Bekuar je, o Zotërues i Madhështisë dhe i Nderit.',
    repetitions: {
      default: 1
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 591,
          note: 'Numërtimi ndryshon sipas botimit.'
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'tawhid_and_dua',
    order: 3,
    type: 'text',
    titleSq: 'Teuhidi dhe falënderimi',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
    transliterationSq: 'La ilahe il-lAllahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej\'in kadir. Allahumme la mania lima a\'tajte, ve la mu\'tije lima mena\'te, ve la jenfeu dhel-xheddi minkel-xhedd.',
    translationSq: 'Nuk ka të adhuruar tjetër me të drejtë përveç Allahut, të Vetmit, pa ortak. Atij i takon sundimi dhe falënderimi dhe Ai është i Fuqishëm për çdo gjë. O Allah, askush nuk mund ta pengojë atë që Ti jep dhe askush nuk mund ta japë atë që Ti pengon; pasuria dhe pozita nuk i bëjnë dobi askujt kundrejt Teje.',
    repetitions: {
      default: 1
    },
    source: {
      collections: [
        {
          name: 'Sahih al-Bukhari',
          number: 844
        },
        {
          name: 'Sahih Muslim',
          number: 593
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'subhanallah_33',
    order: 4,
    type: 'text',
    titleSq: 'Tesbih',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliterationSq: 'SubhanAllah',
    translationSq: 'I Lartësuar dhe i pastër nga çdo mangësi është Allahu.',
    repetitions: {
      default: 33
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 597,
          note: 'Pjesë e variantit 33/33/33 plus plotësim.'
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'alhamdulillah_33',
    order: 5,
    type: 'text',
    titleSq: 'Tahmid',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliterationSq: 'Elhamdulilah',
    translationSq: 'I gjithë falënderimi i takon Allahut.',
    repetitions: {
      default: 33
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 597,
          note: 'Pjesë e variantit 33/33/33 plus plotësim.'
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'allahu_akbar_33',
    order: 6,
    type: 'text',
    titleSq: 'Tekbir',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliterationSq: 'Allahu Ekber',
    translationSq: 'Allahu është më i Madhi.',
    repetitions: {
      default: 33
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 597,
          note: 'Pjesë e variantit 33/33/33 plus plotësim.'
        }
      ],
      contentType: 'hadith'
    },
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'completion_tawhid',
    order: 7,
    type: 'text',
    titleSq: 'Plotësimi i njëqindës',
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliterationSq: 'La ilahe il-lAllahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej\'in kadir.',
    translationSq: 'Nuk ka të adhuruar tjetër me të drejtë përveç Allahut, të Vetmit, pa ortak. Atij i takon sundimi dhe falënderimi dhe Ai është i Fuqishëm për çdo gjë.',
    repetitions: {
      default: 1
    },
    source: {
      collections: [
        {
          name: 'Sahih Muslim',
          number: 597
        }
      ],
      contentType: 'hadith'
    },
    noteSq: 'Plotëson njëqindën në variantin 33 tesbih, 33 tahmid dhe 33 tekbir.',
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'ayat_al_kursi',
    order: 8,
    type: 'quran-reference',
    titleSq: 'Ajeti Kursij',
    quranReference: {
      surah: 2,
      ayahStart: 255,
      ayahEnd: 255
    },
    repetitions: {
      default: 1
    },
    source: {
      collections: [
        {
          name: 'Sunan al-Nasa\'i al-Kubra',
          number: 9928,
          note: 'I vlerësuar sahih nga dijetarë të hadithit; kërkon rishikim të kualifikuar para publikimit.'
        }
      ],
      contentType: 'quran'
    },
    noteSq: 'Teksti i ajetit duhet të merret nga burimi kuranor i verifikuar, jo nga ky modul.',
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'surah_al_ikhlas',
    order: 9,
    type: 'quran-reference',
    titleSq: 'Sureja El-Ihlas',
    quranReference: {
      surah: 112,
      ayahStart: 1,
      ayahEnd: 4
    },
    repetitions: {
      default: 1,
      byPrayer: {
        fajr: 3,
        maghrib: 3
      }
    },
    source: {
      collections: [
        {
          name: 'Sunan Abi Dawud',
          number: 1523
        },
        {
          name: 'Sunan al-Nasa\'i',
          number: 1336
        }
      ],
      grading: 'Sahih according to commonly cited hadith grading; qualified review required.',
      contentType: 'quran'
    },
    noteSq: 'Teksti merret nga burimi kuranor i verifikuar.',
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'surah_al_falaq',
    order: 10,
    type: 'quran-reference',
    titleSq: 'Sureja El-Felek',
    quranReference: {
      surah: 113,
      ayahStart: 1,
      ayahEnd: 5
    },
    repetitions: {
      default: 1,
      byPrayer: {
        fajr: 3,
        maghrib: 3
      }
    },
    source: {
      collections: [
        {
          name: 'Sunan Abi Dawud',
          number: 1523
        },
        {
          name: 'Sunan al-Nasa\'i',
          number: 1336
        }
      ],
      grading: 'Sahih according to commonly cited hadith grading; qualified review required.',
      contentType: 'quran'
    },
    noteSq: 'Teksti merret nga burimi kuranor i verifikuar.',
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  },
  {
    id: 'surah_an_nas',
    order: 11,
    type: 'quran-reference',
    titleSq: 'Sureja En-Nas',
    quranReference: {
      surah: 114,
      ayahStart: 1,
      ayahEnd: 6
    },
    repetitions: {
      default: 1,
      byPrayer: {
        fajr: 3,
        maghrib: 3
      }
    },
    source: {
      collections: [
        {
          name: 'Sunan Abi Dawud',
          number: 1523
        },
        {
          name: 'Sunan al-Nasa\'i',
          number: 1336
        }
      ],
      grading: 'Sahih according to commonly cited hadith grading; qualified review required.',
      contentType: 'quran'
    },
    noteSq: 'Teksti merret nga burimi kuranor i verifikuar.',
    reviewStatus: POST_PRAYER_DHIKR_REVIEW_STATUS
  }
];

export const POST_PRAYER_DHIKR_ITEMS = deepFreeze(items);

export const POST_PRAYER_DHIKR_SEQUENCE = deepFreeze(
  POST_PRAYER_DHIKR_ITEMS.map(function (item) { return item.id; })
);

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/** Return a fresh content item copy. */
export function getPostPrayerDhikrItem(id) {
  if (typeof id !== 'string') return null;
  var item = POST_PRAYER_DHIKR_ITEMS.find(function (candidate) {
    return candidate.id === id;
  });
  return item ? JSON.parse(JSON.stringify(item)) : null;
}

export function getRepetitionTarget(item, prayerKey) {
  var validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  if (!item || !item.repetitions || validPrayers.indexOf(prayerKey) === -1) return null;
  var specific = item.repetitions.byPrayer && item.repetitions.byPrayer[prayerKey];
  var target = specific === undefined ? item.repetitions.default : specific;
  return Number.isInteger(target) && target > 0 ? target : null;
}

export function getPostPrayerDhikrSequence(prayerKey) {
  var validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  if (validPrayers.indexOf(prayerKey) === -1) return null;
  return POST_PRAYER_DHIKR_SEQUENCE.map(function (id) {
    var item = getPostPrayerDhikrItem(id);
    item.targetRepetitions = getRepetitionTarget(item, prayerKey);
    return item;
  });
}

export function validatePostPrayerDhikrContent() {
  var prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  if (POST_PRAYER_DHIKR_ITEMS.length !== 11 ||
      POST_PRAYER_DHIKR_SEQUENCE.length !== POST_PRAYER_DHIKR_ITEMS.length) return false;

  var ids = new Set();
  var orders = new Set();
  for (var i = 0; i < POST_PRAYER_DHIKR_ITEMS.length; i += 1) {
    var item = POST_PRAYER_DHIKR_ITEMS[i];
    if (!item || typeof item.id !== 'string' || ids.has(item.id) ||
        !Number.isInteger(item.order) || item.order !== i + 1 || orders.has(item.order) ||
        POST_PRAYER_DHIKR_SEQUENCE[i] !== item.id ||
        ['text', 'quran-reference'].indexOf(item.type) === -1 ||
        item.reviewStatus !== POST_PRAYER_DHIKR_REVIEW_STATUS) return false;
    ids.add(item.id); orders.add(item.order);

    if (!item.source || !Array.isArray(item.source.collections) ||
        !item.source.collections.length ||
        ['hadith', 'quran'].indexOf(item.source.contentType) === -1) return false;

    if (item.type === 'text') {
      if (typeof item.arabic !== 'string' || !item.arabic.trim() ||
          typeof item.transliterationSq !== 'string' || !item.transliterationSq.trim() ||
          typeof item.translationSq !== 'string' || !item.translationSq.trim() ||
          item.quranReference !== undefined) return false;
    } else {
      var q = item.quranReference;
      if (!q || !Number.isInteger(q.surah) || q.surah < 1 || q.surah > 114 ||
          !Number.isInteger(q.ayahStart) || !Number.isInteger(q.ayahEnd) ||
          q.ayahStart < 1 || q.ayahEnd < q.ayahStart ||
          item.arabic !== undefined || item.translationSq !== undefined) return false;
    }

    for (var p = 0; p < prayerKeys.length; p += 1) {
      if (!Number.isInteger(getRepetitionTarget(item, prayerKeys[p]))) return false;
    }
    if (item.repetitions.byPrayer && Object.keys(item.repetitions.byPrayer).some(function (key) {
      return prayerKeys.indexOf(key) === -1;
    })) return false;
  }
  return ids.size === POST_PRAYER_DHIKR_SEQUENCE.length;
}
