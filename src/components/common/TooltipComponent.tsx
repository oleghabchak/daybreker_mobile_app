import { Info, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Typography } from '../../constants/theme';

import { useTooltipManager } from './TooltipProvider';

const SCREEN = Dimensions.get('window');
const MAX_BOX_HEIGHT_RATIO = 0.85; // allow up to 85% of screen height before scrolling

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getTooltipMetrics = (parentFontSize?: number) => {
  const baseSize = parentFontSize && parentFontSize > 0 ? parentFontSize : 16;
  const iconSize = clamp(baseSize * 0.85, 12, 24);
  const spacing = clamp(baseSize * 0.4, 4, 12);
  const hitSlop = clamp(iconSize * 0.5, 6, 14);

  return {
    iconSize,
    spacing,
    hitSlop,
  };
};

export interface TooltipComponentProps {
  content: React.ReactNode | string;
  titleFontSize?: number;
  titleText?: string;
  testID?: string;
  children?: React.ReactNode;
  triggerSize?: number;
  triggerColor?: string;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerHitSlop?: number;
}

export const TooltipComponent: React.FC<TooltipComponentProps> = ({
  content,
  titleFontSize = 16,
  titleText,
  testID,
  children,
  triggerSize,
  triggerColor,
  triggerStyle,
  triggerHitSlop,
}) => {
  const { openId, toggle, close } = useTooltipManager();
  const [selfId] = useState(
    () => `tooltip-${Math.random().toString(36).slice(2)}`
  );
  const isOpen = openId === selfId;

  const anchorRef = useRef<View>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const tooltipMetrics = getTooltipMetrics(titleFontSize);
  const derivedIconSize = triggerSize ?? tooltipMetrics.iconSize;
  const hitSlopAmount = triggerHitSlop ?? tooltipMetrics.hitSlop;
  const combinedTriggerStyle: StyleProp<ViewStyle> = children
    ? triggerStyle
    : triggerStyle
      ? [styles.trigger, triggerStyle]
      : styles.trigger;

  useEffect(() => {
    if (!isOpen) return;
    // Recalculate in case of orientation/keyboard changes
    const sub = Dimensions.addEventListener('change', () => close());
    return () => sub.remove();
  }, [isOpen, close]);

  return (
    <>
      <TouchableOpacity
        ref={anchorRef}
        testID={testID}
        onPress={() => toggle(selfId)}
        style={combinedTriggerStyle}
        hitSlop={{
          top: hitSlopAmount,
          bottom: hitSlopAmount,
          left: hitSlopAmount,
          right: hitSlopAmount,
        }}
      >
        {children ? (
          children
        ) : (
          <Info
            size={derivedIconSize}
            color={triggerColor ?? '#9CA3AF'}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType='none'
        onRequestClose={close}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <View style={styles.tooltip} pointerEvents='box-none'>
            <View
              style={[
                styles.box,
                { maxHeight: SCREEN.height * MAX_BOX_HEIGHT_RATIO },
              ]}
            >
              <TouchableOpacity
                onPress={close}
                style={styles.closeButton}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <X size={20} color={'#9CA3AF'} />
              </TouchableOpacity>
              {contentHeight > SCREEN.height * MAX_BOX_HEIGHT_RATIO - 32 ? (
                <ScrollView>
                  <View
                    onLayout={e =>
                      setContentHeight(e.nativeEvent.layout.height)
                    }
                  >
                    {titleText ? (
                      <Text style={styles.title}>{titleText}</Text>
                    ) : null}
                    {typeof content === 'string' ? (
                      <Text style={styles.text}>{content}</Text>
                    ) : (
                      content
                    )}
                  </View>
                </ScrollView>
              ) : (
                <View
                  onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
                >
                  {titleText ? (
                    <Text style={styles.title}>{titleText}</Text>
                  ) : null}
                  {typeof content === 'string' ? (
                    <Text style={styles.text}>{content}</Text>
                  ) : (
                    content
                  )}
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    width: SCREEN.width,
    marginHorizontal: 0,
  },
  box: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: Colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  text: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 20,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  trigger: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TooltipComponent;
