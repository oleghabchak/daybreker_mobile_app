import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../constants/theme';
import { PrimaryMuscleGroup } from '../../../enums/databas.enums';

export interface MesocycleBodyPartSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectedBodyPart: (bodyPart: PrimaryMuscleGroup) => void;
}

const MuscleGroups: Record<PrimaryMuscleGroup, string> = {
  [PrimaryMuscleGroup.QUADS]: 'Quads',
  [PrimaryMuscleGroup.GLUTES]: 'Glutes',
  [PrimaryMuscleGroup.CHEST]: 'Chest',
  [PrimaryMuscleGroup.BACK]: 'Back',
  [PrimaryMuscleGroup.SHOULDERS]: 'Shoulders',
  [PrimaryMuscleGroup.ABS]: 'Abs',
  [PrimaryMuscleGroup.HAMSTRINGS]: 'Hamstrings',
  [PrimaryMuscleGroup.LOW_BACK]: 'Low back',
  [PrimaryMuscleGroup.CALVES]: 'Calves',
  [PrimaryMuscleGroup.BICEPS]: 'Biceps',
  [PrimaryMuscleGroup.TRICEPS]: 'Triceps',
  [PrimaryMuscleGroup.FOREARMS]: 'Forearms',
  [PrimaryMuscleGroup.TRAPS]: 'Traps',
  [PrimaryMuscleGroup.FULL_BODY]: 'Full body',
};

const AnimatedItem: React.FC<{
  index: number;
  bodyPart: PrimaryMuscleGroup;
  onPress: (bodyPart: PrimaryMuscleGroup) => void;
}> = ({ bodyPart, index, onPress }) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    const delay = index * 25;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        key={bodyPart}
        style={styles.bodyPartOption}
        onPress={() => onPress(bodyPart)}
      >
        <Text style={styles.bodyPartOptionText}>
          {MuscleGroups[bodyPart as PrimaryMuscleGroup]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MesocycleBodyPartSelectionModal: React.FC<
  MesocycleBodyPartSelectionModalProps
> = ({ isVisible, onClose, onSelectedBodyPart }) => {
  const handleSelect = (bodyPart: PrimaryMuscleGroup) => {
    onSelectedBodyPart(bodyPart);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType='fade'
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
        >
          <Text style={styles.bodyPartModalTitle}>Select Body Part</Text>

          <ScrollView style={styles.modalContent}>
            <View style={styles.gridContainer}>
              {Object.keys(MuscleGroups).map((bodyPart, index) => (
                <View key={index} style={styles.gridItem}>
                  <AnimatedItem
                    index={index}
                    bodyPart={bodyPart as PrimaryMuscleGroup}
                    onPress={handleSelect}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={styles.cancelButtonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxHeight: '70%',
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Space[4],
    paddingTop: Space[4],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: Space[2],
  },
  bodyPartModalTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    padding: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bodyPartOption: {
    borderRadius: BorderRadius.md,
    padding: Space[2],
    marginBottom: Space[2],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bodyPartOptionText: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  cancelButtonContainer: {
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  cancelButton: {
    backgroundColor: Colors.secondary,
    padding: Space[4],
    margin: Space[4],
    borderRadius: BorderRadius.md,
    marginTop: Space[4],
  },
  cancelButtonText: {
    ...Typography.bodyBold,
    color: Colors.background,
    textAlign: 'center',
  },
});
