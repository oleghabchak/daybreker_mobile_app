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

const HEALTH_GOALS = [
  {
    id: 'weight_management',
    title: 'Weight Management',
    description: 'Lose, gain, or maintain healthy weight',
    icon: '⚖️',
  },
  {
    id: 'cardiovascular_health',
    title: 'Heart Health',
    description: 'Improve cardiovascular fitness and health',
    icon: '❤️',
  },
  {
    id: 'energy_vitality',
    title: 'Energy & Vitality',
    description: 'Boost energy levels and overall vitality',
    icon: '⚡',
  },
  {
    id: 'sleep_optimization',
    title: 'Better Sleep',
    description: 'Improve sleep quality and duration',
    icon: '😴',
  },
  {
    id: 'stress_management',
    title: 'Stress Management',
    description: 'Reduce stress and improve mental well-being',
    icon: '🧘',
  },
  {
    id: 'muscle_strength',
    title: 'Muscle & Strength',
    description: 'Build muscle mass and increase strength',
    icon: '💪',
  },
  {
    id: 'flexibility_mobility',
    title: 'Flexibility & Mobility',
    description: 'Improve range of motion and flexibility',
    icon: '🤸',
  },
  {
    id: 'cognitive_health',
    title: 'Brain Health',
    description: 'Enhance memory, focus, and cognitive function',
    icon: '🧠',
  },
  {
    id: 'digestive_health',
    title: 'Digestive Health',
    description: 'Optimize gut health and digestion',
    icon: '🦠',
  },
  {
    id: 'disease_prevention',
    title: 'Disease Prevention',
    description: 'Prevent chronic diseases and health issues',
    icon: '🛡️',
  },
  {
    id: 'longevity',
    title: 'Longevity',
    description: 'Increase healthspan and lifespan',
    icon: '🌱',
  },
  {
    id: 'athletic_performance',
    title: 'Athletic Performance',
    description: 'Enhance sports and fitness performance',
    icon: '🏃',
  },
];

export const HealthGoalsScreen = ({ navigation }: Props) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
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
          .eq('screen_name', 'HealthGoals')
          .single();

        if (progress?.data_collected?.goals) {
          setSelectedGoals(progress.data_collected.goals);
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
          screen_name: 'HealthGoals',
          time_spent_seconds: timeSpent,
          interactions: selectedGoals.length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'HealthGoals',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            goals: selectedGoals,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      Alert.alert(
        'Select Goals',
        'Please select at least one health goal to continue'
      );
      return;
    }

    setLoading(true);
    try {
      // Save to user_priorities table
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_priorities').upsert({
          user_id: user.id,
          priorities: selectedGoals,
          completed_at: new Date().toISOString(),
          version: 1,
        });

        navigation.navigate('MedicalHistory');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save your goals. Please try again.');
      console.error('Error saving health goals:', error);
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
          <Text style={styles.headerTitle}>What are your health goals?</Text>
          <Text style={styles.headerSubtitle}>
            Select all that apply. This helps us personalize your experience.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '15%' }]} />
          </View>
          <Text style={styles.progressText}>2 of 14</Text>
        </View>

        <View style={styles.goalsContainer}>
          {HEALTH_GOALS.map(goal => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.goalCardSelected,
              ]}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <Text
                  style={[
                    styles.goalTitle,
                    selectedGoals.includes(goal.id) && styles.goalTitleSelected,
                  ]}
                >
                  {goal.title}
                </Text>
              </View>
              <Text
                style={[
                  styles.goalDescription,
                  selectedGoals.includes(goal.id) &&
                    styles.goalDescriptionSelected,
                ]}
              >
                {goal.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.selectionCount}>
            {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}{' '}
            selected
          </Text>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (loading || selectedGoals.length === 0) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading || selectedGoals.length === 0}
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
  goalsContainer: {
    paddingHorizontal: Space[6],
    flex: 1,
  },
  goalCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[4],
    backgroundColor: '#F8F9FA',
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[2],
  },
  goalIcon: {
    fontSize: 24,
    marginRight: Space[4],
  },
  goalTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  goalDescriptionSelected: {
    color: Colors.textPrimary,
  },
  footer: {
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    paddingTop: Space[4],
  },
  selectionCount: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[4],
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
