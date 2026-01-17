import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../constants/theme';

export const WelcomeSplash = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surfaceSecondary]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Daybreaker Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.brandName}>Daybreaker</Text>
            <Text style={styles.subtitle}>
              Your personal health companion for a brighter tomorrow
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Auth')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.tagline}>
            Start your journey to optimal health
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space[6],
  },
  logoContainer: {
    marginBottom: Space[12],
    ...Shadows.lg,
  },
  logo: {
    width: 120,
    height: 120,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Space[12],
  },
  title: {
    ...Typography.h2,
    color: Colors.textDisabled,
    marginBottom: Space[1],
  },
  brandName: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.sans,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Space[4],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
    paddingHorizontal: Space[6],
  },
  button: {
    width: '100%',
    marginBottom: Space[6],
  },
  buttonGradient: {
    height: 48,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  buttonText: {
    ...Typography.bodyMedium,
    color: Colors.textInverse,
    fontSize: Typography.fontSize.lg,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
});
