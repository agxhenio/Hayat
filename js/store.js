/**
 * Hayat — Observable State Store
 * Dependency-free, immutable in-memory state.
 */

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function cloneValue(value) {
  if (!isObject(value)) return value;
  if (Array.isArray(value)) return value.map(cloneValue);

  var clone = {};
  Object.keys(value).forEach(function (key) {
    clone[key] = cloneValue(value[key]);
  });
  return clone;
}

function deepFreeze(value) {
  if (!isObject(value) || Object.isFrozen(value)) return value;
  Object.keys(value).forEach(function (key) {
    deepFreeze(value[key]);
  });
  return Object.freeze(value);
}

function snapshot(value) {
  return deepFreeze(cloneValue(value));
}

function createInitialState() {
  return {
    app: {
      ready: false,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      error: null
    },
    route: {
      current: null,
      previous: null,
      params: {}
    },
    settings: null
  };
}

function normalizePath(path) {
  var keys;

  if (Array.isArray(path)) {
    keys = path.slice();
  } else if (typeof path === 'string') {
    if (path.trim() === '') throw new TypeError('Path must not be empty');
    keys = path.split('.');
  } else {
    throw new TypeError('Path must be a dot-separated string or an array');
  }

  if (keys.length === 0 || keys.some(function (key) {
    return (typeof key !== 'string' && typeof key !== 'number') || String(key) === '';
  })) {
    throw new TypeError('Path contains an invalid key');
  }

  return keys.map(String);
}

function pathKey(path) {
  return normalizePath(path).join('.');
}

function getByKeys(object, keys) {
  var current = object;
  for (var i = 0; i < keys.length; i += 1) {
    if (current === null || current === undefined) return undefined;
    current = current[keys[i]];
  }
  return current;
}

function getByPath(object, path) {
  return getByKeys(object, normalizePath(path));
}

function cloneContainer(value, nextKey) {
  if (Array.isArray(value)) return value.slice();
  if (isObject(value)) return Object.assign({}, value);
  return /^\d+$/.test(String(nextKey)) ? [] : {};
}

function setByPath(object, path, value) {
  var keys = normalizePath(path);
  var root = cloneContainer(object, keys[0]);
  var sourceCursor = object;
  var targetCursor = root;

  for (var i = 0; i < keys.length - 1; i += 1) {
    var key = keys[i];
    var nextKey = keys[i + 1];
    var sourceValue = isObject(sourceCursor) ? sourceCursor[key] : undefined;
    var nextContainer = cloneContainer(sourceValue, nextKey);

    targetCursor[key] = nextContainer;
    targetCursor = nextContainer;
    sourceCursor = sourceValue;
  }

  targetCursor[keys[keys.length - 1]] = value;
  return root;
}

function reportListenerError(message, error) {
  setTimeout(function () {
    console.error(message, error);
  }, 0);
}

var state = createInitialState();
var subscribers = new Set();
var pathSubscribers = new Map();

function notify(nextState, previousState, metadata) {
  var nextSnapshot = snapshot(nextState);
  var previousSnapshot = snapshot(previousState);

  Array.from(subscribers).forEach(function (listener) {
    try {
      listener(nextSnapshot, previousSnapshot, metadata);
    } catch (error) {
      reportListenerError('[Hayat Store] Subscriber error:', error);
    }
  });

  pathSubscribers.forEach(function (listeners, watchedPath) {
    var keys = watchedPath.split('.');
    var nextValue = getByKeys(nextState, keys);
    var previousValue = getByKeys(previousState, keys);
    if (Object.is(nextValue, previousValue)) return;

    var nextValueSnapshot = snapshot(nextValue);
    var previousValueSnapshot = snapshot(previousValue);

    Array.from(listeners).forEach(function (listener) {
      try {
        listener(nextValueSnapshot, previousValueSnapshot, metadata);
      } catch (error) {
        reportListenerError(
          '[Hayat Store] Path subscriber error for "' + watchedPath + '":',
          error
        );
      }
    });
  });
}

export function getState() {
  return snapshot(state);
}

export function get(path) {
  return snapshot(getByPath(state, path));
}

export function set(path, value, metadata) {
  var previousValue = getByPath(state, path);
  if (Object.is(previousValue, value)) return false;

  var previousState = state;
  state = setByPath(state, path, value);
  notify(state, previousState, metadata);
  return true;
}

export function update(path, updater, metadata) {
  if (typeof updater !== 'function') {
    throw new TypeError('Updater must be a function');
  }
  return set(path, updater(get(path)), metadata);
}

export function subscribe(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Listener must be a function');
  }
  subscribers.add(listener);
  return function unsubscribe() {
    subscribers.delete(listener);
  };
}

export function subscribeTo(path, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Listener must be a function');
  }

  var key = pathKey(path);
  var listeners = pathSubscribers.get(key);
  if (!listeners) {
    listeners = new Set();
    pathSubscribers.set(key, listeners);
  }
  listeners.add(listener);

  return function unsubscribe() {
    listeners.delete(listener);
    if (listeners.size === 0) pathSubscribers.delete(key);
  };
}

export function reset(nextInitialState) {
  if (nextInitialState !== undefined && !isObject(nextInitialState)) {
    throw new TypeError('Reset state must be an object');
  }

  var previousState = state;
  state = nextInitialState === undefined
    ? createInitialState()
    : cloneValue(nextInitialState);
  notify(state, previousState, { reset: true });
}
