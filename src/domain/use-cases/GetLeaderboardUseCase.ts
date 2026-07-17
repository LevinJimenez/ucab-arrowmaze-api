import { LeaderboardEntry } from '../entities/LeaderboardEntry';
import { ILeaderboardRepository } from '../interfaces/ILeaderboardRepository';
import { ILeaderboardStrategy } from '../interfaces/ILeaderboardStrategy';
import { IUseCase } from '../interfaces/IUseCase';
import { LevelId } from '../value-objects/LevelId';

export interface GetLeaderboardInput {
  levelId: string;
  limit?: number;
}

// Se piden más filas de las que finalmente se devuelven (limit) porque la
// Strategy puede deduplicar por jugador (una fila por jugador, su mejor
// marca): sin un colchón amplio, un jugador con muchos intentos en un nivel
// podría llenar él solo el reservorio de candidatas y desplazar a otros
// jugadores del ranking final antes de que la Strategy pueda deduplicar.
// Límite conocido: un nivel con más de CANDIDATE_POOL_SIZE intentos de UN
// MISMO jugador seguiría teniendo este problema (otros jugadores con menos
// intentos podrían no entrar al pool de candidatas).
const CANDIDATE_POOL_SIZE = 500;

export class GetLeaderboardUseCase implements IUseCase<GetLeaderboardInput, LeaderboardEntry[]> {
  constructor(
    private readonly leaderboardRepository: ILeaderboardRepository,
    private readonly leaderboardStrategy: ILeaderboardStrategy,
  ) {}

  public async execute(input: GetLeaderboardInput): Promise<LeaderboardEntry[]> {
    const limit = input.limit ?? 10;
    const levelId = LevelId.create(input.levelId);
    const entries = await this.leaderboardRepository.getByLevel(levelId, CANDIDATE_POOL_SIZE);
    return this.leaderboardStrategy.calculateRanking(entries, limit);
  }
}
