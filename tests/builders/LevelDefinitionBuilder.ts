import { LevelDefinition, LevelDefinitionProps } from '../../src/domain/entities/LevelDefinition';
import { UpsertLevelInput } from '../../src/domain/use-cases/UpsertLevelDefinitionUseCase';
import { LevelId } from '../../src/domain/value-objects/LevelId';
import { LevelName } from '../../src/domain/value-objects/LevelName';
import { Difficulty } from '../../src/domain/value-objects/Difficulty';
import { ParMoves } from '../../src/domain/value-objects/ParMoves';
import { LevelData, LevelDataProps } from '../../src/domain/value-objects/LevelData';

interface RawLevelDefinitionProps {
  id: string;
  name: string;
  difficulty: string;
  parMoves?: number;
  data: LevelDataProps;
}

export class LevelDefinitionBuilder {
  private props: RawLevelDefinitionProps = {
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

  /** Props envueltas en VOs (el constructor de LevelDefinition ya no valida). */
  public buildProps(): LevelDefinitionProps {
    return {
      id: LevelId.create(this.props.id),
      name: LevelName.create(this.props.name),
      difficulty: Difficulty.create(this.props.difficulty),
      parMoves: this.props.parMoves !== undefined ? ParMoves.create(this.props.parMoves) : undefined,
      data: LevelData.create({ ...this.props.data }),
    };
  }

  public build(): LevelDefinition { return new LevelDefinition(this.buildProps()); }

  /** Input crudo compatible con UpsertLevelDefinitionUseCase.execute(). */
  public buildUpsertInput(): UpsertLevelInput {
    return {
      id: this.props.id,
      name: this.props.name,
      difficulty: this.props.difficulty,
      parMoves: this.props.parMoves,
      data: { ...this.props.data },
    };
  }
}

export const aLevel = (): LevelDefinitionBuilder => new LevelDefinitionBuilder();
