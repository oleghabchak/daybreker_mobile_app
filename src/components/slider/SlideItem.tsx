import React from 'react';
import {
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

interface SlideItemProps {
  children?: React.ReactNode;
  image?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const SlideItem: React.FC<SlideItemProps> = ({
  children,
  image,
  title,
  subtitle,
  style,
  backgroundColor = Colors.primary,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {children || (
        <>
          {image && (
            <View style={styles.imageContainer}>
              {/* You can add Image component here if needed */}
            </View>
          )}
          {title && (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={3}>
              {subtitle}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Space[6],
    borderRadius: BorderRadius.lg,
    marginHorizontal: Space[2],
  },
  imageContainer: {
    marginBottom: Space[4],
  },
  title: {
    ...Typography.h2,
    color: Colors.textInverse,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textInverse,
    textAlign: 'center',
    opacity: 0.9,
  },
});
