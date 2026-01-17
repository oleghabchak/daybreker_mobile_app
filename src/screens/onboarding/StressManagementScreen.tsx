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

interface StressData {
  stress_level: string;
  stress_sources: string[];
  stress_symptoms: string[];
  coping_strategies: string[];
  stress_triggers: string[];
  relaxation_techniques: string[];
  support_system: string;
}

const STRESS_LEVELS = [
  {
    value: 'very_low',
    label: 'Very Low',
    description: 'Rarely feel stressed',
    color: Colors.success,
  },
  {
    value: 'low',
    label: 'Low',
    description: 'Occasional mild stress',
    color: '#8FBC8F',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Regular manageable stress',
    color: '#FFD700',
  },
  {
    value: 'high',
    label: 'High',
    description: 'Frequent significant stress',
    color: '#FF8C00',
  },
  {
    value: 'very_high',
    label: 'Very High',
    description: 'Constant overwhelming stress',
    color: Colors.error,
  },
];

const STRESS_SOURCES = [
  { value: 'work', label: 'Work/Career', icon: '💼' },
  { value: 'finances', label: 'Finances', icon: '💰' },
  { value: 'relationships', label: 'Relationships', icon: '👥' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'health', label: 'Health Concerns', icon: '🏥' },
  { value: 'school', label: 'School/Education', icon: '📚' },
  { value: 'traffic', label: 'Commute/Traffic', icon: '🚗' },
  { value: 'news', label: 'News/World Events', icon: '📺' },
  { value: 'social_media', label: 'Social Media', icon: '📱' },
  { value: 'time_pressure', label: 'Time Pressure', icon: '⏰' },
];

const STRESS_SYMPTOMS = [
  { value: 'tension_headaches', label: 'Tension Headaches', icon: '🤕' },
  { value: 'muscle_tension', label: 'Muscle Tension', icon: '💪' },
  { value: 'fatigue', label: 'Fatigue', icon: '😴' },
  { value: 'irritability', label: 'Irritability', icon: '😠' },
  { value: 'anxiety', label: 'Anxiety', icon: '😰' },
  { value: 'difficulty_sleeping', label: 'Sleep Problems', icon: '🌙' },
  { value: 'digestive_issues', label: 'Digestive Issues', icon: '🤢' },
  {
    value: 'difficulty_concentrating',
    label: 'Poor Concentration',
    icon: '🧠',
  },
];

const COPING_STRATEGIES = [
  { value: 'exercise', label: 'Exercise', icon: '🏃‍♀️' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'deep_breathing', label: 'Deep Breathing', icon: '🫁' },
  { value: 'talking_to_friends', label: 'Talk to Friends/Family', icon: '💬' },
  { value: 'listening_to_music', label: 'Music', icon: '🎵' },
  { value: 'reading', label: 'Reading', icon: '📖' },
  { value: 'nature_walks', label: 'Nature/Walking', icon: '🌳' },
  { value: 'hobbies', label: 'Hobbies', icon: '🎨' },
  { value: 'journaling', label: 'Journaling', icon: '📝' },
  { value: 'professional_help', label: 'Professional Help', icon: '👨‍⚕️' },
];

const RELAXATION_TECHNIQUES = [
  {
    value: 'progressive_muscle_relaxation',
    label: 'Progressive Muscle Relaxation',
    description: 'Tense and release muscle groups',
  },
  {
    value: 'mindfulness',
    label: 'Mindfulness',
    description: 'Present moment awareness',
  },
  {
    value: 'visualization',
    label: 'Guided Imagery',
    description: 'Mental visualization exercises',
  },
  {
    value: 'yoga',
    label: 'Yoga',
    description: 'Physical postures and breathing',
  },
  {
    value: 'tai_chi',
    label: 'Tai Chi',
    description: 'Gentle movement meditation',
  },
  {
    value: 'aromatherapy',
    label: 'Aromatherapy',
    description: 'Essential oils and scents',
  },
  {
    value: 'massage',
    label: 'Massage',
    description: 'Physical tension release',
  },
  {
    value: 'hot_bath',
    label: 'Warm Bath/Shower',
    description: 'Heat therapy relaxation',
  },
];

const SUPPORT_SYSTEMS = [
  {
    value: 'excellent',
    label: 'Excellent',
    description: 'Strong support from family and friends',
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Generally have people to talk to',
  },
  {
    value: 'fair',
    label: 'Fair',
    description: 'Some support but could be better',
  },
  { value: 'poor', label: 'Poor', description: 'Limited support system' },
  {
    value: 'none',
    label: 'None',
    description: 'Feel isolated with no support',
  },
];

export const StressManagementScreen = ({ navigation }: Props) => {
  const [stressData, setStressData] = useState<StressData>({
    stress_level: '',
    stress_sources: [],
    stress_symptoms: [],
    coping_strategies: [],
    stress_triggers: [],
    relaxation_techniques: [],
    support_system: '',
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
          .eq('screen_name', 'StressManagement')
          .single();

        if (progress?.data_collected?.stress) {
          setStressData(progress.data_collected.stress);
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
          screen_name: 'StressManagement',
          time_spent_seconds: timeSpent,
          interactions: [
            stressData.stress_level,
            ...stressData.stress_sources,
            ...stressData.stress_symptoms,
            ...stressData.coping_strategies,
            ...stressData.relaxation_techniques,
            stressData.support_system,
          ].filter(Boolean).length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'StressManagement',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            stress: stressData,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const updateStressData = (key: keyof StressData, value: any) => {
    setStressData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayItem = (key: keyof StressData, item: string) => {
    setStressData(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(item)
        ? (prev[key] as string[]).filter(i => i !== item)
        : [...(prev[key] as string[]), item],
    }));
  };

  const validateForm = () => {
    return stressData.stress_level && stressData.support_system;
  };

  const getStressLevelColor = (level: string) => {
    const stressLevel = STRESS_LEVELS.find(l => l.value === level);
    return stressLevel?.color || Colors.textDisabled;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Incomplete',
        'Please answer the required stress management questions to continue.'
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save stress data as user metrics
        const metrics = [
          { metric_type: 'stress_level', value_text: stressData.stress_level },
          {
            metric_type: 'stress_sources',
            value_text: stressData.stress_sources.join(','),
          },
          {
            metric_type: 'stress_symptoms',
            value_text: stressData.stress_symptoms.join(','),
          },
          {
            metric_type: 'coping_strategies',
            value_text: stressData.coping_strategies.join(','),
          },
          {
            metric_type: 'relaxation_techniques',
            value_text: stressData.relaxation_techniques.join(','),
          },
          {
            metric_type: 'support_system',
            value_text: stressData.support_system,
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

        navigation.navigate('DigitalTwin');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to save stress management information. Please try again.'
      );
      console.error('Error saving stress management:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Stress & Mental Wellness</Text>
          <Text style={styles.headerSubtitle}>
            Understanding your stress patterns helps us provide better mental
            wellness support.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '54%' }]} />
          </View>
          <Text style={styles.progressText}>7 of 14</Text>
        </View>

        <View style={styles.form}>
          {/* Stress Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What's your current stress level?
            </Text>
            {STRESS_LEVELS.map(level => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.optionCard,
                  stressData.stress_level === level.value &&
                    styles.optionCardSelected,
                  stressData.stress_level === level.value && {
                    borderColor: level.color,
                  },
                ]}
                onPress={() => updateStressData('stress_level', level.value)}
              >
                <View style={styles.stressLevelHeader}>
                  <Text
                    style={[
                      styles.optionTitle,
                      stressData.stress_level === level.value && {
                        color: level.color,
                      },
                    ]}
                  >
                    {level.label}
                  </Text>
                  <View
                    style={[
                      styles.stressIndicator,
                      { backgroundColor: level.color },
                    ]}
                  />
                </View>
                <Text style={styles.optionDescription}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stress Sources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What are your main sources of stress?
            </Text>
            <View style={styles.sourcesGrid}>
              {STRESS_SOURCES.map(source => (
                <TouchableOpacity
                  key={source.value}
                  style={[
                    styles.sourceCard,
                    stressData.stress_sources.includes(source.value) &&
                      styles.sourceCardSelected,
                  ]}
                  onPress={() =>
                    toggleArrayItem('stress_sources', source.value)
                  }
                >
                  <Text style={styles.sourceIcon}>{source.icon}</Text>
                  <Text
                    style={[
                      styles.sourceLabel,
                      stressData.stress_sources.includes(source.value) &&
                        styles.sourceLabelSelected,
                    ]}
                  >
                    {source.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stress Symptoms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How does stress affect you?</Text>
            <View style={styles.symptomsGrid}>
              {STRESS_SYMPTOMS.map(symptom => (
                <TouchableOpacity
                  key={symptom.value}
                  style={[
                    styles.symptomCard,
                    stressData.stress_symptoms.includes(symptom.value) &&
                      styles.symptomCardSelected,
                  ]}
                  onPress={() =>
                    toggleArrayItem('stress_symptoms', symptom.value)
                  }
                >
                  <Text style={styles.symptomIcon}>{symptom.icon}</Text>
                  <Text
                    style={[
                      styles.symptomLabel,
                      stressData.stress_symptoms.includes(symptom.value) &&
                        styles.symptomLabelSelected,
                    ]}
                  >
                    {symptom.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Coping Strategies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How do you currently manage stress?
            </Text>
            <View style={styles.copingGrid}>
              {COPING_STRATEGIES.map(strategy => (
                <TouchableOpacity
                  key={strategy.value}
                  style={[
                    styles.copingCard,
                    stressData.coping_strategies.includes(strategy.value) &&
                      styles.copingCardSelected,
                  ]}
                  onPress={() =>
                    toggleArrayItem('coping_strategies', strategy.value)
                  }
                >
                  <Text style={styles.copingIcon}>{strategy.icon}</Text>
                  <Text
                    style={[
                      styles.copingLabel,
                      stressData.coping_strategies.includes(strategy.value) &&
                        styles.copingLabelSelected,
                    ]}
                  >
                    {strategy.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Relaxation Techniques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Which relaxation techniques interest you?
            </Text>
            {RELAXATION_TECHNIQUES.map(technique => (
              <TouchableOpacity
                key={technique.value}
                style={[
                  styles.optionCard,
                  stressData.relaxation_techniques.includes(technique.value) &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  toggleArrayItem('relaxation_techniques', technique.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    stressData.relaxation_techniques.includes(
                      technique.value
                    ) && styles.optionTitleSelected,
                  ]}
                >
                  {technique.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {technique.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Support System */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How would you rate your support system?
            </Text>
            {SUPPORT_SYSTEMS.map(support => (
              <TouchableOpacity
                key={support.value}
                style={[
                  styles.optionCard,
                  stressData.support_system === support.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  updateStressData('support_system', support.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    stressData.support_system === support.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {support.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {support.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
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
  stressLevelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  stressIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  sourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sourceCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  sourceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  sourceIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  sourceLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  sourceLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  symptomCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  symptomCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  symptomIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  symptomLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  symptomLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  copingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  copingCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  copingCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  copingIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  copingLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  copingLabelSelected: {
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
