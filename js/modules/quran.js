/**
 * 🕋 Hayat - Moduli i Kur'anit (Reading Mode me Ruajtje Progresi)
 */

let currentSura = 1; 
let currentMode = 'parallel'; 
let surahList = [];
let savedProgress = null; // Ruajmë progresin e fundit

// --- SHËRBIMI I INDEXEDDB PËR PROGRESIN E KUR'ANIT ---
const DB_NAME = 'hayat_db';
const DB_VERSION = 1;
const STORE_NAME = 'quran_progress';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

// Ruan progresin (Suren dhe Ajetin) në IndexedDB
async function saveReadingProgress(suraNumber, ayahNumber, suraName) {
    try {
        const db = await initDB();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const progress = {
            id: 'last_read', // Çelës unik për të mbajtur vetëm 1 rekord të fundit
            suraNumber: parseInt(suraNumber),
            ayahNumber: parseInt(ayahNumber),
            suraName: suraName,
            timestamp: new Date().getTime()
        };

        store.put(progress);
        savedProgress = progress;
        
        // Përditësojmë pamjen e kartelës së re
        showResumeCard();
        
        // Ndryshojmë klasat e kartave vizualisht
        document.querySelectorAll('.verse-card').forEach(card => {
            const num = parseInt(card.getAttribute('data-num'));
            const btn = card.querySelector('.bookmark-btn');
            
            if (num === parseInt(ayahNumber)) {
                card.classList.add('verse-card--active');
                if (btn) btn.classList.add('bookmark-btn--saved');
            } else {
                card.classList.remove('verse-card--active');
                if (btn) btn.classList.remove('bookmark-btn--saved');
            }
        });

    } catch (error) {
        console.error("Gabim gjatë ruajtjes së progresit në DB:", error);
    }
}

// Lexon progresin nga IndexedDB
async function getReadingProgress() {
    try {
        const db = await initDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('last_read');
            
            request.onsuccess = (e) => resolve(e.target.result || null);
            request.onerror = () => resolve(null);
        });
    } catch (error) {
        console.error("Gabim gjatë leximit të progresit:", error);
        return null;
    }
}

// Shfaq kartelën "Vazhdo Leximin" në krye nëse ka progres të ruajtur
async function showResumeCard() {
    const progress = savedProgress || await getReadingProgress();
    const resumeCard = document.getElementById('resume-reading-card');
    
    if (progress && resumeCard) {
        savedProgress = progress;
        document.getElementById('resume-title').innerText = `${progress.suraNumber}. Sura ${progress.suraName}`;
        document.getElementById('resume-subtitle').innerText = `Ajeti i fundit i lexuar: Ajeti ${progress.ayahNumber}`;
        resumeCard.style.display = 'block';
    }
}

// --- LOGJIKA E NDËRFAQES SË KUR'ANIT ---

async function loadSurahList() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        
        if (data.status === "OK") {
            surahList = data.data;
            const select = document.getElementById('sura-select');
            if (!select) return;

            select.innerHTML = '';
            
            surahList.forEach(sura => {
                const option = document.createElement('option');
                option.value = sura.number;
                option.innerText = `${sura.number}. ${sura.englishName} (${sura.name})`;
                select.appendChild(option);
            });

            select.addEventListener('change', (e) => {
                currentSura = e.target.value;
                loadSurahContent(currentSura);
            });

            // Kontrollojmë fillimisht nëse ka progres të ruajtur që të ngarkojmë atë sure
            const progress = await getReadingProgress();
            if (progress) {
                currentSura = progress.suraNumber;
                select.value = currentSura;
            }

            loadSurahContent(currentSura);
            showResumeCard();
        }
    } catch (error) {
        console.error("Gabim te lista e sureve:", error);
    }
}

async function loadSurahContent(surahNumber, scrollToAyah = null) {
    const container = document.getElementById('verses-container');
    const bismillahContainer = document.getElementById('bismillah-container');
    if (!container) return;

    container.innerHTML = '<div class="card card--padding-md" style="text-align: center;"><p>Duke ngarkuar suren...</p></div>';

    try {
        const [arRes, sqRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`),
            fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/sq.ahmeti`)
        ]);

        const arData = await arRes.json();
        const sqData = await sqRes.json();

        if (arData.status === "OK" && sqData.status === "OK") {
            const arAyahs = arData.data.ayahs;
            const sqAyahs = sqData.data.ayahs;
            const suraName = arData.data.englishName;

            if (parseInt(surahNumber) !== 9 && parseInt(surahNumber) !== 1) {
                bismillahContainer.style.display = 'block';
            } else {
                bismillahContainer.style.display = 'none';
            }

            container.innerHTML = ''; 

            const progress = savedProgress || await getReadingProgress();

            arAyahs.forEach((ayah, index) => {
                const sqAyah = sqAyahs[index];
                let arabicText = ayah.text;

                if (parseInt(surahNumber) !== 1 && index === 0 && arabicText.startsWith("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ")) {
                    arabicText = arabicText.replace("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", "").trim();
                }

                const card = document.createElement('div');
                card.className = `card card--padding-md verse-card`;
                card.id = `verse-${ayah.numberInSurah}`;
                
                // Kontrollojmë nëse ky është ajeti i ruajtur për t'i dhënë stilin aktiv
                const isSaved = progress && progress.suraNumber === parseInt(surahNumber) && progress.ayahNumber === ayah.numberInSurah;
                if (isSaved) {
                    card.classList.add('verse-card--active');
                }

                updateCardHTML(card, ayah.numberInSurah, arabicText, sqAyah.text, isSaved);

                // Dëgjuesi për butonin e Bookmark-ut
                const bookmarkBtn = card.querySelector('.bookmark-btn');
                if (bookmarkBtn) {
                    bookmarkBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        saveReadingProgress(surahNumber, ayah.numberInSurah, suraName);
                    });
                }

                container.appendChild(card);
            });

            // Nëse përdoruesi klikoi "Shko tek Ajeti", bëjmë scroll të butë tek ai ajet
            if (scrollToAyah) {
                setTimeout(() => {
                    const targetCard = document.getElementById(`verse-${scrollToAyah}`);
                    if (targetCard) {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        }
    } catch (error) {
        console.error("Gabim te ngarkimi i sures:", error);
        container.innerHTML = '<div class="card card--padding-md"><p>Dështoi ngarkimi. Provoni përsëri.</p></div>';
    }
}

function updateCardHTML(card, numberInSurah, arabic, albanian, isSaved = false) {
    card.setAttribute('data-arabic', arabic);
    card.setAttribute('data-albanian', albanian);
    card.setAttribute('data-num', numberInSurah);

    const activeClass = isSaved ? 'bookmark-btn--saved' : '';

    const bookmarkHTML = `
        <button class="bookmark-btn ${activeClass}" title="Shëno ajetin">
            <i data-lucide="bookmark" style="width: 16px; height: 16px;"></i>
        </button>
    `;

    if (currentMode === 'parallel') {
        card.innerHTML = `
            <div class="verse-header">
                <span class="verse-number">Ajeti ${numberInSurah}</span>
                ${bookmarkHTML}
            </div>
            <p class="arabic-text">${arabic}</p>
            <p class="translation-text">${albanian}</p>
        `;
    } else if (currentMode === 'arabic') {
        card.innerHTML = `
            <div class="verse-header">
                <span class="verse-number">Ajeti ${numberInSurah}</span>
                ${bookmarkHTML}
            </div>
            <p class="arabic-text">${arabic}</p>
        `;
    } else if (currentMode === 'albanian') {
        card.innerHTML = `
            <div class="verse-header">
                <span class="verse-number">Ajeti ${numberInSurah}</span>
                ${bookmarkHTML}
            </div>
            <p class="translation-text">${albanian}</p>
        `;
    } else if (currentMode === 'focus') {
        card.innerHTML = `
            <div class="verse-header">
                <span class="verse-number">Ajeti ${numberInSurah}</span>
                ${bookmarkHTML}
            </div>
            <p class="arabic-text" style="font-size: 2.2rem; text-align: center; padding-left: 0;">${arabic}</p>
            <p class="translation-text" style="text-align: center; margin-top: var(--space-3); font-size: var(--font-size-md);">${albanian}</p>
        `;
    }
    
    if (window.lucide) lucide.createIcons();
}

function setViewMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('mode-btn--active');
        } else {
            btn.classList.remove('mode-btn--active');
        }
    });

    document.querySelectorAll('.verse-card').forEach(card => {
        const arabic = card.getAttribute('data-arabic');
        const albanian = card.getAttribute('data-albanian');
        const num = card.getAttribute('data-num');
        const isSaved = card.classList.contains('verse-card--active');
        updateCardHTML(card, num, arabic, albanian, isSaved);
    });
}

// Inicializimi
document.addEventListener('DOMContentLoaded', () => {
    loadSurahList();

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.getAttribute('data-mode');
            setViewMode(mode);
        });
    });

    // Lidhim dëgjuesin për butonin "Shko tek Ajeti"
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', async () => {
            const progress = savedProgress || await getReadingProgress();
            if (progress) {
                const select = document.getElementById('sura-select');
                if (select) select.value = progress.suraNumber;
                
                currentSura = progress.suraNumber;
                // Ngarkojmë suren dhe bëjmë scroll tek ajeti i ruajtur
                loadSurahContent(progress.suraNumber, progress.ayahNumber);
            }
        });
    }

    if (window.lucide) {
        lucide.createIcons();
    }
});
