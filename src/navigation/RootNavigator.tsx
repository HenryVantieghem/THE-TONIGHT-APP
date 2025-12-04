/**
 * Scena - Root Navigator
 * Gentle transitions, peaceful navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';

import { RootStackParamList, MainTabParamList } from '../types';
import { useApp } from '../context/AppContext';
import {
  WelcomeScreen,
  SignUpScreen,
  SignInScreen,
  ForgotPasswordScreen,
  PermissionsScreen,
  FeedScreen,
  CameraScreen,
  PostEditorScreen,
  LocationSearchScreen,
  FullscreenMomentScreen,
  ReactionsDetailScreen,
  ProfileScreen,
  EditProfileScreen,
  SettingsScreen,
  HelpScreen,
  SharedSuccessScreen,
} from '../screens';
import { colors, typography, spacing } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom tab bar with glass effect
const GlassTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  return (
    <View style={tabStyles.container}>
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={tabStyles.background} />
      <View style={tabStyles.content}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Feed') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = 'add-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          // Camera tab is special - it's a capture button
          if (route.name === 'Camera') {
            return (
              <Pressable
                key={route.key}
                style={tabStyles.cameraContainer}
                onPress={onPress}
              >
                <View style={tabStyles.cameraButton}>
                  <Ionicons
                    name="add"
                    size={24}
                    color={colors.text.primary}
                  />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              style={tabStyles.tab}
              onPress={onPress}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.text.primary : colors.text.tertiary}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// Wrapper for ProfileScreen in tabs (ProfileScreen uses useNavigation internally)
const ProfileTabScreen: React.FC = () => {
  return <ProfileScreen />;
};

// Main Tabs Navigator
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Camera');
          },
        })}
      />
      <Tab.Screen name="ProfileTab" component={ProfileTabScreen} />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const RootNavigator: React.FC = () => {
  const { state } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        {!state.isAuthenticated ? (
          // Auth flow
          <>
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Permissions"
              component={PermissionsScreen}
              options={{ animation: 'fade' }}
            />
          </>
        ) : (
          // Main app
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="PostEditor"
              component={PostEditorScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="LocationSearch"
              component={LocationSearchScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="FullscreenMoment"
              component={FullscreenMomentScreen}
              options={{
                animation: 'fade',
                presentation: 'fullScreenModal',
              }}
            />
            <Stack.Screen
              name="ReactionsDetail"
              component={ReactionsDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Help"
              component={HelpScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="SharedSuccess"
              component={SharedSuccessScreen}
              options={{
                animation: 'fade',
                presentation: 'transparentModal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glass.light,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 32,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass.light,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RootNavigator;
