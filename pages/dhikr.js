/**
 * Hayat — Daily Dhikr dashboard and resumable routine reader v1.
 */

import {
  DAILY_DHIKR_CONTENT_VERSION,
  DAILY_DHIKR_ROUTINES,
  BEDTIME_QURAN_READINGS,
  getDailyDhikrRoutine,
  getDailyDhikrItem
} from '../js/data/daily-dhikr.js';
import {
  DAILY_DHIKR_SESSION_STATUS,
  getDailyDhikrSession,
  createDailyDhikrSession,
  saveDailyDhikrSession,
  updateDailyDhikrItemProgress,
  setDailyDhikrCurrentItem,
  resetDailyDhikrSession,
  validateDailyDhikrSession
} from '../js/storage/daily-dhikr-progress.js';
import {
  getAyah,
  getAyahRange,
  QuranContentError
} from '../js/services/quran-content.js';
import { getQuranTransliterationSq } from '../js/data/quran-transliteration-sq.js';

var OBLIGATION_NOTE = 'Kjo rutinë është një ndihmë praktike për përkujtimin. Dhikri dhe duatë këtu nuk paraqiten si obligim.';
var REVIEW_NOTE = 'Përmbajtja është përgatitur me referenca dhe kërkon rishikim përfundimtar nga person i kualifikuar para publikimit të gjerë.';

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function localDateKey() {
  var now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}

function routineIcon(routineId) {
  if (routineId === 'morning') return 'sunrise';
  if (routineId === 'evening') return 'sunset';
  return 'moon';
}

function notice(className, text) {
  var box = document.createElement('p');
  box.className = className;
  box.textContent = text;
  return box;
}

function pageHeading(title, subtitle) {
  var header = document.createElement('header');
  header.className = 'route-page__header daily-dhikr-header';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Përkujtim i përditshëm';
  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.dataset.routeHeading = '';
  h1.textContent = title;
  var description = document.createElement('p');
  description.className = 'route-page__subtitle';
  description.textContent = subtitle;
  header.append(eyebrow, h1, description);
  return header;
}

function renderDashboard(page) {
  page.classList.add('daily-dhikr-page');
  var header = pageHeading('Dhikri', 'Rutinat e mëngjesit, mbrëmjes dhe para gjumit.');
  header.append(
    notice('daily-dhikr-obligation-note', OBLIGATION_NOTE),
    notice('daily-dhikr-review-note', REVIEW_NOTE)
  );

  var dashboard = document.createElement('div');
  dashboard.className = 'daily-dhikr-dashboard';
  dashboard.dataset.dailyDhikrDashboard = '';
  var storageWarning = document.createElement('p');
  storageWarning.className = 'daily-dhikr-storage-warning';
  storageWarning.dataset.dailyDhikrStorageWarning = '';
  storageWarning.setAttribute('role', 'status');
  storageWarning.textContent = 'Ruajtja lokale nuk është e disponueshme. Rutinat mund të hapen pa shfaqur progresin e ruajtur.';
  storageWarning.hidden = true;

  var cards = document.createElement('div');
  cards.className = 'daily-dhikr-cards';
  DAILY_DHIKR_ROUTINES.forEach(function (routine) {
    var card = document.createElement('article');
    card.className = 'daily-dhikr-routine-card card';
    card.dataset.dailyRoutineCard = routine.id;
    var body = document.createElement('div');
    body.className = 'card__body';
    var cardHeader = document.createElement('div');
    cardHeader.className = 'daily-dhikr-routine-card__header';
    var iconWrap = document.createElement('span');
    iconWrap.className = 'daily-dhikr-routine-card__icon';
    iconWrap.appendChild(icon(routineIcon(routine.id), 'icon--lg'));
    var heading = document.createElement('h2');
    heading.className = 'daily-dhikr-routine-card__title';
    heading.textContent = routine.titleSq;
    cardHeader.append(iconWrap, heading);
    var description = document.createElement('p');
    description.className = 'daily-dhikr-routine-card__description';
    description.textContent = routine.descriptionSq;
    var status = document.createElement('p');
    status.className = 'daily-dhikr-routine-card__status';
    status.dataset.dailyRoutineStatus = '';
    status.textContent = 'I pa filluar';
    var progressText = document.createElement('p');
    progressText.className = 'daily-dhikr-routine-card__progress-text';
    progressText.dataset.dailyRoutineProgressText = '';
    progressText.textContent = '0 nga ' + routine.items.length + ' të përfunduara';
    var progress = document.createElement('progress');
    progress.className = 'daily-dhikr-progress-bar';
    progress.max = routine.items.length;
    progress.value = 0;
    progress.dataset.dailyRoutineProgress = '';
    progress.setAttribute('aria-label', progressText.textContent);
    var action = document.createElement('button');
    action.type = 'button';
    action.className = 'btn btn--primary daily-dhikr-routine-card__action';
    action.dataset.openDailyRoutine = routine.id;
    action.textContent = 'Fillo';
    body.append(cardHeader, description, status, progressText, progress, action);
    card.appendChild(body);
    cards.appendChild(card);
  });

  var readings = document.createElement('section');
  readings.className = 'daily-dhikr-bedtime-readings';
  readings.dataset.bedtimeQuranReadings = '';
  readings.hidden = true;
  var readingsTitle = document.createElement('h2');
  readingsTitle.className = 'daily-dhikr-bedtime-readings__title';
  readingsTitle.textContent = 'Lexime para gjumit';
  var readingsNote = document.createElement('p');
  readingsNote.className = 'daily-dhikr-bedtime-readings__note';
  readingsNote.textContent = 'Lexime të veçanta nga rutina e Dhikrit; nuk hyjnë në progresin e saj.';
  var readingsList = document.createElement('div');
  readingsList.className = 'daily-dhikr-bedtime-readings__list';
  BEDTIME_QURAN_READINGS.forEach(function (reading) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'daily-dhikr-reading-card card';
    button.dataset.openBedtimeReading = String(reading.surah);
    button.setAttribute('aria-label', reading.titleSq + ', hap në Kuran');
    var iconWrap = document.createElement('span');
    iconWrap.className = 'daily-dhikr-reading-card__icon';
    iconWrap.appendChild(icon('book-open'));
    var text = document.createElement('span');
    text.className = 'daily-dhikr-reading-card__content';
    var title = document.createElement('span');
    title.className = 'daily-dhikr-reading-card__title';
    title.textContent = reading.titleSq;
    var description = document.createElement('span');
    description.className = 'daily-dhikr-reading-card__description';
    description.textContent = reading.descriptionSq + ' · Pa transliterim';
    text.append(title, description);
    var trailing = document.createElement('span');
    trailing.className = 'daily-dhikr-reading-card__trailing';
    trailing.appendChild(icon('chevron-right', 'icon--sm'));
    button.append(iconWrap, text, trailing);
    readingsList.appendChild(button);
  });
  readings.append(readingsTitle, readingsNote, readingsList);

  dashboard.append(storageWarning, cards, readings);
  page.append(header, dashboard);
}

function renderInvalid(page, message) {
  page.classList.add('daily-dhikr-page');
  var box = document.createElement('div');
  box.className = 'daily-dhikr-error';
  box.setAttribute('role', 'alert');
  box.appendChild(icon('alert-circle', 'icon--2xl'));
  var heading = document.createElement('h1');
  heading.className = 'daily-dhikr-error__title';
  heading.dataset.routeHeading = '';
  heading.textContent = message;
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--primary';
  back.dataset.dailyDhikrInvalidBack = '';
  back.textContent = 'Kthehu te Dhikri';
  box.append(heading, back);
  page.appendChild(box);
}

function renderReader(page, routine) {
  page.classList.add('daily-dhikr-page', 'daily-dhikr-reader');
  var header = document.createElement('header');
  header.className = 'daily-dhikr-reader__header';
  var top = document.createElement('div');
  top.className = 'daily-dhikr-reader__header-top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.dailyDhikrBack = '';
  back.setAttribute('aria-label', 'Kthehu te dashboard-i i Dhikrit');
  back.appendChild(icon('chevron-left'));
  var titles = document.createElement('div');
  titles.className = 'daily-dhikr-reader__titles';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Dhikri i përditshëm';
  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.dataset.routeHeading = '';
  h1.textContent = routine.titleSq;
  titles.append(eyebrow, h1);
  top.append(back, titles);
  var description = document.createElement('p');
  description.className = 'route-page__subtitle';
  description.textContent = routine.descriptionSq;
  header.append(
    top,
    description,
    notice('daily-dhikr-obligation-note', OBLIGATION_NOTE),
    notice('daily-dhikr-review-note', REVIEW_NOTE)
  );
  var content = document.createElement('div');
  content.className = 'daily-dhikr-reader__content';
  content.dataset.dailyDhikrReaderContent = '';
  page.append(header, content);
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page';
  var params = context.params || {};
  if (params.routine === undefined) {
    if (params.item !== undefined) renderInvalid(page, 'Mungon rutina për hyrjen e kërkuar.');
    else renderDashboard(page);
    return page;
  }

  var routine = getDailyDhikrRoutine(params.routine);
  if (!routine) {
    renderInvalid(page, 'Rutina e kërkuar nuk ekziston.');
  } else if (params.item !== undefined && !getDailyDhikrItem(routine.id, params.item)) {
    renderInvalid(page, 'Hyrja e kërkuar nuk ekziston në këtë rutinë.');
  } else {
    renderReader(page, routine);
  }
  return page;
}

export function mount(page, context, appContext) {
  if (page.querySelector('[data-daily-dhikr-dashboard]')) {
    return mountDashboard(page, appContext);
  }
  if (page.querySelector('[data-daily-dhikr-reader-content]')) {
    return mountReader(page, context, appContext);
  }
  var invalidBack = page.querySelector('[data-daily-dhikr-invalid-back]');
  if (!invalidBack) return function () {};
  var invalidHandler = function () { appContext.navigate('dhikr'); };
  invalidBack.addEventListener('click', invalidHandler);
  return function () { invalidBack.removeEventListener('click', invalidHandler); };
}

function completedCount(routine, session) {
  if (!session) return 0;
  return routine.items.reduce(function (total, item) {
    return total + (session.itemProgress[item.id].completed ? 1 : 0);
  }, 0);
}

function mountDashboard(page, appContext) {
  var mounted = true;
  var dashboard = page.querySelector('[data-daily-dhikr-dashboard]');
  var warning = page.querySelector('[data-daily-dhikr-storage-warning]');
  var readings = page.querySelector('[data-bedtime-quran-readings]');
  var settings = appContext.store.get('settings') || {};
  var showReadings = !settings.dhikr || settings.dhikr.showBedtimeQuranReadings !== false;
  if (readings) readings.hidden = !showReadings;
  var dateKey = localDateKey();

  function updateCard(routine, session) {
    var card = page.querySelector('[data-daily-routine-card="' + routine.id + '"]');
    if (!card) return;
    var done = completedCount(routine, session);
    var status = card.querySelector('[data-daily-routine-status]');
    var progressText = card.querySelector('[data-daily-routine-progress-text]');
    var progress = card.querySelector('[data-daily-routine-progress]');
    var action = card.querySelector('[data-open-daily-routine]');
    if (!session) {
      status.textContent = 'I pa filluar';
      action.textContent = 'Fillo';
    } else if (session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED) {
      status.textContent = 'U krye';
      action.textContent = 'Shiko';
    } else {
      status.textContent = 'Në vazhdim';
      action.textContent = 'Vazhdo';
    }
    progressText.textContent = done + ' nga ' + routine.items.length + ' të përfunduara';
    progress.value = done;
    progress.setAttribute('aria-label', progressText.textContent);
  }

  Promise.allSettled(DAILY_DHIKR_ROUTINES.map(function (routine) {
    return getDailyDhikrSession(dateKey, routine.id);
  })).then(function (results) {
    if (!mounted) return;
    results.forEach(function (result, index) {
      updateCard(DAILY_DHIKR_ROUTINES[index], result.status === 'fulfilled' ? result.value : null);
      if (result.status === 'rejected') warning.hidden = false;
    });
  });

  var openHandler = function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    var readingButton = target.closest('[data-open-bedtime-reading]');
    if (readingButton && dashboard.contains(readingButton)) {
      appContext.navigate('quran', {
        params: { surah: Number(readingButton.dataset.openBedtimeReading), ayah: 1 }
      });
      return;
    }
    var button = target.closest('[data-open-daily-routine]');
    if (!button || !dashboard.contains(button)) return;
    var routine = getDailyDhikrRoutine(button.dataset.openDailyRoutine);
    if (routine) appContext.navigate('dhikr', { params: { routine: routine.id } });
  };
  dashboard.addEventListener('click', openHandler);
  return function () {
    mounted = false;
    dashboard.removeEventListener('click', openHandler);
  };
}

function memorySession(dateKey, routine) {
  var now = new Date().toISOString();
  var id = dateKey + ':' + routine.id;
  var itemProgress = {};
  routine.items.forEach(function (item) {
    itemProgress[item.id] = { count: 0, completed: false, updatedAt: now };
  });
  return {
    id: id,
    dateRoutine: id,
    dateKey: dateKey,
    routineId: routine.id,
    status: DAILY_DHIKR_SESSION_STATUS.IN_PROGRESS,
    itemProgress: itemProgress,
    currentItemId: routine.items[0].id,
    startedAt: now,
    completedAt: null,
    updatedAt: now,
    contentVersion: DAILY_DHIKR_CONTENT_VERSION
  };
}

function mountReader(page, context, appContext) {
  var routine = getDailyDhikrRoutine(context.params.routine);
  var requestedItem = context.params.item === undefined
    ? null
    : getDailyDhikrItem(routine.id, context.params.item);
  var content = page.querySelector('[data-daily-dhikr-reader-content]');
  var back = page.querySelector('[data-daily-dhikr-back]');
  var dateKey = localDateKey();
  var mounted = true;
  var storageAvailable = true;
  var session = null;
  var saveTimer = null;
  var saveChain = Promise.resolve();
  var dirty = false;
  var quranController = null;
  var activeQuranItemId = null;
  var quranCache = new Map();
  var resetting = false;
  var storageWarningElement = null;
  var completionHost = null;
  var progressTextElement = null;
  var progressElement = null;
  var itemHost = null;
  var navigationHost = null;
  var resetHost = null;
  var feedbackHost = null;
  var counterElements = null;

  function showLoading() {
    content.replaceChildren();
    var loading = document.createElement('div');
    loading.className = 'app__loading';
    loading.setAttribute('role', 'status');
    var spinner = document.createElement('div');
    spinner.className = 'app__loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    var text = document.createElement('p');
    text.className = 'app__loading-text';
    text.textContent = 'Duke hapur rutinën...';
    loading.append(spinner, text);
    content.appendChild(loading);
  }

  function showStorageWarning() {
    if (!storageWarningElement) return;
    storageWarningElement.hidden = false;
    storageWarningElement.textContent = 'Ruajtja lokale nuk është e disponueshme. Progresi mbahet vetëm derisa kjo faqe të mbetet e hapur.';
  }

  function showFeedback(message) {
    if (feedbackHost) feedbackHost.textContent = message;
  }

  function snapshot() {
    return validateDailyDhikrSession(session);
  }

  function markDirty() {
    dirty = true;
  }

  function persistNow() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (!storageAvailable || !dirty) return saveChain;
    var value = snapshot();
    if (!value) return saveChain;
    dirty = false;
    saveChain = saveChain.catch(function () {}).then(function () {
      return saveDailyDhikrSession(value);
    }).catch(function (error) {
      storageAvailable = false;
      if (mounted) {
        showStorageWarning();
        showFeedback('Progresi vazhdon në këtë sesion, por nuk u ruajt lokalisht.');
      }
      return null;
    });
    return saveChain;
  }

  function scheduleSave() {
    if (!storageAvailable) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      persistNow();
    }, 400);
  }

  function renderShell() {
    content.replaceChildren();
    storageWarningElement = document.createElement('p');
    storageWarningElement.className = 'daily-dhikr-storage-warning';
    storageWarningElement.setAttribute('role', 'status');
    storageWarningElement.hidden = storageAvailable;

    completionHost = document.createElement('div');
    completionHost.className = 'daily-dhikr-completion-host';

    var progressBox = document.createElement('section');
    progressBox.className = 'daily-dhikr-progress';
    progressBox.setAttribute('aria-label', 'Progresi i rutinës');
    progressTextElement = document.createElement('p');
    progressTextElement.className = 'daily-dhikr-progress__text';
    progressElement = document.createElement('progress');
    progressElement.className = 'daily-dhikr-progress-bar';
    progressElement.max = routine.items.length;
    progressBox.append(progressTextElement, progressElement);

    itemHost = document.createElement('div');
    itemHost.className = 'daily-dhikr-item-host';
    navigationHost = document.createElement('nav');
    navigationHost.className = 'daily-dhikr-navigation';
    navigationHost.setAttribute('aria-label', 'Navigimi i hyrjeve të rutinës');

    var utility = document.createElement('div');
    utility.className = 'daily-dhikr-utility';
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn--ghost btn--sm';
    reset.append(icon('rotate-ccw', 'icon--sm'), document.createTextNode(' Rifillo rutinën'));
    reset.addEventListener('click', showResetConfirmation);
    utility.appendChild(reset);

    resetHost = document.createElement('div');
    resetHost.className = 'daily-dhikr-reset-host';
    feedbackHost = document.createElement('p');
    feedbackHost.className = 'daily-dhikr-feedback sr-only';
    feedbackHost.setAttribute('role', 'status');
    feedbackHost.setAttribute('aria-live', 'polite');

    content.append(
      storageWarningElement,
      completionHost,
      progressBox,
      itemHost,
      navigationHost,
      utility,
      resetHost,
      feedbackHost
    );
    if (!storageAvailable) showStorageWarning();
  }

  function renderCompletion() {
    completionHost.replaceChildren();
    if (session.status !== DAILY_DHIKR_SESSION_STATUS.COMPLETED) return;
    var completion = document.createElement('div');
    completion.className = 'daily-dhikr-completion';
    completion.setAttribute('role', 'status');
    completion.appendChild(icon('check-circle', 'icon--xl'));
    var text = document.createElement('p');
    text.className = 'daily-dhikr-completion__title';
    text.textContent = 'Rutina u përfundua.';
    var note = document.createElement('p');
    note.className = 'daily-dhikr-completion__text';
    note.textContent = 'Allahu ta pranoftë.';
    completion.append(text, note);
    completionHost.appendChild(completion);
  }

  function updateProgress() {
    var done = completedCount(routine, session);
    progressTextElement.textContent = done + ' nga ' + routine.items.length + ' të përfunduara';
    progressElement.value = done;
    progressElement.setAttribute('aria-label', progressTextElement.textContent);
  }

  function shouldAnnounceCount(count, target) {
    return target <= 10 || count === 1 || count === target || count % 5 === 0;
  }

  function updateCounter() {
    if (!counterElements) return;
    var item = getDailyDhikrItem(routine.id, counterElements.itemId);
    var progress = session.itemProgress[item.id];
    var completed = progress.completed;
    counterElements.button.disabled = resetting || completed ||
      session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED;
    counterElements.value.textContent = item.repetitions === 1
      ? (completed ? 'U krye' : 'Shëno si të kryer')
      : progress.count + ' / ' + item.repetitions;
    counterElements.button.setAttribute('aria-label', completed
      ? item.titleSq + ', u krye'
      : 'Rrit numërimin për ' + item.titleSq + ', ' + progress.count +
        ' nga ' + item.repetitions);
    if (shouldAnnounceCount(progress.count, item.repetitions)) {
      counterElements.status.textContent = completed
        ? item.titleSq + ': u krye.'
        : progress.count + ' nga ' + item.repetitions;
    }
  }

  function buildCounter(item) {
    var wrapper = document.createElement('div');
    wrapper.className = 'daily-dhikr-counter';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--primary daily-dhikr-counter__button';
    var value = document.createElement('span');
    value.className = 'daily-dhikr-counter__value';
    var status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    button.appendChild(value);
    wrapper.append(button, status);
    counterElements = { itemId: item.id, button: button, value: value, status: status };
    updateCounter();

    button.addEventListener('click', function () {
      var current = session.itemProgress[item.id];
      if (resetting || current.completed ||
          session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED) return;
      session = updateDailyDhikrItemProgress(session, item.id, current.count + 1);
      markDirty();
      updateCounter();
      updateProgress();
      renderCompletion();
      if (session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED) {
        persistNow();
        showFeedback('Rutina u përfundua.');
      } else {
        scheduleSave();
      }
    });
    return wrapper;
  }

  function sourceBlock(item) {
    var source = document.createElement('details');
    source.className = 'daily-dhikr-item__source';
    var summary = document.createElement('summary');
    summary.textContent = 'Burimi: ' + item.source.collection;
    var details = document.createElement('div');
    details.className = 'daily-dhikr-item__source-details';
    var reference = document.createElement('p');
    reference.textContent = 'Referenca: ' + item.source.reference;
    var edition = document.createElement('p');
    var sourceLink = document.createElement('a');
    sourceLink.href = item.source.sourceUrl;
    sourceLink.target = '_blank';
    sourceLink.rel = 'noopener noreferrer';
    sourceLink.textContent = item.source.sourceWork;
    edition.append(
      document.createTextNode('Botimi shqip: '),
      sourceLink,
      document.createTextNode(' · ' + item.source.sourceChapter + ' · f. ' +
        item.source.sourcePages.join('–'))
    );
    var credits = document.createElement('p');
    credits.textContent = 'Përktheu: ' + item.source.translator +
      ' · Redaktor fetar: ' + item.source.religiousEditor +
      ' · Redaktor gjuhësor: ' + item.source.languageEditor;
    details.append(reference, edition, credits);
    if (item.type === 'quran' || item.type === 'quran_group') {
      var quranTranslation = document.createElement('p');
      quranTranslation.className = 'daily-dhikr-item__source-note';
      quranTranslation.textContent = 'Arabishtja dhe përkthimi: QuranEnc · Hasan Nahi. Transliterimi: Mburoja e Muslimanit · Azem Bardhoshi.';
      details.appendChild(quranTranslation);
    }
    if (item.source.noteSq) {
      var note = document.createElement('p');
      note.className = 'daily-dhikr-item__source-note';
      note.textContent = item.source.noteSq;
      details.appendChild(note);
    }
    source.append(summary, details);
    return source;
  }

  function quranReferenceText(item) {
    var references = item.type === 'quran_group' ? item.quranReferences : [item.quranReference];
    return references.map(function (reference) {
      return reference.ayahStart === reference.ayahEnd
        ? 'Sureja ' + reference.surah + ', ajeti ' + reference.ayahStart
        : 'Sureja ' + reference.surah + ', ajetet ' + reference.ayahStart + '–' + reference.ayahEnd;
    }).join(' · ');
  }

  function showQuranLoading(container, item) {
    container.replaceChildren();
    var loading = document.createElement('div');
    loading.className = 'daily-dhikr-quran__loading';
    loading.setAttribute('role', 'status');
    loading.textContent = 'Duke ngarkuar tekstin e Kur\'anit...';
    var reference = document.createElement('p');
    reference.className = 'daily-dhikr-quran__reference';
    reference.textContent = quranReferenceText(item);
    container.append(loading, reference);
  }

  function showQuranError(container, item) {
    container.replaceChildren();
    var box = document.createElement('div');
    box.className = 'daily-dhikr-quran__error';
    box.setAttribute('role', 'status');
    var message = document.createElement('p');
    message.textContent = 'Teksti i Kur\'anit nuk u ngarkua.';
    var reference = document.createElement('p');
    reference.className = 'daily-dhikr-quran__reference';
    reference.textContent = quranReferenceText(item);
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn--outline btn--sm';
    retry.append(icon('refresh', 'icon--sm'), document.createTextNode(' Provo përsëri'));
    retry.addEventListener('click', function () {
      quranCache.delete(item.id);
      loadQuranItem(item, container);
    });
    box.append(message, reference, retry);
    container.appendChild(box);
  }

  function showQuranSuccess(container, verses) {
    container.replaceChildren();
    var list = document.createElement('div');
    list.className = 'daily-dhikr-quran__verses';
    verses.forEach(function (verse) {
      var block = document.createElement('section');
      block.className = 'daily-dhikr-quran__verse';
      var arabic = document.createElement('p');
      arabic.className = 'daily-dhikr-quran__arabic text-quran';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = verse.arabicText;
      var transliterationEntry = getQuranTransliterationSq(verse.verseKey);
      var transliteration = document.createElement('p');
      transliteration.className = 'daily-dhikr-quran__transliteration';
      transliteration.textContent = transliterationEntry
        ? transliterationEntry.transliterationSq
        : 'Transliterimi nuk është ende i disponueshëm për këtë ajet.';
      if (!transliterationEntry) {
        transliteration.classList.add('daily-dhikr-quran__transliteration--missing');
      }
      var translation = document.createElement('p');
      translation.className = 'daily-dhikr-quran__translation';
      translation.textContent = verse.translationSq;
      var reference = document.createElement('p');
      reference.className = 'daily-dhikr-quran__reference';
      reference.textContent = verse.verseKey;
      block.append(arabic, transliteration, translation, reference);
      if (verse.footnotesSq) {
        var details = document.createElement('details');
        details.className = 'daily-dhikr-quran__footnotes';
        var summary = document.createElement('summary');
        summary.textContent = 'Shënime të përkthimit';
        var footnotes = document.createElement('p');
        footnotes.textContent = verse.footnotesSq;
        details.append(summary, footnotes);
        block.appendChild(details);
      }
      list.appendChild(block);
    });
    var attribution = document.createElement('p');
    attribution.className = 'daily-dhikr-quran__attribution';
    var link = document.createElement('a');
    link.href = verses[0].providerUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = verses[0].provider;
    attribution.append(link, document.createTextNode(' · ' + verses[0].translationNameSq));
    container.append(list, attribution);
  }

  function loadQuranItem(item, container) {
    var cached = quranCache.get(item.id);
    if (cached && cached.status === 'success') {
      showQuranSuccess(container, cached.verses);
      return;
    }
    if (cached && cached.status === 'error') {
      showQuranError(container, item);
      return;
    }
    if (quranController) quranController.abort();
    var controller = new AbortController();
    quranController = controller;
    quranCache.set(item.id, { status: 'loading', controller: controller });
    showQuranLoading(container, item);
    function requestReference(reference) {
      return reference.ayahStart === reference.ayahEnd
        ? getAyah(reference.surah, reference.ayahStart, { signal: controller.signal })
          .then(function (verse) { return [verse]; })
        : getAyahRange(reference.surah, reference.ayahStart, reference.ayahEnd, {
          signal: controller.signal
        });
    }
    var request = item.type === 'quran_group'
      ? Promise.all(item.quranReferences.map(requestReference)).then(function (groups) {
        return groups.reduce(function (verses, group) { return verses.concat(group); }, []);
      })
      : requestReference(item.quranReference);
    request.then(function (verses) {
      var cachedRequest = quranCache.get(item.id);
      if (!cachedRequest || cachedRequest.controller !== controller) return;
      quranCache.set(item.id, { status: 'success', verses: verses.slice() });
      if (mounted && activeQuranItemId === item.id) showQuranSuccess(container, verses);
    }).catch(function (error) {
      var cachedRequest = quranCache.get(item.id);
      if (!cachedRequest || cachedRequest.controller !== controller) return;
      if (error instanceof QuranContentError && error.code === 'ABORTED') {
        quranCache.delete(item.id);
        return;
      }
      quranCache.set(item.id, { status: 'error' });
      if (mounted && activeQuranItemId === item.id) showQuranError(container, item);
    }).finally(function () {
      if (quranController === controller) quranController = null;
    });
  }

  function moveToItem(index, moveFocus) {
    var item = routine.items[index];
    if (resetting || !item) return;
    session = setDailyDhikrCurrentItem(session, item.id);
    markDirty();
    persistNow();
    renderCurrentItem(moveFocus);
  }

  function renderNavigation(index) {
    navigationHost.replaceChildren();
    var previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'btn btn--outline';
    previous.disabled = index === 0;
    previous.setAttribute('aria-label', 'Hyrja paraardhëse');
    previous.append(icon('chevron-left', 'icon--sm'), document.createTextNode(' Mbrapa'));
    previous.addEventListener('click', function () { moveToItem(index - 1, true); });
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn btn--primary';
    next.disabled = index === routine.items.length - 1;
    next.setAttribute('aria-label', 'Hyrja pasuese');
    next.append(document.createTextNode('Tjetra '), icon('chevron-right', 'icon--sm'));
    next.addEventListener('click', function () { moveToItem(index + 1, true); });
    navigationHost.append(previous, next);
  }

  function renderCurrentItem(moveFocus) {
    if (quranController) {
      quranController.abort();
      quranController = null;
    }
    var index = routine.items.findIndex(function (item) {
      return item.id === session.currentItemId;
    });
    if (index < 0) {
      index = 0;
      session = setDailyDhikrCurrentItem(session, routine.items[0].id);
      markDirty();
    }
    var item = routine.items[index];
    activeQuranItemId = item.type === 'quran' || item.type === 'quran_group' ? item.id : null;
    counterElements = null;
    itemHost.replaceChildren();

    var card = document.createElement('article');
    card.className = 'daily-dhikr-item card';
    var body = document.createElement('div');
    body.className = 'card__body';
    var step = document.createElement('p');
    step.className = 'daily-dhikr-item__step';
    step.textContent = 'Hapi ' + (index + 1) + ' nga ' + routine.items.length;
    var title = document.createElement('h2');
    title.className = 'daily-dhikr-item__title';
    title.tabIndex = -1;
    title.textContent = item.titleSq;
    body.append(step, title);

    if (item.type === 'text') {
      var arabic = document.createElement('p');
      arabic.className = 'daily-dhikr-item__arabic text-arabic';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = item.arabic;
      var transliteration = document.createElement('p');
      transliteration.className = 'daily-dhikr-item__transliteration';
      transliteration.textContent = item.transliterationSq;
      var translation = document.createElement('p');
      translation.className = 'daily-dhikr-item__translation';
      translation.textContent = item.translationSq;
      body.append(arabic, transliteration, translation);
    } else {
      if (item.type === 'quran_group' && item.guidanceSq) {
        var guidance = document.createElement('p');
        guidance.className = 'daily-dhikr-item__guidance';
        guidance.textContent = item.guidanceSq;
        body.appendChild(guidance);
      }
      var quran = document.createElement('div');
      quran.className = 'daily-dhikr-quran';
      body.appendChild(quran);
      loadQuranItem(item, quran);
    }
    body.append(buildCounter(item), sourceBlock(item));
    card.appendChild(body);
    itemHost.appendChild(card);
    renderNavigation(index);
    updateProgress();
    renderCompletion();
    if (moveFocus) {
      setTimeout(function () {
        if (mounted) title.focus({ preventScroll: true });
      }, 0);
    }
  }

  function showResetConfirmation() {
    resetHost.replaceChildren();
    var panel = document.createElement('div');
    panel.className = 'daily-dhikr-reset-confirmation';
    var text = document.createElement('p');
    text.textContent = 'Ta rifillojmë këtë rutinë? Progresi i sotëm do të pastrohet.';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'btn btn--ghost btn--sm';
    cancel.textContent = 'Anulo';
    cancel.addEventListener('click', function () { resetHost.replaceChildren(); });
    var confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'btn btn--danger btn--sm';
    confirm.textContent = 'Rifillo';
    confirm.addEventListener('click', resetRoutine);
    panel.append(text, cancel, confirm);
    resetHost.appendChild(panel);
  }

  function resetRoutine() {
    resetHost.replaceChildren();
    resetting = true;
    updateCounter();
    if (!storageAvailable) {
      session = memorySession(dateKey, routine);
      dirty = false;
      resetting = false;
      renderCurrentItem(false);
      showFeedback('Rutina u rifillua në këtë sesion.');
      return;
    }
    persistNow().then(function () {
      return resetDailyDhikrSession(dateKey, routine.id);
    }).then(function () {
      return createDailyDhikrSession(dateKey, routine.id);
    }).then(function (created) {
      if (!mounted) return;
      session = created;
      dirty = false;
      resetting = false;
      renderCurrentItem(false);
      showFeedback('Rutina u rifillua.');
    }).catch(function () {
      if (!mounted) return;
      storageAvailable = false;
      session = memorySession(dateKey, routine);
      dirty = false;
      resetting = false;
      showStorageWarning();
      renderCurrentItem(false);
      showFeedback('Rutina u rifillua vetëm në këtë sesion.');
    });
  }

  function initializeWithSession(value) {
    session = value;
    if (requestedItem && session.currentItemId !== requestedItem.id) {
      session = setDailyDhikrCurrentItem(session, requestedItem.id);
      markDirty();
    }
    renderShell();
    renderCurrentItem(false);
    if (dirty) persistNow();
  }

  function initialize() {
    showLoading();
    getDailyDhikrSession(dateKey, routine.id).then(function (existing) {
      return existing || createDailyDhikrSession(dateKey, routine.id);
    }).then(function (saved) {
      if (mounted) initializeWithSession(saved);
    }).catch(function () {
      if (!mounted) return;
      storageAvailable = false;
      var fallback = memorySession(dateKey, routine);
      if (requestedItem) fallback = setDailyDhikrCurrentItem(fallback, requestedItem.id);
      initializeWithSession(fallback);
      showStorageWarning();
    });
  }

  function backHandler() {
    persistNow();
    appContext.navigate('dhikr');
  }
  function visibilityHandler() {
    if (document.hidden) persistNow();
  }
  function pageHideHandler() { persistNow(); }

  back.addEventListener('click', backHandler);
  document.addEventListener('visibilitychange', visibilityHandler);
  window.addEventListener('pagehide', pageHideHandler);
  initialize();

  return function () {
    persistNow();
    mounted = false;
    if (quranController) quranController.abort();
    quranController = null;
    if (saveTimer) clearTimeout(saveTimer);
    back.removeEventListener('click', backHandler);
    document.removeEventListener('visibilitychange', visibilityHandler);
    window.removeEventListener('pagehide', pageHideHandler);
  };
}
