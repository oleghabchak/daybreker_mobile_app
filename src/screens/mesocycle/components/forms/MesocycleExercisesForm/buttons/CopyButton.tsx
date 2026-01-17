import { FC } from 'react';

import { PrimaryButton } from '../../../../../../components/ui/PrimaryButton';

type CopyButtonProps = {
  isFormValid: boolean;
  isLoading: boolean;
  onPress: () => void;
};

export const CopyButton: FC<CopyButtonProps> = ({
  isFormValid,
  isLoading,
  onPress,
}) => {
  return (
    <PrimaryButton
      onPress={onPress}
      isDisabled={!isFormValid}
      isLoading={isLoading}
      size='small'
    >
      Copy
    </PrimaryButton>
  );
};
