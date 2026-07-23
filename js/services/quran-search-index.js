/** Hayat — voluntary local search index for QuranEnc Albanian translation. */
import { QURAN_CONTENT_API } from '../config.js';
import { getRecord, putRecord, deleteRecord } from '../storage/database.js';

const KEY = 'quran-search-index-v1';
const VERSION = 1;
function normalize(value) { return String(value || '').toLocaleLowerCase('sq').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }

export async function getQuranSearchIndex() {
  const record = await getRecord('meta', KEY);
  return record && record.version === VERSION && Array.isArray(record.entries) ? record : null;
}

export async function downloadQuranSearchIndex(onProgress, signal) {
  const entries = [];
  for (let surah = 1; surah <= 114; surah += 1) {
    if (signal && signal.aborted) throw new Error('ABORTED');
    const response = await fetch(QURAN_CONTENT_API.baseUrl + '/sura/' + QURAN_CONTENT_API.translationKey + '/' + surah, { signal: signal });
    if (!response.ok) throw new Error('HTTP_ERROR');
    const json = await response.json();
    if (!json || !Array.isArray(json.result)) throw new Error('INVALID_RESPONSE');
    json.result.forEach(function (verse) { entries.push({ surah: Number(verse.sura), ayah: Number(verse.aya), text: String(verse.translation || '') }); });
    if (typeof onProgress === 'function') onProgress(surah, 114);
  }
  const record = { key: KEY, version: VERSION, provider: 'QuranEnc', translationKey: QURAN_CONTENT_API.translationKey, createdAt: new Date().toISOString(), entries: entries };
  await putRecord('meta', record);
  return record;
}

export function searchQuranTranslation(index, query, limit) {
  const needle = normalize(query); if (!index || !needle || needle.length < 2) return [];
  return index.entries.filter(function (entry) { return normalize(entry.text).indexOf(needle) !== -1; }).slice(0, limit || 50);
}

export async function clearQuranSearchIndex() { await deleteRecord('meta', KEY); }
