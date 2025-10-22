// src/services/user.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from './user.service';
import { Ok, Err as _Err } from '@/types/result';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: {
    findById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    service = new UserService(mockRepository as unknown as UserService['repository']);
  });

  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const expectedUser = { id: '123', ...userData };
      mockRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toEqual(Ok(expectedUser));
      expect(mockRepository.create as unknown).toHaveBeenCalledWith(userData);
    });

    it('should return validation error for invalid email', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        name: 'Test User',
      };

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect((result as { success: boolean }).success).toBe(false);
      if (!(result as { success: boolean }).success) {
        expect((result as { error: { type: string } }).error.type).toBe('VALIDATION_ERROR');
      }
      expect(mockRepository.create as unknown).not.toHaveBeenCalled();
    });
  });
});