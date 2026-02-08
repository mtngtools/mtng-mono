import { describe, it, expect } from 'vitest';
import { identity } from '../../src/index.js';

describe('identity', () => {
  it('returns the same value for primitives', () => {
    expect(identity(1)).toBe(1);
    expect(identity('hello')).toBe('hello');
    expect(identity(true)).toBe(true);
    expect(identity(null)).toBe(null);
    expect(identity(undefined)).toBe(undefined);
  });

  it('returns the same reference for objects', () => {
    const obj = { a: 1 };
    expect(identity(obj)).toBe(obj);
  });
});
