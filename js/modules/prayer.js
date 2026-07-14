/**
 * 🕋 Hayat - Moduli i Namazit (UI Controller)
 * Menaxhon shfaqjen e kohëve dhe countdown-in
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Prayer Module Loaded");
    
    // Incializimi i elementeve të DOM
    const elHeroName = document.getElementById('hero-prayer-name');
    const elHeroTime = document.getElementById('hero-prayer-time');
    const elCountdown = document.getElementById('hero-countdown-timer');
    const elStatusBadge = document.getElementById('hero-status-badge');
    const elTimelineContainer = document.getElementById('prayer-timeline-container');
    const elHijriDate = document.getElementById('hijri-date-display');
    const elBtnMarkPrayed = document.getElementById('btn-mark-prayed');

    // 1. Marrim të dhënat nga Service
    const timings = await PrayerTimesService.getTodayTimings();
    if (!timings) {
        elHeroName.innerText = "Gabim";
        elHeroTime.innerText = "S'ka lidhje";
        return;
    }

    // Afishojmë datën hixhri
    elHijriDate.innerText = `• ${timings.hijri} ${timings.hijri_month}`;

    // 2. Gjenerojmë 5 kartat horizontale
    const schedule = [
        { id: 'Fajr', icon: '🌅' },
        { id: 'Dhuhr', icon: '☀️' },
        { id: 'Asr', icon: '🌆' },
        { id: 'Maghrib', icon: '🌇' },
        { id: 'Isha', icon: '🌙' }
    ];

    let timelineHTML = '';
    schedule.forEach(prayer => {
        timelineHTML += `
            <div class="prayer-mini-card" id="card-${prayer.id}">
                <span class="icon-placeholder">${prayer.icon}</span>
                <span class="name">${PrayerTimesService.prayerNames[prayer.id]}</span>
                <span class="time tabular-nums">${timings[prayer.id]}</span>
            </div>
        `;
    });
    elTimelineContainer.innerHTML = timelineHTML;

    // 3. Funksioni i përditësimit të kohës reale (Countdown)
    async function updateDashboard() {
        const status = await PrayerTimesService.getCurrentAndNextPrayer();
        if (!status || !status.next) return;

        // Përditëso UI bazuar te statusi
        elHeroName.innerText = status.next.name;
        elHeroTime.innerText = status.next.time;
        elCountdown.innerText = PrayerTimesService.getCountdownTo(status.next.time, status.next.isNextDay);

        // Ndryshimi i stilit nëse është koha aktuale vs namazi i radhës
        if (status.current) {
            elStatusBadge.innerText = "☀️ KOHA AKTUALE";
            elStatusBadge.className = "badge badge--gold";
        } else {
            elStatusBadge.innerText = "🌙 NAMAZI I ARDHSHËM";
            elStatusBadge.className = "badge badge--default";
        }

        // Highlight kartën aktive në timeline
        document.querySelectorAll('.prayer-mini-card').forEach(card => card.classList.remove('active'));
        const activeCardId = status.current ? `card-${status.current.id}` : `card-${status.next.id}`;
        const activeCard = document.getElementById(activeCardId);
        if (activeCard) {
            activeCard.classList.add('active');
            // Auto-scroll tek karta aktive
            activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Ekzekuto menjëherë, pastaj çdo 1 sekondë
    await updateDashboard();
    setInterval(updateDashboard, 1000);

    // Eventi i butonit "U fala" -> Drejton te faqja e regjistrimit (Prayer Log)
    elBtnMarkPrayed.addEventListener('click', () => {
        window.location.href = 'prayer-log.html';
    });
});
