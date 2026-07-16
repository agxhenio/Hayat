/**
 * Hayat — Validated Quran reading and Hatmah positions.
 */

import { buildVerseKey, isValidSurahNumber, isValidAyahNumber } from '../config.js';
import { getRecord, putRecord, deleteRecord } from './database.js';

var STORE = 'quranReadingState';
var LAST_READ = 'lastRead';
var HATMAH = 'hatmahPosition';
var FIELDS = ['key', 'surah', 'ayah', 'verseKey', 'page', 'updatedAt'];

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function clonePosition(position) {
  return position ? Object.assign({}, position) : null;
}

export function validateQuranReadingPosition(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      Object.keys(candidate).some(function (key) { return FIELDS.indexOf(key) === -1; }) ||
      FIELDS.some(function (key) { return !(key in candidate); }) ||
      [LAST_READ, HATMAH].indexOf(candidate.key) === -1 ||
      !isValidSurahNumber(candidate.surah) || !isValidAyahNumber(candidate.ayah) ||
      candidate.verseKey !== buildVerseKey(candidate.surah, candidate.ayah) ||
      !(candidate.page === null ||
        (Number.isInteger(candidate.page) && candidate.page >= 1 && candidate.page <= 604)) ||
      !validIso(candidate.updatedAt)) return null;
  return clonePosition(candidate);
}

async function getPosition(key) {
  var record = await getRecord(STORE, key);
  return record ? validateQuranReadingPosition(record) : null;
}

async function savePosition(key, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Reading position must be an object');
  }
  var position = {
    key: key,
    surah: input.surah,
    ayah: input.ayah,
    verseKey: buildVerseKey(input.surah, input.ayah),
    page: input.page === undefined ? null : input.page,
    updatedAt: new Date().toISOString()
  };
  var validated = validateQuranReadingPosition(position);
  if (!validated) throw new TypeError('Invalid Quran reading position');
  await putRecord(STORE, validated);
  return clonePosition(validated);
}

export function getLastReadPosition() {
  return getPosition(LAST_READ);
}

export function saveLastReadPosition(position) {
  return savePosition(LAST_READ, position);
}

export function getHatmahPosition() {
  return getPosition(HATMAH);
}

export function saveHatmahPosition(position) {
  return savePosition(HATMAH, position);
}

export function clearLastReadPosition() {
  return deleteRecord(STORE, LAST_READ);
}

export function clearHatmahPosition() {
  return deleteRecord(STORE, HATMAH);
}
