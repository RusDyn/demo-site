import { describe, it, expect } from 'vitest';
import { clamp, randomBetween, round, sum, average } from './math.js';

describe('Math utilities', () => {
  describe('clamp', () => {
    it('clamps value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles edge cases', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('works with negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });
  });

  describe('randomBetween', () => {
    it('generates number within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomBetween(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThan(10);
      }
    });

    it('handles equal min and max', () => {
      expect(randomBetween(5, 5)).toBe(5);
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 10; i++) {
        const result = randomBetween(-10, -1);
        expect(result).toBeGreaterThanOrEqual(-10);
        expect(result).toBeLessThan(-1);
      }
    });
  });

  describe('round', () => {
    it('rounds to specified decimal places', () => {
      expect(round(3.14159, 2)).toBe(3.14);
      expect(round(3.14159, 4)).toBe(3.1416);
      expect(round(3.14159, 0)).toBe(3);
    });

    it('handles default parameter', () => {
      expect(round(3.7)).toBe(4);
      expect(round(3.2)).toBe(3);
    });

    it('handles negative numbers', () => {
      expect(round(-3.14159, 2)).toBe(-3.14);
    });

    it('handles whole numbers', () => {
      expect(round(5, 2)).toBe(5);
    });
  });

  describe('sum', () => {
    it('calculates sum of numbers', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
      expect(sum([-1, 1, -2, 2])).toBe(0);
    });

    it('handles empty array', () => {
      expect(sum([])).toBe(0);
    });

    it('handles single element', () => {
      expect(sum([42])).toBe(42);
    });

    it('handles decimal numbers', () => {
      expect(sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
    });
  });

  describe('average', () => {
    it('calculates average of numbers', () => {
      expect(average([1, 2, 3, 4, 5])).toBe(3);
      expect(average([10, 20])).toBe(15);
    });

    it('throws error for empty array', () => {
      expect(() => average([])).toThrow('Cannot calculate average of empty array');
    });

    it('handles single element', () => {
      expect(average([42])).toBe(42);
    });

    it('handles decimal results', () => {
      expect(average([1, 2, 3])).toBeCloseTo(2);
      expect(average([1, 4])).toBe(2.5);
    });
  });
});