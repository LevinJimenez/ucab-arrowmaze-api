import { SurvivalEntry, SurvivalEntryProps } from '../../src/domain/entities/SurvivalEntry';
import { UserId } from '../../src/domain/value-objects/UserId';
import { Username } from '../../src/domain/value-objects/Username';
import { BoardsSolved } from '../../src/domain/value-objects/BoardsSolved';
import { Duration } from '../../src/domain/value-objects/Duration';
import { Score } from '../../src/domain/value-objects/Score';

interface RawSurvivalEntryProps {
  userId: string;
  username: string;
  boardsSolved: number;
  durationSeconds: number;
  totalScore?: number;
  playedAt: Date;
}

export class SurvivalEntryBuilder {
  private props: RawSurvivalEntryProps = {
    userId: 'user-1',
    username: 'player1',
    boardsSolved: 7,
    durationSeconds: 120,
    totalScore: 4200,
    playedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  public forUser(userId: string, username: string): this {
    this.props.userId = userId;
    this.props.username = username;
    return this;
  }
  public withBoardsSolved(boardsSolved: number): this { this.props.boardsSolved = boardsSolved; return this; }
  public withDurationSeconds(durationSeconds: number): this {
    this.props.durationSeconds = durationSeconds;
    return this;
  }
  public withTotalScore(totalScore: number | undefined): this { this.props.totalScore = totalScore; return this; }

  /** Props envueltas en VOs (el constructor de SurvivalEntry ya no valida). */
  public buildProps(): SurvivalEntryProps {
    return {
      userId: UserId.create(this.props.userId),
      username: Username.create(this.props.username),
      boardsSolved: BoardsSolved.create(this.props.boardsSolved),
      durationSeconds: Duration.create(this.props.durationSeconds),
      totalScore: this.props.totalScore !== undefined ? Score.create(this.props.totalScore) : undefined,
      playedAt: this.props.playedAt,
    };
  }

  public build(): SurvivalEntry { return new SurvivalEntry(this.buildProps()); }
}

export const aSurvivalEntry = (): SurvivalEntryBuilder => new SurvivalEntryBuilder();
