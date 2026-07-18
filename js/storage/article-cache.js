/**
 * Hayat — Local article manifest/content cache.
 */

import { getRecord, putRecord, deleteRecord } from './database.js';

var STORE = 'articles';
var MANIFEST_ID = '__articles_manifest__';

function clone(value) {
  if (value === undefined || value === null) return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export async function getCachedArticleManifest() {
  var record = await getRecord(STORE, MANIFEST_ID);
  return record && record.type === 'manifest' ? clone(record.payload) : null;
}

export async function saveCachedArticleManifest(manifest) {
  var record = {
    id: MANIFEST_ID,
    type: 'manifest',
    payload: clone(manifest),
    updatedAt: new Date().toISOString()
  };
  await putRecord(STORE, record);
  return clone(manifest);
}

export async function getCachedArticle(articleId) {
  var record = await getRecord(STORE, 'article:' + articleId);
  return record && record.type === 'article' ? clone(record.payload) : null;
}

export async function saveCachedArticle(article) {
  var record = {
    id: 'article:' + article.id,
    type: 'article',
    payload: clone(article),
    updatedAt: new Date().toISOString()
  };
  await putRecord(STORE, record);
  return clone(article);
}

export function removeCachedArticle(articleId) {
  return deleteRecord(STORE, 'article:' + articleId);
}
