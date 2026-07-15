/**
 * Hayat — Dhikr Page (Placeholder)
 *
 * Placeholder for the Dhikr route. Full implementation will include
 * morning, evening and bedtime routines.
 *
 * @module pages/dhikr
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
 * Render the Dhikr placeholder page.
 *
 * @param {Object} context - Route context.
 * @param {Object} appContext - Application context.
 * @returns {HTMLElement}
 */
export function render(context, appContext) {
  var page = document.createElement('div');
  page.className = 'route-page';

  var header = document.createElement('div');
  header.className = 'route-page__header';

  var h1 = document.createElement('h1');
  h1.className = 'route-page__title';
  h1.setAttribute('data-route-heading', '');
  h1.textContent = 'Dhikri';

  header.appendChild(h1);

  var content = document.createElement('div');
  content.className = 'route-page__content';

  var placeholder = document.createElement('div');
  placeholder.className = 'route-placeholder';

  var iconWrap = document.createElement('div');
  iconWrap.className = 'route-placeholder__icon';
  iconWrap.appendChild(createIcon('sparkles', 'icon--xl'));

  var title = document.createElement('p');
  title.className = 'route-placeholder__title';
  title.textContent = 'Dhikri';

  var desc = document.createElement('p');
  desc.className = 'route-placeholder__description';
  desc.textContent = 'Rutinat e mëngjesit, mbrëmjes dhe gjumit po përgatiten.';

  placeholder.appendChild(iconWrap);
  placeholder.appendChild(title);
  placeholder.appendChild(desc);

  content.appendChild(placeholder);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
