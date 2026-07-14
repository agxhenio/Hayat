/**
 * 🕋 Hayat - Moduli i Dashboard-it (Shtëpia)
 * Menaxhon llogaritjen e kohës, rrotullimin e ajetit të ditës, përkujtesat dhe videot e kanalit tënd
 */

async function fetchAyahOfTheDay() {
    const tani = new Date();
    const fillimiVitit = new Date(tani.getFullYear(), 0, 1);
    const ditaVitit = Math.floor((tani - fillimiVitit) / (1000 * 60 * 60 * 24)) + 1;
    const ayahId = (ditaVitit * 17) % 6236 + 1; 

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahId}/editions/quran-uthmani,sq.ahmeti`);
        const data = await response.json();
        
        if (data.status === "OK" && data.data && data.data.length === 2) {
            const arabicEl = document.getElementById('daily-ayah-arabic');
            const translationEl = document.getElementById('daily-ayah-translation');
            const referenceEl = document.getElementById('daily-ayah-reference');

            if (arabicEl) arabicEl.innerText = data.data[0].text;
            if (translationEl) translationEl.innerText = `"${data.data[1].text}"`;
            if (referenceEl) referenceEl.innerText = `Sura ${data.data[1].surah.englishName} - Ajeti ${data.data[1].numberInSurah}`;
        }
    } catch (error) {
        console.error("Gabim te ajeti i ditës:", error);
    }
}

async function loadDailyReminders() {
    try {
        const response = await fetch('js/data/reminders.json');
        const reminders = await response.json();
        const container = document.getElementById('reminders-container');
        if (!container) return;
        
        container.innerHTML = ''; 

        if (reminders && reminders.length > 0) {
            reminders.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card card--padding-md';
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <i data-lucide="heart" style="color: var(--color-accent-teal); width: 16px; height: 16px;"></i>
                        <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-text-muted);">${item.title}</span>
                    </div>
                    <p style="font-size: var(--font-size-sm); color: var(--color-text-primary); line-height: 1.5;">${item.text}</p>
                `;
                container.appendChild(card);
            });
            if (window.lucide) lucide.createIcons();
        }
    } catch (error) {
        console.error("Gabim gjatë ngarkimit të përkujtesave:", error);
    }
}

// RREGULLIMI I RI: Funksion "anti-plumb" për të nxjerrë ID-në e videos nga çdo lloj URL-je e YouTube
function getYouTubeId(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

// Merr videot e fundit nga kanali yt në YouTube pa API Key
async function fetchLatestVideos() {
    const channelId = 'UConxpMbEDBdeHC6LSdC0BfA'; 
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        const container = document.getElementById('videos-container');
        if (!container) return;
        
        container.innerHTML = ''; // Pastrojmë loading text

        if (data.status === 'ok' && data.items && data.items.length > 0) {
            // Marrim 3 videot e fundit
            const latestVideos = data.items.slice(0, 3);
            let addedVideosCount = 0;

            latestVideos.forEach(video => {
                const videoId = getYouTubeId(video.link);
                
                if (!videoId) return; // Nëse nuk gjejmë ID valide, e kapërcejmë
                
                addedVideosCount++;
                const card = document.createElement('div');
                card.className = 'card card--padding-md';
                card.style.marginBottom = 'var(--space-4)';
                
                card.innerHTML = `
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <i data-lucide="video" style="color: var(--color-danger); width: 16px; height: 16px;"></i>
                        <span style="font-size: var(--font-size-xs); font-weight: bold; color: var(--color-text-muted);">Video e re</span>
                    </div>
                    <h3 style="font-size: var(--font-size-md); font-weight: 600; margin-bottom: var(--space-2);">${video.title}</h3>
                    <div class="video-container">
                        <iframe 
                            src="https://www.youtube.com/embed/${videoId}" 
                            title="${video.title}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    </div>
                `;
                container.appendChild(card);
            });

            // Fallback nëse për ndonjë arsye asnjë video nuk kishte ID të saktë
            if (addedVideosCount === 0) {
                container.innerHTML = '<p style="font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-4);">Nuk u gjet asnjë video valide.</p>';
            }

            if (window.lucide) lucide.createIcons();
        } else {
            container.innerHTML = '<p style="font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-4);">Nuk u gjet asnjë video në këtë kanal.</p>';
        }
    } catch (error) {
        console.error("Gabim gjatë marrjes së feed-it nga YouTube:", error);
        const container = document.getElementById('videos-container');
        if (container) {
            container.innerHTML = '<p style="font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: center; padding: var(--space-4);">Dështoi ngarkimi i videove.</p>';
        }
    }
}

async function initDashboard() {
    let currentPrayer = '';
    if (typeof PrayerTimesService !== 'undefined') {
        const status = await PrayerTimesService.getCurrentAndNextPrayer();
        if (status) {
            const currentEl = document.getElementById('current-prayer-name');
            const countdownEl = document.getElementById('prayer-countdown');
            if (currentEl) currentEl.innerText = status.current ? status.current.name : '--';
            if (countdownEl) countdownEl.innerText = PrayerTimesService.getCountdownTo(status.next.time, status.next.isNextDay);
            if (status.current) currentPrayer = status.current.name;
        }
    }

    const tani = new Date();
    const ora = tani.getHours();
    const ditaJaves = tani.getDay(); 

    const elMorning = document.getElementById('reminder-morning');
    const elEvening = document.getElementById('reminder-evening');
    const elKahf = document.getElementById('reminder-kahf');
    const elMulk = document.getElementById('reminder-mulk');
    const elBedtime = document.getElementById('reminder-bedtime');

    if (currentPrayer === 'Sabahu' || (ora >= 4 && ora < 12)) {
        if (elMorning) elMorning.style.display = 'flex';
    } else {
        if (elMorning) elMorning.style.display = 'none';
    }

    if (currentPrayer === 'Ikindia' || currentPrayer === 'Akshami' || (ora >= 16 && ora < 21)) {
        if (elEvening) elEvening.style.display = 'flex';
    } else {
        if (elEvening) elEvening.style.display = 'none';
    }

    if (currentPrayer === 'Jacia' || ora >= 21 || ora < 4) {
        if (elBedtime) elBedtime.style.display = 'flex';
        if (elMulk) elMulk.style.display = 'flex';
    } else {
        if (elBedtime) elBedtime.style.display = 'none';
        if (elMulk) elMulk.style.display = 'none';
    }

    if (ditaJaves === 5) {
        if (elKahf) elKahf.style.display = 'flex';
    } else {
        if (elKahf) elKahf.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    fetchAyahOfTheDay();
    loadDailyReminders();
    fetchLatestVideos(); 
    setInterval(initDashboard, 1000); 
    
    if (window.lucide) {
        lucide.createIcons();
    }
});
