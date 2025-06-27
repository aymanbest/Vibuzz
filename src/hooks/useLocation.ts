import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserLocation } from '../types';

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [canSetManualLocation, setCanSetManualLocation] = useState(false);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  // Function to set location manually from map click
  const setUserLocation = useCallback((newLocation: UserLocation) => {
    setLocation(newLocation);
    setAccuracy(null); // Manual location doesn't have GPS accuracy
    setError(null);
    setLoading(false);
    setCanSetManualLocation(false);
    retryCountRef.current = 0;
    console.log('Manual location set:', newLocation);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser. Click on the map to set your location manually.');
      setCanSetManualLocation(true);
      setLoading(false);
      return;
    }

    // If we've already tried too many times, enable manual location setting
    if (retryCountRef.current >= maxRetries) {
      setError('Unable to get precise location after 5 attempts. Click on the map to set your location manually.');
      setCanSetManualLocation(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Progressive options - start with high accuracy, then reduce requirements
    const getOptions = (attemptNumber: number): PositionOptions => {
      if (attemptNumber <= 2) {
        return {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000, // Short cache for fresh location
        };
      } else if (attemptNumber <= 4) {
        return {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000, // Longer cache acceptable
        };
      } else {
        return {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000, // Any recent location is fine
        };
      }
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const currentAccuracy = position.coords.accuracy;
      console.log(`Location attempt ${retryCountRef.current + 1}:`, position.coords.latitude, position.coords.longitude, 'Accuracy:', currentAccuracy);
      
      // Accept location based on attempt number - be more lenient on later attempts
      const acceptableAccuracy = retryCountRef.current <= 2 ? 100 : retryCountRef.current <= 4 ? 300 : 1000;
      
      if (currentAccuracy <= acceptableAccuracy) {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setAccuracy(currentAccuracy);
        setError(null);
        setLoading(false);
        retryCountRef.current = 0; // Reset retry count on success
        
        if (currentAccuracy > 100) {
          console.warn('Location accuracy is moderate:', currentAccuracy, 'meters');
        }
      } else if (retryCountRef.current < maxRetries - 1) {
        // Try again with different settings
        retryCountRef.current++;
        console.log(`Accuracy too poor (${currentAccuracy}m), retrying... (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => {
          const options = getOptions(retryCountRef.current);
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        }, 1000); // Wait 1 second between attempts
      } else {
        // Final attempt failed, enable manual location
        setError(`Location accuracy is poor (${currentAccuracy}m). Click on the map to set your location manually.`);
        setCanSetManualLocation(true);
        setLoading(false);
        retryCountRef.current = 0;
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error(`Geolocation error (attempt ${retryCountRef.current + 1}):`, error);
      
      let errorMessage = 'Unable to retrieve location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Click on the map to set your location manually.';
          setCanSetManualLocation(true);
          setLoading(false);
          retryCountRef.current = 0;
          setError(errorMessage);
          return;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      if (retryCountRef.current < maxRetries - 1) {
        retryCountRef.current++;
        console.log(`Retrying location... (${retryCountRef.current}/${maxRetries})`);
        setTimeout(() => {
          const options = getOptions(retryCountRef.current);
          navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        }, 2000); // Wait 2 seconds between error retries
      } else {
        setError(errorMessage + ' Click on the map to set your location manually.');
        setCanSetManualLocation(true);
        setLoading(false);
        retryCountRef.current = 0;
      }
    };

    // Start the location attempt
    const options = getOptions(retryCountRef.current);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return { 
    location, 
    loading, 
    error, 
    accuracy, 
    refreshLocation: getCurrentLocation,
    setUserLocation,
    canSetManualLocation
  };
}
