import { FC } from 'react';
import { Text, View } from 'react-native';

import { Input, TitleWithTooltip } from '../../../../../../../components';

import { styles } from './styles';

export type MesocycleNameFieldProps = {
  value: string;
  name: string;
  onChange: (name: string, value: string) => void;
};

export const MesocycleNameField: FC<MesocycleNameFieldProps> = ({
  name,
  value,
  onChange,
}) => {
  const handleChangeText = (text: string) => {
    onChange(name, text);
  };

  return (
    <View style={styles.nameInputContainer}>
      <TitleWithTooltip
        title='Mesocycle Name'
        titleStyle={styles.nameInputLabel}
        tooltipContent={
          <View style={styles.tooltipContent}>
            <View style={styles.tooltipSection}>
              <Text style={styles.tooltipSectionText}>
                A mesocycle is a 4-8 week training phase where you focus on one
                specific fitness goal (like increase chest size, glute strength,
                or improve overall endurance).
              </Text>
            </View>

            <View style={styles.tooltipSection}>
              <Text style={styles.tooltipSectionTitle}>
                First time naming a mesocycle?
              </Text>
              <Text style={styles.tooltipSectionText}>
                Name your mesocycle to remember what you worked on and when. Use
                this format: Goal + days/week + month. If you have a specific
                theme or timeline, like Summer Vacation Prep, add that context
                too.
              </Text>
            </View>

            <View style={styles.tooltipSection}>
              <Text style={styles.tooltipSectionTitle}>Examples:</Text>
              <View style={styles.tooltipList}>
                <Text style={styles.tooltipListItem}>
                  - Glute & Calves 4d Sep &apos;25
                </Text>
                <Text style={styles.tooltipListItem}>
                  - Chest & Back 5d Jan &apos;26
                </Text>
                <Text style={styles.tooltipListItem}>
                  - Full Body Time Saver 3d Mar &apos;26
                </Text>
              </View>
            </View>

            <View style={styles.tooltipCtas}>
              <Text style={styles.tooltipCta}>
                Keep it concise so it&apos;s easy to scan when browsing your
                training history.
              </Text>
            </View>
          </View>
        }
      />

      <Text style={styles.customNameText}>
        You can create a custom name if desired.
      </Text>

      <Input
        placeholder='Enter mesocycle name...'
        value={value}
        onChangeText={handleChangeText}
        autoCorrect={false}
      />
    </View>
  );
};
