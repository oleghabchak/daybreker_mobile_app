import { useNavigation } from '@react-navigation/native';
import { User } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Space,
  Typography,
} from '../../constants/theme';

import { Tag } from './Tag';

export interface UserCardInfo {
  username: string;
  email: string;
  chronoAge: number;
  bioAge: number;
  avatar: string | null;
  isAdmin: boolean;
}

export interface UserCardProps {
  info: UserCardInfo;
}

export const UserCard: React.FC<UserCardProps> = ({ info }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.container}>
        {/* <Image
          source={
            info?.avatar
              ? { uri: info.avatar }
              : require('../../../assets/user_avatar.png')
          } // TODO: change to info.avatar when we have it
          style={styles.avatar}
        /> */}
        <View style={styles.avatar}>
          <User size={80} color={Colors.text} />
        </View>

        {info ? (
          <View style={styles.userInfo}>
            <Text style={styles.username}>
              {info?.username?.length > 0 ? info.username : 'No username'}
            </Text>
            <Text style={styles.email}>{info.email ?? 'No email'}</Text>
            <View
              style={{
                gap: 84,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {info.isAdmin && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('AdminScreen' as never)}
                >
                  <Tag text='ADMIN' variant='primary' />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.userInfoLoading}>
            <ActivityIndicator />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    ...Shadows.bottomOnly,
    marginBottom: 12,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space[7],
    gap: Space[4],
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  gradient: {
    padding: Space[4],
  },
  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userInfoLoading: {
    width: '50%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  username: {
    ...Typography.h2,
    color: Colors.text,
  },
  email: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDisabled,
    marginBottom: Space[2],
  },
  menuButton: {
    marginRight: -12,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: Space[2],
    gap: Space[2],
  },
  tag: {
    paddingHorizontal: Space[3],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.text,
    borderRadius: BorderRadius.full,
    marginRight: Space[2],
  },
  tagText: {
    ...Typography.smallBold,
    textTransform: 'uppercase',
  },
  metricsContainer: {
    gap: Space[3],
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    maxWidth: 54,
  },
  metricLabel: {
    ...Typography.smallBold,
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    marginTop: Space[1],
    marginBottom: Space[1],
  },
  metricValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  avatar: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.text,
    borderRadius: BorderRadius.full,
  },
  row: {
    flexDirection: 'row',
    gap: Space[1],
  },
  metricValuePercentage: {
    ...Typography.small,
    color: Colors.textDisabled,
  },
  profile: {
    ...Typography.smallBold,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
});
