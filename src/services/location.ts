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

// Get current location
export async function getCurrentLocation(): Promise<ApiResponse<{ lat: number; lng: number }>> {
  try {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return {
        data: null,
        error: { message: 'Location permission not granted.' },
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      data: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
      error: null,
    };
  } catch (err) {
    console.error('Get location error:', err);
    return {
      data: null,
      error: { message: 'Failed to get current location.' },
    };
  }
}

// Search for locations by query string (forward geocoding)
export async function searchLocations(query: string): Promise<ApiResponse<LocationData[]>> {
  try {
    if (!query || query.trim().length === 0) {
      return { data: [], error: null };
    }

    const results = await Location.geocodeAsync(query);

    if (results.length === 0) {
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

    return { data: locations, error: null };
  } catch (err) {
    console.error('Search locations error:', err);
    return {
      data: [],
      error: { message: 'Failed to search locations.' },
    };
  }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ApiResponse<LocationData>> {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (results.length === 0) {
      return {
        data: {
          name: 'Unknown Location',
          lat,
          lng,
        },
        error: null,
      };
    }

    const result = results[0];

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

    return {
      data: {
        name,
        lat,
        lng,
        city: city || undefined,
        state: region || undefined,
      },
      error: null,
    };
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return {
      data: {
        name: 'Current Location',
        lat,
        lng,
      },
      error: null,
    };
  }
}

// Get current location with reverse geocoding
export async function getCurrentLocationWithAddress(): Promise<ApiResponse<LocationData>> {
  const locationResult = await getCurrentLocation();

  if (locationResult.error || !locationResult.data) {
    return {
      data: null,
      error: locationResult.error || { message: 'Failed to get location.' },
    };
  }

  const { lat, lng } = locationResult.data;
  return reverseGeocode(lat, lng);
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
