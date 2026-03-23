import { useEffect, useRef } from 'react';
import apiService from '../services/api';

const MIN_UPDATE_INTERVAL_MS = 10000; // FIX: Minimum 10 seconds between API calls
const MIN_DISTANCE_METERS = 20;       // FIX: Only send update if moved at least 20m

// Haversine distance in meters between two lat/lng points
const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const useDeliveryLocationUpdater = (isActive) => {
  const intervalRef = useRef(null);
  const lastSentRef = useRef({ lat: null, lng: null, time: 0 });

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      return;
    }

    const updateLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const now = Date.now();
          const last = lastSentRef.current;

          // FIX: Skip update if not enough time has passed
          if (now - last.time < MIN_UPDATE_INTERVAL_MS) return;

          // FIX: Skip update if hasn't moved enough
          if (last.lat !== null && last.lng !== null) {
            const dist = getDistanceMeters(last.lat, last.lng, lat, lng);
            if (dist < MIN_DISTANCE_METERS) return;
          }

          try {
            await apiService.updateDeliveryLocation({ lat, lng });
            lastSentRef.current = { lat, lng, time: now };
          } catch (err) {
            console.error('Location update failed:', err.message);
          }
        },
        (err) => console.warn('Geolocation error:', err.message),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    updateLocation();
    intervalRef.current = setInterval(updateLocation, 10000);
    return () => clearInterval(intervalRef.current);
  }, [isActive]);
};

export default useDeliveryLocationUpdater;
