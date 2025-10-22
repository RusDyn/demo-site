import { describe, it, expect } from 'vitest';
import { chunk, unique, groupBy, shuffle } from './array.js';

describe('Array utilities', () => {
  describe('chunk', () => {
    it('splits array into chunks of specified size', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('handles empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('handles chunk size larger than array', () => {
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });

    it('throws error for invalid chunk size', () => {
      expect(() => chunk([1, 2, 3], 0)).toThrow('Chunk size must be positive');
      expect(() => chunk([1, 2, 3], -1)).toThrow('Chunk size must be positive');
    });
  });

  describe('unique', () => {
    it('removes duplicate values', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    it('handles empty array', () => {
      expect(unique([])).toEqual([]);
    });

    it('handles array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
    });
  });

  describe('groupBy', () => {
    it('groups array elements by key function', () => {
      const people = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 25 }
      ];
      
      expect(groupBy(people, p => p.age)).toEqual({
        25: [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 25 }],
        30: [{ name: 'Bob', age: 30 }]
      });
    });

    it('handles empty array', () => {
      expect(groupBy([], x => x)).toEqual({});
    });

    it('groups strings by first letter', () => {
      const words = ['apple', 'banana', 'cherry', 'apricot'];
      expect(groupBy(words, word => word[0] ?? 'unknown')).toEqual({
        a: ['apple', 'apricot'],
        b: ['banana'],
        c: ['cherry']
      });
    });
  });

  describe('shuffle', () => {
    it('returns array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffle(original);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    it('does not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffle(original);
      
      expect(original).toEqual(originalCopy);
    });

    it('handles empty array', () => {
      expect(shuffle([])).toEqual([]);
    });

    it('handles single element array', () => {
      expect(shuffle([1])).toEqual([1]);
    });
  });
});