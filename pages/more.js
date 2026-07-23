/**
 * 
 * Hayat — More hub and Mburoja catalog UI v1.
 */

import {
  MBUROJA_CATEGORIES,
  MBUROJA_CHAPTERS,
  getMburojaChapter,
  searchMburojaChapters
} from '../js/data/mburoja-catalog.js';
import { getMburojaContent } from '../js/data/mburoja-content.js';
import { listDayItems, createDayItem, updateDayItem, toggleDayItem, removeDayItem } from '../js/storage/day-planner.js';
import { getPrayerTimes } from '../js/services/prayer-times.js';

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
    hubItem({ title: 'Dita ime', subtitle: 'Detyra, takime dhe kujtesa', icon: 'calendar', action: 'day' }),
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
  var available = getMburojaContent(chapter.number);
  meta.textContent = available
    ? 'Faqja ' + chapter.page + ' · ' + available.items.length +
      (available.items.length === 1 ? ' hyrje' : ' hyrje')
    : 'Faqja ' + chapter.page + ' · Përmbajtja në auditim';
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

function mburojaSourceDetails(item) {
  var details = document.createElement('details');
  details.className = 'mburoja-entry__source';
  var summary = document.createElement('summary');
  summary.textContent = 'Burimi';
  var text = document.createElement('p');
  text.textContent = item.sourceSq;
  details.append(summary, text);
  return details;
}

function renderAvailableChapter(page, chapter, content) {
  var review = document.createElement('p');
  review.className = 'mburoja-audit-note';
  review.textContent = 'Përmbajtja është transkriptuar nga botimi burimor dhe mban statusin qualified-review-required deri në kontrollin përfundimtar.';
  page.appendChild(review);
  if (content.guidanceSq) {
    var guidance = document.createElement('p');
    guidance.className = 'mburoja-entry-guidance';
    guidance.textContent = content.guidanceSq;
    page.appendChild(guidance);
  }
  var list = document.createElement('div');
  list.className = 'mburoja-entry-list';
  content.items.forEach(function (item, index) {
    var card = document.createElement('article');
    card.className = 'mburoja-entry card';
    var body = document.createElement('div');
    body.className = 'card__body';
    var step = document.createElement('p');
    step.className = 'mburoja-entry__step';
    step.textContent = content.items.length > 1 ? 'Hyrja ' + (index + 1) + ' nga ' + content.items.length : 'Dua dhe dhikër';
    var title = document.createElement('h2');
    title.className = 'mburoja-entry__title';
    title.textContent = item.titleSq;
    body.append(step, title);
    if (item.type === 'text') {
      var arabic = document.createElement('p');
      arabic.className = 'mburoja-entry__arabic text-arabic';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = item.arabic;
      var transliteration = document.createElement('p');
      transliteration.className = 'mburoja-entry__transliteration';
      transliteration.textContent = item.transliterationSq;
      var translation = document.createElement('p');
      translation.className = 'mburoja-entry__translation';
      translation.textContent = item.translationSq;
      body.append(arabic, transliteration, translation);
      if (item.repetitions > 1) {
        var repetition = document.createElement('span');
        repetition.className = 'badge badge--neutral mburoja-entry__repetition';
        repetition.textContent = 'Përsëritet ×' + item.repetitions;
        body.appendChild(repetition);
      }
    } else if (item.type === 'instruction') {
      var instruction = document.createElement('p');
      instruction.className = 'mburoja-entry__translation';
      instruction.textContent = item.bodySq;
      body.appendChild(instruction);
    } else {
      var quranNote = document.createElement('p');
      quranNote.className = 'mburoja-entry__translation';
      quranNote.textContent = 'Ky lexim hapet në Quran Reader me tekstin real arab dhe përkthimin shqip.';
      var quranButton = document.createElement('button');
      quranButton.type = 'button';
      quranButton.className = 'btn btn--primary';
      quranButton.dataset.openMburojaQuran = String(item.surah);
      quranButton.dataset.openMburojaAyah = String(item.ayahStart);
      quranButton.append(icon('book-open', 'icon--sm'), document.createTextNode(' Hap në Kuran'));
      body.append(quranNote, quranButton);
    }
    body.appendChild(mburojaSourceDetails(item));
    card.appendChild(body);
    list.appendChild(card);
  });
  page.appendChild(list);
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
  page.appendChild(top);

  var available = getMburojaContent(chapter.number);
  if (available) {
    renderAvailableChapter(page, chapter, available);
    return;
  }

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
  page.appendChild(card);
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

function localDateKey() {
  var d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
function renderDayPlanner(page, selectedDate) {
  page.classList.add('day-planner-page');
  var top = document.createElement('div'); top.className = 'mburoja-page__top';
  var back = document.createElement('button'); back.type = 'button'; back.className = 'btn btn--icon btn--ghost'; back.dataset.dayBack = ''; back.setAttribute('aria-label', 'Kthehu'); back.appendChild(icon('chevron-left'));
  top.append(back, pageHeader('Dita ime', 'Planifikim lokal', 'Detyra, takime dhe kujtesa të ruajtura vetëm në pajisjen tënde.')); page.appendChild(top);
  var form = document.createElement('form'); form.className = 'day-planner-form card'; form.dataset.dayForm = '';
  var title = document.createElement('input'); title.className = 'input'; title.name = 'title'; title.required = true; title.maxLength = 120; title.placeholder = 'Çfarë dëshiron të planifikosh?'; title.setAttribute('aria-label', 'Titulli');
  var row = document.createElement('div'); row.className = 'day-planner-form__row';
  [['dateKey', 'date', 'Data'], ['time', 'time', 'Ora e fillimit'], ['endTime', 'time', 'Ora e përfundimit']].forEach(function (spec) { var input = document.createElement('input'); input.className = 'input'; input.name = spec[0]; input.type = spec[1]; input.setAttribute('aria-label', spec[2]); if (spec[0] === 'dateKey') { input.required = true; input.value = typeof selectedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ? selectedDate : localDateKey(); } row.appendChild(input); });
  var type = document.createElement('select'); type.className = 'input'; type.name = 'type'; type.setAttribute('aria-label', 'Lloji'); [['task', 'Detyrë'], ['appointment', 'Takim'], ['reminder', 'Kujtesë']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; type.appendChild(option); }); row.appendChild(type);
  var details = document.createElement('div'); details.className = 'day-planner-form__row';
  var category = document.createElement('select'); category.className = 'input'; category.name = 'category'; category.setAttribute('aria-label', 'Kategoria'); [['', 'Pa kategori'], ['family', 'Familje'], ['work', 'Punë'], ['school', 'Shkollë'], ['personal', 'Personale']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; category.appendChild(option); });
  var notes = document.createElement('textarea'); notes.className = 'input day-planner-form__notes'; notes.name = 'notes'; notes.maxLength = 1000; notes.rows = 3; notes.placeholder = 'Shënim opsional'; notes.setAttribute('aria-label', 'Shënime opsionale'); var recurrence = document.createElement('select'); recurrence.className = 'input'; recurrence.name = 'recurrence'; recurrence.setAttribute('aria-label', 'Përsëritja'); [['none', 'Nuk përsëritet'], ['daily', 'Çdo ditë'], ['weekly', 'Çdo javë']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; recurrence.appendChild(option); }); details.append(category, notes, recurrence);
  var prayerRow = document.createElement('div'); prayerRow.className = 'day-planner-form__row';
  var prayer = document.createElement('select'); prayer.className = 'input'; prayer.name = 'prayerKey'; prayer.setAttribute('aria-label', 'Namazi për planifikim'); [['', 'Pa lidhje me namaz'], ['fajr', 'Sabahu'], ['dhuhr', 'Dreka'], ['asr', 'Ikindia'], ['maghrib', 'Akshami'], ['isha', 'Jacia']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; prayer.appendChild(option); });
  var relation = document.createElement('select'); relation.className = 'input'; relation.name = 'prayerPlan'; relation.setAttribute('aria-label', 'Planifikimi ndaj namazit'); relation.disabled = true; [['before', 'Namazi para aktivitetit'], ['after', 'Namazi pas aktivitetit']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; relation.appendChild(option); }); prayerRow.append(prayer, relation);
  var actions = document.createElement('div'); actions.className = 'day-planner-form__actions'; var save = document.createElement('button'); save.type = 'submit'; save.className = 'btn btn--primary'; save.dataset.daySave = ''; save.textContent = 'Ruaj'; var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'btn btn--ghost'; cancel.dataset.dayCancel = ''; cancel.textContent = 'Anulo ndryshimin'; cancel.hidden = true; actions.append(save, cancel);
  var status = document.createElement('p'); status.className = 'day-planner-status'; status.dataset.dayStatus = ''; status.setAttribute('role', 'status'); form.append(title, row, details, prayerRow, actions, status); page.appendChild(form);
  var filterLabel = document.createElement('h2'); filterLabel.className = 'day-planner-heading'; filterLabel.textContent = 'Filtro planin';
  var filters = document.createElement('div'); filters.className = 'day-planner-filters'; filters.dataset.dayFilters = ''; filters.setAttribute('aria-label', 'Filtro sipas kategorisë'); [['', 'Të gjitha'], ['family', 'Familje'], ['work', 'Punë'], ['school', 'Shkollë'], ['personal', 'Personale']].forEach(function (x, index) { var button = document.createElement('button'); button.type = 'button'; button.className = 'day-planner-filter' + (index === 0 ? ' day-planner-filter--active' : ''); button.dataset.dayCategory = x[0]; button.setAttribute('aria-pressed', String(index === 0)); button.textContent = x[1]; filters.appendChild(button); });
  var filterSearch = document.createElement('input'); filterSearch.type = 'search'; filterSearch.className = 'input day-planner-search'; filterSearch.placeholder = 'Kërko në planin e ditës'; filterSearch.dataset.daySearch = ''; filterSearch.setAttribute('aria-label', 'Kërko në planin e ditës');
  var filterSelects = document.createElement('div'); filterSelects.className = 'day-planner-form__row';
  var typeFilter = document.createElement('select'); typeFilter.className = 'input'; typeFilter.dataset.dayTypeFilter = ''; [['', 'Të gjitha llojet'], ['task', 'Detyra'], ['appointment', 'Takimet'], ['reminder', 'Kujtesat']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; typeFilter.appendChild(option); });
  var statusFilter = document.createElement('select'); statusFilter.className = 'input'; statusFilter.dataset.dayStatusFilter = ''; [['', 'Të gjitha gjendjet'], ['open', 'Të hapura'], ['completed', 'Të kryera']].forEach(function (x) { var option = document.createElement('option'); option.value = x[0]; option.textContent = x[1]; statusFilter.appendChild(option); }); filterSelects.append(typeFilter, statusFilter);
  var heading = document.createElement('h2'); heading.className = 'day-planner-heading'; heading.textContent = 'Plani i ditës'; var list = document.createElement('div'); list.className = 'day-planner-list'; list.dataset.dayList = ''; page.append(filterLabel, filters, filterSearch, filterSelects, heading, list);
}
function paintDayItems(list, items, timings, filters) {
  list.replaceChildren(); var filtered = items.filter(function (item) { var search = (filters.search || '').toLocaleLowerCase('sq'); return (!filters.category || item.category === filters.category) && (!filters.type || item.type === filters.type) && (!filters.status || item.status === filters.status) && (!search || (item.title + ' ' + item.notes).toLocaleLowerCase('sq').indexOf(search) !== -1); });
  if (!filtered.length) { var empty = document.createElement('p'); empty.className = 'day-planner-empty'; empty.textContent = 'Nuk ka hyrje që përputhen me filtrat për këtë ditë.'; list.appendChild(empty); return; }
  var labels = { task: 'Detyrë', appointment: 'Takim', reminder: 'Kujtesë' }; var categories = { family: 'Familje', work: 'Punë', school: 'Shkollë', personal: 'Personale' }; var prayers = { fajr: 'Sabahu', dhuhr: 'Dreka', asr: 'Ikindia', maghrib: 'Akshami', isha: 'Jacia' };
  filtered.forEach(function (item) { var card = document.createElement('article'); card.className = 'day-planner-item card' + (item.status === 'completed' ? ' day-planner-item--completed' : ''); card.dataset.dayId = item.id;
    var check = document.createElement('button'); check.type = 'button'; check.className = 'day-planner-item__check'; check.dataset.dayToggle = ''; check.setAttribute('aria-label', item.status === 'completed' ? 'Shëno si të hapur' : 'Shëno si të kryer'); check.textContent = item.status === 'completed' ? '✓' : '○';
    var content = document.createElement('div'); content.className = 'day-planner-item__content'; var h = document.createElement('h3'); h.textContent = item.title; var meta = document.createElement('p'); var prayerTime = item.prayerKey && timings ? timings[item.prayerKey] : ''; var plan = item.prayerKey ? ' · ' + prayers[item.prayerKey] + (prayerTime ? ' ' + prayerTime : '') + (item.prayerPlan === 'after' ? ' pas aktivitetit' : ' para aktivitetit') : ''; meta.textContent = labels[item.type] + (item.category ? ' · ' + categories[item.category] : '') + (item.time ? ' · ' + item.time + (item.endTime ? '–' + item.endTime : '') : '') + plan; content.append(h, meta);
    if (item.notes) { var noteText = document.createElement('p'); noteText.className = 'day-planner-item__notes'; noteText.textContent = item.notes; content.appendChild(noteText); }
    if (item.prayerKey && item.time && prayerTime) { var toMinutes = function (value) { var parts = value.split(':').map(Number); return parts[0] * 60 + parts[1]; }; var startMinutes = toMinutes(item.time); var prayerMinutes = toMinutes(prayerTime); var endMinutes = item.endTime ? toMinutes(item.endTime) : startMinutes; var gap = startMinutes - prayerMinutes; var prayerNote = document.createElement('p'); prayerNote.className = 'day-planner-item__prayer-note'; if (item.endTime && prayerMinutes >= startMinutes && prayerMinutes <= endMinutes) { prayerNote.classList.add('day-planner-item__prayer-note--attention'); prayerNote.textContent = prayers[item.prayerKey] + ' hyn gjatë aktivitetit (' + prayerTime + '). Planifiko paraprakisht vendin dhe kohën e namazit.'; } else if (item.prayerPlan === 'before' && gap >= 0) prayerNote.textContent = 'Plan: ' + prayers[item.prayerKey] + ' para aktivitetit · ' + gap + ' min diferencë.'; else if (item.prayerPlan === 'before') { prayerNote.classList.add('day-planner-item__prayer-note--attention'); prayerNote.textContent = 'Aktiviteti fillon para hyrjes së ' + prayers[item.prayerKey] + '. Rishiko planin.'; } else if (gap <= 0) prayerNote.textContent = 'Plan: ' + prayers[item.prayerKey] + ' pas aktivitetit · ' + Math.abs(gap) + ' min diferencë.'; else { prayerNote.classList.add('day-planner-item__prayer-note--attention'); prayerNote.textContent = 'Aktiviteti fillon pas hyrjes së ' + prayers[item.prayerKey] + '. Kontrollo planin e namazit.'; } content.appendChild(prayerNote); }
    var itemActions = document.createElement('div'); itemActions.className = 'day-planner-item__actions'; var edit = document.createElement('button'); edit.type = 'button'; edit.className = 'btn btn--ghost btn--sm'; edit.dataset.dayEdit = ''; edit.textContent = 'Ndrysho'; if (item.occurrenceKey) edit.hidden = true; var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn--ghost btn--sm'; remove.dataset.dayDelete = ''; remove.textContent = 'Hiq'; itemActions.append(edit, remove); card.append(check, content, itemActions); list.appendChild(card); });
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page more-page';
  var params = context.params || {};
  if (params.section === 'day') renderDayPlanner(page, params.date);
  else if (params.section !== 'mburoja') renderHub(page);
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
    if (button.dataset.moreAction === 'day') appContext.navigate('more', { params: { section: 'day' } });
    else if (button.dataset.moreAction === 'settings') appContext.navigate('settings');
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

  listen(page, 'click', function (event) {
    var button = event.target.closest('[data-open-mburoja-quran]');
    if (!button || !page.contains(button)) return;
    appContext.navigate('quran', {
      params: {
        surah: Number(button.dataset.openMburojaQuran),
        ayah: Number(button.dataset.openMburojaAyah)
      }
    });
  });

  listen(page.querySelector('[data-day-back]'), 'click', function () { appContext.navigate('more'); });
  var dayForm = page.querySelector('[data-day-form]');
  var dayList = page.querySelector('[data-day-list]');
  var dayStatus = page.querySelector('[data-day-status]');
  var dayFilters = page.querySelector('[data-day-filters]');
  var editingItem = null;
  var activeDayCategory = '';
  var daySearch = page.querySelector('[data-day-search]'); var dayTypeFilter = page.querySelector('[data-day-type-filter]'); var dayStatusFilter = page.querySelector('[data-day-status-filter]');
  function prayerOptions(dateKey) {
    var settings = appContext.store.get('settings');
    if (!settings || !settings.coordinates) return null;
    return { date: new Date(dateKey + 'T12:00:00'), latitude: settings.coordinates.latitude, longitude: settings.coordinates.longitude, calculationMethod: settings.prayer.calculationMethod, asrSchool: settings.prayer.asrSchool, adjustments: settings.prayer.adjustments, forceRefresh: false, timeZone: settings.city === 'Tiranë' ? 'Europe/Tirane' : undefined };
  }
  function refreshDay() {
    if (!dayList || !dayForm) return;
    var dateKey = dayForm.elements.dateKey.value;
    var options = prayerOptions(dateKey);
    Promise.all([listDayItems(dateKey), options ? getPrayerTimes(options).catch(function () { return null; }) : Promise.resolve(null)])
      .then(function (result) { paintDayItems(dayList, result[0], result[1] ? result[1].timings : null, { category: activeDayCategory, search: daySearch ? daySearch.value : '', type: dayTypeFilter ? dayTypeFilter.value : '', status: dayStatusFilter ? dayStatusFilter.value : '' }); if (result[0].some(function (item) { return item.prayerKey; }) && !result[1]) dayStatus.textContent = 'Oraret e namazit nuk janë të disponueshme; lidhja me namazin ruhet gjithsesi.'; })
      .catch(function () { dayStatus.textContent = 'Të dhënat nuk u ngarkuan.'; });
  }
  function formValues() { return { title: dayForm.elements.title.value, dateKey: dayForm.elements.dateKey.value, time: dayForm.elements.time.value, endTime: dayForm.elements.endTime.value, type: dayForm.elements.type.value, category: dayForm.elements.category.value, notes: dayForm.elements.notes.value, recurrence: dayForm.elements.recurrence.value, repeatWeekday: new Date(dayForm.elements.dateKey.value + 'T12:00:00').getDay(), prayerKey: dayForm.elements.prayerKey.value, prayerPlan: dayForm.elements.prayerKey.value ? dayForm.elements.prayerPlan.value : 'none' }; }
  function leaveEdit(message) { editingItem = null; dayForm.reset(); dayForm.elements.dateKey.value = localDateKey(); dayForm.elements.prayerPlan.disabled = true; dayForm.querySelector('[data-day-save]').textContent = 'Ruaj'; dayForm.querySelector('[data-day-cancel]').hidden = true; dayStatus.textContent = message || ''; }
  listen(dayForm, 'submit', function (event) { event.preventDefault(); dayStatus.textContent = ''; var wasEditing = Boolean(editingItem); var operation = wasEditing ? updateDayItem(editingItem, formValues()) : createDayItem(formValues()); operation.then(function () { leaveEdit(wasEditing ? 'Ndryshimi u ruajt.' : 'U ruajt në pajisje.'); refreshDay(); }).catch(function () { dayStatus.textContent = 'Kontrollo të dhënat dhe provo përsëri.'; }); });
  listen(dayForm && dayForm.querySelector('[data-day-cancel]'), 'click', function () { leaveEdit('Ndryshimi u anulua.'); });
  if (dayForm) { listen(dayForm.elements.dateKey, 'change', refreshDay); listen(dayForm.elements.prayerKey, 'change', function () { dayForm.elements.prayerPlan.disabled = !dayForm.elements.prayerKey.value; }); }
  listen(dayFilters, 'click', function (event) { var button = event.target.closest('[data-day-category]'); if (!button || !dayFilters.contains(button)) return; activeDayCategory = button.dataset.dayCategory; dayFilters.querySelectorAll('[data-day-category]').forEach(function (choice) { var active = choice === button; choice.classList.toggle('day-planner-filter--active', active); choice.setAttribute('aria-pressed', String(active)); }); refreshDay(); });
  listen(daySearch, 'input', refreshDay); listen(dayTypeFilter, 'change', refreshDay); listen(dayStatusFilter, 'change', refreshDay);
  listen(dayList, 'click', function (event) { var card = event.target.closest('[data-day-id]'); if (!card) return; listDayItems(dayForm.elements.dateKey.value).then(function (items) { var item = items.find(function (candidate) { return candidate.id === card.dataset.dayId; }); if (!item) return; if (event.target.closest('[data-day-toggle]')) return toggleDayItem(item).then(refreshDay); if (event.target.closest('[data-day-delete]')) return removeDayItem(item.occurrenceKey ? item : item.id).then(refreshDay); if (event.target.closest('[data-day-edit]')) { editingItem = item; dayForm.elements.title.value = item.title; dayForm.elements.time.value = item.time; dayForm.elements.endTime.value = item.endTime; dayForm.elements.type.value = item.type; dayForm.elements.category.value = item.category; dayForm.elements.notes.value = item.notes; dayForm.elements.recurrence.value = item.recurrence || 'none'; dayForm.elements.prayerKey.value = item.prayerKey; dayForm.elements.prayerPlan.value = item.prayerPlan === 'none' ? 'before' : item.prayerPlan; dayForm.elements.prayerPlan.disabled = !item.prayerKey; dayForm.querySelector('[data-day-save]').textContent = 'Ruaj ndryshimin'; dayForm.querySelector('[data-day-cancel]').hidden = false; dayForm.elements.title.focus(); dayForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }); });
  refreshDay();

  return function () { cleanups.forEach(function (cleanup) { cleanup(); }); };
}
