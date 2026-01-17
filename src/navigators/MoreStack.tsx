import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  AdminScreen,
  BasicInfoScreen,
  CompletionScreen,
  ConsentScreen,
  DigitalTwinScreen,
  HealthGoalsScreen,
  LifestyleScreen,
  MedicalHistoryScreen,
  MedicationsScreen,
  SettingsScreen,
  SleepHabitsScreen,
  StressManagementScreen,
  UnifiedPermissionsScreen,
  UserProfile,
} from '../screens';
import { RootStackParamList } from '../types';
import { HealthKitScreen } from '../screens/HealthKitScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const MoreStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName='Settings'
    >
      <Stack.Screen name='Settings' component={SettingsScreen} />
      <Stack.Screen name='UserProfile' component={UserProfile} />
      <Stack.Screen
        name='UnifiedPermissionsScreen'
        component={UnifiedPermissionsScreen}
      />
      <Stack.Screen name='SleepHabits' component={SleepHabitsScreen} />
      <Stack.Screen name='MedicalHistory' component={MedicalHistoryScreen} />
      <Stack.Screen name='BasicInfo' component={BasicInfoScreen} />
      <Stack.Screen name='HealthGoals' component={HealthGoalsScreen} />
      <Stack.Screen name='Medications' component={MedicationsScreen} />
      <Stack.Screen name='Lifestyle' component={LifestyleScreen} />
      <Stack.Screen name='HealthKitScreen' component={HealthKitScreen} />
      <Stack.Screen
        name='StressManagement'
        component={StressManagementScreen}
      />
      <Stack.Screen name='DigitalTwin' component={DigitalTwinScreen} />
      <Stack.Screen name='Consent' component={ConsentScreen} />
      <Stack.Screen name='Completion' component={CompletionScreen} />
      <Stack.Screen name='AdminScreen' component={AdminScreen} />
    </Stack.Navigator>
  );
};
