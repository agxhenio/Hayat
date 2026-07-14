/**
 * 🕋 Hayat - Quran API Service
 * Shërbimi për marrjen e të dhënave dhe ruajtjen e tyre në Cache për përdorim Offline.
 */

const QuranService = {
    // API URL bazë
    API_URL: "https://api.alquran.cloud/v1/surah",

    // Lista e 114 Sureve për t'u ngarkuar menjëherë në Dropdown
    SURAH_LIST: [
        { id: 1, name: "Al-Fatihah", verses: 7, translation: "Hapja" },
        { id: 2, name: "Al-Baqarah", verses: 286, translation: "Lopa" },
        { id: 3, name: "Ali 'Imran", verses: 200, translation: "Familja e Imranit" },
        { id: 4, name: "An-Nisa", verses: 176, translation: "Gratë" },
        { id: 5, name: "Al-Ma'idah", verses: 120, translation: "Sofra" },
        { id: 6, name: "Al-An'am", verses: 165, translation: "Bagetitë" },
        { id: 7, name: "Al-A'raf", verses: 206, translation: "Vendet e Larta" },
        { id: 8, name: "Al-Anfal", verses: 75, translation: "Plaçka e Luftës" },
        { id: 9, name: "At-Tawbah", verses: 129, translation: "Pendimi" },
        { id: 10, name: "Yunus", verses: 109, translation: "Junusi" },
        { id: 11, name: "Hud", verses: 123, translation: "Hudi" },
        { id: 12, name: "Yusuf", verses: 111, translation: "Jusufi" },
        { id: 13, name: "Ar-Ra'd", verses: 43, translation: "Bubullima" },
        { id: 14, name: "Ibrahim", verses: 52, translation: "Ibrahimi" },
        { id: 15, name: "Al-Hijr", verses: 99, translation: "Hixhri" },
        { id: 16, name: "An-Nahl", verses: 128, translation: "Bleta" },
        { id: 17, name: "Al-Isra", verses: 111, translation: "Udhëtimi i Natës" },
        { id: 18, name: "Al-Kahf", verses: 110, translation: "Shpella" },
        { id: 19, name: "Maryam", verses: 98, translation: "Merjeme" },
        { id: 20, name: "Taha", verses: 135, translation: "Taha" },
        { id: 21, name: "Al-Anbiya", verses: 112, translation: "Pejgamberët" },
        { id: 22, name: "Al-Hajj", verses: 78, translation: "Haxhi" },
        { id: 23, name: "Al-Mu'minun", verses: 118, translation: "Besimtarët" },
        { id: 24, name: "An-Nur", verses: 64, translation: "Drita" },
        { id: 25, name: "Al-Furqan", verses: 77, translation: "Dalluesi" },
        { id: 26, name: "Ash-Shu'ara", verses: 227, translation: "Poetët" },
        { id: 27, name: "An-Naml", verses: 93, translation: "Milingona" },
        { id: 28, name: "Al-Qasas", verses: 88, translation: "Tregimet" },
        { id: 29, name: "Al-Ankabut", verses: 69, translation: "Merimanga" },
        { id: 30, name: "Ar-Rum", verses: 60, translation: "Romakët" },
        { id: 31, name: "Luqman", verses: 34, translation: "Lukmani" },
        { id: 32, name: "As-Sajdah", verses: 30, translation: "Përulja" },
        { id: 33, name: "Al-Ahzab", verses: 73, translation: "Aleatët" },
        { id: 34, name: "Saba", verses: 54, translation: "Saba" },
        { id: 35, name: "Fatir", verses: 45, translation: "Krijuesi" },
        { id: 36, name: "Ya-Sin", verses: 83, translation: "Jasin" },
        { id: 37, name: "As-Saffat", verses: 182, translation: "Të Rreshtuarit" },
        { id: 38, name: "Sad", verses: 88, translation: "Sad" },
        { id: 39, name: "Az-Zumar", verses: 75, translation: "Grupet" },
        { id: 40, name: "Ghafir", verses: 85, translation: "Falësi" },
        { id: 41, name: "Fussilat", verses: 54, translation: "Të Shpjeguara" },
        { id: 42, name: "Ash-Shura", verses: 53, translation: "Këshillimi" },
        { id: 43, name: "Az-Zukhruf", verses: 89, translation: "Ornametet" },
        { id: 44, name: "Ad-Dukhan", verses: 59, translation: "Tymi" },
        { id: 45, name: "Al-Jathiyah", verses: 37, translation: "Gjunjëzimi" },
        { id: 46, name: "Al-Ahqaf", verses: 35, translation: "Ahkafi" },
        { id: 47, name: "Muhammad", verses: 38, translation: "Muhammedi" },
        { id: 48, name: "Al-Fath", verses: 29, translation: "Fitorja" },
        { id: 49, name: "Al-Hujurat", verses: 18, translation: "Dhomat" },
        { id: 50, name: "Qaf", verses: 45, translation: "Kaf" },
        { id: 51, name: "Adh-Dhariyat", verses: 60, translation: "Era" },
        { id: 52, name: "At-Tur", verses: 49, translation: "Mali" },
        { id: 53, name: "An-Najm", verses: 62, translation: "Ylli" },
        { id: 54, name: "Al-Qamar", verses: 55, translation: "Hëna" },
        { id: 55, name: "Ar-Rahman", verses: 78, translation: "Mëshiruesi" },
        { id: 56, name: "Al-Waqi'ah", verses: 96, translation: "Ngjarja" },
        { id: 57, name: "Al-Hadid", verses: 29, translation: "Hekuri" },
        { id: 58, name: "Al-Mujadila", verses: 22, translation: "Ajo që Debaton" },
        { id: 59, name: "Al-Hashr", verses: 24, translation: "Dëbimi" },
        { id: 60, name: "Al-Mumtahanah", verses: 13, translation: "Ajo që Provohet" },
        { id: 61, name: "As-Saff", verses: 14, translation: "Rreshti" },
        { id: 62, name: "Al-Jumu'ah", verses: 11, translation: "E Premtja" },
        { id: 63, name: "Al-Munafiqun", verses: 11, translation: "Hipokritët" },
        { id: 64, name: "At-Taghabun", verses: 18, translation: "Humbje-Fitimi" },
        { id: 65, name: "At-Talaq", verses: 12, translation: "Shkurorëzimi" },
        { id: 66, name: "At-Tahrim", verses: 12, translation: "Ndalimi" },
        { id: 67, name: "Al-Mulk", verses: 30, translation: "Mundësia" },
        { id: 68, name: "Al-Qalam", verses: 52, translation: "Lapsi" },
        { id: 69, name: "Al-Haqqah", verses: 52, translation: "Realiteti i Paevitueshëm" },
        { id: 70, name: "Al-Ma'arij", verses: 44, translation: "Rrugët e Ngjitjes" },
        { id: 71, name: "Nuh", verses: 28, translation: "Nuhu" },
        { id: 72, name: "Al-Jinn", verses: 28, translation: "Xhindët" },
        { id: 73, name: "Al-Muzzammil", verses: 20, translation: "I Mbështjelli" },
        { id: 74, name: "Al-Muddaththir", verses: 56, translation: "I Mbuluari" },
        { id: 75, name: "Al-Qiyamah", verses: 40, translation: "Ringjallja" },
        { id: 76, name: "Al-Insan", verses: 31, translation: "Njeriu" },
        { id: 77, name: "Al-Mursalat", verses: 50, translation: "Të Dërguarit" },
        { id: 78, name: "An-Naba", verses: 40, translation: "Lajmi i Madh" },
        { id: 79, name: "An-Nazi'at", verses: 42, translation: "Shpirtshkulësit" },
        { id: 80, name: "Abasa", verses: 42, translation: "U Vrëndos" },
        { id: 81, name: "At-Takwir", verses: 29, translation: "Mbledhja e Dritës" },
        { id: 82, name: "Al-Infitar", verses: 19, translation: "Çarja" },
        { id: 83, name: "Al-Mutaffifin",-%22, verses: 36, translation: "Matësit e Mangët" },
        { id: 84, name: "Al-Inshiqaq", verses: 25, translation: "Çarja e Qiellit" },
        { id: 85, name: "Al-Buruj", verses: 22, translation: "Yjësitë" },
        { id: 86, name: "At-Tariq", verses: 17, translation: "Ylli i Mëngjesit" },
        { id: 87, name: "Al-A'la", verses: 19, translation: "Më i Larti" },
        { id: 88, name: "Al-Ghashiyah", verses: 26, translation: "Mbuluesi" },
        { id: 89, name: "Al-Fajr", verses: 30, translation: "Agimi" },
        { id: 90, name: "Al-Balad", verses: 20, translation: "Qyteti" },
        { id: 91, name: "Ash-Shams", verses: 15, translation: "Dielli" },
        { id: 92, name: "Al-Layl", verses: 21, translation: "Nata" },
        { id: 93, name: "Ad-Duha", verses: 11, translation: "Para-dreka" },
        { id: 94, name: "Ash-Sharh", verses: 8, translation: "Hapja e Gjoksit" },
        { id: 95, name: "At-Tin", verses: 8, translation: "Fiku" },
        { id: 96, name: "Al-Alaq", verses: 19, translation: "Pika e Gjakut" },
        { id: 97, name: "Al-Qadr", verses: 5, translation: "Nata e Kadrit" },
        { id: 98, name: "Al-Bayyinah", verses: 8, translation: "Dëshmia e Qartë" },
        { id: 99, name: "Az-Zalzalah", verses: 8, translation: "Tërmeti" },
        { id: 100, name: "Al-Adiyat", verses: 11, translation: "Të Vrapuarit" },
        { id: 101, name: "Al-Qari'ah", verses: 11, translation: "Tronditja" },
        { id: 102, name: "At-Takathur", verses: 8, translation: "Gara për Shumicë" },
        { id: 103, name: "Al-Asr", verses: 3, translation: "Koha" },
        { id: 104, name: "Al-Humazah", verses: 9, translation: "Përgojuesi" },
        { id: 105, name: "Al-Fil", verses: 5, translation: "Elefanti" },
        { id: 106, name: "Quraysh", verses: 4, translation: "Kurejshët" },
        { id: 107, name: "Al-Ma'un", verses: 7, translation: "Ndihma e Vogël" },
        { id: 108, name: "Al-Kawthar", verses: 3, translation: "Keutheri" },
        { id: 109, name: "Al-Kafirun", verses: 6, translation: "Jobesimtarët" },
        { id: 110, name: "An-Nasr", verses: 3, translation: "Ndihma" },
        { id: 111, name: "Al-Masad", verses: 5, translation: "Fijet e Palmës" },
        { id: 112, name: "Al-Ikhlas", verses: 4, translation: "Sinqeriteti (Ihllasi)" },
        { id: 113, name: "Al-Falaq", verses: 5, translation: "Agimi" },
        { id: 114, name: "An-Nas", verses: 6, translation: "Njerëzit" }
    ],

    /**
     * Merr të gjithë suret për listimin fillestar
     */
    getSurahList: function() {
        return this.SURAH_LIST;
    },

    /**
     * Shkarkon ajetet (Arabisht + Përkthim) për një sure të caktuar
     * Përdor offline cache nëse ekziston.
     */
    getSurah: async function(surahNumber) {
        const cacheKey = `quran_surah_${surahNumber}`;
        
        // 1. Shiko nëse ekziston në Cache (LocalStorage)
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            console.log(`Sura ${surahNumber} u ngarkua nga memoria Lokale (Offline).`);
            return JSON.parse(cachedData);
        }

        // 2. Nëse nuk është në cache, shkarko nga API (Uthmani Arabisht + Shqip Sherif Ahmeti)
        try {
            console.log(`Duke shkarkuar Suren ${surahNumber} nga API...`);
            const response = await fetch(`${this.API_URL}/${surahNumber}/editions/quran-uthmani,sq.ahmeti`);
            if (!response.ok) throw new Error("Dështoi shkarkimi i të dhënave.");

            const json = await response.data ? response : await response.json();
            
            // Formatimi i të dhënave që të jenë më të thjeshta për t'u përdorur
            const arabicVerses = json.data[0].ayahs;
            const albanianVerses = json.data[1].ayahs;
            
            const formattedSurah = {
                number: json.data[0].number,
                name: json.data[0].name,
                englishName: json.data[0].englishName,
                verses: arabicVerses.map((ayah, index) => ({
                    number: ayah.numberInSurah,
                    text: ayah.text,
                    translation: albanianVerses[index].text
                }))
            };

            // Ruaje në Cache për herën tjetër
            localStorage.setItem(cacheKey, JSON.stringify(formattedSurah));
            return formattedSurah;

        } catch (error) {
            console.error("Gabim gjatë marrjes së sures:", error);
            return null; // Do të trajtohet në UI
        }
    }
};
