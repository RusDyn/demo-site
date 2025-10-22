/**
 * Math utility functions
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) throw new Error('Cannot calculate average of empty array');
  return sum(numbers) / numbers.length;
}