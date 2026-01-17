import { create } from 'zustand';

export interface AppState {
  // Sheet Visibility
  showCreateMesocycle: boolean;
  showCreateExercise: boolean;
  showPersistentProfile: boolean;

  // Actions
  setShowCreateMesocycle: (show: boolean) => void;
  setShowCreateExercise: (show: boolean) => void;
  setShowPersistentProfile: (show: boolean) => void;
  resetAppState: () => void;
}

const initialState = {
  // Sheet Visibility
  showCreateMesocycle: false, // TODO: change this to false in PRODUCTION build
  showCreateExercise: false,
  showPersistentProfile: false,
};

export const useAppStore = create<AppState>()(set => ({
  ...initialState,

  //   Sheet Management Actions
  setShowCreateMesocycle: (show: boolean) => {
    set({ showCreateMesocycle: show });
    set({ showCreateExercise: false });
    set({ showPersistentProfile: false });
  },

  setShowCreateExercise: (show: boolean) => {
    set({ showCreateExercise: show });
    set({ showCreateMesocycle: false });
    set({ showPersistentProfile: false });
  },
  setShowPersistentProfile: (show: boolean) => {
    set({ showPersistentProfile: show });
    set({ showCreateMesocycle: false });
    set({ showCreateExercise: false });
  },
  resetAppState: () => {
    set({ showCreateMesocycle: false });
    set({ showCreateExercise: false });
    set({ showPersistentProfile: false });
  },
}));
