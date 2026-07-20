/** Hayat — local-first Dita Ime records.
*/
import { getAllRecords, putRecord, deleteRecord } from './database.js';
const STORE = 'dayItems';
const TYPES = ['task', 'appointment', 'reminder'];
const PRAYERS = ['', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_PLANS = ['none', 'before', 'after'];
function dateKeyOk(v) { return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v); }
function timeOk(v) { return v === '' || (typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v)); }
export function validateDayItem(x) {
  if (!x || typeof x !== 'object' || typeof x.id !== 'string' || !x.id ||
      typeof x.title !== 'string' || !x.title.trim() || x.title.trim().length > 120 ||
      !dateKeyOk(x.dateKey) || !timeOk(x.time) || !timeOk(x.endTime || '') ||
      ((x.endTime || '') && (!x.time || x.endTime <= x.time)) || TYPES.indexOf(x.type) < 0 ||
      PRAYERS.indexOf(x.prayerKey || '') < 0 || PRAYER_PLANS.indexOf(x.prayerPlan || 'none') < 0 ||
      (!(x.prayerKey || '') && (x.prayerPlan || 'none') !== 'none') ||
      ['open', 'completed'].indexOf(x.status) < 0 || !Number.isFinite(Date.parse(x.createdAt)) ||
      !Number.isFinite(Date.parse(x.updatedAt))) return null;
  return Object.freeze(Object.assign({}, x, { title: x.title.trim(), endTime: x.endTime || '', prayerKey: x.prayerKey || '', prayerPlan: x.prayerPlan || 'none' }));
}
export async function listDayItems(dateKey) {
  if (!dateKeyOk(dateKey)) throw new TypeError('Invalid date');
  const all = await getAllRecords(STORE);
  return all.map(validateDayItem).filter(x => x && x.dateKey === dateKey)
    .sort((a,b) => (a.time || '99:99').localeCompare(b.time || '99:99') || a.createdAt.localeCompare(b.createdAt));
}
export async function createDayItem(input) {
  const now = new Date().toISOString();
  const item = validateDayItem({ id: 'day-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,9), title: input.title, dateKey: input.dateKey, time: input.time || '', endTime: input.endTime || '', type: input.type || 'task', prayerKey: input.prayerKey || '', prayerPlan: input.prayerKey ? (input.prayerPlan || 'before') : 'none', status: 'open', createdAt: now, updatedAt: now });
  if (!item) throw new TypeError('Invalid item');
  await putRecord(STORE, item); return item;
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
    prayerKey: changes.prayerKey || '',
    prayerPlan: changes.prayerKey ? (changes.prayerPlan || 'before') : 'none',
    updatedAt: new Date().toISOString()
  }));
  if (!updated) throw new TypeError('Invalid item update');
  await putRecord(STORE, updated);
  return updated;
}
export async function toggleDayItem(item) {
  const valid = validateDayItem(item); if (!valid) throw new TypeError('Invalid item');
  const updated = validateDayItem(Object.assign({}, valid, { status: valid.status === 'open' ? 'completed' : 'open', updatedAt: new Date().toISOString() }));
  await putRecord(STORE, updated); return updated;
}
export async function removeDayItem(id) { if (typeof id !== 'string' || !id) throw new TypeError('Invalid id'); await deleteRecord(STORE, id); }
