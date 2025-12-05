import { registerRootComponent } from 'expo';

// Wrap App import in try-catch to catch any initialization errors
let App;
try {
  if (__DEV__) {
    console.log('[index.js] Importing App component...');
  }
  App = require('./App').default;
  if (__DEV__) {
    console.log('[index.js] App component imported successfully');
  }
} catch (error) {
  console.error('[index.js] Failed to import App component:', error);
  // Fallback: Create a minimal error component
  const React = require('react');
  const { View, Text, StyleSheet } = require('react-native');
  const errorStyles = StyleSheet.create({
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: '#2C3E50',
      marginBottom: 10,
    },
    errorDetail: {
      fontSize: 14,
      color: '#7F8C9A',
      textAlign: 'center',
    },
  });
  App = () => (
    <View style={errorStyles.errorContainer}>
      <Text style={errorStyles.errorText}>Failed to load app</Text>
      <Text style={errorStyles.errorDetail}>{error.message}</Text>
    </View>
  );
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
try {
  if (__DEV__) {
    console.log('[index.js] Registering root component...');
  }
  registerRootComponent(App);
  if (__DEV__) {
    console.log('[index.js] Root component registered successfully');
  }
} catch (error) {
  console.error('[index.js] Failed to register root component:', error);
  throw error;
}


