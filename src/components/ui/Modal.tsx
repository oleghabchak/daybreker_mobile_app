import React, { ReactNode } from 'react';
import {
  Dimensions,
  Modal as RNModal,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

import { Button } from './Button';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  // Visibility
  isVisible: boolean;
  onClose: () => void;

  // Content
  title?: string;
  subtitle?: string;
  children?: ReactNode;

  // Actions
  primaryAction?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
    loading?: boolean;
    disabled?: boolean;
  };

  // Styling
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackButtonPress?: boolean;

  // Animation
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?:
    | 'fullScreen'
    | 'pageSheet'
    | 'formSheet'
    | 'overFullScreen';

  // Custom styling
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  actionsStyle?: ViewStyle;

  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackButtonPress = true,
  animationType = 'fade',
  presentationStyle = 'overFullScreen',
  containerStyle,
  contentStyle,
  headerStyle,
  titleStyle,
  subtitleStyle,
  actionsStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const getModalSize = () => {
    switch (size) {
      case 'small':
        return { width: screenWidth * 0.8, maxHeight: screenHeight * 0.4 };
      case 'medium':
        return { width: screenWidth * 0.9, maxHeight: screenHeight * 0.7 };
      case 'large':
        return { width: screenWidth * 0.95, maxHeight: screenHeight * 0.85 };
      case 'fullscreen':
        return { width: screenWidth, height: screenHeight };
      default:
        return { width: screenWidth * 0.9, maxHeight: screenHeight * 0.7 };
    }
  };

  const modalSize = getModalSize();

  const handleBackdropPress = () => {
    onClose();
  };

  const handleBackButtonPress = () => {
    if (closeOnBackButtonPress) {
      onClose();
      return true; // Prevent default back button behavior
    }
    return false;
  };

  return (
    <RNModal
      visible={isVisible}
      transparent={true}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={handleBackButtonPress}
      statusBarTranslucent={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View style={[styles.overlay, containerStyle]}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={handleBackdropPress}
        />

        {/* Modal Content */}
        <View
          style={[
            styles.modalShadow,
            modalSize,
            { borderRadius: BorderRadius.xl },
          ]}
        >
          <View style={[styles.modalContainer, contentStyle]}>
            {/* Header */}
            {(title || subtitle || showCloseButton) && (
              <View style={[styles.header, headerStyle]}>
                <View style={styles.headerContent}>
                  {title && (
                    <Text style={[styles.title, titleStyle]}>{title}</Text>
                  )}
                  {subtitle && (
                    <Text style={[styles.subtitle, subtitleStyle]}>
                      {subtitle}
                    </Text>
                  )}
                </View>

                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel='Close modal'
                    accessibilityRole='button'
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            {children && <View style={styles.content}>{children}</View>}

            {/* Actions */}
            {(primaryAction || secondaryAction) && (
              <View style={[styles.actions, actionsStyle]}>
                {secondaryAction && (
                  <Button
                    variant={secondaryAction.variant || 'ghost'}
                    onPress={secondaryAction.onPress}
                    loading={secondaryAction.loading}
                    disabled={secondaryAction.disabled}
                    style={styles.secondaryButton}
                  >
                    {secondaryAction.label}
                  </Button>
                )}

                {primaryAction && (
                  <Button
                    variant={primaryAction.variant || 'primary'}
                    onPress={primaryAction.onPress}
                    loading={primaryAction.loading}
                    disabled={primaryAction.disabled}
                    style={styles.primaryButton}
                  >
                    {primaryAction.label}
                  </Button>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  modalContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    margin: Space[4],
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalShadow: {
    borderRadius: BorderRadius.xl,
    backgroundColor: 'transparent',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Space[6],
    paddingTop: Space[6],
    backgroundColor: 'transparent',
  },
  headerContent: {
    flex: 1,
    textAlign: 'center',
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Space[1],
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textDisabled,
    fontWeight: '300',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: Space[6],
    paddingVertical: Space[4],
    backgroundColor: Colors.background,
  },
  actions: {
    flexDirection: 'row',
    gap: Space[3],
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    backgroundColor: Colors.background,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
});

// Preset modal configurations for common use cases
export const ModalPresets = {
  // Confirmation dialog
  confirmation: (
    props: Partial<ModalProps> & {
      onConfirm: () => void;
      onCancel: () => void;
      message: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) => ({
    size: 'small' as const,
    primaryAction: {
      label: props.confirmText || 'Confirm',
      onPress: props.onConfirm,
      variant: 'primary' as const,
    },
    secondaryAction: {
      label: props.cancelText || 'Cancel',
      onPress: props.onCancel,
      variant: 'ghost' as const,
    },
    children: (
      <Text style={presetStyles.confirmationText}>{props.message}</Text>
    ),
    ...props,
  }),

  // Alert dialog
  alert: (
    props: Partial<ModalProps> & {
      message: string;
      buttonText?: string;
    }
  ) => ({
    size: 'small' as const,
    primaryAction: {
      label: props.buttonText || 'OK',
      onPress: props.onClose!,
      variant: 'primary' as const,
    },
    children: <Text style={presetStyles.alertText}>{props.message}</Text>,
    ...props,
  }),

  // Loading modal
  loading: (
    props: Partial<ModalProps> & {
      message?: string;
    }
  ) => ({
    size: 'small' as const,
    showCloseButton: false,
    closeOnBackdropPress: false,
    closeOnBackButtonPress: false,
    children: (
      <View style={presetStyles.loadingContainer}>
        <Text style={presetStyles.loadingText}>
          {props.message || 'Loading...'}
        </Text>
      </View>
    ),
    ...props,
  }),

  // Form modal
  form: (props: Partial<ModalProps>) => ({
    size: 'large' as const,
    ...props,
  }),

  // Full screen modal
  fullscreen: (props: Partial<ModalProps>) => ({
    size: 'fullscreen' as const,
    animationType: 'slide' as const,
    ...props,
  }),
};

// Additional styles for presets
const presetStyles = StyleSheet.create({
  confirmationText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  alertText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Space[6],
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
