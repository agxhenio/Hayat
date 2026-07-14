# 🕋 Hayat - PWA State Manifest (2026)

Ky dokument është "burimi i vetëm i së vërtetës" për projektin Hayat. 
Përdoret për të ruajtur kontekstin teknik midis chateve (brancheve) të ndryshme.

## 📌 Statusi i Zhvillimit të Moduleve

### Faza 1: Core & Design System ⏳ [E Përfunduar]
- [x] `manifest.json` & `sw.js` (Baza e PWA dhe Cache Offline)
- [x] `js/db.js` (Arkitektura e IndexedDB për datat historike)
- [x] `css/variables.css` & `css/components.css` (Design Tokens & 15 Komponentët)
- [x] `css/reset.css`, `css/base.css`, `css/animations.css`, `css/themes.css`, `css/main.css`
- [x] `preview.html` (Verifikimi Vizual i Sistemit)

### Faza 2: Spiritual Tracker 📅 [E Përfunduar]
- [x] Moduli i Namazit (Komplet - `prayer.html` dhe logjika)
- [x] Moduli i Dhikrit (`dhikr.html`, `dhikr.js`, `dhikr-list.json`)
- [x] Moduli "Mburoja" (Kategoritë `categories.json`, UI Kryesor, Logjika e listimit, UI i detajeve të duasë, Logjika `dua-detail.js`)
- [x] Dashboard-i Inteligjent (`index.html`, `css/dashboard.css`, `js/modules/dashboard.js` me integrim të plotë të AlQuran API për ajetin e ditës shqip-arabisht)

### Faza 3: Quran & AI 📖 [Në Pritje]
- [ ] Reading Mode (4 modalitetet e shikimit, Mus'haf i Medines me Uthmanic Font)
- [ ] Memorization Mode (Hifdh me metodologjinë traditë me 5 hapa & Spaced Repetition)
- [ ] AI Quran Assistant (Kërkim hibrid me Gemini API + Validim strikt)

### Faza 4: Analytics & Productivity 📊 [Në Pritje]
- [ ] Moduli "Pasqyra" (Sistemi i pikëve 0-100, CSS charts pa librari, Insights)
- [ ] Moduli "Detyrat" (To-Do List me fokus Dunya & Akhirah, Nijeti islam)
- [ ] Moduli i Cilësimeve (Settings, Menaxhimi i Moduleve, Eksport/Import JSON & CSV)

---

## 🗄️ Specifikimet e Ruajtjes së të Dhënave (Data Schema)

| Çelësi (Key) | Sistemi | Struktura / Qëllimi |
| :--- | :--- | :--- |
| `hayat_settings` | `localStorage` | Tema, Gjuha, Qyteti, Metoda e llogaritjes |
| `hayat_modules` | `localStorage` | Statusi i moduleve (Aktiv/Çaktivizuar për navigim) |
| `hayat_prayer_log` | `IndexedDB` | Logu historik i namazeve |
| `hayat_quran_progress` | `IndexedDB` | Progresi i Tilawe dhe historia e Hifdhit |
| `hayat_tasks` | `IndexedDB` | Lista e detyrave, kategoritë, përsëritjet |
| `hayat_scores` | `localStorage` | Historia e pikëve ditore |

---

## ⏳ Shënimet e Chat-it Aktual
- **Data:** 14 Korrik 2026
- **Gjendja:** Integruam me sukses AlQuran API. Ajeti i ditës merr dinamikisht ajetin arabisht dhe përkthimin zyrtar të Sherif Ahmetit çdo ditë në bazë të numrit të ditës së vitit. Faza e Dashboard-it dhe pjesa "Spiritual Tracker" janë mbyllur plotësisht dhe pa asnjë gabim.