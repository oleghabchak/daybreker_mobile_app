import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplets, Info, ChevronDown, ChevronUp, Camera, Barcode, Mic, Plus } from 'lucide-react-native';
import { Header } from '../../components/ui/Header';

// Mock data
const mockData = {
  calorieGoal: {
    current: 765,
    target: 2200,
    goal: 'Muscle Gain',
  },
  macros: [
    { name: 'Protein', current: 765, target: 2200, color: '#306d7e' },
    { name: 'Carbs', current: 765, target: 2200, color: '#3692b0' },
    { name: 'Fat', current: 765, target: 2200, color: '#61b0d0' },
  ],
  meals: [
    {
      time: '8:10AM',
      name: 'Greek yogurt, 2% --170 g',
      calories: 130,
      macros: { protein: 15, carbs: 6, fat: 4, fiber: 0 },
    },
    {
      time: '8:10AM',
      name: 'Greek yogurt, 2% --170 g',
      calories: 130,
      macros: { protein: 15, carbs: 6, fat: 4, fiber: 0 },
    },
    {
      time: '8:10AM',
      name: 'Greek yogurt, 2% --170 g',
      calories: 130,
      macros: { protein: 15, carbs: 6, fat: 4, fiber: 0 },
    },
  ],
  hydration: [
    { activity: 'Rest Day', amount: '2.5L', drops: 1 },
    { activity: 'Workout', amount: '2.5L', drops: 2 },
    { activity: 'Active', amount: '2.5L', drops: 3 },
  ],
  supplements: [
    { time: 'AM', name: 'Vitamin D3', dosage: '2000 IU', bgColor: '#ffeaa3', borderColor: '#1084a2' },
    { time: 'PM', name: 'Vitamin D3', dosage: '2000 IU', bgColor: '#f9b675', borderColor: '#1084a2' },
    { time: 'PM', name: 'Vitamin D3', dosage: '2000 IU', bgColor: '#b8dde6', borderColor: '#1084a2' },
  ],
};

const DietSupplementsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [supplementsExpanded, setSupplementsExpanded] = useState(true);

  const handleQuickAction = (action: string) => {
    Alert.alert('Quick Action', `${action} feature coming soon!`, [{ text: 'OK' }]);
  };

  const handleCalendarPress = () => {
    handleQuickAction('Calendar');
  };

  const handleNotificationPress = () => {
    handleQuickAction('Notifications');
  };


  // Calorie Card Component
  const CalorieCard = () => {
    return (
      <View style={styles.calorieCard}>
        {/* Left Section - Muscle Gain Badge */}
        <View style={styles.leftSection}>
          <View style={styles.goalPill}>
            <Text style={styles.goalText}>{mockData.calorieGoal.goal}</Text>
          </View>
          <Text style={styles.calorieText}>
            {mockData.calorieGoal.current}/{mockData.calorieGoal.target} KCAL
          </Text>
        </View>

        {/* Right Section - Macros */}
        <View style={styles.rightSection}>
          {mockData.macros.map((macro, index) => {
            const macroProgress = (macro.current / macro.target) * 100;
            const fillWidth = (58 / 151) * 100; // 58px out of 151px = ~38%
            
            return (
              <View key={index} style={styles.macroRow}>
                <View style={styles.macroHeader}>
                  <Text style={styles.macroLabel}>{macro.name}</Text>
                  <Text style={styles.macroValue}>
                    {macro.current}/{macro.target} kcal
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${fillWidth}%`,
                          backgroundColor: macro.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Action Buttons Component
  const ActionButtons = () => {
    const buttonConfig = [
      { text: 'CAMERA', icon: Camera },
      { text: 'BARCODE', icon: Barcode },
      { text: 'VOICE', icon: Mic },
      { text: 'QUICK ADD', icon: Plus },
    ];

    return (
      <View style={styles.actionButtonsRow}>
        {buttonConfig.map(({ text, icon: IconComponent }, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => handleQuickAction(text)}
          >
            <IconComponent size={14} color="#3b3936" style={styles.actionIcon} />
            <Text style={styles.actionText}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Food Entry Component
  const FoodEntry = ({ meal, showDivider }: { meal: any; showDivider: boolean }) => (
    <View style={styles.foodEntry}>
      <View style={styles.foodHeader}>
        <Text style={styles.foodTime}>{meal.time}</Text>
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{meal.name}</Text>
          <View style={styles.macrosRow}>
            <Text style={styles.macroText}>P {meal.macros.protein}g</Text>
            <View style={styles.macroDot} />
            <Text style={styles.macroText}>C {meal.macros.carbs}g</Text>
            <View style={styles.macroDot} />
            <Text style={styles.macroText}>F {meal.macros.fat}g</Text>
            <View style={styles.macroDot} />
            <Text style={styles.macroText}>Fiber {meal.macros.fiber}g</Text>
          </View>
        </View>
        <Text style={styles.foodCalories}>{meal.calories} kcal</Text>
      </View>
      {showDivider && <View style={styles.divider} />}
    </View>
  );

  // Hydration Row Component
  const HydrationRow = ({ item, showDivider }: { item: any; showDivider: boolean }) => (
    <View style={styles.hydrationRow}>
      <Text style={styles.hydrationActivity}>{item.activity}</Text>
      <View style={styles.waterDrops}>
        {Array.from({ length: item.drops }).map((_, i) => (
          <Droplets key={i} size={13} color="#1084a2" style={styles.waterDrop} />
        ))}
      </View>
      <Text style={styles.hydrationAmount}>{item.amount}</Text>
      {showDivider && <View style={styles.divider} />}
    </View>
  );

  // Supplement Card Component
  const SupplementCard = ({ supplement }: { supplement: any }) => (
    <View style={[styles.supplementCard, { 
      backgroundColor: supplement.bgColor,
      borderColor: supplement.borderColor 
    }]}>
      <View style={styles.timeBadge}>
        <Text style={styles.timeBadgeText}>{supplement.time}</Text>
      </View>
      <View style={styles.supplementInfo}>
        <Text style={styles.supplementName}>{supplement.name}</Text>
        <Text style={styles.supplementDosage}>{supplement.dosage}</Text>
      </View>
      <View style={styles.infoIcon}>
        <Info size={10} color="#3b3936" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Diet & Supplements"
        showCalendar={true}
        showLogo={true}
        onCalendarPress={handleCalendarPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CalorieCard />
        <ActionButtons />

        {/* What You've Eaten Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You've Eaten</Text>
          {mockData.meals.map((meal, index) => (
            <FoodEntry 
              key={index} 
              meal={meal} 
              showDivider={index < mockData.meals.length - 1}
            />
          ))}
        </View>

        {/* Hydration Protocol Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration Protocol</Text>
          {mockData.hydration.map((item, index) => (
            <HydrationRow 
              key={index} 
              item={item} 
              showDivider={index < mockData.hydration.length - 1}
            />
          ))}
        </View>

        {/* Today's Supplements Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Supplements</Text>
            <TouchableOpacity onPress={() => setSupplementsExpanded(!supplementsExpanded)}>
              {supplementsExpanded ? (
                <ChevronUp size={16} color="#3b3936" />
              ) : (
                <ChevronDown size={16} color="#3b3936" />
              )}
            </TouchableOpacity>
          </View>
          {supplementsExpanded && mockData.supplements.map((supplement, index) => (
            <SupplementCard key={index} supplement={supplement} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 9,
    paddingTop: 0,
  },
  
  // CALORIE CARD STYLES
  calorieCard: {
    width: '100%',
    maxWidth: 400,
    height: 107,
    backgroundColor: '#e8f4f8',
    borderRadius: 20,
    borderWidth: 0,
    paddingTop: 21,
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexDirection: 'row',
    marginBottom: 15,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: 20,
    overflow: 'visible',
  },
  goalPill: {
    width: 153,
    height: 42,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#c4cccc',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  goalText: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 16,
    color: '#3b3936',
    letterSpacing: 0,
    textAlign: 'center',
  },
  calorieText: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 10,
    color: '#3b3936',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  macroRow: {
    marginBottom: 7.5,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  macroLabel: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 10,
    color: '#3b3936',
  },
  macroValue: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 10,
    color: '#3b3936',
    textAlign: 'right',
  },
  progressBarContainer: {
    width: 180,
    height: 2,
    marginTop: 2,
    marginLeft: 2.5,
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#dfdfdf',
  },
  progressFill: {
    height: '100%',
  },

  // ACTION BUTTONS STYLES
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 15,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    minWidth: 75,
    height: 36,
    backgroundColor: '#ffcf4a',
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 2,
  },
  actionIcon: {
    marginBottom: 1,
  },
  actionText: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 10,
    color: '#3b3936',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // SECTION STYLES
  section: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    paddingTop: 21,
    paddingHorizontal: 21,
    paddingBottom: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 19,
  },
  sectionTitle: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 16,
    color: '#3b3936',
    lineHeight: 38,
  },

  // FOOD ENTRY STYLES
  foodEntry: {
    marginBottom: 0,
  },
  foodHeader: {
    flexDirection: 'row',
    width: '100%',
    height: 47,
  },
  foodTime: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 12,
    color: '#1084a2',
    textTransform: 'uppercase',
    lineHeight: 20,
    width: 41,
  },
  foodDetails: {
    flex: 1,
    marginLeft: 32,
  },
  foodName: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 14,
    color: '#3b3936',
    lineHeight: 18,
    flex: 1,
    marginRight: 10,
  },
  macrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginLeft: 2,
  },
  macroText: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 10,
    color: '#3b3936',
    lineHeight: 20,
  },
  macroDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#3b3936',
    marginHorizontal: 5,
  },
  foodCalories: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 14,
    color: '#3b3936',
    lineHeight: 18,
    minWidth: 70,
    textAlign: 'right',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#dfdfdf',
    marginTop: 0,
    marginBottom: 0,
  },

  // HYDRATION STYLES
  hydrationRow: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hydrationActivity: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 14,
    color: '#3b3936',
    lineHeight: 18,
    flex: 1,
    marginRight: 10,
  },
  waterDrops: {
    flexDirection: 'row',
    position: 'absolute',
    left: 69,
  },
  waterDrop: {
    marginRight: 1,
  },
  hydrationAmount: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 14,
    color: '#3b3936',
    lineHeight: 18,
    minWidth: 70,
    textAlign: 'right',
  },

  // SUPPLEMENT CARD STYLES
  supplementCard: {
    width: '100%',
    height: 47,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 10,
  },
  timeBadge: {
    width: 28,
    height: 25,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timeBadgeText: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 10,
    color: '#3b3936',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 14,
    color: '#3b3936',
    lineHeight: 18,
  },
  supplementDosage: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 10,
    color: '#3b3936',
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  infoIcon: {
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DietSupplementsScreen;
