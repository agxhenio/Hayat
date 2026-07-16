/**
 * Hayat — Validated IndexedDB progress for Daily Dhikr routines.
 */

import {
  DAILY_DHIKR_CONTENT_VERSION,
  getDailyDhikrRoutine,
  getDailyDhikrItem,
  validateDailyDhikrContent
} from '../data/daily-dhikr.js';
import { getRecord, putRecord, deleteRecord } from './database.js';

var STORE = 'dailyDhikrSessions';
var SESSION_FIELDS = [
  'id', 'dateRoutine', 'dateKey', 'routineId', 'status', 'itemProgress',
  'currentItemId', 'startedAt', 'completedAt', 'updatedAt', 'contentVersion'
];
var ITEM_PROGRESS_FIELDS = ['count', 'completed', 'updatedAt'];

export const DAILY_DHIKR_SESSION_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
});

function validDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  var parts = value.split('-').map(Number);
  var date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getFullYear() === parts[0] && date.getMonth() === parts[1] - 1 &&
    date.getDate() === parts[2];
}

function validIso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}

function hasOnlyFields(value, allowedFields) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  var keys = Object.keys(value).sort();
  var allowed = allowedFields.slice().sort();
  return keys.length === allowed.length && keys.every(function (key, index) {
    return key === allowed[index];
  });
}

function cloneSession(session) {
  if (!session) return null;
  var copy = Object.assign({}, session, { itemProgress: {} });
  Object.keys(session.itemProgress).forEach(function (itemId) {
    copy.itemProgress[itemId] = Object.assign({}, session.itemProgress[itemId]);
  });
  return copy;
}

function assertIdentity(dateKey, routineId) {
  var id = buildDailyDhikrSessionId(dateKey, routineId);
  if (!id) throw new TypeError('Invalid Daily Dhikr date or routine');
  return id;
}

function newSession(dateKey, routineId) {
  var routine = getDailyDhikrRoutine(routineId);
  if (!routine || !validateDailyDhikrContent()) throw new TypeError('Invalid Daily Dhikr content');
  var id = assertIdentity(dateKey, routineId);
  var now = new Date().toISOString();
  var itemProgress = {};
  routine.items.forEach(function (item) {
    itemProgress[item.id] = { count: 0, completed: false, updatedAt: now };
  });
  return {
    id: id,
    dateRoutine: id,
    dateKey: dateKey,
    routineId: routineId,
    status: DAILY_DHIKR_SESSION_STATUS.IN_PROGRESS,
    itemProgress: itemProgress,
    currentItemId: routine.items[0].id,
    startedAt: now,
    completedAt: null,
    updatedAt: now,
    contentVersion: DAILY_DHIKR_CONTENT_VERSION
  };
}

export function buildDailyDhikrSessionId(dateKey, routineId) {
  return validDateKey(dateKey) && getDailyDhikrRoutine(routineId)
    ? dateKey + ':' + routineId
    : null;
}

export function validateDailyDhikrSession(candidate) {
  if (!hasOnlyFields(candidate, SESSION_FIELDS) ||
      !validDateKey(candidate.dateKey) || !getDailyDhikrRoutine(candidate.routineId) ||
      candidate.contentVersion !== DAILY_DHIKR_CONTENT_VERSION ||
      [DAILY_DHIKR_SESSION_STATUS.IN_PROGRESS, DAILY_DHIKR_SESSION_STATUS.COMPLETED]
        .indexOf(candidate.status) === -1 ||
      !validIso(candidate.startedAt) || !validIso(candidate.updatedAt) ||
      !(candidate.completedAt === null || validIso(candidate.completedAt))) return null;

  var id = buildDailyDhikrSessionId(candidate.dateKey, candidate.routineId);
  if (!id || candidate.id !== id || candidate.dateRoutine !== id) return null;

  var routine = getDailyDhikrRoutine(candidate.routineId);
  var itemIds = routine.items.map(function (item) { return item.id; });
  if (!candidate.itemProgress || typeof candidate.itemProgress !== 'object' ||
      Array.isArray(candidate.itemProgress) ||
      Object.keys(candidate.itemProgress).length !== itemIds.length ||
      Object.keys(candidate.itemProgress).some(function (itemId) {
        return itemIds.indexOf(itemId) === -1;
      })) return null;

  var allCompleted = true;
  for (var i = 0; i < routine.items.length; i += 1) {
    var item = routine.items[i];
    var progress = candidate.itemProgress[item.id];
    if (!hasOnlyFields(progress, ITEM_PROGRESS_FIELDS) ||
        !Number.isInteger(progress.count) || progress.count < 0 ||
        progress.count > item.repetitions || typeof progress.completed !== 'boolean' ||
        progress.completed !== (progress.count === item.repetitions) ||
        !validIso(progress.updatedAt)) return null;
    if (!progress.completed) allCompleted = false;
  }

  if (candidate.currentItemId !== null && itemIds.indexOf(candidate.currentItemId) === -1) {
    return null;
  }
  if (candidate.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED) {
    if (!allCompleted || !validIso(candidate.completedAt)) return null;
  } else if (allCompleted || candidate.completedAt !== null) {
    return null;
  }
  return cloneSession(candidate);
}

export async function getDailyDhikrSession(dateKey, routineId) {
  var record = await getRecord(STORE, assertIdentity(dateKey, routineId));
  return record ? validateDailyDhikrSession(record) : null;
}

export async function createDailyDhikrSession(dateKey, routineId) {
  var id = assertIdentity(dateKey, routineId);
  var existing = await getRecord(STORE, id);
  var validatedExisting = existing ? validateDailyDhikrSession(existing) : null;
  if (validatedExisting) return cloneSession(validatedExisting);
  return saveDailyDhikrSession(newSession(dateKey, routineId));
}

export async function saveDailyDhikrSession(session) {
  var validated = validateDailyDhikrSession(session);
  if (!validated) throw new TypeError('Invalid Daily Dhikr session');
  var safeCopy = cloneSession(validated);
  await putRecord(STORE, safeCopy);
  return cloneSession(safeCopy);
}

export function updateDailyDhikrItemProgress(session, itemId, count) {
  var updated = validateDailyDhikrSession(session);
  var item = updated ? getDailyDhikrItem(updated.routineId, itemId) : null;
  if (!updated || !item || !Number.isInteger(count) || count < 0 ||
      count > item.repetitions) {
    throw new TypeError('Invalid Daily Dhikr item progress');
  }
  if (updated.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED &&
      count !== updated.itemProgress[itemId].count) {
    throw new Error('A completed Daily Dhikr session is read-only');
  }

  var now = new Date().toISOString();
  updated.itemProgress[itemId] = {
    count: count,
    completed: count === item.repetitions,
    updatedAt: now
  };
  var routine = getDailyDhikrRoutine(updated.routineId);
  var allCompleted = routine.items.every(function (routineItem) {
    return updated.itemProgress[routineItem.id].completed;
  });
  updated.status = allCompleted
    ? DAILY_DHIKR_SESSION_STATUS.COMPLETED
    : DAILY_DHIKR_SESSION_STATUS.IN_PROGRESS;
  updated.completedAt = allCompleted ? (updated.completedAt || now) : null;
  updated.updatedAt = now;
  return validateDailyDhikrSession(updated);
}

export function setDailyDhikrCurrentItem(session, itemId) {
  var updated = validateDailyDhikrSession(session);
  if (!updated || !(itemId === null || getDailyDhikrItem(updated.routineId, itemId))) {
    throw new TypeError('Invalid Daily Dhikr current item');
  }
  updated.currentItemId = itemId;
  updated.updatedAt = new Date().toISOString();
  return validateDailyDhikrSession(updated);
}

export async function resetDailyDhikrSession(dateKey, routineId) {
  await deleteRecord(STORE, assertIdentity(dateKey, routineId));
}
