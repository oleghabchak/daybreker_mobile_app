import { FC } from 'react';
import { Text } from 'react-native';

import { Button, ButtonProps } from '../Button';

import { styles } from './styles';

export type SecondaryButtonProps = ButtonProps & {
  children: string;
};

export const SecondaryButton: FC<SecondaryButtonProps> = ({
  children,
  variant = 'secondary',
  ...btnProps
}) => {
  return (
    <Button {...btnProps} variant='secondary'>
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Button>
  );
};
