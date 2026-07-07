import { LeaderboardEntry, LeaderboardEntryProps } from '../../src/domain/entities/LeaderboardEntry';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Username } from '../../src/domain/value-objects/Username';
import { LevelId } from '../../src/domain/value-objects/LevelId';
import { Score } from '../../src/domain/value-objects/Score';
import { Moves } from '../../src/domain/value-objects/Moves';
import { TimeSeconds } from '../../src/domain/value-objects/TimeSeconds';

interface RawLeaderboardEntryProps {
  userId: string;
  username: string;
  levelId: string;
  score: number;
  moves: number;
  timeSeconds: number;
  rankedAt: Date;
}

export class LeaderboardEntryBuilder {
  private props: RawLeaderboardEntryProps = {
    userId: 'user-1',
    username: 'player1',
    levelId: 'level_1',
    score: 900,
    moves: 5,
    timeSeconds: 30,
    rankedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  public forUser(userId: string, username: string): this {
    this.props.userId = userId;
    this.props.username = username;
    return this;
  }
  public onLevel(levelId: string): this { this.props.levelId = levelId; return this; }
  public withScore(score: number): this { this.props.score = score; return this; }
  public withMoves(moves: number): this { this.props.moves = moves; return this; }
  public withTimeSeconds(timeSeconds: number): this { this.props.timeSeconds = timeSeconds; return this; }

  /** Props envueltas en VOs (el constructor de LeaderboardEntry ya no valida). */
  public buildProps(): LeaderboardEntryProps {
    return {
      userId: UserId.create(this.props.userId),
      username: Username.create(this.props.username),
      levelId: LevelId.create(this.props.levelId),
      score: Score.create(this.props.score),
      moves: Moves.create(this.props.moves),
      timeSeconds: TimeSeconds.create(this.props.timeSeconds),
      rankedAt: this.props.rankedAt,
    };
  }

  public build(): LeaderboardEntry { return new LeaderboardEntry(this.buildProps()); }
}

export const aLeaderboardEntry = (): LeaderboardEntryBuilder => new LeaderboardEntryBuilder();
