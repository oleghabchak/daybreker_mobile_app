import React from 'react';
import {
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from 'react-native';

interface HorizontalScrollProps extends Omit<ScrollViewProps, 'horizontal'> {
  children: React.ReactNode;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  showsHorizontalScrollIndicator = true,
  indicatorStyle = 'black',
  contentContainerStyle,
  ...props
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      indicatorStyle={indicatorStyle}
      scrollIndicatorInsets={{ bottom: 0 }}
      persistentScrollbar={Platform.OS === 'android'}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
});
