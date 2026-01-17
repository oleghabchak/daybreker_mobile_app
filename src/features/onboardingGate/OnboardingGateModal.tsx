import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';

import { Space, Typography, Shadows } from '../../constants/theme';

import { useGateTheme } from './theme';
import type { GateCopy } from './types';

type Props = {
  copy: GateCopy;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  showSkipButton: boolean;
  testID?: string;
};

export const OnboardingGateModal: React.FC<Props> = ({
  copy,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  showSkipButton,
  testID,
}) => {
  const t = useGateTheme();

  React.useEffect(() => {
    AccessibilityInfo.announceForAccessibility?.(
      'Setup required. Complete onboarding to continue.'
    );
  }, []);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.colorCard, borderRadius: t.radius },
        t.shadow,
      ]}
      accessibilityViewIsModal
      testID={testID ?? 'onboarding-gate-modal'}
    >
      <Text
        style={[styles.title, { color: t.colorText }]}
        maxFontSizeMultiplier={1.2}
      >
        {copy.title}
      </Text>
      {copy.subtitle ? (
        <Text
          style={[styles.subtitle, { color: t.colorSubtle }]}
          maxFontSizeMultiplier={1.2}
        >
          {copy.subtitle}
        </Text>
      ) : null}
      {Array.isArray(copy.bullets) && copy.bullets.length > 0 ? (
        <View style={styles.bullets}>
          {copy.bullets.slice(0, 3).map((b, i) => (
            <Text
              key={i}
              style={[styles.bullet, { color: t.colorSubtle }]}
              maxFontSizeMultiplier={1.2}
            >
              • {b}
            </Text>
          ))}
        </View>
      ) : null}
      <Pressable
        onPress={onPrimaryPress}
        accessibilityRole='button'
        style={[
          styles.primaryBtn,
          { backgroundColor: t.colorPrimary, borderRadius: t.buttonRadius },
          Shadows.md,
        ]}
      >
        <Text style={styles.primaryLabel}>
          {copy.ctaLabel ?? 'Complete onboarding'}
        </Text>
      </Pressable>
      {copy.secondaryLabel ? (
        <Pressable
          onPress={onSecondaryPress}
          accessibilityRole='button'
          style={styles.secondaryBtn}
        >
          <Text style={[styles.secondaryLabel, { color: t.colorSubtle }]}>
            {copy.secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
      {showSkipButton && onSkipPress ? (
        <Pressable
          onPress={onSkipPress}
          accessibilityRole='button'
          style={styles.skipBtn}
        >
          <Text style={[styles.skipLabel, { color: t.colorSubtle }]}>
            {copy.skipLabel ?? 'Skip for now'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '88%',
    alignSelf: 'center',
    padding: Space[7], // 28px padding (more spacious)
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.fontSize['2xl'], // 24px
    fontWeight: '700',
    marginBottom: Space[3], // 12px (better spacing)
    lineHeight: Typography.fontSize['2xl'] * 1.3,
  },
  subtitle: {
    fontSize: Typography.fontSize.base, // 15px
    marginBottom: Space[5], // 20px (better spacing before bullets)
    lineHeight: Typography.fontSize.base * 1.5,
  },
  bullets: {
    gap: Space[2], // 8px between bullets
    marginBottom: Space[6], // 24px before button
    width: '100%',
  },
  bullet: {
    fontSize: Typography.fontSize.sm, // 13px
    lineHeight: Typography.fontSize.sm * 1.6,
  },
  primaryBtn: {
    width: '100%',
    height: 48, // Match app button height
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space[2], // 8px extra top margin
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base, // 15px
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: Space[3], // 12px
    marginTop: Space[1], // 4px
  },
  secondaryLabel: {
    fontSize: Typography.fontSize.sm, // 13px
    textDecorationLine: 'underline',
  },
  skipBtn: {
    paddingVertical: Space[3], // 12px
    marginTop: Space[2], // 8px
    alignSelf: 'center',
  },
  skipLabel: {
    fontSize: Typography.fontSize.sm, // 13px
    textDecorationLine: 'underline',
    opacity: 0.7,
  },
});
