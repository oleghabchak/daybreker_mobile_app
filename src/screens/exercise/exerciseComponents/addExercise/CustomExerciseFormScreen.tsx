import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar,
} from 'react-native-keyboard-controller';

import { Button } from '../../../../components/ui/Button';
import { Checkbox } from '../../../../components/ui/CheckBox';
import { Divider } from '../../../../components/ui/Divider';
import { Input } from '../../../../components/ui/Input';
import { NumberInput } from '../../../../components/ui/NumberInput';
import { SectionCard } from '../../../../components/ui/SectionCard';
import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../constants/theme';
import { useAuthStore } from '../../../../models/AuthenticationStore';
import { ICustomExercise } from '../../../../training-module/exercise/data/interfaces/custom-exercise';
import { CustomExerciseRepository } from '../../../../training-module/exercise/repositories/custom-exercise-repository';

interface CustomExerciseFormScreenProps {
  navigation?: any;
  route?: any;
  onBack?: () => void;
}

export const CustomExerciseFormScreen: React.FC<
  CustomExerciseFormScreenProps
> = ({ navigation, route, onBack }) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [newMistakeItem, setNewMistakeItem] = useState('');
  const [newCueItem, setNewCueItem] = useState('');
  const [newTagItem, setNewTagItem] = useState('');
  const [formData, setFormData] = useState<ICustomExercise>({
    name: '',
    created_by_user_id: user?.id || '',
    is_compound: false,
    is_unilateral: false,
    execution_instructions: '',
    is_machine: false,
    requires_spotter: false,
    // Set defaults for removed fields
    breathing_pattern: '',
    common_mistakes: [],
    coaching_cues: [],
    video_url: '',
    stability_requirement: 1,
    default_weight_increment_kg: 2.5,
    preferred_rep_range_min: 8,
    preferred_rep_range_max: 12,
    default_rest_minutes: 2,
    rir_floor: 0,
    set_cap: 5,
    minimum_weight_kg: 0,
    maximum_weight_kg: 200,
    tags: [],
  });

  const updateFormData = useCallback(
    (field: keyof ICustomExercise, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const addToArrayField = useCallback(
    (field: 'common_mistakes' | 'coaching_cues' | 'tags', value: string) => {
      if (value.trim() && !formData[field].includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...prev[field], value.trim()],
        }));
      }
    },
    [formData]
  );

  const removeFromArrayField = useCallback(
    (field: 'common_mistakes' | 'coaching_cues' | 'tags', value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter(item => item !== value),
      }));
    },
    []
  );

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Exercise name is required');
    }

    if (!formData.execution_instructions.trim()) {
      errors.push('Execution instructions are required');
    }

    if (formData.preferred_rep_range_min >= formData.preferred_rep_range_max) {
      errors.push('Minimum reps must be less than maximum reps');
    }

    if (formData.minimum_weight_kg >= formData.maximum_weight_kg) {
      errors.push('Minimum weight must be less than maximum weight');
    }

    if (
      formData.stability_requirement < 1 ||
      formData.stability_requirement > 5
    ) {
      errors.push('Stability requirement must be between 1 and 5');
    }

    if (formData.default_weight_increment_kg <= 0) {
      errors.push('Weight increment must be greater than 0');
    }

    if (formData.default_rest_minutes < 0) {
      errors.push('Rest time cannot be negative');
    }

    if (formData.rir_floor < 0 || formData.rir_floor > 5) {
      errors.push('RIR floor must be between 0 and 5');
    }

    if (formData.set_cap < 1) {
      errors.push('Set cap must be at least 1');
    }

    if (formData.minimum_weight_kg < 0) {
      errors.push('Minimum weight cannot be negative');
    }

    if (formData.maximum_weight_kg <= 0) {
      errors.push('Maximum weight must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleSubmit = async () => {
    const validation = validateForm();

    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setIsLoading(true);

      const exerciseData = {
        ...formData,
        created_by_user_id: user.id,
      };

      const result = await CustomExerciseRepository.create(exerciseData);
      if (result.status === 'ok') {
        Alert.alert('Success', 'Custom exercise created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onBack) {
                onBack();
              } else {
                navigation?.goBack();
              }
            },
          },
        ]);
      } else {
        throw new Error(
          result.error.message || 'Failed to create custom exercise'
        );
      }
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      Alert.alert(
        'Error',
        'Failed to create custom exercise. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderArrayField = (
    title: string,
    field: 'common_mistakes' | 'coaching_cues' | 'tags',
    placeholder: string
  ) => {
    let newItem, setNewItem;

    switch (field) {
      case 'common_mistakes':
        newItem = newMistakeItem;
        setNewItem = setNewMistakeItem;
        break;
      case 'coaching_cues':
        newItem = newCueItem;
        setNewItem = setNewCueItem;
        break;
      case 'tags':
        newItem = newTagItem;
        setNewItem = setNewTagItem;
        break;
      default:
        return null;
    }

    return (
      <SectionCard
        title={title}
        description='Add items by typing and pressing Enter'
      >
        <Input
          label={`Add ${title.toLowerCase()}`}
          placeholder={placeholder}
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={() => {
            addToArrayField(field, newItem);
            setNewItem('');
          }}
          style={styles.input}
        />

        {formData[field].length > 0 && (
          <View style={styles.arrayItems}>
            {formData[field].map((item, index) => (
              <View key={index} style={styles.arrayItem}>
                <Text style={styles.arrayItemText}>{item}</Text>
                <Button
                  variant='ghost'
                  onPress={() => removeFromArrayField(field, item)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </Button>
              </View>
            ))}
          </View>
        )}
      </SectionCard>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Basic Information */}
        <SectionCard title='Basic Information'>
          <Input
            label='Exercise Name *'
            placeholder='e.g., Custom Squat Variation'
            value={formData.name}
            onChangeText={text => updateFormData('name', text)}
            style={styles.input}
          />

          <Input
            label='Execution Instructions *'
            placeholder='Step-by-step instructions for performing the exercise'
            value={formData.execution_instructions}
            onChangeText={text =>
              updateFormData('execution_instructions', text)
            }
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <Input
            label='Breathing Pattern'
            placeholder='e.g., Inhale on eccentric, exhale on concentric'
            value={formData.breathing_pattern}
            onChangeText={text => updateFormData('breathing_pattern', text)}
            style={styles.input}
          />

          <Input
            label='Video URL'
            placeholder='https://example.com/exercise-video.mp4'
            value={formData.video_url || ''}
            onChangeText={text => updateFormData('video_url', text)}
            style={styles.input}
          />
        </SectionCard>

        <Divider color={Colors.border} />

        {/* Exercise Properties */}
        <SectionCard title='Exercise Properties'>
          <View style={styles.checkboxRow}>
            <Checkbox
              label='Compound Exercise'
              checked={formData.is_compound}
              onCheckChange={checked => updateFormData('is_compound', checked)}
              size={20}
              style={styles.checkbox}
            />
            <Checkbox
              label='Unilateral Exercise'
              checked={formData.is_unilateral}
              onCheckChange={checked =>
                updateFormData('is_unilateral', checked)
              }
              size={20}
              style={styles.checkbox}
            />

            <Checkbox
              label='Machine Exercise'
              checked={formData.is_machine}
              onCheckChange={checked => updateFormData('is_machine', checked)}
              style={styles.checkbox}
              size={20}
            />
            <Checkbox
              label='Requires Spotter'
              checked={formData.requires_spotter}
              onCheckChange={checked =>
                updateFormData('requires_spotter', checked)
              }
              size={20}
              style={styles.checkbox}
            />
          </View>
        </SectionCard>

        <Divider color={Colors.border} />

        {/* Training Parameters */}
        <SectionCard title='Training Parameters'>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Stability Requirement (1-5)'
                value={formData.stability_requirement}
                onChangeText={text =>
                  updateFormData('stability_requirement', parseInt(text) || 1)
                }
                maxValue={5}
                allowDecimals={false}
                style={styles.input}
              />
            </View>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Default Weight Increment (kg)'
                value={formData.default_weight_increment_kg}
                onChangeText={text =>
                  updateFormData(
                    'default_weight_increment_kg',
                    parseFloat(text) || 2.5
                  )
                }
                maxValue={50}
                allowDecimals={true}
                decimalPlaces={1}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Preferred Rep Range Min'
                value={formData.preferred_rep_range_min}
                onChangeText={text =>
                  updateFormData('preferred_rep_range_min', parseInt(text) || 8)
                }
                maxValue={50}
                allowDecimals={false}
                style={styles.input}
              />
            </View>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Preferred Rep Range Max'
                value={formData.preferred_rep_range_max}
                onChangeText={text =>
                  updateFormData(
                    'preferred_rep_range_max',
                    parseInt(text) || 12
                  )
                }
                maxValue={50}
                allowDecimals={false}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Default Rest (minutes)'
                value={formData.default_rest_minutes}
                onChangeText={text =>
                  updateFormData('default_rest_minutes', parseFloat(text) || 2)
                }
                maxValue={10}
                allowDecimals={true}
                decimalPlaces={1}
                style={styles.input}
              />
            </View>
            <View style={styles.halfWidth}>
              <NumberInput
                label='RIR Floor'
                value={formData.rir_floor}
                onChangeText={text =>
                  updateFormData('rir_floor', parseInt(text) || 0)
                }
                maxValue={5}
                allowDecimals={false}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Set Cap'
                value={formData.set_cap}
                onChangeText={text =>
                  updateFormData('set_cap', parseInt(text) || 5)
                }
                maxValue={20}
                allowDecimals={false}
                style={styles.input}
              />
            </View>
            <View style={styles.halfWidth}>
              <NumberInput
                label='Minimum Weight (kg)'
                value={formData.minimum_weight_kg}
                onChangeText={text =>
                  updateFormData('minimum_weight_kg', parseFloat(text) || 0)
                }
                maxValue={1000}
                allowDecimals={true}
                decimalPlaces={1}
                style={styles.input}
              />
            </View>
          </View>

          <NumberInput
            label='Maximum Weight (kg)'
            value={formData.maximum_weight_kg}
            onChangeText={text =>
              updateFormData('maximum_weight_kg', parseFloat(text) || 200)
            }
            maxValue={1000}
            allowDecimals={true}
            decimalPlaces={1}
            style={styles.input}
          />
        </SectionCard>

        <Divider color={Colors.border} />
        {renderArrayField(
          'Common Mistakes',
          'common_mistakes',
          'e.g., Arching back'
        )}
        <Divider color={Colors.border} />
        {renderArrayField(
          'Coaching Cues',
          'coaching_cues',
          'e.g., Keep core tight'
        )}
        <Divider color={Colors.border} />
        {renderArrayField('Tags', 'tags', 'e.g., strength, legs')}

        <View style={styles.buttonContainer}>
          <Button
            variant='secondary'
            onPress={onBack || (() => navigation?.goBack())}
            style={styles.cancelButton}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </Button>
          <Button
            variant='primary'
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={isLoading}
            loading={isLoading}
          >
            {!isLoading && <Text style={styles.actionButtonText}>Create </Text>}
          </Button>
        </View>
      </KeyboardAwareScrollView>

      <KeyboardToolbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: Space[2],
    paddingBottom: Space[4],
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
  input: {
    // marginBottom: Space[3],
  },
  checkboxRow: {
    // flexDirection: 'row',
    gap: Space[2],
    justifyContent: 'space-between',
    // marginBottom: Space[1],
  },
  checkbox: {
    flex: 1,
    // marginHorizontal: Space[1],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space[2],
  },
  halfWidth: {
    width: '48%',
  },
  arrayItems: {
    marginTop: Space[2],
  },
  arrayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Space[2],
    borderRadius: BorderRadius.sm,
    marginBottom: Space[1],
  },
  arrayItemText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    padding: 0,
  },
  removeButtonText: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: 'bold',
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
  submitButton: {
    width: '48%',
  },
  actionButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    textAlign: 'center',
  },
});
