import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type Props = { intensity?: number };

export const BlurOverlay: React.FC<Props> = ({ intensity = 26 }) => {
  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, styles.webBlur]} />;
  }
  
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        tint="light"
        intensity={intensity}
      />
    );
  }
  
  // Android fallback scrim
  return <View style={[StyleSheet.absoluteFill, styles.scrim]} />;
};

const styles = StyleSheet.create({
  webBlur: {
    // @ts-ignore web-only style
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  scrim: { backgroundColor: 'rgba(0,0,0,0.35)' },
});

