/**
 * Scena - Error Boundary Component
 * Catches runtime errors gracefully
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, gradients } from '../theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <LinearGradient
            colors={gradients.ambient}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={64}
                  color={colors.text.tertiary}
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>something went wrong</Text>

              {/* Message */}
              <Text style={styles.message}>
                don't worry, it's not your fault. try restarting the app.
              </Text>

              {/* Error details (only in dev) */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                </View>
              )}

              {/* Reset button */}
              <Pressable onPress={this.handleReset} style={styles.button}>
                <Text style={styles.buttonText}>try again</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenHorizontal,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    opacity: 0.6,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.light,
    color: colors.text.primary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'lowercase',
    textAlign: 'center',
    lineHeight: typography.sizes.base * 1.5,
    marginBottom: spacing.xxl,
  },
  errorDetails: {
    backgroundColor: colors.glass.light,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
    maxWidth: '100%',
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.timer.urgent,
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.glass.light,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    textTransform: 'lowercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});

export default ErrorBoundary;

