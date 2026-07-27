/**
 * Hayat — Mburoja e Muslimanit: Flattened items for search and favorites.
 * Generated from mburoja-catalog.js + mburoja-content.js
 */

import { MBUROJA_CHAPTERS, MBUROJA_CATEGORIES } from './mburoja-catalog.js';
import { getMburojaContent } from './mburoja-content.js';

// Build flat list of all items with category info
function buildAllItems() {
  var items = [];
  MBUROJA_CHAPTERS.forEach(function (chapter) {
    var content = getMburojaContent(chapter.number);
    if (!content) return;
    var category = MBUROJA_CATEGORIES.find(function (c) { return c.id === chapter.categoryId; });
    content.items.forEach(function (item, index) {
      if (item.type === 'text') {
        items.push({
          id: item.id,
          chapterNumber: chapter.number,
          chapterTitle: chapter.titleSq,
          categoryId: chapter.categoryId,
          categoryTitle: category ? category.titleSq : '',
          itemNumber: index + 1,
          title: item.titleSq,
          arabic: item.arabic || '',
          transliteration: item.transliterationSq || '',
          translation: item.translationSq || '',
          reference: item.sourceSq || '',
          repetitions: item.repetitions || 1
        });
      }
    });
  });
  return items;
}

export var ALL_MBUROJA_ITEMS = buildAllItems();

// Search function
export function searchMburojaItems(query) {
  if (!query || typeof query !== 'string') return ALL_MBUROJA_ITEMS;
  var q = query.toLowerCase().trim();
  if (!q) return ALL_MBUROJA_ITEMS;
  return ALL_MBUROJA_ITEMS.filter(function (item) {
    return item.title.toLowerCase().indexOf(q) !== -1 ||
           item.translation.toLowerCase().indexOf(q) !== -1 ||
           item.transliteration.toLowerCase().indexOf(q) !== -1 ||
           item.arabic.indexOf(q) !== -1;
  });
}

// Get items by category
export function getItemsByCategory(categoryId) {
  return ALL_MBUROJA_ITEMS.filter(function (item) {
    return item.categoryId === categoryId;
  });
}

// Get single item by id
export function getMburojaItem(itemId) {
  return ALL_MBUROJA_ITEMS.find(function (item) {
    return item.id === itemId;
  }) || null;
}

// Get categories with item counts
export function getCategoriesWithCounts() {
  return MBUROJA_CATEGORIES.map(function (cat) {
    var count = ALL_MBUROJA_ITEMS.filter(function (item) {
      return item.categoryId === cat.id;
    }).length;
    return { id: cat.id, titleSq: cat.titleSq, count: count };
  }).filter(function (cat) { return cat.count > 0; });
}
