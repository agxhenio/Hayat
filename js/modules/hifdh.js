/**
 * 🕋 Hayat - Moduli i Hifdhit (Memorizimit)
 * Metodologjia tradicionale me 5 hapa & Spaced Repetition offline
 */

let surahList = [];
let currentSurahNumber = 1;
let currentAyahsData = [];
let sessionAyahs = []; // Lista e ajeteve të zgjedhura për këtë sesion
let currentSessionIndex = 0; // Indeksi i ajetit aktual në sesion (0, 1, 2...)
let currentStep = 1; // Hapi i memorizimit (1 deri në 5)

// Audio element i përbashkët
let audioPlayer = new Audio();
let isAudioPlaying = false;

// Counters
let readCounter = 0;
const READ_GOAL = 10;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadSurahList();
    setupEventListeners();
    if (window.lucide) lucide.createIcons();
});

function setupEventListeners() {
    const btnStart = document.getElementById('start-hifdh-btn');
    const btnPrev = document.getElementById('wizard-prev-btn');
    const btnNext = document.getElementById('wizard-next-btn');
    const selectSura = document.getElementById('hifdh-sura-select');
    const selectStart = document.getElementById('hifdh-start-select');

    if (btnStart) btnStart.addEventListener('click', startHifdhSession);
    if (btnPrev) btnPrev.addEventListener('click', handlePrevStep);
    if (btnNext) btnNext.addEventListener('click', handleNextStep);

    if (selectSura) {
        selectSura.addEventListener('change', (e) => {
            currentSurahNumber = parseInt(e.target.value);
            loadAyahsDropdowns(currentSurahNumber);
        });
    }

    if (selectStart) {
        selectStart.addEventListener('change', () => {
            adjustEndAyahDropdown();
        });
    }
}

// --- API DATA CALLS ---
async function loadSurahList() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.status === "OK") {
            surahList = data.data;
            const select = document.getElementById('hifdh-sura-select');
            if (!select) return;

            select.innerHTML = '';
            surahList.forEach(sura => {
                const option = document.createElement('option');
                option.value = sura.number;
                option.innerText = `${sura.number}. ${sura.englishName} (${sura.name})`;
                select.appendChild(option);
            });

            loadAyahsDropdowns(1);
        }
    } catch (error) {
        console.error("Gabim te lista e sureve:", error);
    }
}

async function loadAyahsDropdowns(surahNumber) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`);
        const data = await response.json();
        if (data.status === "OK") {
            currentAyahsData = data.data.ayahs;
            
            const selectStart = document.getElementById('hifdh-start-select');
            const selectEnd = document.getElementById('hifdh-end-select');
            if (!selectStart || !selectEnd) return;

            selectStart.innerHTML = '';
            selectEnd.innerHTML = '';

            currentAyahsData.forEach(ayah => {
                const optStart = document.createElement('option');
                optStart.value = ayah.numberInSurah;
                optStart.innerText = ayah.numberInSurah;
                selectStart.appendChild(optStart);

                const optEnd = document.createElement('option');
                optEnd.value = ayah.numberInSurah;
                optEnd.innerText = ayah.numberInSurah;
                selectEnd.appendChild(optEnd);
            });

            selectEnd.value = currentAyahsData.length;
        }
    } catch (error) {
        console.error("Gabim te ajetet e sures:", error);
    }
}

function adjustEndAyahDropdown() {
    const selectStart = document.getElementById('hifdh-start-select');
    const selectEnd = document.getElementById('hifdh-end-select');
    if (!selectStart || !selectEnd) return;

    const startVal = parseInt(selectStart.value);
    const endVal = parseInt(selectEnd.value);

    if (endVal < startVal) {
        selectEnd.value = startVal;
    }
}

// --- SESSION ENGINE ---
function startHifdhSession() {
    const selectStart = document.getElementById('hifdh-start-select');
    const selectEnd = document.getElementById('hifdh-end-select');
    if (!selectStart || !selectEnd) return;

    const start = parseInt(selectStart.value);
    const end = parseInt(selectEnd.value);

    sessionAyahs = currentAyahsData.filter(ayah => ayah.numberInSurah >= start && ayah.numberInSurah <= end);
    
    if (sessionAyahs.length === 0) return;

    currentSessionIndex = 0;
    currentStep = 1;
    
    document.getElementById('hifdh-wizard-container').style.display = 'block';
    document.getElementById('total-session-ayahs').innerText = sessionAyahs.length;

    loadAyahToStep();
    document.getElementById('hifdh-wizard-container').scrollIntoView({ behavior: 'smooth' });
}

function loadAyahToStep() {
    stopAudio();
    const ayah = sessionAyahs[currentSessionIndex];
    document.getElementById('current-session-ayah').innerText = currentSessionIndex + 1;

    updateStepIndicators();

    const txtContainer = document.getElementById('hifdh-text-container');
    const interactiveArea = document.getElementById('step-interactive-area');
    txtContainer.innerHTML = '';
    interactiveArea.innerHTML = '';

    const stepTitle = document.getElementById('wizard-step-title');
    const stepInstruction = document.getElementById('wizard-step-instruction');

    const absoluteAyahNumber = ayah.number;

    switch(currentStep) {
        case 1:
            stepTitle.innerText = "Hapi 1: Dëgjo";
            stepInstruction.innerText = "Dëgjo ajetin me vëmendje të plotë. Përsërite dëgjimin deri sa të jesh i sigurt për shqiptimin.";
            txtContainer.innerText = ayah.text;

            interactiveArea.innerHTML = `
                <div class="audio-player-container">
                    <button class="audio-btn" id="play-pause-audio-btn">
                        <i data-lucide="play" id="audio-icon" style="width: 20px; height: 20px; margin-left: 2px;"></i>
                    </button>
                    <span style="font-size: 11px; color: var(--color-text-muted);">Mishary Rashid Alafasy</span>
                </div>
            `;
            
            audioPlayer.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${absoluteAyahNumber}.mp3`;
            const playBtn = document.getElementById('play-pause-audio-btn');
            playBtn.addEventListener('click', toggleAudio);
            break;

        case 2:
            stepTitle.innerText = "Hapi 2: Lexo (10 herë)";
            stepInstruction.innerText = "Lexo ajetin me zë të lartë 10 herë duke shikuar tekstin. Kliko butonin sa herë që mbaron një lexim.";
            txtContainer.innerText = ayah.text;
            readCounter = 0;

            interactiveArea.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div class="counter-badge" id="read-counter-badge">0/10</div>
                    <button class="btn btn--secondary btn--sm" id="count-read-btn" style="width: auto;">
                        Marko si të Lexuar 📖
                    </button>
                </div>
            `;

            document.getElementById('count-read-btn').addEventListener('click', () => {
                if (readCounter < READ_GOAL) {
                    readCounter++;
                    document.getElementById('read-counter-badge').innerText = `${readCounter}/10`;
                    if (readCounter === READ_GOAL) {
                        document.getElementById('read-counter-badge').style.backgroundColor = 'var(--color-accent-gold)';
                    }
                }
            });
            break;

        case 3:
            stepTitle.innerText = "Hapi 3: Recito (Word Masking)";
            stepInstruction.innerText = "Tani disa fjalë janë të fshehura. Mundohu ta recitosh. Kliko mbi çdo fjalë të fshehur për ta zbuluar nëse ngec!";
            
            const words = ayah.text.split(' ');
            words.forEach((word, idx) => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'hifdh-word';
                wordSpan.innerText = word;
                
                if (idx % 2 === 1) {
                    wordSpan.classList.add('hifdh-word--hidden');
                }

                wordSpan.addEventListener('click', () => {
                    wordSpan.classList.toggle('hifdh-word--hidden');
                });

                txtContainer.appendChild(wordSpan);
            });

            interactiveArea.innerHTML = `
                <button class="btn btn--secondary btn--sm" id="toggle-all-words-btn" style="width: auto;">
                    Fshih / Shfaq të Gjitha 👁️
                </button>
            `;
            document.getElementById('toggle-all-words-btn').addEventListener('click', () => {
                const allWords = document.querySelectorAll('.hifdh-word');
                const anyHidden = Array.from(allWords).some(w => w.classList.contains('hifdh-word--hidden'));
                
                allWords.forEach(w => {
                    if (anyHidden) {
                        w.classList.remove('hifdh-word--hidden');
                    } else {
                        w.classList.add('hifdh-word--hidden');
                    }
                });
            });
            break;

        case 4:
            stepTitle.innerText = "Hapi 4: Lidhja me Ajetin Paraprak";
            stepInstruction.innerText = "Për të krijuar një zinxhir të fortë memorizimi, recitoje këtë ajet së bashku me ajetin e mësipërm 3 herë pa e shikuar ekranin.";
            
            if (currentSessionIndex > 0) {
                const prevAyah = sessionAyahs[currentSessionIndex - 1];
                txtContainer.innerHTML = `
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: 8px;">Ajeti i mëparshëm:</div>
                    <div style="font-size: 1.4rem; opacity: 0.6; margin-bottom: 15px; text-align: center;">${prevAyah.text}</div>
                    <div style="font-size: var(--font-size-sm); color: var(--color-accent-teal); margin-bottom: 8px;">Ajeti Aktual:</div>
                    <div>${ayah.text}</div>
                `;
            } else {
                txtContainer.innerHTML = `
                    <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center;">
                        Ky është ajeti i parë i sesionit tënd. Thjesht recitoje këtë ajet përmendsh 5 herë rresht.
                    </p>
                    <div style="margin-top: 15px;">${ayah.text}</div>
                `;
            }
            break;

        case 5:
            stepTitle.innerText = "Hapi 5: Ruajtja e Suksesit";
            stepInstruction.innerText = "Urime! Ke përfunduar me sukses memorizimin e këtij ajeti. Regjistro progresin për të programuar rishikimin e radhës.";
            
            txtContainer.innerHTML = `
                <div style="text-align: center; color: var(--color-accent-gold); margin-bottom: var(--space-3);">
                    <i data-lucide="trophy" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>
                </div>
                <p style="text-align: center; font-weight: 600; font-size: var(--font-size-md);">Elhamdulilah, u memorizua!</p>
            `;

            interactiveArea.innerHTML = `
                <button class="btn btn--primary" id="save-hifdh-progress-btn" style="width: auto;">
                    Regjistro në Ditarin e Hifdhit 💾
                </button>
            `;

            document.getElementById('save-hifdh-progress-btn').addEventListener('click', saveAyahToIndexedDB);
            break;
    }

    if (window.lucide) lucide.createIcons();
}

// --- WIZARD FLOW MENAXHIMI ---
function handleNextStep() {
    if (currentStep < 5) {
        currentStep++;
        loadAyahToStep();
    } else {
        if (currentSessionIndex < sessionAyahs.length - 1) {
            currentSessionIndex++;
            currentStep = 1;
            loadAyahToStep();
        } else {
            alert("Elhamdulilah! Përfundove me sukses sesionin e sotëm të memorizimit!");
            document.getElementById('hifdh-wizard-container').style.display = 'none';
            stopAudio();
        }
    }
}

function handlePrevStep() {
    if (currentStep > 1) {
        currentStep--;
        loadAyahToStep();
    } else {
        if (currentSessionIndex > 0) {
            currentSessionIndex--;
            currentStep = 5;
            loadAyahToStep();
        }
    }
}

function updateStepIndicators() {
    for (let i = 1; i <= 5; i++) {
        const ind = document.getElementById(`ind-${i}`);
        if (!ind) continue;
        
        ind.className = 'step-indicator';
        if (i < currentStep) {
            ind.classList.add('step-indicator--completed');
        } else if (i === currentStep) {
            ind.classList.add('step-indicator--active');
        }
    }
}

// --- AUDIO PLAYER LOGIC ---
function toggleAudio() {
    const icon = document.getElementById('audio-icon');
    const btn = document.getElementById('play-pause-audio-btn');
    
    if (isAudioPlaying) {
        stopAudio();
    } else {
        audioPlayer.play();
        isAudioPlaying = true;
        if (icon) {
            icon.setAttribute('data-lucide', 'square');
            if (window.lucide) lucide.createIcons();
        }
        if (btn) btn.classList.add('audio-btn--playing');
    }
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isAudioPlaying = false;
    
    const icon = document.getElementById('audio-icon');
    const btn = document.getElementById('play-pause-audio-btn');
    
    if (icon) {
        icon.setAttribute('data-lucide', 'play');
        if (window.lucide) lucide.createIcons();
    }
    if (btn) btn.classList.remove('audio-btn--playing');
}

audioPlayer.onended = () => {
    stopAudio();
};

// --- DATABASE SERVICE (HIFDH PROGRESS) ---
const DB_NAME = 'hayat_db';
const DB_VERSION = 1;
const HIFDH_STORE = 'hifdh_progress';

function initHifdhDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(HIFDH_STORE)) {
                db.createObjectStore(HIFDH_STORE, { keyPath: 'key' });
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

async function saveAyahToIndexedDB() {
    const ayah = sessionAyahs[currentSessionIndex];
    const key = `${currentSurahNumber}_${ayah.numberInSurah}`;

    try {
        const db = await initHifdhDB();
        const transaction = db.transaction(HIFDH_STORE, 'readwrite');
        const store = transaction.objectStore(HIFDH_STORE);
        
        const item = {
            key: key,
            surahNumber: currentSurahNumber,
            ayahNumber: ayah.numberInSurah,
            memorizedDate: new Date().getTime(),
            nextReviewDate: new Date().getTime() + (24 * 60 * 60 * 1000), // Spaced Repetition: 24h review
            intervalDays: 1,
            repetitionCount: 1
        };

        const req = store.put(item);
        req.onsuccess = () => {
            alert(`Elhamdulilah! Ajeti ${ayah.numberInSurah} u ruajt në ditarin tënd të memorizimit.`);
            handleNextStep();
        };
    } catch (e) {
        // Fallback në rast përditësimi versioni të IndexedDB pa refresh
        const reqOpen = indexedDB.open(DB_NAME, DB_VERSION + 1);
        reqOpen.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(HIFDH_STORE)) {
                db.createObjectStore(HIFDH_STORE, { keyPath: 'key' });
            }
        };
        reqOpen.onsuccess = (e) => {
            const db = e.target.result;
            const transaction = db.transaction(HIFDH_STORE, 'readwrite');
            const store = transaction.objectStore(HIFDH_STORE);
            const item = {
                key: key,
                surahNumber: currentSurahNumber,
                ayahNumber: ayah.numberInSurah,
                memorizedDate: new Date().getTime(),
                nextReviewDate: new Date().getTime() + (24 * 60 * 60 * 1000),
                intervalDays: 1,
                repetitionCount: 1
            };
            store.put(item);
            alert(`Elhamdulilah! Ajeti ${ayah.numberInSurah} u ruajt me sukses!`);
            handleNextStep();
        };
    }
}
