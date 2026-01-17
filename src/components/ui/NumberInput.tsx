import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { isIOS } from '../../constants';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

export interface NumberInputProps
  extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  onIconPress?: () => void;
  variant?: 'default' | 'outlinedLight' | 'outlinedDark';
  measurement?: string;
  loading?: boolean;
  ref?: React.RefObject<TextInput>;
  value?: number | string;
  onChangeText?: (value: string) => void;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  maxLength?: number;
  decimalPlaces?: number;
  loadingPosition?: 'right' | 'left';
  style?: StyleProp<ViewStyle>;
  maxValue?: number;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  measurementStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
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
  value,
  onChangeText,
  allowDecimals = true,
  allowNegative = false,
  maxLength,
  decimalPlaces = 2,
  loadingPosition = 'right',
  maxValue,
  inputContainerStyle,
  inputStyle,
  measurementStyle,
  disabled = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const formatNumber = (text: string): string => {
    let cleaned = text.replace(/[^0-9.-]/g, '');

    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, '');
    } else {
      cleaned = cleaned.replace(/(?!^)-/g, '');
    }

    if (maxValue !== undefined && cleaned !== '' && cleaned !== '-') {
      const numericValue = parseFloat(cleaned);
      if (!isNaN(numericValue) && numericValue > maxValue) {
        cleaned = String(maxValue);
      }
    }

    if (!allowDecimals) {
      cleaned = cleaned.replace(/\./g, '');
    } else {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }

      if (parts.length === 2 && parts[1].length > decimalPlaces) {
        cleaned = parts[0] + '.' + parts[1].substring(0, decimalPlaces);
      }
    }

    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const formattedText = formatNumber(text);
    onChangeText?.(formattedText);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Clear the field if the current value is "0" to allow fresh input
    if (displayValue === '0' || displayValue === 0) {
      onChangeText?.('');
    }
  };

  const getKeyboardType = (): TextInputProps['keyboardType'] => {
    if (allowDecimals) {
      return 'decimal-pad';
    }
    return 'number-pad';
  };

  const displayValue = (() => {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  })();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          disabled && styles.inputContainerDisabled,
          styles[`${variant}InputContainer`],
          isFocused && styles[`${variant}InputContainerFocused`],
          error && styles.inputContainerError,
          style,
          inputContainerStyle,
        ]}
      >
        <TextInput
          ref={ref}
          style={[
            styles.input,
            isFocused
              ? styles[`${variant}InputFocused`]
              : styles[`${variant}Input`],
            style,
            inputStyle,
          ]}
          selectionColor={
            variant === 'outlinedLight' ? Colors.background : Colors.text
          }
          placeholder={'0'}
          placeholderTextColor={
            styles[`${variant}Placeholder`]?.color || Colors.textDisabled
          }
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          keyboardType={getKeyboardType()}
          value={displayValue}
          onChangeText={handleTextChange}
          maxLength={maxLength}
          editable={!disabled}
          {...props}
        />

        {measurement !== 'none' && (
          <Text
            style={[
              styles.measurement,
              styles[`${variant}Measurement`],
              isFocused && styles[`${variant}MeasurementFocused`],
              measurementStyle,
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
          <View
            style={[
              styles.loadingContainer,
              {
                right: loadingPosition === 'right' ? 4 : 74,
              },
            ]}
          >
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    ...Typography.bodyMedium,
    color: Colors.text,
  },
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Space[2],
  },

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
  inputContainerDisabled: {
    opacity: 0.4,
  },
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

  inputContainerError: {
    borderColor: Colors.error,
  },
  input: {
    ...Typography.body,
    flex: 1,
    height: 36,
    color: Colors.text,
    paddingBottom: isIOS ? 3 : 8,
  },

  defaultInput: {
    ...Typography.bodyMedium,
    color: Colors.text,
    paddingBottom: 3,
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
  defaultPlaceholder: {
    color: Colors.textDisabled,
  },
  outlinedLightPlaceholder: {
    color: Colors.textDisabled,
  },
  outlinedDarkPlaceholder: {
    color: Colors.textDisabled,
  },
  measurement: {
    ...Typography.bodyBold,
    color: Colors.textDisabled,
    marginBottom: 1,
    marginLeft: -12,
  },

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
  iconContainer: {
    marginLeft: Space[2],
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space[0],
    paddingVertical: Space[0],
  },
  loadingIndicator: {
    marginLeft: Space[0],
    marginRight: Space[0],
  },
  helper: {
    ...Typography.caption,
    marginTop: Space[1],
  },

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

  error: {
    color: Colors.error,
  },
});
