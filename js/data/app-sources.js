/**
 * Hayat — Central registry for providers, source works and privacy disclosures.
 */

export const APP_SOURCES_VERSION = 1;

function freezeLink(link) {
  return link ? Object.freeze({ label: link.label, url: link.url }) : null;
}

function entry(id, titleSq, descriptionSq, details, link) {
  return Object.freeze({
    id: id,
    titleSq: titleSq,
    descriptionSq: descriptionSq,
    details: Object.freeze(details.slice()),
    link: freezeLink(link)
  });
}

export const APP_SOURCES = Object.freeze([
  entry(
    'quranenc',
    'QuranEnc',
    'Teksti arab dhe përkthimi shqip i ajeteve që ngarkohen në Hayat.',
    [
      'Përkthimi shqip: Hasan Nahi',
      'Përmbajtja ruhet lokalisht në cache pasi ngarkohet.',
      'Transliterimi i përdorur te Dhikri vjen nga botimi “Mburoja e Muslimanit”.'
    ],
    { label: 'Hap QuranEnc', url: 'https://quranenc.com' }
  ),
  entry(
    'mburoja-muslimanit',
    'Mburoja e Muslimanit',
    'Dhikri i Kuranit dhe Sunetit — burimi shqip për dhikrin dhe duatë.',
    [
      'Autor: Seid el Kahtani',
      'Përktheu: Azem Bardhoshi',
      'Redaktor fetar: Ismail Bardhoshi',
      'Redaktor gjuhësor: Ilir E. Haxhiaj',
      'Përgatitja kompjuterike dhe transkriptimi: Jusuf Kastrati',
      'Shpërndarja elektronike: IslamHouse'
    ],
    {
      label: 'Hap botimin PDF',
      url: 'https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.pdf'
    }
  ),
  entry(
    'aladhan',
    'AlAdhan Prayer Times API',
    'Burimi teknik për llogaritjen e kohëve të namazit sipas vendndodhjes dhe konfigurimit.',
    [
      'Rezultatet varen nga metoda e llogaritjes, shkolla e ikindisë dhe rregullimet lokale.',
      'Përdoruesi duhet t’i krahasojë oraret me autoritetin ose xhaminë lokale kur është e nevojshme.'
    ],
    { label: 'Hap AlAdhan', url: 'https://aladhan.com/prayer-times-api' }
  )
]);

export const APP_PRIVACY_DISCLOSURES = Object.freeze([
  'Hayat nuk përdor analytics ose tracking.',
  'Hayat nuk vendos cookies për profilizim.',
  'Cilësimet, progresi dhe regjistrimet ruhen lokalisht në pajisjen e përdoruesit.',
  'Kërkesat e rrjetit bëhen vetëm kur nevojiten të dhëna si kohët e namazit ose përmbajtja e Kuranit.',
  'Regjistrimi i namazit është opsional; “i paregjistruar” nuk do të thotë “i pafalur”.'
]);

export function validateAppSources() {
  var ids = new Set();
  return APP_SOURCES.length === 3 && APP_SOURCES.every(function (source) {
    if (!source || typeof source !== 'object' || ids.has(source.id)) return false;
    ids.add(source.id);
    return typeof source.id === 'string' && Boolean(source.id) &&
      typeof source.titleSq === 'string' && Boolean(source.titleSq) &&
      typeof source.descriptionSq === 'string' && Boolean(source.descriptionSq) &&
      Array.isArray(source.details) && source.details.length > 0 &&
      source.details.every(function (detail) {
        return typeof detail === 'string' && Boolean(detail);
      }) && source.link && /^https:\/\//.test(source.link.url) &&
      Object.isFrozen(source) && Object.isFrozen(source.details) &&
      Object.isFrozen(source.link);
  }) && APP_PRIVACY_DISCLOSURES.length > 0 && Object.isFrozen(APP_PRIVACY_DISCLOSURES);
}

if (!validateAppSources()) {
  throw new Error('Application source registry failed validation');
}
