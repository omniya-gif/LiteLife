import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }));
      return;
    }

    const geoSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false
      });
    };

    const geoError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    };

    navigator.geolocation.getCurrentPosition(
      geoSuccess,
      geoError,
      {
        enableHighAccuracy: options.enableHighAccuracy || true,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0
      }
    );
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return state;
};