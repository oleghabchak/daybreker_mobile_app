import { useNavigation } from '@react-navigation/native';
import { Dumbbell, MoreVertical } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// @ts-ignore
import SwitchSelector from 'react-native-switch-selector';

import { Button, Divider, Tag } from '../../components';
import { TemplateActionTooltip } from '../../components/tooltips/TemplateActionTooltip';
import { Header, ConfirmationAlert } from '../../components/ui';
import { Colors, Space, Typography } from '../../constants/theme';
import { useAuthStore } from '../../models/AuthenticationStore';
import { errorManager } from '../../services/errorNotificationManager';
import { Logger } from '../../services/logger';
import { useMesocycleCreation } from '../../training-module/mesocycle/hooks/useMesocycleCreation';
import {
  useExerciseLibraryStore,
  IExerciseLibraryData,
} from '../../training-module/exercise';
import { IMesocycle } from '../../training-module/mesocycle/data/interfaces/mesocycle';
import { IMesocycleTemplateExercise } from '../../training-module/mesocycle/data/interfaces/mesocycle-templates';
import { MesocycleRepository } from '../../training-module/mesocycle/repositories/mesocycle-repository';
import { useMesocycleStore } from '../../training-module/mesocycle/stores/mesocycle-store';
import { CreateMesocycleFromTemplateUseCase } from '../../training-module/mesocycle/usecases/create-mesocycle-from-template-use-case';
import { useUserProfileStore } from '../../user-module/profile/stores/user-profile-store';

const defaultSwitchOptions = [
  { label: 'App Templates', value: 'app' },
  { label: 'Saved Templates', value: 'saved' },
];

// Function to generate days array based on number of days
const generateDaysOptions = (numDays: number) => {
  return Array.from({ length: numDays }, (_, index) => ({
    label: `Day ${index + 1}`,
    value: `day_${index + 1}`,
  }));
};

export const MesocycleFromTemplateScreen: React.FC = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const [templateType, setTemplateType] = useState<'app' | 'saved'>('app');
  const [selectedTemplate, setSelectedTemplate] = useState<IMesocycle | null>(
    null
  );
  const [selectedDay, setSelectedDay] = useState<string>('day_1');
  const [exerciseDataMap, setExerciseDataMap] = useState<
    Map<string, IExerciseLibraryData>
  >(new Map());
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedTemplateForAction, setSelectedTemplateForAction] =
    useState<IMesocycle | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleTemplateTypeChange = (newType: 'app' | 'saved') => {
    if (isSwitching || newType === templateType) {
      return;
    }

    if (newType === 'saved' && !user) {
      return;
    }

    setTemplateType(newType);

    if (selectedTemplate) {
      setSelectedTemplate(null);
      setSelectedDay('day_1');
      setExerciseDataMap(new Map());
    }

    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
    }, 50);
  };

  const { setCurrentMesocycleId } = useUserProfileStore();
  const { isCreating, createActiveMesocycle, addToList } = useMesocycleCreation();
  const {
    templates,
    loadAppTemplates,
    loadUserTemplates,
    templateExercises,
    loadTemplateExercises,
    deleteTemplate,
  } = useMesocycleStore();
  const { getExercisesByIds, isLoading: exerciseLoading } =
    useExerciseLibraryStore();

  useEffect(() => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    const loadTemplatesByType = async () => {
      if (isSwitching) {
        return;
      }

      if (!user && templateType === 'saved') {
        return;
      }

      if (!templates || templates.length === 0) {
        setIsLoadingTemplates(true);
      }

      try {
        if (templateType === 'app') {
          await loadAppTemplates();
        } else if (templateType === 'saved' && user) {
          await loadUserTemplates(user.id);
        }
      } catch (error) {
        Logger.error('Error loading templates:', error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    const timeout = setTimeout(() => {
      loadTemplatesByType();
    }, 50);

    setLoadingTimeout(timeout as any);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [templateType, user, loadAppTemplates, loadUserTemplates, isSwitching]);

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateExercises(selectedTemplate.id);
    }
  }, [selectedTemplate, loadTemplateExercises]);

  useEffect(() => {
    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      setIsSwitching(false);
      setIsLoadingTemplates(false);
    };
  }, [loadingTimeout]);

  const fetchExerciseData = async (exercises: IMesocycleTemplateExercise[]) => {
    if (!exercises || exercises.length === 0) return;

    const exerciseIds = exercises.map(ex => ex.exercise_id).filter(Boolean);
    if (exerciseIds.length === 0) return;

    try {
      const exerciseData = await getExercisesByIds(exerciseIds);
      const newMap = new Map<string, IExerciseLibraryData>();

      exerciseData.forEach(exercise => {
        newMap.set(exercise.exercise_uid, exercise);
      });

      setExerciseDataMap(newMap);
    } catch (error) {
      Logger.error('Error fetching exercise data:', error);
    }
  };

  useEffect(() => {
    if (templateExercises && templateExercises.length > 0) {
      fetchExerciseData(templateExercises);
    }
  }, [templateExercises]);

  const renderTemplateItem = ({ item: template }: { item: any }) => (
    <View style={styles.templateItemContainer}>
      <View style={styles.templateItemRow}>
        <TouchableOpacity
          style={styles.templateItem}
          onPress={() => {
            setSelectedTemplate(template);
          }}
        >
          <Text style={styles.templateName}>• {template.name}</Text>

          <View style={{ flexDirection: 'row', gap: Space[2] }}>
            <Tag variant='outline' text={`${template.num_weeks} / weeks`} />
            <Tag variant='black' text={template.goal} />
          </View>
        </TouchableOpacity>
        {templateType === 'saved' && (
          <TemplateActionTooltip
            visible={
              showActionModal && selectedTemplateForAction?.id === template.id
            }
            onClose={handleCloseActionModal}
            onDeleteTemplate={handleDeleteTemplate}
            position='bottom-right'
          >
            <TouchableOpacity
              style={styles.templateItemActions}
              onPress={event => handleShowActionModal(template, event)}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          </TemplateActionTooltip>
        )}
      </View>
      <Divider />
    </View>
  );

  const renderExerciseItem = ({
    item: exercise,
  }: {
    item: IMesocycleTemplateExercise;
  }) => {
    const exerciseData = exerciseDataMap.get(exercise.exercise_id);
    const exerciseName = exerciseData?.exercise_display_name_en || 'Loading...';
    const muscleGroups = exerciseData?.exercise_muscle_groups_simple;

    const primaryMuscles = muscleGroups?.primary || [];
    const muscleGroupsToDisplay =
      primaryMuscles.length > 0
        ? primaryMuscles
        : [exercise.exercise_muscle_group];

    return (
      <View style={styles.exerciseItem}>
        <Divider />
        <View
          style={{ flexDirection: 'row', gap: Space[4], alignItems: 'center' }}
        >
          <Dumbbell size={20} color={Colors.secondary} />
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              flex: 1,
            }}
          >
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <View style={styles.muscleGroupTags}>
              {muscleGroupsToDisplay.map(
                (muscleGroup: string, index: number) => (
                  <Tag
                    key={index}
                    variant='black'
                    text={muscleGroup}
                    style={styles.muscleGroupTag}
                  />
                )
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleBackPress = () => {
    if (selectedTemplate) {
      setSelectedTemplate(null);
      setTemplateType('app');
      setSelectedDay('day_1');
    } else {
      handleClose();
    }
  };

  const handleCreateFromTemplate = () => {
    setShowConfirmation(true);
  };

  const handleConfirmCreate = async () => {
    if (!user || !selectedTemplate || !templateExercises) {
      return;
    }

    try {
      await createActiveMesocycle({
        user,
        selectedTemplate,
        templateExercises,
      });

      handleClose();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleAddToList = async () => {
    if (!user || !selectedTemplate || !templateExercises) {
      return;
    }

    try {
      await addToList({
        user,
        selectedTemplate,
        templateExercises,
      });

      handleClose();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const handleShowActionModal = (template: IMesocycle, event: any) => {
    setSelectedTemplateForAction(template);
    setShowActionModal(true);
  };

  const handleCloseActionModal = () => {
    setShowActionModal(false);
  };

  const handleDeleteTemplate = () => {
    if (!selectedTemplateForAction) return;

    const templateToDelete = selectedTemplateForAction;
    setShowActionModal(false);
    setTimeout(() => {
      setSelectedTemplateForAction(templateToDelete);
      setShowDeleteConfirmation(true);
    }, 100);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplateForAction || !user) return;

    setIsDeleting(true);

    try {
      await deleteTemplate(selectedTemplateForAction.id);
      setShowDeleteConfirmation(false);
      setSelectedTemplateForAction(null);
    } catch (error) {
      Logger.error('Error deleting template:', error);
      errorManager.showError('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedTemplateForAction(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title={
          selectedTemplate ? selectedTemplate?.name : 'Create from Template'
        }
        showLogo={false}
        showBackButton={true}
        onBackPress={handleBackPress}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.switchContainer}>
          {selectedTemplate ? (
            <>
              <SwitchSelector
                options={generateDaysOptions(selectedTemplate.days_per_week)}
                fontSize={13}
                hasPadding
                animationDuration={300}
                selectedColor={Colors.background}
                buttonColor={Colors.secondary}
                borderColor={Colors.secondary}
                initial={0}
                onPress={(value: string) => {
                  setSelectedDay(value);
                }}
                key={`day-selector-${selectedTemplate.id}-${selectedTemplate.days_per_week}`}
              />
              <FlatList
                data={(() => {
                  const dayNumber = parseInt(selectedDay.split('_')[1]);
                  const filteredExercises =
                    templateExercises?.filter(
                      exercise => exercise.day_of_week === dayNumber
                    ) || [];
                  return filteredExercises;
                })()}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {exerciseLoading ? 'Loading exercises...' : 'No Exercises'}
                  </Text>
                }
                renderItem={renderExerciseItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.exercisesList}
                contentContainerStyle={styles.exercisesListContent}
              />
              <Button
                variant='primary'
                onPress={handleCreateFromTemplate}
                disabled={isCreating || exerciseLoading}
              >
                {isCreating ? (
                  <ActivityIndicator size='small' color={Colors.background} />
                ) : (
                  'Use this template'
                )}
              </Button>
            </>
          ) : (
            <SwitchSelector
              options={defaultSwitchOptions}
              fontSize={13}
              hasPadding
              animationDuration={300}
              selectedColor={Colors.background}
              buttonColor={Colors.secondary}
              borderColor={Colors.secondary}
              initial={templateType === 'app' ? 0 : 1}
              onPress={(value: string) => {
                const newType = value as 'app' | 'saved';
                handleTemplateTypeChange(newType);
              }}
              disabled={isLoadingTemplates}
              key={`template-type-${templateType}`}
            />
          )}
        </View>

        <View style={styles.templateList}>
          {!selectedTemplate && (
            <FlatList
              data={templates || []}
              ListEmptyComponent={
                <View style={[styles.savedTemplateList]}>
                  {isLoadingTemplates ? (
                    <ActivityIndicator size='large' color={Colors.primary} />
                  ) : (
                    <Text style={styles.emptyText}>
                      {templateType === 'app'
                        ? 'No App Templates Available'
                        : 'No Saved Templates Available'}
                    </Text>
                  )}
                </View>
              }
              renderItem={renderTemplateItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              refreshing={isLoadingTemplates}
              onRefresh={() => {
                if (!isSwitching) {
                  handleTemplateTypeChange(templateType);
                }
              }}
            />
          )}
        </View>
      </View>

      <ConfirmationAlert
        isVisible={showConfirmation}
        onConfirm={handleConfirmCreate}
        onCancel={handleAddToList}
        onClose={() => setShowConfirmation(false)}
        title='Create Mesocycle from Template'
        message='This will overwrite your current mesocycle, are you sure you want to continue?'
        confirmText='Yes'
        cancelText='Add to list'
        variant='warning'
      />

      <ConfirmationAlert
        isVisible={showDeleteConfirmation}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        onClose={() => setShowDeleteConfirmation(false)}
        title='Delete Template'
        message={`Are you sure you want to delete "${selectedTemplateForAction?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText='Cancel'
        variant='danger'
        disabled={isDeleting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Space[4],
    paddingVertical: Space[3],
  },
  switchContainer: {
    marginBottom: Space[4],
  },
  templateList: {
    flex: 1,
  },
  savedTemplateList: {
    paddingVertical: Space[8],
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateItem: {
    gap: Space[1],
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Space[2],
  },
  templateItemContainer: {},
  templateItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  templateItemActions: {
    padding: Space[2],
  },
  templateName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontWeight: '600',
  },
  exerciseItem: {
    gap: Space[1],
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: Space[2],
  },
  exerciseName: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  exerciseMuscleGroup: {
    ...Typography.body,
    color: Colors.text,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text,
    textAlign: 'center',
    paddingVertical: Space[4],
  },
  exercisesList: {
    height: 200, // Fixed height for consistent layout
    marginBottom: Space[4],
  },
  exercisesListContent: {
    flexGrow: 1,
    paddingVertical: Space[2],
  },
  muscleGroupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[1],
    marginTop: Space[1],
  },
  muscleGroupTag: {
    marginRight: Space[1],
    marginBottom: Space[1],
  },
} as const);
