import { PlayerProgress } from '../entities/PlayerProgress';

export interface IProgressRepository {
  getByUserId(userId: string): Promise<PlayerProgress | null>;
  save(progress: PlayerProgress): Promise<PlayerProgress>;
}
