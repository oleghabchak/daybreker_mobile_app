import { FC, useState } from "react";
import { View, ScrollView } from 'react-native';

import {
  MesocycleNameField,
  MesocycleDaysColumnsField,
  useIsDaysColumnsValid,
  type DayColumn
} from "./fields";
import { CancelButton, CopyButton } from "./buttons";

import { styles } from "./styles";

export type MesocycleExercisesFormProps = {
  initialState?: {
    mesocycleName: string;
    daysColumns: DayColumn[];
  };
  onCopy?: (mesocycleName: string, daysColumns: DayColumn[]) => Promise<void>;
  isLoading?: boolean;
}

export const MesocycleExercisesForm: FC<MesocycleExercisesFormProps> = ({ 
  initialState = {
    mesocycleName: '',
    daysColumns: [],
  },
  onCopy,
  isLoading = false,
}) => {
  const [formState, setFormState] = useState(initialState);

  const isFormValid = useIsDaysColumnsValid(formState.daysColumns);
  
  const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);

  const handleOnChange = (name: string, value: unknown) =>
    setFormState(prev => ({ ...prev, [name]: value }));

  const handleSubmit = async () => {
    if (onCopy) {
      await onCopy(formState.mesocycleName, formState.daysColumns);
      return;
    }
    setShowCreateConfirmation(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Fields */}
        <MesocycleNameField
          name="mesocycleName"
          value={formState.mesocycleName}
          onChange={handleOnChange}
        />
        <MesocycleDaysColumnsField
          name="daysColumns"
          value={formState.daysColumns}
          onChange={handleOnChange}
        />
      </ScrollView>

      {/* Actions pinned to bottom */}
      <View style={styles.actions}>
        <CancelButton isLoading={isLoading} />
        <CopyButton
          isLoading={isLoading}
          isFormValid={isFormValid}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}