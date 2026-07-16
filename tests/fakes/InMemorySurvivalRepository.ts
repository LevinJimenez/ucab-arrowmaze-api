import { SurvivalEntry } from '../../src/domain/entities/SurvivalEntry';
import { ISurvivalRepository } from '../../src/domain/interfaces/ISurvivalRepository';
import { Duration } from '../../src/domain/value-objects/Duration';

export class InMemorySurvivalRepository implements ISurvivalRepository {
  private readonly entries: SurvivalEntry[] = [];

  public async addEntry(entry: SurvivalEntry): Promise<SurvivalEntry> {
    this.entries.push(entry);
    return entry;
  }

  /**
   * Mismo desempate que PostgresSurvivalRepository: boardsSolved DESC,
   * luego totalScore DESC (las corridas sin totalScore quedan al final),
   * luego playedAt ASC (la corrida más temprana rompe el empate).
   */
  public async getTop(durationSeconds: Duration, limit: number): Promise<SurvivalEntry[]> {
    return this.entries
      .filter((e) => e.durationSeconds.equals(durationSeconds))
      .sort((a, b) => {
        if (b.boardsSolved.value !== a.boardsSolved.value) {
          return b.boardsSolved.value - a.boardsSolved.value;
        }
        const aScore = a.totalScore?.value ?? -Infinity;
        const bScore = b.totalScore?.value ?? -Infinity;
        if (bScore !== aScore) {
          return bScore - aScore;
        }
        return a.playedAt.getTime() - b.playedAt.getTime();
      })
      .slice(0, limit);
  }

  /** Helper de inspección de estado (solo tests). */
  public getAll(): SurvivalEntry[] {
    return [...this.entries];
  }
}
