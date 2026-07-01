import { describe, it, expect } from 'vitest';
import { UuidIdGenerator } from '../../../src/infrastructure/services/UuidIdGenerator';

describe('UuidIdGenerator', () => {
  it('should_generate_a_non_empty_id', () => {
    // Arrange
    const generator = new UuidIdGenerator();

    // Act
    const id = generator.generate();

    // Assert
    expect(id.length).toBeGreaterThan(0);
  });

  it('should_generate_different_ids_across_calls', () => {
    // Arrange
    const generator = new UuidIdGenerator();

    // Act
    const first = generator.generate();
    const second = generator.generate();

    // Assert
    expect(first).not.toBe(second);
  });
});
