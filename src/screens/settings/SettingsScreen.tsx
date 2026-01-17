import React, { useEffect, useState } from 'react';
import {
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import {
  Button,
  GradientCard,
  Header,
  ScrollViewWithIndicator,
} from '../../components';
import { UserCard } from '../../components/ui/UserCard';
import { Colors, Space } from '../../constants/theme';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../models/AppStore';
import { useAuthStore, useAuthUser } from '../../models/AuthenticationStore';

type SettingsOption = {
  id: string;
  title: string;
  description?: string;
  image: any;
  onPress: () => void;
};

export const SettingsScreen = ({ navigation }: any) => {
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Zustand store hooks
  const user = useAuthUser();
  const { signOut } = useAuthStore();
  const { resetAppState } = useAppStore();

  const settingsOptions: SettingsOption[] = [
    {
      id: 'settings',
      title: 'Settings',
      image: require('../../../assets/settings_calendar.png'),
      onPress: () => navigation.navigate('UserProfile'),
    },
    // {
    //   id: 'store',
    //   title: 'Store',
    //   image: require('../../../assets/settings_calendar.png'),
    //   onPress: () => console.log('Notifications pressed'),
    // },
    {
      id: 'help',
      title: 'Help & Support',
      image: require('../../../assets/settings_calendar.png'),
      onPress: () =>
        Linking.openURL('https://daybreakerhealth.com/#contact-us'),
    },
    // {
    //   id: 'healthkit',
    //   title: 'Health Kit',
    //   image: require('../../../assets/settings_calendar.png'),
    //   onPress: () => navigation.navigate('HealthKitScreen'),
    // },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (!user) return;

      // Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      resetAppState();
      navigation.navigate('Auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header title='Settings' />
        <UserCard
          info={{
            username: profile?.full_name,
            email: profile?.email,
            chronoAge: profile?.chrono_age,
            bioAge: profile?.bio_age,
            avatar: null,
            isAdmin: profile?.is_admin,
          }}
        />

        {settingsOptions.map(option => (
          <GradientCard
            key={option.id}
            image={option.image}
            imageSize={34}
            title={option.title}
            description={option.description}
            onPress={option.onPress}
          />
        ))}
      </ScrollViewWithIndicator>

      <Button
        style={{ margin: 10 }}
        variant='secondary'
        size='medium'
        onPress={handleSignOut}
      >
        <Text>Logout</Text>
      </Button>
      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            'https://daybreakerhealth.com/policies/#privacy-policy'
          )
        }
      >
        <Text
          style={{
            color: Colors.textPrimary,
            textAlign: 'center',
            marginBottom: Space[2],
          }}
        >
          Privacy Policy | Terms of Service
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space[6],
    marginVertical: Space[8],
    marginBottom: Space[8],
  },
});
