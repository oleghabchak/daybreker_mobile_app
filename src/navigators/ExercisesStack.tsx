import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { ExerciseScreen, MesocycleCopyScreen, MesocycleFromTemplateScreen } from '../screens';
import { MesocycleFromScratchScreen } from '../screens/mesocycle/MesocycleFromScratchScreen';
import { MesocyclesListScreen } from '../screens/mesocycle/MesocyclesListScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ExercisesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName='Exercise'
    >
      <Stack.Screen name='Exercise' component={ExerciseScreen} />
      <Stack.Screen
        name='MesocycleFromScratch'
        component={MesocycleFromScratchScreen}
      />
      <Stack.Screen
        name='MesocycleFromTemplateScreen'
        component={MesocycleFromTemplateScreen}
      />
      <Stack.Screen
        name='MesocycleCopyScreen'
        component={MesocycleCopyScreen}
      />
      <Stack.Screen
        name='MesocyclesListScreen'
        component={MesocyclesListScreen}
      />
    </Stack.Navigator>
  );
};
