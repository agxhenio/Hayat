import assert from 'node:assert/strict';
import fs from 'node:fs';

const jsonUrl = new URL('../js/data/mburoja.json', import.meta.url);
const contentUrl = new URL('../js/data/mburoja-content.js', import.meta.url);
const data = JSON.parse(fs.readFileSync(jsonUrl, 'utf8'));
const generatedModule = fs.readFileSync(contentUrl, 'utf8');

assert.equal(typeof data, 'object');
assert.equal(Array.isArray(data.categories), true);
assert.equal(data.categories.length, 11);
assert.equal(data.total_chapters, 133);
assert.equal(data.total_duas, 291);
assert.match(generatedModule, /MBUROJA_CONTENT_VERSION\s*=\s*6/);
assert.doesNotMatch(generatedModule, /Certified content/);

const chapterSlugs = new Set();
const scopedIds = new Set();
const chapterCounts = new Map();
let chapterTotal = 0;
let duaTotal = 0;

function requiredText(value, label) {
  assert.equal(typeof value, 'string', label + ' must be a string');
  assert.notEqual(value.trim(), '', label + ' must not be empty');
}

for (const category of data.categories) {
  requiredText(category.slug, 'category.slug');
  requiredText(category.title, 'category.title');
  assert.equal(Array.isArray(category.chapters), true);

  for (const chapter of category.chapters) {
    chapterTotal += 1;
    requiredText(chapter.slug, 'chapter.slug');
    requiredText(chapter.title, 'chapter.title');
    assert.equal(chapterSlugs.has(chapter.slug), false, 'duplicate chapter slug: ' + chapter.slug);
    chapterSlugs.add(chapter.slug);
    assert.equal(Array.isArray(chapter.duas), true);
    assert.notEqual(chapter.duas.length, 0, 'empty chapter: ' + chapter.slug);
    chapterCounts.set(chapter.slug, chapter.duas.length);
    const isDailyRoutine = ['dhikri-i-mengjesit', 'dhikri-i-mbremjes', 'dhikri-kur-biem-ne-gjume'].includes(chapter.slug);

    for (const dua of chapter.duas) {
      duaTotal += 1;
      const scopedId = chapter.slug + ':' + dua.id;
      assert.equal(scopedIds.has(scopedId), false, 'duplicate dua id: ' + scopedId);
      scopedIds.add(scopedId);
      assert.equal(typeof dua.arabic, 'string', scopedId + '.arabic must be a string');
      assert.equal(typeof dua.transliteration, 'string', scopedId + '.transliteration must be a string');
      requiredText(dua.translation, scopedId + '.translation');
      assert.equal(typeof dua.reference, 'string', scopedId + '.reference must be a string');
      if (isDailyRoutine) { requiredText(dua.arabic, scopedId + '.arabic'); requiredText(dua.transliteration, scopedId + '.transliteration'); }
            assert.equal(Number.isInteger(dua.repetitions) && dua.repetitions >= 1 && dua.repetitions <= 1000, true,
        scopedId + '.repetitions is invalid');

      const arabic = dua.arabic.trim();
      const transliteration = dua.transliteration.trim();
      if (arabic && transliteration) assert.notEqual(transliteration, arabic, scopedId + ' repeats Arabic as transliteration');
      assert.equal(Boolean(transliteration) && /^[\u0600-\u06ff]{2,}/.test(transliteration), false,
        scopedId + ' begins with an Arabic block in transliteration');
      assert.equal(Boolean(transliteration) && /^[\u0600-\u06ff\s،.]+$/.test(transliteration), false,
        scopedId + ' transliteration is Arabic-only');
    }
  }
}

assert.equal(chapterTotal, data.total_chapters);
assert.equal(duaTotal, data.total_duas);
assert.equal(chapterCounts.get('dhikri-i-mengjesit'), 23);
assert.equal(chapterCounts.get('dhikri-i-mbremjes'), 20);
assert.equal(chapterCounts.get('dhikri-kur-biem-ne-gjume'), 12);

console.log('Mburoja content integrity tests: OK — ' + chapterTotal + ' chapters, ' + duaTotal + ' duas');
