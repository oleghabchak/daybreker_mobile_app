import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

export interface CheckboxProps extends TouchableOpacityProps {
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  skipped?: boolean;
  size?: number;
  variant?: 'default' | 'primary' | 'secondary';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckChange,
  label,
  description,
  disabled = false,
  skipped = false,
  size = 35,
  variant = 'default',
  style,
  ...props
}) => {
  const handlePress = () => {
    if (!disabled && onCheckChange) {
      onCheckChange(!checked);
    }
  };

  // If disabled is true, force checked to true
  const isChecked = skipped ? true : checked;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles[variant],
        disabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <View
        style={[
          styles.checkbox,
          { width: size, height: size },
          styles[`${variant}Checkbox`],
          isChecked && styles.checkboxChecked,
          isChecked && styles[`${variant}CheckboxChecked`],
          disabled && styles.checkboxDisabled,
          skipped && styles.checkboxSkipped,
        ]}
      >
        {isChecked && (
          <Text
            style={[
              styles.checkmark,
              { fontSize: size * 0.6 },
              styles[`${variant}Checkmark`],
            ]}
          >
            {skipped ? '-' : '✓'}
          </Text>
        )}
      </View>

      {(label || description) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text
              style={[
                styles.label,
                { fontSize: size * 0.8 },
                styles[`${variant}Label`],
                disabled && styles.labelDisabled,
              ]}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              style={[
                styles.description,
                { fontSize: size * 0.6 },
                styles[`${variant}Description`],
                disabled && styles.descriptionDisabled,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  default: {},
  primary: {},
  secondary: {},
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.transparent,
  },
  defaultCheckbox: {
    borderColor: Colors.border,
  },
  primaryCheckbox: {
    borderColor: Colors.primary,
  },
  secondaryCheckbox: {
    borderColor: Colors.secondary,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultCheckboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  primaryCheckboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  secondaryCheckboxChecked: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  checkboxDisabled: {
    borderColor: Colors.textDisabled,
  },
  checkboxSkipped: {
    borderColor: Colors.tertiary,
    backgroundColor: Colors.tertiary,
    paddingBottom: 3,
  },
  checkmark: {
    color: Colors.textInverse,
    fontWeight: 'bold',
  },
  defaultCheckmark: {
    color: Colors.textInverse,
  },
  primaryCheckmark: {
    color: Colors.textInverse,
  },
  secondaryCheckmark: {
    color: Colors.textInverse,
  },
  labelContainer: {
    flex: 1,
    marginLeft: Space[2],
    justifyContent: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  defaultLabel: {
    color: Colors.text,
  },
  primaryLabel: {
    color: Colors.primary,
  },
  secondaryLabel: {
    color: Colors.secondary,
  },
  labelDisabled: {
    color: Colors.textDisabled,
  },
  description: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: Space[1],
  },

  defaultDescription: {
    color: Colors.textDisabled,
  },
  primaryDescription: {
    color: Colors.primary,
    opacity: 0.8,
  },
  secondaryDescription: {
    color: Colors.secondary,
    opacity: 0.8,
  },
  descriptionDisabled: {
    color: Colors.textDisabled,
  },
});
