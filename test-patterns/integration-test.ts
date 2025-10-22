// src/api/user.api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { setupTestDatabase, cleanupTestDatabase } from '@/test/helpers';

describe('User API', () => {
  beforeAll(async () => {
    await (setupTestDatabase as () => Promise<void>)();
  });

  afterAll(async () => {
    await (cleanupTestDatabase as () => Promise<void>)();
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const response = await (request as (app: unknown) => {
        post: (path: string) => {
          send: (data: unknown) => {
            expect: (status: number) => Promise<{ body: unknown }>;
          };
        };
      })(app as unknown)
        .post('/api/users')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
        })
        .expect(201);

      expect((response as { body: unknown }).body).toMatchObject({
        success: true,
        data: {
          email: 'newuser@example.com',
          name: 'New User',
        },
      });
    });

    it('should return 400 for invalid data', async () => {
      const response = await (request as (app: unknown) => {
        post: (path: string) => {
          send: (data: unknown) => {
            expect: (status: number) => Promise<{ body: unknown }>;
          };
        };
      })(app as unknown)
        .post('/api/users')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect((response as { body: unknown }).body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
        },
      });
    });
  });
});