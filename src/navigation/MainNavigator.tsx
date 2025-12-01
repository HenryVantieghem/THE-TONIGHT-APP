import React, { useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  FeedScreen,
  CameraScreen,
  PostPreviewScreen,
  LocationSearchScreen,
  ProfileScreen,
  SettingsScreen,
  FriendsScreen,
  MockDataScreen,
} from '../screens/main';
import type { MainStackParamList, LocationData } from '../types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  // State to manage camera flow
  const [capturedMedia, setCapturedMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
    location: LocationData;
  } | null>(null);

  // Handlers for camera → preview flow
  const handleMediaCaptured = useCallback(
    (uri: string, type: 'image' | 'video', location: LocationData) => {
      setCapturedMedia({ uri, type, location });
    },
    []
  );

  const handleClearMedia = useCallback(() => {
    setCapturedMedia(null);
  }, []);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PostPreview"
        component={PostPreviewScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_right',
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
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="MockData"
        component={MockDataScreen}
        options={{
          animation: 'slide_from_right',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
