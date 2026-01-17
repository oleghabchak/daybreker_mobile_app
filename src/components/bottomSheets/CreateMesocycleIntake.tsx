import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Asterisk, Calendar } from 'lucide-react-native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  injuryLocations,
  mesocycleGoalOptions,
  mesocycleStatusOptions,
  muscleEmphasisOptions,
  splitTypeOptions,
} from '../../enums/mesocycle.enums';
import { useAuthStore } from '../../models/AuthenticationStore';
import { MesocycleFormDataTypes } from '../../types/mesocycle_types';
import { TooltipComponent, getTooltipMetrics } from '../common/TooltipComponent';
import { Dropdown, Input, MultiSelectDropdown, RangeSlider } from '../ui';

interface CreateMesocycleIntakeProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const CreateMesocycleIntake: React.FC<CreateMesocycleIntakeProps> = ({
  isVisible = false,
  onClose = () => {},
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, profile, allProfiles, loadAllProfiles, loadProfile } =
    useAuthStore();
  const userId = user?.app_metadata.id;
  const isAdmin = profile?.is_admin;

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [mesocycleLoaded, setMesocycleLoaded] = useState(false);
  const [formModified, setFormModified] = useState(false);
  const [allProfilesData, setAllProfilesData] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>({
    value: user?.id,
    label: user?.email,
  });

  useEffect(() => {
    setSelectedProfile({
      value: user?.id,
      label: user?.email,
    });
  }, [user]);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MesocycleFormDataTypes>({
    defaultValues: {
      name: '',
      days_per_week: 2,
      length_weeks: 4,
      minutes_per_session: 75,
      split_type: [],
      exercise_variation: 5,
      joint_pain_now: [],
      muscle_emphasis: [],
      goal: '',
      status: '',
      start_date: new Date().toISOString().split('T')[0],
      weight_now: 0,
    },
    mode: 'onChange',
  });

  // Load profile data when component mounts or becomes visible
  useEffect(() => {
    loadProfile();
    loadAllProfiles();
  }, []);

  useEffect(() => {
    if (allProfiles) {
      setAllProfilesData(
        allProfiles.map(profile => ({
          value: profile.user_id,
          label: profile.email,
        }))
      );
    }
  }, [allProfiles]);

  // Watch for form changes to mark as modified
  React.useEffect(() => {
    if (mesocycleLoaded) {
      const subscription = watch((value, { name }) => {
        if (name) {
          setFormModified(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, mesocycleLoaded]);

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

  const tooltipMetrics = getTooltipMetrics(Typography.bodyMedium.fontSize);

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
          <Text style={styles.title}>Mesocycle Intake Form</Text>
          {!isAdmin && (
            <Text style={styles.subtitle}>
              Complete your mesocycle to get personalized training
            </Text>
          )}
          {isLoadingProfile && (
            <Text style={styles.loadingText}>Loading your mesocycle...</Text>
          )}
          {mesocycleLoaded && (
            <Text style={styles.successText}>
              Mesocycle loaded successfully!
              {formModified && (
                <Text style={styles.modifiedText}>
                  {' '}
                  • Form has unsaved changes
                </Text>
              )}
            </Text>
          )}
          {/* <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} /> //TODO:  add later
            </View>
          </View> */}
        </View>

        {/* Mesocycle Section */}
        <View style={styles.section}>
          {isAdmin && (
            <Dropdown
              data={allProfilesData}
              onChange={selectedItem => {
                console.log('selectedItem:', selectedItem);
                // onChange(values);
                setSelectedProfile(selectedItem);
              }}
              placeholder='Select user to edit form for:'
              selectedValue={selectedProfile}
            />
          )}
          <Text style={styles.sectionTitle}>Training Parameters</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Mesocycle Name
              <Asterisk
                size={16}
                color={errors.name ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='name'
              rules={{
                required: 'Mesocycle name is required',
                minLength: {
                  value: 3,
                  message: 'Name must be at least 3 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters',
                },
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Input
                    placeholder='Enter mesocycle name frf'
                    value={value}
                    onChangeText={onChange}
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { marginBottom: Space[4] }]}>
              How many days a week will you train?
              <Asterisk
                size={16}
                color={errors.days_per_week ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='days_per_week'
              rules={{
                required: 'Training days per week is required',
                min: { value: 2, message: 'Minimum 2 days required' },
                max: { value: 6, message: 'Maximum 6 days allowed' },
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <RangeSlider
                    min={2}
                    max={6}
                    value={value}
                    onValueChange={onChange}
                    step={1}
                    showValue={true}
                  />
                  {errors.days_per_week && (
                    <Text style={styles.errorText}>
                      {errors.days_per_week.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <View style={[styles.labelRow, { marginBottom: Space[1] }]}>
              <Text style={styles.label}>
                How many weeks will you train (including deload)?
                <Asterisk
                  size={16}
                  color={errors.length_weeks ? Colors.error : Colors.text}
                />
              </Text>
              <View style={{ marginLeft: 8 }}>
                <TooltipComponent
                  content={
                    <View>
                      <Text style={{ ...Typography.h2, color: Colors.text, marginBottom: Space[3], textAlign: 'center' }}>Mesocycle Length Tips</Text>
                      <View style={{ marginBottom: Space[3] }}>
                        <Text
                          style={{
                            ...Typography.caption,
                            color: Colors.textDisabled,
                            lineHeight: 20,
                          }}
                        >
                          Shorter mesocycles (4–5 weeks) let you switch goals
                          more often and see quick progress. Great for beginners
                          or when trying something new.
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: Colors.border,
                          marginBottom: Space[3],
                        }}
                      />
                      <View style={{ marginBottom: Space[2] }}>
                        <Text
                          style={{
                            ...Typography.caption,
                            color: Colors.textDisabled,
                            lineHeight: 20,
                          }}
                        >
                          Longer mesocycles (6–8 weeks) give your body more time
                          to adapt and build deeper changes. Better for
                          experienced lifters working on specific goals.
                        </Text>
                      </View>
                      <View
                        style={{
                          paddingTop: Space[2],
                          borderTopWidth: 1,
                          borderTopColor: Colors.border,
                        }}
                      >
                        <Text
                          style={{
                            ...Typography.bodyMedium,
                            color: Colors.text,
                          }}
                        >
                          <Text
                            style={{
                              ...Typography.bodyMedium,
                              fontWeight: '700',
                              color: Colors.text,
                            }}
                          >
                            Not sure?
                          </Text>
                          Start with 4 weeks. It&apos;s enough time to see
                          results but short enough to stay motivated and adjust
                          if needed.
                        </Text>
                      </View>
                    </View>
                  }
                  titleFontSize={Typography.bodyMedium.fontSize}
                  triggerSize={tooltipMetrics.iconSize}
                  triggerStyle={{
                    width: tooltipMetrics.iconSize,
                    height: tooltipMetrics.iconSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              </View>
            </View>
            <Text style={styles.helperText}>Default is 4 weeks.</Text>
            <Controller
              control={control}
              name='length_weeks'
              rules={{
                required: 'Cycle length is required',
                min: { value: 4, message: 'Minimum 4 weeks required' },
                max: { value: 10, message: 'Maximum 10 weeks allowed' },
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <RangeSlider
                    min={4}
                    max={10}
                    value={value || 5}
                    onValueChange={onChange}
                    step={1}
                    showValue={true}
                  />
                  {errors.length_weeks && (
                    <Text style={styles.errorText}>
                      {errors.length_weeks.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { marginBottom: Space[4] }]}>
              Session length this block?
              <Asterisk
                size={16}
                color={errors.minutes_per_session ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='minutes_per_session'
              rules={{
                required: 'Session duration is required',
                min: { value: 30, message: 'Minimum 30 minutes required' },
                max: { value: 120, message: 'Maximum 120 minutes allowed' },
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <RangeSlider
                    min={30}
                    max={120}
                    value={value || 75}
                    onValueChange={onChange}
                    step={5}
                    showValue={true}
                  />
                  {errors.minutes_per_session && (
                    <Text style={styles.errorText}>
                      {errors.minutes_per_session.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Mesocycle start date?
              <Asterisk
                size={16}
                color={errors.start_date ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='start_date'
              rules={{ required: 'Start date is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      // Show the date picker
                      setTempDate(value ? new Date(value) : new Date());
                    }}
                  >
                    <Calendar size={20} color={Colors.textDisabled} />
                    <DateTimePicker
                      value={tempDate}
                      mode='date'
                      display='default'
                      onChange={(event, selectedDate) => {
                        if (event.type === 'dismissed') {
                        } else if (selectedDate) {
                          setTempDate(selectedDate);
                          const formattedDate = selectedDate
                            .toISOString()
                            .split('T')[0];
                          onChange(formattedDate);
                        }
                      }}
                      maximumDate={(() => {
                        const today = new Date();
                        today.setDate(today.getDate() + 30);
                        return today;
                      })()}
                      minimumDate={(() => {
                        const today = new Date();
                        today.setDate(today.getDate() - 30);
                        return today;
                      })()}
                    />
                  </TouchableOpacity>
                  {errors.start_date && (
                    <Text style={styles.errorText}>
                      {errors.start_date.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>
              Preferred split style?
              <Asterisk
                size={16}
                color={errors.split_type ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='split_type'
              rules={{ required: 'Split type is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <MultiSelectDropdown
                    data={splitTypeOptions}
                    onChange={selectedItems => {
                      const values = selectedItems.map(item => item.value);
                      onChange(values);
                    }}
                    maxSelections={3}
                    placeholder='Select split style'
                    selectedValues={splitTypeOptions.filter(item =>
                      value?.includes(item.value)
                    )}
                  />
                  {errors.split_type && (
                    <Text style={styles.errorText}>
                      {errors.split_type.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { marginBottom: Space[4] }]}>
              Keep exercises stable week-to-week (best results) or add exercise
              variety to keep workouts fresh?
              <Asterisk
                size={16}
                color={errors.exercise_variation ? Colors.error : Colors.text}
              />
            </Text>
            <View style={styles.variationLabels}>
              <Text style={styles.variationLabel}>No variety</Text>
              <Text style={styles.variationLabel}>Most variety</Text>
            </View>
            <Controller
              control={control}
              name='exercise_variation'
              rules={{
                required: 'Exercise variation preference is required',
                min: { value: 0, message: 'Minimum 0 required' },
                max: { value: 10, message: 'Maximum 10 allowed' },
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <RangeSlider
                    min={0}
                    max={10}
                    value={value || 5}
                    onValueChange={onChange}
                    step={1}
                    showValue={true}
                  />
                  {errors.exercise_variation && (
                    <Text style={styles.errorText}>
                      {errors.exercise_variation.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Any nagging joint pain?
              <Asterisk
                size={16}
                color={errors.joint_pain_now ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='joint_pain_now'
              rules={{ required: 'Joint pain selection is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <MultiSelectDropdown
                    data={injuryLocations}
                    onChange={selectedItems => {
                      const values = selectedItems.map(item => item.value);
                      onChange(values);
                    }}
                    maxSelections={3}
                    placeholder='Select affected joints'
                    selectedValues={injuryLocations.filter(item =>
                      value?.includes(item.value)
                    )}
                  />
                  {errors.joint_pain_now && (
                    <Text style={styles.errorText}>
                      {errors.joint_pain_now.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Top 3 muscle groups to spotlight? In order of priority!
              <Asterisk
                size={16}
                color={errors.muscle_emphasis ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='muscle_emphasis'
              rules={{ required: 'Muscle group emphasis is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <MultiSelectDropdown
                    data={muscleEmphasisOptions}
                    onChange={selectedItems => {
                      const values = selectedItems.map(item => item.value);
                      onChange(values);
                    }}
                    maxSelections={3}
                    placeholder='Select top 3 muscle groups (in priority order)'
                    selectedValues={muscleEmphasisOptions.filter(item =>
                      value?.includes(item.value)
                    )}
                  />
                  {errors.muscle_emphasis && (
                    <Text style={styles.errorText}>
                      {errors.muscle_emphasis.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Mesocycle goal?
              <Asterisk
                size={16}
                color={errors.goal ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='goal'
              rules={{ required: 'Mesocycle goal is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={mesocycleGoalOptions}
                    onChange={item => {
                      const values = item.value;
                      onChange(values);
                    }}
                    placeholder='Select mesocycle goal'
                    selectedValue={
                      mesocycleGoalOptions.filter(
                        item => item.value === value
                      )?.[0]
                    }
                  />
                  {errors.goal && (
                    <Text style={styles.errorText}>{errors.goal.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Mesocycle status?
              <Asterisk
                size={16}
                color={errors.status ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='status'
              rules={{ required: 'Mesocycle status is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Dropdown
                    data={mesocycleStatusOptions}
                    onChange={item => {
                      const values = item.value;
                      onChange(values);
                    }}
                    placeholder='Select mesocycle status'
                    selectedValue={
                      mesocycleStatusOptions.filter(
                        item => item.value === value
                      )?.[0]
                    }
                  />
                  {errors.status && (
                    <Text style={styles.errorText}>
                      {errors.status.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Current morning bodyweight?
              <Asterisk
                size={16}
                color={errors.weight_now ? Colors.error : Colors.text}
              />
            </Text>
            <Controller
              control={control}
              name='weight_now'
              rules={{ required: 'Weight is required' }}
              render={({ field: { value, onChange } }) => (
                <>
                  <Input
                    placeholder='kg'
                    keyboardType='numeric'
                    value={value != null ? String(value) : ''}
                    onChangeText={text => {
                      const numeric = text.replace(/[^0-9.]/g, '');
                      onChange(numeric === '' ? 0 : Number(numeric));
                    }}
                  />
                  {errors.weight_now && (
                    <Text style={styles.errorText}>
                      {errors.weight_now.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                formModified && styles.saveButtonActive,
              ]}
              onPress={handleSubmit(async data => {
                try {
                  setIsSubmitting(true);

                  // Transform form data to match mesocycle table structure
                  const mesocycleData = {
                    id: data.id,
                    user_id: userId,
                    name: data.name || '',
                    days_per_week: data.days_per_week || 5,
                    length_weeks: data.length_weeks || 5,
                    minutes_per_session: data.minutes_per_session || 75,
                    split_type: data.split_type || [],
                    exercise_variation: data.exercise_variation || 5,
                    joint_pain_now: data.joint_pain_now || [],
                    muscle_emphasis: data.muscle_emphasis || [],
                    goal: data.goal || '',
                    status: data.status || '',
                    start_date: data.start_date
                      ? new Date(data.start_date).toISOString()
                      : new Date().toISOString(),
                    weight_now:
                      data.weight_now != null
                        ? Number(String(data.weight_now)) || 0
                        : 0,
                  };
                  console.log('mesocycleData:', mesocycleData);
                  // const result = await MesocycleService.upsertMesocycle(
                  //   selectedProfile?.value,
                  //   mesocycleData
                  // );
                  // if (result.success) {
                  //   console.log('Mesocycle saved successfully:', result.data);
                  //   setFormModified(false);
                  //   setSubmitError(null);
                  //   setShowCreateMesocycle(false);
                  // } else {
                  //   setSubmitError(result.error || 'Failed to save mesocycle');
                  // }
                } catch (error) {
                  console.error('Error saving profile:', error);
                  setSubmitError('An unexpected error occurred');
                } finally {
                  setIsSubmitting(false);
                }
              })}
              // disabled={!formModified || isSubmitting}
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
  helperText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[2],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Space[2],
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
    width: '48%',
  },
  saveButtonActive: {
    backgroundColor: Colors.secondary,
  },
  saveButtonText: {
    ...Typography.bodyBold,
    fontWeight: '600',
    color: Colors.background,
  },
  requiredNote: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginTop: Space[2],
  },
  // (reverted) no helperText style
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
  variationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space[2],
  },
  variationLabel: {
    ...Typography.small,
    color: Colors.textDisabled,
  },
});
