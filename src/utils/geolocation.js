/**
 * Fetches current location and reverse geocodes to address.
 * Returns { address, city, state, pincode, lat, lng } or null on error.
 */
export const getCurrentLocationAddress = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data?.address) {
            const addr = data.address;
            resolve({
              address: [addr.road, addr.suburb, addr.neighbourhood, addr.house_number]
                .filter(Boolean)
                .join(', ')
                .replace(/^,\s*|\s*,$/g, '') || addr.road || '',
              city: addr.city || addr.town || addr.village || addr.county || '',
              state: addr.state || '',
              pincode: addr.postcode || '',
              lat: latitude,
              lng: longitude,
            });
          } else {
            reject(new Error('Could not fetch address details'));
          }
        } catch (err) {
          reject(err);
        }
      },
      (err) => reject(err),
      { enableHighAccuracy: true }
    );
  });
};
