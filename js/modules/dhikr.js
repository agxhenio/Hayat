/**
 * 🕋 Hayat - Moduli i Dhikrit
 */
let count = 0;
const btn = document.getElementById('btn-count');
const display = document.getElementById('count-display');

function increment() {
    count++;
    display.innerText = count;
    if (navigator.vibrate) navigator.vibrate(20);
}

function reset() {
    count = 0;
    display.innerText = count;
}
