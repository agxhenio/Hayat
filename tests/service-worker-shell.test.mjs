import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');
const match = source.match(/const APP_SHELL = \[([\s\S]*?)\];/);
assert.ok(match, 'APP_SHELL was not found');

const paths = Array.from(match[1].matchAll(/'([^']+)'/g), function (entry) { return entry[1]; });
assert.ok(paths.length >= 50, 'APP_SHELL is unexpectedly small');
assert.equal(new Set(paths).size, paths.length, 'APP_SHELL contains duplicate paths');

for (const path of paths) {
  assert.ok(path.startsWith('./'), 'APP_SHELL path must be relative: ' + path);
  const relative = path === './' ? 'index.html' : path.slice(2);
  assert.ok(fs.existsSync(new URL(relative, root)), 'Missing APP_SHELL file: ' + path);
}

const required = [
  './index.html',
  './manifest.webmanifest',
  './assets/css/app.css',
  './assets/css/mburoja.css',
  './js/app.js',
  './js/data/mburoja.json',
  './js/storage/mburoja-state-backup.js',
  './js/utils/home-suggestion-windows.js',
  './pages/home.js',
  './pages/prayer.js',
  './pages/quran.js',
  './pages/mburoja.js',
  './pages/settings.js'
];
required.forEach(function (path) {
  assert.ok(paths.includes(path), 'Required offline shell path is missing: ' + path);
});

assert.match(source, /event\.waitUntil\(network[\s\S]*?\.catch/,
  'Background refresh rejection must be consumed');
assert.match(source, /cached \|\| network/, 'Static resources must use cached fallback');
assert.match(source, /caches\.match\('\.\/index\.html'\)/,
  'Offline navigation fallback is missing');

console.log('Service worker shell tests: OK — ' + paths.length + ' unique offline paths');
