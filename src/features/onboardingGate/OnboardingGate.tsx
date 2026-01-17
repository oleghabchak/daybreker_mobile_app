import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { BlurOverlay } from './BlurOverlay';
import { OnboardingGateModal } from './OnboardingGateModal';
import { useGateTheme } from './theme';
import type { OnboardingGateProps } from './types';

export const OnboardingGate: React.FC<OnboardingGateProps> = ({
  visible,
  copy,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  blurIntensity,
  testID,
}) => {
  const t = useGateTheme();
  const [showSkipButton, setShowSkipButton] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setShowSkipButton(false);
      return;
    }

    // Show skip button after 3 seconds
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents='box-none'
      testID={testID ?? 'onboarding-gate'}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {}}
        accessibilityElementsHidden
        importantForAccessibility='yes'
      >
        <BlurOverlay intensity={blurIntensity} />
        <View style={[styles.scrim, { backgroundColor: t.colorBgScrim }]} />
      </Pressable>
      <View style={styles.center}>
        <OnboardingGateModal
          copy={copy}
          onPrimaryPress={onPrimaryPress}
          onSecondaryPress={onSecondaryPress}
          onSkipPress={onSkipPress}
          showSkipButton={showSkipButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrim: { ...StyleSheet.absoluteFillObject },
});
