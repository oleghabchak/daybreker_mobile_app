import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AsyncResponse } from '../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../training-module/mesocycle/stores/mesocycle-store';
import { IUserProfile } from '../interfaces/user-profile';
import { UserProfileRepository } from '../repositories/user-profile-repository';

interface UserProfileStore {
  profile?: IUserProfile;

  loadProfile: (userId: string) => Promise<AsyncResponse<IUserProfile>>;
  setCurrentMesocycleId: (
    userId: string,
    mesocycleId: string | null
  ) => Promise<AsyncResponse<IUserProfile>>;
}

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set, get) => ({
      profile: undefined,

      loadProfile: async (
        userId: string
      ): Promise<AsyncResponse<IUserProfile>> => {
        try {
          const profileRequest =
            await UserProfileRepository.getByUserId(userId);

          if (profileRequest.status === 'error') {
            return profileRequest;
          }

          const profile = profileRequest.data;

          set({
            profile,
          });

          return {
            status: 'ok',
            data: profile,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },

      setCurrentMesocycleId: async (
        userId: string,
        mesocycleId: string | null
      ): Promise<AsyncResponse<IUserProfile>> => {
        try {
          const profileRequest =
            await UserProfileRepository.setCurrentMesocycleId(
              userId,
              mesocycleId
            );

          if (profileRequest.status === 'error') {
            return profileRequest;
          }

          const profile = profileRequest.data;

          set({
            profile,
          });

          useMesocycleStore
            .getState()
            .setCurrentMesocycleId(profile.current_mesocycle_id || null);

          return {
            status: 'ok',
            data: profile,
          };
        } catch (error) {
          return {
            status: 'error',
            error: error as Error,
          };
        }
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({}),
    }
  )
);
