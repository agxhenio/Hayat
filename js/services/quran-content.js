/**
 * Hayat — QuranEnc Arabic/Albanian content service.
 */

import {
  QURAN_CONTENT_API,
  buildVerseKey,
  isValidSurahNumber,
  isValidAyahNumber
} from '../config.js';
import {
  getCachedAyah,
  putCachedAyah,
  getCachedSurah,
  clearQuranContentCache,
  validateQuranContentRecord
} from '../storage/quran-content-cache.js';
import { getRecord, putRecord, deleteRecord, getAllRecords } from '../storage/database.js';

export class QuranContentError extends Error {
  constructor(message, code, options) {
    super(message);
    this.name = 'QuranContentError';
    this.code = code;
    this.recoverable = Boolean(options && options.recoverable);
    if (options && options.cause !== undefined) this.cause = options.cause;
  }
}

function digitsToInteger(value) {
  if (Number.isInteger(value)) return value;
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null;
}

function abortSignalLike(value) {
  return value && typeof value.aborted === 'boolean' &&
    typeof value.addEventListener === 'function' &&
    typeof value.removeEventListener === 'function';
}

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : null;
}

function publicResult(record, source) {
  return {
    verseKey: record.verseKey,
    surah: record.surah,
    ayah: record.ayah,
    arabicText: record.arabicText,
    translationSq: record.translationSq,
    footnotesSq: record.footnotesSq,
    translationKey: record.translationKey,
    translationNameSq: QURAN_CONTENT_API.translationNameSq,
    provider: record.provider,
    providerUrl: QURAN_CONTENT_API.providerUrl,
    source: source,
    fetchedAt: record.fetchedAt
  };
}

export function validateAyahReference(surah, ayah) {
  var normalizedSurah = digitsToInteger(surah);
  var normalizedAyah = digitsToInteger(ayah);
  if (!isValidSurahNumber(normalizedSurah) || !isValidAyahNumber(normalizedAyah)) {
    throw new QuranContentError('Invalid Quran reference', 'INVALID_REFERENCE', {
      recoverable: false
    });
  }
  return { surah: normalizedSurah, ayah: normalizedAyah };
}

export function normalizeQuranEncAyah(json, requestContext) {
  if (!json || typeof json !== 'object' || Array.isArray(json) ||
      !json.result || typeof json.result !== 'object' || Array.isArray(json.result)) {
    throw new QuranContentError('Malformed QuranEnc response', 'INVALID_RESPONSE');
  }
  var result = json.result;
  var returnedSurah = digitsToInteger(result.sura);
  var returnedAyah = digitsToInteger(result.aya);
  if (returnedSurah !== requestContext.surah || returnedAyah !== requestContext.ayah) {
    throw new QuranContentError('QuranEnc reference mismatch', 'INVALID_RESPONSE');
  }

  var now = new Date().toISOString();
  var verseKey = buildVerseKey(returnedSurah, returnedAyah);
  var key = requestContext.translationKey + ':' + verseKey;
  var record = {
    key: key,
    verseTranslation: key,
    verseKey: verseKey,
    surah: returnedSurah,
    ayah: returnedAyah,
    translationKey: requestContext.translationKey,
    arabicText: cleanText(result.arabic_text),
    translationSq: cleanText(result.translation),
    footnotesSq: cleanText(result.footnotes) || '',
    provider: QURAN_CONTENT_API.providerName,
    fetchedAt: now,
    updatedAt: now
  };
  var validated = validateQuranContentRecord(record);
  if (!validated) throw new QuranContentError('Invalid Quran content', 'INVALID_RESPONSE');
  return validated;
}

export function normalizeQuranEncSurah(json, requestContext) {
  if (!json || typeof json !== 'object' || !Array.isArray(json.result) || !json.result.length) {
    throw new QuranContentError('Malformed QuranEnc surah response', 'INVALID_RESPONSE');
  }
  var records = json.result.map(function (item) {
    var ayah = digitsToInteger(item && item.aya);
    if (!ayah) throw new QuranContentError('Invalid ayah in surah response', 'INVALID_RESPONSE');
    return normalizeQuranEncAyah({ result: item }, {
      surah: requestContext.surah,
      ayah: ayah,
      translationKey: requestContext.translationKey
    });
  }).sort(function (a, b) { return a.ayah - b.ayah; });

  var seen = new Set();
  for (var i = 0; i < records.length; i += 1) {
    if (records[i].surah !== requestContext.surah || seen.has(records[i].ayah) ||
        records[i].ayah !== i + 1) {
      throw new QuranContentError('Surah response is incomplete or non-contiguous', 'INVALID_RESPONSE');
    }
    seen.add(records[i].ayah);
  }
  return records;
}

async function fetchJson(url, options) {
  var externalSignal = options && options.signal;
  if (externalSignal !== undefined && !abortSignalLike(externalSignal)) {
    throw new QuranContentError('Invalid AbortSignal', 'INVALID_REFERENCE');
  }
  var controller = new AbortController();
  var timedOut = false;
  var externalAbort = function () { controller.abort(); };
  if (externalSignal) {
    if (externalSignal.aborted) throw new QuranContentError('Request aborted', 'ABORTED');
    externalSignal.addEventListener('abort', externalAbort, { once: true });
  }
  var timer = setTimeout(function () {
    timedOut = true;
    controller.abort();
  }, QURAN_CONTENT_API.timeoutMs);

  try {
    var response = await fetch(url, { signal: controller.signal });
    if (response.status === 404) throw new QuranContentError('Quran content not found', 'NOT_FOUND');
    if (!response.ok) throw new QuranContentError('QuranEnc HTTP ' + response.status, 'HTTP_ERROR', {
      recoverable: true
    });
    try {
      return await response.json();
    } catch (error) {
      throw new QuranContentError('QuranEnc returned invalid JSON', 'INVALID_RESPONSE', {
        cause: error
      });
    }
  } catch (error) {
    if (error instanceof QuranContentError) throw error;
    if (error && error.name === 'AbortError') {
      if (externalSignal && externalSignal.aborted) {
        throw new QuranContentError('Request aborted', 'ABORTED');
      }
      if (timedOut) throw new QuranContentError('QuranEnc timeout', 'TIMEOUT', {
        recoverable: true
      });
    }
    throw new QuranContentError('QuranEnc network error', 'NETWORK_ERROR', {
      recoverable: true,
      cause: error
    });
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', externalAbort);
  }
}

function fallbackAllowed(error) {
  return error && ['NETWORK_ERROR', 'TIMEOUT', 'HTTP_ERROR'].indexOf(error.code) !== -1;
}

async function safeCachedAyah(surah, ayah, allowStale) {
  try { return await getCachedAyah(surah, ayah, { allowStale: allowStale }); }
  catch (error) { return null; }
}

export async function getAyah(surah, ayah, options) {
  var reference = validateAyahReference(surah, ayah);
  var opts = options || {};
  if (!opts.forceRefresh) {
    var cached = await safeCachedAyah(reference.surah, reference.ayah, false);
    if (cached) return publicResult(cached, 'cache');
  }

  var url = new URL(
    QURAN_CONTENT_API.baseUrl + '/aya/' + QURAN_CONTENT_API.translationKey + '/' +
      reference.surah + '/' + reference.ayah
  );
  try {
    var record = normalizeQuranEncAyah(await fetchJson(url, opts), {
      surah: reference.surah,
      ayah: reference.ayah,
      translationKey: QURAN_CONTENT_API.translationKey
    });
    try { await putCachedAyah(record); } catch (error) { /* cache is optional */ }
    return publicResult(record, 'network');
  } catch (error) {
    if (opts.allowStaleOnError !== false && fallbackAllowed(error)) {
      var stale = await safeCachedAyah(reference.surah, reference.ayah, true);
      if (stale) return publicResult(stale, 'cache');
    }
    throw error;
  }
}

function metaKey(surah) {
  return 'quran-surah:' + QURAN_CONTENT_API.translationKey + ':' + surah;
}

function validMeta(meta, surah, allowStale) {
  return meta && meta.key === metaKey(surah) && meta.surah === surah &&
    meta.translationKey === QURAN_CONTENT_API.translationKey &&
    meta.provider === QURAN_CONTENT_API.providerName &&
    Number.isInteger(meta.totalAyahs) && meta.totalAyahs > 0 &&
    Number.isFinite(Date.parse(meta.fetchedAt)) &&
    (allowStale || Date.now() - Date.parse(meta.fetchedAt) <= QURAN_CONTENT_API.cacheMaxAgeMs);
}

async function cachedCompleteSurah(surah, allowStale) {
  try {
    var meta = await getRecord('meta', metaKey(surah));
    if (!validMeta(meta, surah, allowStale)) return null;
    var records = await getCachedSurah(surah, { allowStale: allowStale });
    if (records.length !== meta.totalAyahs || records.some(function (record, index) {
      return record.ayah !== index + 1;
    })) return null;
    return records;
  } catch (error) {
    return null;
  }
}

export async function getSurah(surah, options) {
  var normalizedSurah = digitsToInteger(surah);
  if (!isValidSurahNumber(normalizedSurah)) {
    throw new QuranContentError('Invalid surah number', 'INVALID_REFERENCE');
  }
  var opts = options || {};
  if (!opts.forceRefresh) {
    var cached = await cachedCompleteSurah(normalizedSurah, false);
    if (cached) return cached.map(function (record) { return publicResult(record, 'cache'); });
  }

  var url = new URL(
    QURAN_CONTENT_API.baseUrl + '/sura/' + QURAN_CONTENT_API.translationKey + '/' + normalizedSurah
  );
  try {
    var records = normalizeQuranEncSurah(await fetchJson(url, opts), {
      surah: normalizedSurah,
      translationKey: QURAN_CONTENT_API.translationKey
    });
    var cacheSucceeded = true;
    for (var i = 0; i < records.length; i += 1) {
      try { await putCachedAyah(records[i]); }
      catch (error) { cacheSucceeded = false; break; }
    }
    if (cacheSucceeded) {
      try {
        await putRecord('meta', {
          key: metaKey(normalizedSurah),
          surah: normalizedSurah,
          translationKey: QURAN_CONTENT_API.translationKey,
          totalAyahs: records.length,
          provider: QURAN_CONTENT_API.providerName,
          fetchedAt: new Date().toISOString()
        });
      } catch (error) { /* cache is optional */ }
    }
    return records.map(function (record) { return publicResult(record, 'network'); });
  } catch (error) {
    if (opts.allowStaleOnError !== false && fallbackAllowed(error)) {
      var stale = await cachedCompleteSurah(normalizedSurah, true);
      if (stale) return stale.map(function (record) { return publicResult(record, 'cache'); });
    }
    throw error;
  }
}

export async function getAyahRange(surah, ayahStart, ayahEnd, options) {
  var start = validateAyahReference(surah, ayahStart);
  var end = validateAyahReference(surah, ayahEnd);
  if (start.surah !== end.surah || end.ayah < start.ayah || end.ayah - start.ayah + 1 > 20) {
    throw new QuranContentError('Invalid ayah range', 'INVALID_REFERENCE');
  }
  var verses = await getSurah(start.surah, options);
  var result = verses.filter(function (verse) {
    return verse.ayah >= start.ayah && verse.ayah <= end.ayah;
  });
  if (result.length !== end.ayah - start.ayah + 1) {
    throw new QuranContentError('Requested ayah range was not found', 'NOT_FOUND');
  }
  return result;
}

export async function clearQuranContent() {
  await clearQuranContentCache();
  var records;
  try { records = await getAllRecords('meta'); }
  catch (error) { return; }
  var prefix = 'quran-surah:' + QURAN_CONTENT_API.translationKey + ':';
  for (var i = 0; i < records.length; i += 1) {
    if (records[i] && typeof records[i].key === 'string' && records[i].key.startsWith(prefix)) {
      await deleteRecord('meta', records[i].key);
    }
  }
}
