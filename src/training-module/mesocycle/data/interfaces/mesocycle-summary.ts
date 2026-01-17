import { MesocycleStatus } from '../enums/mesocycle-status';

export interface IMesocycleSummary {
  id: string;
  name: string;
  num_weeks: number;
  days_per_week: number;
  status: MesocycleStatus;
  is_ai_generated: boolean;
}
