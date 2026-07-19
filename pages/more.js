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
import { listDayItems, createDayItem, toggleDayItem, removeDayItem } from '../js/storage/day-planner.js';

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
function renderDayPlanner(page) {
  page.classList.add('day-planner-page');
  var top = document.createElement('div'); top.className = 'mburoja-page__top';
  var back = document.createElement('button'); back.type = 'button'; back.className = 'btn btn--icon btn--ghost'; back.dataset.dayBack = ''; back.setAttribute('aria-label', 'Kthehu'); back.appendChild(icon('chevron-left'));
  top.append(back, pageHeader('Dita ime', 'Planifikim lokal', 'Detyra, takime dhe kujtesa të ruajtura vetëm në pajisjen tënde.')); page.appendChild(top);
  var form = document.createElement('form'); form.className = 'day-planner-form card'; form.dataset.dayForm = '';
  var title = document.createElement('input'); title.className = 'input'; title.name = 'title'; title.required = true; title.maxLength = 120; title.placeholder = 'Çfarë dëshiron të planifikosh?'; title.setAttribute('aria-label', 'Titulli');
  var row = document.createElement('div'); row.className = 'day-planner-form__row';
  var date = document.createElement('input'); date.className = 'input'; date.type = 'date'; date.name = 'dateKey'; date.required = true; date.value = localDateKey(); date.setAttribute('aria-label', 'Data');
  var time = document.createElement('input'); time.className = 'input'; time.type = 'time'; time.name = 'time'; time.setAttribute('aria-label', 'Ora');
  var type = document.createElement('select'); type.className = 'input'; type.name = 'type'; type.setAttribute('aria-label', 'Lloji');
  [['task','Detyrë'],['appointment','Takim'],['reminder','Kujtesë']].forEach(function(x){ var o=document.createElement('option');o.value=x[0];o.textContent=x[1];type.appendChild(o); });
  row.append(date,time,type);
  var prayerRow = document.createElement('div'); prayerRow.className = 'day-planner-form__row';
  var prayer = document.createElement('select'); prayer.className='input'; prayer.name='prayerKey'; prayer.setAttribute('aria-label','Namazi për planifikim');
  [['','Pa lidhje me namaz'],['fajr','Sabahu'],['dhuhr','Dreka'],['asr','Ikindia'],['maghrib','Akshami'],['isha','Jacia']].forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];prayer.appendChild(o);});
  var relation=document.createElement('select');relation.className='input';relation.name='prayerPlan';relation.setAttribute('aria-label','Planifikimi ndaj namazit');relation.disabled=true;
  [['before','Namazi para aktivitetit'],['after','Namazi pas aktivitetit']].forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];relation.appendChild(o);});
  prayerRow.append(prayer,relation);
  var save=document.createElement('button');save.type='submit';save.className='btn btn--primary';save.textContent='Ruaj';
  var status=document.createElement('p');status.className='day-planner-status';status.dataset.dayStatus='';status.setAttribute('role','status');
  form.append(title,row,prayerRow,save,status); page.appendChild(form);
  var heading=document.createElement('h2');heading.className='day-planner-heading';heading.textContent='Plani i ditës';
  var list=document.createElement('div');list.className='day-planner-list';list.dataset.dayList='';
  page.append(heading,list);
}
function paintDayItems(list, items) {
  list.replaceChildren();
  if (!items.length) { var empty=document.createElement('p');empty.className='day-planner-empty';empty.textContent='Nuk ka ende asgjë për këtë ditë.';list.appendChild(empty);return; }
  items.forEach(function(item){ var card=document.createElement('article');card.className='day-planner-item card'+(item.status==='completed'?' day-planner-item--completed':'');card.dataset.dayId=item.id;
    var check=document.createElement('button');check.type='button';check.className='day-planner-item__check';check.dataset.dayToggle='';check.setAttribute('aria-label',item.status==='completed'?'Shëno si të hapur':'Shëno si të kryer');check.textContent=item.status==='completed'?'✓':'○';
    var content=document.createElement('div');content.className='day-planner-item__content';var h=document.createElement('h3');h.textContent=item.title;var meta=document.createElement('p');var labels={task:'Detyrë',appointment:'Takim',reminder:'Kujtesë'};var prayers={fajr:'Sabahu',dhuhr:'Dreka',asr:'Ikindia',maghrib:'Akshami',isha:'Jacia'}; var plan=item.prayerKey ? ' · '+prayers[item.prayerKey]+(item.prayerPlan==='after'?' pas aktivitetit':' para aktivitetit') : ''; meta.textContent=labels[item.type]+(item.time?' · '+item.time:'')+plan;content.append(h,meta);
    var del=document.createElement('button');del.type='button';del.className='btn btn--ghost btn--sm';del.dataset.dayDelete='';del.textContent='Hiq';card.append(check,content,del);list.appendChild(card); });
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page more-page';
  var params = context.params || {};
  if (params.section === 'day') renderDayPlanner(page);
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
  function refreshDay() { if (!dayList || !dayForm) return; listDayItems(dayForm.elements.dateKey.value).then(function(items){ paintDayItems(dayList,items); }).catch(function(){ dayStatus.textContent='Të dhënat nuk u ngarkuan.'; }); }
  listen(dayForm, 'submit', function(event){ event.preventDefault(); dayStatus.textContent=''; createDayItem({ title:dayForm.elements.title.value,dateKey:dayForm.elements.dateKey.value,time:dayForm.elements.time.value,type:dayForm.elements.type.value,prayerKey:dayForm.elements.prayerKey.value,prayerPlan:dayForm.elements.prayerKey.value?dayForm.elements.prayerPlan.value:'none' }).then(function(){ dayForm.elements.title.value='';dayForm.elements.time.value='';dayStatus.textContent='U ruajt në pajisje.';refreshDay(); }).catch(function(){dayStatus.textContent='Kontrollo të dhënat dhe provo përsëri.';}); });
  if (dayForm) {
    listen(dayForm.elements.dateKey, 'change', refreshDay);
    listen(dayForm.elements.prayerKey, 'change', function () {
      dayForm.elements.prayerPlan.disabled = !dayForm.elements.prayerKey.value;
    });
  }
  listen(dayList, 'click', function(event){ var card=event.target.closest('[data-day-id]');if(!card)return;listDayItems(dayForm.elements.dateKey.value).then(function(items){var item=items.find(function(x){return x.id===card.dataset.dayId;});if(!item)return;if(event.target.closest('[data-day-toggle]'))return toggleDayItem(item).then(refreshDay);if(event.target.closest('[data-day-delete]'))return removeDayItem(item.id).then(refreshDay);}); });
  refreshDay();

  return function () { cleanups.forEach(function (cleanup) { cleanup(); }); };
}
