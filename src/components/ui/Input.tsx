import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { isIOS } from '../../constants';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  onIconPress?: () => void;
  variant?: 'default' | 'outlinedLight' | 'outlinedDark';
  measurement?: string;
  loading?: boolean;
  ref?: React.RefObject<TextInput>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  icon,
  onIconPress,
  variant = 'default',
  measurement = 'none',
  loading = false,
  style,
  ref,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const handleInputFocus = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };
  return (
    <TouchableOpacity
      onPress={handleInputFocus}
      activeOpacity={0.9}
      style={styles.container}
    >
      {label && (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          styles[`${variant}InputContainer`],
          isFocused && styles[`${variant}InputContainerFocused`],
          error && styles.inputContainerError,
        ]}
      >
        <TextInput
          ref={ref || inputRef}
          style={[
            styles.input,
            isFocused
              ? styles[`${variant}InputFocused`]
              : styles[`${variant}Input`],
            style,
          ]}
          selectionColor={
            variant === 'outlinedLight' ? Colors.background : Colors.text
          }
          placeholderTextColor={
            styles[`${variant}Placeholder`]?.color || Colors.textDisabled
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {measurement !== 'none' && (
          <Text
            style={[
              styles.measurement,
              styles[`${variant}Measurement`],
              isFocused && styles[`${variant}MeasurementFocused`],
            ]}
          >
            {measurement}
          </Text>
        )}

        {icon && !loading && (
          <TouchableOpacity
            onPress={onIconPress}
            disabled={!onIconPress}
            style={styles.iconContainer}
          >
            {icon}
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size='small'
              color={
                variant === 'outlinedLight' ? Colors.background : Colors.primary
              }
              style={styles.loadingIndicator}
            />
          </View>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helper,
            styles[`${variant}Helper`],
            error && styles.error,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[1],
  },
  // Label variants
  defaultLabel: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  outlinedLightLabel: {
    ...Typography.bodyBold,
    color: Colors.background,
  },
  outlinedDarkLabel: {
    ...Typography.bodyBold,
    color: Colors.textInverse,
  },
  // Input container base
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Space[3],
    paddingTop: isIOS ? Space[1] : Space[0],
  },

  // Input container variants
  defaultInputContainer: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  outlinedLightInputContainer: {
    borderColor: Colors.background,
    backgroundColor: Colors.transparent,
    borderRadius: BorderRadius.full,
    width: 86,
    paddingLeft: 10,
  },
  outlinedDarkInputContainer: {
    borderColor: Colors.textDisabled,
    backgroundColor: Colors.transparent,
    borderRadius: BorderRadius.full,
    width: 86,
    paddingLeft: 10,
  },
  // Input container focused states
  inputContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  defaultInputContainerFocused: {
    borderColor: Colors.text,
    backgroundColor: Colors.background,
  },
  outlinedLightInputContainerFocused: {
    borderColor: Colors.background,
    backgroundColor: Colors.transparent,
  },
  outlinedDarkInputContainerFocused: {
    borderColor: Colors.textDisabled,
    backgroundColor: Colors.transparent,
  },

  // Input container error state
  inputContainerError: {
    borderColor: Colors.error,
  },
  // Input base
  input: {
    ...Typography.body,
    flex: 1,
    height: 36,
    color: Colors.text,
    paddingBottom: Space[2],
  },

  // Input variants
  defaultInput: {
    ...Typography.bodyMedium,
    color: Colors.text,
    paddingBottom: Space[2],
    textAlignVertical: 'center',
  },
  outlinedLightInput: {
    ...Typography.bodyBold,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  outlinedDarkInput: {
    ...Typography.bodyBold,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  // Input focused states
  defaultInputFocused: {
    color: Colors.text,
    textAlignVertical: 'center',
  },
  outlinedLightInputFocused: {
    ...Typography.bodyBold,
    color: Colors.background,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  outlinedDarkInputFocused: {
    ...Typography.bodyBold,
    color: Colors.text,
    height: 36,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  // Placeholder colors
  defaultPlaceholder: {
    color: Colors.textDisabled,
  },
  outlinedLightPlaceholder: {
    color: Colors.textDisabled,
  },
  outlinedDarkPlaceholder: {
    color: Colors.textDisabled,
  },
  // Measurement base
  measurement: {
    ...Typography.bodyBold,
    color: Colors.textDisabled,
    marginBottom: Space[2],
  },

  // Measurement variants
  defaultMeasurement: {
    color: Colors.textDisabled,
  },
  defaultMeasurementFocused: {
    color: Colors.primary,
  },
  outlinedLightMeasurement: {
    color: Colors.textDisabled,
  },
  outlinedLightMeasurementFocused: {
    color: Colors.background,
  },
  outlinedDarkMeasurement: {
    color: Colors.textDisabled,
  },
  outlinedDarkMeasurementFocused: {
    color: Colors.text,
  },
  // Icon container
  iconContainer: {
    marginLeft: Space[2],
  },

  // Loading indicator
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space[1],
    paddingVertical: Space[1],
  },
  loadingIndicator: {
    marginLeft: Space[1],
    marginRight: Space[1],
  },
  // Helper text base
  helper: {
    ...Typography.caption,
    marginTop: Space[1],
  },

  // Helper text variants
  defaultHelper: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  outlinedLightHelper: {
    ...Typography.small,
    color: Colors.textDisabled,
  },
  outlinedDarkHelper: {
    ...Typography.small,
    color: Colors.textDisabled,
  },

  // Error state
  error: {
    color: Colors.error,
  },
});
