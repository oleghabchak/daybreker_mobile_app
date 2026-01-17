import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { useMesocycleStore } from '../../../../training-module/mesocycle/stores/mesocycle-store';
import { IUserProfile } from '../../interfaces/user-profile';
import { UserProfileRepository } from '../../repositories/user-profile-repository';
import { useUserProfileStore } from '../../stores/user-profile-store';

export class SetUserCurrentMesocycleIdStoreUseCase {
  static async execute(
    userId: string,
    mesocycleId: string | null
  ): Promise<AsyncResponse<IUserProfile>> {
    try {
      const profileRequest = await UserProfileRepository.setCurrentMesocycleId(
        userId,
        mesocycleId
      );

      if (profileRequest.status === 'error') {
        return profileRequest;
      }

      const profile = profileRequest.data;

      useUserProfileStore.setState({
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
  }
}
