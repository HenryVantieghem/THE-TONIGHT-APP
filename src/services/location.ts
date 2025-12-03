import * as Location from 'expo-location';
import type { LocationData, LocationPrecision, ApiResponse } from '../types';

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.error('Location permission error:', err);
    return false;
  }
}

// Check if location permission is granted
export async function hasLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (err) {
    console.error('Check location permission error:', err);
    return false;
  }
}

// Get current location with timeout
export async function getCurrentLocation(
  accuracy: Location.Accuracy = Location.Accuracy.Balanced
): Promise<ApiResponse<{ lat: number; lng: number }>> {
  console.log('📍 [getCurrentLocation] Starting, accuracy:', accuracy);
  
  try {
    const hasPermission = await hasLocationPermission();
    console.log('📍 [getCurrentLocation] Permission check:', hasPermission);

    if (!hasPermission) {
      console.warn('⚠️ [getCurrentLocation] No location permission');
      return {
        data: null,
        error: { message: 'Location permission not granted.' },
      };
    }

    // Create a timeout promise (longer timeout for highest accuracy)
    const timeout = accuracy === Location.Accuracy.Highest ? 15000 : 10000;
    console.log(`📍 [getCurrentLocation] Fetching location with ${timeout}ms timeout...`);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Location request timed out')), timeout);
    });

    // Race between location request and timeout
    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy,
      }),
      timeoutPromise,
    ]);

    console.log('✅ [getCurrentLocation] Location received:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy,
    });

    // Validate coordinates
    if (!location || !location.coords) {
      console.error('❌ [getCurrentLocation] Invalid location data received');
      return {
        data: null,
        error: { message: 'Invalid location data received.' },
      };
    }

    const { latitude, longitude } = location.coords;
    
    // Validate coordinate ranges
    if (
      isNaN(latitude) || 
      isNaN(longitude) ||
      latitude < -90 || 
      latitude > 90 ||
      longitude < -180 || 
      longitude > 180
    ) {
      console.error('❌ [getCurrentLocation] Invalid coordinates:', { latitude, longitude });
      return {
        data: null,
        error: { message: 'Invalid coordinates received.' },
      };
    }

    console.log('✅ [getCurrentLocation] Valid coordinates:', { lat: latitude, lng: longitude });

    return {
      data: {
        lat: latitude,
        lng: longitude,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('❌ [getCurrentLocation] Error:', err);
    const message = err?.message?.includes('timed out')
      ? 'Location request timed out. Please try again.'
      : 'Failed to get current location.';
    return {
      data: null,
      error: { message },
    };
  }
}

// Search for locations by query string (forward geocoding)
export async function searchLocations(query: string): Promise<ApiResponse<LocationData[]>> {
  console.log('🔍 [searchLocations] Searching for:', query);
  
  try {
    if (!query || query.trim().length === 0) {
      console.log('ℹ️ [searchLocations] Empty query, returning empty results');
      return { data: [], error: null };
    }

    const results = await Location.geocodeAsync(query);
    console.log('🔍 [searchLocations] Found', results.length, 'results');

    if (results.length === 0) {
      console.log('ℹ️ [searchLocations] No results found');
      return { data: [], error: null };
    }

    const locations: LocationData[] = results.map((result) => {
      // Build location name from available data
      // expo-location geocodeAsync returns LocationGeocodedLocation with different structure
      let name = '';

      // Check available properties (expo-location may have different field names)
      const street = (result as any).street || (result as any).streetNumber || '';
      const city = (result as any).city || '';
      const region = (result as any).region || (result as any).administrativeArea || '';
      const nameField = (result as any).name || '';
      const district = (result as any).district || (result as any).subAdministrativeArea || '';
      const subregion = (result as any).subregion || '';

      if (nameField && nameField !== city) {
        name = nameField;
      } else if (street) {
        name = street;
      } else if (district) {
        name = district;
      } else if (subregion) {
        name = subregion;
      } else if (city) {
        name = city;
      } else {
        name = query;
      }

      return {
        name,
        lat: result.latitude,
        lng: result.longitude,
        city: city || undefined,
        state: region || undefined,
      };
    });

    console.log('✅ [searchLocations] Processed', locations.length, 'locations');
    return { data: locations, error: null };
  } catch (err) {
    console.error('❌ [searchLocations] Error:', err);
    // Don't fail completely - return empty results
    return {
      data: [],
      error: null, // Treat as no results, not an error
    };
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ApiResponse<LocationData>> {
  console.log('📍 [reverseGeocode] Starting reverse geocode:', { lat, lng });
  
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    console.log('📍 [reverseGeocode] Results received:', results.length, 'locations');

    if (results.length === 0) {
      console.warn('⚠️ [reverseGeocode] No results, using generic location name');
      return {
        data: {
          name: 'Current Location',
          lat,
          lng,
        },
        error: null,
      };
    }

    const result = results[0];
    console.log('📍 [reverseGeocode] First result:', result);

    // Build location name from available data
    // expo-location reverseGeocodeAsync returns LocationGeocodedAddress
    let name = '';

    // Check available properties (expo-location may have different field names)
    const street = (result as any).street || (result as any).streetNumber || '';
    const city = (result as any).city || '';
    const region = (result as any).region || (result as any).administrativeArea || '';
    const nameField = (result as any).name || '';
    const district = (result as any).district || (result as any).subAdministrativeArea || '';
    const subregion = (result as any).subregion || '';

    if (nameField && nameField !== city) {
      name = nameField;
    } else if (street) {
      name = street;
    } else if (district) {
      name = district;
    } else if (subregion) {
      name = subregion;
    } else if (city) {
      name = city;
    } else {
      name = 'Current Location';
    }

    const locationData = {
      name,
      lat,
      lng,
      city: city || undefined,
      state: region || undefined,
    };

    console.log('✅ [reverseGeocode] Location data created:', locationData);

    return {
      data: locationData,
      error: null,
    };
  } catch (err) {
    console.error('❌ [reverseGeocode] Error:', err);
    // Return a fallback location instead of failing
    return {
      data: {
        name: 'Current Location',
        lat,
        lng,
      },
      error: null, // Don't treat this as an error - just use fallback
    };
  }
}

// Get current location with reverse geocoding
export async function getCurrentLocationWithAddress(
  accuracy: Location.Accuracy = Location.Accuracy.Balanced
): Promise<ApiResponse<LocationData>> {
  console.log('📍 [getCurrentLocationWithAddress] Starting location fetch...');
  
  const locationResult = await getCurrentLocation(accuracy);

  if (locationResult.error || !locationResult.data) {
    console.error('❌ [getCurrentLocationWithAddress] Failed to get coordinates:', locationResult.error);
    return {
      data: null,
      error: locationResult.error || { message: 'Failed to get location.' },
    };
  }

  const { lat, lng } = locationResult.data;
  console.log('✅ [getCurrentLocationWithAddress] Got coordinates, reverse geocoding...');
  
  const geocodeResult = await reverseGeocode(lat, lng);
  
  // Even if reverse geocoding fails, we have coordinates, so return a basic location
  if (!geocodeResult.data) {
    console.warn('⚠️ [getCurrentLocationWithAddress] Geocoding failed, using basic location');
    return {
      data: {
        name: 'Current Location',
        lat,
        lng,
      },
      error: null, // Don't fail - we have valid coordinates
    };
  }
  
  console.log('✅ [getCurrentLocationWithAddress] Location complete:', geocodeResult.data.name);
  return geocodeResult;
}

// Format location display based on precision setting
export function formatLocationDisplay(
  location: LocationData,
  precision: LocationPrecision
): string {
  switch (precision) {
    case 'exact':
      return location.name;

    case 'neighborhood':
      // Show city + state if available, otherwise just the name
      if (location.city && location.state) {
        return `${location.city}, ${location.state}`;
      }
      return location.name;

    case 'city':
      // Show only city or state
      if (location.city) {
        return location.city;
      }
      if (location.state) {
        return location.state;
      }
      return 'Unknown Location';

    default:
      return location.name;
  }
}

// Get location display string including city/state
export function getFullLocationDisplay(location: LocationData): string {
  const parts: string[] = [location.name];

  if (location.city && location.city !== location.name) {
    parts.push(location.city);
  }

  if (location.state && location.state !== location.city) {
    parts.push(location.state);
  }

  return parts.join(', ');
}

// Watch location changes
export function watchLocation(
  callback: (location: { lat: number; lng: number }) => void,
  options?: Location.LocationOptions
): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000,
      distanceInterval: 50,
      ...options,
    },
    (location) => {
      callback({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    }
  );
}
