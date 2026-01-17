import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, Calendar, Sparkles } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showCalendar?: boolean;
  showLogo?: boolean;
  showAIButton?: boolean;
  disabledAIButton?: boolean;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
    accessibilityLabel?: string;
  };
  rightComponent?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'transparent';
  showBackButton?: boolean;
  onBackPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  onCalendarPress?: () => void;
  onNotificationPress?: () => void;
  onAIPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'default',
  title,
  showCalendar = false,
  showLogo = true,
  showBackButton = false,
  showAIButton = false,
  disabledAIButton = false,
  onBackPress,
  onCalendarPress,
  onNotificationPress,
  onAIPress,
  rightComponent,
  backgroundColor = Colors.header,
  textColor = Colors.text,
}) => {
  const navigation = useNavigation();
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={variant === 'transparent' ? 'dark-content' : 'dark-content'}
        backgroundColor={Colors.background}
        translucent={false}
      />

      {/* Left side - Logo and Title */}
      <View style={styles.leftSection}>
        {showLogo && (
          <Image
            source={require('../../../assets/logo-1024.jpg')}
            style={styles.headerLogo}
            resizeMode='contain'
          />
        )}
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            accessibilityLabel='Back'
          >
            <ArrowLeft size={22} color={textColor} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={[styles.titleText, { color: textColor }]}>{title}</Text>
        )}
      </View>

      {/* Right side - Icons */}
      <View style={styles.iconsRow}>
        {rightComponent ? (
          rightComponent
        ) : (
          <>
            {showCalendar && (
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={onCalendarPress}
                accessibilityLabel='Calendar'
              >
                <Calendar size={18} color='#FFFFFF' />
              </TouchableOpacity>
            )}

            {showAIButton && (
              <TouchableOpacity
                style={[
                  styles.aiButton,
                  disabledAIButton && styles.aiButtonDisabled,
                ]}
                onPress={() => {
                  if (!disabledAIButton && onAIPress) {
                    onAIPress();
                  }
                }}
                disabled={disabledAIButton}
                accessibilityLabel='AI Assistant'
              >
                <Sparkles size={18} color={textColor} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={onNotificationPress}
              accessibilityLabel='Notifications'
            >
              <Bell size={18} color={textColor} />
              {/* Notification dot */}
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    paddingHorizontal: 20,
    borderRadius: 60,
    backgroundColor: Colors.header,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleText: {
    ...Typography.h3,
    fontWeight: '700',
    fontFamily: 'GlacialIndifference-Bold',
    marginLeft: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginLeft: 8,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    position: 'relative',
    marginRight: Space[3],
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    position: 'relative',
    backgroundColor: '#000000',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#000000',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  aiButtonDisabled: {
    opacity: 0.3,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  // Legacy styles for backward compatibility
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  iconButtonText: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space[2],
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 80,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    fontWeight: '600',
  },
  subtitle: {
    ...Typography.bodyBold,
    textAlign: 'center',
    marginTop: Space[1],
    opacity: 0.8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Space[2],
    ...Shadows.sm,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
});
