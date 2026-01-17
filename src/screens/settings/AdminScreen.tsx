import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Tag } from '../../components';
import { Dropdown } from '../../components/ui';
import { Colors, Space, Typography } from '../../constants/theme';
import { useAppStore } from '../../models/AppStore';
import { useAuthStore } from '../../models/AuthenticationStore';
import { useMesocycleStore } from '../../training-module/mesocycle/stores/mesocycle-store';

export const AdminScreen = () => {
  const navigation = useNavigation();
  const { setShowCreateMesocycle, setShowPersistentProfile } = useAppStore();
  const { allProfiles, loadAllProfiles, setUserId } = useAuthStore();
  const { loadComplexMesocycleData } = useMesocycleStore();

  useEffect(() => {
    loadAllProfiles();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>This screen is visible for admin only</Text>

      {/* Digital Twin */}
      <View style={styles.section}>
        <View
          style={{
            gap: 20,
          }}
        >
          <TouchableOpacity onPress={() => setShowCreateMesocycle(true)}>
            <Tag text={'OPEN Mesocycle Intake Form (as admin)'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPersistentProfile(true)}>
            <Tag
              variant='lightBlue'
              text={'OPEN Persistent Intake Form (as admin)'}
            />
          </TouchableOpacity>
          <View style={{ gap: 2 }}>
            <Text> See app as different user:</Text>
            <Dropdown
              searchable={true}
              data={allProfiles.map(profile => ({
                value: profile.user_id,
                label: profile.email,
              }))}
              onChange={data => {
                loadComplexMesocycleData(data.value);
                setUserId(data.value);
                setTimeout(() => {
                  navigation.navigate('ExercisesStack' as never);
                }, 1000);
              }}
              placeholder='Select user'
              selectedValue={null}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Space[6],
    marginBottom: Space[8],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Space[6],
    marginVertical: Space[8],
  },
  title: {
    ...Typography.h3,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Space[4],
  },
});
