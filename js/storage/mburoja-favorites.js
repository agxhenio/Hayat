/**
 * Hayat — Mburoja Favorites: LocalStorage-based favorites management.
 */

var STORAGE_KEY = 'hayat-mburoja-favorites';

function loadFavorites() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    // Storage unavailable
  }
}

export function getFavoriteIds() {
  return loadFavorites();
}

export function isFavorite(itemId) {
  return loadFavorites().indexOf(itemId) !== -1;
}

export function toggleFavorite(itemId) {
  var ids = loadFavorites();
  var index = ids.indexOf(itemId);
  if (index === -1) {
    ids.push(itemId);
  } else {
    ids.splice(index, 1);
  }
  saveFavorites(ids);
  return index === -1; // returns true if added, false if removed
}

export function getFavoriteItems(allItems) {
  var ids = loadFavorites();
  return allItems.filter(function (item) {
    return ids.indexOf(item.id) !== -1;
  });
}
