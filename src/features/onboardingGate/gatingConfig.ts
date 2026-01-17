/**
 * Configure which routes are gated and their copy.
 * Add entries for each screen that should show the onboarding gate.
 */
import type { GateCopy } from './types';

export const GATED_ROUTES: Record<string, GateCopy> = {
  Home: {
    title: 'Get your personalized health insights',
    subtitle: 'Complete your account setup to unlock your dashboard',
    bullets: [
      'Track biological age',
      'Monitor recovery',
      'Optimize performance',
    ],
    ctaLabel: 'Complete setup',
    skipLabel: 'Skip for now',
  },
};
