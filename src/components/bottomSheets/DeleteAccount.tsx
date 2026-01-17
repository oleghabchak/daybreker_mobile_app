import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { useAuthStore } from '../../models/AuthenticationStore';
import { Button } from '../ui/Button';
import { Divider } from '../ui/Divider';

interface DeleteAccountProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const DeleteAccount: React.FC<DeleteAccountProps> = ({
  isVisible = false,
  onClose = () => {},
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { user, signOut, deleteAccount } = useAuthStore();
  const navigation = useNavigation();

  // Variables
  const snapPoints = useMemo(() => ['75%'], []);

  // Set mounted state
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Callbacks
  const handlePresentModalPress = useCallback(() => {
    try {
      bottomSheetModalRef.current?.present();
    } catch (error) {
      console.error('Error presenting bottom sheet:', error);
      // Fallback: just call onClose
      onClose();
    }
  }, [onClose]);

  const handleDismiss = useCallback(() => {
    try {
      bottomSheetModalRef.current?.dismiss();
    } catch (error) {
      console.error('Error dismissing bottom sheet:', error);
    } finally {
      onClose();
    }
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleDeleteAccount = async () => {
    await performAccountDeletion();
  };

  const performAccountDeletion = async () => {
    try {
      setIsDeleting(true);

      // Use the store method to delete account
      const result = await deleteAccount();

      if (result.success) {
        console.log('** Account deletion successful, signing out...');

        // Force sign out
        await signOut();
        console.log('** Sign out completed');

        // Close the bottom sheet
        handleDismiss();

        // Force navigation to auth screen after a short delay
        setTimeout(() => {
          console.log('** Forcing navigation to auth screen');
          navigation.navigate('Auth' as never);
        }, 500);
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);

      Alert.alert(
        'Error',
        'Failed to delete account. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Show modal when isVisible changes
  React.useEffect(() => {
    if (isVisible && isMounted) {
      // Small delay to ensure the component is fully mounted
      setTimeout(() => {
        handlePresentModalPress();
      }, 100);
    } else if (!isVisible && isMounted) {
      handleDismiss();
    }
  }, [isVisible, isMounted, handlePresentModalPress, handleDismiss]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Delete Account</Text>
        </View>

        <Divider color={Colors.border} />

        <View style={styles.warningSection}>
          <Text style={styles.warningTitle}>⚠️ Warning</Text>
          <Text style={styles.warningText}>Deleting your account will:</Text>
          <View style={styles.warningList}>
            <Text style={styles.warningItem}>
              • Remove all your personal data from our database
            </Text>
            <Text style={styles.warningItem}>
              • Delete your workout history and progress
            </Text>
            <Text style={styles.warningItem}>
              • Remove your profile and settings
            </Text>
            <Text style={styles.warningItem}>• Sign you out immediately</Text>
            <Text style={styles.warningItem}>
              • Mark your account for permanent deletion
            </Text>
          </View>
        </View>

        <Divider color={Colors.border} />

        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>Account Information</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userId}>ID: {user?.id}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant='ghost'
            onPress={handleDismiss}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            variant='primary'
            onPress={handleDeleteAccount}
            style={styles.deleteButton}
            disabled={isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.background,
  },
  indicator: {
    backgroundColor: Colors.border,
  },
  contentContainer: {
    flex: 1,
    padding: Space[4],
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: Space[2],
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    textAlign: 'center',
    lineHeight: 20,
  },
  warningSection: {
    backgroundColor: Colors.error + '10',
    padding: Space[4],
    borderRadius: BorderRadius.md,
    marginBottom: Space[4],
  },
  warningTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Space[2],
  },
  warningText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[2],
  },
  warningList: {
    marginVertical: Space[2],
  },
  warningItem: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Space[1],
    paddingLeft: Space[2],
  },
  userInfo: {
    backgroundColor: Colors.surface,
    padding: Space[4],
    borderRadius: BorderRadius.md,
    marginBottom: Space[4],
  },
  userInfoTitle: {
    ...Typography.h3,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Space[2],
  },
  userEmail: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    marginBottom: Space[1],
  },
  userId: {
    ...Typography.small,
    color: Colors.textDisabled,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Space[3],
    marginBottom: Space[4],
  },
  cancelButton: {
    width: '48%',
  },
  deleteButton: {
    width: '48%',
    backgroundColor: Colors.error,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Space[4],
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textDisabled,
    marginTop: Space[2],
    textAlign: 'center',
  },
});
