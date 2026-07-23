/** Hayat — local Qibla bearing calculation. */
const KAABA = Object.freeze({ latitude: 21.4225, longitude: 39.8262 });
function radians(value) { return value * Math.PI / 180; }
function degrees(value) { return value * 180 / Math.PI; }
export function qiblaBearing(latitude, longitude) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new TypeError('Invalid coordinates');
  const phi1 = radians(latitude); const phi2 = radians(KAABA.latitude); const delta = radians(KAABA.longitude - longitude);
  const y = Math.sin(delta) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(delta);
  return (degrees(Math.atan2(y, x)) + 360) % 360;
}
export function qiblaDirectionSq(bearing) {
  const directions = ['Veri', 'Verilindje', 'Lindje', 'Juglindje', 'Jug', 'Jugperëndim', 'Perëndim', 'Veriperëndim'];
  return directions[Math.round(bearing / 45) % 8];
}
