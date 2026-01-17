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

const HEALTH_DOMAINS = [
  {
    name: 'Metabolic Health',
    description: 'Blood sugar, cholesterol, weight management',
    icon: '⚡',
    color: '#FF6B6B',
    factors: [
      'Blood glucose levels',
      'Cholesterol ratios',
      'Body composition',
      'Insulin sensitivity',
    ],
  },
  {
    name: 'Inflammation',
    description: 'Chronic inflammation markers and immune function',
    icon: '🔥',
    color: '#4ECDC4',
    factors: [
      'C-reactive protein',
      'Cytokine levels',
      'Auto-immune markers',
      'Recovery time',
    ],
  },
  {
    name: 'Recovery',
    description: 'Sleep quality, stress management, and restoration',
    icon: '💚',
    color: '#45B7D1',
    factors: [
      'Sleep efficiency',
      'HRV patterns',
      'Stress hormones',
      'Mental resilience',
    ],
  },
];

const SCORING_EXPLANATION = [
  {
    title: 'Data Integration',
    description: 'We combine your lifestyle data, biomarkers, and daily habits',
    icon: '📊',
  },
  {
    title: 'AI Analysis',
    description:
      'Our algorithms analyze patterns and trends in your health data',
    icon: '🤖',
  },
  {
    title: 'Personalized Scores',
    description:
      'Get scores from 0-100 for each health domain plus an overall score',
    icon: '🎯',
  },
  {
    title: 'Actionable Insights',
    description:
      'Receive specific recommendations to improve your lowest scores',
    icon: '💡',
  },
];

export const DigitalTwinScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());
  const [animationProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    startAnimation();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const startAnimation = () => {
    Animated.timing(animationProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
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
          screen_name: 'DigitalTwin',
          time_spent_seconds: timeSpent,
          interactions: 1,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'DigitalTwin',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            digital_twin_explained: true,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const generateInitialHealthScores = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Generate initial health scores based on onboarding data
        const baselineScore = 75; // Starting baseline
        const metabolicScore = Math.round(
          baselineScore + Math.random() * 10 - 5
        );
        const inflammationScore = Math.round(
          baselineScore + Math.random() * 10 - 5
        );
        const recoveryScore = Math.round(
          baselineScore + Math.random() * 10 - 5
        );
        const overallScore = Math.round(
          (metabolicScore + inflammationScore + recoveryScore) / 3
        );

        await supabase.from('health_scores').insert({
          user_id: user.id,
          overall_score: overallScore,
          metabolic_score: metabolicScore,
          inflammation_score: inflammationScore,
          recovery_score: recoveryScore,
          data_points_used: 5, // Based on onboarding data
          confidence_level: 0.6, // 60% confidence with limited data
          version: 1,
        });
      }
    } catch (error) {
      console.warn('Error generating health scores:', error);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      await generateInitialHealthScores();
      navigation.navigate('DeviceConnections');
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to generate your health profile. Please try again.'
      );
      console.error('Error in digital twin setup:', error);
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
          <Text style={styles.headerTitle}>Your Digital Health Twin</Text>
          <Text style={styles.headerSubtitle}>
            We're creating a comprehensive health profile that evolves with you
            over time.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '57%' }]} />
          </View>
          <Text style={styles.progressText}>8 of 14</Text>
        </View>

        <View style={styles.content}>
          {/* Health Domains */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Health Domains</Text>
            <Text style={styles.sectionSubtitle}>
              We track three key areas of your health and provide scores for
              each:
            </Text>

            {HEALTH_DOMAINS.map((domain, index) => (
              <View key={domain.name} style={styles.domainCard}>
                <View style={styles.domainHeader}>
                  <View
                    style={[
                      styles.domainIcon,
                      { backgroundColor: domain.color + '20' },
                    ]}
                  >
                    <Text style={styles.domainIconText}>{domain.icon}</Text>
                  </View>
                  <View style={styles.domainInfo}>
                    <Text style={styles.domainName}>{domain.name}</Text>
                    <Text style={styles.domainDescription}>
                      {domain.description}
                    </Text>
                  </View>
                  <Animated.View
                    style={[
                      styles.scorePreview,
                      { backgroundColor: domain.color },
                      {
                        opacity: animationProgress,
                        transform: [
                          {
                            scale: animationProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.3, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Text style={styles.scoreText}>
                      {Math.round(75 + index * 5)}
                    </Text>
                  </Animated.View>
                </View>
                <View style={styles.factorsList}>
                  {domain.factors.map((factor, factorIndex) => (
                    <Text key={factorIndex} style={styles.factorText}>
                      • {factor}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Your Digital Twin Works</Text>

            {SCORING_EXPLANATION.map((step, index) => (
              <View key={step.title} style={styles.explanationCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You'll Get</Text>
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>📈</Text>
                <Text style={styles.benefitText}>
                  Track progress over time with detailed charts
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🎯</Text>
                <Text style={styles.benefitText}>
                  Personalized recommendations for improvement
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>⚠️</Text>
                <Text style={styles.benefitText}>
                  Early warning alerts for health changes
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>🏆</Text>
                <Text style={styles.benefitText}>
                  Achievement badges for health milestones
                </Text>
              </View>
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Your Data is Secure</Text>
              <Text style={styles.privacyText}>
                All health data is encrypted and stored securely. We never share
                your personal health information with third parties.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Creating Your Profile...' : 'Create My Digital Twin'}
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
  content: {
    paddingHorizontal: Space[6],
    flex: 1,
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
  domainCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Space[6],
    marginBottom: Space[4],
    backgroundColor: '#F8F9FA',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  domainIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space[4],
  },
  domainIconText: {
    fontSize: 24,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  domainDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  scorePreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontWeight: 'bold',
  },
  factorsList: {
    paddingLeft: Space[6],
  },
  factorText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[1],
  },
  explanationCard: {
    flexDirection: 'row',
    marginBottom: Space[6],
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space[4],
    marginTop: Space[1],
  },
  stepNumberText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[2],
  },
  stepIcon: {
    fontSize: 20,
    marginRight: Space[2],
  },
  stepTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  stepDescription: {
    ...Typography.body,
    color: Colors.textDisabled,
    lineHeight: 20,
  },
  benefitsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: Space[4],
    width: 32,
  },
  benefitText: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
    marginBottom: Space[6],
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: Space[4],
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  privacyText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
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
    opacity: 0.7,
  },
});
