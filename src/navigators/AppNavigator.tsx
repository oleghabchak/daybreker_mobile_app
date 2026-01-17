import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';

import {
  AuthScreen,
  BasicInfoScreen,
  CompletionScreen,
  ConsentScreen,
  DigitalTwinScreen,
  HealthGoalsScreen,
  HomeScreen,
  LifestyleScreen,
  MedicalHistoryScreen,
  MedicationsScreen,
  PrioritiesScreen,
  SleepHabitsScreen,
  StressManagementScreen,
  UnifiedPermissionsScreen,
  WelcomeSplash,
} from '../screens';
import { RootStackParamList } from '../types';

import { TabNavigator } from './TabNavigator';

// Use native-stack on native, JS stack on web
const createStack = () => {
  if (Platform.OS === 'web') {
    const { createStackNavigator } = require('@react-navigation/stack');
    return createStackNavigator<RootStackParamList>();
  }

  const {
    createNativeStackNavigator,
  } = require('@react-navigation/native-stack');
  return createNativeStackNavigator<RootStackParamList>();
};

const Stack = createStack();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
      initialRouteName='Auth'
    >
      <Stack.Screen name='Auth' component={AuthScreen} />
      <Stack.Screen name='App' component={TabNavigator} />
      <Stack.Screen name='Welcome' component={WelcomeSplash} />
      <Stack.Screen name='Permissions' component={UnifiedPermissionsScreen} />
      <Stack.Screen name='BasicInfo' component={BasicInfoScreen} />
      <Stack.Screen name='HealthGoals' component={HealthGoalsScreen} />
      <Stack.Screen name='MedicalHistory' component={MedicalHistoryScreen} />
      <Stack.Screen name='Medications' component={MedicationsScreen} />
      <Stack.Screen name='Lifestyle' component={LifestyleScreen} />
      <Stack.Screen name='SleepHabits' component={SleepHabitsScreen} />
      <Stack.Screen
        name='StressManagement'
        component={StressManagementScreen}
      />
      <Stack.Screen name='DigitalTwin' component={DigitalTwinScreen} />
      <Stack.Screen name='Consent' component={ConsentScreen} />
      <Stack.Screen name='Completion' component={CompletionScreen} />
      <Stack.Screen name='Priorities' component={PrioritiesScreen} />
      <Stack.Screen name='Home' component={HomeScreen} />
    </Stack.Navigator>
  );
};

export interface NavigationProps {
  hideSplashScreen: () => void;
}

export const AppNavigator = ({ hideSplashScreen }: NavigationProps) => {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
};
