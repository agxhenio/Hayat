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
import { PRAYER_LABELS_SQ } from '../js/config.js';
import { createPersonalDataExport, personalDataExportFilename } from '../js/storage/data-export.js';
import { restorePersonalData } from '../js/storage/data-import.js';
import { clearStore } from '../js/storage/database.js';
import { clearQuranSearchIndex } from '../js/services/quran-search-index.js';

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

function buildPrayerSettingsSection(appContext) {
  var settings = appContext.store.get('settings') || {};
  var prayer = settings.prayer || {};
  var methods = [
    [0, 'Xhaferi / Ithna-Ashari'], [1, 'University of Islamic Sciences, Karachi'],
    [2, 'Islamic Society of North America'], [3, 'Muslim World League'],
    [4, 'Umm Al-Qura, Mekkë'], [5, 'Egyptian General Authority of Survey'],
    [7, 'Institute of Geophysics, Tehran'], [8, 'Gulf Region'], [9, 'Kuwait'],
    [10, 'Qatar'], [11, 'Singapore'], [12, 'Union des Organisations Islamiques de France'],
    [13, 'Diyanet İşleri Başkanlığı, Turqi'], [14, 'Spiritual Administration of Muslims of Russia'],
    [15, 'Moonsighting Committee Worldwide'], [16, 'Dubai'], [17, 'JAKIM, Malajzi'],
    [18, 'Tunizi'], [19, 'Algjeri'], [20, 'KEMENAG, Indonezi'], [21, 'Marok'],
    [22, 'Portugali'], [23, 'Jordani']
  ];
  var section = document.createElement('section'); section.className = 'settings-prayer'; section.setAttribute('aria-labelledby', 'settings-prayer-title');
  var title = document.createElement('h2'); title.id = 'settings-prayer-title'; title.className = 'settings-section-title'; title.textContent = 'Oraret e namazit';
  var description = document.createElement('p'); description.className = 'settings-section-description'; description.textContent = 'Zgjidh metodën dhe shkollën sipas udhëzimit që ndjek. Korrigjimet janë vetëm për shfaqjen lokale të orareve.';
  var methodLabel = document.createElement('label'); methodLabel.className = 'settings-prayer__label'; methodLabel.textContent = 'Metoda e llogaritjes';
  var method = document.createElement('select'); method.className = 'input'; method.name = 'calculationMethod'; methods.forEach(function (entry) { var option = document.createElement('option'); option.value = String(entry[0]); option.textContent = entry[0] + ' · ' + entry[1]; option.selected = entry[0] === prayer.calculationMethod; method.appendChild(option); }); methodLabel.appendChild(method);
  var schoolLabel = document.createElement('label'); schoolLabel.className = 'settings-prayer__label'; schoolLabel.textContent = 'Shkolla e Ikindisë';
  var school = document.createElement('select'); school.className = 'input'; school.name = 'asrSchool'; [[0, 'Standarde'], [1, 'Hanefi']].forEach(function (entry) { var option = document.createElement('option'); option.value = String(entry[0]); option.textContent = entry[1]; option.selected = entry[0] === prayer.asrSchool; school.appendChild(option); }); schoolLabel.appendChild(school);
  var adjustmentsTitle = document.createElement('h3'); adjustmentsTitle.className = 'settings-prayer__subtitle'; adjustmentsTitle.textContent = 'Korrigjime në minuta';
  var adjustments = document.createElement('div'); adjustments.className = 'settings-prayer__adjustments';
  ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].forEach(function (key) { var label = document.createElement('label'); label.className = 'settings-prayer__adjustment'; var text = document.createElement('span'); text.textContent = PRAYER_LABELS_SQ[key]; var input = document.createElement('input'); input.className = 'input'; input.type = 'number'; input.name = key; input.min = '-30'; input.max = '30'; input.step = '1'; input.value = String((prayer.adjustments || {})[key] || 0); input.setAttribute('aria-label', 'Korrigjimi për ' + PRAYER_LABELS_SQ[key] + ' në minuta'); label.append(text, input); adjustments.appendChild(label); });
  var status = document.createElement('p'); status.className = 'settings-prayer__status'; status.setAttribute('role', 'status');
  function save() {
    var nextAdjustments = {}; var valid = true;
    adjustments.querySelectorAll('input').forEach(function (input) { var value = Number(input.value); if (!Number.isInteger(value) || value < -30 || value > 30) valid = false; nextAdjustments[input.name] = value; });
    if (!valid) { status.textContent = 'Korrigjimet duhet të jenë numra të plotë nga -30 deri në 30.'; return; }
    try { var latest = appContext.store.get('settings') || {}; var saved = appContext.settingsStorage.patchSettings({ prayer: { calculationMethod: Number(method.value), asrSchool: Number(school.value), adjustments: nextAdjustments }, prayerDefaultsApplied: true }); appContext.store.set('settings', saved, { source: 'prayer-settings' }); appContext.events.emit(appContext.events.EVENTS.SETTINGS_CHANGED, { key: 'prayer', value: saved.prayer, settings: saved }); status.textContent = 'Oraret do të llogariten me cilësimet e reja.'; } catch (error) { status.textContent = 'Cilësimet nuk u ruajtën. Provo përsëri.'; }
  }
  method.addEventListener('change', save); school.addEventListener('change', save); adjustments.querySelectorAll('input').forEach(function (input) { input.addEventListener('change', save); });
  section.append(title, description, methodLabel, schoolLabel, adjustmentsTitle, adjustments, status); return section;
}

function buildDataSection(appContext) {
  var section = document.createElement('section');
  section.className = 'settings-data';
  section.setAttribute('aria-labelledby', 'settings-data-title');
  var title = document.createElement('h2'); title.id = 'settings-data-title'; title.className = 'settings-section-title'; title.textContent = 'Të dhënat e tua';
  var description = document.createElement('p'); description.className = 'settings-section-description'; description.textContent = 'Shkarko një kopje JSON të cilësimeve, regjistrimeve të namazit, dhikrit, Dita Ime dhe pozicionit të leximit. Përmbajtjet e shkarkuara për cache nuk përfshihen.';
  var action = document.createElement('button'); action.type = 'button'; action.className = 'btn btn--outline'; action.dataset.dataExport = ''; action.append(document.createTextNode('Shkarko kopjen '), createIcon('external-link', 'icon--sm'));
  var restore = document.createElement('button'); restore.type = 'button'; restore.className = 'btn btn--ghost'; restore.dataset.dataRestore = ''; restore.textContent = 'Rikthe nga kopja';
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json,.json'; input.hidden = true; input.dataset.dataRestoreInput = ''; input.setAttribute('aria-label', 'Zgjidh kopjen JSON të Hayat');
  var status = document.createElement('p'); status.className = 'settings-data__status'; status.dataset.dataExportStatus = ''; status.setAttribute('role', 'status');
  action.addEventListener('click', function () {
    action.disabled = true; status.textContent = 'Po përgatitet kopja…';
    createPersonalDataExport(appContext.store.get('settings')).then(function (backup) {
      var blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a'); link.href = url; link.download = personalDataExportFilename(new Date()); link.hidden = true;
      section.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      status.textContent = 'Kopja u përgatit në pajisjen tënde.';
    }).catch(function () {
      status.textContent = 'Kopja nuk u përgatit. Provo përsëri.';
    }).finally(function () { action.disabled = false; });
  });
  restore.addEventListener('click', function () { input.click(); });
  input.addEventListener('change', function () {
    var file = input.files && input.files[0]; input.value = '';
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { status.textContent = 'Kopja është shumë e madhe për rikthim.'; return; }
    if (!window.confirm('Rikthimi do të zëvendësojë të dhënat personale aktuale në këtë pajisje. Të vazhdojmë?')) return;
    action.disabled = true; restore.disabled = true; status.textContent = 'Po rikthehen të dhënat…';
    file.text().then(function (text) { return restorePersonalData(JSON.parse(text), appContext.settingsStorage.save); }).then(function (settings) {
      appContext.store.set('settings', settings, { source: 'data-restore' });
      status.textContent = 'Të dhënat u rikthyen. Rifresko aplikacionin për të parë çdo ndryshim.';
    }).catch(function () { status.textContent = 'Kopja nuk u pranua ose rikthimi dështoi.'; }).finally(function () { action.disabled = false; restore.disabled = false; });
  });
  section.append(title, description, action, restore, input, status);
  return section;
}

function buildModuleClearSection() {
  var section = document.createElement('section'); section.className = 'settings-data';
  var title = document.createElement('h2'); title.className = 'settings-section-title'; title.textContent = 'Pastro sipas modulit';
  var description = document.createElement('p'); description.className = 'settings-section-description'; description.textContent = 'Këto veprime prekin vetëm modulin e zgjedhur në këtë pajisje.';
  var status = document.createElement('p'); status.className = 'settings-data__status'; status.setAttribute('role', 'status');
  function button(label, confirmText, operation, doneText) { var button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn--ghost'; button.textContent = label; button.addEventListener('click', function () { if (!window.confirm(confirmText)) return; button.disabled = true; operation().then(function () { status.textContent = doneText; }).catch(function () { status.textContent = 'Pastrimi nuk u krye. Provo përsëri.'; }).finally(function () { button.disabled = false; }); }); return button; }
  var clearDay = button('Pastro Dita Ime', 'Të fshijmë të gjitha aktivitetet dhe përsëritjet e Dita Ime nga kjo pajisje?', function () { return Promise.all([clearStore('dayItems'), clearStore('dayItemOccurrences')]); }, 'Dita Ime u pastrua nga kjo pajisje.');
  var clearQuran = button('Pastro të dhënat e Kuranit', 'Të fshijmë bookmark-et, pozicionet e leximit dhe indeksin offline nga kjo pajisje?', function () { return Promise.all([clearStore('quranReadingState'), clearQuranSearchIndex()]); }, 'Të dhënat personale të Kuranit u pastruan nga kjo pajisje.');
  section.append(title, description, clearDay, clearQuran, status); return section;
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
      'Shfaqe të premten nga lindja deri para perëndimit të diellit'
    ),
    buildHomeSwitch(
      appContext,
      'showBedtimeQuranReadings',
      'Es-Sexhde dhe El-Mulk pas Jacisë',
      'Shfaqi çdo natë pas Jacisë deri në Imsak'
    ),
    buildHomeSwitch(
      appContext,
      'showArticles',
      'Artikujt',
      'Shfaq artikujt e përzgjedhur në Kryefaqe'
    )
  );
  homeGroup.append(homeTitle, homeControls);

  var prayerSettingsSection = buildPrayerSettingsSection(appContext);
  var sourcesSection = buildSourcesSection();
  var dataSection = buildDataSection(appContext);
  var clearSection = buildModuleClearSection();
  var privacySection = buildPrivacySection();

  content.appendChild(appearanceGroup);
  content.appendChild(themeControl);
  content.appendChild(homeGroup);
  content.appendChild(prayerSettingsSection);
  content.appendChild(sourcesSection);
  content.appendChild(dataSection);
  content.appendChild(clearSection);
  content.appendChild(privacySection);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
