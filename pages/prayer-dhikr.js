/**
 * Hayat — Resumable post-prayer dhikr route.
 */

import { PRAYER_LABELS_SQ, isPrayerKey } from '../js/config.js';
import {
  POST_PRAYER_DHIKR_VARIANT,
  POST_PRAYER_DHIKR_REVIEW_STATUS,
  getPostPrayerDhikrSequence
} from '../js/data/post-prayer-dhikr.js';
import {
  startOrResumePostPrayerDhikr,
  savePostPrayerDhikrProgress,
  completePostPrayerDhikr,
  markPostPrayerDhikrCompletedExternally,
  resetPostPrayerDhikrSession,
  DHIKR_SESSION_STATUSES
} from '../js/storage/post-prayer-dhikr-progress.js';
import {
  createInitialDhikrProgress,
  normalizeDhikrProgress,
  incrementDhikrCount,
  goToPreviousDhikrItem,
  goToNextDhikrItem,
  getDhikrProgressSummary
} from '../js/utils/post-prayer-dhikr.js';
import { compareDateKeys } from '../js/utils/date-time.js';
import {
  getAyah,
  getAyahRange,
  QuranContentError
} from '../js/services/quran-content.js';

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function todayKey() {
  var now = new Date();
  return String(now.getFullYear()).padStart(4, '0') + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
}

function validRoute(prayerKey, dateKey) {
  return isPrayerKey(prayerKey) && compareDateKeys(dateKey, dateKey) === 0 &&
    compareDateKeys(dateKey, todayKey()) <= 0;
}

function errorPage(message, appContext) {
  var page = document.createElement('div');
  page.className = 'route-page post-dhikr-page';
  var box = document.createElement('div');
  box.className = 'post-dhikr-error';
  box.setAttribute('role', 'alert');
  box.appendChild(icon('alert-circle', 'icon--2xl'));
  var title = document.createElement('h1');
  title.className = 'post-dhikr-error__title';
  title.dataset.routeHeading = '';
  title.textContent = message;
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--primary';
  button.textContent = 'Kthehu te Namazi';
  button.addEventListener('click', function () { appContext.navigate('prayer'); });
  box.append(title, button);
  page.appendChild(box);
  return page;
}

export function render(context, appContext) {
  var params = context.params || {};
  if (!validRoute(params.prayer, params.date)) {
    return errorPage('Parametrat e dhikrit janë të pavlefshëm.', appContext);
  }

  var page = document.createElement('div');
  page.className = 'route-page post-dhikr-page';
  var header = document.createElement('header');
  header.className = 'post-dhikr-header';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Dhikri pas namazit';
  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.dataset.routeHeading = '';
  h1.textContent = PRAYER_LABELS_SQ[params.prayer];
  var date = document.createElement('p');
  date.className = 'route-page__subtitle';
  date.textContent = params.date;
  var note = document.createElement('p');
  note.className = 'post-dhikr-obligation-note';
  note.textContent = POST_PRAYER_DHIKR_VARIANT.obligationSq;
  header.append(eyebrow, h1, date, note);

  if (POST_PRAYER_DHIKR_REVIEW_STATUS !== 'approved') {
    var review = document.createElement('div');
    review.className = 'post-dhikr-review-warning alert alert--warning';
    review.setAttribute('role', 'status');
    review.appendChild(icon('alert-circle', 'alert__icon'));
    var reviewText = document.createElement('p');
    reviewText.className = 'alert__message';
    reviewText.textContent = 'Përmbajtja është në proces rishikimi të kualifikuar.';
    review.appendChild(reviewText);
    header.appendChild(review);
  }

  var content = document.createElement('div');
  content.className = 'post-dhikr-content';
  page.append(header, content);
  return page;
}

export function mount(page, context, appContext) {
  var content = page.querySelector('.post-dhikr-content');
  if (!content) return function () {};

  var prayerKey = context.params.prayer;
  var dateKey = context.params.date;
  var sequence = getPostPrayerDhikrSequence(prayerKey);
  var progress = createInitialDhikrProgress(sequence);
  var session = null;
  var mounted = true;
  var storageAvailable = true;
  var saveTimer = null;
  var saveQueue = Promise.resolve();
  var confirmation = null;
  var quranContent = new Map();
  var quranController = null;
  var activeQuranItemId = null;

  function loading() {
    content.replaceChildren();
    var status = document.createElement('div');
    status.className = 'app__loading';
    status.setAttribute('role', 'status');
    var spinner = document.createElement('div');
    spinner.className = 'app__loading-spinner';
    var text = document.createElement('p');
    text.className = 'app__loading-text';
    text.textContent = 'Duke ngarkuar...';
    status.append(spinner, text);
    content.appendChild(status);
  }

  function storageWarning() {
    var warning = document.createElement('div');
    warning.className = 'post-dhikr-warning alert alert--warning';
    warning.setAttribute('role', 'status');
    warning.textContent = 'Ruajtja lokale nuk është e disponueshme. Progresi mbahet vetëm në këtë sesion.';
    return warning;
  }

  function snapshot() {
    return {
      dateKey: dateKey,
      prayerKey: prayerKey,
      currentItemId: progress.currentItemId,
      currentCount: progress.currentCount,
      completedItemIds: progress.completedItemIds.slice()
    };
  }

  function persist(snapshotValue) {
    if (!storageAvailable ||
        (session && session.status !== DHIKR_SESSION_STATUSES.IN_PROGRESS)) {
      return Promise.resolve(null);
    }
    saveQueue = saveQueue.catch(function () {}).then(function () {
      return savePostPrayerDhikrProgress(snapshotValue);
    }).then(function (saved) {
      if (mounted) session = saved;
      return saved;
    }).catch(function (error) {
      storageAvailable = false;
      console.warn('[Hayat Dhikr] Progress could not be saved:', error);
      if (mounted) showProgress();
      return null;
    });
    return saveQueue;
  }

  function scheduleSave() {
    if (!storageAvailable) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      persist(snapshot());
    }, 400);
  }

  function flushSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    return persist(snapshot());
  }

  function sourceText(item) {
    return item.source.collections.map(function (source) {
      return source.name + ' ' + source.number;
    }).join(', ');
  }

  function counter(item) {
    var wrapper = document.createElement('div');
    wrapper.className = 'post-dhikr-counter';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'post-dhikr-counter__button btn btn--primary btn--lg';
    button.setAttribute(
      'aria-label',
      item.targetRepetitions === 1
        ? (progress.currentCount ? 'E përfunduar' : 'Shënoje si të thënë')
        : progress.currentCount + ' nga ' + item.targetRepetitions
    );
    var value = document.createElement('span');
    value.className = 'post-dhikr-counter__value';
    value.textContent = item.targetRepetitions === 1
      ? (progress.currentCount ? 'E thashë' : 'E thashë')
      : progress.currentCount + ' / ' + item.targetRepetitions;
    button.appendChild(value);
    button.disabled = progress.currentCount >= item.targetRepetitions;
    button.addEventListener('click', function () {
      progress = incrementDhikrCount(sequence, progress);
      if (typeof navigator !== 'undefined' && navigator.vibrate &&
          !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
        navigator.vibrate(20);
      }
      if (progress.currentCount >= item.targetRepetitions) persist(snapshot());
      else scheduleSave();
      showProgress();
    });
    wrapper.appendChild(button);
    return wrapper;
  }

  function quranReferenceText(item) {
    var q = item.quranReference;
    return q.ayahStart === q.ayahEnd
      ? 'Sureja ' + q.surah + ', ajeti ' + q.ayahStart
      : 'Sureja ' + q.surah + ', ajetet ' + q.ayahStart + '–' + q.ayahEnd;
  }

  function quranLoading(container, item) {
    container.replaceChildren();
    var box = document.createElement('div');
    box.className = 'post-dhikr-quran__loading';
    box.setAttribute('role', 'status');
    var text = document.createElement('p');
    text.textContent = 'Duke ngarkuar tekstin e Kur\'anit...';
    var reference = document.createElement('p');
    reference.className = 'post-dhikr-quran__reference';
    reference.textContent = quranReferenceText(item);
    box.append(text, reference);
    container.appendChild(box);
  }

  function quranActions(container, item, loaded) {
    var actions = document.createElement('div');
    actions.className = 'post-dhikr-actions';
    var open = document.createElement('button');
    open.type = 'button';
    open.className = 'btn btn--outline';
    open.append(icon('external-link', 'icon--sm'), document.createTextNode(' Hape në Kur\'an'));
    open.addEventListener('click', function () {
      flushSave();
      appContext.navigate('quran', {
        params: { surah: item.quranReference.surah, ayah: item.quranReference.ayahStart }
      });
    });
    var mark = document.createElement('button');
    mark.type = 'button';
    mark.className = 'btn btn--primary';
    var prefix = loaded ? 'E lexova' : 'E lexova jashtë aplikacionit';
    mark.textContent = item.targetRepetitions > 1
      ? prefix + ' (' + progress.currentCount + '/' + item.targetRepetitions + ')'
      : prefix;
    mark.disabled = progress.currentCount >= item.targetRepetitions;
    mark.addEventListener('click', function () {
      progress = incrementDhikrCount(sequence, progress);
      if (progress.currentCount >= item.targetRepetitions) persist(snapshot());
      else scheduleSave();
      showProgress();
    });
    actions.append(open, mark);
    container.appendChild(actions);
  }

  function quranSuccess(container, item, verses) {
    container.replaceChildren();
    var list = document.createElement('div');
    list.className = 'post-dhikr-quran__verses';
    verses.forEach(function (verse) {
      var block = document.createElement('section');
      block.className = 'post-dhikr-quran__verse';
      var arabic = document.createElement('p');
      arabic.className = 'post-dhikr-quran__arabic text-quran';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = verse.arabicText;
      var translation = document.createElement('p');
      translation.className = 'post-dhikr-quran__translation';
      translation.textContent = verse.translationSq;
      var reference = document.createElement('p');
      reference.className = 'post-dhikr-quran__reference';
      reference.textContent = verse.verseKey;
      block.append(arabic, translation, reference);
      if (verse.footnotesSq) {
        var details = document.createElement('details');
        details.className = 'post-dhikr-quran__footnotes';
        var summary = document.createElement('summary');
        summary.className = 'post-dhikr-quran__footnotes-summary';
        summary.textContent = 'Shënime të përkthimit';
        var footnotes = document.createElement('p');
        footnotes.textContent = verse.footnotesSq;
        details.append(summary, footnotes);
        block.appendChild(details);
      }
      list.appendChild(block);
    });
    container.appendChild(list);
    var attribution = document.createElement('p');
    attribution.className = 'post-dhikr-quran__attribution';
    var link = document.createElement('a');
    link.href = verses[0].providerUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = verses[0].provider;
    attribution.append(link, document.createTextNode(' · ' + verses[0].translationNameSq));
    container.appendChild(attribution);
    quranActions(container, item, true);
  }

  function quranError(container, item) {
    container.replaceChildren();
    var box = document.createElement('div');
    box.className = 'post-dhikr-quran__error';
    box.setAttribute('role', 'status');
    var reference = document.createElement('p');
    reference.className = 'post-dhikr-quran__reference';
    reference.textContent = quranReferenceText(item);
    var message = document.createElement('p');
    message.textContent = 'Teksti nuk u ngarkua. Mund ta hapësh në modulin e Kur\'anit ose të provosh përsëri.';
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn--outline btn--sm';
    retry.append(icon('refresh', 'icon--sm'), document.createTextNode(' Provo përsëri'));
    retry.addEventListener('click', function () {
      quranContent.delete(item.id);
      loadCurrentQuranItem(item, container);
    });
    box.append(reference, message, retry);
    container.appendChild(box);
    quranActions(container, item, false);
  }

  function loadCurrentQuranItem(item, container) {
    var cached = quranContent.get(item.id);
    if (cached && cached.status === 'success') {
      quranSuccess(container, item, cached.verses);
      return;
    }
    if (cached && cached.status === 'error') {
      quranError(container, item);
      return;
    }
    if (cached && cached.status === 'loading') {
      quranLoading(container, item);
      return;
    }

    if (quranController) quranController.abort();
    quranController = new AbortController();
    var controller = quranController;
    var itemId = item.id;
    quranContent.set(itemId, { status: 'loading', verses: null });
    quranLoading(container, item);
    var q = item.quranReference;
    var request = q.ayahStart === q.ayahEnd
      ? getAyah(q.surah, q.ayahStart, { signal: controller.signal }).then(function (verse) { return [verse]; })
      : getAyahRange(q.surah, q.ayahStart, q.ayahEnd, { signal: controller.signal });

    request.then(function (verses) {
      quranContent.set(itemId, { status: 'success', verses: verses.slice() });
      if (!mounted || activeQuranItemId !== itemId) return;
      var currentContainer = content.querySelector('.post-dhikr-quran');
      if (currentContainer) quranSuccess(currentContainer, item, verses);
    }).catch(function (error) {
      if (error instanceof QuranContentError && error.code === 'ABORTED') {
        quranContent.delete(itemId);
        return;
      }
      quranContent.set(itemId, { status: 'error', error: error });
      if (!mounted || activeQuranItemId !== itemId) return;
      var currentContainer = content.querySelector('.post-dhikr-quran');
      if (currentContainer) quranError(currentContainer, item);
    }).finally(function () {
      if (quranController === controller) quranController = null;
    });
  }

  function currentCard(item) {
    var card = document.createElement('article');
    card.className = 'post-dhikr-card card';
    var body = document.createElement('div');
    body.className = 'card__body';
    var title = document.createElement('h2');
    title.className = 'post-dhikr-card__title';
    title.tabIndex = -1;
    title.textContent = item.titleSq;
    body.appendChild(title);

    if (item.type === 'text') {
      var arabic = document.createElement('p');
      arabic.className = 'post-dhikr-card__arabic text-arabic';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = item.arabic;
      var transliteration = document.createElement('p');
      transliteration.className = 'post-dhikr-card__transliteration';
      transliteration.textContent = item.transliterationSq;
      var translation = document.createElement('p');
      translation.className = 'post-dhikr-card__translation';
      translation.textContent = item.translationSq;
      body.append(arabic, transliteration, translation, counter(item));
    } else {
      var quranContainer = document.createElement('div');
      quranContainer.className = 'post-dhikr-quran';
      body.appendChild(quranContainer);
      loadCurrentQuranItem(item, quranContainer);
    }
    var source = document.createElement('p');
    source.className = 'post-dhikr-card__source';
    source.textContent = sourceText(item);
    body.appendChild(source);
    card.appendChild(body);
    return { card: card, heading: title };
  }

  function confirmPanel(message, onConfirm) {
    var panel = document.createElement('div');
    panel.className = 'post-dhikr-confirm';
    var text = document.createElement('p');
    text.textContent = message;
    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'btn btn--danger btn--sm';
    yes.textContent = 'Po, vazhdo';
    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'btn btn--ghost btn--sm';
    no.textContent = 'Anulo';
    yes.addEventListener('click', function () { confirmation = null; onConfirm(); });
    no.addEventListener('click', function () { confirmation = null; showProgress(); });
    panel.append(text, yes, no);
    setTimeout(function () { if (mounted) yes.focus(); }, 0);
    return panel;
  }

  function showProgress() {
    if (!mounted) return;
    content.replaceChildren();
    if (!storageAvailable) content.appendChild(storageWarning());
    var summary = getDhikrProgressSummary(sequence, progress);
    var progressBox = document.createElement('div');
    progressBox.className = 'post-dhikr-progress';
    var progressText = document.createElement('p');
    progressText.className = 'post-dhikr-progress__text';
    progressText.textContent = 'Hapi ' + (progress.currentIndex + 1) + ' nga ' + sequence.length;
    var progressBar = document.createElement('progress');
    progressBar.className = 'post-dhikr-progress__bar';
    progressBar.max = 100;
    progressBar.value = summary.percentage;
    progressBar.setAttribute('aria-label', summary.percentage + '% e hapave të përfunduar');
    progressBox.append(progressText, progressBar);
    content.appendChild(progressBox);

    var item = sequence[progress.currentIndex];
    if (activeQuranItemId && activeQuranItemId !== item.id && quranController) {
      quranController.abort();
      quranController = null;
    }
    activeQuranItemId = item.type === 'quran-reference' ? item.id : null;
    var built = currentCard(item);
    content.appendChild(built.card);

    var nav = document.createElement('div');
    nav.className = 'post-dhikr-navigation';
    var previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'btn btn--outline';
    previous.append(icon('chevron-left', 'icon--sm'), document.createTextNode(' Mbrapa'));
    previous.disabled = progress.currentIndex === 0;
    previous.addEventListener('click', function () {
      progress = goToPreviousDhikrItem(sequence, progress);
      persist(snapshot());
      showProgress();
    });
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn btn--primary';
    next.append(document.createTextNode('Vazhdo '), icon('chevron-right', 'icon--sm'));
    var reached = progress.currentCount >= item.targetRepetitions;
    next.disabled = !reached;
    next.addEventListener('click', function () {
      progress = goToNextDhikrItem(sequence, progress);
      if (progress.complete) finishNormally();
      else { persist(snapshot()); showProgress(); }
    });
    nav.append(previous, next);
    if (!reached && progress.currentIndex < sequence.length - 1) {
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'btn btn--ghost btn--sm';
      skip.textContent = 'Kalo për tani';
      skip.addEventListener('click', function () {
        confirmation = 'skip'; showProgress();
      });
      nav.appendChild(skip);
    }
    content.appendChild(nav);

    var utility = document.createElement('div');
    utility.className = 'post-dhikr-utility';
    var external = document.createElement('button');
    external.type = 'button';
    external.className = 'btn btn--ghost btn--sm';
    external.textContent = 'E përfundova jashtë aplikacionit';
    external.addEventListener('click', function () { confirmation = 'external'; showProgress(); });
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn--ghost btn--sm';
    reset.append(icon('rotate-ccw', 'icon--sm'), document.createTextNode(' Rifillo nga e para'));
    reset.addEventListener('click', function () { confirmation = 'reset'; showProgress(); });
    utility.append(external, reset);
    content.appendChild(utility);

    if (confirmation === 'skip') {
      content.appendChild(confirmPanel('Ta kalosh këtë hap pa e shënuar të përfunduar?', function () {
        progress = goToNextDhikrItem(sequence, progress, { allowSkip: true });
        persist(snapshot()); showProgress();
      }));
    } else if (confirmation === 'external') {
      content.appendChild(confirmPanel('Ta shënosh gjithë dhikrin si të kryer jashtë Hayat?', markExternal));
    } else if (confirmation === 'reset') {
      content.appendChild(confirmPanel('Ta rifillosh këtë sesion nga e para?', resetSession));
    }

    setTimeout(function () { if (mounted) built.heading.focus({ preventScroll: true }); }, 0);
  }

  function finishNormally() {
    flushSave().then(function () {
      if (!storageAvailable) {
        showCompletion('Dhikri u përfundua', false);
        return;
      }
      return completePostPrayerDhikr(dateKey, prayerKey).then(function (saved) {
        session = saved; showCompletion('Dhikri u përfundua', true);
      });
    }).catch(function (error) {
      storageAvailable = false;
      showCompletion('Dhikri u përfundua në këtë sesion, por nuk u ruajt.', false);
    });
  }

  function markExternal() {
    if (!storageAvailable) {
      showCompletion('E shënuar si e kryer vetëm në këtë sesion.', false);
      return;
    }
    markPostPrayerDhikrCompletedExternally(dateKey, prayerKey).then(function (saved) {
      session = saved; showCompletion('E shënuar si e kryer jashtë Hayat', true);
    }).catch(function () {
      storageAvailable = false;
      showCompletion('E shënuar si e kryer vetëm në këtë sesion.', false);
    });
  }

  function resetSession() {
    confirmation = null;
    if (!storageAvailable) {
      progress = createInitialDhikrProgress(sequence); showProgress(); return;
    }
    resetPostPrayerDhikrSession(dateKey, prayerKey).then(function () {
      return startOrResumePostPrayerDhikr(dateKey, prayerKey);
    }).then(function (saved) {
      session = saved;
      progress = normalizeDhikrProgress(sequence, session);
      showProgress();
    }).catch(function () {
      storageAvailable = false;
      progress = createInitialDhikrProgress(sequence);
      showProgress();
    });
  }

  function showCompletion(message, persisted) {
    if (!mounted) return;
    content.replaceChildren();
    var box = document.createElement('div');
    box.className = 'post-dhikr-completion';
    box.setAttribute('role', 'status');
    box.appendChild(icon('check-circle', 'icon--2xl'));
    var title = document.createElement('h2');
    title.className = 'post-dhikr-completion__title';
    title.textContent = message;
    box.appendChild(title);
    if (!persisted) box.appendChild(storageWarning());
    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--primary';
    back.textContent = 'Kthehu te Namazi';
    back.addEventListener('click', function () { appContext.navigate('prayer'); });
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'btn btn--ghost';
    reset.textContent = 'Rifillo nga e para';
    reset.addEventListener('click', function () { resetSession(); });
    box.append(back, reset);
    content.appendChild(box);
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }

  function initialize() {
    loading();
    if (!sequence || !sequence.length) {
      content.replaceChildren(errorPage('Përmbajtja e dhikrit nuk është e vlefshme.', appContext));
      return;
    }
    startOrResumePostPrayerDhikr(dateKey, prayerKey).then(function (saved) {
      if (!mounted) return;
      session = saved;
      progress = normalizeDhikrProgress(sequence, session);
      if (session.status === DHIKR_SESSION_STATUSES.COMPLETED) {
        showCompletion('Dhikri u përfundua', true);
      } else if (session.status === DHIKR_SESSION_STATUSES.COMPLETED_EXTERNAL) {
        showCompletion('E shënuar si e kryer jashtë Hayat', true);
      } else showProgress();
    }).catch(function (error) {
      if (!mounted) return;
      console.warn('[Hayat Dhikr] Session storage unavailable:', error);
      storageAvailable = false;
      progress = createInitialDhikrProgress(sequence);
      showProgress();
    });
  }

  function visibilityHandler() {
    if (document.hidden) flushSave();
  }
  function pageHideHandler() { flushSave(); }
  document.addEventListener('visibilitychange', visibilityHandler);
  window.addEventListener('pagehide', pageHideHandler);
  initialize();

  return function () {
    mounted = false;
    if (quranController) quranController.abort();
    quranController = null;
    if (saveTimer) clearTimeout(saveTimer);
    flushSave();
    document.removeEventListener('visibilitychange', visibilityHandler);
    window.removeEventListener('pagehide', pageHideHandler);
  };
}
