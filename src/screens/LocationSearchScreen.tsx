/**
 * Scena - Location Search Screen
 * Gentle location picker - no pressure
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { GlassInput, GlassCard } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

type LocationSearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LocationSearch'>;
  route: RouteProp<RootStackParamList, 'LocationSearch'>;
};

interface LocationItem {
  id: string;
  name: string;
  type: 'current' | 'nearby' | 'search';
}

// Mock nearby locations
const mockNearbyLocations: LocationItem[] = [
  { id: '1', name: 'coffee shop', type: 'nearby' },
  { id: '2', name: 'the park', type: 'nearby' },
  { id: '3', name: 'library', type: 'nearby' },
  { id: '4', name: 'downtown', type: 'nearby' },
  { id: '5', name: 'home', type: 'nearby' },
  { id: '6', name: 'gym', type: 'nearby' },
  { id: '7', name: 'restaurant', type: 'nearby' },
  { id: '8', name: 'beach', type: 'nearby' },
];

export const LocationSearchScreen: React.FC<LocationSearchScreenProps> = ({
  navigation,
  route,
}) => {
  const [searchText, setSearchText] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [locations, setLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    fetchCurrentLocation();
    setLocations(mockNearbyLocations);
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        if (place) {
          const locationName = place.name || place.street || place.city || '';
          setCurrentLocation(locationName.toLowerCase());
        }
      }
    } catch (e) {
      // Location not available
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectLocation = (location: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to PostEditor with selected location
    // Get params from current route or previous route
    const routeParams = route.params;
    const previousRoute = navigation.getState()?.routes[navigation.getState()?.index - 1];
    const params = (previousRoute?.name === 'PostEditor' && previousRoute.params) 
      ? previousRoute.params 
      : routeParams;
    
    if (params && 'imageUri' in params && typeof params.imageUri === 'string') {
      navigation.navigate('PostEditor', {
        imageUri: params.imageUri,
        frontCameraUri: 'frontCameraUri' in params ? params.frontCameraUri : undefined,
        location,
      });
    } else {
      // Fallback: just go back
      navigation.goBack();
    }
  };

  const filteredLocations = searchText
    ? locations.filter(loc =>
        loc.name.toLowerCase().includes(searchText.toLowerCase())
      )
    : locations;

  const renderLocationItem = ({ item, index }: { item: LocationItem; index: number }) => (
    <Animated.View entering={FadeInUp.duration(300).delay(index * 50)}>
      <Pressable
        onPress={() => handleSelectLocation(item.name)}
        style={styles.locationItem}
      >
        <Ionicons
          name={item.type === 'current' ? 'navigate' : 'location-outline'}
          size={20}
          color={colors.text.secondary}
        />
        <Text style={styles.locationName}>{item.name}</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={hitSlop.large}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </Pressable>
        </Animated.View>

        <View style={styles.content}>
          {/* Title */}
          <Animated.Text entering={FadeIn.duration(300)} style={styles.title}>
            where are you
          </Animated.Text>

          {/* Search input */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <GlassInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="search..."
            />
          </Animated.View>

          {/* Current location */}
          {currentLocation && (
            <Animated.View entering={FadeInUp.duration(400).delay(200)}>
              <Text style={styles.sectionTitle}>right now</Text>
              <Pressable
                onPress={() => handleSelectLocation(currentLocation)}
                style={styles.currentLocationItem}
              >
                <Ionicons name="navigate" size={20} color={colors.accent.primary} />
                <Text style={styles.currentLocationText}>{currentLocation}</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Nearby locations */}
          <Animated.View entering={FadeIn.duration(400).delay(300)} style={styles.listSection}>
            <Text style={styles.sectionTitle}>nearby</Text>
            <FlatList
              data={filteredLocations}
              renderItem={renderLocationItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenHorizontal,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  currentLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  currentLocationText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.sm,
  },
  listSection: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  locationName: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.sm,
  },
});

export default LocationSearchScreen;
