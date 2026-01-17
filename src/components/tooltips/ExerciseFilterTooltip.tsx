import React, { useState } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { EQUIPMENT_FILTERS, MUSCLE_FILTERS } from '../../constants/constants';
import { Colors, Space, Typography } from '../../constants/theme';
import { Button } from '../ui';

import { TooltipPosition } from './BaseTooltip';
import { ModalTooltip } from './ModalTooltip';

export interface ExerciseFilterTooltipProps {
  isVisible: boolean;
  onFilterByMuscleGroup?: (muscleGroup: string[]) => void;
  onFilterByEquipment?: (equipment: string[]) => void;
  onFilterByMovementPattern?: () => void;
  onFilterByMechanics?: () => void;
  onClearFilters?: () => void;
  position?: TooltipPosition;
  disabled?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeFilters?: {
    muscleGroups?: string[];
    equipment?: string[];
    movementPatterns?: string[];
    mechanics?: string[];
  };
}

export const ExerciseFilterTooltip: React.FC<ExerciseFilterTooltipProps> = ({
  isVisible,
  onFilterByMuscleGroup,
  position = 'bottom',
  disabled = false,
  onShow,
  onHide,
  children,
  style,
}) => {
  const [activeFilters, setActiveFilters] = useState<{
    muscleGroups: string[];
    equipment: string[];
  }>({
    muscleGroups: [],
    equipment: [],
  });

  const filterContent = (
    <ScrollView
      style={styles.filterOptions}
      nestedScrollEnabled
      showsVerticalScrollIndicator
      contentContainerStyle={{ paddingBottom: Space[4] }}
    >
      <View style={styles.filterGrid}>
        {MUSCLE_FILTERS.map((filter, index) => (
          <View key={`filter-${index}`} style={styles.filterItem}>
            <Button
              onPress={() =>
                activeFilters.muscleGroups.includes(filter)
                  ? setActiveFilters({
                      ...activeFilters,
                      muscleGroups: activeFilters.muscleGroups.filter(
                        group => group !== filter
                      ),
                    })
                  : setActiveFilters({
                      ...activeFilters,
                      muscleGroups: [...activeFilters.muscleGroups, filter],
                    })
              }
              style={styles.filterButton}
              variant={
                activeFilters.muscleGroups.includes(filter)
                  ? 'disabled'
                  : 'ghost'
              }
              size='small'
            >
              <Text style={styles.filterText}>{filter}</Text>
            </Button>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: Space[3] }]}>
        Equipment
      </Text>
      <View style={styles.filterGrid}>
        {EQUIPMENT_FILTERS.map((equipment, index) => (
          <View key={`equipment-${index}`} style={styles.filterItem}>
            <Button
              onPress={() =>
                activeFilters.equipment.includes(equipment)
                  ? setActiveFilters({
                      ...activeFilters,
                      equipment: activeFilters.equipment.filter(
                        e => e !== equipment
                      ),
                    })
                  : setActiveFilters({
                      ...activeFilters,
                      equipment: [...activeFilters.equipment, equipment],
                    })
              }
              style={styles.filterButton}
              variant={
                activeFilters.equipment.includes(equipment)
                  ? 'disabled'
                  : 'ghost'
              }
              size='small'
            >
              <Text style={styles.filterText}>{equipment}</Text>
            </Button>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const actions = (
    <View style={styles.actions}>
      <Button onPress={onHide} variant='secondary' size='small'>
        <Text>Cancel</Text>
      </Button>
      <Button
        variant={'primary'}
        size='small'
        onPress={() => {
          onFilterByMuscleGroup?.(activeFilters.muscleGroups);
          onHide?.();
        }}
      >
        <Text>Apply</Text>
      </Button>
    </View>
  );

  return (
    <ModalTooltip
      isVisible={isVisible}
      onShow={onShow}
      onHide={onHide}
      title='Exercise Filter'
      content={
        <View>
          {filterContent}
          {actions}
        </View>
      }
      position={position}
      disabled={disabled}
      style={style}
      width={280}
      height={400}
      showCloseButton={true}
      onClose={onHide}
    >
      {children}
    </ModalTooltip>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Space[2],
    paddingHorizontal: Space[1],
    paddingTop: Space[4],
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  filterOptions: {
    gap: Space[2],
    maxHeight: 300,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Space[1],
  },
  filterItem: {
    width: '48%', // Two columns with gap
    marginBottom: Space[2],
  },
  filterButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.text,
  },
  filterText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    textAlign: 'center',
  },
});

export default ExerciseFilterTooltip;
