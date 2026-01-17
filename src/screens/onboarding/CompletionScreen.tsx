import {
  Activity,
  BarChart3,
  Bot,
  ClipboardList,
  FileText,
  Lightbulb,
  Lock,
  PartyPopper,
  Target,
  Trophy,
  Watch,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
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

const COMPLETION_STATS = [
  { label: 'Health Goals', icon: Target, value: 'Set' },
  { label: 'Medical History', icon: ClipboardList, value: 'Captured' },
  { label: 'Lifestyle Data', icon: Activity, value: 'Analyzed' },
  { label: 'Digital Twin', icon: Bot, value: 'Created' },
  { label: 'Privacy Consents', icon: Lock, value: 'Secured' },
];

const NEXT_STEPS = [
  {
    title: 'Explore Your Home',
    description: 'See your personalized health scores and recommendations',
    icon: BarChart3,
    action: 'View Home',
  },
  {
    title: 'Track Daily Metrics',
    description: 'Log your daily health data to improve your scores',
    icon: FileText,
    action: 'Start Tracking',
  },
  {
    title: 'Set Health Goals',
    description: 'Create specific, measurable health objectives',
    icon: Target,
    action: 'Set Goals',
  },
  {
    title: 'Connect Devices',
    description: 'Sync with fitness trackers and health apps',
    icon: Watch,
    action: 'Connect',
  },
];

export const CompletionScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());
  const [celebrationAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    startCelebrationAnimation();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const startCelebrationAnimation = () => {
    Animated.sequence([
      Animated.timing(celebrationAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnimation, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
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
          screen_name: 'Completion',
          time_spent_seconds: timeSpent,
          interactions: 1,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'Completion',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            onboarding_completed: true,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Mark onboarding as completed in user profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;

        // Record onboarding completion metric
        await supabase.from('user_metrics').insert({
          user_id: user.id,
          metric_type: 'onboarding_completed',
          value_text: 'true',
          source: 'onboarding',
          version: 1,
        });

        // Navigate to dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOnboardingTime = () => {
    // Calculate estimated time spent based on screen analytics
    // For demo purposes, return a fixed time
    return '4 minutes';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>14 of 14 - Complete!</Text>
        </View>

        <View style={styles.content}>
          {/* Celebration */}
          <Animated.View
            style={[
              styles.celebrationContainer,
              {
                transform: [{ scale: celebrationAnimation }],
              },
            ]}
          >
            <PartyPopper size={48} color={Colors.primary} />
            <Text style={styles.celebrationTitle}>Welcome to Daybreaker!</Text>
            <Text style={styles.celebrationSubtitle}>
              Your personalized health journey starts now
            </Text>
          </Animated.View>

          {/* Completion Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We've Accomplished</Text>
            <View style={styles.statsContainer}>
              {COMPLETION_STATS.map((stat, index) => (
                <View key={stat.label} style={styles.statCard}>
                  <stat.icon
                    size={24}
                    color={Colors.primary}
                    style={styles.statIcon}
                  />
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Health Profile Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Onboarding Time:</Text>
                <Text style={styles.summaryValue}>{getOnboardingTime()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Health Goals:</Text>
                <Text style={styles.summaryValue}>Personalized</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Data Points:</Text>
                <Text style={styles.summaryValue}>50+ collected</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Privacy Status:</Text>
                <Text style={styles.summaryValue}>HIPAA Compliant</Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What's Next?</Text>
            <Text style={styles.sectionSubtitle}>
              Here's how to get the most out of your Daybreaker experience:
            </Text>

            {NEXT_STEPS.map((step, index) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <step.icon size={24} color={Colors.primary} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Achievement Badge */}
          <View style={styles.achievementContainer}>
            <Trophy size={40} color={Colors.primary} />
            <Text style={styles.achievementTitle}>Achievement Unlocked!</Text>
            <Text style={styles.achievementDescription}>
              "Health Journey Beginner" - Completed your first health assessment
            </Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={24} color={Colors.primary} />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={styles.tipText}>
                • Check your dashboard daily for updated health scores
              </Text>
              <Text style={styles.tipText}>
                • Track at least one metric daily for better insights
              </Text>
              <Text style={styles.tipText}>
                • Review your weekly health report every Sunday
              </Text>
              <Text style={styles.tipText}>
                • Connect with our community for motivation and support
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.completeButton, loading && styles.buttonDisabled]}
            onPress={completeOnboarding}
            disabled={loading}
          >
            <Text style={styles.completeButtonText}>
              {loading ? 'Setting Up Your Home...' : 'Enter Your Home'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Welcome to your personalized health journey!
          </Text>
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
    paddingBottom: Space[4],
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Space[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.success,
    textAlign: 'center',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: Space[6],
    flex: 1,
  },
  celebrationContainer: {
    alignItems: 'center',
    paddingVertical: Space[8],
    marginBottom: Space[6],
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: Space[4],
  },
  celebrationTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  celebrationSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  section: {
    marginBottom: Space[8],
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginBottom: Space[6],
  },
  statsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  statIcon: {
    fontSize: 24,
    marginRight: Space[4],
    width: 32,
  },
  statInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  statValue: {
    ...Typography.bodyMedium,
    color: Colors.success,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  summaryValue: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Space[6],
    marginBottom: Space[4],
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space[4],
  },
  stepIconText: {
    fontSize: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  stepDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space[4],
  },
  stepNumberText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: 'bold',
  },
  achievementContainer: {
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Space[8],
    marginBottom: Space[6],
  },
  achievementEmoji: {
    fontSize: 48,
    marginBottom: Space[4],
  },
  achievementTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Space[2],
  },
  achievementDescription: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
    marginBottom: Space[6],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  tipsTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginLeft: Space[2],
  },
  tipsList: {
    paddingLeft: Space[2],
  },
  tipText: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginBottom: Space[2],
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    paddingTop: Space[4],
  },
  completeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[4],
    alignItems: 'center',
    marginBottom: Space[4],
  },
  completeButtonText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerNote: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
});
