/**
 * 🕋 Hayat - Moduli i Dhikrit pas Namazit
 * Logjika e sekuencës 8-hapëshe
 */

let currentStep = 0;
let currentCount = 0;
let dhikrSequence = [];

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('../js/data/dhikr-after-prayer.json');
    const data = await response.json();
    dhikrSequence = data.sequence;

    renderStep();

    document.getElementById('btn-count').addEventListener('click', handleCount);
});

function renderStep() {
    const step = dhikrSequence[currentStep];
    document.getElementById('dhikr-step-count').innerText = `${currentStep + 1} / ${dhikrSequence.length}`;
    document.getElementById('dhikr-title').innerText = `Dhikri ${currentStep + 1}/${dhikrSequence.length}`;
    document.getElementById('dhikr-arabic').innerText = step.arabic;
    document.getElementById('dhikr-latin').innerText = step.latin;
    document.getElementById('dhikr-translation').innerText = step.translation;
    document.getElementById('dhikr-target').innerText = `nga ${step.repeat}`;
    document.getElementById('btn-count').innerText = currentCount;
    
    // Përditëso progress bar
    const progress = ((currentStep) / dhikrSequence.length) * 100;
    document.getElementById('dhikr-progress').style.width = `${progress}%`;
}

function handleCount() {
    currentCount++;
    const step = dhikrSequence[currentStep];
    
    // Vibrim 30ms (nëse suportohet nga pajisja)
    if (navigator.vibrate) navigator.vibrate(30);

    // Animacion klikimi
    document.getElementById('btn-count').classList.add('animate-bounce-click');
    setTimeout(() => document.getElementById('btn-count').classList.remove('animate-bounce-click'), 150);

    document.getElementById('btn-count').innerText = currentCount;

    // Kontrollo nëse u arrit targeti
    if (currentCount >= step.repeat) {
        currentStep++;
        currentCount = 0;
        
        if (currentStep < dhikrSequence.length) {
            renderStep();
        } else {
            showCompletion();
        }
    }
}

function showCompletion() {
    document.querySelector('main').innerHTML = `
        <div class="card card--padding-lg animate-scale-in" style="text-align: center;">
            <h2 style="color: var(--color-accent-gold);">✨ Ma sha Allah!</h2>
            <p>Përfundove dhikrin pas namazit.</p>
            <br>
            <button class="btn btn--primary btn--lg" onclick="window.location.href='prayer.html'">Kthehu te Namazi</button>
        </div>
    `;
}
