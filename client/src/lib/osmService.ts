export interface OSMAddressResult {
  formattedAddress: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number;
  lon: number;
}

export const osmService = {
  /**
   * Detect current location using HTML5 Geolocation + OpenStreetMap Nominatim Reverse Geocoding
   */
  async detectCurrentLocation(): Promise<OSMAddressResult> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation is not supported by your browser.'));
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Query OpenStreetMap Nominatim Reverse Geocoding API
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'AmazonEnterprisePlatform/1.0',
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to resolve location via OpenStreetMap.');
            }

            const data = await response.json();
            const addr = data.address || {};

            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.state_district ||
              addr.county ||
              'Current Location';
            const state = addr.state || '';
            const postalCode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
            const road = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
            const house = addr.house_number || addr.building || '';

            const street = [house, road].filter(Boolean).join(', ') || data.display_name.split(',')[0];

            resolve({
              formattedAddress: data.display_name,
              street,
              city,
              state,
              postalCode,
              country: addr.country || 'India',
              lat: latitude,
              lon: longitude,
            });
          } catch (err: any) {
            reject(new Error(err.message || 'Location geocoding failed.'));
          }
        },
        (error) => {
          let msg = 'Unable to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow access or search manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location information unavailable.';
          } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  /**
   * Search Indian addresses and landmarks using OpenStreetMap Nominatim Search API
   */
  async searchAddress(query: string): Promise<OSMAddressResult[]> {
    if (!query || query.trim().length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query.trim()
        )}&countrycodes=in&addressdetails=1&limit=6`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'AmazonEnterprisePlatform/1.0',
          },
        }
      );

      if (!response.ok) return [];

      const results = await response.json();

      return results.map((item: any) => {
        const addr = item.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.county ||
          '';
        const state = addr.state || '';
        const postalCode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : '';
        const road = addr.road || addr.suburb || addr.neighbourhood || '';
        const house = addr.house_number || addr.building || '';

        const street = [house, road].filter(Boolean).join(', ') || item.display_name.split(',')[0];

        return {
          formattedAddress: item.display_name,
          street,
          city,
          state,
          postalCode,
          country: addr.country || 'India',
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        };
      });
    } catch (e) {
      return [];
    }
  },
};
