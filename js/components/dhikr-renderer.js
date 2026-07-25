// js/components/dhikr-renderer.js
// PATCH: Renderimi i sigurt i sureve (Ihlas, Felek, Nas) sipas kërkesës 7.A
// NUK përdor innerHTML. Përdor textContent.
// Zëvendëso logjikën e vjetër në pages/dhikr.js me këtë funksion.

import { DHIKR_SURAHS } from '../data/dhikr-surahs.js';

export function renderDhikrSurahBlock(surahId, containerElement) {
    const data = DHIKR_SURAHS[surahId];
    if (!data) return;

    // Pastrim i sigurt
    containerElement.replaceChildren();

    // 1. Arabishtja e plotë
    const arabicP = document.createElement('p');
    arabicP.className = 'quran-arabic-full text-right font-arabic text-2xl leading-relaxed text-emerald mb-4';
    arabicP.textContent = data.arabic;
    
    // 2. Transliterimi i plotë
    const transP = document.createElement('p');
    transP.className = 'quran-transliteration-full text-gold italic mb-3';
    transP.textContent = data.transliteration;

    // 3. Përkthimi i plotë
    const translationP = document.createElement('p');
    translationP.className = 'quran-translation-full text-near-black dark:text-gray-200';
    translationP.textContent = data.translation;

    containerElement.appendChild(arabicP);
    containerElement.appendChild(transP);
    containerElement.appendChild(translationP);
}
