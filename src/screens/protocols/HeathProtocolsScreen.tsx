import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { GradientCard, Modal } from '../../components';
import { ScrollViewWithIndicator } from '../../components/ScrollViewWithIndicator';
import { Header } from '../../components/ui/Header';
import { BorderRadius, Colors, Space, Typography } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export const HeathProtocolsScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);

  // Simple modal state
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Simple function to show modal
  const showComingSoon = (title: string, message?: string) => {
    setModalTitle(title);
    setModalMessage(message || 'Coming Soon ...');
    setShowModal(true);
  };

  // Health protocols data
  const healthProtocols = [
    {
      image: require('../../../assets/dumbbell_1_protocols_screen.png'),
      title: 'Exercise',
      description: undefined,
      onPress: () => {
        navigation.navigate('ExercisesStack', {
          screen: 'Exercises',
        });
      },
      comingSoon: false,
    },
    {
      image: require('../../../assets/pills.png'),
      title: 'Diet &',
      description: 'Supplements',
      onPress: () => {
        navigation.navigate('DietSupplements');
      },
      comingSoon: false,
    },
    {
      image: require('../../../assets/sleep_mask_protocols_screen.png'),
      title: 'Sleep &',
      description: 'Recovery',
      onPress: () => {
        showComingSoon('Sleep & Recovery');
      },
      comingSoon: true,
    },
    {
      image: require('../../../assets/prescriptions_protocols_vial.png'),
      title: 'Prescriptions',
      onPress: () => {
        showComingSoon('Prescriptions');
      },
      comingSoon: true,
    },
    {
      image: require('../../../assets/massage_gun_therapies_protocols_screen.png'),
      title: 'Therapies',
      onPress: () => {
        showComingSoon('Therapies');
      },
      comingSoon: true,
    },
    {
      image: require('../../../assets/dermatology_protocols_screen_image.png'),
      title: 'Dermatology',
      onPress: () => {
        showComingSoon('Dermatology');
      },
      comingSoon: true,
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Profile
      // Load dashboard data (currently unused but kept for future use)
      await supabase.from('profiles').select('*').eq('id', user.id).single();

      await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .single();

      await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollViewWithIndicator
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header
          title='Protocols'
          showCalendar={false}
          showLogo={true}
          onCalendarPress={() => console.log('Calendar pressed')}
          onNotificationPress={() => console.log('Notifications pressed')}
        />

        {healthProtocols.map((protocol, index) => (
          <GradientCard
            key={index}
            image={protocol.image}
            title={protocol.title}
            description={protocol.description}
            onPress={protocol.onPress}
            comingSoon={protocol.comingSoon}
          />
        ))}
      </ScrollViewWithIndicator>

      {/* Simple Coming Soon Modal */}
      <Modal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        subtitle={modalMessage}
        primaryAction={{
          label: 'Got it!',
          onPress: () => setShowModal(false),
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Space[6],
    paddingTop: Space[4],
    paddingBottom: Space[6],
  },
  greeting: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
  userName: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: Space[6],
    marginBottom: Space[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Space[4],
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
  },
  twinCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  twinCardGradient: {
    padding: Space[6],
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Space[4],
  },
  twinName: {
    ...Typography.bodyMedium,
    color: Colors.background,
    marginBottom: Space[1],
  },
  twinStatus: {
    ...Typography.caption,
    color: Colors.success,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Space[1],
  },
  healthCard: {
    width: (width - Space[6] * 2 - Space[1] * 2) / 2,
    margin: Space[1],
  },
  healthCardGradient: {
    padding: Space[4],
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  healthCardIcon: {
    marginBottom: Space[1],
  },
  healthCardScore: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  healthCardTitle: {
    ...Typography.caption,
    color: Colors.textDisabled,
    marginTop: Space[1],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Space[1],
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: Space[4],
    borderRadius: BorderRadius.md,
    marginBottom: Space[2],
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: Space[1],
  },
  taskStatus: {
    ...Typography.caption,
    color: Colors.textDisabled,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Space[2],
  },
  prioritylow: {
    backgroundColor: Colors.success,
  },
  prioritymedium: {
    backgroundColor: Colors.warning,
  },
  priorityhigh: {
    backgroundColor: Colors.error,
  },
  emptyState: {
    padding: Space[8],
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textDisabled,
  },
});
