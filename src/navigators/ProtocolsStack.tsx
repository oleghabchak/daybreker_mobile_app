import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { DietSupplementsScreen, HeathProtocolsScreen } from '../screens';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ProtocolsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName='HeathProtocols'
    >
      <Stack.Screen name='HeathProtocols' component={HeathProtocolsScreen} />
      <Stack.Screen name='DietSupplements' component={DietSupplementsScreen} />
    </Stack.Navigator>
  );
};
