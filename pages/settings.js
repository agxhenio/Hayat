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

  // Placeholder message for other settings
  var placeholderMsg = document.createElement('p');
  placeholderMsg.className = 'route-placeholder__description';
  placeholderMsg.textContent = 'Cilësimet e tjera do të shtohen sipas moduleve.';

  content.appendChild(appearanceGroup);
  content.appendChild(themeControl);
  content.appendChild(placeholderMsg);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
