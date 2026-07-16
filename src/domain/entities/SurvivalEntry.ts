import { UserId } from '../value-objects/UserId';
import { Username } from '../value-objects/Username';
import { BoardsSolved } from '../value-objects/BoardsSolved';
import { Duration } from '../value-objects/Duration';
import { Score } from '../value-objects/Score';

export interface SurvivalEntryProps {
  userId: UserId;
  username: Username;
  boardsSolved: BoardsSolved;
  durationSeconds: Duration;
  totalScore?: Score;
  playedAt: Date;
}

/**
 * SurvivalEntry — marca inmutable de una corrida de modo Supervivencia.
 * Se añade, jamás se edita (igual que LeaderboardEntry). El backend confía en
 * lo que reporta el cliente: no puede verificar la corrida sin simular el
 * juego (mismo trade-off de Mecánica A, no uno nuevo).
 */
export class SurvivalEntry {
  public readonly userId: UserId;
  public readonly username: Username;
  public readonly boardsSolved: BoardsSolved;
  public readonly durationSeconds: Duration;
  public readonly totalScore?: Score;
  public readonly playedAt: Date;

  constructor(props: SurvivalEntryProps) {
    this.userId = props.userId;
    this.username = props.username;
    this.boardsSolved = props.boardsSolved;
    this.durationSeconds = props.durationSeconds;
    this.totalScore = props.totalScore;
    this.playedAt = props.playedAt;
  }
}
