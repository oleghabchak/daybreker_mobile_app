import {
  Apple,
  Brain,
  Dumbbell,
  Heart,
  Moon,
  Scale,
  Star,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ScrollViewWithIndicator } from '../components/ScrollViewWithIndicator';
import { BorderRadius, Colors, Space, Typography } from '../constants/theme';
import { supabase } from '../lib/supabase';

const PRIORITIES = [
  { id: 'energy', label: 'Boost Energy', icon: Zap },
  { id: 'sleep', label: 'Better Sleep', icon: Moon },
  { id: 'weight', label: 'Manage Weight', icon: Scale },
  { id: 'stress', label: 'Reduce Stress', icon: Heart },
  { id: 'fitness', label: 'Improve Fitness', icon: Dumbbell },
  { id: 'nutrition', label: 'Eat Healthier', icon: Apple },
  { id: 'focus', label: 'Mental Clarity', icon: Brain },
  { id: 'longevity', label: 'Live Longer', icon: Star },
];

export const PrioritiesScreen = ({ navigation }: any) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePriority = (id: string) => {
    if (selectedPriorities.includes(id)) {
      setSelectedPriorities(selectedPriorities.filter(p => p !== id));
    } else if (selectedPriorities.length < 3) {
      setSelectedPriorities([...selectedPriorities, id]);
    } else {
      Alert.alert(
        'Limit Reached',
        'Please select up to 3 priorities to focus on'
      );
    }
  };

  const handleSave = async () => {
    if (selectedPriorities.length === 0) {
      Alert.alert('Select Priorities', 'Please select at least one priority');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Save priorities
      await supabase.from('user_priorities').insert({
        user_id: user.id,
        priorities: selectedPriorities,
      });

      // Update profile as onboarded
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What are your health goals?</Text>
          <Text style={styles.subtitle}>
            Select up to 3 priorities to personalize your experience
          </Text>
        </View>

        <View style={styles.grid}>
          {PRIORITIES.map(priority => {
            const isSelected = selectedPriorities.includes(priority.id);
            return (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityCard,
                  isSelected && styles.priorityCardSelected,
                ]}
                onPress={() => togglePriority(priority.id)}
                activeOpacity={0.7}
              >
                <priority.icon
                  size={32}
                  color={isSelected ? Colors.background : Colors.textPrimary}
                />
                <Text
                  style={[
                    styles.priorityLabel,
                    isSelected && styles.priorityLabelSelected,
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.selectedCount}>
            {selectedPriorities.length}/3 selected
          </Text>
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedPriorities.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={selectedPriorities.length === 0 || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollViewWithIndicator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Space[6],
    paddingVertical: Space[8],
  },
  header: {
    marginBottom: Space[8],
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Space[2],
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Space[8],
  },
  priorityCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.lg,
    padding: Space[6],
    alignItems: 'center',
    marginBottom: Space[4],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priorityCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary + '20',
  },
  priorityEmoji: {
    fontSize: 40,
    marginBottom: Space[2],
  },
  priorityLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  priorityLabelSelected: {
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
  },
  selectedCount: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[4],
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[4],
    paddingHorizontal: Space[12],
    alignItems: 'center',
    minWidth: 200,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontSize: 18,
  },
});
