/**
 * Resolve design tokens from the app theme. Fall back if not present.
 * Map to existing design system if found (search for ThemeProvider/useTheme).
 */
import { useColorScheme } from 'react-native';

import { Colors, BorderRadius, Space, Shadows } from '../../constants/theme';

export function useGateTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colorBgScrim: 'rgba(0,0,0,0.35)',
    colorCard: isDark ? '#111418' : '#FFFFFF',
    colorText: isDark ? '#F2F4F7' : Colors.textPrimary,
    colorSubtle: isDark ? 'rgba(242,244,247,0.72)' : 'rgba(11,15,20,0.72)',
    colorPrimary: Colors.primary,
    radius: BorderRadius.lg,
    buttonRadius: BorderRadius.xl, // 24px - very rounded like app buttons
    spacing: (n: number) => n * 8,
    shadow: Shadows.lg, // Use design system shadow
  };
}

