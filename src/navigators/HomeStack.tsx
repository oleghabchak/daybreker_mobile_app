import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  AuthScreen,
  HomeScreen,
  PrioritiesScreen,
  UnifiedPermissionsScreen,
} from '../screens';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName='Home'
    >
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Auth' component={AuthScreen} />
      <Stack.Screen
        name='UnifiedPermissionsScreen'
        component={UnifiedPermissionsScreen}
      />
      <Stack.Screen name='Priorities' component={PrioritiesScreen} />
    </Stack.Navigator>
  );
};
