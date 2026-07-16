/**
 * Hayat — Promise-based IndexedDB foundation.
 */

var DB_NAME = 'hayat-db';
var DB_VERSION = 3;
var STORES = Object.freeze([
  'prayerLogs',
  'postPrayerDhikrSessions',
  'quranContent',
  'meta'
]);
var INDEXES = Object.freeze({
  prayerLogs: Object.freeze(['datePrayer', 'dateKey', 'prayerKey', 'loggedAt']),
  postPrayerDhikrSessions: Object.freeze([
    'datePrayer',
    'dateKey',
    'prayerKey',
    'status',
    'updatedAt'
  ]),
  quranContent: Object.freeze([
    'verseTranslation',
    'verseKey',
    'surah',
    'translationKey',
    'updatedAt'
  ]),
  meta: Object.freeze([])
});

export class DatabaseError extends Error {
  constructor(message, code, options) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.recoverable = !options || options.recoverable !== false;
    if (options && options.cause !== undefined) this.cause = options.cause;
  }
}

var connectionPromise = null;
var connection = null;

function cloneData(value) {
  if (value === undefined || value === null) return value;
  if (typeof structuredClone === 'function') {
    try { return structuredClone(value); } catch (error) { /* use fallback */ }
  }
  return JSON.parse(JSON.stringify(value));
}

function assertStore(storeName) {
  if (STORES.indexOf(storeName) === -1) {
    throw new DatabaseError('Invalid database store', 'INVALID_STORE', { recoverable: false });
  }
}

function assertIndex(storeName, indexName) {
  assertStore(storeName);
  if (INDEXES[storeName].indexOf(indexName) === -1) {
    throw new DatabaseError('Invalid database index', 'INVALID_INDEX', { recoverable: false });
  }
}

function errorFromTransaction(transaction, message, code) {
  return new DatabaseError(message, code || 'TRANSACTION_FAILED', {
    cause: transaction.error,
    recoverable: true
  });
}

export function openDatabase() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new DatabaseError(
      'IndexedDB is unavailable',
      'UNSUPPORTED',
      { recoverable: true }
    ));
  }
  if (connection) return Promise.resolve(connection);
  if (connectionPromise) return connectionPromise;

  connectionPromise = new Promise(function (resolve, reject) {
    var request;
    var settled = false;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      connectionPromise = null;
      reject(new DatabaseError('Unable to open database', 'OPEN_FAILED', {
        cause: error,
        recoverable: true
      }));
      return;
    }

    request.onupgradeneeded = function (event) {
      var database = event.target.result;
      var prayerStore;
      if (!database.objectStoreNames.contains('prayerLogs')) {
        prayerStore = database.createObjectStore('prayerLogs', { keyPath: 'id' });
      } else {
        prayerStore = event.target.transaction.objectStore('prayerLogs');
      }
      if (!prayerStore.indexNames.contains('datePrayer')) {
        prayerStore.createIndex('datePrayer', 'datePrayer', { unique: true });
      }
      if (!prayerStore.indexNames.contains('dateKey')) {
        prayerStore.createIndex('dateKey', 'dateKey', { unique: false });
      }
      if (!prayerStore.indexNames.contains('prayerKey')) {
        prayerStore.createIndex('prayerKey', 'prayerKey', { unique: false });
      }
      if (!prayerStore.indexNames.contains('loggedAt')) {
        prayerStore.createIndex('loggedAt', 'loggedAt', { unique: false });
      }
      var dhikrStore;
      if (!database.objectStoreNames.contains('postPrayerDhikrSessions')) {
        dhikrStore = database.createObjectStore('postPrayerDhikrSessions', {
          keyPath: 'id'
        });
      } else {
        dhikrStore = event.target.transaction.objectStore('postPrayerDhikrSessions');
      }
      if (!dhikrStore.indexNames.contains('datePrayer')) {
        dhikrStore.createIndex('datePrayer', 'datePrayer', { unique: true });
      }
      if (!dhikrStore.indexNames.contains('dateKey')) {
        dhikrStore.createIndex('dateKey', 'dateKey', { unique: false });
      }
      if (!dhikrStore.indexNames.contains('prayerKey')) {
        dhikrStore.createIndex('prayerKey', 'prayerKey', { unique: false });
      }
      if (!dhikrStore.indexNames.contains('status')) {
        dhikrStore.createIndex('status', 'status', { unique: false });
      }
      if (!dhikrStore.indexNames.contains('updatedAt')) {
        dhikrStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      var quranStore;
      if (!database.objectStoreNames.contains('quranContent')) {
        quranStore = database.createObjectStore('quranContent', {
          keyPath: 'key'
        });
      } else {
        quranStore = event.target.transaction.objectStore('quranContent');
      }
      if (!quranStore.indexNames.contains('verseTranslation')) {
        quranStore.createIndex('verseTranslation', 'verseTranslation', { unique: true });
      }
      if (!quranStore.indexNames.contains('verseKey')) {
        quranStore.createIndex('verseKey', 'verseKey', { unique: false });
      }
      if (!quranStore.indexNames.contains('surah')) {
        quranStore.createIndex('surah', 'surah', { unique: false });
      }
      if (!quranStore.indexNames.contains('translationKey')) {
        quranStore.createIndex('translationKey', 'translationKey', { unique: false });
      }
      if (!quranStore.indexNames.contains('updatedAt')) {
        quranStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!database.objectStoreNames.contains('meta')) {
        database.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onerror = function () {
      connectionPromise = null;
      if (!settled) {
        settled = true;
        reject(new DatabaseError('Database open failed', 'OPEN_FAILED', {
          cause: request.error,
          recoverable: true
        }));
      }
    };

    request.onblocked = function () {
      connectionPromise = null;
      if (!settled) {
        settled = true;
        reject(new DatabaseError('Database upgrade is blocked', 'BLOCKED', {
          recoverable: true
        }));
      }
    };

    request.onsuccess = function () {
      var database = request.result;
      if (settled) {
        database.close();
        return;
      }
      settled = true;
      connection = database;
      database.onversionchange = function () {
        database.close();
        connection = null;
        connectionPromise = null;
      };
      resolve(database);
    };
  });

  return connectionPromise;
}

export function closeDatabase() {
  if (connection) connection.close();
  connection = null;
  connectionPromise = null;
}

async function runRequest(storeName, mode, operation, failureCode) {
  assertStore(storeName);
  var database = await openDatabase();
  return new Promise(function (resolve, reject) {
    var transaction;
    var request;
    var requestResult;
    var failed = false;

    try {
      transaction = database.transaction(storeName, mode);
      request = operation(transaction.objectStore(storeName));
    } catch (error) {
      reject(new DatabaseError('Unable to start database operation', failureCode, {
        cause: error,
        recoverable: true
      }));
      return;
    }

    request.onsuccess = function () {
      requestResult = cloneData(request.result);
    };
    request.onerror = function () {
      failed = true;
    };
    transaction.oncomplete = function () {
      if (!failed) resolve(requestResult);
    };
    transaction.onerror = function () {
      reject(errorFromTransaction(transaction, 'Database transaction failed', failureCode));
    };
    transaction.onabort = function () {
      reject(errorFromTransaction(transaction, 'Database transaction aborted', 'TRANSACTION_FAILED'));
    };
  });
}

export function getRecord(storeName, key) {
  return runRequest(storeName, 'readonly', function (store) {
    return store.get(key);
  }, 'READ_FAILED');
}

export function putRecord(storeName, value) {
  var safeValue = cloneData(value);
  return runRequest(storeName, 'readwrite', function (store) {
    return store.put(safeValue);
  }, 'WRITE_FAILED');
}

export function deleteRecord(storeName, key) {
  return runRequest(storeName, 'readwrite', function (store) {
    return store.delete(key);
  }, 'DELETE_FAILED');
}

export function getAllRecords(storeName) {
  return runRequest(storeName, 'readonly', function (store) {
    return store.getAll();
  }, 'READ_FAILED').then(function (records) {
    return records || [];
  });
}

export async function getAllFromIndex(storeName, indexName, query) {
  assertIndex(storeName, indexName);
  var database = await openDatabase();
  return new Promise(function (resolve, reject) {
    var transaction;
    var request;
    var result = [];
    try {
      transaction = database.transaction(storeName, 'readonly');
      var index = transaction.objectStore(storeName).index(indexName);
      request = query === undefined ? index.getAll() : index.getAll(query);
    } catch (error) {
      reject(new DatabaseError('Unable to read database index', 'READ_FAILED', {
        cause: error,
        recoverable: true
      }));
      return;
    }
    request.onsuccess = function () { result = cloneData(request.result || []); };
    transaction.oncomplete = function () { resolve(result); };
    transaction.onerror = function () {
      reject(errorFromTransaction(transaction, 'Index read failed', 'READ_FAILED'));
    };
    transaction.onabort = function () {
      reject(errorFromTransaction(transaction, 'Index transaction aborted', 'TRANSACTION_FAILED'));
    };
  });
}

export function clearStore(storeName) {
  return runRequest(storeName, 'readwrite', function (store) {
    return store.clear();
  }, 'DELETE_FAILED');
}
