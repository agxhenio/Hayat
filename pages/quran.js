/**
 * Hayat — Quran Home and continuous Surah Reader v1.
 */

import {
  QURAN_CONTENT_API,
  isValidSurahNumber,
  isValidAyahNumber
} from '../js/config.js';
import { getSurah, QuranContentError } from '../js/services/quran-content.js';
import {
  getLastReadPosition,
  saveLastReadPosition,
  getHatmahPosition,
  saveHatmahPosition
} from '../js/storage/quran-reading.js';

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function numeric(value) {
  if (Number.isInteger(value)) return value;
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null;
}

function pageHeader(title, subtitle) {
  var header = document.createElement('header');
  header.className = 'route-page__header';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Fjala e Allahut';
  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.dataset.routeHeading = '';
  h1.textContent = title;
  var text = document.createElement('p');
  text.className = 'route-page__subtitle';
  text.textContent = subtitle;
  header.append(eyebrow, h1, text);
  return header;
}

function homeCard(title, iconName) {
  var card = document.createElement('section');
  card.className = 'quran-home-card card';
  var body = document.createElement('div');
  body.className = 'card__body';
  var header = document.createElement('div');
  header.className = 'quran-home-card__header';
  header.appendChild(icon(iconName, 'icon--lg'));
  var heading = document.createElement('h2');
  heading.className = 'card__title';
  heading.textContent = title;
  header.appendChild(heading);
  body.appendChild(header);
  card.appendChild(body);
  return { card: card, body: body };
}

function renderHome(page) {
  var home = document.createElement('div');
  home.className = 'quran-home';
  home.appendChild(pageHeader("Kur'ani", 'Lexim i qetë dhe vazhdim aty ku e le.'));
  var warning = document.createElement('div');
  warning.className = 'quran-storage-warning';
  warning.dataset.quranStorageWarning = '';
  warning.hidden = true;
  warning.setAttribute('role', 'status');
  warning.textContent = 'Ruajtja lokale nuk është e disponueshme. Leximi vazhdon pa ruajtur pozicionin.';
  home.appendChild(warning);

  var cards = document.createElement('div');
  cards.className = 'quran-home-cards';

  var last = homeCard('Vazhdo leximin', 'book-open');
  var lastPosition = document.createElement('p');
  lastPosition.className = 'quran-home-card__position';
  lastPosition.dataset.lastReadPosition = '';
  lastPosition.textContent = 'Duke ngarkuar...';
  var lastActions = document.createElement('div');
  lastActions.className = 'card__actions';
  lastActions.dataset.lastReadActions = '';
  last.body.append(lastPosition, lastActions);

  var hatmah = homeCard('Pozicioni i hatmes', 'bookmark');
  var hatmahPosition = document.createElement('p');
  hatmahPosition.className = 'quran-home-card__position';
  hatmahPosition.dataset.hatmahPosition = '';
  hatmahPosition.textContent = 'Duke ngarkuar...';
  var explanation = document.createElement('p');
  explanation.className = 'quran-home-card__description';
  explanation.textContent = 'Pozicioni i hatmes ruhet veçmas nga faqja e fundit e hapur.';
  var hatmahActions = document.createElement('div');
  hatmahActions.className = 'card__actions';
  hatmahActions.dataset.hatmahActions = '';
  hatmah.body.append(hatmahPosition, explanation, hatmahActions);

  var open = homeCard('Hap një sure', 'search');
  var form = document.createElement('form');
  form.className = 'quran-open-form';
  form.dataset.quranOpenForm = '';
  var grid = document.createElement('div');
  grid.className = 'quran-open-form__grid';
  function numberField(labelText, name, min, max, required) {
    var field = document.createElement('div');
    field.className = 'field';
    var label = document.createElement('label');
    label.className = 'field__label';
    label.htmlFor = 'quran-' + name;
    label.textContent = labelText;
    var input = document.createElement('input');
    input.className = 'input';
    input.type = 'number';
    input.id = 'quran-' + name;
    input.name = name;
    input.min = String(min);
    input.max = String(max);
    input.required = Boolean(required);
    field.append(label, input);
    return field;
  }
  grid.append(
    numberField('Sureja (1–114)', 'surah', 1, 114, true),
    numberField('Ajeti (opsional)', 'ayah', 1, 286, false)
  );
  var validation = document.createElement('p');
  validation.className = 'field__error';
  validation.dataset.quranFormError = '';
  validation.hidden = true;
  var submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'btn btn--primary';
  submit.textContent = 'Hap suren';
  form.append(grid, validation, submit);
  open.body.appendChild(form);

  cards.append(last.card, hatmah.card, open.card);
  home.appendChild(cards);
  page.appendChild(home);
}

function renderReader(page, surah, ayah) {
  var reader = document.createElement('div');
  reader.className = 'reader quran-reader';
  reader.dataset.readerTheme = 'night';
  reader.dataset.readerSurah = String(surah);
  reader.dataset.readerAyah = String(ayah);

  var topbar = document.createElement('header');
  topbar.className = 'quran-reader__topbar';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon reader-control';
  back.dataset.quranBack = '';
  back.setAttribute('aria-label', "Kthehu te Kur'ani");
  back.appendChild(icon('chevron-left'));
  var titles = document.createElement('div');
  titles.className = 'quran-reader__title-group';
  var h1 = document.createElement('h1');
  h1.className = 'quran-reader__title';
  h1.dataset.routeHeading = '';
  h1.textContent = 'Sureja ' + surah;
  var reference = document.createElement('span');
  reference.className = 'quran-reader__reference';
  reference.dataset.currentVerseReference = '';
  reference.textContent = surah + ':' + ayah;
  titles.append(h1, reference);
  var hatmah = document.createElement('button');
  hatmah.type = 'button';
  hatmah.className = 'btn btn--ghost btn--sm';
  hatmah.dataset.saveHatmah = '';
  hatmah.append(icon('bookmark', 'icon--sm'), document.createTextNode(' Ruaj si hatme'));
  topbar.append(back, titles, hatmah);

  var controls = document.createElement('div');
  controls.className = 'quran-reader__controls';
  ['paper:Letër', 'sepia:Sepia', 'night:Natë'].forEach(function (definition) {
    var parts = definition.split(':');
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn--outline btn--sm';
    button.dataset.readerThemeChoice = parts[0];
    button.textContent = parts[1];
    controls.appendChild(button);
  });

  var feedback = document.createElement('div');
  feedback.className = 'quran-reader__feedback-host';
  feedback.dataset.quranReaderFeedback = '';
  var content = document.createElement('div');
  content.className = 'quran-reader__content';
  content.dataset.quranReaderContent = '';
  var loading = document.createElement('div');
  loading.className = 'quran-reader__loading';
  loading.setAttribute('role', 'status');
  loading.textContent = 'Duke ngarkuar suren...';
  content.appendChild(loading);
  reader.append(topbar, controls, feedback, content);
  page.appendChild(reader);
}

function renderInvalid(page) {
  page.appendChild(pageHeader("Kur'ani", 'Referenca e kërkuar nuk është e vlefshme.'));
  var error = document.createElement('div');
  error.className = 'quran-reader__error';
  error.setAttribute('role', 'alert');
  error.textContent = 'Numri i sures ose i ajetit është i pavlefshëm.';
  page.appendChild(error);
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page quran-page';
  var params = context.params || {};
  if (params.surah === undefined) renderHome(page);
  else {
    var surah = numeric(params.surah);
    var ayah = params.ayah === undefined ? 1 : numeric(params.ayah);
    if (isValidSurahNumber(surah) && isValidAyahNumber(ayah)) renderReader(page, surah, ayah);
    else renderInvalid(page);
  }
  return page;
}

export function mount(page, context, appContext) {
  var reader = page.querySelector('.quran-reader');
  return reader ? mountReader(page, reader, context, appContext) : mountHome(page, appContext);
}

function mountHome(page, appContext) {
  var mounted = true;
  var warning = page.querySelector('[data-quran-storage-warning]');
  function showStorageWarning() { if (warning) warning.hidden = false; }
  function positionButton(position, label, target, actions) {
    target.textContent = position
      ? 'Sureja ' + position.surah + ' · Ajeti ' + position.ayah
      : (label === 'Vazhdo leximin' ? 'Nuk ka ende pozicion leximi.' : 'Pozicioni i hatmes nuk është vendosur.');
    actions.replaceChildren();
    if (position) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn--outline btn--sm';
      button.textContent = label;
      button.addEventListener('click', function () {
        appContext.navigate('quran', { params: { surah: position.surah, ayah: position.ayah } });
      });
      actions.appendChild(button);
    }
  }

  Promise.allSettled([getLastReadPosition(), getHatmahPosition()]).then(function (results) {
    if (!mounted) return;
    var lastTarget = page.querySelector('[data-last-read-position]');
    var lastActions = page.querySelector('[data-last-read-actions]');
    var hatmahTarget = page.querySelector('[data-hatmah-position]');
    var hatmahActions = page.querySelector('[data-hatmah-actions]');
    if (results[0].status === 'fulfilled') {
      positionButton(results[0].value, 'Vazhdo leximin', lastTarget, lastActions);
    } else {
      positionButton(null, 'Vazhdo leximin', lastTarget, lastActions); showStorageWarning();
    }
    if (results[1].status === 'fulfilled') {
      positionButton(results[1].value, 'Hap pozicionin', hatmahTarget, hatmahActions);
    } else {
      positionButton(null, 'Hap pozicionin', hatmahTarget, hatmahActions); showStorageWarning();
    }
  });

  var form = page.querySelector('[data-quran-open-form]');
  var submitHandler = function (event) {
    event.preventDefault();
    var surah = numeric(form.elements.surah.value);
    var ayah = form.elements.ayah.value === '' ? 1 : numeric(form.elements.ayah.value);
    var error = page.querySelector('[data-quran-form-error]');
    if (!isValidSurahNumber(surah) || !isValidAyahNumber(ayah)) {
      error.hidden = false;
      error.textContent = 'Vendos një sure 1–114 dhe një ajet të vlefshëm.';
      return;
    }
    error.hidden = true;
    appContext.navigate('quran', { params: { surah: surah, ayah: ayah } });
  };
  if (form) form.addEventListener('submit', submitHandler);
  return function () {
    mounted = false;
    if (form) form.removeEventListener('submit', submitHandler);
  };
}

function mountReader(page, reader, context, appContext) {
  var surah = numeric(context.params.surah);
  var requestedAyah = context.params.ayah === undefined ? 1 : numeric(context.params.ayah);
  var content = page.querySelector('[data-quran-reader-content]');
  var reference = page.querySelector('[data-current-verse-reference]');
  var feedbackHost = page.querySelector('[data-quran-reader-feedback]');
  var appView = document.querySelector('.app__view');
  var mounted = true;
  var controller = new AbortController();
  var observer = null;
  var visibleEntries = new Map();
  var currentPosition = { surah: surah, ayah: requestedAyah, page: null };
  var lastQueuedKey = null;
  var pendingPosition = null;
  var saveTimer = null;
  var saveChain = Promise.resolve();
  var storageAvailable = true;
  var feedbackTimer = null;

  var globalTheme = appContext.store.get('settings.theme');
  setReaderTheme(globalTheme === 'light' ? 'paper' : 'night');

  function setReaderTheme(theme) {
    reader.dataset.readerTheme = theme;
    page.querySelectorAll('[data-reader-theme-choice]').forEach(function (button) {
      var active = button.dataset.readerThemeChoice === theme;
      button.classList.toggle('btn--primary', active);
      button.classList.toggle('btn--outline', !active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  page.querySelectorAll('[data-reader-theme-choice]').forEach(function (button) {
    button.addEventListener('click', function () { setReaderTheme(button.dataset.readerThemeChoice); });
  });
  page.querySelector('[data-quran-back]').addEventListener('click', function () {
    flushPosition();
    appContext.navigate('quran');
  });
  page.querySelector('[data-save-hatmah]').addEventListener('click', function () {
    saveHatmahPosition(currentPosition).then(function () {
      if (mounted) showFeedback('Pozicioni i hatmes u ruajt.', 'success');
    }).catch(function () {
      if (mounted) showFeedback('Nuk u arrit të ruhet pozicioni i hatmes.', 'warning');
    });
  });

  function showFeedback(message, type) {
    feedbackHost.replaceChildren();
    var box = document.createElement('div');
    box.className = 'quran-reader__feedback alert alert--' + type;
    box.setAttribute('role', 'status');
    box.textContent = message;
    feedbackHost.appendChild(box);
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(function () {
      if (mounted) feedbackHost.replaceChildren();
    }, 3000);
  }

  function queuePosition(position) {
    if (!storageAvailable) return;
    var key = position.surah + ':' + position.ayah;
    if (key === lastQueuedKey) return;
    pendingPosition = Object.assign({}, position);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushPosition, 500);
  }

  function flushPosition() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    if (!storageAvailable || !pendingPosition) return saveChain;
    var position = pendingPosition;
    pendingPosition = null;
    lastQueuedKey = position.surah + ':' + position.ayah;
    saveChain = saveChain.catch(function () {}).then(function () {
      return saveLastReadPosition(position);
    }).catch(function (error) {
      storageAvailable = false;
      if (mounted) showFeedback('Ruajtja e pozicionit nuk është e disponueshme.', 'warning');
      return null;
    });
    return saveChain;
  }

  function renderVerses(verses) {
    var target = verses.find(function (verse) { return verse.ayah === requestedAyah; });
    if (!target) {
      renderReaderError(new QuranContentError('Ajeti nuk u gjet', 'NOT_FOUND'));
      return;
    }
    content.replaceChildren();
    var list = document.createElement('div');
    list.className = 'quran-reader__verse-list';
    verses.forEach(function (verse) {
      var article = document.createElement('article');
      article.className = 'quran-reader__verse';
      article.dataset.verseKey = verse.verseKey;
      article.dataset.ayah = String(verse.ayah);
      var arabic = document.createElement('p');
      arabic.className = 'quran-reader__arabic text-quran';
      arabic.lang = 'ar'; arabic.dir = 'rtl'; arabic.textContent = verse.arabicText;
      var translation = document.createElement('p');
      translation.className = 'quran-reader__translation';
      translation.textContent = verse.translationSq;
      var verseRef = document.createElement('p');
      verseRef.className = 'quran-reader__verse-reference';
      verseRef.textContent = verse.verseKey;
      article.append(arabic, translation, verseRef);
      if (verse.footnotesSq) {
        var details = document.createElement('details');
        details.className = 'quran-reader__footnotes';
        var summary = document.createElement('summary');
        summary.textContent = 'Shënime të përkthimit';
        var note = document.createElement('p');
        note.textContent = verse.footnotesSq;
        details.append(summary, note);
        article.appendChild(details);
      }
      list.appendChild(article);
    });
    var attribution = document.createElement('p');
    attribution.className = 'quran-reader__attribution';
    var link = document.createElement('a');
    link.href = verses[0].providerUrl;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = verses[0].provider;
    attribution.append(link, document.createTextNode(' · ' + verses[0].translationNameSq));
    content.append(list, attribution);

    currentPosition = { surah: surah, ayah: requestedAyah, page: null };
    reference.textContent = surah + ':' + requestedAyah;
    queuePosition(currentPosition);
    var targetElement = list.querySelector('[data-ayah="' + requestedAyah + '"]');
    requestAnimationFrame(function () {
      if (!mounted || !targetElement) return;
      targetElement.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start'
      });
      targetElement.classList.add('quran-reader__verse--active');
      setupObserver(list);
    });
  }

  function setupObserver(list) {
    if (!('IntersectionObserver' in window) || !appView) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.25) visibleEntries.set(entry.target, entry);
        else visibleEntries.delete(entry.target);
      });
      if (!visibleEntries.size) return;
      var rootTop = appView.getBoundingClientRect().top;
      var nearest = Array.from(visibleEntries.values()).sort(function (a, b) {
        return Math.abs(a.boundingClientRect.top - rootTop) -
          Math.abs(b.boundingClientRect.top - rootTop);
      })[0].target;
      var ayah = Number(nearest.dataset.ayah);
      if (ayah !== currentPosition.ayah) {
        currentPosition = { surah: surah, ayah: ayah, page: null };
        reference.textContent = surah + ':' + ayah;
        list.querySelectorAll('.quran-reader__verse--active').forEach(function (element) {
          element.classList.remove('quran-reader__verse--active');
        });
        nearest.classList.add('quran-reader__verse--active');
        queuePosition(currentPosition);
      }
    }, { root: appView, threshold: [0.25, 0.5, 0.75], rootMargin: '-10% 0px -65% 0px' });
    list.querySelectorAll('.quran-reader__verse').forEach(function (verse) { observer.observe(verse); });
  }

  function renderReaderError(error) {
    content.replaceChildren();
    var box = document.createElement('div');
    box.className = 'quran-reader__error';
    box.setAttribute('role', 'alert');
    box.appendChild(icon('alert-circle', 'icon--2xl'));
    var title = document.createElement('p');
    title.className = 'quran-reader__error-title';
    title.textContent = error && error.code === 'NOT_FOUND'
      ? 'Surja ose ajeti nuk u gjet.'
      : 'Nuk u arrit të ngarkohet surja.';
    var retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'btn btn--primary'; retry.textContent = 'Provo përsëri';
    retry.addEventListener('click', load);
    box.append(title, retry);
    content.appendChild(box);
  }

  function load() {
    content.replaceChildren();
    var loading = document.createElement('div');
    loading.className = 'quran-reader__loading';
    loading.setAttribute('role', 'status');
    loading.textContent = 'Duke ngarkuar suren...';
    content.appendChild(loading);
    getSurah(surah, { signal: controller.signal }).then(function (verses) {
      if (mounted) renderVerses(verses);
    }).catch(function (error) {
      if (!mounted || (error instanceof QuranContentError && error.code === 'ABORTED')) return;
      renderReaderError(error);
    });
  }

  function hiddenHandler() { if (document.hidden) flushPosition(); }
  function pageHideHandler() { flushPosition(); }
  document.addEventListener('visibilitychange', hiddenHandler);
  window.addEventListener('pagehide', pageHideHandler);
  load();

  return function () {
    if (observer) observer.disconnect();
    flushPosition();
    mounted = false;
    controller.abort();
    if (feedbackTimer) clearTimeout(feedbackTimer);
    document.removeEventListener('visibilitychange', hiddenHandler);
    window.removeEventListener('pagehide', pageHideHandler);
  };
}
