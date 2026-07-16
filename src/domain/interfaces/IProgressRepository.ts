import { PlayerProgress } from '../entities/PlayerProgress';
import { UserId } from '../value-objects/UserId';

export interface IProgressRepository {
  getByUserId(userId: UserId): Promise<PlayerProgress | null>;
  save(progress: PlayerProgress): Promise<PlayerProgress>;
}
