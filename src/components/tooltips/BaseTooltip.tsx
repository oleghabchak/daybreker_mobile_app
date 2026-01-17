import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { BorderRadius, Colors, Shadows, Space } from '../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type TooltipPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

export interface BaseTooltipProps {
  isVisible: boolean;
  onShow?: () => void;
  onHide?: () => void;
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  tooltipStyle?: StyleProp<ViewStyle>;
  width?: number;
  height?: number;
  showArrow?: boolean;
  overlayStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  trigger?: 'press' | 'longPress';
}

export const BaseTooltip: React.FC<BaseTooltipProps> = ({
  isVisible,
  onShow,
  onHide,
  children,
  content,
  position = 'top',
  disabled = false,
  style,
  tooltipStyle,
  width = 220,
  height = 140,
  showArrow = true,
  overlayStyle,
  onPress,
  trigger = 'press',
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const childRef = useRef<View>(null);

  const showTooltip = () => {
    if (disabled) return;

    onShow?.();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.();
    });
  };

  const handlePress = () => {
    if (trigger === 'press') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
      onPress?.();
    }
  };

  const handleLongPress = () => {
    if (trigger === 'longPress') {
      showTooltip();
      onPress?.();
    }
  };

  const calculatePosition = () => {
    if (!childRef.current) return;

    // For centered positioning, we don't need to measure the child
    if (position === 'center') {
      setTooltipPosition({
        x: (screenWidth - width) / 2,
        y: (screenHeight - height) / 2,
      });
      return;
    }

    childRef.current.measure((x, y, childWidth, childHeight, pageX, pageY) => {
      let tooltipX = pageX + childWidth / 2 - width / 2;
      let tooltipY = pageY;

      // Adjust position based on tooltip position prop
      switch (position) {
        case 'top':
          tooltipY = pageY - height - Space[2];
          break;
        case 'bottom':
          tooltipY = pageY + childHeight + Space[2];
          break;
        case 'left':
          tooltipX = pageX - width - Space[2];
          tooltipY = pageY + childHeight / 2 - height / 2;
          break;
        case 'right':
          tooltipX = pageX + childWidth + Space[2];
          tooltipY = pageY + childHeight / 2 - height / 2;
          break;
        case 'top-left':
          tooltipX = pageX;
          tooltipY = pageY - height - Space[2];
          break;
        case 'top-right':
          tooltipX = pageX + childWidth - width;
          tooltipY = pageY - height - Space[2];
          break;
        case 'bottom-left':
          tooltipX = pageX;
          tooltipY = pageY + childHeight + Space[2];
          break;
        case 'bottom-right':
          tooltipX = pageX + childWidth - width;
          tooltipY = pageY + childHeight + Space[2];
          break;
        case 'left-top':
          tooltipX = pageX - width - Space[2];
          tooltipY = pageY;
          break;
        case 'left-bottom':
          tooltipX = pageX - width - Space[2];
          tooltipY = pageY + childHeight - height;
          break;
        case 'right-top':
          tooltipX = pageX + childWidth + Space[2];
          tooltipY = pageY;
          break;
        case 'right-bottom':
          tooltipX = pageX + childWidth + Space[2];
          tooltipY = pageY + childHeight - height;
          break;
      }

      // Ensure tooltip stays within screen bounds
      if (tooltipX < Space[3]) tooltipX = Space[3];
      if (tooltipX + width > screenWidth - Space[3]) {
        tooltipX = screenWidth - width - Space[3];
      }
      if (tooltipY < Space[3]) tooltipY = Space[3];

      setTooltipPosition({ x: tooltipX, y: tooltipY });
    });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      showTooltip();
    } else {
      hideTooltip();
    }
  }, [isVisible]);

  const renderArrow = () => {
    if (!showArrow || position === 'center') return null;

    const arrowStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderBottomWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: Colors.border,
    };

    switch (position) {
      case 'top':
        return (
          <View
            style={[
              arrowStyle,
              {
                bottom: -6,
                left: '50%',
                marginLeft: -6,
                transform: [{ rotate: '180deg' }],
              },
            ]}
          />
        );
      case 'bottom':
        return (
          <View
            style={[
              arrowStyle,
              {
                top: -6,
                left: '50%',
                marginLeft: -6,
              },
            ]}
          />
        );
      case 'left':
        return (
          <View
            style={[
              arrowStyle,
              {
                right: -6,
                top: '50%',
                marginTop: -6,
                transform: [{ rotate: '90deg' }],
              },
            ]}
          />
        );
      case 'right':
        return (
          <View
            style={[
              arrowStyle,
              {
                left: -6,
                top: '50%',
                marginTop: -6,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        );
      case 'top-left':
        return (
          <View
            style={[
              arrowStyle,
              {
                bottom: -6,
                left: 20,
                transform: [{ rotate: '180deg' }],
              },
            ]}
          />
        );
      case 'top-right':
        return (
          <View
            style={[
              arrowStyle,
              {
                bottom: -6,
                right: 20,
                transform: [{ rotate: '180deg' }],
              },
            ]}
          />
        );
      case 'bottom-left':
        return (
          <View
            style={[
              arrowStyle,
              {
                top: -6,
                left: 20,
              },
            ]}
          />
        );
      case 'bottom-right':
        return (
          <View
            style={[
              arrowStyle,
              {
                top: -6,
                right: 20,
              },
            ]}
          />
        );
      case 'left-top':
        return (
          <View
            style={[
              arrowStyle,
              {
                right: -6,
                top: 20,
                transform: [{ rotate: '90deg' }],
              },
            ]}
          />
        );
      case 'left-bottom':
        return (
          <View
            style={[
              arrowStyle,
              {
                right: -6,
                bottom: 20,
                transform: [{ rotate: '90deg' }],
              },
            ]}
          />
        );
      case 'right-top':
        return (
          <View
            style={[
              arrowStyle,
              {
                left: -6,
                top: 20,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        );
      case 'right-bottom':
        return (
          <View
            style={[
              arrowStyle,
              {
                left: -6,
                bottom: 20,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TouchableOpacity
        ref={childRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        style={[styles.childContainer, style]}
      >
        {children}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType='none'
        onRequestClose={hideTooltip}
      >
        <Pressable
          style={[
            styles.overlay,
            position === 'center' && styles.centerOverlay,
            overlayStyle,
          ]}
          onPress={hideTooltip}
        >
          <Animated.View
            style={[
              styles.tooltip,
              position === 'center' && styles.centeredTooltip,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                width,
                ...(position !== 'center'
                  ? { left: tooltipPosition.x, top: tooltipPosition.y }
                  : {}),
              },
              tooltipStyle,
            ]}
          >
            {renderArrow()}
            {content}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  childContainer: {
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(151, 151, 151, 0.3)',
  },
  centerOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    ...Shadows.lg,
    zIndex: 1000,
  },
  centeredTooltip: {
    position: 'relative',
  },
});

export default BaseTooltip;
