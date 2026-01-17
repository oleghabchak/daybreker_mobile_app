import { HelpCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export interface TooltipProps {
  content: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  showArrow?: boolean;
  trigger?: 'press' | 'longPress' | 'hover';
  disabled?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  emphasis?: string;
  afterEmphasis?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  children,
  position = 'top',
  maxWidth = screenWidth - Space[6],
  showArrow = true,
  trigger = 'press',
  disabled = false,
  onShow,
  onHide,
  containerStyle,
  fullWidth = false,
  emphasis,
  afterEmphasis,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipWidth, setTooltipWidth] = useState<number>(
    Math.min(maxWidth, screenWidth - Space[6])
  );
  const [arrowOffset, setArrowOffset] = useState<number | '50%'>('50%');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const childRef = useRef<View>(null);

  const showTooltip = () => {
    if (disabled) return;

    setIsVisible(true);
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
      setIsVisible(false);
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
    }
  };

  const handleLongPress = () => {
    if (trigger === 'longPress') {
      showTooltip();
    }
  };

  const calculatePosition = () => {
    if (!childRef.current) return;

    childRef.current.measure((x, y, width, height, pageX, pageY) => {
      const approxHeight = 80; // Approximate height used for y-positioning

      let nextWidth = Math.min(maxWidth, screenWidth - Space[3] - pageX);
      if (fullWidth) {
        nextWidth = screenWidth - Space[6];
      }

      // Ensure a sensible minimum width
      if (nextWidth < 200) {
        nextWidth = Math.min(maxWidth, screenWidth - Space[6]);
      }

      let tooltipX = pageX; // Anchor left edge to the trigger by default
      if (fullWidth) {
        tooltipX = Space[3];
      }
      let tooltipY = pageY;

      switch (position) {
        case 'top':
          // Nudge upward a bit more so the bubble bottom appears to float just above the trigger
          tooltipY = pageY - approxHeight - Space[2] - Space[2] - Space[1];
          break;
        case 'bottom':
          tooltipY = pageY + height + Space[2];
          break;
        case 'left':
          tooltipX = pageX - nextWidth - Space[2];
          tooltipY = pageY + height / 2 - approxHeight / 2;
          break;
        case 'right':
          tooltipX = pageX + width + Space[2];
          tooltipY = pageY + height / 2 - approxHeight / 2;
          break;
      }

      // Keep within screen bounds horizontally
      if (tooltipX < Space[3]) tooltipX = Space[3];
      if (tooltipX + nextWidth > screenWidth - Space[3]) {
        nextWidth = screenWidth - tooltipX - Space[3];
      }
      if (tooltipY < Space[3]) tooltipY = Space[3];

      setTooltipPosition({ x: tooltipX, y: tooltipY });
      setTooltipWidth(nextWidth);

      // Position the arrow to visually originate from the trigger
      // Arrow offset is relative to the tooltip container's left edge
      const triggerCenterRelative = pageX + width / 2 - tooltipX;
      const minArrow = 10;
      const maxArrow = nextWidth - 10;
      const clamped = Math.max(
        minArrow,
        Math.min(triggerCenterRelative, maxArrow)
      );
      setArrowOffset(clamped);
    });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const renderArrow = () => {
    if (!showArrow) return null;

    const arrowStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderBottomWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: Colors.surface,
    };

    switch (position) {
      case 'top':
        return (
          <View
            style={[
              arrowStyle,
              {
                bottom: -6,
                left: arrowOffset,
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
                left: arrowOffset,
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
        style={[containerStyle, styles.childContainer]}
      >
        {children || <HelpCircle size={16} color={Colors.textDisabled} />}
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType='none'
        onRequestClose={hideTooltip}
      >
        <Pressable style={styles.overlay} onPress={hideTooltip}>
          <Animated.View
            style={[
              styles.tooltip,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                width: tooltipWidth,
              },
            ]}
          >
            {renderArrow()}
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {content
                ? typeof content === 'string'
                  ? <Text style={styles.text}>{content}</Text>
                  : content
                : null}
              {emphasis ? (
                <Text style={[styles.text, { marginTop: Space[2] }]}>
                  <Text style={styles.emphasis}>{emphasis}</Text>
                  {afterEmphasis ? ` ${afterEmphasis}` : ''}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  childContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Space[3],
    ...Shadows.md,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[1],
  },
  text: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  emphasis: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.text,
  },
});

export default Tooltip;
