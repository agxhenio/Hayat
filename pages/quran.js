/**
 * Hayat — Quran Page (Placeholder)
 *
 * Placeholder for the Quran route. Full implementation will include
 * reading, position tracking, and memorization (hifdh).
 *
 * If context.params contains surah/ayah, display them safely as text.
 *
 * @module pages/quran
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
 * Render the Quran placeholder page.
 *
 * @param {Object} context - Route context (may contain params.surah, params.ayah).
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
  h1.textContent = "Kur'ani";

  header.appendChild(h1);

  var content = document.createElement('div');
  content.className = 'route-page__content';

  var placeholder = document.createElement('div');
  placeholder.className = 'route-placeholder';

  var iconWrap = document.createElement('div');
  iconWrap.className = 'route-placeholder__icon';
  iconWrap.appendChild(createIcon('book-open', 'icon--xl'));

  var title = document.createElement('p');
  title.className = 'route-placeholder__title';
  title.textContent = "Kur'ani";

  var desc = document.createElement('p');
  desc.className = 'route-placeholder__description';
  desc.textContent = 'Leximi, ruajtja e pozicionit dhe hifdhi po përgatiten.';

  placeholder.appendChild(iconWrap);
  placeholder.appendChild(title);
  placeholder.appendChild(desc);

  // Show params if present
  var params = context && context.params;
  if (params && (params.surah || params.ayah)) {
    var paramsRow = document.createElement('div');
    paramsRow.className = 'route-placeholder__params';

    if (params.surah) {
      var surahBadge = document.createElement('span');
      surahBadge.className = 'badge badge--neutral';
      surahBadge.textContent = 'Sureja ' + String(params.surah);
      paramsRow.appendChild(surahBadge);
    }

    if (params.ayah) {
      var ayahBadge = document.createElement('span');
      ayahBadge.className = 'badge badge--neutral';
      ayahBadge.textContent = 'Ajeti ' + String(params.ayah);
      paramsRow.appendChild(ayahBadge);
    }

    placeholder.appendChild(paramsRow);
  }

  content.appendChild(placeholder);

  page.appendChild(header);
  page.appendChild(content);

  return page;
}
