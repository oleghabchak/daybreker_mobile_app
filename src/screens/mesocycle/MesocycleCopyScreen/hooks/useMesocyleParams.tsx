import { useRoute } from '@react-navigation/native';

import { IMesocycleSummary } from '../../../../training-module/mesocycle/data/interfaces/mesocycle-summary';

export const useGetMesocycleParam = () => {
  const route = useRoute();
  const { mesocycleSource } = route.params as {
    mesocycleSource: IMesocycleSummary | null;
  };

  return {
    mesocycleSource,
  };
};
