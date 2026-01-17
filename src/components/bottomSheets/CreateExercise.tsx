import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import {
  Equipment,
  EquipmentTitles,
  ExerciseDifficultyLevel,
  PrimaryMuscleGroup,
} from '../../enums/databas.enums';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/CheckBox';
import { Divider } from '../ui/Divider';
import { Input } from '../ui/Input';

interface CreateExerciseProps {
  isVisible?: boolean;
  onClose?: () => void;
  onExerciseCreated?: (exercise: any) => void;
}

export const CreateExercise: React.FC<CreateExerciseProps> = ({
  isVisible = false,
  onClose = () => {},
  onExerciseCreated = () => {},
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_groups: [] as PrimaryMuscleGroup[],
    equipment: [] as Equipment[],
    difficulty: ExerciseDifficultyLevel.BEGINNER,
    instructions: '',
    video_url: '',
    image_url: '',
    category: 'strength',
  });

  const muscleGroups = Object.values(PrimaryMuscleGroup);
  const equipmentOptions = Object.values(Equipment);
  const difficultyLevels = Object.values(ExerciseDifficultyLevel);

  const categories = [
    { label: 'Strength', value: 'strength' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Flexibility', value: 'flexibility' },
    { label: 'Balance', value: 'balance' },
    { label: 'Sports', value: 'sports' },
  ];

  const snapPoints = useMemo(() => ['90%'], []);

  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  const handlePresentModalPress = useCallback(() => {
    try {
      bottomSheetModalRef.current?.present();
    } catch (error) {
      onClose();
    }
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    try {
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      // Error dismissing
    } finally {
      onClose();
    }
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMuscleGroup = (muscleGroup: PrimaryMuscleGroup) => {
    setFormData(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups.includes(muscleGroup)
        ? prev.muscle_groups.filter(mg => mg !== muscleGroup)
        : [...prev.muscle_groups, muscleGroup],
    }));
  };

  const toggleEquipment = (equipment: Equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Exercise name is required');
    }

    if (formData.muscle_groups.length === 0) {
      errors.push('At least one muscle group must be selected');
    }

    if (formData.equipment.length === 0) {
      errors.push('At least one equipment type must be selected');
    }

    if (!formData.instructions.trim()) {
      errors.push('Exercise instructions are required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleCreateExercise = async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }
  };

  React.useEffect(() => {
    if (isVisible && isMounted) {
      setTimeout(() => {
        handlePresentModalPress();
      }, 100);
    } else if (!isVisible && isMounted) {
      handleDismiss();
    }
  }, [isVisible, isMounted, handlePresentModalPress, handleDismiss]);

  return (
    <View style={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Custom Exercise</Text>
        <Text style={styles.subtitle}>
          Add your own exercise to your library
        </Text>
      </View>

      <Divider color={Colors.border} />

      <View style={styles.section}>
        <Input
          label='Exercise Name *'
          placeholder='e.g., Hammer Chest Press'
          value={formData.name}
          onChangeText={text => updateFormData('name', text)}
          style={styles.input}
        />

        <Input
          label='Description'
          placeholder='Brief description of the exercise'
          value={formData.description}
          onChangeText={text => updateFormData('description', text)}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
      </View>

      <Divider color={Colors.border} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Muscle Groups *</Text>
        <Text style={styles.sectionSubtitle}>
          Select all muscle groups this exercise targets
        </Text>

        <View style={styles.optionsGrid}>
          {muscleGroups.map(muscleGroup => (
            <Checkbox
              key={muscleGroup}
              label={muscleGroup.replace('_', ' ').toUpperCase()}
              checked={formData.muscle_groups.includes(muscleGroup)}
              onCheckChange={() => toggleMuscleGroup(muscleGroup)}
              style={styles.checkbox}
            />
          ))}
        </View>
      </View>

      <Divider color={Colors.border} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Equipment *</Text>
        <Text style={styles.sectionSubtitle}>
          Select all equipment needed for this exercise
        </Text>

        <View style={styles.optionsGrid}>
          {equipmentOptions.map(equipment => (
            <Checkbox
              key={equipment}
              label={EquipmentTitles[equipment]}
              checked={formData.equipment.includes(equipment)}
              onCheckChange={() => toggleEquipment(equipment)}
              style={styles.checkbox}
            />
          ))}
        </View>
      </View>

      <Divider color={Colors.border} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions *</Text>
        <Text style={styles.sectionSubtitle}>
          Provide step-by-step instructions for performing the exercise
        </Text>

        <Input
          label='Exercise Instructions'
          placeholder='1. Start position...\n2. Movement...\n3. Return to start...'
          value={formData.instructions}
          onChangeText={text => updateFormData('instructions', text)}
          multiline
          numberOfLines={6}
          style={styles.input}
        />
      </View>

      <Divider color={Colors.border} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media (Optional)</Text>
        <Text style={styles.sectionSubtitle}>
          Add video or image URLs for reference
        </Text>

        <Input
          label='Video URL'
          placeholder='https://example.com/exercise-video.mp4'
          value={formData.video_url}
          onChangeText={text => updateFormData('video_url', text)}
          style={styles.input}
        />

        <Input
          label='Image URL'
          placeholder='https://example.com/exercise-image.jpg'
          value={formData.image_url}
          onChangeText={text => updateFormData('image_url', text)}
          style={styles.input}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant='ghost'
          onPress={handleDismiss}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          variant='primary'
          onPress={handleCreateExercise}
          style={styles.createButton}
          disabled={isCreating}
          loading={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Exercise'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.background,
  },
  indicator: {
    backgroundColor: Colors.border,
  },
  contentContainer: {
    flex: 1,
    padding: Space[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: Space[4],
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: Space[4],
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  sectionSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    marginBottom: Space[3],
    lineHeight: 18,
  },
  input: {},
  label: {
    ...Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Space[2],
  },
  pickerContainer: {
    marginBottom: Space[3],
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  picker: {
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
  },
  checkbox: {
    minWidth: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Space[3],
    marginTop: Space[4],
    marginBottom: Space[4],
  },
  cancelButton: {
    width: '48%',
  },
  createButton: {
    width: '48%',
  },
});
