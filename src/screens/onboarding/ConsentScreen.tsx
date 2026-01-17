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

const CONSENT_ITEMS = [
  {
    id: 'data_collection',
    title: 'Health Data Collection',
    description:
      'I consent to the collection and processing of my health data for personalized health insights and recommendations.',
    required: true,
  },
  {
    id: 'data_storage',
    title: 'Secure Data Storage',
    description:
      'I understand my health data will be stored securely with encryption and access controls for up to 7 years as required by HIPAA.',
    required: true,
  },
  {
    id: 'data_analysis',
    title: 'Health Analytics',
    description:
      'I consent to automated analysis of my health data to generate personalized health scores and recommendations.',
    required: true,
  },
  {
    id: 'research_participation',
    title: 'Anonymous Research (Optional)',
    description:
      'I consent to my anonymized health data being used for population health research to improve health outcomes for everyone.',
    required: false,
  },
  {
    id: 'communication',
    title: 'Health Communications',
    description:
      'I consent to receive health-related notifications, reminders, and educational content via the app.',
    required: true,
  },
];

const HIPAA_RIGHTS = [
  {
    right: 'Right to Access',
    description: 'You can request copies of your health records at any time.',
  },
  {
    right: 'Right to Amend',
    description:
      'You can request corrections to your health information if you believe it is incorrect.',
  },
  {
    right: 'Right to Restrict',
    description:
      'You can request restrictions on how your health information is used or disclosed.',
  },
  {
    right: 'Right to Delete',
    description:
      'You can request deletion of your health data, subject to legal retention requirements.',
  },
  {
    right: 'Right to Portability',
    description:
      'You can request your health data in a portable format to transfer to another provider.',
  },
];

export const ConsentScreen = ({ navigation }: Props) => {
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());

  useEffect(() => {
    // Initialize required consents as false
    const initialConsents: Record<string, boolean> = {};
    CONSENT_ITEMS.forEach(item => {
      initialConsents[item.id] = false;
    });
    setConsents(initialConsents);

    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const trackScreenTime = async () => {
    const timeSpent = Math.round((Date.now() - screenStartTime) / 1000);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('screen_analytics').insert({
          user_id: user.id,
          screen_name: 'Consent',
          time_spent_seconds: timeSpent,
          interactions: Object.values(consents).filter(Boolean).length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'Consent',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            consents: consents,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const toggleConsent = (consentId: string) => {
    setConsents(prev => ({
      ...prev,
      [consentId]: !prev[consentId],
    }));
  };

  const validateConsents = () => {
    const requiredConsents = CONSENT_ITEMS.filter(item => item.required);
    return requiredConsents.every(item => consents[item.id]);
  };

  const handleContinue = async () => {
    if (!validateConsents()) {
      Alert.alert(
        'Required Consents Missing',
        'Please provide consent for all required items to continue.'
      );
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save consent data
        const consentEntries = Object.entries(consents).map(
          ([consentType, granted]) => ({
            user_id: user.id,
            metric_type: `consent_${consentType}`,
            value_text: granted ? 'granted' : 'denied',
            source: 'onboarding',
            version: 1,
          })
        );

        for (const consent of consentEntries) {
          await supabase.from('user_metrics').insert(consent);
        }

        // Record HIPAA consent compliance
        await supabase.from('user_metrics').insert({
          user_id: user.id,
          metric_type: 'hipaa_consent_completed',
          value_text: 'true',
          source: 'onboarding',
          version: 1,
        });

        navigation.navigate('Completion');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to save consent information. Please try again.'
      );
      console.error('Error saving consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const grantedConsents = Object.values(consents).filter(Boolean).length;
  const requiredConsents = CONSENT_ITEMS.filter(item => item.required).length;

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
          <Text style={styles.headerTitle}>Privacy & Consent</Text>
          <Text style={styles.headerSubtitle}>
            Your privacy is our priority. Please review and provide consent for
            how we handle your health data.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '79%' }]} />
          </View>
          <Text style={styles.progressText}>11 of 14</Text>
        </View>

        <View style={styles.content}>
          {/* HIPAA Notice */}
          <View style={styles.hipaaNotice}>
            <Text style={styles.hipaaIcon}>🛡️</Text>
            <View style={styles.hipaaContent}>
              <Text style={styles.hipaaTitle}>HIPAA Compliant</Text>
              <Text style={styles.hipaaText}>
                We follow strict HIPAA guidelines to protect your health
                information. Your data is encrypted, access-controlled, and
                never shared without your explicit consent.
              </Text>
            </View>
          </View>

          {/* Consent Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consent Items</Text>
            {CONSENT_ITEMS.map(item => (
              <View key={item.id} style={styles.consentCard}>
                <TouchableOpacity
                  style={styles.consentHeader}
                  onPress={() => toggleConsent(item.id)}
                >
                  <View style={styles.consentInfo}>
                    <View style={styles.consentTitleRow}>
                      <Text style={styles.consentTitle}>{item.title}</Text>
                      {item.required && (
                        <View style={styles.requiredBadge}>
                          <Text style={styles.requiredText}>Required</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.consentDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      consents[item.id] && styles.checkboxChecked,
                    ]}
                  >
                    {consents[item.id] && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Your HIPAA Rights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your HIPAA Rights</Text>
            <Text style={styles.sectionSubtitle}>
              Under HIPAA, you have the following rights regarding your health
              information:
            </Text>

            {HIPAA_RIGHTS.map((right, index) => (
              <View key={index} style={styles.rightItem}>
                <View style={styles.rightBullet} />
                <View style={styles.rightContent}>
                  <Text style={styles.rightTitle}>{right.right}</Text>
                  <Text style={styles.rightDescription}>
                    {right.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Data Retention */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Retention</Text>
            <View style={styles.retentionCard}>
              <Text style={styles.retentionText}>
                • Your health data will be retained for 7 years as required by
                HIPAA regulations
              </Text>
              <Text style={styles.retentionText}>
                • You can request deletion of your data at any time, subject to
                legal requirements
              </Text>
              <Text style={styles.retentionText}>
                • Anonymized research data may be retained longer for scientific
                purposes
              </Text>
              <Text style={styles.retentionText}>
                • You will receive annual notices about your privacy rights and
                our data practices
              </Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions or Concerns?</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactText}>
                If you have questions about your privacy rights or how we handle
                your data, contact our Privacy Officer:
              </Text>
              <Text style={styles.contactEmail}>privacy@daybreaker.health</Text>
              <Text style={styles.contactText}>
                For technical support: support@daybreaker.health
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.consentSummary}>
            <Text style={styles.summaryText}>
              {grantedConsents} of {CONSENT_ITEMS.length} consents provided
            </Text>
            <Text style={styles.summarySubtext}>
              {requiredConsents} required consents{' '}
              {validateConsents() ? 'completed' : 'needed'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (loading || !validateConsents()) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={loading || !validateConsents()}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving Consents...' : 'Accept & Continue'}
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
  hipaaNotice: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
    marginBottom: Space[8],
  },
  hipaaIcon: {
    fontSize: 24,
    marginRight: Space[4],
  },
  hipaaContent: {
    flex: 1,
  },
  hipaaTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
    fontWeight: '600',
  },
  hipaaText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  section: {
    marginBottom: Space[8],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginBottom: Space[6],
  },
  consentCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginBottom: Space[2],
    backgroundColor: '#F8F9FA',
  },
  consentHeader: {
    flexDirection: 'row',
    padding: Space[6],
    alignItems: 'flex-start',
  },
  consentInfo: {
    flex: 1,
    marginRight: Space[4],
  },
  consentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  consentTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Space[2],
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Space[2],
  },
  requiredText: {
    ...Typography.caption,
    color: Colors.background,
    fontSize: 10,
    fontWeight: '600',
  },
  consentDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rightItem: {
    flexDirection: 'row',
    marginBottom: Space[4],
    alignItems: 'flex-start',
  },
  rightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: Space[4],
  },
  rightContent: {
    flex: 1,
  },
  rightTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  rightDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  retentionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Space[6],
  },
  retentionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Space[2],
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    padding: Space[6],
  },
  contactText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Space[2],
    lineHeight: 20,
  },
  contactEmail: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: Space[2],
  },
  footer: {
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    paddingTop: Space[4],
  },
  consentSummary: {
    alignItems: 'center',
    marginBottom: Space[6],
  },
  summaryText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  summarySubtext: {
    ...Typography.caption,
    color: Colors.textDisabled,
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
