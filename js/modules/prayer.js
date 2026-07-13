let activePrayerCard = null;

// ==========================================
// FUNKSIONET E KUJTESËS (Local Storage)
// ==========================================

// Merr datën e sotme në formatin "YYYY-MM-DD" (p.sh. "2026-07-12")
function getTodayDate() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

// Ruan namazin në memorien e telefonit
function ruajNamazin(prayerName, method) {
    const today = getTodayDate();
    let savedData = JSON.parse(localStorage.getItem('hayat_prayers')) || {};
    
    if (!savedData[today]) {
        savedData[today] = {}; // Krijojmë një "dosje" të re për ditën e sotme
    }
    
    savedData[today][prayerName] = method; // P.sh. "Sabahu": "Në xhami me xhemat"
    localStorage.setItem('hayat_prayers', JSON.stringify(savedData));
}

// Ngarkon namazet kur hapet aplikacioni ose kur shkon te faqja "Namazi"
function ngarkoNamazetESotme() {
    const today = getTodayDate();
    let savedData = JSON.parse(localStorage.getItem('hayat_prayers')) || {};
    let todayPrayers = savedData[today] || {};

    document.querySelectorAll('.prayer-card').forEach(card => {
        const prayerName = card.querySelector('h3').innerText;
        const statusCircle = card.querySelector('.status-circle');
        
        // Nëse ky namaz ekziston në memorien e sotme, bëje të gjelbër
        if (todayPrayers[prayerName] && statusCircle) {
            statusCircle.style.background = '#2ECC71';
            statusCircle.style.borderColor = '#2ECC71';
            statusCircle.innerHTML = '<span style="color: white; font-size: 14px; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">✔</span>';
            card.classList.add('completed');
        }
    });
}

// ==========================================
// LOGJIKA E KLIKIMEVE TË DRITARES
// ==========================================

document.addEventListener('click', function(e) {
    
    // 1. KUR KLIKON NJË KARTË NAMAZI
    const card = e.target.closest('.prayer-card');
    if (card) {
        // Nëse tashmë është i falur, mund të duash të mos e hapësh dritaren (opsionale)
        // if (card.classList.contains('completed')) return; 

        activePrayerCard = card; 
        
        const bottomSheet = document.getElementById('global-bottom-sheet');
        const overlay = document.getElementById('global-overlay');
        const content = document.getElementById('bottom-sheet-content');

        if (!bottomSheet || !content) return;

        const prayerName = card.querySelector('h3').innerText;

        content.innerHTML = `
            <h3 style="text-align: center; color: white; margin-top: 0; margin-bottom: 24px; font-size: 18px;">
                Regjistro: ${prayerName}
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 20px;">
                <button class="prayer-action-btn" style="width: 100%; padding: 16px; background: #2A3441; border: 1px solid #374151; border-radius: 12px; color: white; text-align: left; font-size: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <span style="font-size: 20px;">🕌</span> Në xhami me xhemat
                </button>
                <button class="prayer-action-btn" style="width: 100%; padding: 16px; background: #2A3441; border: 1px solid #374151; border-radius: 12px; color: white; text-align: left; font-size: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <span style="font-size: 20px;">👨‍👦</span> Në shtëpi me xhemat
                </button>
                <button class="prayer-action-btn" style="width: 100%; padding: 16px; background: #2A3441; border: 1px solid #374151; border-radius: 12px; color: white; text-align: left; font-size: 16px; display: flex; align-items: center; gap: 12px; cursor: pointer;">
                    <span style="font-size: 20px;">🧎</span> Vetëm
                </button>
            </div>
        `;

        bottomSheet.classList.add('is-open');
        if(overlay) overlay.classList.add('is-open');
        return;
    }

    // 2. KUR KLIKON OPSIONET BRENDA DRITARES
    const actionBtn = e.target.closest('.prayer-action-btn');
    if (actionBtn && activePrayerCard) {
        
        const statusCircle = activePrayerCard.querySelector('.status-circle');
        const prayerName = activePrayerCard.querySelector('h3').innerText;
        const method = actionBtn.innerText.replace(/🕌|👨‍👦|🧎/g, '').trim(); // Heqim emojin para se ta ruajmë
        
        if (statusCircle) {
            statusCircle.style.background = '#2ECC71';
            statusCircle.style.borderColor = '#2ECC71';
            statusCircle.innerHTML = '<span style="color: white; font-size: 14px; display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">✔</span>';
            activePrayerCard.classList.add('completed');
        }

        // RUAJMË NË MEMORIE!
        ruajNamazin(prayerName, method);

        const bottomSheet = document.getElementById('global-bottom-sheet');
        const overlay = document.getElementById('global-overlay');
        if (bottomSheet) bottomSheet.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
        
        activePrayerCard = null;
        return;
    }

    // 3. KUR KLIKON SFONDIN E ZI
    if (e.target.id === 'global-overlay') {
        const bottomSheet = document.getElementById('global-bottom-sheet');
        if (bottomSheet) bottomSheet.classList.remove('is-open');
        e.target.classList.remove('is-open');
        activePrayerCard = null; 
    }
});

// ==========================================
// VËZHGUESI: Kontrollon kur hapet faqja e Namazit
// ==========================================
const appView = document.getElementById('app-view');
if (appView) {
    new MutationObserver(() => {
        // Sa herë që Routeri ndryshon faqen, kontrollojmë nëse jemi te Namazi
        if (document.querySelector('.prayer-list')) {
            ngarkoNamazetESotme(); // Lexon memorien dhe vizaton tik-et
        }
    }).observe(appView, { childList: true, subtree: true });
}
