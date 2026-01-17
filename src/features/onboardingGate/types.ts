export type GateCopy = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  ctaLabel?: string;
  secondaryLabel?: string;
  skipLabel?: string;
};

export type OnboardingGateProps = {
  visible: boolean;
  copy: GateCopy;
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  blurIntensity?: number;
  testID?: string;
};
