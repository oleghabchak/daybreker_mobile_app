import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { Colors, Space, Typography } from '../../constants/theme';
import { TooltipComponent, getTooltipMetrics } from './TooltipComponent';

export interface TitleWithTooltipProps {
  title: string;
  tooltipContent: React.ReactNode | string;
  titleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const TitleWithTooltip: React.FC<TitleWithTooltipProps> = ({
  title,
  tooltipContent,
  titleStyle,
  containerStyle,
}) => {
  // Extract font size for icon scaling
  const fontSize = (Array.isArray(titleStyle)
    ? titleStyle.find(s => !!(s as any)?.fontSize)?.fontSize
    : (titleStyle as any)?.fontSize) as number | undefined;

  const metrics = getTooltipMetrics(fontSize);

  return (
    <View style={[styles.row, containerStyle]}>
      <View style={{ flexShrink: 1, flexGrow: 0 }}>
        <Text style={titleStyle}>{title}</Text>
      </View>
      <View
        style={[
          styles.tooltipWrapper,
          {
            marginLeft: metrics.spacing,
            marginTop:
              typeof fontSize === 'number' && fontSize > 0
                ? Math.max(0, fontSize * 0.1)
                : 0,
          },
        ]}
      >
        <TooltipComponent
          content={
            <View>
              <Text style={{ ...Typography.h2, color: Colors.text, marginBottom: Space[3], textAlign: 'center' }}>{title}</Text>
              {tooltipContent}
            </View>
          }
          titleFontSize={fontSize}
          triggerSize={metrics.iconSize}
          triggerStyle={[
            styles.tooltipTrigger,
            {
              width: metrics.iconSize,
              height: metrics.iconSize,
              minWidth: metrics.iconSize,
              minHeight: metrics.iconSize,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 0,
    gap: Space[1],
  },
  tooltipWrapper: {
    justifyContent: 'center',
  },
  tooltipTrigger: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TitleWithTooltip;


