/**
 * 🕋 Hayat - Quran Module Controller
 */

const QuranModule = {
    currentSurah: 1,
    fontSizeMultiplier: 0, // 0 = default, mund të jetë + ose -

    init: async function() {
        console.log("Moduli i Kur'anit u inicializua.");
        this.populateSurahSelector();
        this.loadSettings();
        
        // Ngarko suren e fundit të lexuar (nëse ekziston), ose Al-Fatihah
        const lastRead = localStorage.getItem("quran_last_read_surah");
        this.currentSurah = lastRead ? parseInt(lastRead) : 1;
        document.getElementById('surah-select').value = this.currentSurah;

        await this.loadSurah(this.currentSurah);
        this.bindEvents();
        
        // Aktivizo ikonat Lucide nëse janë të gatshme
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    // Shto të 114 suret tek përzgjedhësi automatikisht
    populateSurahSelector: function() {
        const selector = document.getElementById('surah-select');
        selector.innerHTML = ""; // Pastro
        
        const list = QuranService.getSurahList();
        list.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.name} (${surah.translation})`;
            selector.appendChild(option);
        });
    },

    bindEvents: function() {
        const selector = document.getElementById('surah-select');
        const nextBtn = document.getElementById('btn-next-surah');
        const prevBtn = document.getElementById('btn-prev-surah');
        const settingsToggle = document.getElementById('quran-settings-toggle');
        const settingsPanel = document.getElementById('quran-settings-panel');
        
        const fontIncrease = document.getElementById('btn-font-increase');
        const fontDecrease = document.getElementById('btn-font-decrease');
        const toggleTrans = document.getElementById('toggle-translation');
        const askGeminiBtn = document.getElementById('btn-ask-gemini');

        // Kur ndryshohet sura nga Dropdown
        selector.addEventListener('change', async (e) => {
            this.currentSurah = parseInt(e.target.value);
            await this.loadSurah(this.currentSurah);
        });

        // Butoni Sura tjetër
        nextBtn.addEventListener('click', async () => {
            if (this.currentSurah < 114) {
                this.currentSurah++;
                selector.value = this.currentSurah;
                await this.loadSurah(this.currentSurah);
            }
        });

        // Butoni Sura e kaluar
        prevBtn.addEventListener('click', async () => {
            if (this.currentSurah > 1) {
                this.currentSurah--;
                selector.value = this.currentSurah;
                await this.loadSurah(this.currentSurah);
            }
        });

        // Shfaq/Fsheh panelin e cilësimeve
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('hidden');
        });

        // Rrit madhësinë e shkronjave
        fontIncrease.addEventListener('click', () => {
            if (this.fontSizeMultiplier < 5) {
                this.fontSizeMultiplier++;
                this.updateFontSize();
            }
        });

        // Zvogëlo madhësinë e shkronjave
        fontDecrease.addEventListener('click', () => {
            if (this.fontSizeMultiplier > -3) {
                this.fontSizeMultiplier--;
                this.updateFontSize();
            }
        });

        // Aktivizo/Çaktivizo Përkthimin
        toggleTrans.addEventListener('change', (e) => {
            const transTexts = document.querySelectorAll('.translation-text');
            transTexts.forEach(el => {
                if (e.target.checked) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            });
            localStorage.setItem('quran_show_translation', e.target.checked);
        });

        // Butoni i Tefsirit me AI (Integrimi me Gemini)
        askGeminiBtn.addEventListener('click', () => {
            const surahInfo = QuranService.getSurahList().find(s => s.id === this.currentSurah);
            alert(`✨ Gemini Tefsir: Së shpejti do të mund të pyesni Gemini për tefsirin dhe urtësitë e Sures ${surahInfo.name} (${surahInfo.translation})!`);
        });
    },

    loadSurah: async function(surahNumber) {
        const container = document.getElementById('quran-verses-container');
        const bismillah = document.getElementById('bismillah-container');
        
        container.innerHTML = '<div class="loading-spinner">Duke ngarkuar suren...</div>';
        
        // Fshih bismilahin për suren e parë (Fatiha) pasi e ka brenda, dhe Suren At-Tawbah (9) e cila nuk ka Bismilah.
        if (surahNumber === 1 || surahNumber === 9) {
            bismillah.classList.add('hidden');
        } else {
            bismillah.classList.remove('hidden');
        }

        const data = await QuranService.getSurah(surahNumber);
        
        if (!data) {
            container.innerHTML = '<div class="loading-spinner" style="color: var(--color-accent-gold);">Nuk u morën dot të dhënat. Sigurohu që je i lidhur me internetin.</div>';
            return;
        }

        container.innerHTML = ""; // Pastro Loading
        
        // Ruaj statusin e leximit
        localStorage.setItem("quran_last_read_surah", surahNumber);

        // Kontrollo statusin e përkthimit (shfaq/fshih)
        const showTrans = document.getElementById('toggle-translation').checked;

        // Injekto ajetet një nga një
        data.verses.forEach(verse => {
            const verseDiv = document.createElement('div');
            verseDiv.className = 'verse-item';
            
            // Heqim fjalën "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ" nga ajeti i parë i çdo sureje (përveç Fatihas), pasi e shfaqim në kokë.
            let arabicText = verse.text;
            if (surahNumber !== 1 && verse.number === 1 && arabicText.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")) {
                arabicText = arabicText.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
            }

            // Kthe numrin e ajetit në formatin arab (Opsionale, ose e lëmë numër të thjeshtë)
            const numSpan = `<span class="verse-number">${verse.number}</span>`;

            verseDiv.innerHTML = `
                <div class="arabic-text">${arabicText} ${numSpan}</div>
                <div class="translation-text ${showTrans ? '' : 'hidden'}">${verse.translation}</div>
            `;
            
            container.appendChild(verseDiv);
        });

        this.updateFontSize();
        
        // Rrëshqit në fillim të faqes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    updateFontSize: function() {
        const root = document.documentElement;
        
        // Madhësitë bazë
        const baseArabicSize = 2.2; // rem
        const baseTransSize = 1.0; // rem

        // Ndryshimi dinamik
        const newArabicSize = baseArabicSize + (this.fontSizeMultiplier * 0.2);
        const newTransSize = baseTransSize + (this.fontSizeMultiplier * 0.08);

        root.style.setProperty('--quran-arabic-size', `${newArabicSize}rem`);
        root.style.setProperty('--quran-trans-size', `${newTransSize}rem`);
        
        localStorage.setItem('quran_font_multiplier', this.fontSizeMultiplier);
    },

    loadSettings: function() {
        const storedMultiplier = localStorage.getItem('quran_font_multiplier');
        if (storedMultiplier !== null) {
            this.fontSizeMultiplier = parseInt(storedMultiplier);
        }

        const storedTrans = localStorage.getItem('quran_show_translation');
        if (storedTrans !== null) {
            document.getElementById('toggle-translation').checked = (storedTrans === 'true');
        }
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    QuranModule.init();
});
