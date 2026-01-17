import { CircleX } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import SwitchSelector from 'react-native-switch-selector';

import {
  BorderRadius,
  Colors,
  Space,
  Typography,
} from '../../../../constants/theme';

interface SwitchSelectorOption {
  label: string;
  value: string;
}

interface ModalHeaderProps {
  title: string;
  type: SwitchSelectorOption;
  onTypeChange: (type: SwitchSelectorOption) => void;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  type,
  onTypeChange,
  onClose,
}) => {
  return (
    <View style={styles.modalHeader}>
      <View style={styles.headerContent}>
        <Text style={styles.modalTitle}>{title}</Text>

        <SwitchSelector
          options={[
            { label: 'Exercises Library', value: 'library' },
            { label: 'Custom Exercises', value: 'custom' },
          ]}
          fontSize={13}
          hasPadding
          animationDuration={300}
          selectedColor={Colors.background}
          buttonColor={Colors.secondary}
          borderColor={Colors.secondary}
          initial={type.value === 'library' ? 0 : 1}
          onPress={(value: string) => {
            const option = [
              { label: 'Exercises Library', value: 'library' },
              { label: 'Custom Exercises', value: 'custom' },
            ].find(opt => opt.value === value);
            if (option) {
              onTypeChange(option);
            }
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <CircleX size={20} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Space[8],
    paddingTop: Space[3],
    paddingBottom: Space[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Space[1],
  },
  closeButton: {
    position: 'absolute',
    right: Space[6],
    top: Space[6],
  },
});
