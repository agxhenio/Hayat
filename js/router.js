/**
 * Hayat — Accessible Hash Router
 * Static-hosting compatible and dependency-light.
 */

import { getRouteById, getRouteByHash } from './config.js';
import { EVENTS, emit } from './events.js';

var navigationToken = 0;
var currentContext = null;
var onRouteCallback = null;
var scrollContainerElement = null;
var titlePrefix = 'Hayat';
var hashChangeHandler = null;
var initialized = false;

function plainParams(searchParams) {
  var result = {};
  searchParams.forEach(function (value, key) {
    Object.defineProperty(result, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  });
  return result;
}

function freezeParams(params) {
  return Object.freeze(Object.assign({}, params));
}

function previousSummary(context) {
  if (!context) return null;
  return Object.freeze({
    id: context.id,
    hash: context.hash,
    label: context.label,
    params: freezeParams(context.params)
  });
}

function freezeContext(context) {
  context.params = freezeParams(context.params);
  return Object.freeze(context);
}

export function parseHash(hash) {
  if (typeof hash !== 'string' || hash.length === 0) {
    return { path: '', params: {} };
  }

  var cleaned = hash.charAt(0) === '#' ? hash.slice(1) : hash;
  var queryIndex = cleaned.indexOf('?');
  var path = queryIndex === -1 ? cleaned : cleaned.slice(0, queryIndex);
  var query = queryIndex === -1 ? '' : cleaned.slice(queryIndex + 1);

  if (path && path.charAt(0) !== '/') path = '/' + path;

  var params = {};
  if (query) {
    try {
      params = plainParams(new URLSearchParams(query));
    } catch (error) {
      params = {};
    }
  }

  return { path: path, params: params };
}

export function buildHash(routeId, params) {
  var route = getRouteById(routeId);
  if (!route) return '#/home';

  var searchParams = new URLSearchParams();
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    Object.keys(params).forEach(function (key) {
      var value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  var query = searchParams.toString();
  return query ? route.hash + '?' + query : route.hash;
}

export function getCurrentRoute() {
  return currentContext;
}

function replaceWithHome() {
  try {
    if (history.replaceState) {
      history.replaceState(null, '', '#/home');
    } else {
      window.location.hash = '#/home';
    }
  } catch (error) {
    window.location.hash = '#/home';
  }
}

function resolveRouteContext(hash, previousContext) {
  var parsed = parseHash(hash);
  var route = getRouteByHash('#' + parsed.path);

  if (!route) {
    route = getRouteById('home');
    parsed.params = {};
    replaceWithHome();
  }

  return freezeContext({
    id: route.id,
    hash: route.hash,
    label: route.label,
    params: parsed.params,
    previous: previousSummary(previousContext)
  });
}

function scrollToTop() {
  if (!scrollContainerElement) return;
  try {
    if (typeof scrollContainerElement.scrollTo === 'function') {
      scrollContainerElement.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      scrollContainerElement.scrollTop = 0;
    }
  } catch (error) {
    scrollContainerElement.scrollTop = 0;
  }
}

function focusRouteHeading() {
  try {
    var heading = document.querySelector('[data-route-heading]');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  } catch (error) {
    // Focus management is progressive enhancement.
  }
}

function updateDocumentTitle(context) {
  document.title = context && context.label
    ? titlePrefix + ' — ' + context.label
    : titlePrefix;
}

function reportRenderError(error, context) {
  emit(EVENTS.ERROR, { source: 'router', error: error, context: context });
  console.error('[Hayat Router] Route render failed:', error);
}

async function performNavigation(hash) {
  var token = ++navigationToken;
  var previousContext = currentContext;

  emit(EVENTS.ROUTE_BEFORE_CHANGE, {
    from: previousContext,
    toHash: hash
  });

  var context = resolveRouteContext(hash, previousContext);

  try {
    if (onRouteCallback) await onRouteCallback(context);
  } catch (error) {
    if (token === navigationToken) reportRenderError(error, context);
    return;
  }

  if (token !== navigationToken) return;

  currentContext = context;
  updateDocumentTitle(context);
  scrollToTop();
  focusRouteHeading();
  emit(EVENTS.ROUTE_CHANGED, context);
}

export function navigate(routeIdOrHash, options) {
  if (typeof routeIdOrHash !== 'string' || routeIdOrHash.length === 0) {
    return false;
  }

  var settings = options || {};
  var targetHash = routeIdOrHash.charAt(0) === '#'
    ? routeIdOrHash
    : buildHash(routeIdOrHash, settings.params);

  var isCurrentHash = window.location.hash === targetHash;
  if (isCurrentHash && !settings.force) return false;

  // A forced refresh of the current route must not add a duplicate
  // browser-history entry (used by the app error-state Retry action).
  if (isCurrentHash && settings.force) {
    performNavigation(targetHash);
    return true;
  }

  try {
    if (settings.replace && history.replaceState) {
      history.replaceState(null, '', targetHash);
      performNavigation(targetHash);
    } else if (history.pushState) {
      history.pushState(null, '', targetHash);
      performNavigation(targetHash);
    } else {
      window.location.hash = targetHash;
    }
  } catch (error) {
    window.location.hash = targetHash;
  }

  return true;
}

export function initRouter(options) {
  if (!options || typeof options.onRoute !== 'function') {
    throw new TypeError('initRouter requires an onRoute callback');
  }
  if (initialized) {
    throw new Error('Router is already initialized; run cleanup first');
  }

  onRouteCallback = options.onRoute;
  titlePrefix = options.documentTitlePrefix || 'Hayat';

  if (options.scrollContainer) {
    if (typeof options.scrollContainer === 'string') {
      try {
        scrollContainerElement = document.querySelector(options.scrollContainer);
      } catch (error) {
        scrollContainerElement = null;
      }
    } else if (typeof Element !== 'undefined' && options.scrollContainer instanceof Element) {
      scrollContainerElement = options.scrollContainer;
    }
  }

  hashChangeHandler = function () {
    performNavigation(window.location.hash || '#/home');
  };

  window.addEventListener('hashchange', hashChangeHandler);
  initialized = true;
  performNavigation(window.location.hash || '#/home');

  return function cleanup() {
    if (hashChangeHandler) {
      window.removeEventListener('hashchange', hashChangeHandler);
    }
    hashChangeHandler = null;
    onRouteCallback = null;
    scrollContainerElement = null;
    currentContext = null;
    navigationToken += 1;
    initialized = false;
  };
}
