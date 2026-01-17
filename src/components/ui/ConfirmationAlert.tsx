import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Colors, Space, Typography } from '../../constants/theme';

import { Button } from './Button';

export interface ConfirmationAlertProps {
  isVisible: boolean;
  onConfirm: () => void;
  onClose?: () => void;
  onCancel?: () => void;

  // Content
  title?: string;
  subtitle?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;

  // Styling
  variant?: 'danger' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';

  // Behavior
  loading?: boolean;
  disabled?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButtonPress?: boolean;

  // Edit Input functionality
  showInput?: boolean;
  inputValue?: string;
  inputPlaceholder?: string;
  inputLabel?: string;
  onInputChange?: (value: string) => void;
  inputValidation?: (value: string) => string | null; // Return error message or null
  maxLength?: number;
  multiline?: boolean;
}

export const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  isVisible,
  onClose,
  onConfirm,
  onCancel,
  title,
  subtitle,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  size = 'small',
  loading = false,
  disabled = false,
  closeOnBackdropPress = true,
  closeOnBackButtonPress = true,
  showInput = false,
  inputValue = '',
  inputPlaceholder = '',
  inputLabel = '',
  onInputChange,
  inputValidation,
  maxLength,
  multiline = false,
}) => {
  const [localInputValue, setLocalInputValue] = useState(inputValue);
  const [inputError, setInputError] = useState<string | null>(null);

  // Update local input value when prop changes
  useEffect(() => {
    setLocalInputValue(inputValue);
  }, [inputValue]);

  // Reset error when input changes
  useEffect(() => {
    if (inputError && localInputValue !== inputValue) {
      setInputError(null);
    }
  }, [localInputValue, inputValue, inputError]);

  const handleInputChange = (value: string) => {
    setLocalInputValue(value);
    if (onInputChange) {
      onInputChange(value);
    }
  };

  const validateInput = (): boolean => {
    if (!showInput) return true;

    if (inputValidation) {
      const error = inputValidation(localInputValue);
      if (error) {
        setInputError(error);
        return false;
      }
    }

    setInputError(null);
    return true;
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmVariant: 'primary' as const,
          confirmText: confirmText || 'Delete',
          iconColor: Colors.error,
        };
      case 'warning':
        return {
          confirmVariant: 'primary' as const,
          confirmText: confirmText || 'Continue',
          iconColor: Colors.warning,
        };
      case 'success':
        return {
          confirmVariant: 'primary' as const,
          confirmText: confirmText || 'Confirm',
          iconColor: Colors.success,
        };
      case 'info':
      default:
        return {
          confirmVariant: 'primary' as const,
          confirmText: confirmText || 'Confirm',
          iconColor: Colors.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const handleConfirm = () => {
    if (!disabled && !loading) {
      if (showInput && !validateInput()) {
        return;
      }
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {/* Content */}
            <View style={styles.content}>
              {subtitle && (
                <Text
                  style={[styles.subtitle, { color: variantStyles.iconColor }]}
                >
                  {subtitle}
                </Text>
              )}
              {message && <Text style={styles.message}>{message}</Text>}

              {/* Input Field */}
              {showInput && (
                <View style={styles.inputContainer}>
                  {inputLabel && (
                    <Text style={styles.inputLabel}>{inputLabel}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      multiline && styles.inputMultiline,
                      inputError && styles.inputError,
                    ]}
                    value={localInputValue}
                    onChangeText={handleInputChange}
                    placeholder={inputPlaceholder}
                    placeholderTextColor={Colors.textSecondary}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                    autoFocus={showInput}
                    returnKeyType='done'
                    onSubmitEditing={handleConfirm}
                  />
                  {inputError && (
                    <Text style={styles.errorText}>{inputError}</Text>
                  )}
                  {maxLength && (
                    <Text style={styles.characterCount}>
                      {localInputValue.length}/{maxLength}
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                variant='ghost'
                onPress={handleCancel}
                disabled={loading}
                style={styles.button}
              >
                {cancelText}
              </Button>
              <Button
                variant={variantStyles.confirmVariant}
                onPress={handleConfirm}
                loading={loading}
                disabled={disabled || loading}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator size='small' color={Colors.background} />
                ) : (
                  variantStyles.confirmText
                )}
              </Button>
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    margin: Space[12],
    maxWidth: '90%',
    minWidth: 280,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  modalContent: {
    padding: Space[6],
  },
  content: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: Space[2],
    marginBottom: Space[4],
  },
  title: {
    ...Typography.h3,
    fontWeight: '600' as const,
    marginBottom: Space[3],
    textAlign: 'center' as const,
  },
  subtitle: {
    ...Typography.h3,
    fontWeight: '500' as const,
    marginBottom: Space[2],
    textAlign: 'center' as const,
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: Space[2],
  },
  actions: {
    flexDirection: 'row' as const,
    gap: Space[3],
  },
  button: {
    flex: 1,
  },
  inputContainer: {
    marginTop: Space[2],
    width: '100%',
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
    marginBottom: Space[1],
    fontWeight: '500',
  },
  input: {
    ...Typography.bodyMedium,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Space[3],
    paddingVertical: Space[1],
    backgroundColor: Colors.background,
    color: Colors.text,
    minHeight: 44,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Space[1],
  },
  characterCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Space[1],
  },
});
