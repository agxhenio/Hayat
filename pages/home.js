/**
 * Hayat — Home Page
 *
 * Renders the Home route with four priority cards:
 * 1. Prayer hero
 * 2. Per ty tani (contextual planning)
 * 3. Quran continue
 * 4. Dhikr routine
 *
 * All data is static mock. No real prayer calculations or Quran content.
 *
 * @module pages/home
 */

// ====================================================================
// ICON HELPER
// ====================================================================

/**
 * Create an SVG icon element referencing the shared sprite.
 *
 * @param {string} name - The icon name (without 'icon-' prefix).
 * @param {string} [sizeClass] - Optional size class (e.g. 'icon--sm').
 * @returns {SVGElement}
 */
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
// SECTION BUILDERS
// ====================================================================

/**
 * Build the greeting section with title, date and location.
 *
 * @returns {HTMLElement}
 */
function buildGreeting() {
  var section = document.createElement('div');
  section.className = 'home-greeting';

  var h1 = document.createElement('h1');
  h1.className = 'home-greeting__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Mirë se erdhe';

  var dateRow = document.createElement('span');
  dateRow.className = 'home-greeting__date';
  dateRow.appendChild(createIcon('map-pin', 'icon--xs'));

  var dateText = document.createElement('span');
  dateText.textContent = 'E mërkurë, 15 korrik 2026 · Tiranë';
  dateRow.appendChild(dateText);

  section.appendChild(h1);
  section.appendChild(dateRow);
  return section;
}

/**
 * Build the prayer hero card.
 *
 * @param {Function} navigate - Navigation function from appContext.
 * @returns {HTMLElement}
 */
function buildPrayerHero(navigate) {
  var card = document.createElement('div');
  card.className = 'home-prayer-hero';

  var meta = document.createElement('span');
  meta.className = 'home-prayer-hero__meta';
  meta.textContent = 'Namazi i radhës';

  var name = document.createElement('span');
  name.className = 'home-prayer-hero__name';
  name.textContent = 'Dreka';

  var time = document.createElement('span');
  time.className = 'home-prayer-hero__time';
  time.textContent = '12:47';

  var next = document.createElement('span');
  next.className = 'home-prayer-hero__next';
  next.appendChild(createIcon('clock', 'icon--sm'));
  var nextText = document.createElement('span');
  nextText.textContent = 'Ikindia në 16:50';
  next.appendChild(nextText);

  var actions = document.createElement('div');
  actions.className = 'home-prayer-hero__actions';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary btn--sm';
  btn.textContent = 'Hap Namazin';
  btn.addEventListener('click', function () {
    navigate('prayer');
  });
  actions.appendChild(btn);

  card.appendChild(meta);
  card.appendChild(name);
  card.appendChild(time);
  card.appendChild(next);
  card.appendChild(actions);

  return card;
}

/**
 * Build the "Per ty tani" contextual planning card.
 *
 * @returns {HTMLElement}
 */
function buildNowCard() {
  var card = document.createElement('div');
  card.className = 'card card--elevated';

  var body = document.createElement('div');
  body.className = 'card__body';

  var nowSection = document.createElement('div');
  nowSection.className = 'home-now';

  var title = document.createElement('p');
  title.className = 'home-now__title';
  title.textContent = 'Për ty tani';

  var list = document.createElement('div');
  list.className = 'home-now__list';

  // Appointment alert
  var alert = document.createElement('div');
  alert.className = 'alert alert--warning';
  alert.setAttribute('role', 'status');

  var alertIcon = createIcon('alert-circle');
  alertIcon.classList.add('alert__icon');

  var alertContent = document.createElement('div');
  alertContent.className = 'alert__content';

  var alertMsg = document.createElement('p');
  alertMsg.className = 'alert__message';
  alertMsg.textContent = 'Takimi është afër hyrjes së Ikindisë. Planifiko paraprakisht kohën dhe vendin e namazit.';

  alertContent.appendChild(alertMsg);
  alert.appendChild(alertIcon);
  alert.appendChild(alertContent);

  // Appointment detail
  var detail = document.createElement('div');
  detail.className = 'cluster';
  detail.appendChild(createIcon('calendar', 'icon--sm'));
  var detailText = document.createElement('small');
  detailText.textContent = 'Dentist 17:00';
  detail.appendChild(detailText);

  list.appendChild(alert);
  list.appendChild(detail);

  nowSection.appendChild(title);
  nowSection.appendChild(list);

  body.appendChild(nowSection);
  card.appendChild(body);

  return card;
}

/**
 * Build the Quran continue card.
 *
 * @param {Function} navigate - Navigation function from appContext.
 * @returns {HTMLElement}
 */
function buildQuranCard(navigate) {
  var card = document.createElement('div');
  card.className = 'quran-continue';

  var eyebrow = document.createElement('span');
  eyebrow.className = 'quran-continue__eyebrow';
  eyebrow.textContent = 'Vazhdo leximin';

  var surah = document.createElement('span');
  surah.className = 'quran-continue__surah';
  surah.textContent = 'El-Bekare';

  var position = document.createElement('span');
  position.className = 'quran-continue__position';
  position.textContent = 'Ajeti 153 · Faqja 23';

  var actions = document.createElement('div');
  actions.className = 'quran-continue__actions';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary btn--sm';
  btn.appendChild(createIcon('play', 'icon--sm'));
  var btnText = document.createTextNode(' Vazhdo');
  btn.appendChild(btnText);
  btn.addEventListener('click', function () {
    navigate('quran', { params: { surah: '2', ayah: '153' } });
  });

  actions.appendChild(btn);

  card.appendChild(eyebrow);
  card.appendChild(surah);
  card.appendChild(position);
  card.appendChild(actions);

  return card;
}

/**
 * Build the Dhikr routine card.
 *
 * @param {Function} navigate - Navigation function from appContext.
 * @returns {HTMLElement}
 */
function buildDhikrCard(navigate) {
  var card = document.createElement('div');
  card.className = 'card';

  var body = document.createElement('div');
  body.className = 'card__body';

  var titleRow = document.createElement('div');
  titleRow.className = 'cluster';
  titleRow.appendChild(createIcon('sparkles'));
  var title = document.createElement('span');
  title.className = 'card__title';
  title.textContent = 'Dhikri i mbrëmjes';
  titleRow.appendChild(title);

  var statusRow = document.createElement('div');
  statusRow.className = 'cluster home-dhikr-status';

  var chip = document.createElement('span');
  chip.className = 'status-chip status-chip--not-started';
  chip.textContent = 'I pa filluar';
  statusRow.appendChild(chip);

  var actionRow = document.createElement('div');
  actionRow.className = 'card__actions';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--outline btn--sm';
  btn.textContent = 'Hap Dhikrin';
  btn.addEventListener('click', function () {
    navigate('dhikr');
  });
  actionRow.appendChild(btn);

  body.appendChild(titleRow);
  body.appendChild(statusRow);
  body.appendChild(actionRow);
  card.appendChild(body);

  return card;
}

// ====================================================================
// RENDER
// ====================================================================

/**
 * Render the Home page.
 *
 * @param {Object} context - Route context from the router.
 * @param {Object} appContext - Application context with store, events, etc.
 * @returns {HTMLElement} The page element.
 */
export function render(context, appContext) {
  var navigate = appContext.navigate;

  var page = document.createElement('div');
  page.className = 'route-page home-page';

  // Greeting
  page.appendChild(buildGreeting());

  // Grid of priority cards
  var grid = document.createElement('div');
  grid.className = 'home-grid';

  grid.appendChild(buildPrayerHero(navigate));
  grid.appendChild(buildNowCard());
  grid.appendChild(buildQuranCard(navigate));
  grid.appendChild(buildDhikrCard(navigate));

  page.appendChild(grid);

  return page;
}
