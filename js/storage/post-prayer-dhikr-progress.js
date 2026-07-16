/**
 * Hayat — Validated IndexedDB storage for post-prayer dhikr sessions.
 */

import { isPrayerKey } from '../config.js';
import {
  POST_PRAYER_DHIKR_VERSION,
  POST_PRAYER_DHIKR_SEQUENCE,
  getPostPrayerDhikrSequence,
  validatePostPrayerDhikrContent
} from '../data/post-prayer-dhikr.js';
import { getRecord, putRecord, deleteRecord, getAllFromIndex } from './database.js';
import { compareDateKeys } from '../utils/date-time.js';

var STORE = 'postPrayerDhikrSessions';
var FIELDS = [
  'id', 'datePrayer', 'dateKey', 'prayerKey', 'contentVersion', 'status',
  'currentItemId', 'currentCount', 'completedItemIds', 'startedAt',
  'updatedAt', 'completedAt'
];

export const DHIKR_SESSION_STATUSES = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  COMPLETED_EXTERNAL: 'completed_external'
});

function statusAllowed(status) {
  return Object.values(DHIKR_SESSION_STATUSES).indexOf(status) !== -1;
}

function validDateKey(dateKey) {
  return compareDateKeys(dateKey, dateKey) === 0;
}

function todayKey() {
  var now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function cloneSession(session) {
  if (!session) return null;
  var copy = Object.assign({}, session);
  copy.completedItemIds = session.completedItemIds.slice();
  return copy;
}

function sequenceFor(prayerKey) {
  var sequence = getPostPrayerDhikrSequence(prayerKey);
  if (!sequence || !validatePostPrayerDhikrContent()) return null;
  return sequence;
}

export function buildPostPrayerDhikrSessionId(dateKey, prayerKey) {
  if (!validDateKey(dateKey) || !isPrayerKey(prayerKey)) return null;
  return dateKey + ':' + prayerKey;
}

export function validatePostPrayerDhikrSession(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
      Object.keys(candidate).some(function (key) { return FIELDS.indexOf(key) === -1; }) ||
      FIELDS.some(function (key) { return !(key in candidate); }) ||
      !validDateKey(candidate.dateKey) || !isPrayerKey(candidate.prayerKey) ||
      candidate.contentVersion !== POST_PRAYER_DHIKR_VERSION ||
      !statusAllowed(candidate.status) || !validIso(candidate.updatedAt)) return null;

  var id = buildPostPrayerDhikrSessionId(candidate.dateKey, candidate.prayerKey);
  if (!id || candidate.id !== id || candidate.datePrayer !== id) return null;
  if (candidate.startedAt !== null && !validIso(candidate.startedAt)) return null;
  if (candidate.completedAt !== null && !validIso(candidate.completedAt)) return null;
  if (!Array.isArray(candidate.completedItemIds) ||
      new Set(candidate.completedItemIds).size !== candidate.completedItemIds.length) return null;

  var sequence = sequenceFor(candidate.prayerKey);
  if (!sequence) return null;
  var ids = sequence.map(function (item) { return item.id; });
  if (candidate.completedItemIds.some(function (itemId) { return ids.indexOf(itemId) === -1; })) {
    return null;
  }
  for (var i = 1; i < candidate.completedItemIds.length; i += 1) {
    if (ids.indexOf(candidate.completedItemIds[i]) <=
        ids.indexOf(candidate.completedItemIds[i - 1])) return null;
  }

  if (candidate.currentItemId !== null && ids.indexOf(candidate.currentItemId) === -1) return null;
  if (!Number.isInteger(candidate.currentCount) || candidate.currentCount < 0) return null;
  if (candidate.currentItemId) {
    var currentItem = sequence[ids.indexOf(candidate.currentItemId)];
    if (candidate.currentCount > currentItem.targetRepetitions) return null;
  } else if (candidate.currentCount !== 0) return null;

  if (candidate.status === DHIKR_SESSION_STATUSES.IN_PROGRESS) {
    if (!candidate.startedAt || candidate.completedAt !== null || !candidate.currentItemId) return null;
  }
  if (candidate.status === DHIKR_SESSION_STATUSES.COMPLETED) {
    if (!candidate.startedAt || !candidate.completedAt ||
        candidate.completedItemIds.length !== ids.length ||
        candidate.completedItemIds.some(function (itemId, index) { return itemId !== ids[index]; })) {
      return null;
    }
  }
  if (candidate.status === DHIKR_SESSION_STATUSES.COMPLETED_EXTERNAL) {
    if (!candidate.completedAt) return null;
  }
  return cloneSession(candidate);
}

function assertIdentity(dateKey, prayerKey) {
  var id = buildPostPrayerDhikrSessionId(dateKey, prayerKey);
  if (!id) throw new TypeError('Invalid dhikr-session date or prayer key');
  if (compareDateKeys(dateKey, todayKey()) > 0) {
    throw new RangeError('Cannot create a dhikr session for a future date');
  }
  return id;
}

async function writeValidated(session) {
  var validated = validatePostPrayerDhikrSession(session);
  if (!validated) throw new TypeError('Invalid post-prayer dhikr session');
  await putRecord(STORE, validated);
  return cloneSession(validated);
}

export async function getPostPrayerDhikrSession(dateKey, prayerKey) {
  var record = await getRecord(STORE, assertIdentity(dateKey, prayerKey));
  return record ? validatePostPrayerDhikrSession(record) : null;
}

export async function getPostPrayerDhikrSessionsForDate(dateKey) {
  if (!validDateKey(dateKey)) throw new TypeError('Invalid dhikr-session date');
  var records = await getAllFromIndex(STORE, 'dateKey', dateKey);
  return records.map(validatePostPrayerDhikrSession).filter(Boolean).sort(function (a, b) {
    var order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    return order.indexOf(a.prayerKey) - order.indexOf(b.prayerKey);
  }).map(cloneSession);
}

export async function startOrResumePostPrayerDhikr(dateKey, prayerKey) {
  var id = assertIdentity(dateKey, prayerKey);
  var existing = await getRecord(STORE, id);
  var validatedExisting = existing ? validatePostPrayerDhikrSession(existing) : null;
  if (validatedExisting) return cloneSession(validatedExisting);

  var sequence = sequenceFor(prayerKey);
  if (!sequence || !sequence.length) throw new TypeError('Invalid dhikr content');
  var now = new Date().toISOString();
  return writeValidated({
    id: id,
    datePrayer: id,
    dateKey: dateKey,
    prayerKey: prayerKey,
    contentVersion: POST_PRAYER_DHIKR_VERSION,
    status: DHIKR_SESSION_STATUSES.IN_PROGRESS,
    currentItemId: sequence[0].id,
    currentCount: 0,
    completedItemIds: [],
    startedAt: now,
    updatedAt: now,
    completedAt: null
  });
}

export async function savePostPrayerDhikrProgress(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Progress input must be an object');
  }
  assertIdentity(input.dateKey, input.prayerKey);
  var existing = await getPostPrayerDhikrSession(input.dateKey, input.prayerKey);
  if (!existing || existing.status !== DHIKR_SESSION_STATUSES.IN_PROGRESS) {
    throw new Error('An active dhikr session is required');
  }
  return writeValidated(Object.assign({}, existing, {
    currentItemId: input.currentItemId,
    currentCount: input.currentCount,
    completedItemIds: Array.isArray(input.completedItemIds)
      ? input.completedItemIds.slice() : input.completedItemIds,
    updatedAt: new Date().toISOString()
  }));
}

export async function completePostPrayerDhikr(dateKey, prayerKey) {
  var existing = await getPostPrayerDhikrSession(dateKey, prayerKey);
  if (!existing || existing.status !== DHIKR_SESSION_STATUSES.IN_PROGRESS) {
    throw new Error('An active dhikr session is required');
  }
  var now = new Date().toISOString();
  return writeValidated(Object.assign({}, existing, {
    status: DHIKR_SESSION_STATUSES.COMPLETED,
    updatedAt: now,
    completedAt: now
  }));
}

export async function markPostPrayerDhikrCompletedExternally(dateKey, prayerKey) {
  var id = assertIdentity(dateKey, prayerKey);
  var existing = await getRecord(STORE, id);
  var validExisting = existing ? validatePostPrayerDhikrSession(existing) : null;
  var now = new Date().toISOString();
  return writeValidated({
    id: id,
    datePrayer: id,
    dateKey: dateKey,
    prayerKey: prayerKey,
    contentVersion: POST_PRAYER_DHIKR_VERSION,
    status: DHIKR_SESSION_STATUSES.COMPLETED_EXTERNAL,
    currentItemId: validExisting ? validExisting.currentItemId : null,
    currentCount: validExisting ? validExisting.currentCount : 0,
    completedItemIds: validExisting ? validExisting.completedItemIds.slice() : [],
    startedAt: validExisting ? validExisting.startedAt : null,
    updatedAt: now,
    completedAt: now
  });
}

export async function resetPostPrayerDhikrSession(dateKey, prayerKey) {
  await deleteRecord(STORE, assertIdentity(dateKey, prayerKey));
}
