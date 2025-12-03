import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FeedScreen,
  CameraScreen,
  PostPreviewScreen,
  LocationSearchScreen,
  ProfileScreen,
  SettingsScreen,
  FriendsScreen,
} from '../screens/main';
import type { MainStackParamList } from '../types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      initialRouteName="Camera"
    >
      {/* Camera is the default/hub screen */}
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          animation: 'none',
        }}
      />
      {/* Feed now accessible via swipe from Camera */}
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PostPreview"
        component={PostPreviewScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="LocationSearch"
        component={LocationSearchScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
