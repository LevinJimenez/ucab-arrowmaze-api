import { ValidationError } from '../errors/DomainErrors';

export interface LeaderboardEntryProps {
  userId: string;
  username: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  rankedAt: Date;
}

export class LeaderboardEntry {
  public readonly userId: string;
  public readonly username: string;
  public readonly levelId: string;
  public readonly score: number;
  public readonly moves: number;
  public readonly timeSeconds: number;
  public readonly rankedAt: Date;

  constructor(props: LeaderboardEntryProps) {
    if (props.score < 0) {
      throw new ValidationError('Score cannot be negative');
    }
    if (props.moves < 0) {
      throw new ValidationError('Moves cannot be negative');
    }
    if (props.timeSeconds < 0) {
      throw new ValidationError('Time seconds cannot be negative');
    }

    this.userId = props.userId;
    this.username = props.username;
    this.levelId = props.levelId;
    this.score = props.score;
    this.moves = props.moves;
    this.timeSeconds = props.timeSeconds;
    this.rankedAt = props.rankedAt;
  }
}
