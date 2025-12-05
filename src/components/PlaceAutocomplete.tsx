/**
 * Scena - Place Autocomplete Component
 * Google Places powered location search
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GlassInput } from './GlassInput';
import { GlassCard } from './GlassCard';
import { colors, typography, spacing } from '../theme';

// For now, we'll use a simple text input with suggestions
// In production, integrate with Google Places API

interface PlaceAutocompleteProps {
  value: string;
  onSelect: (place: string) => void;
  placeholder?: string;
}

const COMMON_PLACES = [
  'home',
  'work',
  'the park',
  'coffee shop',
  'gym',
  'downtown',
  'beach',
  'mountains',
  'library',
  'restaurant',
];

export const PlaceAutocomplete: React.FC<PlaceAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = 'where are you?',
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (query.length > 0) {
      // Filter common places based on query
      const filtered = COMMON_PLACES.filter(place =>
        place.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions(COMMON_PLACES);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSelect = (place: string) => {
    setQuery(place);
    onSelect(place);
    setShowSuggestions(false);
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <Pressable onPress={() => handleSelect(item)}>
      <View style={styles.suggestionItem}>
        <Ionicons name="location-outline" size={20} color={colors.text.tertiary} />
        <Text style={styles.suggestionText}>{item}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <GlassInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        onFocus={() => setShowSuggestions(true)}
        autoCapitalize="none"
      />

      {showSuggestions && suggestions.length > 0 && (
        <Animated.View entering={FadeIn.duration(200)}>
          <GlassCard style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item}
              scrollEnabled={false}
            />
          </GlassCard>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  suggestionsContainer: {
    marginTop: spacing.xs,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  suggestionText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    textTransform: 'lowercase',
    marginLeft: spacing.sm,
  },
});

