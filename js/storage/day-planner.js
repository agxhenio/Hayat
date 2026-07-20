/** Hayat — local-first Dita Ime records. */
import { getAllRecords, putRecord, deleteRecord } from './database.js';

const STORE = 'dayItems';
const TYPES = ['task', 'appointment', 'reminder'];
const CATEGORIES = ['', 'family', 'work', 'school', 'personal'];
const PRAYERS = ['', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_PLANS = ['none', 'before', 'after'];

function dateKeyOk(value) { return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value); }
function timeOk(value) { return value === '' || (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)); }
function noteOk(value) { return typeof value === 'string' && value.length <= 1000; }

export function validateDayItem(item) {
  if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id ||
      typeof item.title !== 'string' || !item.title.trim() || item.title.trim().length > 120 ||
      !dateKeyOk(item.dateKey) || !timeOk(item.time) || !timeOk(item.endTime || '') ||
      ((item.endTime || '') && (!item.time || item.endTime <= item.time)) ||
      TYPES.indexOf(item.type) < 0 || CATEGORIES.indexOf(item.category || '') < 0 || !noteOk(item.notes || '') ||
      PRAYERS.indexOf(item.prayerKey || '') < 0 || PRAYER_PLANS.indexOf(item.prayerPlan || 'none') < 0 ||
      (!(item.prayerKey || '') && (item.prayerPlan || 'none') !== 'none') ||
      ['open', 'completed'].indexOf(item.status) < 0 || !Number.isFinite(Date.parse(item.createdAt)) ||
      !Number.isFinite(Date.parse(item.updatedAt))) return null;

  return Object.freeze(Object.assign({}, item, {
    title: item.title.trim(),
    endTime: item.endTime || '',
    category: item.category || '',
    notes: item.notes || '',
    prayerKey: item.prayerKey || '',
    prayerPlan: item.prayerPlan || 'none'
  }));
}

export async function listDayItems(dateKey) {
  if (!dateKeyOk(dateKey)) throw new TypeError('Invalid date');
  const all = await getAllRecords(STORE);
  return all.map(validateDayItem).filter(item => item && item.dateKey === dateKey)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.createdAt.localeCompare(b.createdAt));
}

export async function createDayItem(input) {
  const now = new Date().toISOString();
  const item = validateDayItem({
    id: 'day-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9),
    title: input.title,
    dateKey: input.dateKey,
    time: input.time || '',
    endTime: input.endTime || '',
    type: input.type || 'task',
    category: input.category || '',
    notes: input.notes || '',
    prayerKey: input.prayerKey || '',
    prayerPlan: input.prayerKey ? (input.prayerPlan || 'before') : 'none',
    status: 'open',
    createdAt: now,
    updatedAt: now
  });
  if (!item) throw new TypeError('Invalid item');
  await putRecord(STORE, item);
  return item;
}

export async function updateDayItem(item, changes) {
  const valid = validateDayItem(item);
  if (!valid || !changes || typeof changes !== 'object') throw new TypeError('Invalid item update');
  const updated = validateDayItem(Object.assign({}, valid, {
    title: changes.title,
    dateKey: changes.dateKey,
    time: changes.time || '',
    endTime: changes.endTime || '',
    type: changes.type || 'task',
    category: changes.category || '',
    notes: changes.notes || '',
    prayerKey: changes.prayerKey || '',
    prayerPlan: changes.prayerKey ? (changes.prayerPlan || 'before') : 'none',
    updatedAt: new Date().toISOString()
  }));
  if (!updated) throw new TypeError('Invalid item update');
  await putRecord(STORE, updated);
  return updated;
}

export async function toggleDayItem(item) {
  const valid = validateDayItem(item);
  if (!valid) throw new TypeError('Invalid item');
  const updated = validateDayItem(Object.assign({}, valid, {
    status: valid.status === 'open' ? 'completed' : 'open',
    updatedAt: new Date().toISOString()
  }));
  await putRecord(STORE, updated);
  return updated;
}

export async function removeDayItem(id) {
  if (typeof id !== 'string' || !id) throw new TypeError('Invalid id');
  await deleteRecord(STORE, id);
}
