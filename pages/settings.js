/**
 * Hayat — Settings Page
 *
 * Shows a real dark/light theme control. Other settings are placeholders.
 *
 * Theme control:
 * - Calls settingsStorage.patchSettings({ theme })
 * - Updates store path 'settings'
 * - Sets document.documentElement.dataset.theme
 * - Emits EVENTS.SETTINGS_CHANGED and EVENTS.THEME_CHANGED
 *
 * @module pages/settings
 */

import { APP_SOURCES, APP_PRIVACY_DISCLOSURES } from '../js/data/app-sources.js';

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
// THEME CONTROL BUILDER
// ====================================================================

/**
 * Build the theme switch control.
 *
 * @param {Object} appContext - Application context.
 * @returns {HTMLElement}
 */
function buildThemeControl(appContext) {
  var store = appContext.store;
  var events = appContext.events;
  var settingsStorage = appContext.settingsStorage;

  var currentSettings = store.get('settings');
  var currentTheme = (currentSettings && currentSettings.theme) || 'dark';

  var container = document.createElement('div');
  container.className = 'settings-theme-control';

  // Info side
  var info = document.createElement('div');
  info.className = 'settings-theme-control__info';

  var title = document.createElement('span');
  title.className = 'settings-theme-control__title';
  title.textContent = 'Tema e errët';

  var description = document.createElement('span');
  description.className = 'settings-theme-control__description';
  description.textContent = currentTheme === 'dark'
    ? 'Aktivizuar — pamja e errët'
    : 'E çaktivizuar — pamja e çelët';

  info.appendChild(title);
  info.appendChild(description);

  // Switch control
  var switchLabel = document.createElement('label');
  switchLabel.className = 'switch';

  var switchInput = document.createElement('input');
  switchInput.type = 'checkbox';
  switchInput.className = 'switch__input';
  switchInput.checked = currentTheme === 'dark';
  switchInput.setAttribute('aria-label', 'Aktivizo temën e errët');

  var switchTrack = document.createElement('span');
  switchTrack.className = 'switch__track';
  var switchThumb = document.createElement('span');
  switchThumb.className = 'switch__thumb';
  switchTrack.appendChild(switchThumb);

  var srOnly = document.createElement('span');
  srOnly.className = 'sr-only';
  srOnly.textContent = 'Ndrysho temën';

  switchLabel.appendChild(switchInput);
  switchLabel.appendChild(switchTrack);
  switchLabel.appendChild(srOnly);

  // Handle toggle
  switchInput.addEventListener('change', function () {
    var nextTheme = switchInput.checked ? 'dark' : 'light';

    // Update document theme immediately
    document.documentElement.dataset.theme = nextTheme;

    // Update description text
    description.textContent = nextTheme === 'dark'
      ? 'Aktivizuar — pamja e errët'
      : 'E çaktivizuar — pamja e çelët';

    // Persist via settings storage
    try {
      var saved = settingsStorage.patchSettings({ theme: nextTheme });

      // Update store with full validated settings
      store.set('settings', saved, { source: 'settings-page' });

      // Emit events
      events.emit(events.EVENTS.SETTINGS_CHANGED, {
        key: 'theme',
        value: nextTheme,
        settings: saved
      });
      events.emit(events.EVENTS.THEME_CHANGED, { theme: nextTheme });
    } catch (err) {
      console.error('[Hayat Settings] Failed to save theme:', err);
      // Revert UI if save fails
      switchInput.checked = currentTheme === 'dark';
      document.documentElement.dataset.theme = currentTheme;
    }
  });

  container.appendChild(info);
  container.appendChild(switchLabel);

  return container;
}

// ====================================================================
// HOME CONTROLS
// ====================================================================

function buildHomeSwitch(appContext, key, titleText, descriptionText) {
  var currentSettings = appContext.store.get('settings') || {};
  var currentHome = currentSettings.home || {};
  var container = document.createElement('div');
  container.className = 'settings-theme-control settings-home-control';

  var info = document.createElement('div');
  info.className = 'settings-theme-control__info';
  var title = document.createElement('span');
  title.className = 'settings-theme-control__title';
  title.textContent = titleText;
  var description = document.createElement('span');
  description.className = 'settings-theme-control__description';
  description.textContent = descriptionText;
  info.append(title, description);

  var switchLabel = document.createElement('label');
  switchLabel.className = 'switch';
  var input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'switch__input';
  input.checked = currentHome[key] !== false;
  input.setAttribute('aria-label', titleText);
  var track = document.createElement('span');
  track.className = 'switch__track';
  var thumb = document.createElement('span');
  thumb.className = 'switch__thumb';
  track.appendChild(thumb);
  switchLabel.append(input, track);

  input.addEventListener('change', function () {
    var previous = !input.checked;
    var latest = appContext.store.get('settings') || {};
    var nextHome = Object.assign({}, latest.home || {}, {});
    nextHome[key] = input.checked;
    try {
      var saved = appContext.settingsStorage.patchSettings({ home: nextHome });
      appContext.store.set('settings', saved, { source: 'settings-page' });
      appContext.events.emit(appContext.events.EVENTS.SETTINGS_CHANGED, {
        key: 'home.' + key,
        value: input.checked,
        settings: saved
      });
    } catch (error) {
      input.checked = previous;
      console.error('[Hayat Settings] Failed to save Home display setting:', error);
    }
  });

  container.append(info, switchLabel);
  return container;
}

// ====================================================================
// SOURCES AND PRIVACY
// ====================================================================

function buildSourcesSection() {
  var section = document.createElement('section');
  section.className = 'settings-sources';
  section.setAttribute('aria-labelledby', 'settings-sources-title');

  var title = document.createElement('h2');
  title.id = 'settings-sources-title';
  title.className = 'settings-section-title';
  title.textContent = 'Burimet dhe mirënjohjet';

  var introduction = document.createElement('p');
  introduction.className = 'settings-section-description';
  introduction.textContent = 'Këtu mund të shikoni burimet kryesore të përmbajtjes dhe shërbimeve që përdor Hayat.';

  var list = document.createElement('div');
  list.className = 'settings-sources__list';

  APP_SOURCES.forEach(function (source) {
    var details = document.createElement('details');
    details.className = 'settings-source';
    var summary = document.createElement('summary');
    summary.className = 'settings-source__summary';
    var summaryText = document.createElement('span');
    summaryText.className = 'settings-source__summary-text';
    var sourceTitle = document.createElement('span');
    sourceTitle.className = 'settings-source__title';
    sourceTitle.textContent = source.titleSq;
    var sourceDescription = document.createElement('span');
    sourceDescription.className = 'settings-source__description';
    sourceDescription.textContent = source.descriptionSq;
    summaryText.append(sourceTitle, sourceDescription);
    summary.append(summaryText, createIcon('chevron-right', 'icon--sm'));

    var body = document.createElement('div');
    body.className = 'settings-source__body';
    var detailList = document.createElement('ul');
    detailList.className = 'settings-source__details';
    source.details.forEach(function (text) {
      var item = document.createElement('li');
      item.textContent = text;
      detailList.appendChild(item);
    });
    var link = document.createElement('a');
    link.className = 'btn btn--outline btn--sm settings-source__link';
    link.href = source.link.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(document.createTextNode(source.link.label + ' '), createIcon('external-link', 'icon--sm'));
    body.append(detailList, link);
    details.append(summary, body);
    list.appendChild(details);
  });

  section.append(title, introduction, list);
  return section;
}

function buildPrivacySection() {
  var section = document.createElement('section');
  section.className = 'settings-privacy';
  section.setAttribute('aria-labelledby', 'settings-privacy-title');
  var title = document.createElement('h2');
  title.id = 'settings-privacy-title';
  title.className = 'settings-section-title';
  title.textContent = 'Privatësia';
  var list = document.createElement('ul');
  list.className = 'settings-privacy__list';
  APP_PRIVACY_DISCLOSURES.forEach(function (text) {
    var item = document.createElement('li');
    item.textContent = text;
    list.appendChild(item);
  });
  section.append(title, list);
  return section;
}

// ====================================================================
// RENDER
// ====================================================================

/**
 * Render the Settings page.
 *
 * @param {Object} context - Route context.
 * @param {Object} appContext - Application context.
 * @returns {HTMLElement}
 */
export function render(context, appContext) {
  var page = document.createElement('div');
  page.className = 'route-page settings-page';

  // Header
  var header = document.createElement('div');
  header.className = 'route-page__header';

  var eyebrow = document.createElement('span');
  eyebrow.className = 'route-page__eyebrow';
  eyebrow.textContent = 'Konfigurimi';

  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Cilësimet';

  header.appendChild(eyebrow);
  header.appendChild(h1);

  var content = document.createElement('div');
  content.className = 'route-page__content';

  // Appearance group
  var appearanceGroup = document.createElement('div');
  appearanceGroup.className = 'settings-group';

  var groupTitle = document.createElement('p');
  groupTitle.className = 'settings-group__title';
  groupTitle.textContent = 'Pamja';

  var groupList = document.createElement('div');
  groupList.className = 'settings-group__list';

  // Theme control row
  var themeRow = document.createElement('div');
  themeRow.className = 'settings-row';

  var themeIcon = document.createElement('span');
  themeIcon.className = 'settings-row__icon';
  themeIcon.appendChild(createIcon('refresh'));

  var themeContent = document.createElement('span');
  themeContent.className = 'settings-row__content';

  var themeRowTitle = document.createElement('span');
  themeRowTitle.className = 'settings-row__title';
  themeRowTitle.textContent = 'Tema';

  var themeRowDesc = document.createElement('span');
  themeRowDesc.className = 'settings-row__description';
  themeRowDesc.textContent = 'Zgjidhni midis pamjes së errët dhe të çelët';

  themeContent.appendChild(themeRowTitle);
  themeContent.appendChild(themeRowDesc);

  themeRow.appendChild(themeIcon);
  themeRow.appendChild(themeContent);

  groupList.appendChild(themeRow);
  appearanceGroup.appendChild(groupTitle);
  appearanceGroup.appendChild(groupList);

  // Theme switch (separate card)
  var themeControl = buildThemeControl(appContext);

  var homeGroup = document.createElement('section');
  homeGroup.className = 'settings-sources settings-home-settings';
  var homeTitle = document.createElement('h2');
  homeTitle.className = 'settings-section-title';
  homeTitle.textContent = 'Kryefaqja';
  var homeControls = document.createElement('div');
  homeControls.className = 'settings-home-settings__controls';
  homeControls.append(
    buildHomeSwitch(
      appContext,
      'showSuggestedReadings',
      'Leximet e sugjeruara',
      'Shfaq sugjerime sipas ditës dhe kohës'
    ),
    buildHomeSwitch(
      appContext,
      'showFridayAlKahf',
      'El-Kehf të premten',
      'Shfaq suren El-Kehf në ditën e premte'
    ),
    buildHomeSwitch(
      appContext,
      'showBedtimeQuranReadings',
      'Leximet para gjumit',
      'Shfaq Es-Sexhde dhe El-Mulk pas Jacisë'
    )
  );
  homeGroup.append(homeTitle, homeControls);

  var sourcesSection = buildSourcesSection();
  var privacySection = buildPrivacySection();

  content.appendChild(appearanceGroup);
  content.appendChild(themeControl);
  content.appendChild(homeGroup);
  content.appendChild(sourcesSection);
  content.appendChild(privacySection);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
