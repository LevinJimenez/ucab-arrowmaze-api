import { SurvivalEntry } from '../entities/SurvivalEntry';
import { Duration } from '../value-objects/Duration';

export interface ISurvivalRepository {
  addEntry(entry: SurvivalEntry): Promise<SurvivalEntry>;
  getTop(durationSeconds: Duration, limit: number): Promise<SurvivalEntry[]>;
}
