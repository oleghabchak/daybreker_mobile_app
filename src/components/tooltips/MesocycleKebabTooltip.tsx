import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Dumbbell, Plus, Trophy } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { useWorkoutStore } from '../../training-module/workout/stores/workout-store';
import { Divider } from '../ui';

import { BaseTooltip, TooltipPosition } from './BaseTooltip';

export interface KebabTooltipProps {
  isVisible: boolean;
  isMesocycleSubmenuVisible: boolean;
  onAddMesocycle?: () => void;
  onAddExercises?: () => void;
  onCopyMesocycle?: () => void;
  onStartWithTemplate?: () => void;
  onStartFromScratch?: () => void;
  position?: TooltipPosition;
  disabled?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const MesocycleKebabTooltip: React.FC<KebabTooltipProps> = ({
  isVisible,
  isMesocycleSubmenuVisible,
  onAddMesocycle,
  onAddExercises,
  onCopyMesocycle,
  onStartWithTemplate,
  onStartFromScratch,
  position = 'top',
  disabled = false,
  onShow,
  onHide,
  children,
  style,
}) => {
  const [isMesocycleSubmenuOpen, setIsMesocycleSubmenuOpen] = useState(
    isMesocycleSubmenuVisible
  );
  const { currentWorkout } = useWorkoutStore();
  const navigation = useNavigation();
  const caretAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(caretAnim, {
      toValue: isMesocycleSubmenuOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isMesocycleSubmenuOpen]);

  const handleAction = (action: () => void | undefined) => {
    if (action) {
      action();
    }
    onHide?.();
  };

  const content = (
    <View style={styles.content}>
      <Text style={styles.title}>Mesocycle</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          navigation.navigate('MesocyclesListScreen' as never);
          setIsMesocycleSubmenuOpen(false);
          onHide?.();
        }}
      >
        <Trophy size={15} color={Colors.primary} />
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionText}>Mesocycles list</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          // Toggle nested submenu under Add Mesocycle
          setIsMesocycleSubmenuOpen(prev => !prev);
        }}
      >
        <Animated.View
          style={{
            transform: [
              {
                rotate: caretAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <ChevronDown size={18} color={Colors.primary} />
        </Animated.View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionText}>Add Mesocycle</Text>
        </View>
      </TouchableOpacity>

      {isMesocycleSubmenuOpen && (
        <View style={[styles.connectorStub, { marginTop: Space[2] }]} />
      )}

      {isMesocycleSubmenuOpen && (
        <View style={styles.submenuBlock}>
          <View style={styles.verticalSpine} />
          <View style={styles.submenuRow}>
            <View style={styles.horizontalConnector} />
            <TouchableOpacity
              style={styles.submenuButton}
              onPress={() =>
                handleAction(() => {
                  onStartWithTemplate?.() ||
                    navigation.navigate('MesocycleFromTemplateScreen' as never);
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={18} color={Colors.primary} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.submenuText}>Use Template</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.submenuRow}>
            <View style={styles.horizontalConnector} />
            <TouchableOpacity
              style={styles.submenuButton}
              onPress={() =>
                handleAction(() => {
                  onStartFromScratch?.() ||
                    navigation.navigate('MesocycleFromScratch' as never);
                })
              }
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={18} color={Colors.primary} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.submenuText}>Create New</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Divider color={Colors.background} />
      <Text style={styles.title}>Exercises</Text>

      <TouchableOpacity
        disabled={!currentWorkout}
        style={[styles.actionButton, { opacity: currentWorkout ? 1 : 0.5 }]}
        onPress={() => handleAction(onAddExercises ?? (() => {}))}
      >
        <Dumbbell size={18} color={Colors.secondary} />
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionText}>Add Exercise</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseTooltip
      isVisible={isVisible}
      onShow={onShow}
      onHide={onHide}
      content={content}
      position={position}
      disabled={disabled}
      style={style}
      width={220}
      height={140}
    >
      {children}
    </BaseTooltip>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[2],
    paddingHorizontal: Space[2],
    borderRadius: BorderRadius.md,
    marginBottom: Space[2],
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submenuContainer: {
    marginLeft: Space[3],
    marginTop: Space[2],
    marginBottom: Space[3],
    gap: Space[2],
    paddingLeft: Space[2],
  },
  submenuBlock: {
    marginLeft: Space[3],
    marginTop: 0,
    marginBottom: Space[3],
    paddingLeft: Space[2],
    position: 'relative',
    gap: Space[2],
  },
  submenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space[2],
  },
  horizontalConnector: {
    width: Space[2],
    height: 2,
    backgroundColor: Colors.textDisabled,
    marginLeft: -Space[2],
    marginRight: Space[1],
    borderRadius: 2,
  },
  connectorStub: {
    alignSelf: 'flex-start',
    marginLeft: Space[3],
    width: 2,
    height: Space[3],
    backgroundColor: Colors.textDisabled,
    borderRadius: 2,
  },
  verticalSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.textDisabled,
    borderRadius: 2,
  },
  submenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space[2],
    paddingHorizontal: Space[3],
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
  },
  submenuText: {
    ...Typography.body,
    color: Colors.text,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: Space[2],
  },
  actionText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Space[0],
  },
  actionDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 16,
  },
});

export default MesocycleKebabTooltip;
