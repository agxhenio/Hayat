/**
 * Hayat — Location Service
 *
 * Wraps the browser Geolocation API with error mapping.
 * No automatic location requests — only on explicit user action.
 *
 * @module services/location
 */

// ====================================================================
// ERROR CLASS
// ====================================================================

/**
 * Location error with code and recoverability flag.
 */
export class LocationError extends Error {
  constructor(message, code, options) {
    super(message);
    this.name = 'LocationError';
    this.code = code;
    this.recoverable = (options && options.recoverable !== undefined) ? options.recoverable : true;
    if (options && options.cause) {
      this.cause = options.cause;
    }
  }
}

// ====================================================================
// GEOLOCATION WRAPPER
// ====================================================================

/**
 * Request current position from browser geolocation.
 *
 * @param {Object} [options] - Geolocation options.
 * @param {boolean} [options.enableHighAccuracy=true] - Use high accuracy.
 * @param {number} [options.timeout=10000] - Timeout in milliseconds.
 * @param {number} [options.maximumAge=300000] - Maximum age of cached position (5 min).
 * @returns {Promise<Object>} { latitude, longitude, accuracy, timestamp }
 * @throws {LocationError} On failure.
 */
export function requestCurrentPosition(options) {
  var opts = options || {};

  return new Promise(function (resolve, reject) {
    // Check if geolocation is supported
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new LocationError(
        'Geolokacioni nuk mbështetet nga ky shfletues',
        'UNSUPPORTED',
        { recoverable: false }
      ));
      return;
    }

    var geoOptions = {
      enableHighAccuracy: opts.enableHighAccuracy !== false,
      timeout: opts.timeout || 10000,
      maximumAge: opts.maximumAge || (5 * 60 * 1000)
    };

    navigator.geolocation.getCurrentPosition(
      function (position) {
        var coords = position.coords;

        // Validate coordinates
        if (typeof coords.latitude !== 'number' || !isFinite(coords.latitude) ||
            coords.latitude < -90 || coords.latitude > 90) {
          reject(new LocationError(
            'Koordinatat e marra janë të pavlefshme',
            'POSITION_UNAVAILABLE',
            { recoverable: true }
          ));
          return;
        }

        if (typeof coords.longitude !== 'number' || !isFinite(coords.longitude) ||
            coords.longitude < -180 || coords.longitude > 180) {
          reject(new LocationError(
            'Koordinatat e marra janë të pavlefshme',
            'POSITION_UNAVAILABLE',
            { recoverable: true }
          ));
          return;
        }

        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          timestamp: position.timestamp
        });
      },
      function (error) {
        var code, message, recoverable;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message = 'Leja për vendndodhjen u refuzua. Aktivizoni lejet në cilësimet e shfletuesit.';
            recoverable = true;
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            message = 'Vendndodhja nuk mund të përcaktohet. Provoni përsëri.';
            recoverable = true;
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'Kërkesa për vendndodhjen dështoi. Provoni përsëri.';
            recoverable = true;
            break;
          default:
            code = 'UNKNOWN';
            message = 'Ndodhi një gabim i panjohur gjatë marrjes së vendndodhjes.';
            recoverable = true;
        }

        reject(new LocationError(message, code, {
          recoverable: recoverable,
          cause: error
        }));
      },
      geoOptions
    );
  });
}

// ====================================================================
// PRESETS
// ====================================================================

/**
 * Tirana preset coordinates and metadata.
 */
export var TIRANA_PRESET = Object.freeze({
  city: 'Tiranë',
  country: 'Shqipëri',
  latitude: 41.3275,
  longitude: 19.8187,
  timeZone: 'Europe/Tirane'
});
