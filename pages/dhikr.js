/** Hayat — Mburoja e Muslimanit: Daily Dhikr + Catalog hub. */

import {
  DAILY_DHIKR_CONTENT_VERSION,
  DAILY_DHIKR_ROUTINES,
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
import { getQuranTransliterationSq, getQuranTranslationSq } from '../js/data/quran-transliteration-sq.js';
import {
  MBUROJA_CHAPTERS,
  MBUROJA_CATEGORIES,
  getMburojaChapter,
  searchMburojaChapters
} from '../js/data/mburoja-catalog.js';
import { getMburojaContent } from '../js/data/mburoja-content.js';

var OBLIGATION_NOTE = 'Kjo faqe përmban dhikër dhe dua nga Mburoja e Muslimanit. Ato nuk paraqiten si obligim.';
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
  eyebrow.textContent = 'Mburoja e Muslimanit';
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
  var header = pageHeading('Mburoja', 'Mbrojtja e muslimanit me dhikër dhe dua.');
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

  dashboard.append(storageWarning, cards);
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
    back.textContent = 'Kthehu te Mburoja';
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
    back.setAttribute('aria-label', 'Kthehu te dashboard-i i Mburojës');
  back.appendChild(icon('chevron-left'));
  var titles = document.createElement('div');
  titles.className = 'daily-dhikr-reader__titles';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
    eyebrow.textContent = 'Mburoja e Muslimanit';
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

var MBUROJA_PDF_URL = 'https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.pdf';

function renderHub(page) {
  page.classList.add('daily-dhikr-page');
  var header = pageHeading('Mburoja', 'Mbrojtja e muslimanit me dhikër dhe dua.');
  header.append(
    notice('daily-dhikr-obligation-note', OBLIGATION_NOTE),
    notice('daily-dhikr-review-note', REVIEW_NOTE)
  );

  var hub = document.createElement('div');
  hub.className = 'list-group';
  hub.dataset.mburojaHub = '';

  // Daily Dhikr section
  var dhikrItem = document.createElement('div');
  dhikrItem.className = 'list-group__item';
  var dhikrButton = document.createElement('button');
  dhikrButton.type = 'button';
  dhikrButton.className = 'list-group__button';
  dhikrButton.dataset.mburojaSection = 'dhikr';
  var dhikrIcon = document.createElement('span');
  dhikrIcon.className = 'list-group__icon';
  dhikrIcon.appendChild(icon('sunrise', 'icon--lg'));
  var dhikrText = document.createElement('div');
  dhikrText.className = 'list-group__text';
  var dhikrTitle = document.createElement('span');
  dhikrTitle.className = 'list-group__title';
  dhikrTitle.textContent = 'Dhikri i përditshëm';
  var dhikrSubtitle = document.createElement('span');
  dhikrSubtitle.className = 'list-group__subtitle';
  dhikrSubtitle.textContent = 'Mëngjesi, mbrëmja dhe para gjumit';
  dhikrText.append(dhikrTitle, dhikrSubtitle);
  var dhikrArrow = document.createElement('span');
  dhikrArrow.className = 'list-group__arrow';
  dhikrArrow.appendChild(icon('chevron-right'));
  dhikrButton.append(dhikrIcon, dhikrText, dhikrArrow);
  dhikrItem.appendChild(dhikrButton);

  // Mburoja Catalog section
  var catalogItem = document.createElement('div');
  catalogItem.className = 'list-group__item';
  var catalogButton = document.createElement('button');
  catalogButton.type = 'button';
  catalogButton.className = 'list-group__button';
  catalogButton.dataset.mburojaSection = 'catalog';
  var catalogIcon = document.createElement('span');
  catalogIcon.className = 'list-group__icon';
  catalogIcon.appendChild(icon('shield', 'icon--lg'));
  var catalogText = document.createElement('div');
  catalogText.className = 'list-group__text';
  var catalogTitle = document.createElement('span');
  catalogTitle.className = 'list-group__title';
  catalogTitle.textContent = 'Katalogu i Mburojës';
  var catalogSubtitle = document.createElement('span');
  catalogSubtitle.className = 'list-group__subtitle';
  catalogSubtitle.textContent = 'Dua dhe dhikër sipas situatave';
  catalogText.append(catalogTitle, catalogSubtitle);
  var catalogArrow = document.createElement('span');
  catalogArrow.className = 'list-group__arrow';
  catalogArrow.appendChild(icon('chevron-right'));
  catalogButton.append(catalogIcon, catalogText, catalogArrow);
  catalogItem.appendChild(catalogButton);

  hub.append(dhikrItem, catalogItem);
  page.append(header, hub);
}

function renderCatalog(page) {
  page.classList.add('mburoja-page');
  var top = document.createElement('div');
  top.className = 'mburoja-page__top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackHub = '';
  back.appendChild(icon('chevron-left'));
  top.appendChild(back);

  var noticeBox = document.createElement('div');
  noticeBox.className = 'mburoja-audit-note';
  noticeBox.textContent = 'Përmbajtja është në proces rishikimi të kualifikuar.';

  var search = document.createElement('div');
  search.className = 'mburoja-search';
  var label = document.createElement('label');
  label.htmlFor = 'mburoja-search';
  label.textContent = 'Kërko';
  var searchIcon = document.createElement('span');
  searchIcon.className = 'mburoja-search__icon';
  searchIcon.appendChild(icon('search'));
  var input = document.createElement('input');
  input.type = 'search';
  input.id = 'mburoja-search';
  input.className = 'input mburoja-search__input';
  input.placeholder = 'Kërko në kapituj...';
  input.dataset.mburojaSearch = '';
  search.append(label, searchIcon, input);

  var filters = document.createElement('div');
  filters.className = 'mburoja-filters';
  filters.dataset.mburojaFilters = '';
  var all = document.createElement('button');
  all.type = 'button';
  all.className = 'mburoja-filter mburoja-filter--active';
  all.dataset.mburojaCategory = '';
  all.setAttribute('aria-pressed', 'true');
  all.textContent = 'Të gjitha';
  filters.appendChild(all);
  MBUROJA_CATEGORIES.forEach(function (category) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'mburoja-filter';
    button.dataset.mburojaCategory = category.id;
    button.setAttribute('aria-pressed', 'false');
    button.textContent = category.titleSq;
    filters.appendChild(button);
  });

  var list = document.createElement('ul');
  list.className = 'mburoja-catalog';
  list.dataset.mburojaList = '';

  var status = document.createElement('p');
  status.className = 'mburoja-status';
  status.dataset.mburojaStatus = '';
  status.hidden = true;

  var empty = document.createElement('p');
  empty.className = 'mburoja-empty';
  empty.dataset.mburojaEmpty = '';
  empty.textContent = 'Asnjë rezultat.';
  empty.hidden = true;

  var pdfLink = document.createElement('a');
  pdfLink.className = 'mburoja-pdf-link';
  pdfLink.href = MBUROJA_PDF_URL;
  pdfLink.target = '_blank';
  pdfLink.rel = 'noopener noreferrer';
  pdfLink.textContent = 'Shkarko PDF-në e plotë';

  page.append(top, noticeBox, search, filters, status, list, empty, pdfLink);
}

function chapterRow(chapter) {
  var item = document.createElement('li');
  item.className = 'mburoja-catalog__item';
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'mburoja-chapter-row';
  button.dataset.mburojaChapter = String(chapter.number);
  button.setAttribute('aria-label', 'Hap kapitullin ' + chapter.number);
  var number = document.createElement('span');
  number.className = 'mburoja-chapter-row__number';
  number.textContent = String(chapter.number);
  var text = document.createElement('span');
  text.className = 'mburoja-chapter-row__content';
  var title = document.createElement('span');
  title.className = 'mburoja-chapter-row__title';
  title.textContent = chapter.titleSq;
  var meta = document.createElement('span');
  meta.className = 'mburoja-chapter-row__meta';
  var available = getMburojaContent(chapter.number);
  meta.textContent = available
    ? 'Faqja ' + chapter.page + ' · ' + available.items.length + ' hyrje'
    : 'Faqja ' + chapter.page + ' · Në auditim';
  if (available) button.classList.add('mburoja-chapter-row--available');
  text.append(title, meta);
  var trailing = document.createElement('span');
  trailing.className = 'mburoja-chapter-row__trailing';
  trailing.appendChild(icon('chevron-right', 'icon--sm'));
  button.append(number, text, trailing);
  item.appendChild(button);
  return item;
}

function renderCatalogResults(list, empty, status, chapters) {
  list.replaceChildren();
  chapters.forEach(function (chapter) {
    list.appendChild(chapterRow(chapter));
  });
  empty.hidden = chapters.length > 0;
}

function renderChapter(page, chapter) {
  page.classList.add('mburoja-page');
  var top = document.createElement('div');
  top.className = 'mburoja-page__top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackCatalog = '';
  back.appendChild(icon('chevron-left'));
  top.appendChild(back);

  var heading = document.createElement('h2');
  heading.className = 'mburoja-chapter__title';
  heading.textContent = chapter.titleSq;

  var meta = document.createElement('p');
  meta.className = 'mburoja-chapter__meta';
  meta.textContent = 'Kapitulli ' + chapter.number + ' · Faqja ' + chapter.page;

  var content = document.createElement('div');
  content.className = 'mburoja-chapter__content';

  var available = getMburojaContent(chapter.number);
  if (available) {
    available.items.forEach(function (item) {
      var block = document.createElement('div');
      block.className = 'mburoja-item';
      if (item.titleSq) {
        var title = document.createElement('h3');
        title.className = 'mburoja-item__title';
        title.textContent = item.titleSq;
        block.appendChild(title);
      }
      if (item.arabic) {
        var arabic = document.createElement('p');
        arabic.className = 'mburoja-item__arabic text-quran';
        arabic.lang = 'ar';
        arabic.dir = 'rtl';
        arabic.textContent = item.arabic;
        block.appendChild(arabic);
      }
      if (item.transliterationSq) {
        var translit = document.createElement('p');
        translit.className = 'mburoja-item__transliteration';
        translit.textContent = item.transliterationSq;
        block.appendChild(translit);
      }
      if (item.translationSq) {
        var translation = document.createElement('p');
        translation.className = 'mburoja-item__translation';
        translation.textContent = item.translationSq;
        block.appendChild(translation);
      }
      if (item.noteSq) {
        var note = document.createElement('p');
        note.className = 'mburoja-item__note';
        note.textContent = item.noteSq;
        block.appendChild(note);
      }
      content.appendChild(block);
    });
  } else {
    var pending = document.createElement('p');
    pending.className = 'mburoja-pending';
    pending.textContent = 'Përmbajtja e këtij kapitulli është në proces rishikimi.';
    content.appendChild(pending);
  }

  var pdfLink = document.createElement('a');
  pdfLink.className = 'mburoja-chapter__pdf';
  pdfLink.href = MBUROJA_PDF_URL + '#page=' + chapter.page;
  pdfLink.target = '_blank';
  pdfLink.rel = 'noopener noreferrer';
  pdfLink.textContent = 'Shiko në PDF-në origjinale';

  page.append(top, heading, meta, content, pdfLink);
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page';
  var params = context.params || {};

  if (params.section === 'catalog') {
    if (params.chapter === undefined) renderCatalog(page);
    else {
      var chapter = getMburojaChapter(params.chapter);
      if (chapter) renderChapter(page, chapter);
      else renderInvalid(page, 'Kapitulli nuk u gjet.');
    }
    return page;
  }

  if (params.section === 'dhikr') {
    if (params.routine === undefined) {
      if (params.item !== undefined) renderInvalid(page, 'Mungon rutina për hyrjen e kërkuar.');
      else renderDashboard(page);
    } else {
      var routine = getDailyDhikrRoutine(params.routine);
      if (!routine) {
        renderInvalid(page, 'Rutina e kërkuar nuk ekziston.');
      } else if (params.item !== undefined && !getDailyDhikrItem(routine.id, params.item)) {
        renderInvalid(page, 'Hyrja e kërkuar nuk ekziston në këtë rutinë.');
      } else {
        renderReader(page, routine);
      }
    }
    return page;
  }

  renderHub(page);
  return page;
}

export function mount(page, context, appContext) {
  // Hub navigation
  var hub = page.querySelector('[data-mburoja-hub]');
  if (hub) {
    var hubHandler = function (event) {
      var button = event.target.closest('[data-mburoja-section]');
      if (!button || !hub.contains(button)) return;
      var section = button.dataset.mburojaSection;
      if (section === 'dhikr') appContext.navigate('dhikr', { params: { section: 'dhikr' } });
      else if (section === 'catalog') appContext.navigate('dhikr', { params: { section: 'catalog' } });
    };
    hub.addEventListener('click', hubHandler);
    return function () { hub.removeEventListener('click', hubHandler); };
  }

  // Mburoja catalog
  var catalogList = page.querySelector('[data-mburoja-list]');
  if (catalogList) {
    var cleanups = [];
    function listen(element, event, handler) {
      if (!element) return;
      element.addEventListener(event, handler);
      cleanups.push(function () { element.removeEventListener(event, handler); });
    }

    listen(page.querySelector('[data-mburoja-back-hub]'), 'click', function () {
      appContext.navigate('dhikr');
    });

    var input = page.querySelector('[data-mburoja-search]');
    var filters = page.querySelector('[data-mburoja-filters]');
    var status = page.querySelector('[data-mburoja-status]');
    var empty = page.querySelector('[data-mburoja-empty]');
    var activeCategory = '';

    function updateResults() {
      renderCatalogResults(catalogList, empty, status, searchMburojaChapters(input.value, activeCategory));
    }

    listen(input, 'input', updateResults);
    listen(filters, 'click', function (event) {
      var button = event.target.closest('[data-mburoja-category]');
      if (!button || !filters.contains(button)) return;
      activeCategory = button.dataset.mburojaCategory;
      filters.querySelectorAll('[data-mburoja-category]').forEach(function (choice) {
        var active = choice === button;
        choice.classList.toggle('mburoja-filter--active', active);
        choice.setAttribute('aria-pressed', String(active));
      });
      updateResults();
    });

    listen(catalogList, 'click', function (event) {
      var button = event.target.closest('[data-mburoja-chapter]');
      if (!button || !catalogList.contains(button)) return;
      appContext.navigate('dhikr', {
        params: { section: 'catalog', chapter: Number(button.dataset.mburojaChapter) }
      });
    });

    updateResults();
    return function () { cleanups.forEach(function (fn) { fn(); }); };
  }

  // Mburoja chapter detail
  var chapterBack = page.querySelector('[data-mburoja-back-catalog]');
  if (chapterBack) {
    var chapterHandler = function () {
      appContext.navigate('dhikr', { params: { section: 'catalog' } });
    };
    chapterBack.addEventListener('click', chapterHandler);
    return function () { chapterBack.removeEventListener('click', chapterHandler); };
  }

  // Daily Dhikr dashboard
  if (page.querySelector('[data-daily-dhikr-dashboard]')) {
    return mountDashboard(page, appContext);
  }
  if (page.querySelector('[data-daily-dhikr-reader-content]')) {
    return mountReader(page, context, appContext);
  }
  var invalidBack = page.querySelector('[data-daily-dhikr-invalid-back]');
  if (!invalidBack) return function () {};
  var invalidHandler = function () { appContext.navigate('dhikr', { params: { section: 'dhikr' } }); };
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
    var button = target.closest('[data-open-daily-routine]');
    if (!button || !dashboard.contains(button)) return;
    var routine = getDailyDhikrRoutine(button.dataset.openDailyRoutine);
    if (routine) appContext.navigate('dhikr', { params: { section: 'dhikr', routine: routine.id } });
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
    var groups = [];
    verses.forEach(function (verse) { var group = groups[groups.length - 1]; if (!group || group.surah !== verse.surah) { group = { surah: verse.surah, verses: [] }; groups.push(group); } group.verses.push(verse); });
    groups.forEach(function (group) {
      var surah = document.createElement('section'); surah.className = 'daily-dhikr-quran__surah';
      var heading = document.createElement('h3'); heading.className = 'daily-dhikr-quran__surah-title'; heading.textContent = 'Sureja ' + group.surah;
      var arabicGroup = document.createElement('div'); arabicGroup.className = 'daily-dhikr-quran__group'; var arabicHeading = document.createElement('p'); arabicHeading.className = 'daily-dhikr-quran__group-title'; arabicHeading.textContent = 'Arabisht'; arabicGroup.appendChild(arabicHeading);
      group.verses.forEach(function (verse) { var arabic = document.createElement('p'); arabic.className = 'daily-dhikr-quran__arabic text-quran'; arabic.lang = 'ar'; arabic.dir = 'rtl'; arabic.textContent = verse.arabicText; arabicGroup.appendChild(arabic); });
      var transliterationGroup = document.createElement('div'); transliterationGroup.className = 'daily-dhikr-quran__group'; var transliterationHeading = document.createElement('p'); transliterationHeading.className = 'daily-dhikr-quran__group-title'; transliterationHeading.textContent = 'Transliterim'; transliterationGroup.appendChild(transliterationHeading);
      group.verses.forEach(function (verse) { var transliteration = document.createElement('p'); transliteration.className = 'daily-dhikr-quran__transliteration'; var entry = getQuranTransliterationSq(verse.verseKey); var value = entry && entry.transliterationSq; transliteration.textContent = value || 'Transliterimi nuk është i disponueshëm në këtë hyrje.'; if (!value) transliteration.classList.add('daily-dhikr-quran__transliteration--missing'); transliterationGroup.appendChild(transliteration); });
      var translationGroup = document.createElement('div'); translationGroup.className = 'daily-dhikr-quran__group'; var translationHeading = document.createElement('p'); translationHeading.className = 'daily-dhikr-quran__group-title'; translationHeading.textContent = 'Përkthimi shqip'; translationGroup.appendChild(translationHeading);
      group.verses.forEach(function (verse) { var block = document.createElement('section'); block.className = 'daily-dhikr-quran__verse'; var translation = document.createElement('p'); translation.className = 'daily-dhikr-quran__translation'; var hardcodedTranslation = getQuranTranslationSq(verse.verseKey); translation.textContent = hardcodedTranslation || verse.translationSq; var reference = document.createElement('p'); reference.className = 'daily-dhikr-quran__reference'; reference.textContent = verse.verseKey; block.append(translation, reference); if (!hardcodedTranslation && verse.footnotesSq) { var details = document.createElement('details'); details.className = 'daily-dhikr-quran__footnotes'; var summary = document.createElement('summary'); summary.textContent = 'Shënime të përkthimit'; var footnotes = document.createElement('p'); footnotes.textContent = verse.footnotesSq; details.append(summary, footnotes); block.appendChild(details); } translationGroup.appendChild(block); });
      surah.append(heading, arabicGroup, transliterationGroup, translationGroup); list.appendChild(surah);
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
    if (index === routine.items.length - 1) {
      var finish = document.createElement('button'); finish.type = 'button'; finish.className = 'btn btn--primary'; finish.textContent = 'Mbarova';
      finish.addEventListener('click', function () { var current = session.itemProgress[item.id]; if (!current.completed) { showFeedback('Përfundo numërimin e hyrjes së fundit para se ta mbyllësh rutinën.'); return; } session = updateDailyDhikrItemProgress(session, item.id, current.count); markDirty(); persistNow(); updateProgress(); renderCompletion(); if (session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED) showFeedback('Rutina u përfundua.'); });
      navigationHost.appendChild(finish);
    }
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
    appContext.navigate('dhikr', { params: { section: 'dhikr' } });
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
