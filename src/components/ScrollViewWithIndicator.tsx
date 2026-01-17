import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Platform,
} from 'react-native';

interface ScrollViewWithIndicatorProps extends ScrollViewProps {
  children: React.ReactNode;
}

export const ScrollViewWithIndicator: React.FC<
  ScrollViewWithIndicatorProps
> = ({
  children,
  showsVerticalScrollIndicator = true,
  indicatorStyle = 'black',
  ...props
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      indicatorStyle={indicatorStyle}
      scrollIndicatorInsets={{ right: 0 }}
      persistentScrollbar={Platform.OS === 'android'}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
