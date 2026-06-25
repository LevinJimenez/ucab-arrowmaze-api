import { LevelDefinition, LevelDefinitionProps } from '../../src/domain/entities/LevelDefinition';

export class LevelDefinitionBuilder {
  private props: LevelDefinitionProps = {
    id: 'level_heart',
    name: 'Corazón',
    difficulty: 'easy',
    parMoves: 12,
    data: {
      cells: [[0, 1], [0, 2], [1, 0]],
      arrows: [{ id: 'a1', path: [[2, 2], [1, 2], [0, 2]], color: '#EF476F' }],
      lives: 5,
    },
  };

  public withId(id: string): this { this.props.id = id; return this; }
  public withName(name: string): this { this.props.name = name; return this; }
  public withDifficulty(difficulty: string): this { this.props.difficulty = difficulty; return this; }
  public withParMoves(parMoves: number): this { this.props.parMoves = parMoves; return this; }
  public withoutCells(): this { this.props.data = { ...this.props.data, cells: [] }; return this; }
  public withoutArrows(): this { this.props.data = { ...this.props.data, arrows: [] }; return this; }

  /** Props crudas (para invariantes que esperan que el constructor lance). */
  public buildProps(): LevelDefinitionProps { return { ...this.props, data: { ...this.props.data } }; }
  public build(): LevelDefinition { return new LevelDefinition(this.buildProps()); }
}

export const aLevel = (): LevelDefinitionBuilder => new LevelDefinitionBuilder();
