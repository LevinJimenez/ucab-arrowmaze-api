import { PlayerProgress } from '../../src/domain/entities/PlayerProgress';
import { IProgressRepository } from '../../src/domain/interfaces/IProgressRepository';
import { UserId } from '../../src/domain/value-objects/UserId';

export class InMemoryProgressRepository implements IProgressRepository {
  private readonly byUser = new Map<string, PlayerProgress>();

  public async getByUserId(userId: UserId): Promise<PlayerProgress | null> {
    return this.byUser.get(userId.value) ?? null;
  }

  public async save(progress: PlayerProgress): Promise<PlayerProgress> {
    this.byUser.set(progress.userId.value, progress);
    return progress;
  }
}
