import { useState } from 'react';
import { User } from '@supabase/supabase-js';

import { errorManager } from '../../../services/errorNotificationManager';
import { Logger } from '../../../services/logger';
import { MesocycleStatus } from '../data/enums/mesocycle-status';
import { IMesocycle } from '../data/interfaces/mesocycle';
import { IMesocycleTemplateExercise } from '../data/interfaces/mesocycle-templates';
import { MesocycleRepository } from '../repositories/mesocycle-repository';
import { CreateMesocycleFromScratchUseCase } from '../usecases/create-mesocycle-from-scratch-use-case';
import { CreateMesocycleFromTemplateUseCase } from '../usecases/create-mesocycle-from-template-use-case';
import { CopyMesocycleUseCase } from '../usecases/copy-mesocycle-use-case';
import { useUserProfileStore } from '../../../user-module/profile/stores/user-profile-store';

interface CreateFromScratchParams {
  user: User;
  mesocycleName: string;
  selectedWeeks: number;
  selectedGoal: any;
  daysColumns: any[];
  trainingDaysPerWeek: number;
  avgSessionMinutes: number;
}

interface CreateFromTemplateParams {
  user: User;
  selectedTemplate: IMesocycle;
  templateExercises: IMesocycleTemplateExercise[];
  mesocycleName?: string;
}

interface CopyMesocycleParams {
  user: User;
  mesocycleId: string;
  newMesocycleName?: string;
}

export const useMesocycleCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { setCurrentMesocycleId } = useUserProfileStore();

  const createActiveMesocycle = async (params: CreateFromScratchParams | CreateFromTemplateParams) => {
    setIsCreating(true);

    try {
      let mesocycle: IMesocycle;

      if ('selectedTemplate' in params) {
        // Create from template
        mesocycle = await CreateMesocycleFromTemplateUseCase.execute({
          ...params,
          status: MesocycleStatus.ACTIVE,
        });
      } else {
        // Create from scratch
        mesocycle = await CreateMesocycleFromScratchUseCase.execute({
          ...params,
          status: MesocycleStatus.ACTIVE,
        });
      }

      // Complete all active mesocycles before setting this one as current
      const completeRequest = await MesocycleRepository.completeAllActiveMesocycles(
        params.user.id,
        mesocycle.id
      );
      if (completeRequest.status === 'error') {
        Logger.warn('Failed to complete active mesocycles:', completeRequest.error);
      }

      await setCurrentMesocycleId(params.user.id, mesocycle.id);

      return mesocycle;
    } catch (error) {
      Logger.error('Error creating active mesocycle:', error);
      errorManager.showError('Failed to create mesocycle');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const addToList = async (params: CreateFromScratchParams | CreateFromTemplateParams) => {
    setIsCreating(true);

    try {
      let mesocycle: IMesocycle;

      if ('selectedTemplate' in params) {
        // Create from template with PLANNING status
        mesocycle = await CreateMesocycleFromTemplateUseCase.execute({
          ...params,
          status: MesocycleStatus.PLANNING,
        });
      } else {
        // Create from scratch with PLANNING status
        mesocycle = await CreateMesocycleFromScratchUseCase.execute({
          ...params,
          status: MesocycleStatus.PLANNING,
        });
      }

      // Don't set as current mesocycle - just save it to the list
      return mesocycle;
    } catch (error) {
      Logger.error('Error saving mesocycle to list:', error);
      errorManager.showError('Failed to save mesocycle to list');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const copyMesocycle = async (params: CopyMesocycleParams) => {
    setIsCreating(true);

    try {
      // Copy mesocycle with PLANNING status (always pending for copies)
      const mesocycle = await CopyMesocycleUseCase.execute({
        ...params,
        status: MesocycleStatus.PLANNING,
      });

      // Don't set as current mesocycle - just save it to the list
      return mesocycle;
    } catch (error) {
      Logger.error('Error copying mesocycle:', error);
      errorManager.showError('Failed to copy mesocycle');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createActiveMesocycle,
    addToList,
    copyMesocycle,
  };
};
