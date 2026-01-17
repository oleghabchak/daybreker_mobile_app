import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface ErrorNotificationProps {
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ 
  message, 
  duration = 5000,
  onDismiss 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <SafeAreaView edges={['top']}>
        <TouchableOpacity 
          style={styles.notification} 
          onPress={dismiss}
          activeOpacity={0.9}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={dismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.background,
    flex: 1,
    paddingRight: Spacing.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeIcon: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});