/**
 * 🕋 Hayat - Moduli i Mburojës (Detajet e Duasë)
 * Menaxhon numëruesin, të preferuarat dhe UI-në e lutjes
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Marrim ID-në e lutjes nga URL (p.sh. ?id=dua_hasbunallah)
    const urlParams = new URLSearchParams(window.location.search);
    const duaId = urlParams.get('id');

    if (!duaId) {
        alert("Lutja nuk u gjet!");
        window.location.href = 'mburoja.html';
        return;
    }

    // Elementet e DOM
    const elTitle = document.getElementById('dua-title');
    const elArabic = document.getElementById('dua-arabic');
    const elTransliteration = document.getElementById('dua-transliteration');
    const elTranslation = document.getElementById('dua-translation');
    const elVirtue = document.getElementById('dua-virtue');
    const elVirtueCard = document.getElementById('dua-virtue-card');
    const elSource = document.getElementById('dua-source');
    
    const elCounter = document.getElementById('dua-counter');
    const elTarget = document.getElementById('dua-target');
    const elRepeatBadge = document.getElementById('dua-repeat-badge');
    const btnCount = document.getElementById('btn-count-dua');
    const iconComplete = document.getElementById('dua-complete-icon');
    const btnFavorite = document.getElementById('btn-favorite');

    let currentCount = 0;
    let targetCount = 1;
    let currentDua = null;

    // 2. Kërkojmë lutjen në skedarët JSON (Për momentin kërkojmë te anxiety)
    // Në një version të avancuar, ky funksion do kërkonte në të gjitha kategoritë
    try {
        const response = await fetch('../js/data/duas/duas-anxiety.json');
        const data = await response.json();
        
        currentDua = data.duas.find(d => d.id === duaId);
        
        if (!currentDua) {
            throw new Error("Lutja nuk ekziston në këtë kategori.");
        }

        // 3. Mbushim Ndërfaqen (UI)
        elTitle.innerText = currentDua.name;
        elArabic.innerText = currentDua.arabic;
        elTransliteration.innerText = currentDua.transliteration;
        elTranslation.innerText = currentDua.translation;
        elSource.innerText = currentDua.source;

        if (currentDua.virtue) {
            elVirtue.innerText = currentDua.virtue;
            elVirtueCard.style.display = 'block';
        } else {
            elVirtueCard.style.display = 'none';
        }

        targetCount = currentDua.repeat || 1;
        elTarget.innerText = targetCount;
        elRepeatBadge.innerText = `${targetCount}x`;

        checkFavoriteStatus();

    } catch (error) {
        console.error("Gabim në ngarkimin e lutjes:", error);
        elArabic.innerText = "Gabim në ngarkim.";
    }

    // 4. Logjika e Numëruesit
    btnCount.addEventListener('click', () => {
        if (currentCount < targetCount) {
            currentCount++;
            elCounter.innerText = currentCount;
            
            // Vibrim i lehtë për çdo klikim (Haptic Feedback)
            if (navigator.vibrate) navigator.vibrate(20);
            
            // Efekt vizual te butoni
            btnCount.classList.add('animate-bounce-click');
            setTimeout(() => btnCount.classList.remove('animate-bounce-click'), 150);

            // Kur arrin targetin
            if (currentCount === targetCount) {
                iconComplete.style.color = 'var(--color-success)';
                btnCount.disabled = true;
                btnCount.innerHTML = '<i data-lucide="check"></i> E Përfunduar';
                btnCount.classList.replace('btn--primary', 'btn--ghost');
                btnCount.style.borderColor = 'var(--color-success)';
                btnCount.style.color = 'var(--color-success)';
                if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Vibrim suksesi
                if (window.lucide) window.lucide.createIcons();
            }
        }
    });

    // 5. Logjika e Të Preferuarave (Favorites)
    function checkFavoriteStatus() {
        let favorites = JSON.parse(localStorage.getItem('mburoja_favorites') || '[]');
        if (favorites.includes(duaId)) {
            btnFavorite.querySelector('i').setAttribute('fill', 'currentColor');
            btnFavorite.style.color = 'var(--color-danger)';
        }
    }

    btnFavorite.addEventListener('click', () => {
        let favorites = JSON.parse(localStorage.getItem('mburoja_favorites') || '[]');
        const icon = btnFavorite.querySelector('i');
        
        if (favorites.includes(duaId)) {
            // Hiq nga të preferuarat
            favorites = favorites.filter(id => id !== duaId);
            icon.removeAttribute('fill');
            btnFavorite.style.color = 'inherit';
        } else {
            // Shto te të preferuarat
            favorites.push(duaId);
            icon.setAttribute('fill', 'currentColor');
            btnFavorite.style.color = 'var(--color-danger)';
            // Animacion i lehtë
            btnFavorite.style.transform = 'scale(1.2)';
            setTimeout(() => btnFavorite.style.transform = 'scale(1)', 200);
        }
        
        localStorage.setItem('mburoja_favorites', JSON.stringify(favorites));
    });
});
