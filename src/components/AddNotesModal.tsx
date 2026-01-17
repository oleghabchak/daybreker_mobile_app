import { Trash2 } from 'lucide-react-native';
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Colors, Space, Typography, BorderRadius } from '../constants/theme';
import { CreateMesocycleNoteUseCase } from '../training-module/mesocycle/usecases/create-mesocycle-note-use-case';
import { UpdateMesocycleNoteUseCase } from '../training-module/mesocycle/usecases/update-mesocycle-note-use-case';
import { IWorkoutExercise } from '../training-module/workout/data/interfaces/workout-exercise';
import { IWorkoutExerciseNoteWithDetails } from '../training-module/workout/data/interfaces/workout-exercise-note';
import { useWorkoutStore } from '../training-module/workout/stores/workout-store';

import { Modal } from './ui/Modal';

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
}

export interface AddNotesModalProps {
  selectedNote?: IWorkoutExerciseNoteWithDetails | null;
  exerciseItem?: IWorkoutExercise;
  selectedMesocycleNote?: any | null;
  mesocycleId?: string;
  mesocycleName?: string;
  isVisible: boolean;
  onClose: () => void;
  onNotesChange?: () => void;
  mode?: 'exercise' | 'mesocycle';
}

export const AddNotesModal: React.FC<AddNotesModalProps> = ({
  selectedNote,
  exerciseItem,
  selectedMesocycleNote,
  mesocycleId,
  mesocycleName,
  isVisible,
  onClose,
  onNotesChange,
  mode = 'exercise',
}) => {
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{
    content?: string;
  }>({});

  const contentInputRef = useRef<TextInput>(null);

  // Get store actions and state
  const {
    notesLoading: isLoading,
    notesError: error,
    createNote,
    updateNote,
    deleteNote,
    clearNotesError,
  } = useWorkoutStore();

  // Determine if we're editing or creating
  const isEditing =
    mode === 'exercise'
      ? selectedNote !== null
      : selectedMesocycleNote !== null;
  const currentNote =
    mode === 'exercise' ? selectedNote : selectedMesocycleNote;

  // Initialize content when modal opens or selectedNote changes
  useEffect(() => {
    if (isVisible) {
      if (mode === 'exercise' && selectedNote) {
        setContent(selectedNote.profile_note.note);
      } else if (mode === 'mesocycle' && selectedMesocycleNote) {
        setContent(selectedMesocycleNote.profile_note.note);
      } else {
        setContent('');
      }
      setErrors({});
      if (mode === 'exercise') {
        clearNotesError();
      }
    }
  }, [isVisible, selectedNote, selectedMesocycleNote, mode, clearNotesError]);

  const handleSave = async () => {
    const newErrors: { content?: string } = {};

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (mode === 'exercise') {
        const exerciseId =
          exerciseItem?.workout_exercise_id || exerciseItem?.id;

        if (!exerciseId) {
          Alert.alert('Error', 'Exercise item is required');
          return;
        }

        if (isEditing && currentNote) {
          await updateNote(currentNote.profile_note_id, content.trim());
        } else {
          await createNote(exerciseId, content.trim());
        }
      } else if (mode === 'mesocycle') {
        if (!mesocycleId) {
          Alert.alert('Error', 'Mesocycle ID is required');
          return;
        }

        if (isEditing && selectedMesocycleNote) {
          await UpdateMesocycleNoteUseCase.execute({
            profile_note_id: selectedMesocycleNote.profile_note_id,
            note: content.trim(),
          });
        } else {
          await CreateMesocycleNoteUseCase.execute({
            mesocycle_id: mesocycleId,
            note: content.trim(),
          });
        }
      }

      // Notify parent component to refresh notes
      onNotesChange?.();
      handleClose();
    } catch (error) {
      console.error('Failed to save note:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({ content: `Failed to save note: ${errorMessage}` });
    }
  };

  const handleDelete = () => {
    if (!isEditing || !currentNote) return;

    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNote(
              currentNote.workout_exercise_id,
              currentNote.profile_note_id
            );
            // Notify parent component to refresh notes
            onNotesChange?.();
            handleClose();
          } catch (error) {
            console.error('Failed to delete note:', error);
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error occurred';
            Alert.alert('Error', `Failed to delete note: ${errorMessage}`);
          }
        },
      },
    ]);
  };

  const handleClose = () => {
    setContent('');
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={handleClose}
      title={
        isEditing
          ? 'Edit Note'
          : mode === 'exercise'
            ? 'Add Exercise Note'
            : 'Add Mesocycle Note'
      }
      size='large'
      contentStyle={{
        marginBottom: 240,
      }}
      closeOnBackdropPress={false}
      closeOnBackButtonPress={false}
      primaryAction={{
        label: isEditing ? 'Update' : 'Save',
        onPress: handleSave,
        variant: 'primary',
        disabled: isLoading || !content.trim(),
      }}
      secondaryAction={{
        label: 'Cancel',
        onPress: handleClose,
        variant: 'ghost',
        disabled: isLoading,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.content}>
          {/* Exercise Title */}
          {mode === 'exercise' && (
            <View style={styles.section}>
              <Text style={styles.exerciseTitle}>
                {exerciseItem?.exercise?.exercise_display_name_en}
              </Text>
            </View>
          )}

          {/* Note Input */}
          <View style={styles.section}>
            <View style={styles.contentInputContainer}>
              <TextInput
                ref={contentInputRef}
                style={[
                  styles.contentInput,
                  errors.content && styles.contentInputError,
                ]}
                value={content}
                onChangeText={setContent}
                placeholder={
                  isEditing ? 'Edit your note...' : 'Write your note here...'
                }
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={5}
                textAlignVertical='top'
                maxLength={150}
                editable={!isLoading}
              />
              {errors.content && (
                <Text style={styles.errorText}>{errors.content}</Text>
              )}
              <Text style={styles.characterCount}>
                {content.length}/150 characters
              </Text>
            </View>
          </View>

          {/* Delete Button - Only show when editing */}
          {isEditing && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isLoading}
              >
                <Trash2 size={16} color={Colors.error} />
                <Text style={styles.deleteButtonText}>Delete Note</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color={Colors.text} />
            </View>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 500,
  },
  content: {
    paddingVertical: Space[2],
  },
  section: {},
  exerciseTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Space[3],
    marginBottom: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteContent: {
    flex: 1,
    marginRight: Space[2],
  },
  noteText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[1],
  },
  noteDate: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  noteActions: {
    flexDirection: 'row',
    gap: Space[1],
  },
  actionButton: {
    padding: Space[1],
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Space[4],
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
  },
  title: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  sectionLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  titleInput: {
    fontSize: 16,
  },
  contentInputContainer: {
    marginBottom: Space[1],
  },
  contentLabel: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  contentInput: {
    ...Typography.bodyMedium,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Space[3],
    paddingVertical: Space[3],
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  contentInputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Space[1],
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'right',
    marginTop: Space[1],
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[2],
    paddingHorizontal: Space[4],
    gap: Space[2],
  },
  deleteButtonText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Space[2],
  },
  priorityButton: {
    flex: 1,
    paddingVertical: Space[2],
  },
  priorityButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: Space[2],
    alignItems: 'flex-end',
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    paddingHorizontal: Space[3],
    paddingVertical: Space[2],
  },
  addTagButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.background,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space[2],
    marginTop: Space[2],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Space[2],
    paddingVertical: Space[1],
    gap: Space[1],
  },
  tagText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '500',
  },
  removeTagButton: {
    padding: 0,
    margin: 0,
    minWidth: 20,
    minHeight: 20,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Space[3],
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Space[2],
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[1],
  },
  metadataText: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
});
