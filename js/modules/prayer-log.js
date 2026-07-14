/**
 * 🕋 Hayat - Moduli i Regjistrimit të Namazit
 * Menaxhon ruajtjen e namazeve dhe shfaqjen dinamike të Suneteve
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializojmë databazën lokale
    await HayatDB.init();

    // 2. Gjejmë cili namaz po regjistrohet (Nga URL ose default Namazi aktual)
    // Për momentin do të marrim namazin e kaluar ose aktual nga PrayerTimesService
    const status = await PrayerTimesService.getCurrentAndNextPrayer();
    // Nëse nuk ka kaluar asnjë namaz sot, marrim Fajr. Përndryshe marrim namazin aktual ose të fundit.
    const activePrayerId = status && status.current ? status.current.id.toLowerCase() : 'dhuhr'; // Fallback
    
    document.getElementById('log-prayer-name').innerText = PrayerTimesService.prayerNames[activePrayerId.charAt(0).toUpperCase() + activePrayerId.slice(1)] || 'Namazi';
    document.getElementById('log-prayer-date').innerText = new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' });

    // 3. Ngarkojmë të dhënat e Suneteve nga JSON
    try {
        const response = await fetch('../js/data/sunnah-prayers.json');
        const data = await response.json();
        const prayerData = data.prayer_rakats[activePrayerId];

        if (prayerData && prayerData.sunnah) {
            const sunnahContainer = document.getElementById('sunnah-container');
            const sunnahSection = document.getElementById('sunnah-section');
            const hadithContainer = document.getElementById('sunnah-hadith');
            
            let html = '';
            let hadithText = '';

            // Gjenerojmë checkboxes për secilin sunet (Para, Pas, Vitr)
            for (const [key, sunnah] of Object.entries(prayerData.sunnah)) {
                html += `
                    <label class="sunnah-item">
                        <input type="checkbox" name="sunnah_${key}" value="true" ${sunnah.type === 'muekked' ? 'checked' : ''}>
                        <div class="sunnah-info">
                            <h4>${sunnah.description}</h4>
                            <span class="badge badge--${sunnah.type === 'muekked' ? 'gold' : 'default'}">
                                ${sunnah.type === 'muekked' ? 'Sunet i Fortë' : 'Mustehab'}
                            </span>
                        </div>
                    </label>
                `;
                if (sunnah.hadith) hadithText = sunnah.hadith;
            }

            sunnahContainer.innerHTML = html;
            if (hadithText) {
                hadithContainer.innerText = hadithText;
            } else {
                hadithContainer.style.display = 'none';
            }
            
            sunnahSection.style.display = 'block';
        }
    } catch (error) {
        console.error("Gabim në ngarkimin e suneteve:", error);
    }

    // 4. Logjika e Ruajtjes së të dhënave
    async function savePrayerLog(withDhikr = false) {
        const selectedMethod = document.querySelector('input[name="prayer_method"]:checked');
        if (!selectedMethod) {
            alert("Të lutem zgjidh si u fale!");
            return;
        }

        const note = document.getElementById('prayer-note').value;
        
        // Mbledhim sunetet e zgjedhura
        const sunnahs = {};
        document.querySelectorAll('#sunnah-container input[type="checkbox"]').forEach(cb => {
            sunnahs[cb.name.replace('sunnah_', '')] = cb.checked;
        });

        const today = new Date().toISOString().split('T')[0];
        
        // Krijojmë objektin e rekordit
        const logEntry = {
            prayer_id: activePrayerId,
            status: 'completed',
            method: selectedMethod.value,
            sunnah: sunnahs,
            dhikr_completed: false, // Do të bëhet true nëse plotëson dhikrin
            time_logged: new Date().toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' }),
            note: note
        };

        // Ruajmë në IndexedDB. Ne e ruajmë të gjithë ditën si një objekt
        let dayLog = await HayatDB.getData('prayer_logs', today);
        if (!dayLog) {
            dayLog = { date: today, prayers: {} };
        }
        dayLog.prayers[activePrayerId] = logEntry;
        
        await HayatDB.saveData('prayer_logs', dayLog);
        console.log("Namazi u ruajt:", logEntry);

        // Drejtojmë përdoruesin
        if (withDhikr) {
            window.location.href = `prayer-dhikr.html?prayer=${activePrayerId}`;
        } else {
            window.location.href = 'prayer.html';
        }
    }

    // Event Listeners për butonat
    document.getElementById('btn-save-dhikr').addEventListener('click', () => savePrayerLog(true));
    document.getElementById('btn-save-only').addEventListener('click', () => savePrayerLog(false));
});
