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
import { getZonedDateParts, parseTimeString } from '../js/utils/date-time.js';
import {
  PRAYER_METHODS,
  getPrayerLogsForDate,
  savePrayerLog,
  deletePrayerLog
} from '../js/storage/prayer-log.js';
import {
  getPostPrayerDhikrSessionsForDate,
  DHIKR_SESSION_STATUSES
} from '../js/storage/post-prayer-dhikr-progress.js';
import { qiblaBearing, qiblaDirectionSq } from '../js/services/qibla.js';

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
    ? activeDuration.clock
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
    var endText = state.currentEndsAt && state.currentEndsAt !== state.nextPrayerAt
      ? 'Koha përfundon në ' + state.currentEndsAt + ' · '
      : '';
    next.textContent = endText + 'Namazi i ardhshëm: ' + labels[state.nextPrayer] +
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

function isPrayerRecordable(prayerKey, timings, currentTotalMinutes) {
  var parsed = parseTimeString(timings[prayerKey]);
  return Boolean(parsed && currentTotalMinutes >= parsed.totalMinutes);
}

function buildPrayerList(
  timings,
  state,
  labels,
  logs,
  dhikrSessions,
  currentTotalMinutes,
  loggingAvailable,
  onPrayerClick,
  onDhikrClick
) {
  var list = document.createElement('div');
  list.className = 'prayer-list';
  list.setAttribute('role', 'list');
  list.setAttribute('aria-label', 'Oraret e namazit');

  PRAYER_KEYS.forEach(function (key) {
    var recorded = logs.has(key);
    var recordable = isPrayerRecordable(key, timings, currentTotalMinutes);
    var interactive = loggingAvailable && (recorded || recordable);
    var group = document.createElement('div');
    group.className = 'prayer-row-group';
    group.setAttribute('role', 'listitem');

    var row = document.createElement(interactive ? 'button' : 'div');
    if (interactive) {
      row.type = 'button';
      row.className = 'prayer-item prayer-log-button';
      row.classList.add(recorded ? 'prayer-log-button--recorded' : 'prayer-log-button--available');
      row.setAttribute('aria-label', labels[key] + ', ' + timings[key] + ', ' +
        (recorded ? 'E regjistruar. Hape për ta ndryshuar.' : 'Regjistro namazin.'));
      row.addEventListener('click', function () { onPrayerClick(key, row); });
    } else {
      row.className = 'prayer-item';
    }
    row.dataset.prayerKey = key;
    if (state.currentPrayer === key) row.classList.add('prayer-item--current');

    var prayerIcon = document.createElement('span');
    prayerIcon.className = 'prayer-item__icon';
    prayerIcon.appendChild(createIcon(getPrayerIcon(key)));
    var name = document.createElement('span');
    name.className = 'prayer-item__name';
    name.textContent = labels[key];
    var time = document.createElement('span');
    time.className = 'prayer-item__time';
    time.textContent = timings[key];
    var status = document.createElement('span');
    status.className = 'prayer-item__status prayer-log-button__state';

    if (state.currentPrayer === key) {
      var now = document.createElement('span');
      now.className = 'badge badge--primary';
      now.textContent = 'Tani';
      status.appendChild(now);
    }
    if (recorded) {
      status.appendChild(createIcon('check', 'icon--sm'));
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = 'E regjistruar';
      status.appendChild(sr);
    } else if (interactive && state.currentPrayer !== key) {
      status.appendChild(createIcon('circle', 'icon--sm'));
    }

    row.append(prayerIcon, name, time, status);
    group.appendChild(row);

    if (recorded) {
      var dhikrSession = dhikrSessions.get(key) || null;
      var dhikrButton = document.createElement('button');
      dhikrButton.type = 'button';
      dhikrButton.className = 'prayer-dhikr-indicator';
      if (!dhikrSession) {
        dhikrButton.textContent = 'Fillo dhikrin pas namazit';
      } else if (dhikrSession.status === DHIKR_SESSION_STATUSES.IN_PROGRESS) {
        dhikrButton.classList.add('prayer-dhikr-indicator--in-progress');
        dhikrButton.textContent = 'Dhikri në vazhdim';
      } else {
        dhikrButton.classList.add('prayer-dhikr-indicator--completed');
        dhikrButton.append(createIcon('check', 'icon--xs'), document.createTextNode(' Dhikri u krye'));
      }
      dhikrButton.addEventListener('click', function () { onDhikrClick(key); });
      group.appendChild(dhikrButton);
    }
    list.appendChild(group);
  });
  return list;
}

function buildDailySummary(logs) {
  var card = document.createElement('div');
  card.className = 'prayer-summary card';
  var body = document.createElement('div');
  body.className = 'card__body';
  var header = document.createElement('div');
  header.className = 'prayer-summary__header';
  var title = document.createElement('h3');
  title.className = 'card__title';
  title.textContent = 'Të regjistruara sot';
  var count = document.createElement('span');
  count.className = 'prayer-summary__count';
  count.textContent = logs.size + ' nga 5';
  header.append(title, count);

  var progress = document.createElement('div');
  progress.className = 'progress';
  var track = document.createElement('div');
  track.className = 'progress__track';
  track.setAttribute('role', 'progressbar');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '5');
  track.setAttribute('aria-valuenow', String(logs.size));
  track.setAttribute('aria-label', logs.size + ' nga 5 namaze të regjistruara');
  var bar = document.createElement('div');
  bar.className = 'progress__bar';
  bar.dataset.count = String(logs.size);
  track.appendChild(bar);
  progress.appendChild(track);

  var note = document.createElement('p');
  note.className = 'prayer-summary__note';
  note.textContent = 'Kjo tregon vetëm regjistrimet në Hayat, jo nëse namazi është falur apo jo.';
  body.append(header, progress, note);
  card.appendChild(body);
  return card;
}

function buildLogDialog(options) {
  var prayerKey = options.prayerKey;
  var existingLog = options.existingLog;
  var backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.dataset.state = 'open';
  backdrop.setAttribute('aria-hidden', 'false');

  var dialog = document.createElement('div');
  dialog.className = 'modal prayer-log-dialog';
  dialog.dataset.state = 'open';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  var titleId = 'prayer-log-title-' + prayerKey;
  dialog.setAttribute('aria-labelledby', titleId);

  var header = document.createElement('div');
  header.className = 'modal__header';
  var title = document.createElement('h2');
  title.id = titleId;
  title.className = 'card__title';
  title.textContent = PRAYER_LABELS_SQ[prayerKey];
  var closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'btn btn--icon btn--ghost';
  closeButton.setAttribute('aria-label', 'Mbyll');
  closeButton.appendChild(createIcon('close'));
  header.append(title, closeButton);

  var body = document.createElement('div');
  body.className = 'modal__body';
  var subtitle = document.createElement('p');
  subtitle.className = 'prayer-log-dialog__subtitle';
  subtitle.textContent = options.dateKey + ' · ' + options.time;
  var question = document.createElement('p');
  question.className = 'prayer-log-dialog__question';
  question.textContent = 'Si u fale?';
  var methods = document.createElement('div');
  methods.className = 'prayer-methods';

  var radios = [];
  Object.keys(PRAYER_METHODS).forEach(function (method) {
    var wrapper = document.createElement('div');
    wrapper.className = 'prayer-method';
    var input = document.createElement('input');
    input.type = 'radio';
    input.name = 'prayer-method-' + prayerKey;
    input.id = 'prayer-method-' + prayerKey + '-' + method;
    input.value = method;
    input.className = 'prayer-method__input';
    input.checked = Boolean(existingLog && existingLog.method === method);
    radios.push(input);
    var label = document.createElement('label');
    label.className = 'prayer-method__label';
    label.htmlFor = input.id;
    var methodIcon = document.createElement('span');
    methodIcon.className = 'prayer-method__icon';
    methodIcon.appendChild(createIcon(
      method === 'mosque_congregation' || method === 'home_congregation'
        ? 'users' : method === 'alone' ? 'user' : 'clock'
    ));
    var methodText = document.createElement('span');
    methodText.textContent = PRAYER_METHODS[method];
    label.append(methodIcon, methodText);
    wrapper.append(input, label);
    methods.appendChild(wrapper);
  });
  body.append(subtitle, question, methods);

  var footer = document.createElement('div');
  footer.className = 'modal__footer prayer-log-dialog__footer';
  var deleteButton = null;
  var deleteConfirm = null;
  if (existingLog) {
    deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn--danger';
    deleteButton.append(createIcon('trash', 'icon--sm'), document.createTextNode(' Hiq regjistrimin'));
    footer.appendChild(deleteButton);
  }
  var cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'btn btn--ghost';
  cancelButton.textContent = 'Anulo';
  var saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'btn btn--primary';
  saveButton.textContent = 'Ruaj';
  saveButton.disabled = !radios.some(function (radio) { return radio.checked; });
  footer.append(cancelButton, saveButton);
  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);

  var busy = false;
  var previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  var trigger = options.trigger;

  function focusables() {
    return Array.from(dialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (element) { return !element.hidden; });
  }

  function requestClose() {
    if (!busy) options.onClose();
  }

  function keydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      requestClose();
      return;
    }
    if (event.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  closeButton.addEventListener('click', requestClose);
  cancelButton.addEventListener('click', requestClose);
  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) requestClose();
  });
  dialog.addEventListener('keydown', keydown);
  radios.forEach(function (radio) {
    radio.addEventListener('change', function () { saveButton.disabled = false; });
  });
  saveButton.addEventListener('click', function () {
    var selected = radios.find(function (radio) { return radio.checked; });
    if (selected && !busy) options.onSave(selected.value);
  });
  if (deleteButton) {
    deleteButton.addEventListener('click', function () {
      if (busy || deleteConfirm) return;
      deleteConfirm = document.createElement('div');
      deleteConfirm.className = 'prayer-log-dialog__delete-confirm';
      var text = document.createElement('p');
      text.textContent = 'A je i sigurt që dëshiron ta heqësh regjistrimin?';
      var yes = document.createElement('button');
      yes.type = 'button';
      yes.className = 'btn btn--danger btn--sm';
      yes.textContent = 'Po, hiqe';
      var no = document.createElement('button');
      no.type = 'button';
      no.className = 'btn btn--ghost btn--sm';
      no.textContent = 'Anulo';
      yes.addEventListener('click', function () { if (!busy) options.onDelete(); });
      no.addEventListener('click', function () {
        deleteConfirm.remove(); deleteConfirm = null; deleteButton.focus();
      });
      deleteConfirm.append(text, yes, no);
      body.appendChild(deleteConfirm);
      yes.focus();
    });
  }

  return {
    element: backdrop,
    setBusy: function (value) {
      busy = Boolean(value);
      dialog.setAttribute('aria-busy', String(busy));
      radios.forEach(function (radio) { radio.disabled = busy; });
      [closeButton, cancelButton, saveButton, deleteButton].filter(Boolean)
        .forEach(function (button) { button.disabled = busy; });
    },
    focus: function () {
      var selected = radios.find(function (radio) { return radio.checked; });
      (selected || radios[0] || closeButton).focus();
    },
    destroy: function (restoreFocus) {
      dialog.removeEventListener('keydown', keydown);
      document.body.style.overflow = previousOverflow;
      backdrop.remove();
      if (restoreFocus && trigger && trigger.isConnected) trigger.focus();
    }
  };
}

function buildQiblaCard(settings) {
  var card = document.createElement('section'); card.className = 'prayer-qibla card';
  var title = document.createElement('h2'); title.className = 'card__title'; title.textContent = 'Qibla';
  var visual = document.createElement('div'); visual.className = 'prayer-qibla__visual'; visual.setAttribute('aria-hidden', 'true'); visual.appendChild(createIcon('compass', 'icon--xl'));
  var text = document.createElement('p'); text.className = 'card__subtitle';
  try {
    var bearing = qiblaBearing(settings.coordinates.latitude, settings.coordinates.longitude);
    text.textContent = 'Nga veriu: ' + Math.round(bearing) + '° · drejt ' + qiblaDirectionSq(bearing) + '.';
  } catch (error) { text.textContent = 'Vendndodhja nevojitet për të llogaritur drejtimin e Qibles.'; }
  var note = document.createElement('p'); note.className = 'prayer-qibla__note'; note.textContent = 'Përdore si ndihmë orientuese; kompasit të telefonit mund t’i duhet kalibrim.';
  var compass = document.createElement('button'); compass.type = 'button'; compass.className = 'btn btn--ghost btn--sm'; compass.textContent = 'Aktivizo kompasin';
  var compassStatus = document.createElement('p'); compassStatus.className = 'prayer-qibla__note'; compassStatus.hidden = true;
  compass.addEventListener('click', function () {
    if (!window.DeviceOrientationEvent) { compassStatus.hidden = false; compassStatus.textContent = 'Kompasi nuk mbështetet nga ky shfletues.'; return; }
    function start() { compass.disabled = true; compass.textContent = 'Kompasi aktiv'; compassStatus.hidden = false; compassStatus.textContent = 'Lëvize telefonin ngadalë për kalibrim.'; var handler = function (event) { if (!card.isConnected) { window.removeEventListener('deviceorientation', handler); return; } var pointer = needle.querySelector('[data-qibla-pointer]'); var heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : (Number.isFinite(event.alpha) ? (360 - event.alpha) % 360 : null); if (!Number.isFinite(heading)) return; try { var target = qiblaBearing(settings.coordinates.latitude, settings.coordinates.longitude); var turn = (target - heading + 360) % 360; compassStatus.textContent = 'Rrotullo telefonin ' + Math.round(turn) + '° në drejtim të akrepave të orës për Qiblen.'; } catch (error) {} }; window.addEventListener('deviceorientation', handler); }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') { window.DeviceOrientationEvent.requestPermission().then(function (result) { if (result === 'granted') start(); else { compassStatus.hidden = false; compassStatus.textContent = 'Leja për kompasin nuk u dha.'; } }).catch(function () { compassStatus.hidden = false; compassStatus.textContent = 'Kompasi nuk u aktivizua.'; }); } else start();
  });
  card.append(title, visual, text, note, compass, compassStatus); return card;
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

function buildActions(onRefresh, onChangeLocation, onQibla) {
  var actions = document.createElement('div');
  actions.className = 'prayer-page__actions';

  var refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'btn btn--outline';
  refreshBtn.appendChild(createIcon('refresh', 'icon--sm'));
  var refreshText = document.createTextNode(' Rifresko');
  refreshBtn.appendChild(refreshText);
  refreshBtn.addEventListener('click', onRefresh);

  var qiblaBtn = document.createElement('button');
  qiblaBtn.type = 'button'; qiblaBtn.className = 'btn btn--outline prayer-qibla-action';
  var qiblaIcon = document.createElement('span'); qiblaIcon.className = 'prayer-qibla-action__icon'; qiblaIcon.appendChild(createIcon('compass', 'icon--sm'));
  qiblaBtn.append(qiblaIcon, document.createTextNode(' Qibla'));
  qiblaBtn.addEventListener('click', onQibla);

  actions.appendChild(refreshBtn);
  actions.appendChild(qiblaBtn);

  return actions;
}

// ====================================================================
// RENDER
// ====================================================================

function renderQiblaScreen(page, settings) {
  page.classList.add('qibla-screen');
  var back = document.createElement('button'); back.type = 'button'; back.className = 'btn btn--icon btn--ghost'; back.dataset.qiblaBack = ''; back.setAttribute('aria-label', 'Kthehu te Namazi'); back.appendChild(createIcon('chevron-left'));
  var title = document.createElement('h1'); title.className = 'qibla-screen__title'; title.dataset.routeHeading = ''; title.textContent = 'Qibla';
  var top = document.createElement('header'); top.className = 'qibla-screen__top'; top.append(back, title);
  var dial = document.createElement('div'); dial.className = 'qibla-dial'; dial.dataset.qiblaDial = '';
  var needle = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); needle.setAttribute('viewBox', '-50 -50 100 100'); needle.setAttribute('class', 'qibla-dial__needle'); needle.dataset.qiblaNeedle = ''; var pointerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g'); pointerGroup.dataset.qiblaPointer = ''; var pointer = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pointer.setAttribute('d', 'M0 -40 L9 12 L0 4 L-9 12 Z'); pointer.setAttribute('fill', 'currentColor'); pointerGroup.appendChild(pointer); needle.appendChild(pointerGroup); dial.appendChild(needle);
  var degree = document.createElement('strong'); degree.className = 'qibla-dial__degree'; degree.dataset.qiblaDegree = ''; dial.appendChild(degree);
  var text = document.createElement('p'); text.className = 'qibla-screen__text'; text.dataset.qiblaText = '';
  var enable = document.createElement('button'); enable.type = 'button'; enable.className = 'btn btn--primary'; enable.dataset.qiblaEnable = ''; enable.textContent = 'Aktivizo kompasin';
  page.append(top, dial, text, enable);
}

export function render(context, appContext) {
  var page = document.createElement('div');
  page.className = 'route-page prayer-page';
  if (context.params && context.params.qibla) { renderQiblaScreen(page, appContext.store.get('settings')); return page; }

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

function mountQiblaScreen(page, appContext) {
  var settings = appContext.store.get('settings'); var dial = page.querySelector('[data-qibla-dial]'); var needle = page.querySelector('[data-qibla-needle]'); var degree = page.querySelector('[data-qibla-degree]'); var text = page.querySelector('[data-qibla-text]'); var enable = page.querySelector('[data-qibla-enable]');
  page.querySelector('[data-qibla-back]').addEventListener('click', function () { appContext.navigate('prayer'); });
  if (!settings || !settings.coordinates) { text.textContent = 'Vendndodhja nevojitet për Qiblen.'; enable.hidden = true; return function () {}; }
  var bearing = qiblaBearing(settings.coordinates.latitude, settings.coordinates.longitude); degree.textContent = Math.round(bearing) + '°'; text.textContent = 'Drejt Qibles nga veriu · aktivizo kompasin për orientim live.';
  var handler = null;
  function start() { enable.hidden = true; text.textContent = 'Lëvize telefonin ngadalë për kalibrim.'; handler = function (event) { var pointer = needle.querySelector('[data-qibla-pointer]'); var heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : (Number.isFinite(event.alpha) ? (360 - event.alpha) % 360 : null); if (!Number.isFinite(heading)) return; var turn = (bearing - heading + 360) % 360; if (pointer) pointer.setAttribute('transform', 'rotate(' + turn + ')'); text.textContent = 'Rrotullo telefonin derisa treguesi të jetë lart.'; }; window.addEventListener('deviceorientation', handler); }
  enable.addEventListener('click', function () { if (!window.DeviceOrientationEvent) { text.textContent = 'Kompasi nuk mbështetet nga ky shfletues.'; return; } if (typeof window.DeviceOrientationEvent.requestPermission === 'function') window.DeviceOrientationEvent.requestPermission().then(function (state) { if (state === 'granted') start(); else text.textContent = 'Leja për kompasin nuk u dha.'; }).catch(function () { text.textContent = 'Kompasi nuk u aktivizua.'; }); else start(); });
  return function () { if (handler) window.removeEventListener('deviceorientation', handler); };
}

export function mount(pageElement, context, appContext) {
  if (pageElement.classList.contains('qibla-screen')) return mountQiblaScreen(pageElement, appContext);
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
  var prayerLogsByKey = new Map();
  var dhikrSessionsByKey = new Map();
  var dhikrSessionsAvailable = true;
  var dhikrPromptPrayerKey = null;
  var loggingAvailable = true;
  var currentDialog = null;
  var logOperationInProgress = false;
  var logFeedback = null;
  var logFeedbackTimer = null;
  var lastTemporalSignature = null;

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

  function prayerDefaultsForLocation(settings, country) {
    if (settings && settings.prayerDefaultsApplied) return {};
    if (country === 'Shqipëri') {
      return { prayer: { calculationMethod: 13, asrSchool: 0, adjustments: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } }, prayerDefaultsApplied: true };
    }
    return { prayerDefaultsApplied: true };
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
        var locationPatch = {
          coordinates: { latitude: pos.latitude, longitude: pos.longitude },
          city: 'Vendndodhja aktuale'
        };
        var newSettings = settingsStorage.patchSettings(Object.assign(
          locationPatch,
          prayerDefaultsForLocation(store.get('settings'), null)
        ));
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
    var locationPatch = {
      coordinates: { latitude: TIRANA_PRESET.latitude, longitude: TIRANA_PRESET.longitude },
      city: TIRANA_PRESET.city,
      country: TIRANA_PRESET.country
    };
    var newSettings = settingsStorage.patchSettings(Object.assign(
      locationPatch,
      prayerDefaultsForLocation(store.get('settings'), TIRANA_PRESET.country)
    ));
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
  // OPTIONAL LOCAL PRAYER LOGGING
  // ---------------------------------------------------------------

  async function loadPrayerLogs(dateKey) {
    prayerLogsByKey.clear();
    loggingAvailable = true;
    try {
      var logs = await getPrayerLogsForDate(dateKey);
      if (!isMounted || !todayResult || todayResult.dateKey !== dateKey) return;
      logs.forEach(function (log) { prayerLogsByKey.set(log.prayerKey, log); });
      dhikrSessionsByKey.clear();
      dhikrSessionsAvailable = true;
      try {
        var sessions = await getPostPrayerDhikrSessionsForDate(dateKey);
        if (!isMounted || !todayResult || todayResult.dateKey !== dateKey) return;
        sessions.forEach(function (session) {
          dhikrSessionsByKey.set(session.prayerKey, session);
        });
      } catch (dhikrError) {
        dhikrSessionsAvailable = false;
        console.warn('[Hayat Prayer] Dhikr session indicators unavailable:', dhikrError);
      }
    } catch (error) {
      if (!isMounted) return;
      loggingAvailable = false;
      console.warn('[Hayat Prayer] Local prayer logging unavailable:', error);
    }
  }

  function feedbackClass(type) {
    return type === 'success'
      ? 'prayer-log-feedback prayer-log-feedback--success'
      : 'prayer-log-feedback prayer-log-feedback--warning';
  }

  function renderFeedback() {
    var host = regions.result.querySelector('.prayer-log-feedback-host');
    if (!host) return;
    host.replaceChildren();
    if (!loggingAvailable) {
      var unavailable = document.createElement('div');
      unavailable.className = feedbackClass('warning');
      unavailable.setAttribute('role', 'status');
      unavailable.textContent = 'Regjistrimi lokal nuk është i disponueshëm.';
      host.appendChild(unavailable);
    }
    if (logFeedback) {
      var message = document.createElement('div');
      message.className = feedbackClass(logFeedback.type);
      message.setAttribute('role', 'status');
      message.textContent = logFeedback.message;
      host.appendChild(message);
    }
    if (dhikrPromptPrayerKey && todayResult) {
      var prompt = document.createElement('div');
      prompt.className = 'prayer-dhikr-prompt card card--elevated';
      var body = document.createElement('div');
      body.className = 'card__body';
      var text = document.createElement('p');
      text.className = 'prayer-dhikr-prompt__text';
      text.textContent = 'Dëshiron të vazhdosh me dhikrin pas ' +
        PRAYER_LABELS_SQ[dhikrPromptPrayerKey] + '?';
      var actions = document.createElement('div');
      actions.className = 'prayer-dhikr-prompt__actions';
      var continueButton = document.createElement('button');
      continueButton.type = 'button';
      continueButton.className = 'btn btn--primary btn--sm';
      continueButton.textContent = dhikrSessionsByKey.has(dhikrPromptPrayerKey)
        ? 'Vazhdo dhikrin' : 'Vazhdo me dhikrin';
      continueButton.addEventListener('click', function () {
        var selectedPrayer = dhikrPromptPrayerKey;
        appContext.navigate('prayerDhikr', {
          params: { prayer: selectedPrayer, date: todayResult.dateKey }
        });
      });
      var dismiss = document.createElement('button');
      dismiss.type = 'button';
      dismiss.className = 'btn btn--ghost btn--sm';
      dismiss.textContent = 'Jo tani';
      dismiss.addEventListener('click', function () {
        dhikrPromptPrayerKey = null;
        renderFeedback();
      });
      actions.append(continueButton, dismiss);
      body.append(text, actions);
      prompt.appendChild(body);
      host.appendChild(prompt);
    }
  }

  function showLogFeedback(message, type) {
    logFeedback = { message: message, type: type || 'success' };
    renderFeedback();
    if (logFeedbackTimer) clearTimeout(logFeedbackTimer);
    logFeedbackTimer = setTimeout(function () {
      logFeedback = null;
      logFeedbackTimer = null;
      if (isMounted) renderFeedback();
    }, 3000);
  }

  function refreshLoggingUI(state, zonedNow) {
    var oldList = regions.result.querySelector('.prayer-list');
    if (oldList) {
      oldList.replaceWith(buildPrayerList(
        todayResult.timings,
        state,
        PRAYER_LABELS_SQ,
        prayerLogsByKey,
        dhikrSessionsByKey,
        zonedNow.totalMinutes,
        loggingAvailable,
        openPrayerLogDialog,
        openPostPrayerDhikr
      ));
    }
    var oldSummary = regions.result.querySelector('.prayer-summary');
    if (oldSummary && loggingAvailable) oldSummary.replaceWith(buildDailySummary(prayerLogsByKey));
    else if (oldSummary && !loggingAvailable) oldSummary.remove();
    renderFeedback();
  }

  function openPostPrayerDhikr(prayerKey) {
    if (!todayResult) return;
    appContext.navigate('prayerDhikr', {
      params: { prayer: prayerKey, date: todayResult.dateKey }
    });
  }

  function closePrayerLogDialog(restoreFocus) {
    if (!currentDialog) return;
    var dialog = currentDialog;
    currentDialog = null;
    dialog.destroy(restoreFocus !== false);
  }

  function openPrayerLogDialog(prayerKey, trigger) {
    if (!loggingAvailable || logOperationInProgress || !todayResult || currentDialog) return;
    currentDialog = buildLogDialog({
      prayerKey: prayerKey,
      existingLog: prayerLogsByKey.get(prayerKey) || null,
      dateKey: todayResult.dateKey,
      time: todayResult.timings[prayerKey],
      trigger: trigger,
      onClose: function () { closePrayerLogDialog(true); },
      onSave: async function (method) {
        if (!currentDialog || logOperationInProgress) return;
        logOperationInProgress = true;
        currentDialog.setBusy(true);
        try {
          var saved = await savePrayerLog({
            dateKey: todayResult.dateKey,
            prayerKey: prayerKey,
            method: method
          });
          if (!isMounted) return;
          prayerLogsByKey.set(prayerKey, saved);
          dhikrPromptPrayerKey = prayerKey;
          closePrayerLogDialog(true);
          var now = getZonedDateParts(new Date(), todayResult.timezone);
          var state = getPrayerState(todayResult, new Date(), tomorrowResult);
          if (now && state) refreshLoggingUI(state, now);
          showLogFeedback('U regjistrua', 'success');
        } catch (error) {
          if (isMounted && currentDialog) {
            currentDialog.setBusy(false);
            showLogFeedback('Regjistrimi nuk u ruajt. Provo përsëri.', 'warning');
          }
        } finally {
          logOperationInProgress = false;
        }
      },
      onDelete: async function () {
        if (!currentDialog || logOperationInProgress) return;
        logOperationInProgress = true;
        currentDialog.setBusy(true);
        try {
          await deletePrayerLog(todayResult.dateKey, prayerKey);
          if (!isMounted) return;
          prayerLogsByKey.delete(prayerKey);
          closePrayerLogDialog(true);
          var now = getZonedDateParts(new Date(), todayResult.timezone);
          var state = getPrayerState(todayResult, new Date(), tomorrowResult);
          if (now && state) refreshLoggingUI(state, now);
          showLogFeedback('Regjistrimi u hoq', 'success');
        } catch (error) {
          if (isMounted && currentDialog) {
            currentDialog.setBusy(false);
            showLogFeedback('Regjistrimi nuk u hoq. Provo përsëri.', 'warning');
          }
        } finally {
          logOperationInProgress = false;
        }
      }
    });
    document.body.appendChild(currentDialog.element);
    currentDialog.focus();
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
        lastTemporalSignature = null;
        return loadPrayerLogs(todayResult.dateKey).then(function () {
          if (!isMounted) return;
          renderPrayerResult();
          startTimer();
        });
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
        lastTemporalSignature = null;
        return loadPrayerLogs(todayResult.dateKey).then(function () {
          if (!isMounted) return;
          renderPrayerResult();
          isRefreshing = false;
        });
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

    var feedbackHost = document.createElement('div');
    feedbackHost.className = 'prayer-log-feedback-host';
    regions.result.appendChild(feedbackHost);

    var hero = buildHeroCard(state, PRAYER_LABELS_SQ, todayResult.timings);
    regions.result.appendChild(hero);

    var list = buildPrayerList(
      todayResult.timings,
      state,
      PRAYER_LABELS_SQ,
      prayerLogsByKey,
      dhikrSessionsByKey,
      getZonedDateParts(now, todayResult.timezone).totalMinutes,
      loggingAvailable,
      openPrayerLogDialog,
      openPostPrayerDhikr
    );
    regions.result.appendChild(list);

    if (loggingAvailable) regions.result.appendChild(buildDailySummary(prayerLogsByKey));
    renderFeedback();
    lastTemporalSignature = state.currentPrayer + '|' + state.nextPrayer;

    // Info card
    var info = buildInfoCard(todayResult.timings, todayResult, settings);
    regions.result.appendChild(info);

    // Actions
    var actions = buildActions(handleRefresh, handleChangeLocation, function () { appContext.navigate('prayer', { params: { qibla: '1' } }); });
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

    var signature = state.currentPrayer + '|' + state.nextPrayer;
    if (signature !== lastTemporalSignature) {
      lastTemporalSignature = signature;
      refreshLoggingUI(state, zonedNow);
    }
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
    if (logFeedbackTimer) clearTimeout(logFeedbackTimer);
    logFeedbackTimer = null;
    closePrayerLogDialog(false);
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
