import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollViewWithIndicator } from '../components/ScrollViewWithIndicator';
// TODO: Replace with real modules after native rebuild
// import * as Notifications from 'expo-notifications';
// import * as Location from 'expo-location';
import { Lock } from 'lucide-react-native';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../constants/theme';
import { supabase } from '../lib/supabase';
import { errorManager } from '../services/errorNotificationManager';
import { Location, Notifications } from '../services/mockNotifications';

interface PermissionItem {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
}

export const UnifiedPermissionsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);

  // Permission states
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Get reminders for workouts and health updates',
      isEnabled: false,
      requestPermission: async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      },
    },
    {
      id: 'location',
      title: 'Location Services',
      description: 'Track outdoor workouts and find nearby gyms',
      isEnabled: false,
      requestPermission: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
      },
    },
    {
      id: 'health',
      title: 'Health Data',
      description: 'Sync with Apple Health for comprehensive tracking',
      isEnabled: false,
      requestPermission: async () => {
        try {
          // Import HealthKit service dynamically to avoid issues on non-iOS platforms
          const { HealthKitService } = await import(
            '../services/HealthKitService'
          );
          const healthKit = HealthKitService.getInstance();
          return await healthKit.initialize();
        } catch (error) {
          console.error('Failed to initialize HealthKit:', error);
          return false;
        }
      },
    },
    {
      id: 'camera',
      title: 'Camera Access',
      description: 'Scan supplement labels and track progress photos',
      isEnabled: false,
      requestPermission: async () => {
        // Placeholder for camera permissions
        // In a real app, you'd use expo-camera
        return true;
      },
    },
  ]);

  const handleTogglePermission = async (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return;

    if (!permission.isEnabled) {
      // Request permission
      const granted = await permission.requestPermission();

      setPermissions(prev =>
        prev.map(p =>
          p.id === permissionId ? { ...p, isEnabled: granted } : p
        )
      );

      if (!granted) {
        Alert.alert(
          'Permission Required',
          `Please enable ${permission.title} in your device settings to use this feature.`,
          [{ text: 'OK' }]
        );
      }
    } else {
      // Can't programmatically disable permissions on iOS
      Alert.alert(
        'Disable Permission',
        `To disable ${permission.title}, please go to your device settings.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Update user profile to mark permissions as reviewed
      const { error } = await supabase
        .from('profiles')
        .update({
          permissions_reviewed: true,
          notification_enabled:
            permissions.find(p => p.id === 'notifications')?.isEnabled || false,
          location_enabled:
            permissions.find(p => p.id === 'location')?.isEnabled || false,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Navigate to next screen
      navigation.navigate('Priorities');
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      errorManager.showError('Failed to save permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Priorities');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enable Features</Text>
          <Text style={styles.subtitle}>
            Choose which features you'd like to enable. You can always change
            these later in settings.
          </Text>
        </View>

        {/* Permissions List */}
        <View style={styles.permissionsList}>
          {permissions.map((permission, index) => (
            <View
              key={permission.id}
              style={[
                styles.permissionItem,
                index === permissions.length - 1 && styles.lastPermissionItem,
              ]}
            >
              <View style={styles.permissionContent}>
                <Text style={styles.permissionTitle}>{permission.title}</Text>
                <Text style={styles.permissionDescription}>
                  {permission.description}
                </Text>
              </View>
              <Switch
                value={permission.isEnabled}
                onValueChange={() => handleTogglePermission(permission.id)}
                trackColor={{
                  false: Colors.iosSwitchOff,
                  true: Colors.iosSwitchOn,
                }}
                thumbColor={Colors.iosSwitchThumb}
                ios_backgroundColor={Colors.iosSwitchOff}
                style={styles.switch}
              />
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Lock size={24} color={Colors.primary} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Your privacy is important to us. We only use these permissions to
            enhance your experience and never share your data without consent.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Set up later</Text>
          </TouchableOpacity>
        </View>
      </ScrollViewWithIndicator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Space[8],
  },
  header: {
    paddingHorizontal: Space[4],
    paddingTop: Space[8],
    paddingBottom: Space[6],
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    marginBottom: Space[3],
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: Space[6],
  },
  permissionsList: {
    backgroundColor: Colors.surface,
    marginHorizontal: Space[4],
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  lastPermissionItem: {
    borderBottomWidth: 0,
  },
  permissionContent: {
    flex: 1,
    marginRight: Space[4],
  },
  permissionTitle: {
    ...Typography.bodyMedium,
    marginBottom: Space[1],
  },
  permissionDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  switch: {
    transform: Platform.OS === 'ios' ? [] : [{ scale: 0.9 }],
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: Space[4],
    marginTop: Space[6],
    padding: Space[4],
    borderRadius: BorderRadius.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: Space[3],
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Space[4],
    paddingTop: Space[8],
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space[3],
    ...Shadows.md,
  },
  primaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.lg,
  },
  skipButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
});
