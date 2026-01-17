import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Space } from '../../../../constants/theme';

import { CustomExerciseFormScreen } from './CustomExerciseFormScreen';
import { CustomExerciseListScreen } from './CustomExerciseListScreen';

export const CustomExerciseContent: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const handleCreateExercise = () => {
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  return (
    <View style={styles.customContent}>
      {showForm ? (
        <CustomExerciseFormScreen onBack={handleBackToList} />
      ) : (
        <CustomExerciseListScreen onCreateExercise={handleCreateExercise} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customContent: {
    paddingVertical: Space[1],
  },
});
