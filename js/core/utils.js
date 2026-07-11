/**
 * Core Utilities (utils.js)
 * Funksione ndihmëse për data, kohën, dhe formatime
 */

export const Utils = {
  /**
   * Kthen një përshëndetje në shqip bazuar në orën e pajisjes
   * @returns {string}
   */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Mirëmengjes';
    if (hour >= 12 && hour < 18) return 'Mirëdita';
    if (hour >= 18 && hour < 22) return 'Mirëmbrëma';
    return 'Natën e mirë';
  },

  /**
   * Formaton datën aktuale në formatin Gregoian (Shqip)
   * p.sh. "E Xhuma, 10 Korrik 2026"
   * @returns {string}
   */
  getFormattedDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // Using 'sq-AL' locale for Albanian
    return new Intl.DateTimeFormat('sq-AL', options).format(new Date());
  },

  /**
   * Gjeneron datën Hixhri (Islamike) duke përdorur API-në native të JS
   * p.sh. "Muharram 26, 1448 AH"
   * @returns {string}
   */
  getHijriDate() {
    try {
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      // 'islamic-umalqura' is generally the most accurate standard calendar algorithm in JS
      return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', options).format(new Date());
    } catch (e) {
      console.error('[Utils] Error parsing Hijri date', e);
      return 'Data Hixhri e padisponueshme';
    }
  },

  /**
   * Konverton minutat në formatin HH:MM
   * @param {number} totalMinutes 
   * @returns {string}
   */
  formatTimeLeft(totalMinutes) {
    if (totalMinutes < 0) return "00:00";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
};
