/**
 * Hayat — Versioned article manifest, safe article content and offline assets.
 */

import {
  getCachedArticleManifest,
  saveCachedArticleManifest,
  getCachedArticle,
  saveCachedArticle,
  removeCachedArticle
} from '../storage/article-cache.js';

var MANIFEST_URL = 'content/articles/index.json';
var ASSET_CACHE = 'hayat-article-assets-v1';
var TIMEOUT_MS = 10000;
var META_FIELDS = [
  'id', 'titleSq', 'authorSq', 'categorySq', 'publishedAt', 'readingMinutes',
  'excerptSq', 'imageUrl', 'contentUrl'
];
var ARTICLE_FIELDS = ['id', 'titleSq', 'authorSq', 'publishedAt', 'blocks'];
var BLOCK_TYPES = ['paragraph', 'heading2', 'heading3', 'quote', 'list'];

export class ArticleError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.name = 'ArticleError';
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

function plain(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function onlyFields(value, fields) {
  return plain(value) && Object.keys(value).length === fields.length &&
    Object.keys(value).every(function (key) { return fields.indexOf(key) !== -1; });
}

function text(value, max) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + 'T00:00:00Z'));
}

function safeRelativeUrl(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 500 &&
    !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith('//') &&
    !value.split(/[?#]/)[0].split('/').some(function (part) { return part === '..'; });
}

function freezeMeta(meta) {
  return Object.freeze(Object.assign({}, meta));
}

export function validateArticleMeta(candidate) {
  if (!onlyFields(candidate, META_FIELDS) || !/^[a-z0-9][a-z0-9-]{1,79}$/.test(candidate.id) ||
      !text(candidate.titleSq, 180) || !text(candidate.authorSq, 100) ||
      !text(candidate.categorySq, 80) || !validDate(candidate.publishedAt) ||
      !Number.isInteger(candidate.readingMinutes) || candidate.readingMinutes < 1 ||
      candidate.readingMinutes > 120 || !text(candidate.excerptSq, 300) ||
      !safeRelativeUrl(candidate.imageUrl) || !safeRelativeUrl(candidate.contentUrl)) return null;
  return freezeMeta(candidate);
}

export function validateArticleManifest(candidate) {
  if (!plain(candidate) || Object.keys(candidate).some(function (key) {
    return ['version', 'updatedAt', 'articles'].indexOf(key) === -1;
  }) || !Number.isInteger(candidate.version) || candidate.version < 1 ||
      typeof candidate.updatedAt !== 'string' || !Number.isFinite(Date.parse(candidate.updatedAt)) ||
      !Array.isArray(candidate.articles) || candidate.articles.length > 100) return null;
  var ids = new Set();
  var articles = [];
  for (var i = 0; i < candidate.articles.length; i += 1) {
    var meta = validateArticleMeta(candidate.articles[i]);
    if (!meta || ids.has(meta.id)) return null;
    ids.add(meta.id);
    articles.push(meta);
  }
  return Object.freeze({
    version: candidate.version,
    updatedAt: candidate.updatedAt,
    articles: Object.freeze(articles)
  });
}

function validateBlock(candidate) {
  if (!plain(candidate) || BLOCK_TYPES.indexOf(candidate.type) === -1) return null;
  if (candidate.type === 'list') {
    if (Object.keys(candidate).length !== 2 || !Array.isArray(candidate.items) ||
        candidate.items.length < 1 || candidate.items.length > 30 ||
        !candidate.items.every(function (item) { return text(item, 1000); })) return null;
    return Object.freeze({ type: 'list', items: Object.freeze(candidate.items.slice()) });
  }
  if (Object.keys(candidate).length !== 2 || !text(candidate.text, 5000)) return null;
  return Object.freeze({ type: candidate.type, text: candidate.text });
}

export function validateArticle(candidate) {
  if (!onlyFields(candidate, ARTICLE_FIELDS) ||
      !/^[a-z0-9][a-z0-9-]{1,79}$/.test(candidate.id) ||
      !text(candidate.titleSq, 180) || !text(candidate.authorSq, 100) ||
      !validDate(candidate.publishedAt) || !Array.isArray(candidate.blocks) ||
      candidate.blocks.length < 1 || candidate.blocks.length > 300) return null;
  var blocks = candidate.blocks.map(validateBlock);
  if (blocks.some(function (block) { return !block; })) return null;
  return Object.freeze({
    id: candidate.id,
    titleSq: candidate.titleSq,
    authorSq: candidate.authorSq,
    publishedAt: candidate.publishedAt,
    blocks: Object.freeze(blocks)
  });
}

async function fetchJson(url, signal) {
  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
  var abort = function () { controller.abort(); };
  if (signal) signal.addEventListener('abort', abort, { once: true });
  try {
    var response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new ArticleError('Article request failed', 'HTTP_ERROR');
    return await response.json();
  } catch (error) {
    if (error instanceof ArticleError) throw error;
    throw new ArticleError('Article network request failed',
      controller.signal.aborted ? 'ABORTED' : 'NETWORK_ERROR', error);
  } finally {
    clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', abort);
  }
}

export async function getArticlesManifest(options) {
  var signal = options && options.signal;
  try {
    var manifest = validateArticleManifest(await fetchJson(MANIFEST_URL, signal));
    if (!manifest) throw new ArticleError('Invalid article manifest', 'INVALID_RESPONSE');
    try { await saveCachedArticleManifest(manifest); } catch (error) { /* cache is optional */ }
    return manifest;
  } catch (error) {
    if (error.code === 'ABORTED') throw error;
    var cached = null;
    try { cached = validateArticleManifest(await getCachedArticleManifest()); } catch (cacheError) { /* no cache */ }
    if (cached) return cached;
    throw error;
  }
}

export async function getArticle(meta, options) {
  var preferCache = options && options.preferCache;
  var signal = options && options.signal;
  if (preferCache) {
    try {
      var cachedFirst = validateArticle(await getCachedArticle(meta.id));
      if (cachedFirst) return cachedFirst;
    } catch (error) { /* continue to network */ }
  }
  try {
    var article = validateArticle(await fetchJson(meta.contentUrl, signal));
    if (!article || article.id !== meta.id) {
      throw new ArticleError('Invalid article content', 'INVALID_RESPONSE');
    }
    try { await saveCachedArticle(article); } catch (error) { /* cache is optional */ }
    return article;
  } catch (error) {
    if (error.code === 'ABORTED') throw error;
    var cached = null;
    try { cached = validateArticle(await getCachedArticle(meta.id)); } catch (cacheError) { /* no cache */ }
    if (cached) return cached;
    throw error;
  }
}

export async function saveArticleOffline(meta) {
  var article = await getArticle(meta, { preferCache: false });
  if (typeof caches !== 'undefined' && meta.imageUrl) {
    var cache = await caches.open(ASSET_CACHE);
    await cache.add(meta.imageUrl);
  }
  return article;
}

export async function removeArticleOffline(meta) {
  await removeCachedArticle(meta.id);
  if (typeof caches !== 'undefined' && meta.imageUrl) {
    var cache = await caches.open(ASSET_CACHE);
    await cache.delete(meta.imageUrl);
  }
}

export async function getCachedArticleImageUrl(meta) {
  if (typeof caches === 'undefined' || typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function') return null;
  try {
    var cache = await caches.open(ASSET_CACHE);
    var response = await cache.match(meta.imageUrl);
    if (!response) return null;
    return URL.createObjectURL(await response.blob());
  } catch (error) {
    return null;
  }
}

export async function isArticleOffline(meta) {
  try {
    var articleAvailable = Boolean(validateArticle(await getCachedArticle(meta.id)));
    if (!articleAvailable) return false;
    if (typeof caches === 'undefined' || !meta.imageUrl) return articleAvailable;
    var cache = await caches.open(ASSET_CACHE);
    return Boolean(await cache.match(meta.imageUrl));
  } catch (error) {
    return false;
  }
}
