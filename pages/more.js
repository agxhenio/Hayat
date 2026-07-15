/**
 * Hayat — More Page (Placeholder)
 *
 * Shows navigation links to secondary routes:
 * - Dita ime (coming soon)
 * - Mburoja (coming soon)
 * - Cilësimet (working link to settings)
 *
 * @module pages/more
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
// RENDER
// ====================================================================

/**
 * Render the More page.
 *
 * @param {Object} context - Route context.
 * @param {Object} appContext - Application context.
 * @returns {HTMLElement}
 */
export function render(context, appContext) {
  var navigate = appContext.navigate;

  var page = document.createElement('div');
  page.className = 'route-page more-page';

  var header = document.createElement('div');
  header.className = 'route-page__header';

  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Më shumë';

  header.appendChild(h1);

  var content = document.createElement('div');
  content.className = 'route-page__content';

  // List of secondary routes
  var listGroup = document.createElement('div');
  listGroup.className = 'list-group';

  // Dita ime (disabled)
  var dayItem = document.createElement('div');
  dayItem.className = 'list-item';
  dayItem.setAttribute('aria-disabled', 'true');

  var dayLeading = document.createElement('span');
  dayLeading.className = 'list-item__leading';
  dayLeading.appendChild(createIcon('calendar'));

  var dayContent = document.createElement('span');
  dayContent.className = 'list-item__content';
  var dayTitle = document.createElement('span');
  dayTitle.className = 'list-item__title';
  dayTitle.textContent = 'Dita ime';
  var daySubtitle = document.createElement('span');
  daySubtitle.className = 'list-item__subtitle';
  daySubtitle.textContent = 'Së shpejti';
  dayContent.appendChild(dayTitle);
  dayContent.appendChild(daySubtitle);

  dayItem.appendChild(dayLeading);
  dayItem.appendChild(dayContent);
  listGroup.appendChild(dayItem);

  // Mburoja (disabled)
  var shieldItem = document.createElement('div');
  shieldItem.className = 'list-item';
  shieldItem.setAttribute('aria-disabled', 'true');

  var shieldLeading = document.createElement('span');
  shieldLeading.className = 'list-item__leading';
  shieldLeading.appendChild(createIcon('shield'));

  var shieldContent = document.createElement('span');
  shieldContent.className = 'list-item__content';
  var shieldTitle = document.createElement('span');
  shieldTitle.className = 'list-item__title';
  shieldTitle.textContent = 'Mburoja';
  var shieldSubtitle = document.createElement('span');
  shieldSubtitle.className = 'list-item__subtitle';
  shieldSubtitle.textContent = 'Së shpejti';
  shieldContent.appendChild(shieldTitle);
  shieldContent.appendChild(shieldSubtitle);

  shieldItem.appendChild(shieldLeading);
  shieldItem.appendChild(shieldContent);
  listGroup.appendChild(shieldItem);

  // Cilësimet (working)
  var settingsItem = document.createElement('button');
  settingsItem.type = 'button';
  settingsItem.className = 'list-item list-item--interactive';
  settingsItem.addEventListener('click', function () {
    navigate('settings');
  });

  var settingsLeading = document.createElement('span');
  settingsLeading.className = 'list-item__leading';
  settingsLeading.appendChild(createIcon('settings'));

  var settingsContent = document.createElement('span');
  settingsContent.className = 'list-item__content';
  var settingsTitle = document.createElement('span');
  settingsTitle.className = 'list-item__title';
  settingsTitle.textContent = 'Cilësimet';
  settingsContent.appendChild(settingsTitle);

  var settingsTrailing = document.createElement('span');
  settingsTrailing.className = 'list-item__trailing';
  settingsTrailing.appendChild(createIcon('chevron-right', 'icon--sm'));

  settingsItem.appendChild(settingsLeading);
  settingsItem.appendChild(settingsContent);
  settingsItem.appendChild(settingsTrailing);
  listGroup.appendChild(settingsItem);

  content.appendChild(listGroup);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
