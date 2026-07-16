/**
 * Hayat — Prayer Page
 *
 * Displays prayer times with location onboarding and real-time countdown.
 * Read-only — no prayer logging or completion tracking in v1.
 *
 * @module pages/prayer
 */

import { PRAYER_KEYS, PRAYER_LABELS_SQ } from '../js/config.js';
import {
  getTodayAndTomorrowPrayerTimes,
  getPrayerState,
  PrayerTimesError
} from '../js/services/prayer-times.js';
import {
  requestCurrentPosition,
  TIRANA_PRESET,
  LocationError
} from '../js/services/location.js';
import { getZonedDateParts } from '../js/utils/date-time.js';

// ====================================================================
// ICON HELPER
// ====================================================================

function createIcon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var cls = 'icon';
  if (sizeClass) cls += ' ' + sizeClass;
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');

  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function getPrayerIcon(prayerKey) {
  var iconMap = {
    fajr: 'sunrise',
    dhuhr: 'sun',
    asr: 'sunset',
    maghrib: 'sunset',
    isha: 'moon'
  };
  return iconMap[prayerKey] || 'clock';
}

// ====================================================================
// DOM BUILDERS
// ====================================================================

function buildLocationOnboarding(onCurrentLocation, onTirana) {
  var card = document.createElement('div');
  card.className = 'prayer-location-card card card--elevated';

  var iconWrap = document.createElement('div');
  iconWrap.className = 'prayer-location-card__icon';
  iconWrap.appendChild(createIcon('map-pin', 'icon--xl'));

  var title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = 'Zgjidh vendndodhjen';

  var desc = document.createElement('p');
  desc.className = 'card__subtitle';
  desc.textContent = 'Oraret e namazit llogariten sipas koordinatave. Hayat kërkon leje vetëm kur e zgjedh ti.';

  var actions = document.createElement('div');
  actions.className = 'prayer-location-card__actions';

  var currentBtn = document.createElement('button');
  currentBtn.type = 'button';
  currentBtn.className = 'btn btn--primary';
  currentBtn.textContent = 'Përdor vendndodhjen aktuale';
  currentBtn.addEventListener('click', onCurrentLocation);

  var tiranaBtn = document.createElement('button');
  tiranaBtn.type = 'button';
  tiranaBtn.className = 'btn btn--outline';
  tiranaBtn.textContent = 'Përdor Tiranën';
  tiranaBtn.addEventListener('click', onTirana);

  actions.appendChild(currentBtn);
  actions.appendChild(tiranaBtn);

  var privacy = document.createElement('p');
  privacy.className = 'prayer-location-card__privacy';
  privacy.textContent = 'Koordinatat ruhen vetëm në cilësimet lokale të aplikacionit.';

  card.appendChild(iconWrap);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(actions);
  card.appendChild(privacy);

  return card;
}

function buildLocationError(error, onRetry) {
  var card = document.createElement('div');
  card.className = 'prayer-location-card card';

  var iconWrap = document.createElement('div');
  iconWrap.className = 'prayer-location-card__icon';
  iconWrap.appendChild(createIcon('alert-circle', 'icon--xl'));

  var title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = 'Gabim në vendndodhje';

  var desc = document.createElement('p');
  desc.className = 'card__subtitle';
  desc.textContent = error.message || 'Ndodhi një gabim.';

  var retryBtn = document.createElement('button');
  retryBtn.type = 'button';
  retryBtn.className = 'btn btn--primary';
  retryBtn.textContent = 'Provo përsëri';
  retryBtn.addEventListener('click', onRetry);

  card.appendChild(iconWrap);
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(retryBtn);

  return card;
}

function buildStatusBar(settings, onChangeLocation, accuracyMetres) {
  var bar = document.createElement('div');
  bar.className = 'prayer-status-bar';

  var location = document.createElement('span');
  location.className = 'prayer-status-bar__location';
  location.appendChild(createIcon('map-pin', 'icon--sm'));
  var cityText = document.createElement('span');
  cityText.textContent = (settings.city || 'Vendndodhja') +
    (Number.isFinite(accuracyMetres) ? ' · ±' + accuracyMetres + ' m' : '');
  location.appendChild(cityText);

  var actions = document.createElement('div');
  actions.className = 'prayer-status-bar__actions';

  var changeBtn = document.createElement('button');
  changeBtn.type = 'button';
  changeBtn.className = 'btn btn--ghost btn--sm';
  changeBtn.textContent = 'Ndrysho';
  changeBtn.addEventListener('click', onChangeLocation);

  actions.appendChild(changeBtn);

  bar.appendChild(location);
  bar.appendChild(actions);

  return bar;
}

function updateHeroCard(card, state, labels, timings) {
  var eyebrow = card.querySelector('.prayer-hero__eyebrow');
  var name = card.querySelector('.prayer-hero__name');
  var time = card.querySelector('.prayer-hero__time');
  var countdown = card.querySelector('.prayer-hero__countdown');
  var next = card.querySelector('.prayer-hero__next');

  if (state.currentPrayer) {
    eyebrow.textContent = 'Koha aktuale';
    name.textContent = labels[state.currentPrayer];
    time.textContent = timings[state.currentPrayer];
  } else {
    eyebrow.textContent = 'Namazi i ardhshëm';
    name.textContent = labels[state.nextPrayer];
    time.textContent = state.nextPrayerAt || '—';
  }

  var activeDuration = state.currentPrayer && state.durationToCurrentEnd
    ? state.durationToCurrentEnd
    : state.duration;
  countdown.textContent = activeDuration
    ? activeDuration.clock + ' · ' + activeDuration.compact
    : 'Countdown-i nuk është i disponueshëm';

  if (state.currentPrayer && state.currentEndsAt) {
    countdown.setAttribute(
      'aria-label',
      'Koha e mbetur deri në përfundimin e kohës aktuale: ' + activeDuration.compact
    );
  } else if (activeDuration) {
    countdown.setAttribute(
      'aria-label',
      'Koha e mbetur deri te namazi i ardhshëm: ' + activeDuration.compact
    );
  }

  if (state.nextPrayerIsTomorrow && !state.nextPrayerAt) {
    next.textContent = 'Koha e Sabahut të nesërm nuk është ngarkuar ende.';
  } else if (state.currentPrayer) {
    next.textContent = 'Namazi i ardhshëm: ' + labels[state.nextPrayer] +
      (state.nextPrayerAt ? ' në ' + state.nextPrayerAt : '');
  } else {
    next.textContent = '';
  }
}

function buildHeroCard(state, labels, timings) {
  var card = document.createElement('div');
  card.className = 'prayer-hero card card--hero';

  ['eyebrow', 'name', 'time', 'countdown', 'next'].forEach(function (part) {
    var element = document.createElement('span');
    element.className = 'prayer-hero__' + part;
    card.appendChild(element);
  });

  var countdown = card.querySelector('.prayer-hero__countdown');
  countdown.setAttribute('aria-label', 'Koha e mbetur deri te namazi i ardhshëm');
  updateHeroCard(card, state, labels, timings);
  return card;
}

function buildPrayerList(timings, state, labels) {
  var list = document.createElement('div');
  list.className = 'prayer-list';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'Oraret e namazit');

  PRAYER_KEYS.forEach(function (key) {
    var item = document.createElement('div');
    item.className = 'prayer-item';
    item.setAttribute('role', 'listitem');

    if (state.currentPrayer === key) {
      item.classList.add('prayer-item--current');
    }

    var icon = document.createElement('span');
    icon.className = 'prayer-item__icon';
    icon.appendChild(createIcon(getPrayerIcon(key)));

    var name = document.createElement('span');
    name.className = 'prayer-item__name';
    name.textContent = labels[key];

    var time = document.createElement('span');
    time.className = 'prayer-item__time';
    time.textContent = timings[key];

    var status = document.createElement('span');
    status.className = 'prayer-item__status';
    if (state.currentPrayer === key) {
      var pill = document.createElement('span');
      pill.className = 'badge badge--primary';
      pill.textContent = 'Tani';
      status.appendChild(pill);
    }

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(time);
    item.appendChild(status);

    list.appendChild(item);
  });

  return list;
}

function buildInfoCard(timings, result, settings) {
  var card = document.createElement('div');
  card.className = 'prayer-info card';

  var body = document.createElement('div');
  body.className = 'card__body';

  // Sunrise row
  var sunriseRow = document.createElement('div');
  sunriseRow.className = 'prayer-info__row';
  var sunriseLabel = document.createElement('span');
  sunriseLabel.className = 'prayer-info__label';
  sunriseLabel.textContent = 'Lindja e diellit';
  var sunriseValue = document.createElement('span');
  sunriseValue.className = 'prayer-info__value';
  sunriseValue.textContent = timings.sunrise;
  sunriseRow.appendChild(sunriseLabel);
  sunriseRow.appendChild(sunriseValue);

  // Location row
  var locationRow = document.createElement('div');
  locationRow.className = 'prayer-info__row';
  var locationLabel = document.createElement('span');
  locationLabel.className = 'prayer-info__label';
  locationLabel.textContent = 'Vendndodhja';
  var locationValue = document.createElement('span');
  locationValue.className = 'prayer-info__value';
  locationValue.textContent = settings.city || 'Nuk është zgjedhur';
  locationRow.appendChild(locationLabel);
  locationRow.appendChild(locationValue);

  // Source row
  var sourceRow = document.createElement('div');
  sourceRow.className = 'prayer-info__row';
  var sourceLabel = document.createElement('span');
  sourceLabel.className = 'prayer-info__label';
  sourceLabel.textContent = 'Burimi';
  var sourceValue = document.createElement('span');
  sourceValue.className = 'prayer-info__value';
  sourceValue.textContent = result.source === 'cache' ? 'Cache' : 'Online';
  sourceRow.appendChild(sourceLabel);
  sourceRow.appendChild(sourceValue);

  // Method row
  var methodRow = document.createElement('div');
  methodRow.className = 'prayer-info__row';
  var methodLabel = document.createElement('span');
  methodLabel.className = 'prayer-info__label';
  methodLabel.textContent = 'Metoda';
  var methodValue = document.createElement('span');
  methodValue.className = 'prayer-info__value';
  var schoolLabel = settings.prayer.asrSchool === 1 ? 'Hanefi' : 'Standarde';
  methodValue.textContent = 'Metoda ' + settings.prayer.calculationMethod + ' · ' + schoolLabel;
  methodRow.appendChild(methodLabel);
  methodRow.appendChild(methodValue);

  body.appendChild(sunriseRow);
  body.appendChild(locationRow);
  body.appendChild(sourceRow);
  body.appendChild(methodRow);

  card.appendChild(body);

  return card;
}

function buildActions(onRefresh, onChangeLocation) {
  var actions = document.createElement('div');
  actions.className = 'prayer-page__actions';

  var refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'btn btn--outline';
  refreshBtn.appendChild(createIcon('refresh', 'icon--sm'));
  var refreshText = document.createTextNode(' Rifresko');
  refreshBtn.appendChild(refreshText);
  refreshBtn.addEventListener('click', onRefresh);

  var changeBtn = document.createElement('button');
  changeBtn.type = 'button';
  changeBtn.className = 'btn btn--outline';
  changeBtn.appendChild(createIcon('map-pin', 'icon--sm'));
  var changeText = document.createTextNode(' Ndrysho vendndodhjen');
  changeBtn.appendChild(changeText);
  changeBtn.addEventListener('click', onChangeLocation);

  var qiblaBtn = document.createElement('button');
  qiblaBtn.type = 'button';
  qiblaBtn.className = 'btn btn--ghost';
  qiblaBtn.disabled = true;
  qiblaBtn.appendChild(createIcon('compass', 'icon--sm'));
  var qiblaText = document.createTextNode(' Kibla (Së shpejti)');
  qiblaBtn.appendChild(qiblaText);

  actions.appendChild(refreshBtn);
  actions.appendChild(changeBtn);
  actions.appendChild(qiblaBtn);

  return actions;
}

// ====================================================================
// RENDER
// ====================================================================

export function render(context, appContext) {
  var page = document.createElement('div');
  page.className = 'route-page prayer-page';

  // Header
  var header = document.createElement('div');
  header.className = 'route-page__header';

  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Oraret ditore';

  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Namazi';

  var subtitle = document.createElement('p');
  subtitle.className = 'route-page__subtitle';
  subtitle.textContent = 'Ngarkimi...';

  header.appendChild(eyebrow);
  header.appendChild(h1);
  header.appendChild(subtitle);

  // Content regions
  var locationRegion = document.createElement('div');
  locationRegion.className = 'prayer-region prayer-region--location';

  var loadingRegion = document.createElement('div');
  loadingRegion.className = 'prayer-region prayer-region--loading';
  loadingRegion.setAttribute('role', 'status');

  var errorRegion = document.createElement('div');
  errorRegion.className = 'prayer-region prayer-region--error';

  var resultRegion = document.createElement('div');
  resultRegion.className = 'prayer-region prayer-region--result';

  page.appendChild(header);
  page.appendChild(locationRegion);
  page.appendChild(loadingRegion);
  page.appendChild(errorRegion);
  page.appendChild(resultRegion);

  return page;
}

// ====================================================================
// MOUNT
// ====================================================================

export function mount(pageElement, context, appContext) {
  var store = appContext.store;
  var events = appContext.events;
  var settingsStorage = appContext.settingsStorage;
  var EVENTS = events.EVENTS;

  var regions = {
    location: pageElement.querySelector('.prayer-region--location'),
    loading: pageElement.querySelector('.prayer-region--loading'),
    error: pageElement.querySelector('.prayer-region--error'),
    result: pageElement.querySelector('.prayer-region--result')
  };

  var subtitle = pageElement.querySelector('.route-page__subtitle');
  var abortController = null;
  var timerInterval = null;
  var todayResult = null;
  var tomorrowResult = null;
  var isRefreshing = false;
  var showLocationChoice = false;
  var isMounted = true;
  var sessionTimeZone = null;
  var locationAccuracy = null;

  // ---------------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------------

  function showRegion(name) {
    Object.keys(regions).forEach(function (key) {
      if (key === name) {
        regions[key].removeAttribute('hidden');
      } else {
        regions[key].setAttribute('hidden', '');
      }
    });
  }

  function showLoading() {
    showRegion('loading');
    regions.loading.replaceChildren();
    var spinner = document.createElement('div');
    spinner.className = 'app__loading';
    spinner.appendChild(document.createElement('div')).className = 'app__loading-spinner';
    var text = document.createElement('p');
    text.className = 'app__loading-text';
    text.textContent = 'Duke ngarkuar oraret...';
    spinner.appendChild(text);
    regions.loading.appendChild(spinner);
  }

  function showError(message, onRetry) {
    showRegion('error');
    regions.error.replaceChildren();

    var card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('role', 'alert');

    var body = document.createElement('div');
    body.className = 'card__body';

    var icon = createIcon('alert-circle', 'icon--xl');
    icon.classList.add('app__error-icon');

    var title = document.createElement('p');
    title.className = 'app__error-title';
    title.textContent = 'Gabim';

    var desc = document.createElement('p');
    desc.className = 'app__error-message';
    desc.textContent = message;

    var retryBtn = document.createElement('button');
    retryBtn.type = 'button';
    retryBtn.className = 'btn btn--primary';
    retryBtn.textContent = 'Provo përsëri';
    retryBtn.addEventListener('click', onRetry);

    body.appendChild(icon);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(retryBtn);
    card.appendChild(body);
    regions.error.appendChild(card);
  }

  function mapPrayerError(err) {
    if (err instanceof PrayerTimesError) {
      switch (err.code) {
        case 'LOCATION_REQUIRED':
          return 'Vendndodhja nuk është zgjedhur.';
        case 'NETWORK_ERROR':
          return 'Nuk u arrit të merren oraret. Kontrolloni lidhjen në internet.';
        case 'TIMEOUT':
          return 'Kërkesa dështoi. Provoni përsëri.';
        case 'HTTP_ERROR':
          return 'Shërbimi nuk është i disponueshëm. Provoni përsëri.';
        case 'INVALID_RESPONSE':
          return 'Të dhënat e marra janë të pavlefshme.';
        default:
          return 'Ndodhi një gabim. Provoni përsëri.';
      }
    }
    return 'Ndodhi një gabim. Provoni përsëri.';
  }

  // ---------------------------------------------------------------
  // LOCATION FLOW
  // ---------------------------------------------------------------

  function showLocationOnboarding() {
    showLocationChoice = true;
    stopTimer();
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    showRegion('location');
    regions.location.replaceChildren();

    var card = buildLocationOnboarding(
      function () { handleCurrentLocation(); },
      function () { handleTiranaPreset(); }
    );

    regions.location.appendChild(card);
    subtitle.textContent = 'Zgjidh vendndodhjen';
  }

  function handleCurrentLocation() {
    showRegion('loading');
    regions.loading.replaceChildren();

    var loading = document.createElement('div');
    loading.className = 'app__loading';
    var spinner = document.createElement('div');
    spinner.className = 'app__loading-spinner';
    var text = document.createElement('p');
    text.className = 'app__loading-text';
    text.textContent = 'Duke marrë vendndodhjen...';
    loading.appendChild(spinner);
    loading.appendChild(text);
    regions.loading.appendChild(loading);

    requestCurrentPosition()
      .then(function (pos) {
        if (!isMounted) return;
        var rounded = Number.isFinite(pos.accuracy) ? Math.round(pos.accuracy) : null;
        locationAccuracy = rounded;
        sessionTimeZone = null;
        var newSettings = settingsStorage.patchSettings({
          coordinates: {
            latitude: pos.latitude,
            longitude: pos.longitude
          },
          city: 'Vendndodhja aktuale'
        });
        store.set('settings', newSettings);
        events.emit(EVENTS.SETTINGS_CHANGED, {
          source: 'prayer-location',
          settings: newSettings
        });
        showLocationChoice = false;
        loadPrayerTimes();
      })
      .catch(function (err) {
        if (!isMounted) return;
        if (err instanceof LocationError) {
          showRegion('location');
          regions.location.replaceChildren();
          var errorCard = buildLocationError(err, function () {
            handleCurrentLocation();
          });
          regions.location.appendChild(errorCard);
        } else {
          showError('Ndodhi një gabim i papritur.', function () {
            handleCurrentLocation();
          });
        }
      });
  }

  function handleTiranaPreset() {
    sessionTimeZone = TIRANA_PRESET.timeZone;
    locationAccuracy = null;
    var newSettings = settingsStorage.patchSettings({
      coordinates: {
        latitude: TIRANA_PRESET.latitude,
        longitude: TIRANA_PRESET.longitude
      },
      city: TIRANA_PRESET.city,
      country: TIRANA_PRESET.country
    });
    store.set('settings', newSettings);
    events.emit(EVENTS.SETTINGS_CHANGED, {
      source: 'prayer-location',
      settings: newSettings
    });
    showLocationChoice = false;
    loadPrayerTimes();
  }

  function handleChangeLocation() {
    showLocationOnboarding();
  }

  function selectedTimeZone(settings) {
    if (sessionTimeZone) return sessionTimeZone;
    var coordinates = settings && settings.coordinates;
    if (coordinates && settings.city === TIRANA_PRESET.city &&
        Math.abs(coordinates.latitude - TIRANA_PRESET.latitude) < 0.0001 &&
        Math.abs(coordinates.longitude - TIRANA_PRESET.longitude) < 0.0001) {
      return TIRANA_PRESET.timeZone;
    }
    return undefined;
  }

  // ---------------------------------------------------------------
  // PRAYER TIMES LOADING
  // ---------------------------------------------------------------

  function loadPrayerTimes(forceRefresh) {
    stopTimer();
    var settings = store.get('settings');
    if (!settings || !settings.coordinates) {
      showLocationOnboarding();
      return;
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    showLoading();

    var options = {
      latitude: settings.coordinates.latitude,
      longitude: settings.coordinates.longitude,
      calculationMethod: settings.prayer.calculationMethod,
      asrSchool: settings.prayer.asrSchool,
      adjustments: settings.prayer.adjustments,
      forceRefresh: forceRefresh === true,
      signal: abortController.signal,
      timeZone: selectedTimeZone(settings)
    };

    getTodayAndTomorrowPrayerTimes(options)
      .then(function (results) {
        if (!isMounted) return;
        todayResult = results.today;
        tomorrowResult = results.tomorrow;
        renderPrayerResult();
        startTimer();
      })
      .catch(function (err) {
        if (!isMounted) return;
        if (err.name === 'AbortError' || (err instanceof PrayerTimesError && err.code === 'ABORTED')) {
          return;
        }
        var message = mapPrayerError(err);
        showError(message, function () {
          loadPrayerTimes();
        });
      });
  }

  function handleRefresh() {
    if (isRefreshing) return;
    isRefreshing = true;

    var settings = store.get('settings');
    if (!settings || !settings.coordinates) {
      isRefreshing = false;
      return;
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    var options = {
      latitude: settings.coordinates.latitude,
      longitude: settings.coordinates.longitude,
      calculationMethod: settings.prayer.calculationMethod,
      asrSchool: settings.prayer.asrSchool,
      adjustments: settings.prayer.adjustments,
      forceRefresh: true,
      signal: abortController.signal,
      timeZone: selectedTimeZone(settings)
    };

    getTodayAndTomorrowPrayerTimes(options)
      .then(function (results) {
        if (!isMounted) return;
        todayResult = results.today;
        tomorrowResult = results.tomorrow;
        renderPrayerResult();
        isRefreshing = false;
      })
      .catch(function (err) {
        if (!isMounted) return;
        isRefreshing = false;
        if (err.name === 'AbortError' || (err instanceof PrayerTimesError && err.code === 'ABORTED')) {
          return;
        }
        // Show warning but keep existing data
        if (todayResult) {
          var warning = pageElement.querySelector('.prayer-refresh-warning');
          if (!warning) {
            warning = document.createElement('div');
            warning.className = 'prayer-refresh-warning alert alert--warning';
            warning.setAttribute('role', 'status');
            var icon = createIcon('alert-circle');
            icon.classList.add('alert__icon');
            var content = document.createElement('div');
            content.className = 'alert__content';
            var msg = document.createElement('p');
            msg.className = 'alert__message';
            msg.textContent = 'Rifreskimi dështoi. Po shfaqen oraret e mëparshme.';
            content.appendChild(msg);
            warning.appendChild(icon);
            warning.appendChild(content);
            var resultRegion = pageElement.querySelector('.prayer-region--result');
            resultRegion.insertBefore(warning, resultRegion.firstChild);
          }
        }
      });
  }

  // ---------------------------------------------------------------
  // RENDER RESULT
  // ---------------------------------------------------------------

  function renderPrayerResult() {
    if (!todayResult) return;

    var settings = store.get('settings');
    var now = new Date();
    var state = getPrayerState(todayResult, now, tomorrowResult);

    if (!state) {
      showError('Oraret nuk janë të vlefshme.', function () {
        loadPrayerTimes();
      });
      return;
    }

    showRegion('result');
    subtitle.textContent = settings.city || 'Vendndodhja';

    regions.result.replaceChildren();

    // Location status and Hero
    var statusBar = buildStatusBar(settings, handleChangeLocation, locationAccuracy);
    regions.result.appendChild(statusBar);

    var hero = buildHeroCard(state, PRAYER_LABELS_SQ, todayResult.timings);
    regions.result.appendChild(hero);

    // Prayer list
    var list = buildPrayerList(todayResult.timings, state, PRAYER_LABELS_SQ);
    regions.result.appendChild(list);

    // Info card
    var info = buildInfoCard(todayResult.timings, todayResult, settings);
    regions.result.appendChild(info);

    // Actions
    var actions = buildActions(handleRefresh, handleChangeLocation);
    regions.result.appendChild(actions);
  }

  // ---------------------------------------------------------------
  // TIMER
  // ---------------------------------------------------------------

  function updateTimer() {
    if (!todayResult || document.hidden) return false;

    var now = new Date();
    var zonedNow = getZonedDateParts(now, todayResult.timezone);

    // Check if date changed
    if (zonedNow && zonedNow.dateKey !== todayResult.dateKey) {
      loadPrayerTimes();
      return false;
    }

    var state = getPrayerState(todayResult, now, tomorrowResult);
    if (!state) return false;

    // Update hero temporal state without rebuilding the whole page.
    var hero = regions.result.querySelector('.prayer-hero');
    if (hero) updateHeroCard(hero, state, PRAYER_LABELS_SQ, todayResult.timings);

    // Update current prayer highlight
    var items = regions.result.querySelectorAll('.prayer-item');
    items.forEach(function (item, index) {
      var key = PRAYER_KEYS[index];
      if (state.currentPrayer === key) {
        item.classList.add('prayer-item--current');
        var status = item.querySelector('.prayer-item__status');
        if (status && status.children.length === 0) {
          var pill = document.createElement('span');
          pill.className = 'badge badge--primary';
          pill.textContent = 'Tani';
          status.appendChild(pill);
        }
      } else {
        item.classList.remove('prayer-item--current');
        var status = item.querySelector('.prayer-item__status');
        if (status) {
          status.replaceChildren();
        }
      }
    });
    return true;
  }

  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (document.hidden || !todayResult) return;
    timerInterval = setInterval(updateTimer, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ---------------------------------------------------------------
  // VISIBILITY
  // ---------------------------------------------------------------

  function handleVisibility() {
    if (document.hidden) {
      stopTimer();
    } else if (updateTimer() !== false) {
      startTimer();
    }
  }

  // ---------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------

  var settings = store.get('settings');
  if (!settings || !settings.coordinates || showLocationChoice) {
    showLocationOnboarding();
  } else {
    loadPrayerTimes();
  }

  document.addEventListener('visibilitychange', handleVisibility);

  // ---------------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------------

  return function () {
    isMounted = false;
    stopTimer();
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
