import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';

interface Step {
  number: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepSelect: (step: any) => void;
  progress: number; // 0-100 percentage
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepSelect,
  progress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
            },
          ]}
        />
      </View>
      <View style={styles.stepLabelsContainer}>
        {steps.map(step => (
          <TouchableOpacity
            key={step.number}
            style={styles.stepLabel}
            onPress={() => onStepSelect(step.number)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.stepNumber,
                (step.isActive || step.isCompleted) && styles.stepNumberActive,
              ]}
            >
              {step.number}
            </Text>
            <Text
              style={[
                styles.stepDescription,
                (step.isActive || step.isCompleted) &&
                  styles.stepDescriptionActive,
              ]}
            >
              {step.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Space[0],
    gap: Space[2],
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  stepLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Space[2],
    paddingHorizontal: Space[1],
    borderRadius: BorderRadius.sm,
  },
  stepNumber: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Space[1],
  },
  stepNumberActive: {
    color: Colors.primary,
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontSize: 10,
    textAlign: 'center',
  },
  stepDescriptionActive: {
    color: Colors.text,
    fontWeight: '500',
  },
});
