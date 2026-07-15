/**
 * Hayat — Prayer Page (Placeholder)
 *
 * Placeholder for the prayer route. Full implementation will include
 * prayer times, recording, and post-prayer dhikr.
 *
 * @module pages/prayer
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
 * Render the Prayer placeholder page.
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
  h1.textContent = 'Namazi';

  header.appendChild(h1);

  var content = document.createElement('div');
  content.className = 'route-page__content';

  var placeholder = document.createElement('div');
  placeholder.className = 'route-placeholder';

  var iconWrap = document.createElement('div');
  iconWrap.className = 'route-placeholder__icon';
  iconWrap.appendChild(createIcon('mosque', 'icon--xl'));

  var title = document.createElement('p');
  title.className = 'route-placeholder__title';
  title.textContent = 'Namazi';

  var desc = document.createElement('p');
  desc.className = 'route-placeholder__description';
  desc.textContent = 'Kohët, regjistrimi dhe dhikri pas namazit do të ndërtohen në fazën e ardhshme.';

  placeholder.appendChild(iconWrap);
  placeholder.appendChild(title);
  placeholder.appendChild(desc);

  content.appendChild(placeholder);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
