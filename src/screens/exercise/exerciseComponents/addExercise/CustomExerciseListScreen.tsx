import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { Button } from '../../../../components/ui/Button';
import { Divider } from '../../../../components/ui/Divider';
import { Colors, Space, Typography } from '../../../../constants/theme';
import { useAuthStore } from '../../../../models/AuthenticationStore';
import { ICustomExercise } from '../../../../training-module/exercise/data/interfaces/custom-exercise';
import { CustomExerciseRepository } from '../../../../training-module/exercise/repositories/custom-exercise-repository';

import { CustomExerciseItem } from './CustomExerciseItem';

interface CustomExerciseListScreenProps {
  navigation?: any;
  route?: any;
  onCreateExercise?: () => void;
}

export const CustomExerciseListScreen: React.FC<
  CustomExerciseListScreenProps
> = ({ navigation, route, onCreateExercise }) => {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState<ICustomExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchExercises = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await CustomExerciseRepository.getByUserId(user.id);

      if (result.status === 'ok') {
        setExercises(result.data || []);
      } else {
        console.error('Error fetching exercises:', result.error);
        Alert.alert('Error', 'Failed to fetch custom exercises');
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      Alert.alert('Error', 'Failed to fetch custom exercises');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchExercises();
  }, [fetchExercises]);

  const handleDeleteExercise = useCallback(
    async (exerciseId: string, exerciseName: string) => {
      Alert.alert(
        'Delete Exercise',
        `Are you sure you want to delete "${exerciseName}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const result =
                  await CustomExerciseRepository.delete(exerciseId);

                if (result.status === 'ok') {
                  setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
                  Alert.alert('Success', 'Exercise deleted successfully');
                } else {
                  Alert.alert(
                    'Error',
                    result.error.message || 'Failed to delete exercise'
                  );
                }
              } catch (error) {
                console.error('Error deleting exercise:', error);
                Alert.alert('Error', 'Failed to delete exercise');
              }
            },
          },
        ]
      );
    },
    []
  );

  const renderExerciseItem = ({
    item,
    index,
  }: {
    item: ICustomExercise;
    index: number;
  }) => (
    <CustomExerciseItem
      exercise={item}
      index={index}
      isSelected={false} // We can add selection logic later if needed
      onPress={() => {
        // Navigate to edit screen or show details
        navigation?.navigate('CustomExerciseForm', { exerciseId: item.id });
      }}
      onDelete={() => handleDeleteExercise(item.id!, item.name)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Custom Exercises</Text>
      <Text style={styles.emptyStateDescription}>
        Create your first custom exercise to get started
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Button
        variant='primary'
        onPress={
          onCreateExercise || (() => navigation?.navigate('CustomExerciseForm'))
        }
        style={styles.createButton}
      >
        Create Exercise
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={exercises}
        renderItem={renderExerciseItem}
        keyExtractor={item => item.id || item.name}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        ItemSeparatorComponent={() => <Divider color={Colors.border} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    paddingBottom: Space[3],
    backgroundColor: Colors.background,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Space[8],
  },
  emptyStateTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  emptyStateDescription: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[4],
    lineHeight: 20,
  },
  createButton: {
    paddingHorizontal: Space[4],
  },
});
