/**
 * 🕋 Hayat - Moduli i Kibles
 * Llogaritja Sferike dhe Menaxhimi i Busullës (DeviceOrientation API)
 */

document.addEventListener('DOMContentLoaded', () => {
    const compassRing = document.getElementById('compass-ring');
    const qiblaDegreeEl = document.getElementById('qibla-degree');
    const qiblaStatus = document.getElementById('qibla-status');
    const btnCalibrate = document.getElementById('btn-calibrate');
    const calibrationMsg = document.getElementById('calibration-msg');

    // Koordinatat e Qabes (Meka)
    const MECCA_LAT = 21.4225;
    const MECCA_LNG = 39.8262;

    // Koordinatat e përdoruesit (Për momentin Default: Tiranë)
    // TODO: Në të ardhmen mund ta lidhim me navigator.geolocation
    let userLat = 41.3275;
    let userLng = 19.8187;
    let qiblaAngle = 0;

    /**
     * Llogarit Drejtimin e Kibles (Këndin)
     * Bazohet në trigonometrinë sferike për distancën më të shkurtër
     */
    function calculateQibla(lat, lng) {
        const latK = MECCA_LAT * Math.PI / 180.0;
        const lngK = MECCA_LNG * Math.PI / 180.0;
        const phi = lat * Math.PI / 180.0;
        const lambda = lng * Math.PI / 180.0;
        
        const y = Math.sin(lngK - lambda);
        const x = Math.cos(phi) * Math.tan(latK) - Math.sin(phi) * Math.cos(lngK - lambda);
        let qibla = Math.atan2(y, x) * 180.0 / Math.PI;
        
        return (qibla + 360) % 360;
    }

    // Inicializimi fillestar i këndit të llogaritur
    qiblaAngle = calculateQibla(userLat, userLng);
    qiblaDegreeEl.innerText = `${Math.round(qiblaAngle)}°`;

    /**
     * Përditësimi i animacionit të busullës kur rrotullohet telefoni
     */
    function handleOrientation(event) {
        let alpha = event.alpha; // Rrotullimi standard (0-360)
        let webkitAlpha = event.webkitCompassHeading; // Specifike për iOS për saktësi
        
        let heading = webkitAlpha || (360 - alpha);
        
        // Parandalojmë error-et nëse pajisja nuk kthen të dhëna
        if (heading === null || isNaN(heading)) {
            qiblaStatus.innerText = "Senzori nuk kthen të dhëna.";
            return;
        }

        // Llogarisim këndin përfundimtar për rrotullimin e CSS
        let compassRotation = qiblaAngle - heading;
        
        // Aplikojmë rrotullimin në elementin vizual
        compassRing.style.transform = `rotate(${compassRotation}deg)`;
        qiblaStatus.innerText = "Busulla Aktive";
        qiblaStatus.style.color = "var(--color-success)";
    }

    /**
     * Kërkimi i lejes për pajisjet iOS 13+ (Detyrueshme kërkon ndërveprimin e përdoruesit)
     */
    btnCalibrate.addEventListener('click', () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Logjika për iPhone/iOS
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        btnCalibrate.style.display = 'none';
                        calibrationMsg.style.display = 'block';
                    } else {
                        qiblaStatus.innerText = "Ju refuzuat lejen e sensorit.";
                        qiblaStatus.style.color = "var(--color-danger)";
                    }
                })
                .catch(error => {
                    console.error(error);
                    qiblaStatus.innerText = "Gabim gjatë kërkimit të lejes.";
                });
        } else {
            // Për Android ose pajisje të tjera që nuk kërkojnë requestPermission
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            window.addEventListener('deviceorientation', handleOrientation, true); // Fallback
            btnCalibrate.style.display = 'none';
            calibrationMsg.style.display = 'block';
        }
    });
});
