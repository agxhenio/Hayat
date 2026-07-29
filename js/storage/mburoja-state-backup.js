/** Hayat — validated backup/restore for Mburoja local-only preferences and progress. */

const KEYS = Object.freeze({
  counts: 'hayat-mburoja-counts',
  saved: 'hayat-mburoja-saved',
  favCats: 'hayat-mburoja-favCats',
  favChapters: 'hayat-mburoja-favChapters',
  readerTheme: 'hayat-mburoja-readerTheme',
  font: 'hayat-mburoja-font',
  completedByDate: 'hayat-mburoja-completed-by-date',
  dailyCountsByDate: 'hayat-mburoja-daily-counts-by-date',
  dailyCountsMigrated: 'hayat-mburoja-daily-counts-migrated-v1'
});
const STATE_FIELDS = Object.freeze([
  'counts', 'saved', 'favCats', 'favChapters', 'readerTheme', 'font',
  'completedByDate', 'dailyCountsByDate'
]);

function plain(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  var prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function stringArray(value, maximum) {
  return Array.isArray(value) && value.length <= maximum &&
    value.every(function (item) { return typeof item === 'string' && item.length > 0 && item.length <= 240; }) &&
    new Set(value).size === value.length;
}
function countMap(value) {
  return plain(value) && Object.keys(value).length <= 10000 && Object.keys(value).every(function (key) {
    return key.length > 0 && key.length <= 300 && Number.isInteger(value[key]) && value[key] >= 0 && value[key] <= 1000;
  });
}
function datedArrays(value) {
  return plain(value) && Object.keys(value).length <= 366 && Object.keys(value).every(function (dateKey) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && stringArray(value[dateKey], 500);
  });
}
function datedCounts(value) {
  return plain(value) && Object.keys(value).length <= 31 && Object.keys(value).every(function (dateKey) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && countMap(value[dateKey]);
  });
}
function readJson(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) { return fallback; }
}
function readText(key, fallback) {
  try { return localStorage.getItem(key) || fallback; }
  catch (error) { return fallback; }
}

export function validateMburojaLocalState(candidate) {
  if (!plain(candidate) || Object.keys(candidate).length !== STATE_FIELDS.length ||
      STATE_FIELDS.some(function (field) { return !(field in candidate); }) ||
      Object.keys(candidate).some(function (field) { return STATE_FIELDS.indexOf(field) === -1; }) ||
      !countMap(candidate.counts) || !stringArray(candidate.saved, 10000) ||
      !stringArray(candidate.favCats, 200) || !stringArray(candidate.favChapters, 500) ||
      ['paper', 'sepia', 'night'].indexOf(candidate.readerTheme) === -1 ||
      ['sm', 'md', 'lg', 'xl'].indexOf(candidate.font) === -1 ||
      !datedArrays(candidate.completedByDate) || !datedCounts(candidate.dailyCountsByDate)) return null;
  return Object.freeze(clone(candidate));
}

export function exportMburojaLocalState() {
  return validateMburojaLocalState({
    counts: readJson(KEYS.counts, {}),
    saved: readJson(KEYS.saved, []),
    favCats: readJson(KEYS.favCats, []),
    favChapters: readJson(KEYS.favChapters, []),
    readerTheme: readText(KEYS.readerTheme, 'night'),
    font: readText(KEYS.font, 'md'),
    completedByDate: readJson(KEYS.completedByDate, {}),
    dailyCountsByDate: readJson(KEYS.dailyCountsByDate, {})
  }) || Object.freeze({
    counts: {}, saved: [], favCats: [], favChapters: [], readerTheme: 'night',
    font: 'md', completedByDate: {}, dailyCountsByDate: {}
  });
}

export function restoreMburojaLocalState(candidate) {
  var valid = validateMburojaLocalState(candidate);
  if (!valid) throw new TypeError('Invalid Mburoja backup state');
  localStorage.setItem(KEYS.counts, JSON.stringify(valid.counts));
  localStorage.setItem(KEYS.saved, JSON.stringify(valid.saved));
  localStorage.setItem(KEYS.favCats, JSON.stringify(valid.favCats));
  localStorage.setItem(KEYS.favChapters, JSON.stringify(valid.favChapters));
  localStorage.setItem(KEYS.readerTheme, valid.readerTheme);
  localStorage.setItem(KEYS.font, valid.font);
  localStorage.setItem(KEYS.completedByDate, JSON.stringify(valid.completedByDate));
  localStorage.setItem(KEYS.dailyCountsByDate, JSON.stringify(valid.dailyCountsByDate));
  localStorage.setItem(KEYS.dailyCountsMigrated, '1');
  return valid;
}
