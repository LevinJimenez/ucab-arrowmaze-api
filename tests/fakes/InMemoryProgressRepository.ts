import { PlayerProgress } from '../../src/domain/entities/PlayerProgress';
import { IProgressRepository } from '../../src/domain/interfaces/IProgressRepository';

export class InMemoryProgressRepository implements IProgressRepository {
  private readonly byUser = new Map<string, PlayerProgress>();

  public async getByUserId(userId: string): Promise<PlayerProgress | null> {
    return this.byUser.get(userId) ?? null;
  }

  public async save(progress: PlayerProgress): Promise<PlayerProgress> {
    this.byUser.set(progress.userId, progress);
    return progress;
  }
}
