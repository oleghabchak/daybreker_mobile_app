import { Info } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  TooltipComponent,
  getTooltipMetrics,
} from '../../../components/common/TooltipComponent';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';
import { FeedbackOption } from '../../../enums/feedback_options.emun';

export interface FeedbackRowProps {
  title: string;
  options: FeedbackOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  showInfo?: boolean;
  onInfoPress?: () => void;
  tooltipContent?: string;
  tooltipTitle?: string;
}

export const FeedbackRow: React.FC<FeedbackRowProps> = ({
  title,
  options,
  selectedValue,
  onValueChange,
  showInfo = true,
  onInfoPress,
  tooltipContent,
  tooltipTitle,
}) => {
  const metrics = getTooltipMetrics(Typography.smallBold.fontSize);

  return (
    <View style={styles.container}>
      {/* Header with title and info icon */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showInfo &&
          (tooltipContent ? (
            <TooltipComponent
              content={
                <View>
                  <Text style={{ ...Typography.h2, color: Colors.text, marginBottom: Space[3], textAlign: 'center' }}>{tooltipTitle ?? title}</Text>
                  <Text
                    style={{
                      ...Typography.caption,
                      color: Colors.textDisabled,
                      lineHeight: 18,
                    }}
                  >
                    {tooltipContent}
                  </Text>
                </View>
              }
              titleFontSize={Typography.smallBold.fontSize}
              triggerSize={metrics.iconSize}
              triggerStyle={{
                marginLeft: metrics.spacing,
                width: metrics.iconSize,
                height: metrics.iconSize,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          ) : (
            <TouchableOpacity
              style={[styles.infoButton, { width: metrics.iconSize, height: metrics.iconSize }]}
              onPress={onInfoPress}
              disabled={!onInfoPress}
            >
              <Info size={metrics.iconSize} color={Colors.text} />
            </TouchableOpacity>
          ))}
      </View>

      {/* Options row */}
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedValue === option.value && styles.optionButtonSelected,
            ]}
            onPress={() => onValueChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option.value && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Space[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[2],
    gap: Space[2],
  },
  title: {
    ...Typography.smallBold,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space[1],
  },
  infoFallback: {
    ...Typography.smallBold,
    color: Colors.text,
    lineHeight: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[1],
  },
  optionButton: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[1],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.text,
    minWidth: 50,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.transparent,
    borderWidth: 2,
  },
  optionText: {
    ...Typography.bodyBold,
    color: Colors.textDisabled,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: Colors.text,
    fontWeight: '700',
  },
});
