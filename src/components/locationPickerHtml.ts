// Default meeting point when the organizer hasn't picked one yet (central Santiago, Chile).
export const DEFAULT_LOCATION = { latitude: -33.4489, longitude: -70.6693 };

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationPickerProps {
  /** Initial pin position. Read once on mount to avoid reloading the map on every change. */
  initialLatitude: number;
  initialLongitude: number;
  onChange: (coords: LatLng) => void;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

/**
 * Self-contained Leaflet + OpenStreetMap document. Rendered inside a WebView on
 * native and an <iframe srcDoc> on web. It reports the chosen coordinates back to
 * the host via postMessage (ReactNativeWebView on native, window.parent on web).
 */
export function buildLocationPickerHtml(lat: number, lng: number): string {
  const safeLat = Number.isFinite(lat) ? lat : DEFAULT_LOCATION.latitude;
  const safeLng = Number.isFinite(lng) ? lng : DEFAULT_LOCATION.longitude;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
  body { background: #e9e5e2; }
  .leaflet-control-attribution { font-size: 9px; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  (function () {
    function post(payload) {
      var msg = JSON.stringify(payload);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent) {
        window.parent.postMessage(msg, '*');
      }
    }
    try {
      var lat = ${safeLat};
      var lng = ${safeLng};
      var map = L.map('map', { zoomControl: true, attributionControl: true }).setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      var marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      function report(ll) {
        marker.setLatLng(ll);
        post({ type: 'location', lat: ll.lat, lng: ll.lng });
      }
      map.on('click', function (e) { report(e.latlng); });
      marker.on('dragend', function () { report(marker.getLatLng()); });
      post({ type: 'ready' });
    } catch (err) {
      post({ type: 'error', message: String(err) });
    }
  })();
</script>
</body>
</html>`;
}
