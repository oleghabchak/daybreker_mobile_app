import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

interface Props {
  navigation: any;
}

interface MedicalCondition {
  icd10_code: string;
  name: string;
  category: string;
  description?: string;
}

const COMMON_CONDITIONS: MedicalCondition[] = [
  {
    icd10_code: 'I10',
    name: 'High Blood Pressure',
    category: 'Cardiovascular',
  },
  { icd10_code: 'E11.9', name: 'Type 2 Diabetes', category: 'Endocrine' },
  { icd10_code: 'E78.5', name: 'High Cholesterol', category: 'Endocrine' },
  { icd10_code: 'J45.9', name: 'Asthma', category: 'Respiratory' },
  { icd10_code: 'F32.9', name: 'Depression', category: 'Mental Health' },
  { icd10_code: 'F41.9', name: 'Anxiety', category: 'Mental Health' },
  { icd10_code: 'M25.50', name: 'Arthritis', category: 'Musculoskeletal' },
  {
    icd10_code: 'K21.9',
    name: 'GERD/Acid Reflux',
    category: 'Gastrointestinal',
  },
  { icd10_code: 'G43.909', name: 'Migraines', category: 'Neurological' },
  { icd10_code: 'E03.9', name: 'Hypothyroidism', category: 'Endocrine' },
  { icd10_code: 'G47.00', name: 'Insomnia', category: 'Sleep' },
  {
    icd10_code: 'M54.9',
    name: 'Chronic Back Pain',
    category: 'Musculoskeletal',
  },
];

export const MedicalHistoryScreen = ({ navigation }: Props) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());
  const [allConditions, setAllConditions] =
    useState<MedicalCondition[]>(COMMON_CONDITIONS);

  useEffect(() => {
    loadExistingData();
    loadConditionsFromDB();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const loadConditionsFromDB = async () => {
    try {
      const { data: conditions } = await supabase
        .from('medical_conditions_ref')
        .select('icd10_code, name, category, description')
        .order('name');

      if (conditions) {
        setAllConditions(conditions);
      }
    } catch (error) {
      console.warn('Error loading conditions:', error);
    }
  };

  const loadExistingData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('onboarding_progress')
          .select('data_collected')
          .eq('user_id', user.id)
          .eq('screen_name', 'MedicalHistory')
          .single();

        if (progress?.data_collected?.conditions) {
          setSelectedConditions(progress.data_collected.conditions);
        }
      }
    } catch (error) {
      console.warn('Error loading existing data:', error);
    }
  };

  const trackScreenTime = async () => {
    const timeSpent = Math.round((Date.now() - screenStartTime) / 1000);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('screen_analytics').insert({
          user_id: user.id,
          screen_name: 'MedicalHistory',
          time_spent_seconds: timeSpent,
          interactions: selectedConditions.length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'MedicalHistory',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            conditions: selectedConditions,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const toggleCondition = (conditionCode: string) => {
    setSelectedConditions(prev =>
      prev.includes(conditionCode)
        ? prev.filter(code => code !== conditionCode)
        : [...prev, conditionCode]
    );
  };

  const addCustomCondition = () => {
    if (!customCondition.trim()) return;

    // For custom conditions, use a temporary code
    const tempCode = `CUSTOM_${Date.now()}`;
    setSelectedConditions(prev => [...prev, tempCode]);
    setCustomCondition('');
    setShowAddModal(false);
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save selected conditions to user_conditions table
        for (const conditionCode of selectedConditions) {
          if (!conditionCode.startsWith('CUSTOM_')) {
            await supabase.from('user_conditions').upsert({
              user_id: user.id,
              icd10_code: conditionCode,
              is_active: true,
              effective_from: new Date().toISOString(),
              version: 1,
            });
          }
        }

        navigation.navigate('Medications');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save medical history. Please try again.');
      console.error('Error saving medical history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConditions = allConditions.filter(
    condition =>
      condition.name.toLowerCase().includes(searchText.toLowerCase()) ||
      condition.category.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.headerSubtitle}>
            Select any current medical conditions. This helps us provide safer,
            more personalized recommendations.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '23%' }]} />
          </View>
          <Text style={styles.progressText}>3 of 14</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search conditions...'
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.conditionsContainer}>
          <Text style={styles.sectionTitle}>Common Conditions</Text>
          {filteredConditions.map(condition => (
            <TouchableOpacity
              key={condition.icd10_code}
              style={[
                styles.conditionCard,
                selectedConditions.includes(condition.icd10_code) &&
                  styles.conditionCardSelected,
              ]}
              onPress={() => toggleCondition(condition.icd10_code)}
            >
              <View style={styles.conditionHeader}>
                <Text
                  style={[
                    styles.conditionName,
                    selectedConditions.includes(condition.icd10_code) &&
                      styles.conditionNameSelected,
                  ]}
                >
                  {condition.name}
                </Text>
                <Text style={styles.conditionCategory}>
                  {condition.category}
                </Text>
              </View>
              {condition.description && (
                <Text style={styles.conditionDescription}>
                  {condition.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Custom Condition</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.noneButton]}
            onPress={() => setSelectedConditions([])}
          >
            <Text style={styles.noneButtonText}>None of the above</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.selectionCount}>
            {selectedConditions.length} condition
            {selectedConditions.length !== 1 ? 's' : ''} selected
          </Text>
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollViewWithIndicator>

      <Modal visible={showAddModal} transparent={true} animationType='slide'>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Condition</Text>
            <TextInput
              style={styles.modalInput}
              placeholder='Enter condition name'
              value={customCondition}
              onChangeText={setCustomCondition}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setCustomCondition('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={addCustomCondition}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  header: {
    paddingHorizontal: Space[6],
    paddingTop: Space[6],
    paddingBottom: Space[8],
  },
  backButton: {
    marginBottom: Space[6],
  },
  backText: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textDisabled,
    marginBottom: Space[6],
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Space[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: Space[6],
    marginBottom: Space[6],
  },
  searchInput: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    backgroundColor: '#F8F9FA',
  },
  conditionsContainer: {
    paddingHorizontal: Space[6],
    flex: 1,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },
  conditionCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    backgroundColor: '#F8F9FA',
  },
  conditionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  conditionName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  conditionNameSelected: {
    color: Colors.primary,
  },
  conditionCategory: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  conditionDescription: {
    ...Typography.caption,
    color: Colors.textDisabled,
    lineHeight: 18,
  },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginTop: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },
  noneButton: {
    padding: Space[4],
    alignItems: 'center',
    marginBottom: Space[6],
  },
  noneButtonText: {
    ...Typography.body,
    color: Colors.textDisabled,
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: Space[6],
    paddingBottom: Space[6],
    paddingTop: Space[4],
  },
  selectionCount: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: 'center',
    marginBottom: Space[4],
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Space[4],
    alignItems: 'center',
  },
  continueButtonText: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Space[8],
    marginHorizontal: Space[6],
    width: '80%',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[6],
    textAlign: 'center',
  },
  modalInput: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    marginBottom: Space[6],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[4],
    marginRight: Space[2],
    alignItems: 'center',
  },
  modalCancelText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[4],
    marginLeft: Space[2],
    alignItems: 'center',
  },
  modalAddText: {
    ...Typography.bodyMedium,
    color: Colors.background,
  },
});
