import { LeaderboardEntry, LeaderboardEntryProps } from '../../src/domain/entities/LeaderboardEntry';

export class LeaderboardEntryBuilder {
  private props: LeaderboardEntryProps = {
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

  public buildProps(): LeaderboardEntryProps { return { ...this.props }; }
  public build(): LeaderboardEntry { return new LeaderboardEntry(this.buildProps()); }
}

export const aLeaderboardEntry = (): LeaderboardEntryBuilder => new LeaderboardEntryBuilder();
