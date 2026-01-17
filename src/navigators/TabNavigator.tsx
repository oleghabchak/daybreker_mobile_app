import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { Dumbbell, Home, Plus, Target, User } from 'lucide-react-native';
import React from 'react';
import { TextStyle, View, ViewStyle, Text } from 'react-native';

import { Button } from '../components/ui/Button';
import { Colors } from '../constants/theme';
import { RootStackParamList } from '../types';

import { ExercisesStack } from './ExercisesStack';
import { HomeStack } from './HomeStack';
import { MoreStack } from './MoreStack';
import { ProtocolsStack } from './ProtocolsStack';
import { environment } from '../config/environment';

export type AppTabParamList = {
  HomeStack: undefined;
  ProtocolsStack: undefined;
  Plus: undefined;
  ExercisesStack: undefined;
  MoreStack: undefined;
};

export type AppTabScreenProps<T extends keyof AppTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<AppTabParamList, T>,
    RootStackParamList & { navigation: any }
  >;

const Tab = createBottomTabNavigator<AppTabParamList>();

// Plus button screen component
const PlusScreen = ({
  onShowCreateExercise,
}: {
  onShowCreateExercise: () => void;
}) => {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <Button
        variant='plus'
        onPress={onShowCreateExercise}
        style={{ marginHorizontal: 15 }}
      />
    </View>
  );
};

/**
 * This is the main navigator for the app with a bottom tab bar.
 * Each tab is a stack navigator with its own set of screens.
 */
export function TabNavigator() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 100,
            backgroundColor: Colors.background,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            paddingBottom: 34,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDisabled,
          tabBarLabelStyle: $tabBarLabel,
          tabBarItemStyle: $tabBarItem,
        }}
        initialRouteName='ExercisesStack'
      >
        <Tab.Screen
          name='HomeStack'
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <View style={$tabBarIcon}>
                {environment.nodeEnv === 'development' && (
                  <Text style={$devStyle}>This app connected DEV env</Text>
                )}
                <Home
                  size={20}
                  color={focused ? Colors.primary : Colors.textDisabled}
                />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name='ProtocolsStack'
          component={ProtocolsStack}
          options={{
            tabBarLabel: 'Protocols',
            tabBarIcon: ({ focused }) => (
              <View style={$tabBarIcon}>
                <Target
                  size={20}
                  color={focused ? Colors.primary : Colors.textDisabled}
                />
              </View>
            ),
          }}
        />

        {/**
         * Temporarily hiding the center Plus tab button.
         * Keeping code for future use; uncomment this block to restore.
         */}
        {false && (
          <Tab.Screen
            name='Plus'
            options={{
              tabBarLabel: '',
              tabBarIcon: ({ focused }) => (
                <View style={$tabBarIcon}>
                  <View
                    style={{
                      width: 29,
                      height: 29,
                      borderRadius: 29,
                      backgroundColor: Colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Plus
                      size={16}
                      strokeWidth={3}
                      color={Colors.textInverse}
                    />
                  </View>
                </View>
              ),
            }}
            listeners={{
              tabPress: e => {
                e.preventDefault();
                console.log('Plus button pressed');
              },
            }}
          >
            {() => <PlusScreen onShowCreateExercise={() => {}} />}
          </Tab.Screen>
        )}

        <Tab.Screen
          name='ExercisesStack'
          component={ExercisesStack}
          options={{
            tabBarLabel: 'Exercise',
            tabBarIcon: ({ focused }) => (
              <View style={$tabBarIcon}>
                <Dumbbell
                  size={20}
                  color={focused ? Colors.primary : Colors.textDisabled}
                />
              </View>
            ),
          }}
        />

        <Tab.Screen
          name='MoreStack'
          component={MoreStack}
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ focused }) => (
              <View style={$tabBarIcon}>
                <User
                  size={20}
                  color={focused ? Colors.primary : Colors.textDisabled}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const $tabBarItem: ViewStyle = {
  paddingTop: 8,
};

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '600',
};

const $tabBarIcon: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 4,
};

const $devStyle: TextStyle = {
  position: 'absolute',
  top: -23,
  left: 75,
  fontSize: 12,
  lineHeight: 16,
  fontWeight: '600',
  width: 200,
  color: Colors.secondary,
};
