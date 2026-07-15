/**
 * Hayat — Event Bus
 *
 * A small, dependency-free publish/subscribe event system.
 * Uses Map<string, Set<Function>> internally for efficient listener management.
 * Listener errors are isolated and do not prevent other listeners from running.
 *
 * This module imports nothing and has no side effects.
 *
 * @module events
 */

// ====================================================================
// INTERNAL STATE
// ====================================================================

/** @type {Map<string, Set<Function>>} */
var listeners = new Map();

// ====================================================================
// EVENT NAME CONSTANTS
// ====================================================================

/**
 * Immutable map of application event names.
 * Use these constants instead of raw strings to prevent typos.
 */
export var EVENTS = Object.freeze({
  APP_READY: 'app:ready',
  ROUTE_BEFORE_CHANGE: 'route:before-change',
  ROUTE_CHANGED: 'route:changed',
  SETTINGS_CHANGED: 'settings:changed',
  THEME_CHANGED: 'theme:changed',
  ONLINE_CHANGED: 'online:changed',
  ERROR: 'error'
});

// ====================================================================
// CORE API
// ====================================================================

/**
 * Register a listener for an event.
 *
 * @param {string} eventName - The event name (use EVENTS constants).
 * @param {Function} listener - The callback function.
 * @returns {Function} An unsubscribe function that removes this listener.
 * @throws {TypeError} If eventName is not a string or listener is not a function.
 */
export function on(eventName, listener) {
  if (typeof eventName !== 'string' || eventName.length === 0) {
    throw new TypeError('Event name must be a non-empty string');
  }
  if (typeof listener !== 'function') {
    throw new TypeError('Listener must be a function');
  }

  var set = listeners.get(eventName);
  if (!set) {
    set = new Set();
    listeners.set(eventName, set);
  }
  set.add(listener);

  // Return unsubscribe function
  return function unsubscribe() {
    off(eventName, listener);
  };
}

/**
 * Register a one-time listener that automatically unsubscribes after firing once.
 *
 * @param {string} eventName - The event name.
 * @param {Function} listener - The callback function.
 * @returns {Function} An unsubscribe function.
 * @throws {TypeError} If eventName is not a string or listener is not a function.
 */
export function once(eventName, listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('Listener must be a function');
  }

  var unsubscribe;
  var wrapper = function (detail) {
    unsubscribe();
    listener(detail);
  };

  unsubscribe = on(eventName, wrapper);
  return unsubscribe;
}

/**
 * Remove a specific listener from an event.
 *
 * @param {string} eventName - The event name.
 * @param {Function} listener - The listener to remove.
 * @returns {boolean} True if the listener was found and removed.
 */
export function off(eventName, listener) {
  if (typeof eventName !== 'string') return false;
  if (typeof listener !== 'function') return false;

  var set = listeners.get(eventName);
  if (!set) return false;

  var removed = set.delete(listener);

  // Clean up empty sets to avoid memory leaks
  if (set.size === 0) {
    listeners.delete(eventName);
  }

  return removed;
}

/**
 * Emit an event, calling all registered listeners with the provided detail.
 * Listener errors are caught and logged asynchronously to prevent
 * one failing listener from blocking others.
 *
 * @param {string} eventName - The event name to emit.
 * @param {*} [detail] - Optional data to pass to listeners.
 */
export function emit(eventName, detail) {
  if (typeof eventName !== 'string') return;

  var set = listeners.get(eventName);
  if (!set || set.size === 0) return;

  // Iterate over a snapshot to allow listeners to unsubscribe during iteration
  var snapshot = Array.from(set);

  for (var i = 0; i < snapshot.length; i++) {
    try {
      snapshot[i](detail);
    } catch (err) {
      // Report error asynchronously to avoid breaking the emit loop
      // and to keep the call stack clean
      (function (error, name) {
        setTimeout(function () {
          console.error(
            '[Hayat Events] Listener error for "' + name + '":',
            error
          );
        }, 0);
      })(err, eventName);
    }
  }
}

/**
 * Remove all listeners for a specific event, or all listeners if no name is given.
 *
 * @param {string} [eventName] - Optional event name. If omitted, clears all events.
 */
export function clear(eventName) {
  if (eventName === undefined) {
    listeners.clear();
    return;
  }
  if (typeof eventName === 'string') {
    listeners.delete(eventName);
  }
}
