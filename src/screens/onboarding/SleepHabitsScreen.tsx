import DateTimePicker from '@react-native-community/datetimepicker';
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

interface SleepData {
  bedtime: Date;
  wake_time: Date;
  sleep_duration: number;
  sleep_quality: string;
  sleep_issues: string[];
  sleep_environment: string[];
  weekend_schedule: string;
}

const SLEEP_QUALITY = [
  {
    value: 'excellent',
    label: 'Excellent',
    description: 'Wake up refreshed, fall asleep easily',
  },
  {
    value: 'good',
    label: 'Good',
    description: 'Generally sleep well with minor issues',
  },
  {
    value: 'fair',
    label: 'Fair',
    description: 'Some difficulty sleeping or staying asleep',
  },
  {
    value: 'poor',
    label: 'Poor',
    description: 'Frequent sleep problems, often tired',
  },
  {
    value: 'very_poor',
    label: 'Very Poor',
    description: 'Severe sleep issues, chronic fatigue',
  },
];

const SLEEP_ISSUES = [
  {
    value: 'trouble_falling_asleep',
    label: 'Trouble Falling Asleep',
    icon: '😴',
  },
  { value: 'frequent_waking', label: 'Frequent Night Waking', icon: '🌙' },
  { value: 'early_waking', label: 'Waking Too Early', icon: '🌅' },
  { value: 'snoring', label: 'Snoring', icon: '😤' },
  { value: 'restless_legs', label: 'Restless Legs', icon: '🦵' },
  { value: 'nightmares', label: 'Nightmares/Bad Dreams', icon: '😰' },
  { value: 'sleep_apnea', label: 'Sleep Apnea', icon: '😨' },
  { value: 'stress_anxiety', label: 'Stress/Anxiety', icon: '😟' },
];

const SLEEP_ENVIRONMENT = [
  { value: 'dark_room', label: 'Dark Room', icon: '🌚' },
  { value: 'cool_temperature', label: 'Cool Temperature', icon: '❄️' },
  { value: 'quiet', label: 'Quiet Environment', icon: '🔇' },
  { value: 'white_noise', label: 'White Noise/Sounds', icon: '🎵' },
  { value: 'comfortable_mattress', label: 'Comfortable Mattress', icon: '🛏️' },
  { value: 'blackout_curtains', label: 'Blackout Curtains', icon: '🏠' },
  { value: 'eye_mask', label: 'Eye Mask', icon: '👁️' },
  { value: 'earplugs', label: 'Earplugs', icon: '👂' },
];

const WEEKEND_SCHEDULE = [
  {
    value: 'same',
    label: 'Same as Weekdays',
    description: 'Consistent sleep schedule',
  },
  {
    value: 'slightly_later',
    label: 'Slightly Later',
    description: '1-2 hours later than weekdays',
  },
  {
    value: 'much_later',
    label: 'Much Later',
    description: '3+ hours later than weekdays',
  },
  {
    value: 'irregular',
    label: 'Irregular',
    description: 'No consistent weekend schedule',
  },
];

export const SleepHabitsScreen = ({ navigation }: Props) => {
  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: new Date(2024, 0, 1, 22, 0), // 10 PM
    wake_time: new Date(2024, 0, 1, 7, 0), // 7 AM
    sleep_duration: 8,
    sleep_quality: '',
    sleep_issues: [],
    sleep_environment: [],
    weekend_schedule: '',
  });
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());

  useEffect(() => {
    calculateSleepDuration();
  }, [sleepData.bedtime, sleepData.wake_time]);

  useEffect(() => {
    loadExistingData();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const calculateSleepDuration = () => {
    const bedtime = sleepData.bedtime;
    const wakeTime = sleepData.wake_time;

    // Handle crossing midnight
    let duration = (wakeTime.getTime() - bedtime.getTime()) / (1000 * 60 * 60);
    if (duration < 0) {
      duration += 24; // Add 24 hours if crossing midnight
    }

    setSleepData(prev => ({
      ...prev,
      sleep_duration: Math.round(duration * 10) / 10,
    }));
  };

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
          .eq('screen_name', 'SleepHabits')
          .single();

        if (progress?.data_collected?.sleep) {
          const savedData = progress.data_collected.sleep;
          setSleepData({
            ...savedData,
            bedtime: new Date(savedData.bedtime),
            wake_time: new Date(savedData.wake_time),
          });
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
          screen_name: 'SleepHabits',
          time_spent_seconds: timeSpent,
          interactions: [
            sleepData.sleep_quality,
            ...sleepData.sleep_issues,
            ...sleepData.sleep_environment,
            sleepData.weekend_schedule,
          ].filter(Boolean).length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'SleepHabits',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            sleep: sleepData,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const updateSleepData = (key: keyof SleepData, value: any) => {
    setSleepData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleSleepIssue = (issue: string) => {
    setSleepData(prev => ({
      ...prev,
      sleep_issues: prev.sleep_issues.includes(issue)
        ? prev.sleep_issues.filter(i => i !== issue)
        : [...prev.sleep_issues, issue],
    }));
  };

  const toggleSleepEnvironment = (env: string) => {
    setSleepData(prev => ({
      ...prev,
      sleep_environment: prev.sleep_environment.includes(env)
        ? prev.sleep_environment.filter(e => e !== env)
        : [...prev.sleep_environment, env],
    }));
  };

  const onBedtimeChange = (event: any, selectedTime?: Date) => {
    setShowBedtimePicker(false);
    if (selectedTime) {
      updateSleepData('bedtime', selectedTime);
    }
  };

  const onWakeTimeChange = (event: any, selectedTime?: Date) => {
    setShowWakeTimePicker(false);
    if (selectedTime) {
      updateSleepData('wake_time', selectedTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const validateForm = () => {
    return sleepData.sleep_quality && sleepData.weekend_schedule;
  };

  const getSleepDurationColor = () => {
    if (sleepData.sleep_duration < 6) return Colors.error;
    if (sleepData.sleep_duration < 7) return '#FF9500'; // Orange
    if (sleepData.sleep_duration <= 9) return Colors.success;
    return '#FF9500'; // Orange for too much sleep
  };

  const getSleepDurationFeedback = () => {
    if (sleepData.sleep_duration < 6) return 'Too little sleep';
    if (sleepData.sleep_duration < 7) return 'Below recommended';
    if (sleepData.sleep_duration <= 9) return 'Optimal sleep duration';
    return 'More than needed';
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Incomplete',
        'Please answer all sleep questions to continue.'
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save sleep data as user metrics
        const metrics = [
          {
            metric_type: 'sleep_bedtime',
            value_text: sleepData.bedtime.toTimeString().slice(0, 5),
          },
          {
            metric_type: 'sleep_wake_time',
            value_text: sleepData.wake_time.toTimeString().slice(0, 5),
          },
          {
            metric_type: 'sleep_duration',
            value_numeric: sleepData.sleep_duration,
          },
          {
            metric_type: 'sleep_quality',
            value_text: sleepData.sleep_quality,
          },
          {
            metric_type: 'sleep_issues',
            value_text: sleepData.sleep_issues.join(','),
          },
          {
            metric_type: 'sleep_environment',
            value_text: sleepData.sleep_environment.join(','),
          },
          {
            metric_type: 'weekend_sleep_schedule',
            value_text: sleepData.weekend_schedule,
          },
        ];

        for (const metric of metrics) {
          await supabase.from('user_metrics').insert({
            user_id: user.id,
            metric_type: metric.metric_type,
            value_numeric: metric.value_numeric || null,
            value_text: metric.value_text || null,
            source: 'onboarding',
            version: 1,
          });
        }

        navigation.navigate('StressManagement');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to save sleep information. Please try again.'
      );
      console.error('Error saving sleep habits:', error);
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
          <Text style={styles.headerTitle}>Sleep Habits</Text>
          <Text style={styles.headerSubtitle}>
            Good sleep is fundamental to health. Help us understand your sleep
            patterns.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '46%' }]} />
          </View>
          <Text style={styles.progressText}>6 of 14</Text>
        </View>

        <View style={styles.form}>
          {/* Sleep Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sleep Schedule</Text>

            <View style={styles.timeContainer}>
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowBedtimePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {formatTime(sleepData.bedtime)}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowWakeTimePicker(true)}
                >
                  <Text style={styles.timeText}>
                    {formatTime(sleepData.wake_time)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Sleep Duration</Text>
              <Text
                style={[
                  styles.durationValue,
                  { color: getSleepDurationColor() },
                ]}
              >
                {sleepData.sleep_duration} hours
              </Text>
              <Text
                style={[
                  styles.durationFeedback,
                  { color: getSleepDurationColor() },
                ]}
              >
                {getSleepDurationFeedback()}
              </Text>
            </View>
          </View>

          {/* Sleep Quality */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How would you rate your sleep quality?
            </Text>
            {SLEEP_QUALITY.map(quality => (
              <TouchableOpacity
                key={quality.value}
                style={[
                  styles.optionCard,
                  sleepData.sleep_quality === quality.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() => updateSleepData('sleep_quality', quality.value)}
              >
                <Text
                  style={[
                    styles.optionTitle,
                    sleepData.sleep_quality === quality.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {quality.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {quality.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sleep Issues */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Do you experience any sleep issues?
            </Text>
            <View style={styles.issuesGrid}>
              {SLEEP_ISSUES.map(issue => (
                <TouchableOpacity
                  key={issue.value}
                  style={[
                    styles.issueCard,
                    sleepData.sleep_issues.includes(issue.value) &&
                      styles.issueCardSelected,
                  ]}
                  onPress={() => toggleSleepIssue(issue.value)}
                >
                  <Text style={styles.issueIcon}>{issue.icon}</Text>
                  <Text
                    style={[
                      styles.issueLabel,
                      sleepData.sleep_issues.includes(issue.value) &&
                        styles.issueLabelSelected,
                    ]}
                  >
                    {issue.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.noneButton}
              onPress={() => updateSleepData('sleep_issues', [])}
            >
              <Text style={styles.noneButtonText}>None of the above</Text>
            </TouchableOpacity>
          </View>

          {/* Sleep Environment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              What helps you sleep better?
            </Text>
            <View style={styles.environmentGrid}>
              {SLEEP_ENVIRONMENT.map(env => (
                <TouchableOpacity
                  key={env.value}
                  style={[
                    styles.envCard,
                    sleepData.sleep_environment.includes(env.value) &&
                      styles.envCardSelected,
                  ]}
                  onPress={() => toggleSleepEnvironment(env.value)}
                >
                  <Text style={styles.envIcon}>{env.icon}</Text>
                  <Text
                    style={[
                      styles.envLabel,
                      sleepData.sleep_environment.includes(env.value) &&
                        styles.envLabelSelected,
                    ]}
                  >
                    {env.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weekend Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              How does your weekend sleep differ?
            </Text>
            {WEEKEND_SCHEDULE.map(schedule => (
              <TouchableOpacity
                key={schedule.value}
                style={[
                  styles.optionCard,
                  sleepData.weekend_schedule === schedule.value &&
                    styles.optionCardSelected,
                ]}
                onPress={() =>
                  updateSleepData('weekend_schedule', schedule.value)
                }
              >
                <Text
                  style={[
                    styles.optionTitle,
                    sleepData.weekend_schedule === schedule.value &&
                      styles.optionTitleSelected,
                  ]}
                >
                  {schedule.label}
                </Text>
                <Text style={styles.optionDescription}>
                  {schedule.description}
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

      {showBedtimePicker && (
        <DateTimePicker
          value={sleepData.bedtime}
          mode='time'
          is24Hour={false}
          display='default'
          onChange={onBedtimeChange}
        />
      )}

      {showWakeTimePicker && (
        <DateTimePicker
          value={sleepData.wake_time}
          mode='time'
          is24Hour={false}
          display='default'
          onChange={onWakeTimeChange}
        />
      )}
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space[6],
  },
  timeSection: {
    flex: 1,
    marginHorizontal: Space[1],
  },
  timeLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  timeText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  durationContainer: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Space[6],
  },
  durationLabel: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    marginBottom: Space[2],
  },
  durationValue: {
    ...Typography.h2,
    marginBottom: Space[1],
  },
  durationFeedback: {
    ...Typography.caption,
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
  issuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  issueCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  issueCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  issueIcon: {
    fontSize: 24,
    marginBottom: Space[2],
  },
  issueLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  issueLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  environmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  envCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[2],
    marginBottom: Space[2],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  envCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  envIcon: {
    fontSize: 20,
    marginBottom: Space[1],
  },
  envLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    fontSize: 11,
  },
  envLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  noneButton: {
    padding: Space[4],
    alignItems: 'center',
    marginTop: Space[2],
  },
  noneButtonText: {
    ...Typography.body,
    color: Colors.textDisabled,
    textDecorationLine: 'underline',
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
