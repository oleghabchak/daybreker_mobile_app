import * as React from 'react';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ScreenWidth } from '../../constants';
import { Colors, Space } from '../../constants/theme';
import { addOpacity } from '../../utils/helpers';
import { Divider } from '../ui/Divider';

interface SliderProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  showPagination?: boolean;
  autoPlay?: boolean;
  onItemChange?: (index: number) => void;
  // When true, measure active slide and set container height accordingly
  fitContent?: boolean;
}

export interface SliderRef {
  scrollToNext: () => void;
  scrollToPrevious: () => void;
  scrollToIndex: (index: number) => void;
  currentIndex: number;
}

export const Slider = React.forwardRef<SliderRef, SliderProps>(
  (
    {
      children,
      width = ScreenWidth - Space[6] * 2, // Default to screen width minus padding
      height = 180,
      showPagination = true,
      autoPlay = false,
      onItemChange,
      fitContent = false,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const [measuredHeights, setMeasuredHeights] = React.useState<number[]>([]);

    // Ensure width is valid, fallback to a reasonable default
    const effectiveWidth = React.useMemo(() => {
      if (width && width > 0) {
        return width;
      }
      // Fallback to a reasonable default if ScreenWidth is not available
      return 300; // Default width for small screens
    }, [width]);

    const childrenArray = React.useMemo(() => {
      if (!children) {
        return [];
      }

      if (!React.isValidElement(children) && !Array.isArray(children)) {
        return [];
      }

      const array = React.Children.toArray(children).filter(child => {
        const isValid = React.isValidElement(child);
        return isValid;
      });

      return array;
    }, [children]);

    const handleScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / effectiveWidth);
      if (index !== currentIndex) {
        setCurrentIndex(index);
        onItemChange?.(index);
      }
    };

    const scrollToNext = () => {
      if (currentIndex < childrenArray.length - 1) {
        const nextIndex = currentIndex + 1;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * effectiveWidth,
          animated: true,
        });
        setCurrentIndex(nextIndex);
        onItemChange?.(nextIndex);
      }
    };

    const scrollToPrevious = () => {
      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        scrollViewRef.current?.scrollTo({
          x: prevIndex * effectiveWidth,
          animated: true,
        });
        setCurrentIndex(prevIndex);
        onItemChange?.(prevIndex);
      }
    };

    const scrollToIndex = (index: number) => {
      if (index >= 0 && index < childrenArray.length) {
        scrollViewRef.current?.scrollTo({
          x: index * effectiveWidth,
          animated: true,
        });
        setCurrentIndex(index);
        onItemChange?.(index);
      }
    };

    const effectiveHeight = useMemo(() => {
      if (fitContent) {
        const h = measuredHeights[currentIndex];
        return typeof h === 'number' && h > 0 ? h : height;
      }
      return height;
    }, [fitContent, measuredHeights, currentIndex, height]);

    // Expose scroll methods to parent component via ref
    React.useImperativeHandle(ref, () => ({
      scrollToNext,
      scrollToPrevious,
      scrollToIndex,
      currentIndex,
    }));

    if (childrenArray.length === 0) {
      return null;
    }

    const handleLayout = (index: number, layoutHeight: number) => {
      setMeasuredHeights(prev => {
        const next = [...prev];
        next[index] = layoutHeight;
        return next;
      });
    };

    return (
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={{ width: effectiveWidth, height: effectiveHeight }}
          contentContainerStyle={{
            width: effectiveWidth * childrenArray.length,
          }}
        >
          {childrenArray.map((child, index) => {
            return (
              <View
                key={index}
                style={[
                  fitContent
                    ? styles.slideContainerAuto
                    : styles.slideContainer,
                  { width: effectiveWidth },
                  fitContent ? { height: undefined, flex: 0 } : { height },
                ]}
                onLayout={e =>
                  fitContent && handleLayout(index, e.nativeEvent.layout.height)
                }
              >
                {child}
              </View>
            );
          })}
        </ScrollView>

        {showPagination && childrenArray.length > 1 && (
          <>
            <Divider color={addOpacity(Colors.textDisabled, 40)} />
            <View style={styles.paginationContainer}>
              {childrenArray.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </View>
    );
  }
);

Slider.displayName = 'Slider';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  carousel: {
    width: '100%',
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
    height: '100%',
  },
  slideContainerAuto: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    width: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Space[2],
    marginBottom: Space[4],
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.textDisabled,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
});
