/**
 * Hayat — Mburoja e Muslimanit: Home, Categories, Detail screens.
 */

import { MBUROJA_CATEGORIES, getMburojaChapter } from '../js/data/mburoja-catalog.js';
import { getMburojaContent } from '../js/data/mburoja-content.js';
import {
  ALL_MBUROJA_ITEMS,
  searchMburojaItems,
  getItemsByCategory,
  getMburojaItem,
  getCategoriesWithCounts
} from '../js/data/mburoja-items.js';
import {
  isFavorite,
  toggleFavorite,
  getFavoriteItems
} from '../js/storage/mburoja-favorites.js';

// ─── Helpers ───

function icon(name, sizeClass) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon' + (sizeClass ? ' ' + sizeClass : ''));
  svg.setAttribute('aria-hidden', 'true');
  var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#icon-' + name);
  svg.appendChild(use);
  return svg;
}

function notice(text) {
  var p = document.createElement('p');
  p.className = 'mburoja-notice';
  p.textContent = text;
  return p;
}

// ─── Category icons ───

var CATEGORY_ICONS = {
  'daily': 'sunrise',
  'home-mosque': 'home',
  'prayer': 'mosque',
  'distress': 'heart',
  'health-death': 'heart',
  'nature': 'sun',
  'food-family': 'heart',
  'social-protection': 'shield',
  'travel': 'map-pin',
  'social': 'heart',
  'hajj-umrah': 'compass',
  'protection': 'shield',
  'remembrance': 'heart'
};

// ═══════════════════════════════════════════════
// SCREEN 1: HOME
// ═══════════════════════════════════════════════

function renderHome(page) {
  page.classList.add('mburoja-page');

  // Header
  var header = document.createElement('header');
  header.className = 'mburoja-home__header';
  var h1 = document.createElement('h1');
  h1.className = 'mburoja-home__title';
  h1.dataset.routeHeading = '';
  h1.textContent = 'Mburoja';
  header.appendChild(h1);

  // Search bar
  var searchBar = document.createElement('div');
  searchBar.className = 'mburoja-search';
  var searchIcon = document.createElement('span');
  searchIcon.className = 'mburoja-search__icon';
  searchIcon.appendChild(icon('search'));
  var searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'input mburoja-search__input';
  searchInput.placeholder = 'Kërko...';
  searchInput.dataset.mburojaSearchInput = '';
  searchBar.append(searchIcon, searchInput);

  // Search results (hidden by default)
  var searchResults = document.createElement('div');
  searchResults.className = 'mburoja-search-results';
  searchResults.dataset.mburojaSearchResults = '';
  searchResults.hidden = true;

  // Favorites section
  var favSection = document.createElement('section');
  favSection.className = 'mburoja-favorites-section';
  var favHeader = document.createElement('div');
  favHeader.className = 'mburoja-favorites-section__header';
  var favTitle = document.createElement('h2');
  favTitle.className = 'mburoja-favorites-section__title';
  favTitle.textContent = 'Të zgjedhurat';
  favHeader.appendChild(favTitle);

  var favCarousel = document.createElement('div');
  favCarousel.className = 'mburoja-favorites-carousel';
  favCarousel.dataset.mburojaFavoritesCarousel = '';

  var favEmpty = document.createElement('p');
  favEmpty.className = 'mburoja-favorites-empty';
  favEmpty.dataset.mburojaFavoritesEmpty = '';
  favEmpty.textContent = 'Nuk ka të dhëna!';

  favSection.append(favHeader, favCarousel, favEmpty);

  // Categories list
  var catSection = document.createElement('section');
  catSection.className = 'mburoja-categories-section';
  var catTitle = document.createElement('h2');
  catTitle.className = 'mburoja-categories-section__title';
  catTitle.textContent = 'Kategoritë';
  catSection.appendChild(catTitle);

  var catList = document.createElement('div');
  catList.className = 'mburoja-categories-list';
  catList.dataset.mburojaCategoriesList = '';

  getCategoriesWithCounts().forEach(function (cat) {
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'mburoja-category-row';
    item.dataset.mburojaCategory = cat.id;

    var iconWrap = document.createElement('span');
    iconWrap.className = 'mburoja-category-row__icon';
    iconWrap.appendChild(icon(CATEGORY_ICONS[cat.id] || 'heart'));

    var text = document.createElement('span');
    text.className = 'mburoja-category-row__text';
    text.textContent = cat.titleSq;

    var count = document.createElement('span');
    count.className = 'mburoja-category-row__count';
    count.textContent = cat.count;

    var arrow = document.createElement('span');
    arrow.className = 'mburoja-category-row__arrow';
    arrow.appendChild(icon('chevron-right', 'icon--sm'));

    item.append(iconWrap, text, count, arrow);
    catList.appendChild(item);
  });

  catSection.appendChild(catList);

  // Review notice
  var reviewNote = notice('Përmbajtja është përgatitur me referenca dhe kërkon rishikim përfundimtar nga person i kualifikuar.');

  page.append(header, searchBar, searchResults, favSection, catSection, reviewNote);
}

function renderFavoritesCarousel(carousel, emptyEl) {
  var favorites = getFavoriteItems(ALL_MBUROJA_ITEMS);
  carousel.replaceChildren();
  emptyEl.hidden = favorites.length > 0;

  favorites.slice(0, 10).forEach(function (item) {
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'mburoja-fav-card';
    card.dataset.mburojaItemId = item.id;

    var title = document.createElement('span');
    title.className = 'mburoja-fav-card__title';
    title.textContent = item.title;

    var chapter = document.createElement('span');
    chapter.className = 'mburoja-fav-card__chapter';
    chapter.textContent = item.chapterTitle;

    card.append(title, chapter);
    carousel.appendChild(card);
  });

  if (favorites.length > 10) {
    var more = document.createElement('button');
    more.type = 'button';
    more.className = 'mburoja-fav-card mburoja-fav-card--more';
    more.dataset.mburojaShowAllFavorites = '';
    more.textContent = 'Të gjitha';
    carousel.appendChild(more);
  }
}

function renderSearchResults(container, query) {
  var results = searchMburojaItems(query);
  container.replaceChildren();

  if (!query || !query.trim()) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  if (results.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'mburoja-search-results__empty';
    empty.textContent = 'Asnjë rezultat.';
    container.appendChild(empty);
    return;
  }

  results.slice(0, 20).forEach(function (item) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'mburoja-search-result';
    row.dataset.mburojaItemId = item.id;

    var title = document.createElement('span');
    title.className = 'mburoja-search-result__title';
    title.textContent = item.title;

    var cat = document.createElement('span');
    cat.className = 'mburoja-search-result__category';
    cat.textContent = item.categoryTitle;

    var arrow = document.createElement('span');
    arrow.className = 'mburoja-search-result__arrow';
    arrow.appendChild(icon('chevron-right', 'icon--sm'));

    row.append(title, cat, arrow);
    container.appendChild(row);
  });
}

// ═══════════════════════════════════════════════
// SCREEN 2: CATEGORY DETAIL
// ═══════════════════════════════════════════════

function renderCategory(page, categoryId) {
  page.classList.add('mburoja-page');

  var category = MBUROJA_CATEGORIES.find(function (c) { return c.id === categoryId; });
  if (!category) {
    renderError(page, 'Kategoria nuk u gjet.');
    return;
  }

  var items = getItemsByCategory(categoryId);

  // Top bar
  var topBar = document.createElement('header');
  topBar.className = 'mburoja-topbar';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackHome = '';
  back.appendChild(icon('chevron-left'));
  var title = document.createElement('h1');
  title.className = 'mburoja-topbar__title';
  title.dataset.routeHeading = '';
  title.textContent = category.titleSq;
  topBar.append(back, title);

  // Items list
  var list = document.createElement('div');
  list.className = 'mburoja-items-list';

  items.forEach(function (item, index) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'mburoja-item-row';
    row.dataset.mburojaItemId = item.id;

    var num = document.createElement('span');
    num.className = 'mburoja-item-row__num';
    num.textContent = String(index + 1);

    var text = document.createElement('span');
    text.className = 'mburoja-item-row__text';
    text.textContent = item.title;

    var arrow = document.createElement('span');
    arrow.className = 'mburoja-item-row__arrow';
    arrow.appendChild(icon('chevron-right', 'icon--sm'));

    row.append(num, text, arrow);
    list.appendChild(row);
  });

  page.append(topBar, list);
}

// ═══════════════════════════════════════════════
// SCREEN 3: DHikr DETAIL
// ═══════════════════════════════════════════════

function renderDetail(page, itemId) {
  page.classList.add('mburoja-page');

  var item = getMburojaItem(itemId);
  if (!item) {
    renderError(page, 'Lutja nuk u gjet.');
    return;
  }

  var fav = isFavorite(item.id);

  // Top bar
  var topBar = document.createElement('header');
  topBar.className = 'mburoja-topbar';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.mburojaBackCategory = '';
  back.dataset.mburojaCategoryId = item.categoryId;
  back.appendChild(icon('chevron-left'));

  var titleEl = document.createElement('h1');
  titleEl.className = 'mburoja-topbar__title';
  titleEl.dataset.routeHeading = '';
  titleEl.textContent = item.categoryTitle;

  var favBtn = document.createElement('button');
  favBtn.type = 'button';
  favBtn.className = 'btn btn--icon btn--ghost';
  favBtn.dataset.mburojaToggleFavorite = item.id;
  favBtn.setAttribute('aria-label', fav ? 'Hiqe nga të zgjedhurat' : 'Shto te të zgjedhurat');
  var heartIcon = icon('heart');
  if (fav) heartIcon.classList.add('mburoja-heart--active');
  favBtn.appendChild(heartIcon);

  topBar.append(back, titleEl, favBtn);

  // Content
  var content = document.createElement('div');
  content.className = 'mburoja-detail';

  // Title
  var dhikrTitle = document.createElement('h2');
  dhikrTitle.className = 'mburoja-detail__title';
  dhikrTitle.textContent = item.title;

  // Arabic block
  var arabicBlock = document.createElement('div');
  arabicBlock.className = 'mburoja-detail__block';
  var arabicLabel = document.createElement('p');
  arabicLabel.className = 'mburoja-detail__label';
  arabicLabel.textContent = 'Arabisht';
  var arabicText = document.createElement('p');
  arabicText.className = 'mburoja-detail__arabic text-quran';
  arabicText.lang = 'ar';
  arabicText.dir = 'rtl';
  arabicText.textContent = item.arabic;
  arabicBlock.append(arabicLabel, arabicText);

  // Transliteration block
  var translitBlock = document.createElement('div');
  translitBlock.className = 'mburoja-detail__block';
  var translitLabel = document.createElement('p');
  translitLabel.className = 'mburoja-detail__label';
  translitLabel.textContent = 'Transliterim';
  var translitText = document.createElement('p');
  translitText.className = 'mburoja-detail__transliteration';
  translitText.textContent = item.transliteration;
  translitBlock.append(translitLabel, translitText);

  // Translation block
  var transBlock = document.createElement('div');
  transBlock.className = 'mburoja-detail__block';
  var transLabel = document.createElement('p');
  transLabel.className = 'mburoja-detail__label';
  transLabel.textContent = 'Përkthimi';
  var transText = document.createElement('p');
  transText.className = 'mburoja-detail__translation';
  transText.textContent = item.translation;
  transBlock.append(transLabel, transText);

  // Reference block
  var refBlock = document.createElement('div');
  refBlock.className = 'mburoja-detail__block';
  var refLabel = document.createElement('p');
  refLabel.className = 'mburoja-detail__label';
  refLabel.textContent = 'Referenca';
  var refText = document.createElement('p');
  refText.className = 'mburoja-detail__reference';
  refText.textContent = item.reference;
  refBlock.append(refLabel, refText);

  content.append(dhikrTitle, arabicBlock, translitBlock, transBlock, refBlock);

  // Bottom actions
  var actions = document.createElement('div');
  actions.className = 'mburoja-detail__actions';

  var copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn--outline';
  copyBtn.dataset.mburojaCopy = '';
  copyBtn.append(icon('copy', 'icon--sm'), document.createTextNode(' Kopjo'));

  var checkBtn = document.createElement('button');
  checkBtn.type = 'button';
  checkBtn.className = 'btn btn--primary';
  checkBtn.dataset.mburojaCheck = '';
  checkBtn.append(icon('check', 'icon--sm'), document.createTextNode(' Lexova'));

  var repeatBadge = document.createElement('span');
  repeatBadge.className = 'mburoja-detail__repeat-badge';
  if (item.repetitions > 1) {
    repeatBadge.textContent = item.repetitions + 'x';
  } else {
    repeatBadge.textContent = '1x';
  }

  actions.append(copyBtn, checkBtn, repeatBadge);

  page.append(topBar, content, actions);
}

// ═══════════════════════════════════════════════
// ERROR SCREEN
// ═══════════════════════════════════════════════

function renderError(page, message) {
  page.classList.add('mburoja-page');
  var box = document.createElement('div');
  box.className = 'mburoja-error';
  box.setAttribute('role', 'alert');
  box.appendChild(icon('alert-circle', 'icon--2xl'));
  var h1 = document.createElement('h1');
  h1.className = 'mburoja-error__title';
  h1.textContent = message;
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--primary';
  back.dataset.mburojaBackHome = '';
  back.textContent = 'Kthehu te Mburoja';
  box.append(h1, back);
  page.appendChild(box);
}

// ═══════════════════════════════════════════════
// EXPORTS: render + mount
// ═══════════════════════════════════════════════

export function render(context) {
  var page = document.createElement('div');
  page.className = 'route-page';
  var params = context.params || {};

  // Detail view
  if (params.item) {
    renderDetail(page, params.item);
    return page;
  }

  // Category view
  if (params.category) {
    renderCategory(page, params.category);
    return page;
  }

  // Home view (default)
  renderHome(page);
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
  var searchInput = page.querySelector('[data-mburoja-search-input]');
  var searchResults = page.querySelector('[data-mburoja-search-results]');
  var favCarousel = page.querySelector('[data-mburoja-favorites-carousel]');
  var favEmpty = page.querySelector('[data-mburoja-favorites-empty]');
  var categoriesList = page.querySelector('[data-mburoja-categories-list]');

  if (searchInput && searchResults) {
    // Search
    listen(searchInput, 'input', function () {
      renderSearchResults(searchResults, searchInput.value);
    });

    // Click on search result
    listen(searchResults, 'click', function (event) {
      var btn = event.target.closest('[data-mburoja-item-id]');
      if (!btn) return;
      searchInput.value = '';
      searchResults.hidden = true;
      appContext.navigate('dhikr', { params: { item: btn.dataset.mburojaItemId } });
    });
  }

  if (favCarousel && favEmpty) {
    // Render favorites
    renderFavoritesCarousel(favCarousel, favEmpty);

    // Click on favorite card
    listen(favCarousel, 'click', function (event) {
      var btn = event.target.closest('[data-mburoja-item-id]');
      if (btn) {
        appContext.navigate('dhikr', { params: { item: btn.dataset.mburojaItemId } });
        return;
      }
      var showAll = event.target.closest('[data-mburoja-show-all-favorites]');
      if (showAll) {
        // TODO: show all favorites screen
      }
    });
  }

  if (categoriesList) {
    // Click on category
    listen(categoriesList, 'click', function (event) {
      var btn = event.target.closest('[data-mburoja-category]');
      if (!btn) return;
      appContext.navigate('dhikr', { params: { category: btn.dataset.mburojaCategory } });
    });
  }

  // ─── CATEGORY MOUNT ───
  var categoryItems = page.querySelector('.mburoja-items-list');
  if (categoryItems) {
    // Click on item
    listen(categoryItems, 'click', function (event) {
      var btn = event.target.closest('[data-mburoja-item-id]');
      if (!btn) return;
      appContext.navigate('dhikr', { params: { item: btn.dataset.mburojaItemId } });
    });

    // Back to home
    listen(page.querySelector('[data-mburoja-back-home]'), 'click', function () {
      appContext.navigate('dhikr');
    });
  }

  // ─── DETAIL MOUNT ───
  var detailContent = page.querySelector('.mburoja-detail');
  if (detailContent) {
    var itemParam = context.params.item;
    var itemData = getMburojaItem(itemParam);

    // Back to category
    listen(page.querySelector('[data-mburoja-back-category]'), 'click', function () {
      var catId = this.dataset.mburojaCategoryId;
      appContext.navigate('dhikr', { params: { category: catId } });
    });

    // Toggle favorite
    listen(page.querySelector('[data-mburoja-toggle-favorite]'), 'click', function () {
      var added = toggleFavorite(this.dataset.mburojaToggleFavorite);
      var heart = this.querySelector('.icon');
      if (heart) {
        heart.classList.toggle('mburoja-heart--active', added);
      }
      this.setAttribute('aria-label', added ? 'Hiqe nga të zgjedhurat' : 'Shto te të zgjedhurat');
    });

    // Copy
    listen(page.querySelector('[data-mburoja-copy]'), 'click', function () {
      if (!itemData) return;
      var text = itemData.arabic + '\n\n' + itemData.transliteration + '\n\n' + itemData.translation + '\n\n' + itemData.reference;
      navigator.clipboard.writeText(text).then(function () {
        // Brief feedback
      }).catch(function () {});
    });

    // Check (mark as read)
    listen(page.querySelector('[data-mburoja-check]'), 'click', function () {
      this.classList.add('btn--success');
      this.textContent = 'U krye';
    });
  }

  // ─── ERROR MOUNT ───
  listen(page.querySelector('[data-mburoja-back-home]'), 'click', function () {
    appContext.navigate('dhikr');
  });

  return function () { cleanups.forEach(function (fn) { fn(); }); };
}
