import { ArrowRight, Plus } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

export interface ButtonProps extends TouchableOpacityProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'disabled'
    | 'tertiary'
    | 'ghost'
    | 'arrow'
    | 'plus'
    | 'dark';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const shouldUseFullWidth =
    fullWidth && variant !== 'arrow' && variant !== 'plus';

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'secondary'
              ? Colors.textInverse
              : Colors.primary
          }
          size='small'
        />
      );
    }

    if (variant === 'arrow') {
      return (
        <ArrowRight size={20} strokeWidth={2.5} color={Colors.textInverse} />
      );
    }

    if (variant === 'plus') {
      return <Plus size={20} color={Colors.textInverse} />;
    }

    return (
      <Text
        style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`]]}
      >
        {children}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        variant !== 'arrow' && variant !== 'plus' && styles[size],
        shouldUseFullWidth && styles.fullWidth,
        isDisabled && styles.disabledState,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.md,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    ...Shadows.md,
  },
  disabled: {
    backgroundColor: Colors.textDisabled,
    ...Shadows.md,
  },
  tertiary: {
    backgroundColor: Colors.tertiary,
    ...Shadows.sm,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  arrow: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
    flexGrow: 0,
    ...Shadows.sm,
  },
  plus: {
    backgroundColor: Colors.primary,
    width: 29,
    height: 29,
    borderRadius: 29,
    flexShrink: 0,
    flexGrow: 0,
    ...Shadows.sm,
  },
  dark: {
    backgroundColor: Colors.text,

    ...Shadows.sm,
  },
  // Sizes
  small: {
    height: 32,
    paddingHorizontal: Space[4],
  },
  medium: {
    height: 40,
    paddingHorizontal: Space[6],
  },
  large: {
    height: 48,
    paddingHorizontal: Space[8],
  },

  // States
  disabledState: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    ...Typography.bodyMedium,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondaryText: {
    color: Colors.textInverse,
  },
  tertiaryText: {
    color: Colors.textInverse,
  },
  disabledText: {
    color: Colors.background,
  },
  ghostText: {
    color: Colors.text,
  },
  arrowText: {
    color: Colors.textInverse,
  },
  plusText: {
    color: Colors.textInverse,
  },
  darkText: {
    color: Colors.background,
    fontWeight: 'bold',
  },

  // Text sizes
  smallText: {
    fontSize: Typography.fontSize.sm,
  },
  mediumText: {
    fontSize: Typography.fontSize.base,
  },
  largeText: {
    fontSize: Typography.fontSize.lg,
  },
});
