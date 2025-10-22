import { describe, it, expect } from 'vitest';
import { capitalize, slugify, isValidEmail } from './utils/string.js';
import { chunk, unique, groupBy } from './utils/array.js';
import { sum, average, round } from './utils/math.js';

describe('Integration tests', () => {
  describe('User data processing pipeline', () => {
    it('processes user data with multiple utilities', () => {
      // Mock user data
      const rawUsers = [
        { name: 'john doe', email: 'john@example.com', score: 85.6789 },
        { name: 'JANE SMITH', email: 'jane@test.com', score: 92.1234 },
        { name: 'bob johnson', email: 'invalid-email', score: 78.9876 },
        { name: 'alice brown', email: 'alice@domain.org', score: 96.5432 },
        { name: 'charlie davis', email: 'charlie@test.com', score: 83.2109 }
      ];

      // Process users: normalize names, validate emails, round scores
      const processedUsers = rawUsers
        .filter(user => isValidEmail(user.email))
        .map(user => ({
          name: capitalize(user.name),
          email: user.email,
          slug: slugify(user.name),
          score: round(user.score, 1)
        }));

      expect(processedUsers).toEqual([
        { name: 'John doe', email: 'john@example.com', slug: 'john-doe', score: 85.7 },
        { name: 'Jane smith', email: 'jane@test.com', slug: 'jane-smith', score: 92.1 },
        { name: 'Alice brown', email: 'alice@domain.org', slug: 'alice-brown', score: 96.5 },
        { name: 'Charlie davis', email: 'charlie@test.com', slug: 'charlie-davis', score: 83.2 }
      ]);

      // Group by email domain
      const groupedByDomain = groupBy(processedUsers, user => {
        const domain = user.email.split('@')[1];
        return domain ?? 'unknown';
      });

      expect(groupedByDomain).toHaveProperty('example.com');
      expect(groupedByDomain).toHaveProperty('test.com');
      expect(groupedByDomain).toHaveProperty('domain.org');
      expect(groupedByDomain['test.com']).toHaveLength(2);
    });

    it('calculates statistics from processed data', () => {
      const scores = [85.7, 92.1, 96.5, 83.2];
      
      expect(sum(scores)).toBeCloseTo(357.5);
      expect(average(scores)).toBeCloseTo(89.375);
      expect(round(average(scores), 1)).toBe(89.4);
    });

    it('chunks and processes large datasets', () => {
      const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
      const uniqueNumbers = unique([...numbers, ...numbers]); // Add duplicates
      const chunks = chunk(uniqueNumbers, 10);
      
      expect(chunks).toHaveLength(10);
      expect(chunks[0]).toHaveLength(10);
      expect(chunks[9]).toHaveLength(10);
      
      // Calculate sum of each chunk
      const chunkSums = chunks.map(chunk => sum(chunk));
      expect(sum(chunkSums)).toBe(5050); // Sum of 1 to 100
    });
  });

  describe('Content management pipeline', () => {
    it('processes article data', () => {
      const articles = [
        { title: '  How to Code Better  ', content: 'Lorem ipsum...' },
        { title: 'JavaScript Tips & Tricks!', content: 'More content...' },
        { title: 'TypeScript Guide', content: 'Guide content...' }
      ];

      const processedArticles = articles.map(article => ({
        title: capitalize(article.title.trim()),
        slug: slugify(article.title),
        wordCount: article.content.split(' ').length
      }));

      expect(processedArticles).toEqual([
        { title: 'How to code better', slug: 'how-to-code-better', wordCount: 2 },
        { title: 'Javascript tips & tricks!', slug: 'javascript-tips-tricks', wordCount: 2 },
        { title: 'Typescript guide', slug: 'typescript-guide', wordCount: 2 }
      ]);

      const totalWords = sum(processedArticles.map(a => a.wordCount));
      expect(totalWords).toBe(6);
    });
  });
});