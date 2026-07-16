/**
 * Hayat — Validated optional prayer-log storage.
 */

import { PRAYER_KEYS, isPrayerKey } from '../config.js';
import { getRecord, putRecord, deleteRecord, getAllFromIndex } from './database.js';
import { compareDateKeys } from '../utils/date-time.js';

export const PRAYER_METHODS = Object.freeze({
  mosque_congregation: 'Në xhami me xhemat',
  home_congregation: 'Në shtëpi me xhemat',
  alone: 'Vetëm',
  qada: 'Kaza / jashtë kohës'
});

var STORE = 'prayerLogs';
var FIELDS = ['id', 'datePrayer', 'dateKey', 'prayerKey', 'status', 'method', 'loggedAt', 'updatedAt'];

function validDateKey(dateKey) {
  return compareDateKeys(dateKey, dateKey) === 0;
}

function todayKey() {
  var now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}

function validMethod(method) {
  return Object.prototype.hasOwnProperty.call(PRAYER_METHODS, method);
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function cloneRecord(record) {
  return record ? Object.assign({}, record) : null;
}

export function buildPrayerLogId(dateKey, prayerKey) {
  if (!validDateKey(dateKey) || !isPrayerKey(prayerKey)) return null;
  return dateKey + ':' + prayerKey;
}

export function validatePrayerLog(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      Object.keys(candidate).some(function (key) { return FIELDS.indexOf(key) === -1; }) ||
      FIELDS.some(function (key) { return !(key in candidate); }) ||
      !validDateKey(candidate.dateKey) || !isPrayerKey(candidate.prayerKey) ||
      candidate.status !== 'recorded' || !validMethod(candidate.method) ||
      !validIso(candidate.loggedAt) || !validIso(candidate.updatedAt)) return null;

  var id = buildPrayerLogId(candidate.dateKey, candidate.prayerKey);
  if (!id || candidate.id !== id || candidate.datePrayer !== id) return null;
  return cloneRecord(candidate);
}

function assertIdentity(dateKey, prayerKey) {
  var id = buildPrayerLogId(dateKey, prayerKey);
  if (!id) throw new TypeError('Invalid prayer-log date or prayer key');
  return id;
}

export async function getPrayerLog(dateKey, prayerKey) {
  var record = await getRecord(STORE, assertIdentity(dateKey, prayerKey));
  return record ? validatePrayerLog(record) : null;
}

export async function getPrayerLogsForDate(dateKey) {
  if (!validDateKey(dateKey)) throw new TypeError('Invalid prayer-log date');
  var records = await getAllFromIndex(STORE, 'dateKey', dateKey);
  return records.map(validatePrayerLog).filter(Boolean).sort(function (a, b) {
    return PRAYER_KEYS.indexOf(a.prayerKey) - PRAYER_KEYS.indexOf(b.prayerKey);
  }).map(cloneRecord);
}

export async function savePrayerLog(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Prayer log input must be an object');
  }
  var id = assertIdentity(input.dateKey, input.prayerKey);
  if (!validMethod(input.method)) throw new TypeError('Invalid prayer method');
  var comparison = compareDateKeys(input.dateKey, todayKey());
  if (comparison === null || comparison > 0) {
    throw new RangeError('Cannot record a prayer for a future or invalid date');
  }

  var existing = await getPrayerLog(input.dateKey, input.prayerKey);
  var now = new Date().toISOString();
  var record = {
    id: id,
    datePrayer: id,
    dateKey: input.dateKey,
    prayerKey: input.prayerKey,
    status: 'recorded',
    method: input.method,
    loggedAt: existing ? existing.loggedAt : now,
    updatedAt: now
  };
  var validated = validatePrayerLog(record);
  if (!validated) throw new TypeError('Unable to construct a valid prayer log');
  await putRecord(STORE, validated);
  return cloneRecord(validated);
}

export async function deletePrayerLog(dateKey, prayerKey) {
  await deleteRecord(STORE, assertIdentity(dateKey, prayerKey));
}

export async function countPrayerLogsForDate(dateKey) {
  return (await getPrayerLogsForDate(dateKey)).length;
}
