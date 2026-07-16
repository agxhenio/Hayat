/**
 * Hayat — Validated IndexedDB cache for QuranEnc content.
 */

import {
  QURAN_CONTENT_API,
  buildVerseKey,
  isValidSurahNumber,
  isValidAyahNumber
} from '../config.js';
import {
  getRecord,
  putRecord,
  deleteRecord,
  getAllFromIndex,
  clearStore
} from './database.js';

var STORE = 'quranContent';
var FIELDS = [
  'key', 'verseTranslation', 'verseKey', 'surah', 'ayah', 'translationKey',
  'arabicText', 'translationSq', 'footnotesSq', 'provider', 'fetchedAt', 'updatedAt'
];

function containsArabic(value) {
  return typeof value === 'string' && /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/u.test(value);
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function cloneRecord(record) {
  return record ? Object.assign({}, record) : null;
}

export function buildQuranContentCacheKey(surah, ayah, translationKey) {
  var verseKey = buildVerseKey(surah, ayah);
  var key = translationKey === undefined
    ? QURAN_CONTENT_API.translationKey
    : translationKey;
  return verseKey && key === QURAN_CONTENT_API.translationKey
    ? key + ':' + verseKey
    : null;
}

export function validateQuranContentRecord(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      Object.keys(candidate).some(function (key) { return FIELDS.indexOf(key) === -1; }) ||
      FIELDS.some(function (key) { return !(key in candidate); }) ||
      !isValidSurahNumber(candidate.surah) || !isValidAyahNumber(candidate.ayah) ||
      candidate.translationKey !== QURAN_CONTENT_API.translationKey ||
      candidate.provider !== QURAN_CONTENT_API.providerName ||
      !containsArabic(candidate.arabicText) ||
      typeof candidate.translationSq !== 'string' ||
      candidate.translationSq.trim() === '' || candidate.translationSq.length > 20000 ||
      typeof candidate.footnotesSq !== 'string' || candidate.footnotesSq.length > 20000 ||
      !validIso(candidate.fetchedAt) || !validIso(candidate.updatedAt)) return null;

  var verseKey = buildVerseKey(candidate.surah, candidate.ayah);
  var key = buildQuranContentCacheKey(candidate.surah, candidate.ayah, candidate.translationKey);
  if (!key || candidate.key !== key || candidate.verseTranslation !== key ||
      candidate.verseKey !== verseKey) return null;
  return cloneRecord(candidate);
}

export async function getCachedAyah(surah, ayah, options) {
  var key = buildQuranContentCacheKey(surah, ayah);
  if (!key) return null;
  var record = validateQuranContentRecord(await getRecord(STORE, key));
  if (!record) return null;
  var stale = Date.now() - Date.parse(record.fetchedAt) > QURAN_CONTENT_API.cacheMaxAgeMs;
  return stale && !(options && options.allowStale) ? null : cloneRecord(record);
}

export async function putCachedAyah(record) {
  var validated = validateQuranContentRecord(record);
  if (!validated) throw new TypeError('Invalid Quran content record');
  await putRecord(STORE, validated);
  return cloneRecord(validated);
}

export async function getCachedSurah(surah, options) {
  if (!isValidSurahNumber(surah)) return [];
  var records = await getAllFromIndex(STORE, 'surah', surah);
  var allowStale = Boolean(options && options.allowStale);
  return records.map(validateQuranContentRecord).filter(function (record) {
    if (!record || record.translationKey !== QURAN_CONTENT_API.translationKey) return false;
    return allowStale ||
      Date.now() - Date.parse(record.fetchedAt) <= QURAN_CONTENT_API.cacheMaxAgeMs;
  }).sort(function (a, b) { return a.ayah - b.ayah; }).map(cloneRecord);
}

export async function deleteCachedAyah(surah, ayah) {
  var key = buildQuranContentCacheKey(surah, ayah);
  if (!key) throw new TypeError('Invalid Quran reference');
  await deleteRecord(STORE, key);
}

export function clearQuranContentCache() {
  return clearStore(STORE);
}
