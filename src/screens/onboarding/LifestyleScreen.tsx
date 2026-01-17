import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

interface Props {
  navigation: any;
}

interface LifestyleData {
  exercise_frequency: string;
  exercise_types: string[];
  diet_type: string;
  alcohol_consumption: string;
  smoking_status: string;
  water_intake: string;
  activity_level: string;
}

const EXERCISE_FREQUENCIES = [
  { value: 'none', label: 'Never', description: 'No regular exercise' },
  {
    value: '1-2_times_week',
    label: '1-2 times per week',
    description: 'Light activity',
  },
  {
    value: '3-4_times_week',
    label: '3-4 times per week',
    description: 'Moderate activity',
  },
  {
    value: '5-6_times_week',
    label: '5-6 times per week',
    description: 'High activity',
  },
  { value: 'daily', label: 'Daily', description: 'Very high activity' },
];

const EXERCISE_TYPES = [
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'strength', label: 'Strength Training', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'walking', label: 'Walking', icon: '🚶' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'dancing', label: 'Dancing', icon: '💃' },
];

const DIET_TYPES = [
  {
    value: 'standard',
    label: 'Standard Diet',
    description: 'No specific restrictions',
  },
  {
    value: 'mediterranean',
    label: 'Mediterranean',
    description: 'Focus on fruits, vegetables, fish',
  },
  { value: 'vegetarian', label: 'Vegetarian', description: 'No meat' },
  { value: 'vegan', label: 'Vegan', description: 'No animal products' },
  { value: 'keto', label: 'Ketogenic', description: 'Low carb, high fat' },
  { value: 'paleo', label: 'Paleo', description: 'Whole foods, no processed' },
  {
    value: 'low_carb',
    label: 'Low Carb',
    description: 'Reduced carbohydrates',
  },
  {
    value: 'intermittent_fasting',
    label: 'Intermittent Fasting',
    description: 'Time-restricted eating',
  },
];

const ALCOHOL_LEVELS = [
  { value: 'none', label: 'Never', description: 'No alcohol consumption' },
  {
    value: 'occasional',
    label: 'Occasionally',
    description: '1-2 drinks per month',
  },
  { value: 'light', label: 'Light', description: '1-3 drinks per week' },
  { value: 'moderate', label: 'Moderate', description: '4-7 drinks per week' },
  { value: 'heavy', label: 'Heavy', description: '8+ drinks per week' },
];

const SMOKING_STATUS = [
  { value: 'never', label: 'Never Smoked', icon: '🚭' },
  { value: 'former', label: 'Former Smoker', icon: '🔥' },
  { value: 'current', label: 'Current Smoker', icon: '🚬' },
  { value: 'vaping', label: 'Vaping/E-cigarettes', icon: '💨' },
];

const WATER_INTAKE = [
  {
    value: 'low',
    label: 'Less than 4 glasses',
    description: 'Under 32 oz per day',
  },
  { value: 'moderate', label: '4-6 glasses', description: '32-48 oz per day' },
  { value: 'good', label: '7-8 glasses', description: '56-64 oz per day' },
  {
    value: 'high',
    label: 'More than 8 glasses',
    description: 'Over 64 oz per day',
  },
];

export const LifestyleScreen = ({ navigation }: Props) => {
  const [lifestyleData, setLifestyleData] = useState<LifestyleData>({
    exercise_frequency: '',
    exercise_types: [],
    diet_type: '',
    alcohol_consumption: '',
    smoking_status: '',
    water_intake: '',
    activity_level: '',
  });
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());

  useEffect(() => {
    loadExistingData();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const loadExistingData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('data_collected')
          .eq('user_id', user.id)
          .eq('screen_name', 'Lifestyle')
          .single();

        if (progress?.data_collected?.lifestyle) {
          setLifestyleData(progress.data_collected.lifestyle);
        }
      }
    } catch (error) {
      console.warn('Error loading existing data:', error);
    }
  };

  const trackScreenTime = async () => {
    const timeSpent = Math.round((Date.now() - screenStartTime) / 1000);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('screen_analytics').insert({
          user_id: user.id,
          screen_name: 'Lifestyle',
          time_spent_seconds: timeSpent,
          interactions: Object.values(lifestyleData).filter(
            v => v && v.length > 0
          ).length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'Lifestyle',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            lifestyle: lifestyleData,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const updateLifestyleData = (key: keyof LifestyleData, value: any) => {
    setLifestyleData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleExerciseType = (type: string) => {
    setLifestyleData(prev => ({
      ...prev,
      exercise_types: prev.exercise_types.includes(type)
        ? prev.exercise_types.filter(t => t !== type)
        : [...prev.exercise_types, type],
    }));
  };

  const validateForm = () => {
    const required = [
      'exercise_frequency',
      'diet_type',
      'alcohol_consumption',
      'smoking_status',
      'water_intake',
    ];
    for (const field of required) {
      if (!lifestyleData[field as keyof LifestyleData]) {
        return false;
      }
    }
    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Incomplete',
        'Please answer all lifestyle questions to continue.'
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save lifestyle data as user metrics
        const metrics = [
          {
            metric_type: 'exercise_frequency',
            value_text: lifestyleData.exercise_frequency,
          },
          { metric_type: 'diet_type', value_text: lifestyleData.diet_type },
          {
            metric_type: 'alcohol_consumption',
            value_text: lifestyleData.alcohol_consumption,
          },
          {
            metric_type: 'smoking_status',
            value_text: lifestyleData.smoking_status,
          },
          {
            metric_type: 'water_intake',
            value_text: lifestyleData.water_intake,
          },
          {
            metric_type: 'exercise_types',
            value_text: lifestyleData.exercise_types.join(','),
          },
        ];

        for (const metric of metrics) {
          await supabase.from('user_metrics').insert({
            user_id: user.id,
            metric_type: metric.metric_type,
            value_text: metric.value_text,
            source: 'onboarding',
            version: 1,
          });
        }

        navigation.navigate('SleepHabits');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to save lifestyle information. Please try again.'
      );
      console.error('Error saving lifestyle:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedFields = Object.values(lifestyleData).filter(
    v => v && v.length > 0
  ).length;
  const totalFields = 6; // Required fields

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lifestyle Habits</Text>
          <Text style={styles.headerSubtitle}>
            Tell us about your daily habits to personalize your health
            recommendations.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '38%' }]} />
          </View>
          <Text style={styles.progressText}>5 of 14</Text>
        </View>

        <View style={styles.form}>
          {/* Exercise Frequency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How often do you exercise?</Text>
            {EXERCISE_FREQUENCIES.map(freq => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.optionCard,
                  lifestyleData.exercise_frequency === freq.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  updateLifestyleData('exercise_frequency', freq.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    lifestyleData.exercise_frequency === freq.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {freq.label}
                </Text>
                <Text style={styles.optionDescription}>{freq.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Types */}
          {lifestyleData.exercise_frequency &&
            lifestyleData.exercise_frequency !== 'none' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  What types of exercise do you do?
                </Text>
                <View style={styles.exerciseGrid}>
                  {EXERCISE_TYPES.map(type => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.exerciseCard,
                        lifestyleData.exercise_types.includes(type.value) &&
                          styles.exerciseCardSelected,
                      ]}
                      onPress={() => toggleExerciseType(type.value)}
                    >
                      <Text style={styles.exerciseIcon}>{type.icon}</Text>
                      <Text
                        style={[
                          styles.exerciseLabel,
                          lifestyleData.exercise_types.includes(type.value) &&
                            styles.exerciseLabelSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

          {/* Diet Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What describes your diet?</Text>
            {DIET_TYPES.map(diet => (
              <TouchableOpacity
                key={diet.value}
                style={[
                  styles.optionCard,
                  lifestyleData.diet_type === diet.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() => updateLifestyleData('diet_type', diet.value)}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    lifestyleData.diet_type === diet.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {diet.label}
                </Text>
                <Text style={styles.optionDescription}>{diet.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Alcohol Consumption */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How often do you drink alcohol?
            </Text>
            {ALCOHOL_LEVELS.map(level => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionCard,
                  lifestyleData.alcohol_consumption === level.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  updateLifestyleData('alcohol_consumption', level.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    lifestyleData.alcohol_consumption === level.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {level.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Smoking Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's your smoking status?</Text>
            <View style={styles.smokingGrid}>
              {SMOKING_STATUS.map(status => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.smokingCard,
                    lifestyleData.smoking_status === status.value &&
                      styles.smokingCardSelected,
                  ]}
                  onPress={() =>
                    updateLifestyleData('smoking_status', status.value)
                  }
                >
                  <Text style={styles.smokingIcon}>{status.icon}</Text>
                  <Text
                    style={[
                      styles.smokingLabel,
                      lifestyleData.smoking_status === status.value &&
                        styles.smokingLabelSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Water Intake */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How much water do you drink daily?
            </Text>
            {WATER_INTAKE.map(intake => (
              <TouchableOpacity
                key={intake.value}
                style={[
                  styles.optionCard,
                  lifestyleData.water_intake === intake.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  updateLifestyleData('water_intake', intake.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    lifestyleData.water_intake === intake.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {intake.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {intake.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {completedFields} of {totalFields} sections completed
          </Text>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (loading || !validateForm()) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading || !validateForm()}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollViewWithIndicator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: Space[6],
    paddingTop: Space[6],
    paddingBottom: Space[8],
  },
  backButton: {
    marginBottom: Space[6],
  },
  backText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginBottom: Space[6],
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Space[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: Space[6],
    flex: 1,
  },
  section: {
    marginBottom: Space[8],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },
  optionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    backgroundColor: '#F8F9FA',
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  optionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exerciseCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  exerciseCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  exerciseIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  exerciseLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  exerciseLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  smokingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smokingCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  smokingCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  smokingIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  smokingLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  smokingLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    paddingTop: Space[4],
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[4],
    alignItems: 'center',
    marginTop: Space[4],
  },
  continueButtonText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
