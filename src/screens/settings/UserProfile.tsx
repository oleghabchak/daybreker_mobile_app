import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import {
  Button,
  Checkbox,
  Header,
  Input,
  MeasurementsToggle,
  SectionCard,
  Toggle,
} from '../../components';
import { DeleteAccount } from '../../components/bottomSheets/DeleteAccount';
import {
  TooltipComponent,
  getTooltipMetrics,
} from '../../components/common/TooltipComponent';
import MultiSelectDropdown from '../../components/ui/MultiSelectDropdown';
import { RangeSlider } from '../../components/ui/RangeSlider';
import { isIOS } from '../../constants';
import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';
import {
  equipmentOptions,
  experienceLevels,
  injuryLocations,
} from '../../enums/mesocycle.enums';
import { useMeasurementUnits } from '../../hooks';
import { useTrainingConfig } from '../../hooks/useTrainingConfig';
import { supabase } from '../../lib/supabase';
import { Logger } from '../../services/logger';
import { placeholderExercises } from '../../types/personalization-hub';

interface ProfileData {
  full_name: string | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  timezone: string;
  email: string | null;
  biological_sex?: 'male' | 'female' | null;
}

export const UserProfile = ({ navigation }: any) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { isImperial, getUnit } = useMeasurementUnits();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [personalizationHubExpanded, setPersonalizationHubExpanded] =
    useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    wearables: boolean;
    exercise: boolean;
    diet: boolean;
    sleep: boolean;
    prescriptions: boolean;
    therapies: boolean;
    dermatology: boolean;
  }>({
    wearables: false,
    exercise: false,
    diet: false,
    sleep: false,
    prescriptions: false,
    therapies: false,
    dermatology: false,
  });
  const [localInjuryNotes, setLocalInjuryNotes] = useState('');
  const [localCoachingStyle, setLocalCoachingStyle] = useState(5);
  const [localBiologicalSex, setLocalBiologicalSex] = useState<
    'male' | 'female' | null
  >(null);
  const [localDesiredBodyType, setLocalDesiredBodyType] = useState<
    'masculine' | 'feminine' | null
  >('masculine');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Personalization hub hook
  const {
    config: trainingConfig,
    loading: trainingConfigLoading,
    saveConfig: saveTrainingConfig,
  } = useTrainingConfig();

  const formatExperienceLabel = (
    value:
      | 'masculine'
      | 'feminine'
      | '<6_months'
      | '6-12_months'
      | '1-3_years'
      | '3-5_years'
      | '5+_years'
  ): string => {
    switch (value) {
      case '<6_months':
        return '<6\nmonths';
      case '6-12_months':
        return '6–12\nmonths';
      case '1-3_years':
        return '1–3\nyears';
      case '3-5_years':
        return '3–5\nyears';
      case '5+_years':
        return '5+\nyears';
      default:
        return String(value).replace(/_/g, ' ');
    }
  };

  const cmToIn = (cm: number) => cm / 2.54;
  const inToCm = (inch: number) => inch * 2.54;
  const kgToLbs = (kg: number) => kg * 2.2046226218;
  const lbsToKg = (lbs: number) => lbs / 2.2046226218;

  // Calculate progress for Exercise Onboarding (based on personalization hub)
  const calculateExerciseProgress = () => {
    if (!trainingConfig) return 0;
    let filled = 0;
    let total = 10; // Total fields in exercise onboarding

    if (profile?.biological_sex) filled++;
    if (profile?.height_cm) filled++;
    if (trainingConfig.desired_body_type) filled++;
    if (trainingConfig.years_of_exercise_experience) filled++;
    if (
      trainingConfig.equipment_access &&
      trainingConfig.equipment_access.length > 0
    )
      filled++;
    if (trainingConfig.warmup_sets_preference !== undefined) filled++;
    if (trainingConfig.coaching_style !== undefined) filled++;
    if (profile?.weight_kg) filled++;
    if (profile?.timezone) filled++;
    filled++; // Measurement units always selected

    return Math.round((filled / total) * 100);
  };

  // Placeholder progress calculations for other sections
  const calculateWearablesProgress = () => 0; // TODO: Implement when wearable fields added
  const calculateDietProgress = () => 0; // TODO: Implement when diet fields added
  const calculateSleepProgress = () => 0; // TODO: Implement when sleep fields added
  const calculatePrescriptionsProgress = () => 0; // TODO: Implement when prescription fields added
  const calculateTherapiesProgress = () => 0; // TODO: Implement when therapy fields added
  const calculateDermatologyProgress = () => 0; // TODO: Implement when dermatology fields added

  const tooltipMetrics = {
    label: getTooltipMetrics(Typography.bodyMedium.fontSize),
    smallLabel: getTooltipMetrics(Typography.smallBold.fontSize),
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (trainingConfig?.injury_flags?.notes !== undefined) {
      setLocalInjuryNotes(trainingConfig.injury_flags.notes);
    }
  }, [trainingConfig?.injury_flags?.notes]);

  useEffect(() => {
    if (trainingConfig?.coaching_style !== undefined) {
      setLocalCoachingStyle(trainingConfig.coaching_style);
    }
  }, [trainingConfig?.coaching_style]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'User not authenticated',
        });
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load profile',
        });
        return;
      }

      setProfile(profileData);

      // Set default date if date_of_birth exists
      if (profileData.date_of_birth) {
        setTempDate(new Date(profileData.date_of_birth));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile().finally(() => setRefreshing(false));
  };

  const updateTrainingConfig = async (configData: any) => {
    try {
      await saveTrainingConfig(configData);
      Logger.success('Personalization hub updated:', configData);
    } catch (error) {
      console.error('Error updating personalization hub:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update personalization hub',
      });
    }
  };

  // Auto-save individual profile fields
  const autoSaveProfile = useCallback(async (updates: Partial<ProfileData>) => {
    try {
      setSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error auto-saving profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Auto-save failed',
          text2: 'Please check your connection',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error auto-saving profile:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  // Debounced save for text inputs
  const debouncedSave = useCallback(
    (updates: Partial<ProfileData>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        autoSaveProfile(updates);
      }, 1000); // Save 1 second after user stops typing
    },
    [autoSaveProfile]
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setTempDate(selectedDate);
      setProfile(prev =>
        prev
          ? {
              ...prev,
              date_of_birth: dateString,
            }
          : null
      );
      // Auto-save date immediately
      autoSaveProfile({ date_of_birth: dateString });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Header />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <User size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          <View style={styles.form}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={profile?.full_name ?? ''}
                onChangeText={text => {
                  setProfile(prev =>
                    prev ? { ...prev, full_name: text } : null
                  );
                  debouncedSave({ full_name: text });
                }}
                placeholder='Enter your full name'
                icon={<User size={20} color={Colors.textDisabled} />}
              />
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  if (Platform.OS === 'android') {
                    setShowDatePicker(true);
                  }
                }}
              >
                <Calendar size={20} color={Colors.textDisabled} />
                {isIOS ? (
                  <DateTimePicker
                    value={tempDate}
                    style={{ width: 500 }}
                    mode='date'
                    display='default'
                    textColor='red'
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    minimumDate={new Date('1900-01-01')}
                  />
                ) : (
                  <Text style={styles.dateButtonText}>
                    {profile?.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString()
                      : 'Select date'}
                  </Text>
                )}
              </TouchableOpacity>

              {!isIOS && showDatePicker && (
                <DateTimePicker
                  value={tempDate}
                  mode='date'
                  display='default'
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date('1900-01-01')}
                />
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Input
                value={profile?.email || ''}
                onChangeText={text => {
                  setProfile(prev => (prev ? { ...prev, email: text } : null));
                  debouncedSave({ email: text });
                }}
                placeholder='Enter email address'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            {/* Personalization Hub - Parent Container */}
            <View style={styles.personalizationHub}>
              <TouchableOpacity
                style={styles.hubHeader}
                activeOpacity={0.8}
                onPress={() => setPersonalizationHubExpanded(prev => !prev)}
              >
                <Text style={styles.hubTitle}>Personalization Hub</Text>
                {personalizationHubExpanded ? (
                  <ChevronUp size={24} color={Colors.text} />
                ) : (
                  <ChevronDown size={24} color={Colors.text} />
                )}
              </TouchableOpacity>

              {personalizationHubExpanded && (
                <View style={styles.hubContent}>
                  {/* Wearables Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          wearables: !prev.wearables,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          1. Wearables Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateWearablesProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateWearablesProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.wearables ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.wearables && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.comingSoonBanner}>
                          <View style={styles.comingSoonContent}>
                            <Clock size={16} color={Colors.textDisabled} />
                            <Text style={styles.comingSoonText}>
                              Coming Soon
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Exercise Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          exercise: !prev.exercise,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          2. Exercise Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateExerciseProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateExerciseProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.exercise ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.exercise && (
                      <View style={styles.trainingContainer}>
                        {trainingConfigLoading && (
                          <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>
                              Loading personalization hub...
                            </Text>
                          </View>
                        )}

                        <View style={styles.warningBanner}>
                          <View style={styles.warningContent}>
                            <ShieldAlert
                              size={32}
                              color='#923423'
                              strokeWidth={2.5}
                            />
                            <Text style={styles.warningText}>
                              Adjusting these settings will change your
                              workouts.
                            </Text>
                          </View>
                        </View>

                        {/* Biological Sex */}
                        <SectionCard>
                          <Text style={styles.label}>Biological Sex</Text>
                          <View style={styles.segmentedContainer}>
                            <TouchableOpacity
                              style={[
                                styles.segmentedButton,
                                (localBiologicalSex ??
                                  profile?.biological_sex ??
                                  'male') === 'male' &&
                                  styles.segmentedButtonSelected,
                              ]}
                              onPress={() => {
                                console.log('MALE BUTTON PRESSED');
                                setLocalBiologicalSex('male');
                                setProfile(prev =>
                                  prev
                                    ? { ...prev, biological_sex: 'male' }
                                    : null
                                );
                                autoSaveProfile({ biological_sex: 'male' });
                              }}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.segmentedText,
                                  (localBiologicalSex ??
                                    profile?.biological_sex ??
                                    'male') === 'male' &&
                                    styles.segmentedTextSelected,
                                ]}
                              >
                                Male
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.segmentedButton,
                                (localBiologicalSex ??
                                  profile?.biological_sex) === 'female' &&
                                  styles.segmentedButtonSelected,
                              ]}
                              onPress={() => {
                                console.log('FEMALE BUTTON PRESSED');
                                setLocalBiologicalSex('female');
                                setProfile(prev =>
                                  prev
                                    ? { ...prev, biological_sex: 'female' }
                                    : null
                                );
                                autoSaveProfile({ biological_sex: 'female' });
                              }}
                              activeOpacity={0.8}
                              pointerEvents='auto'
                            >
                              <Text
                                style={[
                                  styles.segmentedText,
                                  (localBiologicalSex ??
                                    profile?.biological_sex) === 'female' &&
                                    styles.segmentedTextSelected,
                                ]}
                              >
                                Female
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </SectionCard>

                        {/* Height */}
                        <SectionCard>
                          <Text style={styles.label}>Height</Text>
                          <Input
                            value={
                              profile?.height_cm != null
                                ? (isImperial
                                    ? cmToIn(profile.height_cm)
                                    : profile.height_cm
                                  ).toString()
                                : ''
                            }
                            onChangeText={text => {
                              const num = parseFloat(text);
                              const height_cm = isNaN(num)
                                ? null
                                : isImperial
                                  ? inToCm(num)
                                  : num;
                              setProfile(prev =>
                                prev ? { ...prev, height_cm } : null
                              );
                              debouncedSave({ height_cm });
                            }}
                            placeholder={`Enter height in ${getUnit('height')}`}
                            keyboardType='numeric'
                            maxLength={5}
                            measurement={getUnit('height')}
                          />
                        </SectionCard>

                        {/* Desired Body Type */}
                        <SectionCard>
                          <View style={styles.labelWithHelp}>
                            <Text style={styles.label}>Desired Body Type</Text>
                            <View
                              style={{
                                marginLeft: tooltipMetrics.label.spacing,
                                width: tooltipMetrics.label.iconSize,
                                height: tooltipMetrics.label.iconSize,
                              }}
                            >
                              <TooltipComponent
                                content={
                                  <View>
                                    <Text
                                      style={{
                                        ...Typography.h2,
                                        color: Colors.text,
                                        marginBottom: Space[3],
                                        textAlign: 'center',
                                      }}
                                    >
                                      Desired Body Type
                                    </Text>
                                    <Text
                                      style={{
                                        ...Typography.caption,
                                        color: Colors.textDisabled,
                                        lineHeight: 20,
                                      }}
                                    >
                                      We tailor exercise selection, training
                                      volume, and progression ramps to your
                                      target physique.
                                    </Text>
                                    <View
                                      style={{
                                        height: 1,
                                        backgroundColor: Colors.border,
                                        marginVertical: Space[2],
                                      }}
                                    />
                                    <Text
                                      style={{
                                        ...Typography.caption,
                                        color: Colors.textDisabled,
                                        lineHeight: 20,
                                      }}
                                    >
                                      Choosing a masculine or feminine emphasis
                                      helps bias muscles and movements that best
                                      match your goals.
                                    </Text>
                                  </View>
                                }
                                titleFontSize={Typography.bodyMedium.fontSize}
                                triggerSize={tooltipMetrics.label.iconSize}
                                triggerStyle={{
                                  width: '100%',
                                  height: '100%',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </View>
                          <View style={styles.segmentedContainer}>
                            <TouchableOpacity
                              style={[
                                styles.segmentedButton,
                                (localDesiredBodyType ??
                                  trainingConfig?.desired_body_type ??
                                  'masculine') === 'masculine' &&
                                  styles.segmentedButtonSelected,
                              ]}
                              onPress={() => {
                                setLocalDesiredBodyType('masculine');
                                updateTrainingConfig({
                                  desired_body_type: 'masculine',
                                });
                              }}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.segmentedText,
                                  (localDesiredBodyType ??
                                    trainingConfig?.desired_body_type ??
                                    'masculine') === 'masculine' &&
                                    styles.segmentedTextSelected,
                                ]}
                              >
                                Masculine
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.segmentedButton,
                                (localDesiredBodyType ??
                                  trainingConfig?.desired_body_type) ===
                                  'feminine' && styles.segmentedButtonSelected,
                              ]}
                              onPress={() => {
                                setLocalDesiredBodyType('feminine');
                                updateTrainingConfig({
                                  desired_body_type: 'feminine',
                                });
                              }}
                              activeOpacity={0.8}
                            >
                              <Text
                                style={[
                                  styles.segmentedText,
                                  (localDesiredBodyType ??
                                    trainingConfig?.desired_body_type) ===
                                    'feminine' && styles.segmentedTextSelected,
                                ]}
                              >
                                Feminine
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </SectionCard>

                        {/* Training Experience - 4 buttons */}
                        <SectionCard>
                          <Text style={styles.label}>Training Experience</Text>
                          <View style={styles.multiButtonRow}>
                            {experienceLevels.map(option => (
                              <TouchableOpacity
                                key={option.value}
                                style={[
                                  styles.multiButton,
                                  trainingConfig?.years_of_exercise_experience ===
                                    option.value && styles.multiButtonSelected,
                                ]}
                                onPress={() =>
                                  updateTrainingConfig({
                                    years_of_exercise_experience:
                                      option.value as any,
                                  })
                                }
                                activeOpacity={0.8}
                              >
                                <Text
                                  style={[
                                    styles.multiButtonText,
                                    trainingConfig?.years_of_exercise_experience ===
                                      option.value &&
                                      styles.multiButtonTextSelected,
                                  ]}
                                >
                                  {formatExperienceLabel(option.value as any)}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </SectionCard>

                        {/* Equipment Access - checkboxes */}
                        <SectionCard>
                          <Text style={styles.label}>Equipment Access</Text>
                          <View style={styles.checkboxGrid}>
                            {equipmentOptions.map(eq => {
                              const checked =
                                !!trainingConfig?.equipment_access?.find(
                                  i => i.value === eq.value
                                );
                              return (
                                <View
                                  key={eq.value}
                                  style={styles.checkboxItem}
                                >
                                  <Checkbox
                                    size={20}
                                    label={eq.label}
                                    checked={checked}
                                    onCheckChange={isChecked => {
                                      const currentEquipment =
                                        trainingConfig?.equipment_access || [];
                                      const next = new Map(
                                        currentEquipment.map(i => [i.value, i])
                                      );
                                      if (isChecked) {
                                        next.set(eq.value, {
                                          value: eq.value,
                                          label: eq.label,
                                        });
                                      } else {
                                        next.delete(eq.value);
                                      }
                                      updateTrainingConfig({
                                        equipment_access: Array.from(
                                          next.values()
                                        ),
                                      });
                                    }}
                                  />
                                </View>
                              );
                            })}
                          </View>
                        </SectionCard>

                        {/* Warm-up Sets Preference */}
                        <SectionCard>
                          <Toggle
                            label='Warm-Up Sets'
                            description='INCLUDE GUIDED RAMP-UP ON SETS BEFORE WORK SETS'
                            value={
                              trainingConfig?.warmup_sets_preference ?? true
                            }
                            onValueChange={value =>
                              updateTrainingConfig({
                                warmup_sets_preference: value,
                              })
                            }
                            variant='primary'
                          />
                        </SectionCard>

                        {/* Coaching Style */}
                        <SectionCard>
                          <View style={styles.labelWithHelp}>
                            <Text style={styles.label}>
                              Exercise Progression Ramp
                            </Text>
                            <View
                              style={{
                                marginLeft: tooltipMetrics.label.spacing,
                                width: tooltipMetrics.label.iconSize,
                                height: tooltipMetrics.label.iconSize,
                              }}
                            >
                              <TooltipComponent
                                content={
                                  <View>
                                    <Text
                                      style={{
                                        ...Typography.h2,
                                        color: Colors.text,
                                        marginBottom: Space[3],
                                        textAlign: 'center',
                                      }}
                                    >
                                      Exercise Progression Ramp
                                    </Text>
                                    <Text
                                      style={{
                                        ...Typography.caption,
                                        color: Colors.textDisabled,
                                        lineHeight: 20,
                                      }}
                                    >
                                      Sets how quickly your workouts increase in
                                      intensity over time. Lower values ramp
                                      gradually; higher values ramp more
                                      aggressively.
                                    </Text>
                                    <View
                                      style={{
                                        height: 1,
                                        backgroundColor: Colors.border,
                                        marginVertical: Space[2],
                                      }}
                                    />
                                    <Text
                                      style={{
                                        ...Typography.caption,
                                        color: Colors.textDisabled,
                                        lineHeight: 20,
                                      }}
                                    >
                                      Choose a setting that matches your
                                      recovery, schedule, and experience.
                                    </Text>
                                  </View>
                                }
                                titleFontSize={Typography.bodyMedium.fontSize}
                                triggerSize={tooltipMetrics.label.iconSize}
                                triggerStyle={{
                                  width: '100%',
                                  height: '100%',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </View>
                          <RangeSlider
                            min={0}
                            max={10}
                            step={1}
                            value={localCoachingStyle}
                            onValueChange={value => {
                              setLocalCoachingStyle(Math.round(value));
                            }}
                            onSlidingComplete={value => {
                              updateTrainingConfig({
                                coaching_style: Math.round(value),
                              });
                            }}
                            minLabel='Gradual'
                            maxLabel='Aggressive'
                          />
                        </SectionCard>

                        {/* Injury Flags */}
                        <SectionCard title='Injury Flags'>
                          <MultiSelectDropdown
                            data={injuryLocations}
                            selectedValues={
                              trainingConfig?.injury_flags?.tags || []
                            }
                            onChange={items =>
                              updateTrainingConfig({
                                injury_flags: {
                                  ...(trainingConfig?.injury_flags || {
                                    tags: [],
                                    notes: '',
                                  }),
                                  tags: items,
                                },
                              })
                            }
                            placeholder='Select injury tags'
                          />
                          <Input
                            placeholder='Add notes (optional)'
                            value={localInjuryNotes}
                            onChangeText={setLocalInjuryNotes}
                            onBlur={() => {
                              // Save to database only when user finishes editing
                              updateTrainingConfig({
                                injury_flags: {
                                  ...(trainingConfig?.injury_flags || {
                                    tags: [],
                                    notes: '',
                                  }),
                                  notes: localInjuryNotes,
                                },
                              });
                            }}
                          />
                        </SectionCard>

                        {/* Exercise Blacklist */}
                        <SectionCard title='Exercise Blacklist'>
                          <MultiSelectDropdown
                            data={placeholderExercises}
                            selectedValues={
                              trainingConfig?.exercise_blacklist || []
                            }
                            onChange={items =>
                              updateTrainingConfig({
                                exercise_blacklist: items,
                              })
                            }
                            placeholder='Choose exercises to avoid'
                          />
                        </SectionCard>

                        {/* Exercise Favorites */}
                        <SectionCard title='Exercise Favorites'>
                          <MultiSelectDropdown
                            data={placeholderExercises}
                            selectedValues={
                              trainingConfig?.exercise_favorites || []
                            }
                            onChange={items =>
                              updateTrainingConfig({
                                exercise_favorites: items,
                              })
                            }
                            placeholder='Choose favorite exercises'
                          />
                        </SectionCard>

                        {/* Optional: General settings moved under Personalization Hub */}
                        <SectionCard>
                          <Text style={styles.label}>Weight</Text>
                          <Input
                            value={
                              profile?.weight_kg != null
                                ? (isImperial
                                    ? kgToLbs(profile.weight_kg)
                                    : profile.weight_kg
                                  ).toString()
                                : ''
                            }
                            onChangeText={text => {
                              const num = parseFloat(text);
                              const weight_kg = isNaN(num)
                                ? null
                                : isImperial
                                  ? lbsToKg(num)
                                  : num;
                              setProfile(prev =>
                                prev ? { ...prev, weight_kg } : null
                              );
                              debouncedSave({ weight_kg });
                            }}
                            placeholder={`Enter weight in ${getUnit('weight')}`}
                            keyboardType='numeric'
                            maxLength={6}
                            measurement={getUnit('weight')}
                          />
                        </SectionCard>

                        <SectionCard>
                          <Text style={styles.label}>Timezone</Text>
                          <Input
                            value={profile?.timezone || 'UTC'}
                            onChangeText={text => {
                              setProfile(prev =>
                                prev ? { ...prev, timezone: text } : null
                              );
                              debouncedSave({ timezone: text });
                            }}
                            placeholder='Enter timezone'
                          />
                        </SectionCard>

                        <SectionCard>
                          <Text style={styles.label}>Measurement Units</Text>
                          <MeasurementsToggle />
                        </SectionCard>
                      </View>
                    )}
                  </View>

                  {/* Diet & Supplements Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          diet: !prev.diet,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          3. Diet, Supplements Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateDietProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateDietProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.diet ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.diet && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.warningBanner}>
                          <Text style={styles.warningText}>
                            Coming soon - Nutrition and supplement
                            configuration.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Sleep & Recovery Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          sleep: !prev.sleep,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          4. Sleep & Recovery Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateSleepProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateSleepProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.sleep ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.sleep && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.warningBanner}>
                          <Text style={styles.warningText}>
                            Coming soon - Sleep optimization and recovery
                            protocols.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Prescriptions Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          prescriptions: !prev.prescriptions,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          5. Prescriptions Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                {
                                  width: `${calculatePrescriptionsProgress()}%`,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculatePrescriptionsProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.prescriptions ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.prescriptions && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.warningBanner}>
                          <Text style={styles.warningText}>
                            Coming soon - Prescription management and tracking.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Therapies Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          therapies: !prev.therapies,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          6. Therapies Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateTherapiesProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateTherapiesProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.therapies ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.therapies && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.warningBanner}>
                          <Text style={styles.warningText}>
                            Coming soon - Physical therapy and recovery
                            modalities.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Dermatology Setup */}
                  <View style={styles.onboardingCard}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      activeOpacity={0.8}
                      onPress={() =>
                        setExpandedSections(prev => ({
                          ...prev,
                          dermatology: !prev.dermatology,
                        }))
                      }
                    >
                      <View style={styles.headerContent}>
                        <Text style={styles.sectionTitle}>
                          7. Dermatology Setup
                        </Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBarBg}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${calculateDermatologyProgress()}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {calculateDermatologyProgress()}%
                          </Text>
                        </View>
                      </View>
                      {expandedSections.dermatology ? (
                        <ChevronUp size={20} color={Colors.text} />
                      ) : (
                        <ChevronDown size={20} color={Colors.text} />
                      )}
                    </TouchableOpacity>

                    {expandedSections.dermatology && (
                      <View style={styles.trainingContainer}>
                        <View style={styles.warningBanner}>
                          <Text style={styles.warningText}>
                            Coming soon - Skincare protocols and dermatological
                            treatments.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Delete Account CTA */}
            <View style={styles.deleteCtaContainer}>
              <Button
                variant='ghost'
                size='large'
                onPress={() => setShowDeleteAccount(true)}
                fullWidth
                style={{
                  backgroundColor: Colors.background,
                  borderColor: Colors.text,
                  borderWidth: 1,
                }}
              >
                Delete Account
              </Button>
            </View>

            {/* Auto-save indicator */}
            {saving && (
              <View style={styles.savingIndicator}>
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DeleteAccount
        isVisible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Space[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space[6],
    marginTop: Space[2],
    gap: Space[3],
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  form: {
    paddingHorizontal: Space[6],
    gap: Space[2],
  },
  inputGroup: {
    gap: Space[2],
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space[4],
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    height: 40,
  },
  dateButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  sectionHeader: {
    paddingVertical: Space[4],
    paddingHorizontal: Space[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
    marginRight: Space[3],
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Space[2],
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#DFDFDF', // Progress track - exact from screenshot
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D8833B', // Progress fill - exact from screenshot
    borderRadius: BorderRadius.full,
  },
  progressText: {
    ...Typography.caption,
    color: '#B3B1B0', // "75%" label - exact from screenshot
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  trainingContainer: {
    gap: Space[3],
    paddingTop: Space[2],
    paddingHorizontal: Space[2],
    paddingBottom: Space[3],
  },
  personalizationHub: {
    marginTop: Space[6],
    backgroundColor: '#E6E6E6', // Header/outer rail background - exact from screenshot
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    ...Shadows.md,
  },
  hubHeader: {
    paddingVertical: Space[5],
    paddingHorizontal: Space[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  hubTitle: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  hubContent: {
    padding: Space[4],
    gap: Space[4],
  },
  onboardingCard: {
    backgroundColor: '#EFEDED', // Card background - exact from screenshot
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#DFDFDF', // Light border/rails - exact from screenshot
    overflow: 'hidden',
    marginHorizontal: Space[2],
    marginBottom: Space[3],
    ...Shadows.sm,
  },
  warningBanner: {
    backgroundColor: '#E5C3BC', // Warning banner background - exact from screenshot
    borderWidth: 0, // Remove border for cleaner look like first attachment
    padding: Space[5], // More padding like first attachment
    borderRadius: BorderRadius.xl, // Larger border radius like first attachment
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[3], // More gap between icon and text
  },
  comingSoonBanner: {
    backgroundColor: '#EFEDED', // Same as card background
    borderWidth: 1,
    borderColor: '#DFDFDF', // Light border/rails
    padding: Space[3],
    borderRadius: BorderRadius.md,
  },
  comingSoonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  comingSoonText: {
    ...Typography.caption,
    color: '#8F8E8C', // Secondary text/placeholders - exact from screenshot
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 11, // Further reduced by 25% (14 * 0.75 = 10.5, rounded to 11)
    color: '#923423', // Warning icon/text dark tone - exact from screenshot
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 77, 79, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
    padding: Space[3],
    borderRadius: 8,
    marginBottom: Space[2],
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 999,
    padding: 3,
    gap: 4, // Add gap instead of margin on buttons
    backgroundColor: '#EFEDED', // Light background for the track
    position: 'relative',
  },
  segmentedButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  segmentedButtonSelected: {
    backgroundColor: '#D8833B', // Orange slider background
  },
  segmentedText: {
    ...Typography.body,
    color: '#8F8E8C', // Unselected pill text - exact from screenshot
    fontWeight: '600',
    zIndex: 3,
  },
  segmentedTextSelected: {
    ...Typography.bodyBold,
    color: '#FFFFFF', // Selected pill text - exact from screenshot
    fontWeight: '700',
    zIndex: 3,
  },
  labelWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[1],
  },
  multiButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Space[2],
    paddingVertical: Space[2],
  },
  multiButton: {
    width: '30%', // For 2x3 grid layout
    height: 40,
    borderWidth: 2,
    borderColor: '#DFDFDF', // Light border for unselected chips
    borderRadius: 999, // Fully rounded like in screenshot
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3E1E1', // Unselected chip background - exact from screenshot
    marginBottom: Space[2],
  },
  multiButtonSelected: {
    backgroundColor: '#EFEDED', // Selected chip background (interior) - exact from screenshot
    borderColor: '#D8833B', // Selected chip outline accent - exact from screenshot
  },
  multiButtonText: {
    color: '#8F8E8C', // Unselected chip text - exact from screenshot
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  multiButtonTextSelected: {
    color: '#5C5A58', // Selected chip text - exact from screenshot
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '700',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Space[1],
  },
  checkboxItem: {
    width: '48%',
    marginBottom: Space[2],
  },
  deleteCtaContainer: {
    paddingHorizontal: Space[6],
    paddingVertical: Space[4],
  },
  savingIndicator: {
    paddingHorizontal: Space[6],
    paddingVertical: Space[2],
    alignItems: 'center',
  },
  savingText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  datePicker: {
    backgroundColor: Colors.background,
  },
});
