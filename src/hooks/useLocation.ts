import { useCallback, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useStore, selectCurrentLocation, selectLocationPrecision } from '../stores/useStore';
import * as locationService from '../services/location';
import type { LocationData } from '../types';
import type { LocationSubscription } from 'expo-location';

export function useLocation() {
  const currentLocation = useStore(selectCurrentLocation);
  const locationPrecision = useStore(selectLocationPrecision);
  const { setCurrentLocation, setLocationPrecision, setPermissions, setError } = useStore();

  const watcherRef = useRef<LocationSubscription | null>(null);

  // Request location permission
  const requestPermission = useCallback(async () => {
    const granted = await locationService.requestLocationPermission();
    setPermissions({ location: granted ? 'granted' : 'denied' });
    return granted;
  }, [setPermissions]);

  // Check if location permission is granted
  const checkPermission = useCallback(async () => {
    const granted = await locationService.hasLocationPermission();
    setPermissions({ location: granted ? 'granted' : 'undetermined' });
    return granted;
  }, [setPermissions]);

  // Get current location with address
  const getCurrentLocation = useCallback(async (useExactLocation: boolean = false) => {
    const hasPermission = await locationService.hasLocationPermission();

    if (!hasPermission) {
      setError('Location permission not granted');
      return null;
    }

    // Use highest accuracy if exact location is requested
    const accuracy = useExactLocation 
      ? Location.Accuracy.Highest 
      : Location.Accuracy.Balanced;

    const { data, error } = await locationService.getCurrentLocationWithAddress(accuracy);

    if (error) {
      setError(error.message);
      return null;
    }

    if (data) {
      setCurrentLocation(data);
    }

    return data;
  }, [setCurrentLocation, setError]);

  // Refresh current location
  const refreshLocation = useCallback(async () => {
    return getCurrentLocation();
  }, [getCurrentLocation]);

  // Start watching location
  const startWatchingLocation = useCallback(async () => {
    const hasPermission = await locationService.hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    // Stop existing watcher
    if (watcherRef.current) {
      watcherRef.current.remove();
    }

    try {
      watcherRef.current = await locationService.watchLocation(
        async (coords) => {
          const { data } = await locationService.reverseGeocode(coords.lat, coords.lng);
          if (data) {
            setCurrentLocation(data);
          }
        }
      );
    } catch (err) {
      console.error('Start watching location error:', err);
    }
  }, [setCurrentLocation]);

  // Stop watching location
  const stopWatchingLocation = useCallback(() => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
  }, []);

  // Format location for display based on precision
  const formatLocation = useCallback(
    (location: LocationData) => {
      return locationService.formatLocationDisplay(location, locationPrecision);
    },
    [locationPrecision]
  );

  // Get full location display
  const getFullLocationDisplay = useCallback((location: LocationData) => {
    return locationService.getFullLocationDisplay(location);
  }, []);

  // Update location precision setting
  const updateLocationPrecision = useCallback(
    (precision: 'exact' | 'neighborhood' | 'city') => {
      setLocationPrecision(precision);
    },
    [setLocationPrecision]
  );

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
      }
    };
  }, []);

  return {
    currentLocation,
    locationPrecision,
    requestPermission,
    checkPermission,
    getCurrentLocation,
    refreshLocation,
    startWatchingLocation,
    stopWatchingLocation,
    formatLocation,
    getFullLocationDisplay,
    updateLocationPrecision,
  };
}

// Helper to get exact location (highest accuracy)
export function useExactLocation() {
  const { getCurrentLocation } = useLocation();
  
  const getExactLocation = useCallback(async () => {
    return getCurrentLocation(true); // Use exact location
  }, [getCurrentLocation]);
  
  return { getExactLocation };
}
