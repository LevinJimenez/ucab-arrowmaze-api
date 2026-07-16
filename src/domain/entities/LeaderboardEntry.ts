import { UserId } from '../value-objects/UserId';
import { Username } from '../value-objects/Username';
import { LevelId } from '../value-objects/LevelId';
import { Score } from '../value-objects/Score';
import { Moves } from '../value-objects/Moves';
import { TimeSeconds } from '../value-objects/TimeSeconds';

export interface LeaderboardEntryProps {
  userId: UserId;
  username: Username;
  levelId: LevelId;
  score: Score;
  moves: Moves;
  timeSeconds: TimeSeconds;
  rankedAt: Date;
}

export class LeaderboardEntry {
  public readonly userId: UserId;
  public readonly username: Username;
  public readonly levelId: LevelId;
  public readonly score: Score;
  public readonly moves: Moves;
  public readonly timeSeconds: TimeSeconds;
  public readonly rankedAt: Date;

  constructor(props: LeaderboardEntryProps) {
    this.userId = props.userId;
    this.username = props.username;
    this.levelId = props.levelId;
    this.score = props.score;
    this.moves = props.moves;
    this.timeSeconds = props.timeSeconds;
    this.rankedAt = props.rankedAt;
  }
}
