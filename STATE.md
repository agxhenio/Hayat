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
- [x] Dashboard-i Inteligjent (`index.html`, `css/dashboard.css`, `js/modules/dashboard.js`)
  - [x] Ndarja e kohës së namazit në dy bokse (Namazi aktual dhe Countdown)
  - [x] Ajeti i Ditës dinamik nga AlQuran API (Teksti arabisht + Përkthimi i Sherif Ahmetit)
  - [x] Rutina e Sotme me shfaqje inteligjente sipas kohës (Dhikri i Mëngjesit/Mbrëmjes, Dhikri i Gjumit, Sura Mulk dhe Sura Kehf të premteve)
  - [x] Slider horizontal për Përkujtesat e Ditës nga `js/data/reminders.json`
  - [x] Feed-i i videove të fundit nga kanali yt në YouTube (`UConxpMbEDBdeHC6LSdC0BfA`) nëpërmjet RSS pa çelës API

### Faza 3: Quran & AI 📖 [Në Punë e Sipër]
- [x] Reading Mode (4 modalitetet e shikimit, Mus'haf i Medines me Uthmanic Font, Dropdown i Sureve)
- [x] Bookmark & Progresi i Leximit (Këmbëza e leximit, ruajtja në IndexedDB dhe Smooth Scroll)
- [x] Memorization Mode (Hifdh - Ditari i memorizimit, audio looper, word-masking interaktiv dhe metodologjia me 5 hapa)
- [ ] AI Quran Assistant (Kërkim hibrid me Gemini API + Validim strikt)

### Faza 4: Analytics & Productivity 📊 [Në Pritje]
- [ ] Moduli "Pasqyra" (Sistemi i pikëve 0-100, CSS charts pa librari, Insights)
- [ ] Moduli "Detyrat" (To-Do List me fokus Dunya & Akhirah, Nijeti islam)
- [ ] Moduli i Cilësimeve (Settings, Menaxhimi i Moduleve, Eksport/Import JSON & CSV)

---

## 🗄️ Specifikimet e Ruajtjes së të Dhënave (Data Schema)

| Çelësi (Key) | Sistemi | Ndarja / Tabela | Struktura / Qëllimi |
| :--- | :--- | :--- | :--- |
| `hayat_settings` | `localStorage` | - | Tema, Gjuha, Qyteti, Metoda e llogaritjes |
| `hayat_modules` | `localStorage` | - | Statusi i moduleve (Aktiv/Çaktivizuar për navigim) |
| `hayat_prayer_log` | `IndexedDB` | `prayer_log` | Logu historik i namazeve |
| `hayat_quran_progress`| `IndexedDB` | `quran_progress` | Progresi i fundit i lexuar (Bookmark) |
| `hayat_hifdh` | `IndexedDB` | `hifdh_progress` | Datat e memorizimit dhe Spaced Repetition |
| `hayat_tasks` | `IndexedDB` | `tasks` | Lista e detyrave, kategoritë, përsëritjet |
| `hayat_scores` | `localStorage` | - | Historia e pikëve ditore |

---

## ⏳ Shënimet e Chat-it Aktual
- **Data:** 14 Korrik 2026
- **Gjendja:** Kemi mbyllur me sukses të plotë të gjithë sistemin bazë të leximit dhe memorizimit (Hifdh) të Kur'anit! Kemi krijuar një strukturë jashtëzakonisht unike me 5 hapa të plotë ku përdoruesi mund të dëgjojë Mishary Alafasy-n, të bëjë fshehjen e fjalëve arabisht (Word Masking) për t'u testuar, dhe të ruajë progresin direkt në IndexedDB për rishikimet e ardhshme.
