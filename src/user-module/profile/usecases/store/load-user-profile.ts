import { AsyncResponse } from '../../../../shared-module/data/types/async-response';
import { IUserProfile } from '../../interfaces/user-profile';
import { UserProfileRepository } from '../../repositories/user-profile-repository';
import { useUserProfileStore } from '../../stores/user-profile-store';

export class LoadUserProfileStoreUseCase {
  static async execute(userId: string): Promise<AsyncResponse<IUserProfile>> {
    try {
      const profileRequest = await UserProfileRepository.getByUserId(userId);

      if (profileRequest.status === 'error') {
        return profileRequest;
      }

      const profile = profileRequest.data;

      useUserProfileStore.setState({
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
  }
}
