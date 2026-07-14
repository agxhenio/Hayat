/**
 * 🕋 Hayat - Quran Module
 */

const QuranModule = {
    init: function() {
        console.log("Moduli i Kur'anit u inicializua.");
        this.bindEvents();
    },

    bindEvents: function() {
        // Këtu do të lidhim butonat e navigimit dhe settings
    },

    loadSurah: async function(surahNumber) {
        // Këtu do të integrojmë marrjen e të dhënave (API ose JSON lokal)
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    QuranModule.init();
});
