import { Dimensions, Platform } from 'react-native';

// Screen dimensions
export const ScreenWidth = Dimensions.get('window').width;
export const ScreenHeight = Dimensions.get('window').height;

// Platform constants
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Platform-specific values
export const PlatformSelect = Platform.select;

// Common screen breakpoints
export const Breakpoints = {
  small: 375,
  medium: 768,
  large: 1024,
  xlarge: 1440,
} as const;

// Responsive helpers
export const isSmallScreen = ScreenWidth <= Breakpoints.small;
export const isMediumScreen =
  ScreenWidth > Breakpoints.small && ScreenWidth <= Breakpoints.medium;
export const isLargeScreen =
  ScreenWidth > Breakpoints.medium && ScreenWidth <= Breakpoints.large;
export const isXLargeScreen = ScreenWidth > Breakpoints.large;

export const MUSCLE_FILTERS = [
  'chest',
  'biceps',
  'triceps',
  'back',
  'shoulders',
  'quads',
  'glutes',
  'hamstrings',
  'calves',
  'abs',
  'forearms',
  'traps',
  'full_body',
];

// Primary equipment filter options
export const EQUIPMENT_FILTERS = [
  'barbell',
  'dumbbell',
  'bodyweight',
  'cable',
  'machine',
  'smith_machine',
  'kettlebell',
  'band',
  'trx',
];
