import { describe, it, expect } from 'vitest';
import { capitalize, slugify, truncate, isValidEmail } from './string.js';

describe('String utilities', () => {
  describe('capitalize', () => {
    it('capitalizes first letter and lowercases rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('hELLO wORLD')).toBe('Hello world');
    });

    it('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A');
      expect(capitalize('Z')).toBe('Z');
    });
  });

  describe('slugify', () => {
    it('converts string to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('handles special characters', () => {
      expect(slugify('Hello@World#123')).toBe('helloworld123');
      expect(slugify('café & résumé')).toBe('caf-rsum');
    });

    it('handles empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('removes leading and trailing dashes', () => {
      expect(slugify('---hello---')).toBe('hello');
    });
  });

  describe('truncate', () => {
    it('truncates long strings', () => {
      expect(truncate('Hello World', 5)).toBe('He...');
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('does not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('Hello World', 11)).toBe('Hello World');
    });

    it('uses custom suffix', () => {
      expect(truncate('Hello World', 8, '***')).toBe('Hello***');
    });

    it('handles edge cases', () => {
      expect(truncate('Hello', 3, '...')).toBe('...');
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('user123@subdomain.example.org')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});