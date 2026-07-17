import { SurvivalEntry } from '../entities/SurvivalEntry';
import { ISurvivalRepository } from '../interfaces/ISurvivalRepository';
import { IUseCase } from '../interfaces/IUseCase';
import { Duration } from '../value-objects/Duration';

export interface GetSurvivalLeaderboardInput {
  durationSeconds: number;
  limit?: number;
}

// Se piden más filas de las que finalmente se devuelven (limit) porque el
// repositorio puede tener varias corridas del mismo jugador: sin un colchón
// amplio, un jugador con muchas corridas en la misma duración podría llenar
// él solo el reservorio de candidatas y desplazar a otros jugadores del
// ranking final antes de poder deduplicar. Límite conocido: un jugador con
// más de CANDIDATE_POOL_SIZE corridas en la misma duración seguiría teniendo
// este problema (otros jugadores con menos corridas podrían no entrar al
// pool de candidatas). Mismo criterio y mismo nombre que GetLeaderboardUseCase.
const CANDIDATE_POOL_SIZE = 500;

export class GetSurvivalLeaderboardUseCase implements IUseCase<GetSurvivalLeaderboardInput, SurvivalEntry[]> {
  constructor(
    private readonly survivalRepository: ISurvivalRepository,
  ) {}

  public async execute(input: GetSurvivalLeaderboardInput): Promise<SurvivalEntry[]> {
    const limit = input.limit ?? 10;
    const durationSeconds = Duration.create(input.durationSeconds);
    const candidates = await this.survivalRepository.getTop(durationSeconds, CANDIDATE_POOL_SIZE);

    // El repositorio (Postgres e InMemory por igual) ya devuelve las
    // candidatas ordenadas por el criterio de ranking (boardsSolved desc,
    // totalScore desc, playedAt asc), así que la PRIMERA aparición de cada
    // userId ES su mejor corrida, por construcción — no hace falta comparar
    // ni reordenar aquí, solo quedarse con la primera de cada jugador. Esta
    // simplificación depende POR COMPLETO de esa invariante: si el ORDER BY
    // del repositorio cambiara, esto dejaría de ser cierto y habría que
    // reintroducir una comparación explícita (como en PerLevelLeaderboardStrategy).
    const best: SurvivalEntry[] = [];
    const seenPlayers = new Set<string>();
    for (const entry of candidates) {
      if (seenPlayers.has(entry.userId.value)) {
        continue;
      }
      seenPlayers.add(entry.userId.value);
      best.push(entry);
      if (best.length === limit) {
        break;
      }
    }

    return best;
  }
}
