import { describe, it, expect } from 'vitest';
import { BcryptPasswordService } from '../../../src/infrastructure/services/BcryptPasswordService';

describe('BcryptPasswordService', () => {
  it('should_produce_a_hash_different_from_the_plain_password_when_hashing', async () => {
    // Arrange
    const service = new BcryptPasswordService();

    // Act
    const hash = await service.hash('securePass123');

    // Assert
    expect(hash).not.toBe('securePass123');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('should_verify_true_when_password_matches_the_hash', async () => {
    // Arrange
    const service = new BcryptPasswordService();
    const hash = await service.hash('securePass123');

    // Act
    const isValid = await service.verify('securePass123', hash);

    // Assert
    expect(isValid).toBe(true);
  });

  it('should_verify_false_when_password_does_not_match_the_hash', async () => {
    // Arrange
    const service = new BcryptPasswordService();
    const hash = await service.hash('securePass123');

    // Act
    const isValid = await service.verify('wrongPassword', hash);

    // Assert
    expect(isValid).toBe(false);
  });
});
