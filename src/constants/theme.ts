// Daybreaker Portal Design System v2.0
// Primary Font: GlacialIndifference-Bold.ttf
// Secondary Fonts: GlacialIndifference-Regular.ttf, GlacialIndifference-Italic.ttf

// Base Unit System (4px grid)
export const Space = {
  0: 0, // 0px - removing default spacing
  1: 4, // 4px - tight grouping
  2: 8, // 8px - related items
  3: 12, // 12px - standard spacing
  4: 16, // 16px - section spacing
  5: 20, // 20px - section spacing
  6: 24, // 24px - group separation
  7: 28, // 28px - group separation
  8: 32, // 32px - major sections
  12: 48, // 48px - view breaks
  16: 64, // 64px - hero spacing
  24: 96, // 96px - maximum spacing
} as const;

// Basic Color Palette
const BasicColors = {
  // Primary Colors
  primary: '#E67E25', // Orange
  secondary: '#1084A2', // Blue
  accent: '#FFCF4A', // Yellow

  // Background Colors
  background: '#FFFFFF', // White
  surface: '#FFF6EF', // Cream
  surfaceSecondary: '#DBEAEF', // Light Blue
  header: '#FFF6EF', // Cream

  // Neutral Colors
  dark: '#3B3936', // Dark Gray
  medium: '#6B9FA8', // Medium Blue
  light: '#8F8E8C', // Light Gray
  veryLight: '#A8D5E8', // Very Light Blue
  cream: '#E8D7C6', // Cream
  peach: '#FFD4B8', // Peach
  gray: '#D9D9D9', // Gray
  lightGray: '#E6E6E6', // Light Gray
  creamGray: '#DFDFDF', // Cream Gray

  // Overlay
  overlay: 'rgba(59, 57, 54, 0.5)', // Dark overlay
} as const;

// Gradient Combinations
export const Gradients = {
  gradient_1: {
    background: 'linear-gradient(136.02deg, #DBEAEF 1.99%, #FFF6EF 98.05%)',
    colors: ['#DBEAEF', '#FFF6EF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  gradient_2: {
    background: 'linear-gradient(136.02deg, #E67E25 1.99%, #FFF6EF 98.05%)',
    colors: ['#E67E25', '#FFF6EF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  gradient_3: {
    background: 'linear-gradient(136.02deg, #E67E25 1.99%, #FFCF4A 98.05%)',
    colors: ['#E67E25', '#FFCF4A'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  gradient_4: {
    background: 'linear-gradient(136.02deg, #FFCF4A 1.99%, #FFF6EF 98.05%)',
    colors: ['#FFCF4A', '#FFF6EF'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// Semantic Colors
export const Colors = {
  // Action Colors
  primary: BasicColors.primary, // #E67E25
  secondary: BasicColors.secondary, // #1084A2
  tertiary: BasicColors.medium, // #6B9FA8
  accent: BasicColors.accent, // #FFCF4A

  // Surface Colors
  background: BasicColors.background, // #FFFFFF
  surface: BasicColors.surface, // #FFF6EF
  surfaceSecondary: BasicColors.surfaceSecondary, // #DBEAEF
  overlay: BasicColors.overlay, // rgba(59, 57, 54, 0.5)
  header: BasicColors.header, // #FFF6EF

  // Text Colors
  text: BasicColors.dark, // #3B3936
  textPrimary: BasicColors.dark, // #3B3936 (legacy support)
  textDisabled: BasicColors.light, // #8F8E8C
  textInverse: BasicColors.background, // #FFF6EF
  textLink: BasicColors.secondary, // #1084A2

  // Status Colors
  success: '#52C41A',
  warning: BasicColors.accent, // #FFCF4A
  error: '#FF4D4F',
  info: BasicColors.secondary, // #1084A2

  // Component Specific
  border: BasicColors.gray, // #D9D9D9
  borderLight: BasicColors.peach, // #FFD4B8
  borderLightGray: '#F0F0F0', // #F0F0F0
  shadowColor: '#000000',

  // Digital Twin Colors (keeping for compatibility)
  digitalTwinColors: {
    metabolic: BasicColors.secondary, // #1084A2
    inflammation: BasicColors.primary, // #E67E25
    recovery: '#52C41A',
    overall: BasicColors.accent, // #FFCF4A
  },

  // Legacy Digital Twin colors
  avatarBg: BasicColors.dark, // #3B3936
  avatarCard: BasicColors.medium, // #6B9FA8
  metabolic: BasicColors.secondary, // #1084A2
  inflammation: BasicColors.primary, // #E67E25
  recovery: '#D500F9',

  // Additional Colors
  teal: '#20B2AA',
  lightBlue: '#A8D5E8',

  //Exercise Card
  exerciseCard: BasicColors.lightGray,
  expandedExerciseCard: BasicColors.creamGray,

  transparent: 'transparent',
} as const;

// Typography System
export const Typography = {
  // Font Families
  fontFamily: {
    sans: 'GlacialIndifference-Regular',
    bold: 'GlacialIndifference-Bold',
    italic: 'GlacialIndifference-Italic',
    mono: "'SF Mono', 'Roboto Mono', monospace",
  },

  // Font Sizes
  fontSize: {
    xs: 11, // 11px
    sm: 13, // 13px
    base: 15, // 15px
    lg: 17, // 17px
    xl: 20, // 20px
    '2xl': 24, // 24px
    '3xl': 32, // 32px
    '4xl': 40, // 40px
  },

  // Font Weights
  fontWeight: {
    regular: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
  },

  // Pre-composed Text Styles
  h1: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 32,
    fontWeight: '700' as const, //bold
    lineHeight: 1.2 * 32,
    color: BasicColors.dark,
  },
  h2: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 22,
    fontWeight: '700' as const, //bold
    lineHeight: 1.5 * 22,
    color: BasicColors.dark,
  },
  h3: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 20,
    fontWeight: '600' as const, //semibold
    lineHeight: 1.3 * 20,
    color: BasicColors.dark,
  },
  body: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 16,
    fontWeight: '400' as const, //regular
    lineHeight: 1.3 * 15,
    color: BasicColors.dark,
  },
  bodyMedium: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 16,
    fontWeight: '500' as const, //medium
    lineHeight: 1.3 * 15,
    color: BasicColors.dark,
  },
  bodySemiBold: {
    fontFamily: 'GlacialIndifference-SemiBold',
    fontSize: 16,
    fontWeight: '600' as const, //semibold
    lineHeight: 1.3 * 15,
    color: BasicColors.dark,
  },
  bodyBold: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 16,
    fontWeight: '700' as const, //bold
    lineHeight: 20,
    color: BasicColors.dark,
  },
  caption: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 13,
    fontWeight: 'normal' as const,
    lineHeight: 1.4 * 13,
    color: BasicColors.light,
  },
  small: {
    fontFamily: 'GlacialIndifference-Regular',
    fontSize: 10,
    fontWeight: 'normal' as const,
    lineHeight: 1.4 * 11,
    color: BasicColors.light,
  },
  smallBold: {
    fontFamily: 'GlacialIndifference-Bold',
    fontSize: 10,
    fontWeight: 'bold' as const,
    lineHeight: 1.5 * 10,
    color: BasicColors.dark,
  },
} as const;

// Border Radius
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

// Shadows
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  bottomOnly: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 26,
    },
    shadowOpacity: 0.04,
    // shadowRadius: 0,
    elevation: 12,
  },
} as const;

// Motion System
export const Motion = {
  duration: {
    instant: 50, // 50ms - Hover states
    micro: 100, // 100ms - State changes
    meso: 200, // 200ms - Local transitions
    macro: 300, // 300ms - Page transitions
    cinematic: 600, // 600ms - Celebrations
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Layout Constants
export const Layout = {
  window: {
    paddingHorizontal: Space[4], // 16px
    paddingVertical: Space[6], // 24px
  },
  card: {
    padding: Space[4], // 16px
    borderRadius: BorderRadius.lg, // 16px
  },
  button: {
    height: {
      small: 32,
      medium: 40,
      large: 48,
    },
    paddingHorizontal: {
      small: Space[4], // 16px
      medium: Space[6], // 24px
      large: Space[8], // 32px
    },
  },
} as const;

// Legacy exports for compatibility
export const Spacing = {
  xs: Space[1], // 4px
  sm: Space[2], // 8px
  md: Space[4], // 16px
  lg: Space[6], // 24px
  lmd: Space[7], // 28px
  xl: Space[8], // 32px
  xxl: Space[12], // 48px
};
