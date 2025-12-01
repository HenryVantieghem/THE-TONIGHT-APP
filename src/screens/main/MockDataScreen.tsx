import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import * as mockDataService from '../../services/mockData';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, borderRadius } from '../../constants/config';

export function MockDataScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateMockData = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create mock data');
      return;
    }

    setIsLoading(true);
    try {
      await mockDataService.initializeMockData(user.id);
      Alert.alert('Success', 'Mock data created successfully! Refresh your feed to see it.');
    } catch (error) {
      console.error('Error creating mock data:', error);
      Alert.alert('Error', 'Failed to create mock data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFriendships = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await mockDataService.createMockFriendships(user.id);
      Alert.alert('Success', 'Mock friendships created!');
    } catch (error) {
      console.error('Error creating friendships:', error);
      Alert.alert('Error', 'Failed to create friendships');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePosts = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await mockDataService.generateMockPosts(user.id);
      Alert.alert('Success', 'Mock posts created! Refresh your feed to see them.');
    } catch (error) {
      console.error('Error creating posts:', error);
      Alert.alert('Error', 'Failed to create posts');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <Text style={styles.title}>Mock Data Generator</Text>
      <Text style={styles.subtitle}>
        Create test data to see how the app looks with users and posts
      </Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick Setup</Text>
        <Text style={styles.cardDescription}>
          Creates mock users, friendships, and posts all at once
        </Text>
        <Button
          title="Create All Mock Data"
          onPress={handleCreateMockData}
          loading={isLoading}
          fullWidth
          style={styles.button}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Individual Options</Text>
        
        <View style={styles.buttonGroup}>
          <Button
            title="Create Friendships"
            onPress={handleCreateFriendships}
            loading={isLoading}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
          
          <Button
            title="Create Posts"
            onPress={handleCreatePosts}
            loading={isLoading}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Note</Text>
        <Text style={styles.note}>
          • Mock data uses placeholder images from Picsum Photos{'\n'}
          • Posts will have random expiry times (some active, some expired){'\n'}
          • Friendships will be created with other users in the database{'\n'}
          • Refresh your feed after creating data to see the results
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  button: {
    marginTop: spacing.sm,
  },
  note: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
});

