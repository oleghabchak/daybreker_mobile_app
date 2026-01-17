import DateTimePicker from '@react-native-community/datetimepicker';
import { HelpCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

interface Props {
  navigation: any;
}

export const BasicInfoScreen = ({ navigation }: Props) => {
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female'>('male');
  const [bodyType, setBodyType] = useState<'masculine' | 'feminine'>(
    'masculine'
  );
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');
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
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name, date_of_birth, biological_sex')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
          if (profile.date_of_birth) {
            setDateOfBirth(new Date(profile.date_of_birth));
          }
          if (profile.biological_sex) {
            setBiologicalSex(profile.biological_sex);
          }
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
          screen_name: 'BasicInfo',
          time_spent_seconds: timeSpent,
          interactions: 1,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'BasicInfo',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            full_name: fullName,
            date_of_birth: dateOfBirth.toISOString().split('T')[0],
            biological_sex: biologicalSex,
            body_type: bodyType,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return false;
    }

    const age = new Date().getFullYear() - dateOfBirth.getFullYear();
    if (age < 13 || age > 120) {
      Alert.alert('Invalid Date', 'Please enter a valid date of birth');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const profileData = {
          id: user.id,
          full_name: fullName.trim(),
          email: user.email!,
          date_of_birth: dateOfBirth.toISOString().split('T')[0],
          biological_sex: biologicalSex,
          body_type: bodyType,
          updated_at: new Date().toISOString(),
          version: 1,
        };

        const { error } = await supabase
          .from('user_profiles')
          .upsert(profileData);

        if (error) throw error;

        navigation.navigate('HealthGoals');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        'Failed to save your information. Please try again.'
      );
      console.error('Error saving basic info:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Let's get to know you</Text>
          <Text style={styles.headerSubtitle}>
            We need some basic information to personalize your health journey
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '8%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 14</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Full Name',
                    'Enter your legal name as it appears on official documents.'
                  )
                }
              >
                <HelpCircle size={18} color={Colors.textDisabled} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder='Enter your full name'
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize='words'
              textContentType='name'
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Date of Birth *</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Date of Birth',
                    'Your birth date is used to calculate your biological age and provide age-appropriate health recommendations.'
                  )
                }
              >
                <HelpCircle size={18} color={Colors.textDisabled} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                testID='dateTimePicker'
                value={dateOfBirth}
                mode='date'
                is24Hour={true}
                display='spinner'
                onChange={onDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                style={styles.datePicker}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(dateOfBirth)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    testID='dateTimePicker'
                    value={dateOfBirth}
                    mode='date'
                    is24Hour={true}
                    display='default'
                    onChange={onDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Biological Sex *</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Biological Sex',
                    'Your biological sex at birth affects certain health metrics and risk factors. This information helps us provide more accurate health insights.'
                  )
                }
              >
                <HelpCircle size={18} color={Colors.textDisabled} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              This helps us provide more accurate health insights
            </Text>
            <View style={styles.sexOptions}>
              {(['male', 'female'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sexOption,
                    biologicalSex === option && styles.sexOptionSelected,
                  ]}
                  onPress={() => setBiologicalSex(option)}
                >
                  <Text
                    style={[
                      styles.sexOptionText,
                      biologicalSex === option && styles.sexOptionTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Your Body Type *</Text>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Body Type',
                    'Your body type helps us tailor exercise recommendations and body composition targets to your physiology.'
                  )
                }
              >
                <HelpCircle size={18} color={Colors.textDisabled} />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Select the body type that best describes you
            </Text>
            <View style={styles.sexOptions}>
              {(['masculine', 'feminine'] as const).map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sexOption,
                    bodyType === option && styles.sexOptionSelected,
                  ]}
                  onPress={() => setBodyType(option)}
                >
                  <Text
                    style={[
                      styles.sexOptionText,
                      bodyType === option && styles.sexOptionTextSelected,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
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
  inputContainer: {
    marginBottom: Space[6],
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space[2],
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[2],
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    backgroundColor: '#F8F9FA',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    backgroundColor: '#F8F9FA',
  },
  dateText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  datePicker: {
    height: 200,
    marginTop: -Space[2],
  },
  sexOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sexOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[4],
    marginHorizontal: Space[1],
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  sexOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  sexOptionText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
  },
  sexOptionTextSelected: {
    color: Colors.primary,
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
