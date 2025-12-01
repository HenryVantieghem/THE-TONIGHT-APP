import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  SplashScreen,
  OnboardingScreen,
  LoginScreen,
  SignUpScreen,
  UsernameSetupScreen,
  PermissionsScreen,
} from '../screens/auth';
import type { AuthStackParamList } from '../types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
    </Stack.Navigator>
  );
}
