/** Hayat — user-initiated Quran audio via MP3Quran. */
const MINSHAWI_MURATTAL_SERVER = 'https://server10.mp3quran.net/minsh/';
export const QURAN_AUDIO_SOURCE = Object.freeze({ provider: 'MP3Quran', providerUrl: 'https://www.mp3quran.net/eng/api', reciter: 'Muhammad Siddiq El-Minshawi', riwayah: 'Hafs ‘an ‘Asim · Murattal' });
export function minshawiSurahAudioUrl(surah) {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) throw new TypeError('Invalid surah');
  return MINSHAWI_MURATTAL_SERVER + String(surah).padStart(3, '0') + '.mp3';
}
