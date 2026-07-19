/**
 * Hayat — Home Page
 *
 * Renders the Home route with four priority cards:
 * 1. Prayer hero (real data from Prayer Engine)
 * 2. Suggested readings with real Daily Dhikr state
 * 3. Quran continue from saved reading position
 * 4. Curated articles
 *
 * @module pages/home
 */

import { PRAYER_LABELS_SQ } from '../js/config.js';
import {
  getTodayAndTomorrowPrayerTimes,
  getPrayerState,
  PrayerTimesError
} from '../js/services/prayer-times.js';
import { getPrayerLogsForDate } from '../js/storage/prayer-log.js';
import { getZonedDateParts } from '../js/utils/date-time.js';
import { BEDTIME_QURAN_READINGS } from '../js/data/daily-dhikr.js';
import { getSurahMetadata } from '../js/data/quran-surahs.js';
import { getLastReadPosition } from '../js/storage/quran-reading.js';
import { getDailyDhikrSession, DAILY_DHIKR_SESSION_STATUS } from '../js/storage/daily-dhikr-progress.js';
import {
  getArticlesManifest,
  getArticle,
  saveArticleOffline,
  removeArticleOffline,
  isArticleOffline,
  getCachedArticleImageUrl,
  ArticleError
} from '../js/services/articles.js';

// ====================================================================
// TIRANA PRESET (for timezone detection)
// ====================================================================

var TIRANA_LAT = 41.3275;
var TIRANA_LON = 19.8187;
var COORD_TOLERANCE = 0.0001;

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

// ====================================================================
// DATE FORMATTING
// ====================================================================

function formatAlbanianDate(date) {
  try {
    var formatter = new Intl.DateTimeFormat('sq-AL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    return date.toLocaleDateString();
  }
}

// ====================================================================
// SETTINGS FINGERPRINT
// ====================================================================

function getPrayerSettingsFingerprint(settings) {
  if (!settings) return '';
  
  var parts = [];
  if (settings.coordinates) {
    parts.push('lat:' + settings.coordinates.latitude);
    parts.push('lon:' + settings.coordinates.longitude);
  }
  if (settings.prayer) {
    parts.push('method:' + settings.prayer.calculationMethod);
    parts.push('school:' + settings.prayer.asrSchool);
    if (settings.prayer.adjustments) {
      parts.push('adj:' + JSON.stringify(settings.prayer.adjustments));
    }
  }
  return parts.join('|');
}

// ====================================================================
// TIMEZONE DETECTION
// ====================================================================

function shouldUseTiraneTimezone(settings) {
  if (!settings || !settings.coordinates) return false;
  if (settings.city !== 'Tiranë') return false;
  
  var lat = settings.coordinates.latitude;
  var lon = settings.coordinates.longitude;
  
  return Math.abs(lat - TIRANA_LAT) < COORD_TOLERANCE &&
         Math.abs(lon - TIRANA_LON) < COORD_TOLERANCE;
}

// ====================================================================
// SECTION BUILDERS
// ====================================================================

function buildGreeting(settings) {
  var section = document.createElement('div');
  section.className = 'home-greeting';

  var h1 = document.createElement('h1');
  h1.className = 'home-greeting__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Mirë se erdhe';

  var dateRow = document.createElement('div');
  dateRow.className = 'home-greeting__date';
  
  var dateText = document.createElement('span');
  dateText.textContent = formatAlbanianDate(new Date());
  dateRow.appendChild(dateText);

  if (settings && settings.city) {
    var separator = document.createElement('span');
    separator.textContent = ' · ';
    dateRow.appendChild(separator);
    
    dateRow.appendChild(createIcon('map-pin', 'icon--xs'));
    
    var cityText = document.createElement('span');
    cityText.textContent = ' ' + settings.city;
    dateRow.appendChild(cityText);
  } else {
    var missingText = document.createElement('span');
    missingText.className = 'home-greeting__location-missing';
    missingText.textContent = ' · Vendndodhja nuk është zgjedhur';
    dateRow.appendChild(missingText);
  }

  section.appendChild(h1);
  section.appendChild(dateRow);
  return section;
}

function buildPrayerHeroSkeleton() {
  var card = document.createElement('div');
  card.className = 'home-prayer-hero';
  card.setAttribute('data-prayer-hero', '');

  var meta = document.createElement('span');
  meta.className = 'home-prayer-hero__meta';
  meta.setAttribute('data-hero-meta', '');
  card.appendChild(meta);

  var name = document.createElement('span');
  name.className = 'home-prayer-hero__name';
  name.setAttribute('data-hero-name', '');
  card.appendChild(name);

  var time = document.createElement('span');
  time.className = 'home-prayer-hero__time';
  time.setAttribute('data-hero-time', '');
  card.appendChild(time);

  var countdown = document.createElement('span');
  countdown.className = 'home-prayer-hero__countdown';
  countdown.setAttribute('data-hero-countdown', '');
  card.appendChild(countdown);

  var support = document.createElement('span');
  support.className = 'home-prayer-hero__support';
  support.setAttribute('data-hero-support', '');
  card.appendChild(support);

  var logSummary = document.createElement('span');
  logSummary.className = 'home-prayer-hero__log-summary';
  logSummary.setAttribute('data-hero-log-summary', '');
  logSummary.setAttribute('title', 'Kjo tregon vetëm regjistrimet në Hayat, jo nëse namazi është falur apo jo.');
  card.appendChild(logSummary);

  var actions = document.createElement('div');
  actions.className = 'home-prayer-hero__actions';
  actions.setAttribute('data-hero-actions', '');
  card.appendChild(actions);

  return card;
}

function buildQuranCard(navigate) {
  var card = document.createElement('div');
  card.className = 'quran-continue';
  card.dataset.homeQuranContinue = '';
  card.hidden = true;
  var eyebrow = document.createElement('span');
  eyebrow.className = 'quran-continue__eyebrow';
  eyebrow.textContent = 'Vazhdo leximin';
  var surah = document.createElement('span');
  surah.className = 'quran-continue__surah';
  surah.dataset.homeQuranSurah = '';
  var position = document.createElement('span');
  position.className = 'quran-continue__position';
  position.dataset.homeQuranPosition = '';
  var actions = document.createElement('div');
  actions.className = 'quran-continue__actions';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary btn--sm';
  btn.dataset.homeQuranOpen = '';
  btn.append(createIcon('play', 'icon--sm'), document.createTextNode(' Vazhdo'));
  actions.appendChild(btn);
  card.append(eyebrow, surah, position, actions);
  return card;
}

function renderQuranContinue(card, reading, navigate) {
  if (!card) return;
  var metadata = reading ? getSurahMetadata(reading.surah) : null;
  if (!reading || !metadata) {
    card.hidden = true;
    return;
  }
  var surah = card.querySelector('[data-home-quran-surah]');
  var position = card.querySelector('[data-home-quran-position]');
  var oldButton = card.querySelector('[data-home-quran-open]');
  if (surah) surah.textContent = metadata.nameTransliteration;
  if (position) position.textContent = 'Ajeti ' + reading.ayah + (reading.page ? ' · Faqja ' + reading.page : '');
  if (oldButton) {
    var button = oldButton.cloneNode(true);
    button.addEventListener('click', function () {
      navigate('quran', { params: { surah: reading.surah, ayah: reading.ayah } });
    });
    oldButton.replaceWith(button);
  }
  card.hidden = false;
}

function isFridayDateKey(dateKey) {
  if (typeof dateKey !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  return new Date(dateKey + 'T00:00:00Z').getUTCDay() === 5;
}

function resolveDhikrSuggestion(prayerState, hours) {
  if (prayerState) {
    if (prayerState.currentPrayer === 'isha' || prayerState.nextPrayerIsTomorrow) return 'bedtime';
    if (prayerState.currentPrayer === 'asr' || prayerState.currentPrayer === 'maghrib' ||
        prayerState.nextPrayer === 'maghrib' || prayerState.nextPrayer === 'isha') return 'evening';
    if (prayerState.currentPrayer === 'fajr' || prayerState.nextPrayer === 'dhuhr') return 'morning';
    return null;
  }
  if (hours >= 21 || hours < 4) return 'bedtime';
  if (hours >= 16) return 'evening';
  if (hours >= 4 && hours < 12) return 'morning';
  return null;
}

function suggestionCard(options, navigate) {
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-suggestion-card card';
  button.setAttribute('aria-label', options.title + ', ' + options.actionLabel);
  if (options.routineId) button.dataset.homeDhikrRoutine = options.routineId;
  button.addEventListener('click', function () {
    navigate(options.route, { params: options.params });
  });
  var iconWrap = document.createElement('span');
  iconWrap.className = 'home-suggestion-card__icon';
  iconWrap.appendChild(createIcon(options.icon));
  var content = document.createElement('span');
  content.className = 'home-suggestion-card__content';
  var eyebrow = document.createElement('span');
  eyebrow.className = 'home-suggestion-card__eyebrow';
  eyebrow.textContent = options.eyebrow;
  var title = document.createElement('span');
  title.className = 'home-suggestion-card__title';
  title.textContent = options.title;
  var description = document.createElement('span');
  description.className = 'home-suggestion-card__description';
  description.textContent = options.description;
  content.append(eyebrow, title, description);
  var trailing = document.createElement('span');
  trailing.className = 'home-suggestion-card__trailing';
  trailing.appendChild(createIcon('chevron-right', 'icon--sm'));
  button.append(iconWrap, content, trailing);
  return button;
}

function renderSuggestedReadings(section, settings, navigate, prayerState, now, timeZone) {
  if (!section) return;
  var homeSettings = settings && settings.home ? settings.home : {
    showSuggestedReadings: true,
    showFridayAlKahf: true,
    showBedtimeQuranReadings: true
  };
  if (homeSettings.showSuggestedReadings === false) {
    section.replaceChildren();
    section.hidden = true;
    return;
  }

  var zoned = getZonedDateParts(now, timeZone);
  var hours = zoned ? zoned.hours : now.getHours();
  var dateKey = zoned ? zoned.dateKey : [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
  var routineId = resolveDhikrSuggestion(prayerState, hours);
  var cards = [];
  var routineLabels = {
    morning: 'Dhikri i mëngjesit',
    evening: 'Dhikri i mbrëmjes',
    bedtime: 'Dhikri para gjumit'
  };
  if (routineId) {
    cards.push(suggestionCard({
      eyebrow: 'Dhikri aktual',
      title: routineLabels[routineId],
      description: 'Hap rutinën dhe vazhdo aty ku e le',
      actionLabel: 'hap rutinën',
      icon: 'sparkles',
      route: 'dhikr',
      params: { routine: routineId },
      routineId: routineId
    }, navigate));
  }
  if (homeSettings.showFridayAlKahf !== false && isFridayDateKey(dateKey)) {
    cards.push(suggestionCard({
      eyebrow: 'Leximi i së premtes',
      title: 'Lexo suren El-Kehf',
      description: 'Sureja 18 · 110 ajete · Pa transliterim',
      actionLabel: 'hap në Kuran',
      icon: 'book-open',
      route: 'quran',
      params: { surah: 18, ayah: 1 }
    }, navigate));
  }
  if (routineId === 'bedtime' && homeSettings.showBedtimeQuranReadings !== false) {
    BEDTIME_QURAN_READINGS.forEach(function (reading) {
      cards.push(suggestionCard({
        eyebrow: 'Lexim para gjumit',
        title: reading.titleSq,
        description: reading.descriptionSq + ' · Pa transliterim',
        actionLabel: 'hap në Kuran',
        icon: 'book-open',
        route: 'quran',
        params: { surah: reading.surah, ayah: reading.ayah }
      }, navigate));
    });
  }

  if (!cards.length) {
    section.replaceChildren();
    section.hidden = true;
    return;
  }
  var header = document.createElement('div');
  header.className = 'home-suggestions__header';
  var title = document.createElement('h2');
  title.className = 'home-suggestions__title';
  title.textContent = 'Lexime të sugjeruara';
  var note = document.createElement('p');
  note.className = 'home-suggestions__note';
  note.textContent = 'Sipas ditës dhe kohës';
  header.append(title, note);
  var list = document.createElement('div');
  list.className = 'home-suggestions__list';
  cards.forEach(function (card) { list.appendChild(card); });
  section.replaceChildren(header, list);
  section.hidden = false;
}

function buildSuggestedReadings(settings, navigate) {
  var section = document.createElement('section');
  section.className = 'home-suggestions';
  section.dataset.homeSuggestions = '';
  section.hidden = true;
  renderSuggestedReadings(section, settings, navigate, null, new Date(), null);
  return section;
}

function formatArticleDate(value) {
  try {
    return new Intl.DateTimeFormat('sq-AL', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(value + 'T00:00:00Z'));
  } catch (error) {
    return value;
  }
}

function articleCard(meta, navigate) {
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-article-card';
  button.setAttribute('aria-label', 'Lexo artikullin: ' + meta.titleSq);
  button.addEventListener('click', function () {
    navigate('home', { params: { article: meta.id } });
  });
  var image = document.createElement('img');
  image.className = 'home-article-card__image';
  image.src = meta.imageUrl;
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  getCachedArticleImageUrl(meta).then(function (objectUrl) {
    if (!objectUrl) return;
    image.src = objectUrl;
    image.dataset.articleObjectUrl = objectUrl;
  });
  var overlay = document.createElement('span');
  overlay.className = 'home-article-card__overlay';
  var category = document.createElement('span');
  category.className = 'home-article-card__category';
  category.textContent = meta.categorySq;
  var title = document.createElement('span');
  title.className = 'home-article-card__title';
  title.textContent = meta.titleSq;
  var byline = document.createElement('span');
  byline.className = 'home-article-card__byline';
  byline.textContent = meta.authorSq + ' · ' + meta.readingMinutes + ' min';
  overlay.append(category, title, byline);
  button.append(image, overlay);
  return button;
}

function revokeArticleImageUrls(host) {
  if (!host || typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') return;
  host.querySelectorAll('[data-article-object-url]').forEach(function (image) {
    URL.revokeObjectURL(image.dataset.articleObjectUrl);
  });
}

function renderArticlesSection(host, manifest, navigate) {
  revokeArticleImageUrls(host);
  if (!host || !manifest || !manifest.articles.length) {
    if (host) {
      host.replaceChildren();
      host.hidden = true;
    }
    return;
  }
  var header = document.createElement('div');
  header.className = 'home-articles__header';
  var title = document.createElement('h2');
  title.className = 'home-articles__title';
  title.textContent = 'Artikuj të ndryshëm';
  var note = document.createElement('p');
  note.className = 'home-articles__note';
  note.textContent = 'Përzgjedhje për lexim';
  header.append(title, note);
  var list = document.createElement('div');
  list.className = 'home-articles__list';
  manifest.articles.forEach(function (meta) { list.appendChild(articleCard(meta, navigate)); });
  host.replaceChildren(header, list);
  host.hidden = false;
}

function renderArticleShell(page, articleId) {
  page.classList.add('article-reader-page');
  page.dataset.articleReader = articleId;
  var top = document.createElement('header');
  top.className = 'article-reader__top';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'btn btn--icon btn--ghost';
  back.dataset.articleBack = '';
  back.setAttribute('aria-label', 'Kthehu te Kryefaqja');
  back.appendChild(createIcon('chevron-left'));
  var label = document.createElement('span');
  label.className = 'route-page__eyebrow';
  label.textContent = 'Artikull';
  top.append(back, label);
  var content = document.createElement('main');
  content.className = 'article-reader__content';
  content.dataset.articleContent = '';
  var loading = document.createElement('div');
  loading.className = 'app__loading';
  loading.setAttribute('role', 'status');
  loading.textContent = 'Duke ngarkuar artikullin...';
  content.appendChild(loading);
  page.append(top, content);
}

function articleBlockElement(block) {
  if (block.type === 'list') {
    var list = document.createElement('ul');
    list.className = 'article-reader__list';
    block.items.forEach(function (text) {
      var item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
    });
    return list;
  }
  var tag = block.type === 'heading2' ? 'h2'
    : (block.type === 'heading3' ? 'h3' : (block.type === 'quote' ? 'blockquote' : 'p'));
  var element = document.createElement(tag);
  element.className = 'article-reader__' + block.type;
  element.textContent = block.text;
  return element;
}

function mountArticleReader(page, context, appContext) {
  var mounted = true;
  var controller = new AbortController();
  var content = page.querySelector('[data-article-content]');
  var back = page.querySelector('[data-article-back]');
  var articleId = context.params.article;
  var currentMeta = null;
  var offline = false;

  function backHandler() { appContext.navigate('home'); }
  back.addEventListener('click', backHandler);

  function showError() {
    if (!mounted) return;
    content.replaceChildren();
    var box = document.createElement('div');
    box.className = 'article-reader__error';
    box.setAttribute('role', 'alert');
    var message = document.createElement('p');
    message.textContent = 'Artikulli nuk u ngarkua.';
    var retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'btn btn--primary';
    retry.textContent = 'Provo përsëri';
    retry.addEventListener('click', load);
    box.append(message, retry);
    content.appendChild(box);
  }

  function renderArticle(article) {
    content.replaceChildren();
    var header = document.createElement('header');
    header.className = 'article-reader__header';
    var category = document.createElement('span');
    category.className = 'route-page__eyebrow';
    category.textContent = currentMeta.categorySq;
    var title = document.createElement('h1');
    title.className = 'article-reader__title';
    title.dataset.routeHeading = '';
    title.textContent = article.titleSq;
    var meta = document.createElement('p');
    meta.className = 'article-reader__meta';
    meta.textContent = article.authorSq + ' · ' + formatArticleDate(article.publishedAt) +
      ' · ' + currentMeta.readingMinutes + ' min';
    var offlineButton = document.createElement('button');
    offlineButton.type = 'button';
    offlineButton.className = 'btn btn--outline btn--sm';
    function updateOfflineButton() {
      offlineButton.replaceChildren(
        createIcon(offline ? 'trash' : 'bookmark', 'icon--sm'),
        document.createTextNode(offline ? ' Hiq nga pajisja' : ' Ruaj offline')
      );
    }
    updateOfflineButton();
    offlineButton.addEventListener('click', function () {
      offlineButton.disabled = true;
      var operation = offline ? removeArticleOffline(currentMeta) : saveArticleOffline(currentMeta);
      operation.then(function () {
        if (!mounted) return;
        offline = !offline;
        updateOfflineButton();
      }).catch(function () {}).finally(function () {
        if (mounted) offlineButton.disabled = false;
      });
    });
    header.append(category, title, meta, offlineButton);
    var body = document.createElement('article');
    body.className = 'article-reader__body';
    article.blocks.forEach(function (block) { body.appendChild(articleBlockElement(block)); });
    content.append(header, body);
  }

  function load() {
    getArticlesManifest({ signal: controller.signal }).then(function (manifest) {
      currentMeta = manifest.articles.find(function (meta) { return meta.id === articleId; });
      if (!currentMeta) throw new ArticleError('Article not found', 'NOT_FOUND');
      return Promise.all([
        getArticle(currentMeta, { signal: controller.signal, preferCache: !navigator.onLine }),
        isArticleOffline(currentMeta)
      ]);
    }).then(function (result) {
      if (!mounted) return;
      offline = result[1];
      renderArticle(result[0]);
    }).catch(function (error) {
      if (error && error.code === 'ABORTED') return;
      showError();
    });
  }

  load();
  return function () {
    mounted = false;
    controller.abort();
    back.removeEventListener('click', backHandler);
  };
}

// ====================================================================
// RENDER
// ====================================================================

export function render(context, appContext) {
  var navigate = appContext.navigate;
  var store = appContext.store;
  var settings = store.get('settings');

  var page = document.createElement('div');
  page.className = 'route-page home-page';
  if (context.params && context.params.article !== undefined) {
    renderArticleShell(page, context.params.article);
    return page;
  }

  page.appendChild(buildGreeting(settings));

  var grid = document.createElement('div');
  grid.className = 'home-grid';

  grid.appendChild(buildPrayerHeroSkeleton());
  grid.appendChild(buildSuggestedReadings(settings, navigate));
  grid.appendChild(buildQuranCard(navigate));

  var articlesHost = document.createElement('section');
  articlesHost.className = 'home-articles-host';
  articlesHost.dataset.homeArticles = '';
  articlesHost.hidden = true;
  grid.appendChild(articlesHost);

  page.appendChild(grid);

  return page;
}

// ====================================================================
// MOUNT
// ====================================================================

export function mount(pageElement, context, appContext) {
  if (pageElement.matches('[data-article-reader]')) {
    return mountArticleReader(pageElement, context, appContext);
  }
  var navigate = appContext.navigate;
  var store = appContext.store;
  
  var abortController = null;
  var articleController = new AbortController();
  var timerInterval = null;
  var settingsUnsubscribe = null;
  var lastFingerprint = '';
  var todayResult = null;
  var tomorrowResult = null;
  var logCount = null;
  var isMounted = true;
  var lastHeroSignature = null;

  var heroElement = pageElement.querySelector('[data-prayer-hero]');
  var greetingElement = pageElement.querySelector('.home-greeting');
  var suggestionsElement = pageElement.querySelector('[data-home-suggestions]');
  var articlesElement = pageElement.querySelector('[data-home-articles]');
  var quranContinueElement = pageElement.querySelector('[data-home-quran-continue]');

  function updateSuggestions(prayerState) {
    var currentSettings = store.get('settings');
    var timeZone = todayResult ? todayResult.timezone : null;
    renderSuggestedReadings(
      suggestionsElement,
      currentSettings,
      navigate,
      prayerState || null,
      new Date(),
      timeZone
    );
    var routineCard = suggestionsElement && suggestionsElement.querySelector('[data-home-dhikr-routine]');
    if (routineCard) {
      var routineId = routineCard.dataset.homeDhikrRoutine;
      var zoned = getZonedDateParts(new Date(), timeZone);
      var dateKey = zoned ? zoned.dateKey : new Date().toISOString().slice(0, 10);
      getDailyDhikrSession(dateKey, routineId).then(function (session) {
        if (!isMounted || !routineCard.isConnected) return;
        var description = routineCard.querySelector('.home-suggestion-card__description');
        if (!description) return;
        description.textContent = !session ? 'I pa filluar' :
          (session.status === DAILY_DHIKR_SESSION_STATUS.COMPLETED ? 'U krye' : 'Në vazhdim · vazhdo aty ku e le');
      }).catch(function () {});
    }
  }

  function loadQuranContinue() {
    getLastReadPosition().then(function (reading) {
      if (isMounted) renderQuranContinue(quranContinueElement, reading, navigate);
    }).catch(function () {
      if (isMounted && quranContinueElement) quranContinueElement.hidden = true;
    });
  }

  function loadArticles() {
    var currentSettings = store.get('settings') || {};
    if (currentSettings.home && currentSettings.home.showArticles === false) {
      renderArticlesSection(articlesElement, null, navigate);
      return;
    }
    getArticlesManifest({ signal: articleController.signal }).then(function (manifest) {
      if (isMounted) renderArticlesSection(articlesElement, manifest, navigate);
    }).catch(function (error) {
      if (!error || error.code !== 'ABORTED') renderArticlesSection(articlesElement, null, navigate);
    });
  }

  // ---------------------------------------------------------------
  // HERO STATE UPDATERS
  // ---------------------------------------------------------------

  function setHeroNoLocation() {
    if (!heroElement || !isMounted) return;
    lastHeroSignature = null;
    
    heroElement.classList.add('home-prayer-hero--no-location');
    
    var meta = heroElement.querySelector('[data-hero-meta]');
    var name = heroElement.querySelector('[data-hero-name]');
    var time = heroElement.querySelector('[data-hero-time]');
    var countdown = heroElement.querySelector('[data-hero-countdown]');
    var support = heroElement.querySelector('[data-hero-support]');
    var logSummary = heroElement.querySelector('[data-hero-log-summary]');
    var actions = heroElement.querySelector('[data-hero-actions]');

    if (meta) meta.textContent = 'Oraret e namazit';
    if (name) name.textContent = 'Zgjidh vendndodhjen';
    if (time) time.textContent = '';
    if (countdown) countdown.textContent = '';
    if (support) support.textContent = 'Vendndodhja nevojitet për oraret e sakta.';
    if (logSummary) logSummary.textContent = '';
    
    if (actions) {
      actions.replaceChildren();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--primary btn--sm';
      btn.textContent = 'Konfiguro te Namazi';
      btn.addEventListener('click', function () {
        navigate('prayer');
      });
      actions.appendChild(btn);
    }
  }

  function setHeroLoading() {
    if (!heroElement || !isMounted) return;
    lastHeroSignature = null;
    
    heroElement.classList.remove('home-prayer-hero--no-location', 'home-prayer-hero--error');
    heroElement.classList.add('home-prayer-hero--loading');
    heroElement.setAttribute('role', 'status');
    
    var meta = heroElement.querySelector('[data-hero-meta]');
    var name = heroElement.querySelector('[data-hero-name]');
    var time = heroElement.querySelector('[data-hero-time]');
    var countdown = heroElement.querySelector('[data-hero-countdown]');
    var support = heroElement.querySelector('[data-hero-support]');
    var logSummary = heroElement.querySelector('[data-hero-log-summary]');
    var actions = heroElement.querySelector('[data-hero-actions]');

    if (meta) meta.textContent = '';
    if (name) name.textContent = '';
    if (time) time.textContent = '';
    if (countdown) countdown.textContent = '';
    if (support) support.textContent = '';
    if (logSummary) logSummary.textContent = '';
    
    if (actions) {
      actions.replaceChildren();
      var loading = document.createElement('div');
      loading.className = 'home-prayer-hero__loading';
      loading.textContent = 'Duke ngarkuar oraret...';
      actions.appendChild(loading);
    }
  }

  function setHeroError() {
    if (!heroElement || !isMounted) return;
    lastHeroSignature = null;
    
    heroElement.classList.remove('home-prayer-hero--loading', 'home-prayer-hero--no-location');
    heroElement.classList.add('home-prayer-hero--error');
    heroElement.setAttribute('role', 'status');
    
    var meta = heroElement.querySelector('[data-hero-meta]');
    var name = heroElement.querySelector('[data-hero-name]');
    var time = heroElement.querySelector('[data-hero-time]');
    var countdown = heroElement.querySelector('[data-hero-countdown]');
    var support = heroElement.querySelector('[data-hero-support]');
    var logSummary = heroElement.querySelector('[data-hero-log-summary]');
    var actions = heroElement.querySelector('[data-hero-actions]');

    if (meta) meta.textContent = '';
    if (name) name.textContent = '';
    if (time) time.textContent = '';
    if (countdown) countdown.textContent = '';
    if (support) support.textContent = '';
    if (logSummary) logSummary.textContent = '';
    
    if (actions) {
      actions.replaceChildren();
      
      var errorDiv = document.createElement('div');
      errorDiv.className = 'home-prayer-hero__error';
      errorDiv.textContent = 'Oraret nuk u ngarkuan.';
      actions.appendChild(errorDiv);
      
      var errorActions = document.createElement('div');
      errorActions.className = 'home-prayer-hero__error-actions';
      
      var retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'btn btn--primary btn--sm';
      retryBtn.textContent = 'Provo përsëri';
      retryBtn.addEventListener('click', function () {
        loadPrayerData();
      });
      
      var prayerBtn = document.createElement('button');
      prayerBtn.type = 'button';
      prayerBtn.className = 'btn btn--ghost btn--sm';
      prayerBtn.textContent = 'Hap Namazin';
      prayerBtn.addEventListener('click', function () {
        navigate('prayer');
      });
      
      errorActions.appendChild(retryBtn);
      errorActions.appendChild(prayerBtn);
      actions.appendChild(errorActions);
    }
  }

  function setHeroSuccess(state) {
    if (!heroElement || !isMounted) return;
    
    heroElement.classList.remove('home-prayer-hero--loading', 'home-prayer-hero--error', 'home-prayer-hero--no-location');
    heroElement.removeAttribute('role');
    
    var meta = heroElement.querySelector('[data-hero-meta]');
    var name = heroElement.querySelector('[data-hero-name]');
    var time = heroElement.querySelector('[data-hero-time]');
    var countdown = heroElement.querySelector('[data-hero-countdown]');
    var support = heroElement.querySelector('[data-hero-support]');
    var logSummary = heroElement.querySelector('[data-hero-log-summary]');
    var actions = heroElement.querySelector('[data-hero-actions]');

    if (!state) return;

    if (state.currentPrayer) {
      // Current prayer exists
      if (meta) meta.textContent = 'Koha aktuale';
      if (name) name.textContent = PRAYER_LABELS_SQ[state.currentPrayer];
      if (time) time.textContent = todayResult.timings[state.currentPrayer];
      
      if (countdown && state.durationToCurrentEnd) {
        countdown.textContent = state.durationToCurrentEnd.clock;
        countdown.setAttribute('aria-label', 'Koha e mbetur: ' + state.durationToCurrentEnd.compact);
      } else if (countdown && state.duration) {
        countdown.textContent = state.duration.clock;
        countdown.setAttribute('aria-label', 'Koha e mbetur: ' + state.duration.compact);
      }
      
      if (support) {
        var supportText = '';
        if (state.currentEndsAt && state.nextPrayerAt && state.currentEndsAt !== state.nextPrayerAt) {
          supportText = 'Koha përfundon në ' + state.currentEndsAt + '. ';
        }
        if (state.nextPrayer) {
          supportText += 'Namazi i ardhshëm: ' + PRAYER_LABELS_SQ[state.nextPrayer] + ' në ' + state.nextPrayerAt;
        }
        support.textContent = supportText;
      }
    } else {
      // Between prayers
      if (meta) meta.textContent = 'Namazi i ardhshëm';
      if (name) name.textContent = PRAYER_LABELS_SQ[state.nextPrayer];
      if (time) time.textContent = state.nextPrayerAt;
      
      if (countdown && state.duration) {
        countdown.textContent = state.duration.clock;
        countdown.setAttribute('aria-label', 'Koha e mbetur: ' + state.duration.compact);
      }
      
      if (support) support.textContent = '';
    }
    
    if (logSummary) {
      if (Number.isInteger(logCount)) {
        logSummary.textContent = logCount + ' nga 5 të regjistruara në Hayat';
      } else {
        logSummary.textContent = '';
      }
    }
    
    if (actions) {
      actions.replaceChildren();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--ghost btn--sm';
      btn.textContent = 'Hap Namazin';
      btn.addEventListener('click', function () {
        navigate('prayer');
      });
      actions.appendChild(btn);
      
      if (todayResult && todayResult.source === 'cache') {
        var cacheBadge = document.createElement('span');
        cacheBadge.className = 'badge badge--neutral';
        cacheBadge.textContent = 'Cache';
        actions.appendChild(cacheBadge);
      }
    }
  }

  function setHeroAfterIshaNoTomorrow() {
    if (!heroElement || !isMounted) return;
    
    heroElement.classList.remove('home-prayer-hero--loading', 'home-prayer-hero--error', 'home-prayer-hero--no-location');
    heroElement.removeAttribute('role');
    
    var meta = heroElement.querySelector('[data-hero-meta]');
    var name = heroElement.querySelector('[data-hero-name]');
    var time = heroElement.querySelector('[data-hero-time]');
    var countdown = heroElement.querySelector('[data-hero-countdown]');
    var support = heroElement.querySelector('[data-hero-support]');
    var logSummary = heroElement.querySelector('[data-hero-log-summary]');
    var actions = heroElement.querySelector('[data-hero-actions]');

    if (meta) meta.textContent = 'Namazi i ardhshëm';
    if (name) name.textContent = 'Sabahu';
    if (time) time.textContent = '';
    if (countdown) countdown.textContent = '';
    if (support) support.textContent = 'Sabahu i nesërm nuk është ngarkuar ende.';
    
    if (logSummary) {
      if (Number.isInteger(logCount)) {
        logSummary.textContent = logCount + ' nga 5 të regjistruara në Hayat';
      } else {
        logSummary.textContent = '';
      }
    }
    
    if (actions) {
      actions.replaceChildren();
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--ghost btn--sm';
      btn.textContent = 'Hap Namazin';
      btn.addEventListener('click', function () {
        navigate('prayer');
      });
      actions.appendChild(btn);
    }
  }

  // ---------------------------------------------------------------
  // PRAYER DATA LOADING
  // ---------------------------------------------------------------

  function loadPrayerData() {
    stopTimer();
    lastHeroSignature = null;
    var settings = store.get('settings');
    
    if (!settings || !settings.coordinates) {
      setHeroNoLocation();
      updateSuggestions(null);
      return;
    }

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    setHeroLoading();

    var options = {
      latitude: settings.coordinates.latitude,
      longitude: settings.coordinates.longitude,
      calculationMethod: settings.prayer.calculationMethod,
      asrSchool: settings.prayer.asrSchool,
      adjustments: settings.prayer.adjustments,
      forceRefresh: false,
      signal: abortController.signal
    };

    if (shouldUseTiraneTimezone(settings)) {
      options.timeZone = 'Europe/Tirane';
    }

    getTodayAndTomorrowPrayerTimes(options)
      .then(function (results) {
        if (!isMounted) return;
        
        todayResult = results.today;
        tomorrowResult = results.tomorrow;
        
        loadPrayerLogs();
        updatePrayerHero();
        startTimer();
      })
      .catch(function (err) {
        if (!isMounted) return;
        
        if (err.name === 'AbortError' || (err instanceof PrayerTimesError && err.code === 'ABORTED')) {
          return;
        }
        
        console.error('Failed to load prayer times:', err);
        setHeroError();
        updateSuggestions(null);
      });
  }

  function loadPrayerLogs() {
    if (!todayResult) return;
    var requestedDateKey = todayResult.dateKey;
    logCount = null;
    getPrayerLogsForDate(requestedDateKey)
      .then(function (logs) {
        if (!isMounted || !todayResult || todayResult.dateKey !== requestedDateKey) return;
        logCount = logs.length;
        lastHeroSignature = null;
        updatePrayerHero();
      })
      .catch(function (error) {
        if (!isMounted || !todayResult || todayResult.dateKey !== requestedDateKey) return;
        console.warn('[Hayat Home] Prayer log count unavailable:', error);
        logCount = null;
        lastHeroSignature = null;
        updatePrayerHero();
      });
  }

  // ---------------------------------------------------------------
  // HERO UPDATE
  // ---------------------------------------------------------------

  function updatePrayerHero(force) {
    if (!todayResult || !isMounted) return;
    var state = getPrayerState(todayResult, new Date(), tomorrowResult);
    if (!state) {
      setHeroError();
      return;
    }

    var signature = [
      state.currentPrayer || '',
      state.nextPrayer || '',
      state.currentEndsAt || '',
      state.nextPrayerAt || '',
      state.nextPrayerIsTomorrow ? 'tomorrow' : 'today',
      tomorrowResult ? 'has-tomorrow' : 'no-tomorrow',
      todayResult.source,
      Number.isInteger(logCount) ? logCount : 'no-log-count'
    ].join('|');

    if (!force && signature === lastHeroSignature) {
      var countdown = heroElement.querySelector('[data-hero-countdown]');
      var duration = state.currentPrayer && state.durationToCurrentEnd
        ? state.durationToCurrentEnd
        : state.duration;
      if (countdown) countdown.textContent = duration ? duration.clock : '';
      return;
    }

    lastHeroSignature = signature;
    updateSuggestions(state);
    if (state.nextPrayerIsTomorrow && !tomorrowResult) setHeroAfterIshaNoTomorrow();
    else setHeroSuccess(state);
  }

  // ---------------------------------------------------------------
  // TIMER
  // ---------------------------------------------------------------

  function updateCountdown() {
    if (!todayResult || document.hidden || !isMounted) return false;

    var now = new Date();
    var zonedNow = getZonedDateParts(now, todayResult.timezone);

    if (zonedNow && zonedNow.dateKey !== todayResult.dateKey) {
      loadPrayerData();
      return false;
    }

    updatePrayerHero(false);
    return true;
  }

  function startTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (document.hidden || !todayResult) return;
    timerInterval = setInterval(updateCountdown, 1000);
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
    if (!isMounted) return;
    
    if (document.hidden) {
      stopTimer();
    } else if (updateCountdown() !== false) {
      startTimer();
    }
  }

  // ---------------------------------------------------------------
  // SETTINGS CHANGES
  // ---------------------------------------------------------------

  function handleSettingsChange(newSettings, oldSettings) {
    if (!isMounted) return;
    
    var newFingerprint = getPrayerSettingsFingerprint(newSettings);

    if (greetingElement) {
      var newGreeting = buildGreeting(newSettings);
      greetingElement.replaceWith(newGreeting);
      greetingElement = newGreeting;
    }

    if (newFingerprint === lastFingerprint) {
      updateSuggestions(todayResult ? getPrayerState(todayResult, new Date(), tomorrowResult) : null);
      loadArticles();
      return;
    }
    lastFingerprint = newFingerprint;
    loadPrayerData();
    loadArticles();
  }

  // ---------------------------------------------------------------
  // INIT
  // ---------------------------------------------------------------

  var settings = store.get('settings');
  lastFingerprint = getPrayerSettingsFingerprint(settings);

  loadPrayerData();
  loadQuranContinue();
  loadArticles();

  document.addEventListener('visibilitychange', handleVisibility);

  settingsUnsubscribe = store.subscribeTo('settings', handleSettingsChange);

  // ---------------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------------

  return function () {
    isMounted = false;
    stopTimer();
    
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    articleController.abort();
    revokeArticleImageUrls(articlesElement);
    
    if (settingsUnsubscribe) {
      settingsUnsubscribe();
      settingsUnsubscribe = null;
    }
    
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}
