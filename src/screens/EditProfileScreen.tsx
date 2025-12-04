/**
 * Scena - Edit Profile Screen
 * Gentle profile editing - no pressure to complete
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { GlassButton, GlassInput, Avatar, Header, Toast } from '../components';
import { colors, typography, spacing, gradients, hitSlop } from '../theme';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state, setUser } = useApp();

  const [username, setUsername] = useState(state.user?.username || '');
  const [avatarUri, setAvatarUri] = useState(state.user?.avatarUrl || '');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (state.user) {
      setUser({
        ...state.user,
        username: username || state.user.username,
        avatarUrl: avatarUri || state.user.avatarUrl,
      });
    }

    setToastMessage('saved');
    setShowToast(true);

    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  const hasChanges = username !== state.user?.username || avatarUri !== state.user?.avatarUrl;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.ambient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Header title="edit profile" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Avatar */}
            <Animated.View entering={FadeInUp.duration(400)} style={styles.avatarSection}>
              <Pressable onPress={handlePickImage}>
                <Avatar
                  uri={avatarUri}
                  name={username}
                  size="xlarge"
                />
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={14} color={colors.white} />
                </View>
              </Pressable>
              <Text style={styles.avatarHint}>tap to change</Text>
            </Animated.View>

            {/* Username */}
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <GlassInput
                value={username}
                onChangeText={setUsername}
                label="username"
                placeholder="choose a username"
                autoCapitalize="none"
              />
            </Animated.View>

            {/* Info */}
            <Animated.View entering={FadeIn.duration(400).delay(200)} style={styles.infoContainer}>
              <Text style={styles.infoText}>
                your username is how friends find you
              </Text>
            </Animated.View>
          </ScrollView>

          {/* Save button */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.saveContainer}>
            <GlassButton
              title="save"
              onPress={handleSave}
              variant="primary"
              size="large"
              fullWidth
              disabled={!hasChanges}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  avatarHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    marginTop: spacing.sm,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'lowercase',
    textAlign: 'center',
  },
  saveContainer: {
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.xl,
  },
});

export default EditProfileScreen;
