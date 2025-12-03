import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
  fullHeight?: boolean;
}

export function GlassModal({
  visible,
  onClose,
  children,
  dismissible = true,
  fullHeight = false,
}: GlassModalProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder for pull-down dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => dismissible,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return dismissible && gestureState.dy > 10;
      },
      onPanResponderGrant: () => {
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Close modal
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          closeModal();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  const openModal = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      openModal();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <View style={styles.overlay}>
        {/* Background - tappable to dismiss */}
        <TouchableWithoutFeedback onPress={dismissible ? closeModal : undefined}>
          <Animated.View
            style={[
              styles.background,
              {
                opacity: backgroundOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContainer,
            fullHeight && styles.fullHeight,
            {
              transform: [{ translateY }],
            },
          ]}
          {...(dismissible ? panResponder.panHandlers : {})}
        >
          {dismissible && (
            <View style={styles.pullIndicatorContainer}>
              <View style={styles.pullIndicator} />
            </View>
          )}
          <View style={[styles.content, fullHeight && styles.contentFullHeight]}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  fullHeight: {
    maxHeight: SCREEN_HEIGHT,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  pullIndicatorContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  pullIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textQuaternary,
  },
  content: {
    padding: spacing.lg,
  },
  contentFullHeight: {
    flex: 1,
    padding: 0,
  },
});

