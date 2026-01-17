import { FC } from 'react';

import { SecondaryButton } from '../../../../../../components/ui/SecondaryButton';
import { useBackPress } from '../../../../../../hooks/useBackPress';

type CancelButtonProps = {
  isLoading?: boolean;
};

export const CancelButton: FC<CancelButtonProps> = ({ isLoading }) => {
  const { handleBackPress } = useBackPress();

  return (
    <SecondaryButton
      onPress={handleBackPress}
      disabled={isLoading}
      size='small'
    >
      Cancel
    </SecondaryButton>
  );
};
