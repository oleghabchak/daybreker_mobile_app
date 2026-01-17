import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Asterisk, Calendar, MoveHorizontal } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Space, Typography } from '../../constants/theme';
import {
  UnitsPreference,
  biologicalSexOptions,
  desiredBodyTypeOptions,
  equipmentOptions,
  experienceLevels,
  injuryLocations,
  jointHypermobilityOptions,
  unitsPreferences,
  warmupSetsOptions,
} from '../../enums/mesocycle.enums';
import { useAppStore } from '../../models/AppStore';
import { Dropdown, Input, RangeSlider } from '../ui';

interface FormData {
  unitsPreference: string;
  biologicalSex: string;
  desiredBodyType: string;
  years_of_exercise_experience: string;
  dateOfBirth: string;
  height_cm: string;
  equipment: string;
  warmupSets: boolean;
  injuryFlags: string;
  jointHypermobility: boolean | null;
  exerciseBlacklist: string;
  exerciseFavorites: string;
  coachingStyle: number;
}

interface CreateMesocycleIntakeProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const PersistentProfile: React.FC<CreateMesocycleIntakeProps> = ({
  isVisible = false,
  onClose = () => {},
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [formModified, setFormModified] = useState(false);
  const { setShowPersistentProfile } = useAppStore();

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      unitsPreference: '',
      biologicalSex: '',
      desiredBodyType: '',
      years_of_exercise_experience: '',
      dateOfBirth: '',
      height_cm: '',
      equipment: '',
      warmupSets: false,
      injuryFlags: '',
      jointHypermobility: null,
      exerciseBlacklist: '',
      exerciseFavorites: '',
      coachingStyle: 5,
    },
    mode: 'onChange',
  });

  // Load profile data when component mounts or becomes visible
  React.useEffect(() => {}, [isVisible]);

  // Watch for form changes to mark as modified
  React.useEffect(() => {
    if (profileLoaded) {
      const subscription = watch((value, { name }) => {
        if (name) {
          setFormModified(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, profileLoaded]);

  // Watch form values for dynamic validation
  const watchedValues = watch();

  // Variables
  const snapPoints = useMemo(() => ['90%'], []);

  // Callbacks
  const handlePresentModalPress = useCallback(() => {
    try {
      bottomSheetModalRef.current?.present();
    } catch (error) {
      console.error('Error presenting bottom sheet:', error);
      onClose();
    }
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    try {
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error dismissing bottom sheet:', error);
    } finally {
      onClose();
    }
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Show modal when isVisible changes
  React.useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        handlePresentModalPress();
      }, 100);
    } else {
      handleDismiss();
    }
  }, [isVisible, handlePresentModalPress, handleDismiss]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Persistent Profile Intake Form</Text>
          <Text style={styles.subtitle}>
            Complete your profile to get personalized training
          </Text>
          {isLoadingProfile && (
            <Text style={styles.loadingText}>Loading your profile...</Text>
          )}
          {profileLoaded && (
            <Text style={styles.successText}>
              Profile loaded successfully!
              {formModified && (
                <Text style={styles.modifiedText}>
                  {' '}
                  • Form has unsaved changes
                </Text>
              )}
            </Text>
          )}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
          </View>
        </View>

        {/* Basic Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Profile</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Which units do you use?
              <Asterisk
                size={16}
                color={errors.unitsPreference ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='unitsPreference'
              rules={{ required: 'Units preference is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={unitsPreferences}
                    onChange={onChange}
                    placeholder='Select units'
                    selectedValue={
                      unitsPreferences.filter(
                        option => option?.value === value
                      )?.[0]
                    }
                  />
                  {errors.unitsPreference && (
                    <Text style={styles.errorText}>
                      {errors.unitsPreference.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              What sex were you assigned at birth?
              <Asterisk
                size={16}
                color={errors.biologicalSex ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='biologicalSex'
              rules={{ required: 'Biological sex is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={biologicalSexOptions}
                    onChange={onChange}
                    placeholder='Select sex'
                    selectedValue={
                      biologicalSexOptions.filter(
                        option => option?.value === value
                      )?.[0]
                    }
                  />
                  {errors.biologicalSex && (
                    <Text style={styles.errorText}>
                      {errors.biologicalSex.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Which aesthetic are you targeting?
              <Asterisk
                size={16}
                color={errors.desiredBodyType ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='desiredBodyType'
              rules={{ required: 'Desired body type is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={desiredBodyTypeOptions}
                    onChange={onChange}
                    placeholder='Select body type'
                    selectedValue={
                      desiredBodyTypeOptions.filter(
                        option => option?.value === value
                      )?.[0]
                    }
                  />
                  {errors.desiredBodyType && (
                    <Text style={styles.errorText}>
                      {errors.desiredBodyType.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              How long have you exercised consistently?
              <Asterisk
                size={16}
                color={
                  errors.years_of_exercise_experience
                    ? Colors.error
                    : Colors.text
                }
              />
            </Text>
            <Controller
              control={control}
              name='years_of_exercise_experience'
              rules={{ required: 'Exercise experience is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={experienceLevels}
                    onChange={onChange}
                    placeholder='Select experience level'
                    selectedValue={
                      experienceLevels.filter(
                        option => option?.value === value
                      )?.[0]
                    }
                  />
                  {errors.years_of_exercise_experience && (
                    <Text style={styles.errorText}>
                      {errors.years_of_exercise_experience.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Your age?
              <Asterisk
                size={16}
                color={errors.dateOfBirth ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='dateOfBirth'
              rules={{ required: 'Date of birth is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      // Show the date picker
                      setTempDate(value ? new Date(value) : new Date());
                      setShowDatePicker(true);
                    }}
                  >
                    <Calendar size={20} color={Colors.textDisabled} />
                    <DateTimePicker
                      value={tempDate}
                      mode='date'
                      display='default'
                      onChange={(event, selectedDate) => {
                        if (event.type === 'dismissed') {
                          setShowDatePicker(false);
                        } else if (selectedDate) {
                          setTempDate(selectedDate);
                          const formattedDate = selectedDate
                            .toISOString()
                            .split('T')[0];
                          onChange(formattedDate);
                          setShowDatePicker(false);
                        }
                      }}
                      maximumDate={new Date()}
                      minimumDate={new Date('1900-01-01')}
                    />
                  </TouchableOpacity>

                  {}

                  {errors.dateOfBirth && (
                    <Text style={styles.errorText}>
                      {errors.dateOfBirth.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Your height?
              <Asterisk
                size={16}
                color={errors.height_cm ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='height_cm'
              rules={{ required: 'Height is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Input
                    placeholder={
                      watchedValues.unitsPreference === UnitsPreference.METRIC
                        ? 'cm'
                        : 'ft-in'
                    }
                    value={value}
                    onChangeText={onChange}
                    error={errors.height_cm?.message}
                  />
                </>
              )}
            />
          </View>
        </View>

        {/* Training Setup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Setup</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              What equipment do you have access to?
              <Asterisk
                size={16}
                color={errors.equipment ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='equipment'
              rules={{ required: 'Equipment access is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={equipmentOptions}
                    onChange={onChange}
                    placeholder='Select equipment'
                    selectedValue={
                      equipmentOptions.filter(
                        option => option?.value === value
                      )?.[0]
                    }
                  />
                  {errors.equipment && (
                    <Text style={styles.errorText}>
                      {errors.equipment.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Include warmup sets?</Text>
            <Controller
              control={control}
              name='warmupSets'
              render={({ field: { value, onChange } }) => (
                <Dropdown
                  data={warmupSetsOptions}
                  onChange={onChange}
                  placeholder='Select preference'
                  selectedValue={
                    value ? warmupSetsOptions[0] : warmupSetsOptions[1]
                  }
                />
              )}
            />
          </View>
        </View>

        {/* Health & Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health & Preferences</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Any chronic injuries/surgeries?</Text>
            <Controller
              control={control}
              name='injuryFlags'
              render={({ field: { value, onChange } }) => (
                <Dropdown
                  data={injuryLocations}
                  onChange={onChange}
                  placeholder='Select injury location'
                  selectedValue={
                    injuryLocations.filter(
                      option => option?.value === value
                    )?.[0]
                  }
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Do you have joint hypermobility?</Text>
            <Text style={styles.label}>
              If unsure what this is, don&apos;t answer.
            </Text>
            <Controller
              control={control}
              name='jointHypermobility'
              render={({ field: { value, onChange } }) => (
                <Dropdown
                  data={jointHypermobilityOptions}
                  onChange={onChange}
                  placeholder='Select option'
                  selectedValue={
                    value
                      ? jointHypermobilityOptions[0]
                      : jointHypermobilityOptions[1]
                  }
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Exercises you want to avoid?</Text>
            <Controller
              control={control}
              name='exerciseBlacklist'
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder='Exercises to avoid (comma separated)'
                  value={value}
                  onChangeText={onChange}
                  error={errors.exerciseBlacklist?.message}
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Exercises you love?s</Text>
            <Controller
              control={control}
              name='exerciseFavorites'
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder='Exercises you love (comma separated)'
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              How aggressive should coaching progress be?
              <Asterisk
                size={16}
                color={errors.coachingStyle ? Colors.error : Colors.text}
              />
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Conservative (0)</Text>
              <MoveHorizontal size={24} color={Colors.text} />
              <Text style={styles.sliderLabel}>Aggressive (10)</Text>
            </View>
            <Controller
              control={control}
              name='coachingStyle'
              rules={{ required: 'Coaching style is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <RangeSlider
                    min={0}
                    max={10}
                    value={value}
                    onValueChange={onChange}
                    step={1}
                    showValue={true}
                    error={errors.coachingStyle?.message}
                  />
                  {errors.coachingStyle && (
                    <Text style={styles.errorText}>
                      {errors.coachingStyle.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        </View>
        {submitError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                // formModified && styles.saveButtonActive,
              ]}
              onPress={handleSubmit(async data => {
                try {
                  setIsSubmitting(true);
                  setSubmitError(null);

                  // Transform form data to match profiles table structure
                  const profileData = {
                    units_preference:
                      data.unitsPreference?.value ||
                      data.unitsPreference ||
                      'metric',
                    biological_sex:
                      data.biologicalSex?.value || data.biologicalSex || 'male',
                    desired_body_type:
                      data.desiredBodyType?.value ||
                      data.desiredBodyType ||
                      'masculine',
                    years_of_exercise_experience:
                      data.years_of_exercise_experience?.value,
                    date_of_birth: data.dateOfBirth
                      ? new Date(data.dateOfBirth).toISOString()
                      : new Date('1990-01-01').toISOString(),
                    height_cm: parseFloat(data.height_cm) || 170,
                    equipment: data.equipment
                      ? [data.equipment?.value || data.equipment]
                      : ['barbell'],
                    warmup_sets:
                      data.warmupSets?.value || data.warmupSets || false,
                    injury_flags: data.injuryFlags
                      ? [data.injuryFlags?.value || data.injuryFlags]
                      : [],
                    joint_hypermobility:
                      data.jointHypermobility?.value ||
                      data.jointHypermobility ||
                      false,
                    exercise_blacklist: data.exerciseBlacklist
                      ? data.exerciseBlacklist
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s)
                      : [],
                    exercise_favorites: data.exerciseFavorites
                      ? data.exerciseFavorites
                          .split(',')
                          .map(s => s.trim())
                          .filter(s => s)
                      : [],
                    coaching_style: data.coachingStyle || 5,
                  };

                  const result =
                    await ProfileService.updateProfile(profileData);
                  if (result.success) {
                    console.log('Profile saved successfully:', result.data);
                    setFormModified(false);
                    setSubmitError(null);
                    setShowPersistentProfile(false);
                  } else {
                    setSubmitError(result.error || 'Failed to save profile');
                  }
                } catch (error) {
                  console.error('Error saving profile:', error);
                  setSubmitError('An unexpected error occurred');
                } finally {
                  setIsSubmitting(false);
                }
              })}
              disabled={!formModified || isSubmitting}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.background,
  },
  indicator: {
    backgroundColor: Colors.border,
  },
  contentContainer: {
    flex: 1,
    padding: Space[4],
  },
  header: {
    alignItems: 'center',
    marginBottom: Space[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Space[1],
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Space[2],
  },
  headerButton: {
    paddingVertical: Space[1],
    paddingHorizontal: Space[2],
    backgroundColor: Colors.surface,
    borderRadius: Space[1],
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  headerButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.primary,
  },
  clearButton: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  clearButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.error,
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  successText: {
    ...Typography.bodyMedium,
    color: Colors.success,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  modifiedText: {
    color: Colors.warning,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: Space[3],
    width: '100%',
  },
  progressText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[1],
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Space[1],
    fontSize: 12,
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
  field: {
    marginBottom: Space[3],
  },
  label: {
    ...Typography.bodyMedium,
    fontWeight: '500',
    color: Colors.text,
    marginVertical: Space[2],
  },
  sliderLabel: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  dropdownContainer: {
    marginBottom: Space[2],
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: Space[4],
    marginBottom: Space[6],
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Space[3],
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Adjust width for two buttons
  },
  saveButtonActive: {
    backgroundColor: Colors.textDisabled,
  },
  saveButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.background,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Space[3],
    paddingHorizontal: Space[6],
    borderRadius: Space[3],
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Adjust width for two buttons
  },
  submitButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: Colors.background,
  },
  requiredNote: {
    ...Typography.bodySmall,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: Space[2],
  },
  submitButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  submitButtonTextDisabled: {
    color: Colors.textDisabled,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: Colors.error,
    padding: Space[3],
    borderRadius: Space[2],
    marginBottom: Space[4],
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Space[1],
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space[3],
    borderRadius: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    justifyContent: 'flex-start',
  },
  dateText: {
    marginLeft: Space[2],
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -11,
    justifyContent: 'center',
    gap: Space[2],
    marginBottom: Space[2],
  },
  sliderLabel: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[2],
  },
  debugButton: {
    borderColor: Colors.info,
    borderWidth: 1,
  },
  debugButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.info,
  },
});
