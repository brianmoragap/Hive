export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Looks up an address or place name via OpenStreetMap's Nominatim search,
 * matching the map tiles already used by LocationPicker. Returns the best
 * match, or null if nothing was found / the query was empty.
 */
export async function geocodeAddress(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult | null> {
  const trimmed = query.trim();

  if (trimmed.length < 3) {
    return null;
  }

  // Hive is Chile-only (RUT verification, +56 phone defaults, etc.), so bias
  // results toward Chile to avoid homonym places in other countries winning.
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cl&q=${encodeURIComponent(trimmed)}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'es',
      'User-Agent': 'HiveApp/1.0 (community meeting point search)',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed (${response.status})`);
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];

  if (!first) {
    return null;
  }

  const latitude = Number.parseFloat(first.lat);
  const longitude = Number.parseFloat(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude, displayName: first.display_name };
}
