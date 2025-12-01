import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { searchLocations, reverseGeocode, getCurrentLocationWithAddress, hasLocationPermission } from '../../services/location';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius, config } from '../../constants/config';
import type { LocationData, MainStackParamList } from '../../types';

type LocationSearchNavigationProp = NativeStackNavigationProp<MainStackParamList, 'LocationSearch'>;

interface LocationSearchScreenParams {
  currentLocation: LocationData | null;
  locationKey?: string;
}

export function LocationSearchScreen() {
  const navigation = useNavigation<LocationSearchNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const params = route.params as LocationSearchScreenParams;
  const { currentLocation, locationKey } = params || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [currentLocationData, setCurrentLocationData] = useState<LocationData | null>(currentLocation || null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load current location on mount if not provided
  useEffect(() => {
    if (!currentLocationData) {
      loadCurrentLocation();
    }
  }, []);

  const loadCurrentLocation = useCallback(async () => {
    setIsLoadingCurrent(true);
    try {
      // Check permission first
      const hasPermission = await hasLocationPermission();
      
      if (!hasPermission) {
        // Don't show error, just don't load current location
        setIsLoadingCurrent(false);
        return;
      }
      
      const { data } = await getCurrentLocationWithAddress();
      if (data) {
        setCurrentLocationData(data);
      }
    } catch (err) {
      console.error('Error loading current location:', err);
      // Silently fail - user can still search for locations
    } finally {
      setIsLoadingCurrent(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await searchLocations(query.trim());
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, config.DEBOUNCE.SEARCH);
  }, []);

  const handleSelectLocation = useCallback((location: LocationData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate back and update PostPreviewScreen's location via navigation params
    // Use navigate with merge to update the PostPreview route params
    if (navigation.canGoBack()) {
      // Get the navigation state to find PostPreview route
      const state = navigation.getState();
      const postPreviewRoute = state.routes.find(r => r.name === 'PostPreview');
      
      if (postPreviewRoute) {
        // Update PostPreview params with selected location using navigate with merge
        navigation.navigate({
          name: 'PostPreview',
          params: {
            ...postPreviewRoute.params,
            selectedLocation: location,
          } as any,
          merge: true,
        });
      }
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  }, [navigation]);

  const handleUseCurrentLocation = useCallback(() => {
    if (currentLocationData) {
      handleSelectLocation(currentLocationData);
    }
  }, [currentLocationData, handleSelectLocation]);

  const renderLocationItem = useCallback(
    ({ item }: { item: LocationData }) => (
      <TouchableOpacity
        style={styles.locationItem}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}
      >
        <View style={styles.locationIcon}>
          <Text style={styles.locationPin}>📍</Text>
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName}>{item.name}</Text>
          {(item.city || item.state) && (
            <Text style={styles.locationDetails}>
              {[item.city, item.state].filter(Boolean).join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleSelectLocation]
  );

  const renderCurrentLocation = () => {
    if (!currentLocationData) {
      if (isLoadingCurrent) {
        return (
          <View style={styles.currentLocationContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.currentLocationText}>Getting your location...</Text>
          </View>
        );
      }
      return null;
    }

    return (
      <View style={styles.currentLocationSection}>
        <Text style={styles.sectionTitle}>Current Location</Text>
        <TouchableOpacity
          style={styles.currentLocationCard}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.7}
        >
          <View style={styles.locationIcon}>
            <Text style={styles.currentLocationIcon}>📍</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{currentLocationData.name}</Text>
            {(currentLocationData.city || currentLocationData.state) && (
              <Text style={styles.locationDetails}>
                {[currentLocationData.city, currentLocationData.state].filter(Boolean).join(', ')}
              </Text>
            )}
          </View>
          <Text style={styles.useButton}>Use</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Choose Location</Text>

        <View style={{ width: 60 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {isSearching && (
            <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
          )}
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={searchResults}
        renderItem={renderLocationItem}
        keyExtractor={(item, index) => `${item.lat}-${item.lng}-${index}`}
        ListHeaderComponent={renderCurrentLocation}
        ListEmptyComponent={
          searchQuery.length >= 2 && !isSearching ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No locations found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : searchQuery.length < 2 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.emptyText}>Search for a location</Text>
              <Text style={styles.emptySubtext}>Enter at least 2 characters to search</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  searchContainer: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    padding: 0,
  },
  searchLoader: {
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  currentLocationSection: {
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  currentLocationText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  locationPin: {
    fontSize: 20,
  },
  currentLocationIcon: {
    fontSize: 20,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  locationDetails: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  useButton: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

