import { useState, useEffect, useCallback } from 'react';
import type { UserLocation } from '../types';

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 0, // Don't use cached position for manual refresh
    };

    const handleSuccess = (position: GeolocationPosition) => {
      console.log('Location obtained:', position.coords.latitude, position.coords.longitude, 'Accuracy:', position.coords.accuracy);
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setAccuracy(position.coords.accuracy);
      setError(null);
      setLoading(false);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
      let errorMessage = 'Unable to retrieve location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Please check your GPS or network connection.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return { location, loading, error, accuracy, refreshLocation: getCurrentLocation };
}
