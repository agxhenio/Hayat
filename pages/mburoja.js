/**
 * Hayat — Mburoja e Muslimanit: Full implementation.
 * Based on reference app structure with Hayat design tokens.
 */

// ─── Data ───
var DATA = null;
var CHAPTERS = [];
var BY_SLUG = {};

// ─── Storage keys ───
var LS = {
  counts: 'hayat-mburoja-counts',
  saved: 'hayat-mburoja-saved',
  favCats: 'hayat-mburoja-favCats',
  favChapters: 'hayat-mburoja-favChapters',
  readerTheme: 'hayat-mburoja-readerTheme',
  font: 'hayat-mburoja-font'
};

// ─── State ───
var counts = {};
var saved = [];
var favCats = [];
var favChapters = [];
var currentChapter = null;

// ─── Helpers ───

function get(k, fb) {
  try { var v = localStorage.getItem(k); return v === null ? fb : v; } catch (e) { return fb; }
}
function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function getJSON(k, fb) { try { return JSON.parse(get(k, '')) || fb; } catch (e) { return fb; } }
function setJSON(k, v) { set(k, JSON.stringify(v)); }

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function normalize(s) {
  var v = String(s == null ? '' : s).toLowerCase();
  if (v.normalize) v = v.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return v.replace(/ë/g, 'e').replace(/ç/g, 'c');
}

// ─── Category icons ───
var CAT_ICONS = {
  'mëngjes-dhe-mbrëmje': 'sunrise',
  'shtëpia-dhe-familja': 'home',
  'udhëtim': 'map-pin',
  'ushqim-dhe-pije': 'heart',
  'gëzim-dhe-shqetësim': 'sparkles',
  'namazi': 'mosque',
  'falënderimi-ndaj-allahut': 'star',
  'mirësjellja': 'users',
  'haxh-dhe-umre': 'compass',
  'natyra': 'sun',
  'sëmundja-dhe-vdekja': 'shield'
};

// ═══════════════════════════════════════════════
// DATA PREPARATION
// ═══════════════════════════════════════════════

function prepare(data) {
  DATA = data;
  var order = 0;
  data.categories.forEach(function (cat) {
    cat.chapters.forEach(function (ch) {
      ch.categorySlug = cat.slug;
      ch.categoryTitle = cat.title.replace(/\s*\d+\s*kapituj\s*$/i, '').trim();
      ch.order = order++;
      ch.duas.forEach(function (d, i) {
        d.chapterSlug = ch.slug;
        d.chapterTitle = ch.title;
        d.categoryTitle = ch.categoryTitle;
        d.pos = i + 1;
        d.uid = ch.slug + ':' + (d.id != null ? d.id : i);
        d._hay = normalize([d.arabic, d.transliteration, d.translation, d.hadith, d.reference, ch.title].join(' '));
      });
      ch._hay = normalize(ch.title + ' ' + ch.categoryTitle);
      CHAPTERS.push(ch);
      BY_SLUG[ch.slug] = ch;
    });
    cat.title = cat.title.replace(/\s*\d+\s*kapituj\s*$/i, '').trim();
  });
}

// ═══════════════════════════════════════════════
// FAVORITES
// ═══════════════════════════════════════════════

function isFavCat(slug) { return favCats.indexOf(slug) !== -1; }
function isFavChapter(slug) { return favChapters.indexOf(slug) !== -1; }

function toggleFavCat(slug) {
  var i = favCats.indexOf(slug);
  if (i === -1) favCats.push(slug);
  else favCats.splice(i, 1);
  setJSON(LS.favCats, favCats);
}

function toggleFavChapter(slug) {
  var i = favChapters.indexOf(slug);
  if (i === -1) favChapters.push(slug);
  else favChapters.splice(i, 1);
  setJSON(LS.favChapters, favChapters);
}

// ═══════════════════════════════════════════════
// RENDER: HOME (Categories + Favorites)
// ═══════════════════════════════════════════════

function renderHome(page) {
  page.classList.add('mburoja-page');
  page.dataset.mburojaScreen = 'home';

  // Search
  var search = document.createElement('div');
  search.className = 'mb-search';
  var searchField = document.createElement('div');
  searchField.className = 'search-field';
  var searchIcon = document.createElement('span');
  searchIcon.className = 'search-field__icon';
  searchIcon.appendChild(icon('search', 'icon--sm'));
  var searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'search-field__input';
  searchInput.placeholder = 'Kërko në të gjitha lutjet…';
  searchInput.dataset.mburojaSearchInput = '';
  searchField.append(searchIcon, searchInput);
  search.appendChild(searchField);

  // Search results container
  var searchResults = document.createElement('div');
  searchResults.dataset.mburojaSearchResults = '';
  searchResults.hidden = true;

  // Home content
  var homeContent = document.createElement('div');
  homeContent.dataset.mburojaHomeContent = '';
  homeContent.className = 'flow';

  // Favorites section
  var favSection = document.createElement('section');
  favSection.dataset.mburojaFavSection = '';
  favSection.hidden = true;

  var favTitle = document.createElement('h2');
  favTitle.className = 'settings-group__title';
  favTitle.textContent = 'Të preferuarat';

  var favGrid = document.createElement('div');
  favGrid.className = 'mb-grid';
  favGrid.dataset.mburojaFavGrid = '';
  favGrid.hidden = true;

  var favChapterList = document.createElement('div');
  favChapterList.className = 'list-group';
  favChapterList.dataset.mburojaFavChapters = '';
  favChapterList.hidden = true;

  favSection.append(favTitle, favGrid, favChapterList);

  // All categories section
  var allSection = document.createElement('section');
  var allTitle = document.createElement('h2');
  allTitle.className = 'settings-group__title';
  allTitle.textContent = 'Të gjitha kategoritë';

  var catGrid = document.createElement('div');
  catGrid.className = 'mb-grid';
  catGrid.dataset.mburojaCatGrid = '';

  allSection.append(allTitle, catGrid);

  homeContent.append(favSection, allSection);
  page.append(search, searchResults, homeContent);
}

function renderCategoryCard(cat) {
  var duaCount = cat.chapters.reduce(function (a, c) { return a + c.duas.length; }, 0);
  var card = document.createElement('div');
  card.className = 'mb-cat';
  card.dataset.mburojaCat = cat.slug;

  // Favorite button
  var favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'mb-fav' + (isFavCat(cat.slug) ? ' mb-fav--on' : '');
  favBtn.dataset.mburojaFavCat = cat.slug;
  favBtn.setAttribute('aria-pressed', String(isFavCat(cat.slug)));
  favBtn.setAttribute('aria-label', isFavCat(cat.slug) ? 'Hiq nga të preferuarat' : 'Shtoje te të preferuarat');
  favBtn.appendChild(icon('star', 'icon--sm'));

  // Link
  var link = document.createElement('a');
  link.className = 'mb-cat__link link-plain';
  link.href = '#/mburoja?kategoria=' + encodeURIComponent(cat.slug);

  var glyph = document.createElement('span');
  glyph.className = 'mb-cat__glyph';
  glyph.appendChild(icon(CAT_ICONS[cat.slug.toLowerCase()] || 'book-open'));

  var title = document.createElement('span');
  title.className = 'mb-cat__title';
  title.textContent = cat.title;

  var meta = document.createElement('span');
  meta.className = 'mb-cat__meta';
  meta.textContent = cat.chapters.length + ' kapituj · ' + duaCount + ' lutje';

  link.append(glyph, title, meta);
  card.append(favBtn, link);
  return card;
}

function renderChapterRow(ch, showCat) {
  var done = ch.duas.filter(function (d) { return (counts[d.uid] || 0) >= (d.repetitions || 1); }).length;
  var complete = done === ch.duas.length && ch.duas.length > 0;

  var row = document.createElement('div');
  row.className = 'list-item mb-chapter' + (complete ? ' mb-chapter--done' : '');

  var link = document.createElement('a');
  link.className = 'mb-chapter__link link-plain';
  link.href = '#/mburoja?kapitulli=' + encodeURIComponent(ch.slug);

  var num = document.createElement('span');
  num.className = 'mb-chapter__num';
  num.textContent = String(ch.number || '·');

  var content = document.createElement('span');
  content.className = 'list-item__content';

  var titleEl = document.createElement('span');
  titleEl.className = 'list-item__title';
  titleEl.textContent = ch.title;

  var subtitle = document.createElement('span');
  subtitle.className = 'list-item__subtitle';
  subtitle.textContent = (showCat ? ch.categoryTitle + ' · ' : '') + ch.duas.length + ' lutje' +
    (done ? ' · ' + done + ' të kryera' : '');

  content.append(titleEl, subtitle);
  link.append(num, content);

  if (complete) {
    var badge = document.createElement('span');
    badge.className = 'badge badge--success';
    badge.appendChild(icon('check', 'icon--xs'));
    link.appendChild(badge);
  }

  // Favorite button
  var favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'mb-fav' + (isFavChapter(ch.slug) ? ' mb-fav--on' : '');
  favBtn.dataset.mburojaFavChapter = ch.slug;
  favBtn.setAttribute('aria-pressed', String(isFavChapter(ch.slug)));
  favBtn.appendChild(icon('star', 'icon--sm'));

  row.append(link, favBtn);
  return row;
}

// ═══════════════════════════════════════════════
// RENDER: CHAPTERS LIST
// ═══════════════════════════════════════════════

function renderChapters(page, catSlug) {
  page.classList.add('mburoja-page');
  page.dataset.mburojaScreen = 'chapters';
  page.dataset.mburojaCatSlug = catSlug;

  var cat = DATA.categories.filter(function (c) { return c.slug === catSlug; })[0];
  if (!cat) return;

  // Header
  var header = document.createElement('div');
  header.className = 'mb-spread';
  var title = document.createElement('h2');
  title.className = 'settings-group__title';
  title.textContent = cat.title;

  var favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'mb-fav' + (isFavCat(catSlug) ? ' mb-fav--on' : '');
  favBtn.dataset.mburojaFavCat = catSlug;
  favBtn.setAttribute('aria-pressed', String(isFavCat(catSlug)));
  favBtn.appendChild(icon('star', 'icon--sm'));

  header.append(title, favBtn);

  // Chapters list
  var list = document.createElement('div');
  list.className = 'list-group';
  list.dataset.mburojaChapterList = '';

  cat.chapters.forEach(function (ch) {
    list.appendChild(renderChapterRow(ch));
  });

  page.append(header, list);
}

// ═══════════════════════════════════════════════
// RENDER: READER (Dua cards with counters)
// ═══════════════════════════════════════════════

function renderReader(page, chSlug) {
  page.classList.add('mburoja-page');
  page.dataset.mburojaScreen = 'reader';
  page.dataset.mburojaChapterSlug = chSlug;

  var ch = BY_SLUG[chSlug];
  if (!ch) return;

  currentChapter = ch;

  // Reader theme controls
  var toolbar = document.createElement('div');
  toolbar.className = 'reader-toolbar';

  var fontGroup = document.createElement('div');
  fontGroup.className = 'reader-toolbar__group';
  var fontDown = document.createElement('button');
  fontDown.type = 'button';
  fontDown.className = 'reader-control';
  fontDown.dataset.mburojaFontDown = '';
  fontDown.textContent = 'A−';
  var fontUp = document.createElement('button');
  fontUp.type = 'button';
  fontUp.className = 'reader-control';
  fontUp.dataset.mburojaFontUp = '';
  fontUp.textContent = 'A+';
  fontGroup.append(fontDown, fontUp);

  var themeGroup = document.createElement('div');
  themeGroup.className = 'reader-toolbar__group';
  var themePicker = document.createElement('div');
  themePicker.className = 'reader-theme-picker';
  themePicker.setAttribute('role', 'radiogroup');
  themePicker.setAttribute('aria-label', 'Tema e lexuesit');
  ['paper', 'sepia', 'night'].forEach(function (t) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'reader-control' + (t === 'night' ? ' reader-control--active' : '');
    btn.dataset.mburojaReaderTheme = t;
    btn.textContent = t === 'paper' ? 'Letër' : t === 'sepia' ? 'Sepia' : 'Natë';
    themePicker.appendChild(btn);
  });
  themeGroup.appendChild(themePicker);
  toolbar.append(fontGroup, themeGroup);

  // Progress
  var progress = document.createElement('div');
  progress.className = 'progress';
  progress.dataset.mburojaProgress = '';

  var total = ch.duas.length;
  var done = ch.duas.filter(function (d) { return (counts[d.uid] || 0) >= (d.repetitions || 1); }).length;
  var pct = total ? Math.round(done / total * 100) : 0;

  var progressLabel = document.createElement('div');
  progressLabel.className = 'progress__label';
  var progText = document.createElement('span');
  progText.dataset.mburojaProgText = '';
  progText.textContent = done + ' nga ' + total + ' lutje';
  var progPct = document.createElement('span');
  progPct.dataset.mburojaProgPct = '';
  progPct.textContent = pct + '%';
  progressLabel.append(progText, progPct);

  var progressTrack = document.createElement('div');
  progressTrack.className = 'progress__track';
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '100');
  progressTrack.setAttribute('aria-valuenow', String(pct));
  var progressBar = document.createElement('div');
  progressBar.className = 'progress__bar';
  progressBar.dataset.mburojaProgBar = '';
  progressBar.style.inlineSize = pct + '%';
  progressTrack.appendChild(progressBar);
  progress.append(progressLabel, progressTrack);

  // Reader body
  var readerBody = document.createElement('div');
  readerBody.className = 'reader mb-reader reader-container';
  readerBody.dataset.mburojaReaderBody = '';
  readerBody.setAttribute('data-reader-theme', 'night');
  readerBody.setAttribute('data-font', 'md');

  var flow = document.createElement('div');
  flow.className = 'flow';
  ch.duas.forEach(function (d) {
    flow.appendChild(renderDuaCard(d));
  });
  readerBody.appendChild(flow);

  // Actions (favorite + reset)
  var actions = document.createElement('div');
  actions.className = 'cluster';
  actions.style.marginTop = 'var(--space-6)';

  var favChapterBtn = document.createElement('button');
  favChapterBtn.type = 'button';
  favChapterBtn.className = 'btn btn--outline btn--sm' + (isFavChapter(chSlug) ? ' btn--primary' : '');
  favChapterBtn.dataset.mburojaFavChapterBtn = '';
  favChapterBtn.setAttribute('aria-pressed', String(isFavChapter(chSlug)));
  favChapterBtn.appendChild(icon('star', 'icon--sm'));
  var favLabel = document.createElement('span');
  favLabel.className = 'btn__label';
  favLabel.dataset.mburojaFavChapterLabel = '';
  favLabel.textContent = isFavChapter(chSlug) ? 'Në të preferuarat' : 'Shtoje te të preferuarat';
  favChapterBtn.appendChild(favLabel);

  var resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn btn--ghost btn--sm';
  resetBtn.dataset.mburojaResetChapter = '';
  resetBtn.appendChild(icon('refresh', 'icon--sm'));
  var resetLabel = document.createElement('span');
  resetLabel.className = 'btn__label';
  resetLabel.textContent = 'Rinis numërimin';
  resetBtn.appendChild(resetLabel);

  actions.append(favChapterBtn, resetBtn);

  // Navigation (prev/next chapter)
  var nav = document.createElement('nav');
  nav.className = 'mb-spread';
  nav.style.marginTop = 'var(--space-6)';
  nav.setAttribute('aria-label', 'Navigim kapitujsh');

  var chIndex = CHAPTERS.indexOf(ch);

  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'btn btn--outline btn--sm';
  prevBtn.dataset.mburojaPrevChapter = '';
  prevBtn.disabled = chIndex <= 0;
  prevBtn.appendChild(icon('chevron-left', 'icon--sm'));
  var prevLabel = document.createElement('span');
  prevLabel.className = 'btn__label';
  prevLabel.textContent = 'I mëparshmi';
  prevBtn.appendChild(prevLabel);

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn btn--outline btn--sm';
  nextBtn.dataset.mburojaNextChapter = '';
  nextBtn.disabled = chIndex >= CHAPTERS.length - 1;
  var nextLabel = document.createElement('span');
  nextLabel.className = 'btn__label';
  nextLabel.textContent = 'Tjetri';
  nextBtn.append(nextLabel, icon('chevron-right', 'icon--sm'));

  nav.append(prevBtn, nextBtn);

  page.append(toolbar, progress, readerBody, actions, nav);
}

function renderDuaCard(d) {
  var target = d.repetitions || 1;
  var done = counts[d.uid] || 0;
  var isSaved = saved.indexOf(d.uid) !== -1;
  var isDone = done >= target;

  var card = document.createElement('article');
  card.className = 'mb-dua' + (isDone ? ' mb-dua--done' : '');
  card.dataset.mburojaDuaUid = d.uid;

  // Header
  var head = document.createElement('header');
  head.className = 'mb-dua__head';

  var index = document.createElement('span');
  index.className = 'mb-dua__index';
  index.textContent = String(d.pos);

  var spacer = document.createElement('span');
  spacer.className = 'mb-dua__spacer';

  head.append(index, spacer);

  if (target > 1) {
    var badge = document.createElement('span');
    badge.className = 'badge badge--gold';
    badge.textContent = target + 'x';
    head.appendChild(badge);
  }

  // Save button
  var saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'btn btn--icon btn--ghost btn--sm';
  saveBtn.dataset.mburojaSaveDua = d.uid;
  saveBtn.setAttribute('aria-pressed', String(isSaved));
  saveBtn.setAttribute('aria-label', 'Ruaj lutjen');
  saveBtn.appendChild(icon('bookmark', 'icon--sm'));
  head.appendChild(saveBtn);

  // Copy button
  var copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn--icon btn--ghost btn--sm';
  copyBtn.dataset.mburojaCopyDua = d.uid;
  copyBtn.setAttribute('aria-label', 'Kopjo lutjen');
  copyBtn.appendChild(icon('share', 'icon--sm'));
  head.appendChild(copyBtn);

  card.appendChild(head);

  // Arabic
  if (d.arabic) {
    var arabic = document.createElement('p');
    arabic.className = 'mb-dua__arabic';
    arabic.lang = 'ar';
    arabic.dir = 'rtl';
    arabic.textContent = d.arabic;
    card.appendChild(arabic);
  }

  // Transliteration
  if (d.transliteration) {
    var translit = document.createElement('p');
    translit.className = 'mb-dua__translit';
    translit.textContent = d.transliteration;
    card.appendChild(translit);
  }

  // Translation
  if (d.translation) {
    var trans = document.createElement('p');
    trans.className = 'mb-dua__translation';
    trans.textContent = d.translation;
    card.appendChild(trans);
  }

  // Hadith
  if (d.hadith) {
    var hadith = document.createElement('p');
    hadith.className = 'mb-dua__hadith';
    hadith.textContent = d.hadith;
    card.appendChild(hadith);
  }

  // Counter
  var counterWrap = document.createElement('div');
  counterWrap.className = 'cluster';
  counterWrap.style.marginBlock = 'var(--space-4) var(--space-3)';

  var counter = document.createElement('button');
  counter.type = 'button';
  counter.className = 'mb-counter' + (isDone ? ' mb-counter--done' : '');
  counter.dataset.mburojaCountDua = d.uid;
  counter.appendChild(icon(isDone ? 'check' : 'circle', 'icon--sm'));
  var countLabel = document.createElement('span');
  countLabel.dataset.mburojaCountLabel = '';
  countLabel.textContent = isDone ? 'E kryer' : done + ' / ' + target;
  counter.appendChild(countLabel);
  counterWrap.appendChild(counter);
  card.appendChild(counterWrap);

  // Reference
  if (d.reference) {
    var ref = document.createElement('p');
    ref.className = 'mb-dua__reference';
    ref.appendChild(icon('info', 'icon--xs'));
    ref.appendChild(document.createTextNode(d.reference));
    card.appendChild(ref);
  }

  return card;
}

// ═══════════════════════════════════════════════
// COUNTER LOGIC
// ═══════════════════════════════════════════════

function findDua(uid) {
  var slug = uid.split(':')[0];
  var ch = BY_SLUG[slug];
  if (!ch) return null;
  return ch.duas.filter(function (d) { return d.uid === uid; })[0] || null;
}

function tapCount(uid) {
  var d = findDua(uid);
  if (!d) return;
  var target = d.repetitions || 1;
  var cur = counts[uid] || 0;
  counts[uid] = cur >= target ? 0 : cur + 1;
  setJSON(LS.counts, counts);
  updateDuaCard(uid);
  updateProgress();
}

function updateDuaCard(uid) {
  var d = findDua(uid);
  if (!d) return;
  var target = d.repetitions || 1;
  var done = counts[uid] || 0;
  var isDone = done >= target;

  var card = document.querySelector('[data-mburoja-dua-uid="' + uid + '"]');
  if (!card) return;

  var counter = card.querySelector('[data-mburoja-count-dua]');
  if (counter) {
    counter.classList.toggle('mb-counter--done', isDone);
    var use = counter.querySelector('use');
    if (use) use.setAttribute('href', isDone ? '#icon-check' : '#icon-circle');
    var label = counter.querySelector('[data-mburoja-count-label]');
    if (label) label.textContent = isDone ? 'E kryer' : done + ' / ' + target;
  }
  card.classList.toggle('mb-dua--done', isDone);
}

function updateProgress() {
  if (!currentChapter) return;
  var total = currentChapter.duas.length;
  var done = currentChapter.duas.filter(function (d) {
    return (counts[d.uid] || 0) >= (d.repetitions || 1);
  }).length;
  var pct = total ? Math.round(done / total * 100) : 0;

  var progText = document.querySelector('[data-mburoja-prog-text]');
  var progPct = document.querySelector('[data-mburoja-prog-pct]');
  var progBar = document.querySelector('[data-mburoja-prog-bar]');

  if (progText) progText.textContent = done + ' nga ' + total + ' lutje';
  if (progPct) progPct.textContent = pct + '%';
  if (progBar) progBar.style.inlineSize = pct + '%';
}

// ═══════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════

function runSearch(query) {
  var q = normalize(query.trim());
  if (q.length < 2) return [];

  var hits = [];
  CHAPTERS.forEach(function (ch) {
    if (ch._hay.indexOf(q) !== -1) hits.push({ type: 'chapter', ch: ch });
    ch.duas.forEach(function (d) {
      if (d._hay.indexOf(q) !== -1) hits.push({ type: 'dua', d: d, ch: ch });
    });
  });
  return hits;
}

// ═══════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════

// ─── Data loading ───
var dataLoading = null;

function ensureData() {
  if (DATA) return Promise.resolve();
  if (dataLoading) return dataLoading;
  dataLoading = fetch('./data/mburoja.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      prepare(data);
      counts = getJSON(LS.counts, {});
      saved = getJSON(LS.saved, []);
      favCats = getJSON(LS.favCats, []);
      favChapters = getJSON(LS.favChapters, []);
    });
  return dataLoading;
}

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page';
  var params = context.params || {};

  // Show loading if data not ready
  if (!DATA) {
    var loading = document.createElement('div');
    loading.className = 'app__loading';
    loading.setAttribute('role', 'status');
    var spinner = document.createElement('div');
    spinner.className = 'app__loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');
    var text = document.createElement('p');
    text.className = 'app__loading-text';
    text.textContent = 'Duke ngarkuar Mburojën...';
    loading.append(spinner, text);
    page.appendChild(loading);

    // Load data and re-render
    ensureData().then(function () {
      var newPage = document.createElement('div');
      newPage.className = 'route-page';
      if (params.kapitulli) renderReader(newPage, params.kapitulli);
      else if (params.kategoria) renderChapters(newPage, params.kategoria);
      else renderHome(newPage);
      page.replaceChildren(...newPage.childNodes);
    }).catch(function () {
      page.replaceChildren();
      var error = document.createElement('div');
      error.className = 'alert alert--danger';
      error.textContent = 'Gabim në ngarkimin e të dhënave.';
      page.appendChild(error);
    });

    return page;
  }

  // Route
  if (params.kapitulli) {
    renderReader(page, params.kapitulli);
  } else if (params.kategoria) {
    renderChapters(page, params.kategoria);
  } else {
    renderHome(page);
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

  // ─── HOME MOUNT ───
  var catGrid = page.querySelector('[data-mburoja-cat-grid]');
  if (catGrid && DATA) {
    // Render categories
    DATA.categories.forEach(function (cat) {
      catGrid.appendChild(renderCategoryCard(cat));
    });

    // Render favorites
    var favGrid = page.querySelector('[data-mburoja-fav-grid]');
    var favChapters2 = page.querySelector('[data-mburoja-fav-chapters]');
    var favSection = page.querySelector('[data-mburoja-fav-section]');

    if (favGrid && favSection) {
      var favCats2 = DATA.categories.filter(function (c) { return isFavCat(c.slug); });
      favCats2.forEach(function (cat) { favGrid.appendChild(renderCategoryCard(cat)); });
      favGrid.hidden = favCats2.length === 0;
    }
    if (favChapters2 && favSection) {
      var favChs = favChapters.map(function (sl) { return BY_SLUG[sl]; }).filter(Boolean);
      favChs.forEach(function (ch) { favChapters2.appendChild(renderChapterRow(ch, true)); });
      favChapters2.hidden = favChs.length === 0;
    }
    if (favSection) {
      var hasFavs = (favCats2 && favCats2.length > 0) || (favChs && favChs.length > 0);
      favSection.hidden = !hasFavs;
    }

    // Category click
    listen(catGrid, 'click', function (event) {
      // Favorite button
      var favBtn = event.target.closest('[data-mburoja-fav-cat]');
      if (favBtn) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavCat(favBtn.dataset.mburojaFavCat);
        favBtn.classList.toggle('mb-fav--on');
        favBtn.setAttribute('aria-pressed', String(favBtn.classList.contains('mb-fav--on')));
        return;
      }
      // Category link (handled by router)
    });

    // Search
    var searchInput = page.querySelector('[data-mburoja-search-input]');
    var searchResults = page.querySelector('[data-mburoja-search-results]');
    var homeContent = page.querySelector('[data-mburoja-home-content]');
    var timer;
    listen(searchInput, 'input', function () {
      clearTimeout(timer);
      var v = searchInput.value;
      timer = setTimeout(function () {
        var hits = runSearch(v);
        if (hits.length > 0 && v.trim().length >= 2) {
          searchResults.hidden = false;
          if (homeContent) homeContent.hidden = true;
          searchResults.replaceChildren();
          var head = document.createElement('p');
          head.className = 'card__subtitle';
          head.textContent = hits.length + ' rezultate për "' + v.trim() + '"';
          searchResults.appendChild(head);
          hits.slice(0, 50).forEach(function (hit) {
            if (hit.type === 'chapter') {
              var row = renderChapterRow(hit.ch, true);
              searchResults.appendChild(row);
            }
          });
        } else {
          searchResults.hidden = true;
          if (homeContent) homeContent.hidden = false;
        }
      }, 200);
    });
  }

  // ─── CHAPTERS MOUNT ───
  var chapterList = page.querySelector('[data-mburoja-chapter-list]');
  if (chapterList) {
    listen(chapterList, 'click', function (event) {
      var favBtn = event.target.closest('[data-mburoja-fav-chapter]');
      if (favBtn) {
        event.preventDefault();
        event.stopPropagation();
        toggleFavChapter(favBtn.dataset.mburojaFavChapter);
        favBtn.classList.toggle('mb-fav--on');
        favBtn.setAttribute('aria-pressed', String(favBtn.classList.contains('mb-fav--on')));
        return;
      }
    });
  }

  // ─── READER MOUNT ───
  var readerBody = page.querySelector('[data-mburoja-reader-body]');
  if (readerBody) {
    // Counter clicks
    listen(readerBody, 'click', function (event) {
      var countBtn = event.target.closest('[data-mburoja-count-dua]');
      if (countBtn) {
        tapCount(countBtn.dataset.mburojaCountDua);
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
        return;
      }

      var saveBtn = event.target.closest('[data-mburoja-save-dua]');
      if (saveBtn) {
        var uid = saveBtn.dataset.mburojaSaveDua;
        var i = saved.indexOf(uid);
        if (i === -1) saved.push(uid);
        else saved.splice(i, 1);
        setJSON(LS.saved, saved);
        saveBtn.setAttribute('aria-pressed', String(i === -1));
        return;
      }

      var copyBtn = event.target.closest('[data-mburoja-copy-dua]');
      if (copyBtn) {
        var dua = findDua(copyBtn.dataset.mburojaCopyDua);
        if (dua) {
          var text = [dua.arabic, dua.transliteration, dua.translation, dua.reference].filter(Boolean).join('\n\n');
          navigator.clipboard.writeText(text).catch(function () {});
        }
        return;
      }
    });

    // Favorite chapter
    listen(page.querySelector('[data-mburoja-fav-chapter-btn]'), 'click', function () {
      if (!currentChapter) return;
      toggleFavChapter(currentChapter.slug);
      var on = isFavChapter(currentChapter.slug);
      this.classList.toggle('btn--primary', on);
      this.classList.toggle('btn--outline', !on);
      this.setAttribute('aria-pressed', String(on));
      var label = page.querySelector('[data-mburoja-fav-chapter-label]');
      if (label) label.textContent = on ? 'Në të preferuarat' : 'Shtoje te të preferuarat';
    });

    // Reset chapter
    listen(page.querySelector('[data-mburoja-reset-chapter]'), 'click', function () {
      if (!currentChapter) return;
      currentChapter.duas.forEach(function (d) { delete counts[d.uid]; });
      setJSON(LS.counts, counts);
      // Re-render reader
      appContext.navigate('mburoja', { params: { kapitulli: currentChapter.slug } });
    });

    // Prev/Next chapter
    listen(page.querySelector('[data-mburoja-prev-chapter]'), 'click', function () {
      var i = CHAPTERS.indexOf(currentChapter);
      if (i > 0) appContext.navigate('mburoja', { params: { kapitulli: CHAPTERS[i - 1].slug } });
    });
    listen(page.querySelector('[data-mburoja-next-chapter]'), 'click', function () {
      var i = CHAPTERS.indexOf(currentChapter);
      if (i < CHAPTERS.length - 1) appContext.navigate('mburoja', { params: { kapitulli: CHAPTERS[i + 1].slug } });
    });

    // Font size
    var FONTS = ['sm', 'md', 'lg', 'xl'];
    listen(page.querySelector('[data-mburoja-font-up]'), 'click', function () {
      var current = readerBody.getAttribute('data-font') || 'md';
      var i = FONTS.indexOf(current);
      var next = FONTS[Math.min(FONTS.length - 1, i + 1)];
      readerBody.setAttribute('data-font', next);
      set(LS.font, next);
    });
    listen(page.querySelector('[data-mburoja-font-down]'), 'click', function () {
      var current = readerBody.getAttribute('data-font') || 'md';
      var i = FONTS.indexOf(current);
      var next = FONTS[Math.max(0, i - 1)];
      readerBody.setAttribute('data-font', next);
      set(LS.font, next);
    });

    // Reader theme
    listen(page.querySelector('.reader-theme-picker'), 'click', function (event) {
      var btn = event.target.closest('[data-mburoja-reader-theme]');
      if (!btn) return;
      var theme = btn.dataset.mburojaReaderTheme;
      readerBody.setAttribute('data-reader-theme', theme);
      set(LS.readerTheme, theme);
      this.querySelectorAll('[data-mburoja-reader-theme]').forEach(function (b) {
        b.classList.toggle('reader-control--active', b.dataset.mbrujaReaderTheme === theme);
      });
    });

    // Apply saved font/theme
    var savedFont = get(LS.font, 'md');
    readerBody.setAttribute('data-font', savedFont);
    var savedTheme = get(LS.readerTheme, 'night');
    readerBody.setAttribute('data-reader-theme', savedTheme);
  }

  return function () { cleanups.forEach(function (fn) { fn(); }); };
}
