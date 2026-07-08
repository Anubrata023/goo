// src/utils/geocoding.ts

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&countrycodes=in&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Find nearby places using Overpass API (FREE, no API key)
export async function findNearbyPlaces(lat: number, lng: number, amenity: string, radius: number = 3000) {
  try {
    const query = `[out:json];node["amenity"="${amenity}"](around:${radius},${lat},${lng});out;`;
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.elements || [];
  } catch (error) {
    console.error('Overpass API error:', error);
    return [];
  }
}
