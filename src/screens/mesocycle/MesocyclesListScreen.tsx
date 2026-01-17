import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MoreVertical, Pencil, Square, SquarePen } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AddNotesModal } from '../../components/AddNotesModal';
import { MesocycleActionTooltip } from '../../components/tooltips/MesocycleActionTooltip';
import { Tag, Header, Divider, ConfirmationAlert } from '../../components/ui';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { useAuthStore } from '../../models/AuthenticationStore';
import { MesocycleStatus } from '../../training-module/mesocycle/data/enums/mesocycle-status';
import { IMesocycleNoteWithDetails } from '../../training-module/mesocycle/data/interfaces/mesocycle-note';
import { IMesocycleSummary } from '../../training-module/mesocycle/data/interfaces/mesocycle-summary';
import { MesocycleRepository } from '../../training-module/mesocycle/repositories/mesocycle-repository';
import { MesocycleService } from '../../training-module/mesocycle/services/mesocycle-service';
import { GetMesocycleNotesUseCase } from '../../training-module/mesocycle/usecases/get-mesocycle-notes-use-case';
import { useUserProfileStore } from '../../user-module/profile/stores/user-profile-store';

import { DeleteMesocycleFromListAlert } from './components/alerts/DeleteMesocycleFromListAlert';

export const MesocyclesListScreen: React.FC = () => {
  const navigation = useNavigation();

  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
  const [mesocycles, setMesocycles] = useState<IMesocycleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedMesocycle, setSelectedMesocycle] =
    useState<IMesocycleSummary | null>(null);

  // Edit name state
  const [showEditNameAlert, setShowEditNameAlert] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [mesocycleToEdit, setMesocycleToEdit] =
    useState<IMesocycleSummary | null>(null);

  // Delete state
  const [mesocycleToDelete, setMesocycleToDelete] =
    useState<IMesocycleSummary | null>(null);

  // Activation confirmation state
  const [mesocycleToActivate, setMesocycleToActivate] =
    useState<IMesocycleSummary | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  // Notes state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] =
    useState<IMesocycleNoteWithDetails | null>(null);
  const [mesocycleForNotes, setMesocycleForNotes] =
    useState<IMesocycleSummary | null>(null);

  // Activation confirmation state
  const [mesocycleToActivate, setMesocycleToActivate] = useState<IMesocycleSummary | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const { user } = useAuthStore();
  const { setCurrentMesocycleId } = useUserProfileStore();

  // Load mesocycles on component mount
  useEffect(() => {
    loadMesocycles();
  }, []);

  // Reload list whenever the screen gains focus (e.g., after copy flow)
  useFocusEffect(
    useCallback(() => {
      loadMesocycles();
    }, [user?.id])
  );

  const loadMesocycles = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await MesocycleRepository.getMesocyclesSummary(user.id);
      if (response.status === 'ok') {
        setMesocycles(response.data);
      }
    } catch (error) {
      console.error('Failed to load mesocycles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Commented out mesocycle selection logic - not needed for now
  // const handleMesocycleSelect = async (mesocycle: IMesocycleSummary) => {
  //   if (!user?.id) return;

  //   try {
  //     // Get full mesocycle data
  //     const fullMesocycleRequest = await MesocycleRepository.getById({
  //       id: mesocycle.id,
  //     });

  //     if (fullMesocycleRequest.status === 'error') {
  //       return;
  //     }

  //     // Set selected mesocycle in store
  //     setSelectedMesocycle(fullMesocycleRequest.data);

  //     // Set as current mesocycle in user profile
  //     await setCurrentMesocycleId(user.id, mesocycle.id);

  //     // Navigate to workout schedule modal or workout screen
  //     // You can customize this navigation based on your app flow
  //     navigation.navigate('WorkoutSchedule' as never);
  //   } catch (error) {
  //     // Handle error silently or show user-friendly message
  //   }
  // };

  const handleCreateSubmit = () => {
    setShowCreateConfirmation(false);
  };

  const handleShowActionModal = (mesocycle: IMesocycleSummary, event: any) => {
    setSelectedMesocycle(mesocycle);

    setShowActionModal(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseActionModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowActionModal(false);
    });
  };

  const handleActivateMesocycle = () => {
    if (!selectedMesocycle) return;

    setMesocycleToActivate(selectedMesocycle);
    setShowActionModal(false);
  };

  const handleConfirmActivation = async () => {
    if (!mesocycleToActivate || !user?.id) return;

    setIsActivating(true);

    try {
      console.log('Activating mesocycle:', mesocycleToActivate);
      // Complete all active mesocycles before setting this one as current
      const completeRequest =
        await MesocycleRepository.completeAllActiveMesocycles(
          user.id,
          mesocycleToActivate.id
        );
      if (completeRequest.status === 'error') {
        console.warn(
          'Failed to complete active mesocycles:',
          completeRequest.error
        );
      }

      await setCurrentMesocycleId(user.id, mesocycleToActivate.id);

      // Update the mesocycle status to ACTIVE
      const statusUpdateRequest = await MesocycleService.updateMesocycleStatus(
        mesocycleToActivate.id,
        MesocycleStatus.ACTIVE
      );
      if (statusUpdateRequest.status === 'error') {
        console.warn(
          'Failed to update mesocycle status:',
          statusUpdateRequest.error
        );
      }

      // Refresh the mesocycles list to show updated statuses
      await loadMesocycles();

      setMesocycleToActivate(null);
      setSelectedMesocycle(null);
    } catch (error) {
      console.error('Error activating mesocycle:', error);
    } finally {
      setIsActivating(false);
    }
  };

  const handleCancelActivation = () => {
    setMesocycleToActivate(null);
    setSelectedMesocycle(null);
  };

  const handleEditMesocycleName = () => {
    if (!selectedMesocycle) return;

    setEditNameValue(selectedMesocycle.name);
    setMesocycleToEdit(selectedMesocycle);

    setShowActionModal(false);
    setTimeout(() => {
      setShowEditNameAlert(true);
    }, 200);
  };

  const handleSaveName = async () => {
    if (!mesocycleToEdit) return;

    setIsUpdatingName(true);
    try {
      const response = await MesocycleService.updateMesocycleName(
        mesocycleToEdit.id,
        editNameValue.trim()
      );

      if (response.status === 'ok') {
        // Update the local state
        setMesocycles(prevMesocycles =>
          prevMesocycles.map(mesocycle =>
            mesocycle.id === mesocycleToEdit.id
              ? { ...mesocycle, name: editNameValue.trim() }
              : mesocycle
          )
        );
        setShowEditNameAlert(false);
        setMesocycleToEdit(null);
        setSelectedMesocycle(null);
      } else {
        console.error('Error updating mesocycle name:', response.error);
      }
    } catch (error) {
      console.error('Error updating mesocycle name:', error);
      // Handle error - could show toast notification
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEditName = () => {
    setShowEditNameAlert(false);
    setEditNameValue('');
    setMesocycleToEdit(null);
    setSelectedMesocycle(null);
  };

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Name cannot be empty';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (value.trim().length > 100) {
      return 'Name must be less than 100 characters';
    }
    return null;
  };

  const handleCopyMesocycle = async () => {
    (navigation.navigate as any)('MesocycleCopyScreen', {
      mesocycleSource: selectedMesocycle,
    });
    // if (!selectedMesocycle || !user) return;

    // setIsCopying(true);

    // try {
    //   // Copy the mesocycle using our new use case
    //   const copiedMesocycle = await CopyMesocycleUseCase.execute({
    //     user,
    //     mesocycleId: selectedMesocycle.id,
    //     newMesocycleName: `${selectedMesocycle.name} - Copy`,
    //   });

    //   Logger.debug('Mesocycle copied successfully', {
    //     originalId: selectedMesocycle.id,
    //     newId: copiedMesocycle.id,
    //     newName: copiedMesocycle.name,
    //   });

    //   // Refresh the mesocycles list to show the new copy
    //   await loadMesocycles();

    //   // Close the action modal
    //   setShowActionModal(false);
    //   setSelectedMesocycle(null);

    //   // Optionally show success message
    //   // You could add a toast notification here if you have one

    // } catch (error) {
    //   Logger.error('Error copying mesocycle:', error);
    //   errorManager.showError('Failed to copy mesocycle. Please try again.');
    // } finally {
    //   setIsCopying(false);
    // }
  };

  const handleDeleteMesocycle = () => {
    if (!selectedMesocycle) return;

    setShowActionModal(false);
    setTimeout(() => {
      setMesocycleToDelete(selectedMesocycle);
    }, 200);
  };

  const handleConfirmDelete = async (resourceId: string) => {
    setMesocycles(prevMesocycles =>
      prevMesocycles.filter(mesocycle => mesocycle.id !== resourceId)
    );
    setMesocycleToDelete(null);
    setSelectedMesocycle(null);
  };

  const handleCancelDelete = () => {
    setMesocycleToDelete(null);
    setSelectedMesocycle(null);
  };

  const handleAddNote = () => {
    if (selectedMesocycle) {
      setMesocycleForNotes(selectedMesocycle);
      setSelectedNote(null);
      setShowAddNoteModal(true);
    }
    setShowActionModal(false);
  };

  const handleCloseAddNoteModal = () => {
    setShowAddNoteModal(false);
    setSelectedNote(null);
    setMesocycleForNotes(null);
  };

  const MesocycleRow: React.FC<{
    item: IMesocycleSummary;
    index: number;
  }> = ({ item, index }) => {
    const [notes, setNotes] = useState<IMesocycleNoteWithDetails[]>([]);

    useEffect(() => {
      let isMounted = true;
      (async () => {
        try {
          const data = await GetMesocycleNotesUseCase.execute({
            mesocycle_id: item.id,
          });
          if (isMounted) setNotes(data);
        } catch {}
      })();
      return () => {
        isMounted = false;
      };
    }, [item.id]);

    const getStatusTag = () => {
      switch (item.status) {
        case MesocycleStatus.ACTIVE:
          return <Tag variant='custom' text={`${item.status}`} />;
        case MesocycleStatus.COMPLETED:
          return <Tag variant='success' text={`${item.status}  ✓`} />;
        case MesocycleStatus.PLANNING:
        default:
          return null;
      }
    };

    const handleItemPress = () => {
      console.log(`Mesocycle item ${index} pressed:`, {
        id: item.id,
        name: item.name,
        status: item.status,
        index: index,
      });
    };

    return (
      <View style={styles.mesocycleItem}>
        <View style={styles.mesocycleItemContent}>
          <TouchableOpacity
            style={styles.mesocycleItemTouchable}
            onPress={handleItemPress}
          >
            <View style={styles.mesocycleHeader}>
              <Text style={styles.mesocycleName}>{item.name}</Text>
              <View style={styles.mesocycleTags}>
                <View style={styles.mesocycleTags}>
                  <Tag variant='secondary' text={`${item.num_weeks} weeks`} />
                  <Tag
                    variant='lightBlue'
                    text={`${item.days_per_week} days/week`}
                  />
                  {item.is_ai_generated && (
                    <Tag variant='secondary' text={`AI`} />
                  )}
                </View>
                {getStatusTag()}
              </View>
            </View>
          </TouchableOpacity>

          <MesocycleActionTooltip
            visible={showActionModal}
            onClose={handleCloseActionModal}
            onEditMesocycle={handleEditMesocycleName}
            onDeleteMesocycle={handleDeleteMesocycle}
            onCopyMesocycle={handleCopyMesocycle}
            onActivateMesocycle={handleActivateMesocycle}
            onAddNote={handleAddNote}
            mesocycle={selectedMesocycle || item}
            position='bottom-right'
          >
            <TouchableOpacity
              style={styles.mesocycleItemActions}
              onPress={event => handleShowActionModal(item, event)}
            >
              <MoreVertical size={24} color={Colors.text} />
            </TouchableOpacity>
          </MesocycleActionTooltip>
        </View>
        {notes.length > 0 && (
          <View style={{ width: '100%', paddingVertical: Space[2] }}>
            {notes.map(n => (
              <TouchableOpacity
                key={n.profile_note_id}
                onPress={() => {
                  setMesocycleForNotes(item);
                  setSelectedNote(n);
                  setShowAddNoteModal(true);
                }}
                style={styles.notePill}
                activeOpacity={0.8}
              >
                <SquarePen size={16} color={Colors.text} />
                <Text style={styles.noteText} numberOfLines={2}>
                  {n.profile_note.note}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Divider />
      </View>
    );
  };

  const renderMesocycleItem = ({
    item,
    index,
  }: {
    item: IMesocycleSummary;
    index: number;
  }) => {
    return <MesocycleRow item={item} index={index} />;
  };

  const handleNotesChange = () => {
    // Refresh mesocycles list if needed
    loadMesocycles();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title='Mesocycles'
        showLogo={false}
        showBackButton={true}
        onNotificationPress={() => {}}
      />

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={Colors.primary} />
            <Text style={styles.loadingText}>Loading mesocycles...</Text>
          </View>
        ) : (
          <FlatList
            data={mesocycles}
            renderItem={renderMesocycleItem}
            refreshing={isLoading}
            onRefresh={loadMesocycles}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No mesocycles yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first mesocycle to start training
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <ConfirmationAlert
        isVisible={showCreateConfirmation}
        onConfirm={handleCreateSubmit}
        onClose={() => setShowCreateConfirmation(false)}
        title='Create Mesocycle'
        message='This will overwrite your current mesocycle, are you sure you want to continue?'
        confirmText='Create'
        cancelText='Cancel'
        variant='warning'
      />

      <ConfirmationAlert
        isVisible={showEditNameAlert}
        onConfirm={handleSaveName}
        onCancel={handleCancelEditName}
        onClose={() => setShowEditNameAlert(false)}
        title='Edit Name'
        showInput={true}
        inputValue={editNameValue}
        inputPlaceholder='Enter name...'
        inputLabel='Name'
        confirmText='Save'
        cancelText='Cancel'
        variant='info'
        maxLength={50}
        inputValidation={validateName}
        onInputChange={setEditNameValue}
        loading={isUpdatingName}
        disabled={isUpdatingName}
      />

      <DeleteMesocycleFromListAlert
        resource={mesocycleToDelete}
        onSuccess={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <ConfirmationAlert
        isVisible={mesocycleToActivate !== null}
        onConfirm={handleConfirmActivation}
        onCancel={handleCancelActivation}
        onClose={handleCancelActivation}
        title='Activate Mesocycle'
        message={`Activating "${mesocycleToActivate?.name}" will overwrite your current active mesocycle if you have one. Are you sure you want to continue?`}
        confirmText={isActivating ? 'Activating...' : 'Yes'}
        cancelText='Cancel'
        variant='warning'
        disabled={isActivating}
      />

      <AddNotesModal
        isVisible={showAddNoteModal}
        onClose={handleCloseAddNoteModal}
        onNotesChange={handleNotesChange}
        mode='mesocycle'
        selectedMesocycleNote={selectedNote}
        mesocycleId={mesocycleForNotes?.id}
        mesocycleName={mesocycleForNotes?.name}
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
    paddingHorizontal: Space[3],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Space[3],
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  listContent: {
    paddingVertical: Space[2],
  },
  mesocycleItemTouchable: {
    flex: 1,
  },
  mesocycleItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mesocycleItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mesocycleHeader: {
    gap: Space[2],
  },
  mesocycleName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  mesocycleTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Space[2],
    marginTop: Space[1],
  },
  mesocycleItemActions: {
    padding: Space[1],
  },
  notesTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Space[1],
  },
  notePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[2],
    paddingVertical: Space[2],
    marginBottom: Space[1],
  },
  noteText: {
    ...Typography.body,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Space[8],
    gap: Space[2],
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
} as const);
