/**
 * Hayat — More hub and Mburoja catalog UI v1.
 */

import {
  MBUROJA_CATEGORIES,
  MBUROJA_CHAPTERS,
  getMburojaChapter,
  searchMburojaChapters
} from '../js/data/mburoja-catalog.js';

var MBUROJA_PDF_URL = 'https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.pdf';

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function displayTitle(value) {
  if (typeof value !== 'string' || !value) return '';
  var lower = value.toLocaleLowerCase('sq');
  return lower.charAt(0).toLocaleUpperCase('sq') + lower.slice(1);
}

function pageHeader(title, eyebrow, subtitle) {
  var header = document.createElement('header');
  header.className = 'route-page__header';
  if (eyebrow) {
    var overline = document.createElement('span');
    overline.className = 'route-page__eyebrow';
    overline.textContent = eyebrow;
    header.appendChild(overline);
  }
  var heading = document.createElement('h1');
  heading.className = 'route-page__title';
  heading.dataset.routeHeading = '';
  heading.textContent = title;
  header.appendChild(heading);
  if (subtitle) {
    var description = document.createElement('p');
    description.className = 'route-page__subtitle';
    description.textContent = subtitle;
    header.appendChild(description);
  }
  return header;
}

function hubItem(options) {
  var element = document.createElement(options.disabled ? 'div' : 'button');
  if (!options.disabled) element.type = 'button';
  element.className = 'list-item' + (options.disabled ? '' : ' list-item--interactive');
  if (options.disabled) element.setAttribute('aria-disabled', 'true');
  if (options.action) element.dataset.moreAction = options.action;

  var leading = document.createElement('span');
  leading.className = 'list-item__leading';
  leading.appendChild(icon(options.icon));
  var content = document.createElement('span');
  content.className = 'list-item__content';
  var title = document.createElement('span');
  title.className = 'list-item__title';
  title.textContent = options.title;
  content.appendChild(title);
  if (options.subtitle) {
    var subtitle = document.createElement('span');
    subtitle.className = 'list-item__subtitle';
    subtitle.textContent = options.subtitle;
    content.appendChild(subtitle);
  }
  element.append(leading, content);
  if (!options.disabled) {
    var trailing = document.createElement('span');
    trailing.className = 'list-item__trailing';
    trailing.appendChild(icon('chevron-right', 'icon--sm'));
    element.appendChild(trailing);
  }
  return element;
}

function renderHub(page) {
  page.appendChild(pageHeader('Më shumë'));
  var content = document.createElement('div');
  content.className = 'route-page__content';
  var list = document.createElement('div');
  list.className = 'list-group';
  list.dataset.moreHub = '';
  list.append(
    hubItem({ title: 'Dita ime', subtitle: 'Së shpejti', icon: 'calendar', disabled: true }),
    hubItem({
      title: 'Mburoja',
      subtitle: 'Dua dhe dhikër sipas situatave',
      icon: 'shield',
      action: 'mburoja'
    }),
    hubItem({ title: 'Cilësimet', icon: 'settings', action: 'settings' })
  );
  content.appendChild(list);
  page.appendChild(content);
}

function chapterRow(chapter) {
  var item = document.createElement('li');
  item.className = 'mburoja-catalog__item';
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'mburoja-chapter-row';
  button.dataset.mburojaChapter = String(chapter.number);
  button.setAttribute('aria-label', 'Hap kapitullin ' + chapter.number + ': ' + displayTitle(chapter.titleSq));
  var number = document.createElement('span');
  number.className = 'mburoja-chapter-row__number';
  number.textContent = String(chapter.number);
  var text = document.createElement('span');
  text.className = 'mburoja-chapter-row__content';
  var title = document.createElement('span');
  title.className = 'mburoja-chapter-row__title';
  title.textContent = displayTitle(chapter.titleSq);
  var meta = document.createElement('span');
  meta.className = 'mburoja-chapter-row__meta';
  meta.textContent = 'Faqja ' + chapter.page + ' · Përmbajtja në auditim';
  text.append(title, meta);
  var trailing = document.createElement('span');
  trailing.className = 'mburoja-chapter-row__trailing';
  trailing.appendChild(icon('chevron-right', 'icon--sm'));
  button.append(number, text, trailing);
  item.appendChild(button);
  return item;
}

function renderCatalogResults(list, empty, status, chapters) {
  var fragment = document.createDocumentFragment();
  chapters.forEach(function (chapter) { fragment.appendChild(chapterRow(chapter)); });
  list.replaceChildren(fragment);
  empty.hidden = chapters.length !== 0;
  status.textContent = chapters.length === 1 ? '1 kapitull' : chapters.length + ' kapituj';
}

function renderCatalog(page) {
  page.classList.add('mburoja-page');
  var top = document.createElement('div');
  top.className = 'mburoja-page__top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackHub = '';
  back.setAttribute('aria-label', 'Kthehu te Më shumë');
  back.appendChild(icon('chevron-left'));
  top.append(back, pageHeader('Mburoja', 'Dua sipas situatave', 'Katalogu i 132 kapitujve nga “Mburoja e Muslimanit”.'));

  var notice = document.createElement('p');
  notice.className = 'mburoja-audit-note';
  notice.textContent = 'Katalogu është i disponueshëm. Tekstet e duave do të hapen vetëm pasi të jenë kontrolluar ndaj botimit burimor.';

  var search = document.createElement('div');
  search.className = 'mburoja-search';
  var label = document.createElement('label');
  label.className = 'sr-only';
  label.htmlFor = 'mburoja-search';
  label.textContent = 'Kërko në katalogun e Mburojës';
  var searchIcon = document.createElement('span');
  searchIcon.className = 'mburoja-search__icon';
  searchIcon.appendChild(icon('search', 'icon--sm'));
  var input = document.createElement('input');
  input.id = 'mburoja-search';
  input.type = 'search';
  input.className = 'input mburoja-search__input';
  input.placeholder = 'Kërko sipas situatës';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.dataset.mburojaSearch = '';
  search.append(label, searchIcon, input);

  var filters = document.createElement('div');
  filters.className = 'mburoja-filters';
  filters.dataset.mburojaFilters = '';
  filters.setAttribute('aria-label', 'Filtro sipas kategorisë');
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

  var status = document.createElement('p');
  status.className = 'mburoja-results-status';
  status.dataset.mburojaStatus = '';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  var list = document.createElement('ul');
  list.className = 'mburoja-catalog';
  list.dataset.mburojaList = '';
  var empty = document.createElement('p');
  empty.className = 'mburoja-empty';
  empty.dataset.mburojaEmpty = '';
  empty.textContent = 'Nuk u gjet asnjë kapitull për këtë kërkim.';
  empty.hidden = true;
  renderCatalogResults(list, empty, status, MBUROJA_CHAPTERS);

  page.append(top, notice, search, filters, status, list, empty);
}

function renderChapter(page, chapter) {
  page.classList.add('mburoja-page');
  var top = document.createElement('div');
  top.className = 'mburoja-page__top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackCatalog = '';
  back.setAttribute('aria-label', 'Kthehu te katalogu i Mburojës');
  back.appendChild(icon('chevron-left'));
  top.append(back, pageHeader(displayTitle(chapter.titleSq), 'Kapitulli ' + chapter.number, 'Faqja ' + chapter.page + ' në botimin burimor.'));

  var card = document.createElement('section');
  card.className = 'mburoja-pending card';
  var body = document.createElement('div');
  body.className = 'card__body';
  body.appendChild(icon('shield', 'icon--2xl'));
  var title = document.createElement('h2');
  title.className = 'mburoja-pending__title';
  title.textContent = 'Përmbajtja po auditohet';
  var text = document.createElement('p');
  text.className = 'mburoja-pending__text';
  text.textContent = 'Teksti arab, transliterimi dhe përkthimi nuk publikohen nga OCR-ja. Ky kapitull do të aktivizohet pas kontrollit ndaj PDF-së.';
  var link = document.createElement('a');
  link.className = 'btn btn--outline';
  link.href = MBUROJA_PDF_URL + '#page=' + chapter.page;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.append(document.createTextNode('Shiko faqen burimore '), icon('external-link', 'icon--sm'));
  body.append(title, text, link);
  card.appendChild(body);
  page.append(top, card);
}

function renderInvalidChapter(page) {
  page.classList.add('mburoja-page');
  page.appendChild(pageHeader('Kapitulli nuk u gjet', 'Mburoja'));
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--primary';
  back.dataset.mburojaBackCatalog = '';
  back.textContent = 'Kthehu te katalogu';
  page.appendChild(back);
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page more-page';
  var params = context.params || {};
  if (params.section !== 'mburoja') renderHub(page);
  else if (params.chapter === undefined) renderCatalog(page);
  else {
    var chapter = getMburojaChapter(params.chapter);
    if (chapter) renderChapter(page, chapter);
    else renderInvalidChapter(page);
  }
  return page;
}

export function mount(page, context, appContext) {
  var cleanups = [];
  function listen(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    cleanups.push(function () { element.removeEventListener(event, handler); });
  }

  var hub = page.querySelector('[data-more-hub]');
  listen(hub, 'click', function (event) {
    var button = event.target.closest('[data-more-action]');
    if (!button || !hub.contains(button)) return;
    if (button.dataset.moreAction === 'settings') appContext.navigate('settings');
    else if (button.dataset.moreAction === 'mburoja') {
      appContext.navigate('more', { params: { section: 'mburoja' } });
    }
  });

  listen(page.querySelector('[data-mburoja-back-hub]'), 'click', function () {
    appContext.navigate('more');
  });
  listen(page.querySelector('[data-mburoja-back-catalog]'), 'click', function () {
    appContext.navigate('more', { params: { section: 'mburoja' } });
  });

  var input = page.querySelector('[data-mburoja-search]');
  var filters = page.querySelector('[data-mburoja-filters]');
  var list = page.querySelector('[data-mburoja-list]');
  var status = page.querySelector('[data-mburoja-status]');
  var empty = page.querySelector('[data-mburoja-empty]');
  var activeCategory = '';
  function updateResults() {
    renderCatalogResults(list, empty, status, searchMburojaChapters(input.value, activeCategory));
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
  listen(list, 'click', function (event) {
    var button = event.target.closest('[data-mburoja-chapter]');
    if (!button || !list.contains(button)) return;
    appContext.navigate('more', {
      params: { section: 'mburoja', chapter: Number(button.dataset.mburojaChapter) }
    });
  });

  return function () { cleanups.forEach(function (cleanup) { cleanup(); }); };
}
