/**
 * Drop-in overlay to place inside selected screens.
 * It reads route name and picks copy from GATED_ROUTES by default.
 */
import { useRoute } from '@react-navigation/native';
import React from 'react';

import { GATED_ROUTES } from './gatingConfig';
import { useGoToPersonalizationHub, useIsTrainingConfigComplete } from './nav';
import { OnboardingGate } from './OnboardingGate';
import type { GateCopy } from './types';

type Props = {
  copy?: GateCopy;
  visibleOverride?: boolean;
  onSkipPress?: () => void;
};

export const GateOverlay: React.FC<Props> = ({
  copy,
  visibleOverride,
  onSkipPress,
}) => {
  const route = useRoute<any>();
  const isComplete = useIsTrainingConfigComplete();
  const go = useGoToPersonalizationHub();

  const routeCopy =
    copy ?? (route?.name ? GATED_ROUTES[route.name] : undefined);
  const visible =
    typeof visibleOverride === 'boolean'
      ? visibleOverride
      : Boolean(routeCopy) && !isComplete;

  if (!visible || !routeCopy) return null;

  return (
    <OnboardingGate
      visible
      copy={routeCopy}
      onPrimaryPress={go}
      onSecondaryPress={() => {}}
      onSkipPress={onSkipPress}
    />
  );
};
