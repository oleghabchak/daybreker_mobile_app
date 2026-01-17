import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Gradients,
  Shadows,
  Space,
} from '../../constants/theme';

import { Button } from './Button';

export interface GradientCardProps {
  image: ImageSourcePropType;
  title: string;
  description?: string;
  onPress?: () => void;
  imageSize?: number;
  disabled?: boolean;
  loading?: boolean;
  comingSoon?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  image,
  imageSize,
  title,
  description,
  onPress,
  disabled = false,
  loading = false,
  comingSoon = false,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[styles.container]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={disabled || loading}
    >
      <LinearGradient
        colors={Gradients.gradient_1.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={[
              styles.image,
              imageSize
                ? { width: imageSize, height: imageSize, margin: Space[4] }
                : {
                    width: 114,
                    height: 74,
                    marginRight: Space[4],
                  },
            ]}
            resizeMode='cover'
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {description && (
            <Text style={styles.title} numberOfLines={1}>
              {description}
            </Text>
          )}
        </View>

        {/* Button Section */}
        {onPress && (
          <Button
            variant='arrow'
            onPress={onPress}
            style={{
              backgroundColor: comingSoon
                ? Colors.textDisabled
                : Colors.primary,
            }}
            disabled={disabled || loading}
          />
        )}
      </LinearGradient>
    </Component>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Space[3],
    marginBottom: Space[3],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Space[4],
    height: 74,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: BorderRadius.md,
    width: 114,
    height: 74,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: Space[3],
  },
  title: {
    fontSize: 22,
    color: Colors.text,
    fontWeight: '700',
    lineHeight: 28,
  },

  button: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: Colors.textDisabled,
    opacity: 0.6,
  },
});
