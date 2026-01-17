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

interface Medication {
  rxnorm_code: string;
  name: string;
  generic_name?: string;
  brand_names: string[];
  category?: string;
}

const COMMON_MEDICATIONS: Medication[] = [
  {
    rxnorm_code: '308136',
    name: 'Lisinopril',
    generic_name: 'lisinopril',
    brand_names: ['Prinivil', 'Zestril'],
    category: 'Blood Pressure',
  },
  {
    rxnorm_code: '1114195',
    name: 'Atorvastatin',
    generic_name: 'atorvastatin',
    brand_names: ['Lipitor'],
    category: 'Cholesterol',
  },
  {
    rxnorm_code: '6809',
    name: 'Metformin',
    generic_name: 'metformin',
    brand_names: ['Glucophage'],
    category: 'Diabetes',
  },
  {
    rxnorm_code: '32937',
    name: 'Sertraline',
    generic_name: 'sertraline',
    brand_names: ['Zoloft'],
    category: 'Antidepressant',
  },
  {
    rxnorm_code: '161',
    name: 'Metoprolol',
    generic_name: 'metoprolol',
    brand_names: ['Lopressor'],
    category: 'Heart',
  },
  {
    rxnorm_code: '7052',
    name: 'Acetaminophen',
    generic_name: 'acetaminophen',
    brand_names: ['Tylenol'],
    category: 'Pain Relief',
  },
  {
    rxnorm_code: '5640',
    name: 'Ibuprofen',
    generic_name: 'ibuprofen',
    brand_names: ['Advil', 'Motrin'],
    category: 'Pain Relief',
  },
  {
    rxnorm_code: '10582',
    name: 'Levothyroxine',
    generic_name: 'levothyroxine',
    brand_names: ['Synthroid'],
    category: 'Thyroid',
  },
  {
    rxnorm_code: '1998',
    name: 'Albuterol',
    generic_name: 'albuterol',
    brand_names: ['ProAir'],
    category: 'Asthma',
  },
  {
    rxnorm_code: '7646',
    name: 'Omeprazole',
    generic_name: 'omeprazole',
    brand_names: ['Prilosec'],
    category: 'Acid Reflux',
  },
];

interface SelectedMedication {
  rxnorm_code: string;
  name: string;
  dosage?: string;
  frequency?: string;
}

export const MedicationsScreen = ({ navigation }: Props) => {
  const [selectedMedications, setSelectedMedications] = useState<
    SelectedMedication[]
  >([]);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [customMedication, setCustomMedication] = useState('');
  const [editingMedication, setEditingMedication] =
    useState<SelectedMedication | null>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('once_daily');
  const [loading, setLoading] = useState(false);
  const [screenStartTime] = useState(Date.now());
  const [allMedications, setAllMedications] =
    useState<Medication[]>(COMMON_MEDICATIONS);

  const frequencies = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'three_times_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'as_needed', label: 'As needed' },
    { value: 'weekly', label: 'Weekly' },
  ];

  useEffect(() => {
    loadExistingData();
    loadMedicationsFromDB();
    return () => {
      trackScreenTime().catch(console.warn);
    };
  }, []);

  const loadMedicationsFromDB = async () => {
    try {
      const { data: medications } = await supabase
        .from('medications_ref')
        .select('rxnorm_code, name, generic_name, brand_names, category')
        .order('name');

      if (medications) {
        setAllMedications(medications);
      }
    } catch (error) {
      console.warn('Error loading medications:', error);
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
          .eq('screen_name', 'Medications')
          .single();

        if (progress?.data_collected?.medications) {
          setSelectedMedications(progress.data_collected.medications);
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
          screen_name: 'Medications',
          time_spent_seconds: timeSpent,
          interactions: selectedMedications.length,
        });

        await supabase.from('onboarding_progress').upsert({
          user_id: user.id,
          screen_name: 'Medications',
          completed: true,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          data_collected: {
            medications: selectedMedications,
          },
        });
      }
    } catch (error) {
      console.warn('Error tracking screen time:', error);
    }
  };

  const addMedication = (medication: Medication) => {
    setEditingMedication({
      rxnorm_code: medication.rxnorm_code,
      name: medication.name,
    });
    setDosage('');
    setFrequency('once_daily');
    setShowAddModal(true);
  };

  const saveMedication = () => {
    if (!editingMedication || !dosage.trim()) {
      Alert.alert('Missing Information', 'Please enter dosage information');
      return;
    }

    const newMedication: SelectedMedication = {
      ...editingMedication,
      dosage: dosage.trim(),
      frequency,
    };

    setSelectedMedications(prev => {
      const existingIndex = prev.findIndex(
        med => med.rxnorm_code === editingMedication.rxnorm_code
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newMedication;
        return updated;
      }
      return [...prev, newMedication];
    });

    setShowAddModal(false);
    setEditingMedication(null);
    setDosage('');
    setFrequency('once_daily');
  };

  const removeMedication = (rxnormCode: string) => {
    setSelectedMedications(prev =>
      prev.filter(med => med.rxnorm_code !== rxnormCode)
    );
  };

  const addCustomMedication = () => {
    if (!customMedication.trim()) return;

    const tempCode = `CUSTOM_${Date.now()}`;
    setEditingMedication({
      rxnorm_code: tempCode,
      name: customMedication.trim(),
    });
    setCustomMedication('');
    setDosage('');
    setFrequency('once_daily');
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Save medications to user_medications table
        for (const medication of selectedMedications) {
          if (!medication.rxnorm_code.startsWith('CUSTOM_')) {
            const [amount, unit] = medication.dosage?.split(' ') || ['0', 'mg'];
            await supabase.from('user_medications').upsert({
              user_id: user.id,
              rxnorm_code: medication.rxnorm_code,
              dosage_amount: parseFloat(amount) || 0,
              dosage_unit: unit || 'mg',
              frequency: medication.frequency || 'once_daily',
              start_date: new Date().toISOString().split('T')[0],
              is_active: true,
              version: 1,
            });
          }
        }

        navigation.navigate('Lifestyle');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save medications. Please try again.');
      console.error('Error saving medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = allMedications.filter(
    medication =>
      medication.name.toLowerCase().includes(searchText.toLowerCase()) ||
      medication.generic_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      medication.brand_names.some(brand =>
        brand.toLowerCase().includes(searchText.toLowerCase())
      )
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
          <Text style={styles.headerTitle}>Current Medications</Text>
          <Text style={styles.headerSubtitle}>
            Add any medications you're currently taking. This helps us check for
            interactions and provide safer recommendations.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '31%' }]} />
          </View>
          <Text style={styles.progressText}>4 of 14</Text>
        </View>

        {selectedMedications.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={styles.sectionTitle}>Your Medications</Text>
            {selectedMedications.map(medication => (
              <View key={medication.rxnorm_code} style={styles.selectedMedCard}>
                <View style={styles.selectedMedInfo}>
                  <Text style={styles.selectedMedName}>{medication.name}</Text>
                  <Text style={styles.selectedMedDetails}>
                    {medication.dosage} •{' '}
                    {
                      frequencies.find(f => f.value === medication.frequency)
                        ?.label
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMedication(medication.rxnorm_code)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search medications...'
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.medicationsContainer}>
          <Text style={styles.sectionTitle}>Common Medications</Text>
          {filteredMedications.slice(0, 10).map(medication => (
            <TouchableOpacity
              key={medication.rxnorm_code}
              style={styles.medicationCard}
              onPress={() => addMedication(medication)}
            >
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <Text style={styles.medicationGeneric}>
                  {medication.generic_name} • {medication.category}
                </Text>
                {medication.brand_names.length > 0 && (
                  <Text style={styles.medicationBrands}>
                    Brand names: {medication.brand_names.join(', ')}
                  </Text>
                )}
              </View>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.customButton}
            onPress={() => {
              setEditingMedication({
                rxnorm_code: `CUSTOM_${Date.now()}`,
                name: '',
              });
              setDosage('');
              setFrequency('once_daily');
              setShowAddModal(true);
            }}
          >
            <Text style={styles.customButtonText}>+ Add Custom Medication</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noneButton}
            onPress={() => setSelectedMedications([])}
          >
            <Text style={styles.noneButtonText}>
              I don't take any medications
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.selectionCount}>
            {selectedMedications.length} medication
            {selectedMedications.length !== 1 ? 's' : ''} added
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
            <Text style={styles.modalTitle}>
              {editingMedication?.rxnorm_code.startsWith('CUSTOM_')
                ? 'Add Custom Medication'
                : 'Add Medication'}
            </Text>

            {editingMedication?.rxnorm_code.startsWith('CUSTOM_') ? (
              <TextInput
                style={styles.modalInput}
                placeholder='Medication name'
                value={editingMedication.name}
                onChangeText={text =>
                  setEditingMedication({ ...editingMedication, name: text })
                }
                autoFocus
              />
            ) : (
              <Text style={styles.medicationNameDisplay}>
                {editingMedication?.name}
              </Text>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder='Dosage (e.g., 10 mg, 1 tablet)'
              value={dosage}
              onChangeText={setDosage}
            />

            <Text style={styles.modalLabel}>Frequency:</Text>
            <ScrollViewWithIndicator
              style={styles.frequencyScroll}
              showsVerticalScrollIndicator={false}
            >
              {frequencies.map(freq => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyOption,
                    frequency === freq.value && styles.frequencyOptionSelected,
                  ]}
                  onPress={() => setFrequency(freq.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === freq.value && styles.frequencyTextSelected,
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollViewWithIndicator>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingMedication(null);
                  setDosage('');
                  setFrequency('once_daily');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  (!dosage.trim() || !editingMedication?.name.trim()) &&
                    styles.buttonDisabled,
                ]}
                onPress={saveMedication}
                disabled={!dosage.trim() || !editingMedication?.name.trim()}
              >
                <Text style={styles.modalSaveText}>Add</Text>
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
  selectedContainer: {
    paddingHorizontal: Space[6],
    marginBottom: Space[6],
  },
  selectedMedCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
  },
  selectedMedInfo: {
    flex: 1,
  },
  selectedMedName: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: Space[1],
  },
  selectedMedDetails: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: 'bold',
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
  medicationsContainer: {
    paddingHorizontal: Space[6],
    flex: 1,
  },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },
  medicationCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginBottom: Space[2],
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  medicationGeneric: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginBottom: Space[1],
  },
  medicationBrands: {
    ...Typography.caption,
    color: Colors.textDisabled,
    fontStyle: 'italic',
  },
  addIcon: {
    fontSize: 24,
    color: Colors.primary,
    marginLeft: Space[4],
  },
  customButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Space[4],
    marginTop: Space[4],
    marginBottom: Space[2],
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  customButtonText: {
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
    opacity: 0.5,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[6],
    textAlign: 'center',
  },
  medicationNameDisplay: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    padding: Space[4],
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.md,
    marginBottom: Space[4],
    textAlign: 'center',
  },
  modalInput: {
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Space[4],
    paddingVertical: Space[4],
    marginBottom: Space[4],
  },
  modalLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[2],
  },
  frequencyScroll: {
    maxHeight: 150,
    marginBottom: Space[6],
  },
  frequencyOption: {
    paddingVertical: Space[2],
    paddingHorizontal: Space[4],
    borderRadius: BorderRadius.sm,
    marginBottom: Space[1],
  },
  frequencyOptionSelected: {
    backgroundColor: Colors.primary + '20',
  },
  frequencyText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  frequencyTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
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
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Space[4],
    marginLeft: Space[2],
    alignItems: 'center',
  },
  modalSaveText: {
    ...Typography.bodyMedium,
    color: Colors.background,
  },
});
