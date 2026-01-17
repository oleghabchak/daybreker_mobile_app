import React from 'react';
import { Text, View } from 'react-native';

import { Tag } from '../../../../components';
import { Colors, Space } from '../../../../constants/theme';

import { styles } from './SetRow.styles';

interface SetTooltipProps {
  isCalibrationSet: boolean;
  isValidationSet: boolean;
}

export const SetTooltip: React.FC<SetTooltipProps> = ({
  isCalibrationSet,
  isValidationSet,
}) => {
  if (isCalibrationSet) {
    // Calibration Set Content (Week 1, Set 1)
    return (
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipMainTitle}>REPS</Text>
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>Reps & RIR</Text>
          <Text style={styles.tooltipSectionText}>
            A rep is one complete movement. RIR (reps in reserve) = how many
            more reps you could do with perfect form.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>How It Works:</Text>
          <Text style={styles.tooltipSectionText}>
            &quot;8-12 reps at RIR 2&quot; means: Pick a weight where rep 10
            feels hard, 11 would be a fight, and 12 would break form. Stop at
            10. Those 2 reps you could&apos;ve done? That&apos;s RIR 2.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>The RIR Scale:</Text>
          <Text style={styles.tooltipSectionText}>
            • RIR 0 = Complete failure{'\n'}• RIR 2-3 = Sweet spot for growth
            {'\n'}• RIR 4+ = Too easy for muscle, good for maintenance
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>
            Why Leave Reps in Reserve?
          </Text>
          <Text style={styles.tooltipSectionText}>
            Your Central Nervous System treats all stress the same, training or
            life. Research shows RIR 0 and RIR 2 produce identical muscle
            growth, but consistent RIR 0 creates systemic fatigue lasting days.
            This limits your effort and reduces total lifting volume, the key
            driver of gains.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Tag
            variant='outlineRed'
            text='Calibration Set'
            size='large'
            style={{
              width: '50%',
              marginBottom: Space[1],
            }}
          />

          <Text style={styles.tooltipSectionText}>
            <Text
              style={[
                styles.tooltipBoldText,
                {
                  fontWeight: '700',
                  fontFamily: 'System',
                  color: Colors.error,
                },
              ]}
            >
              10RM (Rep Max)
            </Text>
            {'\n'}
            <Text
              style={[
                styles.tooltipBoldText,
                {
                  fontWeight: '700',
                  fontFamily: 'System',
                  color: Colors.error,
                },
              ]}
            >
              Week 1, Set 1 ONLY
            </Text>
            {'\n'}
            1: Do your warm-up sets (required){'\n'}
            2: Work up to weight you can lift for 10 reps (RIR 0){'\n'}
            3: Lift until your form breaks, then stop (&quot;form failure&quot;)
            {'\n'}
            4: Log your reps. Ok if slightly higher/lower than 10 reps.{'\n'}
            5: Complete all other sets at prescribed RIR
          </Text>
        </View>
      </View>
    );
  }

  if (isValidationSet) {
    // Validation Set Content (Week 1, Set 2)
    return (
      <View style={styles.tooltipContent}>
        <Text style={styles.tooltipMainTitle}>REPS</Text>
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>Reps & RIR</Text>
          <Text style={styles.tooltipSectionText}>
            A rep is one complete movement. RIR (reps in reserve) = how many
            more reps you could do with perfect form.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>How It Works:</Text>
          <Text style={styles.tooltipSectionText}>
            &quot;8-12 reps at RIR 2&quot; means: Pick a weight where rep 10
            feels hard, 11 would be a fight, and 12 would break form. Stop at
            10. Those 2 reps you could&apos;ve done? That&apos;s RIR 2.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>The RIR Scale:</Text>
          <Text style={styles.tooltipSectionText}>
            • RIR 0 = Complete failure{'\n'}• RIR 2-3 = Sweet spot for growth
            {'\n'}• RIR 4+ = Too easy for muscle, good for maintenance
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Text style={styles.tooltipSectionTitle}>
            Why Leave Reps in Reserve?
          </Text>
          <Text style={styles.tooltipSectionText}>
            Your Central Nervous System treats all stress the same, training or
            life. Research shows RIR 0 and RIR 2 produce identical muscle
            growth, but consistent RIR 0 creates systemic fatigue lasting days.
            This limits your effort and reduces total lifting volume, the key
            driver of gains.
          </Text>
        </View>
        <View style={styles.tooltipDivider} />
        <View style={styles.tooltipSection}>
          <Tag
            variant='outlineBlue'
            text='Validation Set'
            size='large'
            style={{
              width: '50%',
              marginBottom: Space[1],
            }}
          />
          <Text style={styles.tooltipSectionText}>
            <Text
              style={[
                styles.tooltipBoldText,
                {
                  fontWeight: '700',
                  fontFamily: 'System',
                  color: Colors.secondary,
                },
              ]}
            >
              Week 1, Set 2 ONLY
            </Text>
            {'\n'}
            1: Use the weight from your calibration set{'\n'}
            2: Perform at prescribed RIR {'\n'}
            3: This validates your calibration was accurate{'\n'}
            4: Adjust weight to feel comfortable if needed for future sets
          </Text>
        </View>
      </View>
    );
  }

  // Standard Content (All other sets)
  return (
    <View style={styles.tooltipContent}>
      <Text style={styles.tooltipMainTitle}>REPS</Text>
      <View style={styles.tooltipSection}>
        <Text style={styles.tooltipSectionTitle}>Reps & RIR</Text>
        <Text style={styles.tooltipSectionText}>
          A rep is one complete movement. RIR (reps in reserve) = how many more
          reps you could do with perfect form.
        </Text>
      </View>
      <View style={styles.tooltipDivider} />
      <View style={styles.tooltipSection}>
        <Text style={styles.tooltipSectionTitle}>How It Works:</Text>
        <Text style={styles.tooltipSectionText}>
          &quot;8-12 reps at RIR 2&quot; means: Pick a weight where rep 10 feels
          hard, 11 would be a fight, and 12 would break form. Stop at 10. Those
          2 reps you could&apos;ve done? That&apos;s RIR 2.
        </Text>
      </View>
      <View style={styles.tooltipDivider} />
      <View style={styles.tooltipSection}>
        <Text style={styles.tooltipSectionTitle}>The RIR Scale:</Text>
        <Text style={styles.tooltipSectionText}>
          • RIR 0 = Complete failure{'\n'}• RIR 2-3 = Sweet spot for growth
          {'\n'}• RIR 4+ = Too easy for muscle, good for maintenance
        </Text>
      </View>
      <View style={styles.tooltipDivider} />
      <View style={styles.tooltipSection}>
        <Text style={styles.tooltipSectionTitle}>
          Why Leave Reps in Reserve?
        </Text>
        <Text style={styles.tooltipSectionText}>
          Your Central Nervous System treats all stress the same, training or
          life. Research shows RIR 0 and RIR 2 produce identical muscle growth,
          but consistent RIR 0 creates systemic fatigue lasting days. This
          limits your effort and reduces total lifting volume, the key driver of
          gains.
        </Text>
      </View>
    </View>
  );
};

export default SetTooltip;
