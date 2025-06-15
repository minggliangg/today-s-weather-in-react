import { describe, it, expect } from 'vitest';
import { cn, toTitleCase, epochToDateLocaleString } from './utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('toTitleCase', () => {
  it('should convert string to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('should handle single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });

  it('should handle mixed case input', () => {
    expect(toTitleCase('hELLo WoRLD')).toBe('Hello World');
  });

  it('should handle empty string', () => {
    expect(toTitleCase('')).toBe('');
  });

  it('should handle string with special characters', () => {
    expect(toTitleCase('hello-world test_case')).toBe('Hello-world Test_case');
  });
});

describe('epochToDateLocaleString', () => {
  it('should convert epoch timestamp to locale string', () => {
    const epoch = 1640995200; // 2022-01-01 00:00:00 UTC
    const result = epochToDateLocaleString(epoch);
    expect(result).toMatch(/2022/);
    expect(typeof result).toBe('string');
  });

  it('should handle different timestamps', () => {
    const epoch = 0; // 1970-01-01 00:00:00 UTC
    const result = epochToDateLocaleString(epoch);
    expect(result).toMatch(/1970/);
  });
});