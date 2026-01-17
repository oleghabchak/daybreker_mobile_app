import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Heart } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Space } from '../../../constants/theme';

interface AgeReversalInsightProps {
  onViewProtocol?: () => void;
}

export const AgeReversalInsight: React.FC<AgeReversalInsightProps> = ({
  onViewProtocol,
}) => {
  return (
    <View style={[styles.section, styles.lastSection]}>
      <Text style={styles.metricsHeader}>AGE REVERSAL INSIGHT</Text>
      <LinearGradient
        colors={['#ECFDF5', '#F0FDF4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.insightCard}
      >
        <View style={styles.insightIcon}>
          <Heart size={16} color={'#16a34a'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.insightText}>
            Your biological age decreased by 0.6 years this month. Your improved
            sleep quality (up 15%) is the primary driver.
          </Text>
          <TouchableOpacity
            style={styles.insightCta}
            activeOpacity={0.8}
            onPress={onViewProtocol}
          >
            <Text style={styles.insightCtaText}>
              View Age Optimization Protocol
            </Text>
            <ChevronRight size={16} color={'#16a34a'} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Space[6],
    marginBottom: Space[6],
  },
  lastSection: {
    marginBottom: 0,
  },
  metricsHeader: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
    marginBottom: Space[3],
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: BorderRadius.md,
    padding: Space[4],
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space[3],
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: Space[2],
  },
  insightCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightCtaText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
