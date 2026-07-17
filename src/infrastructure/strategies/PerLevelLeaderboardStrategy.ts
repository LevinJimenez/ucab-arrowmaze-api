import { LeaderboardEntry } from '../../domain/entities/LeaderboardEntry';
import { ILeaderboardStrategy } from '../../domain/interfaces/ILeaderboardStrategy';

export class PerLevelLeaderboardStrategy implements ILeaderboardStrategy {
  public calculateRanking(entries: LeaderboardEntry[], limit: number): LeaderboardEntry[] {
    // Una fila por jugador POR NIVEL: la clave es (userId, levelId), no solo
    // userId — así la estrategia queda correcta incluso si le pasaran entradas
    // de varios niveles mezcladas (TotalScoreLeaderboardStrategy es la que
    // agrega ENTRE niveles a propósito; esta política es per-nivel).
    const bestByPlayerAndLevel = new Map<string, LeaderboardEntry>();

    for (const entry of entries) {
      const key = `${entry.userId.value}:${entry.levelId.value}`;
      const existing = bestByPlayerAndLevel.get(key);
      if (!existing || this.compare(entry, existing) < 0) {
        bestByPlayerAndLevel.set(key, entry);
      }
    }

    return Array.from(bestByPlayerAndLevel.values())
      .sort((a, b) => this.compare(a, b))
      .slice(0, limit);
  }

  /**
   * Orden total y determinista, usado tanto para elegir la mejor marca de
   * cada jugador como para ordenar el resultado final (un único criterio,
   * para que ambos pasos no puedan desincronizarse):
   *   1. score mayor primero
   *   2. a igualdad, timeSeconds menor primero
   *   3. a igualdad, moves menor primero
   *   4. a igualdad, rankedAt más antiguo primero
   * El criterio 4 es lo que hace el orden TOTAL: sin él, dos marcas idénticas
   * en score/tiempo/movimientos quedarían en el orden arbitrario en que
   * Postgres devuelva las filas (no garantiza orden estable para iguales).
   */
  private compare(a: LeaderboardEntry, b: LeaderboardEntry): number {
    if (a.score.value !== b.score.value) {
      return b.score.value - a.score.value;
    }
    if (a.timeSeconds.value !== b.timeSeconds.value) {
      return a.timeSeconds.value - b.timeSeconds.value;
    }
    if (a.moves.value !== b.moves.value) {
      return a.moves.value - b.moves.value;
    }
    return a.rankedAt.getTime() - b.rankedAt.getTime();
  }
}
