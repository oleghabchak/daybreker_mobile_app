import { FC } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { Colors } from '../../../constants/theme';
import { Button, ButtonProps } from '../Button';

import { styles } from './styles';

export type PrimaryButtonProps = ButtonProps & {
  children: string;
  isLoading?: boolean;
  isDisabled?: boolean;
};

export const PrimaryButton: FC<PrimaryButtonProps> = ({
  children,
  isLoading = false,
  isDisabled = false,
  ...btnProps
}) => {
  return (
    <Button
      style={[styles.primaryButton, isDisabled && styles.disabledButton]}
      disabled={isDisabled}
      {...btnProps}
    >
      {isLoading ? (
        <ActivityIndicator size='small' color={Colors.background} />
      ) : (
        <Text style={styles.primaryButtonText}>{children}</Text>
      )}
    </Button>
  );
};
