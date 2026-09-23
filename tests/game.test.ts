import { describe, expect, it } from 'vitest';
import { collides } from '../src/utils/game';

describe('cave collisions', () => {
  const cave: [number, number][] = Array.from({ length: 20 }, () => [100, 300]);
  it('allows the drone inside the corridor and at its boundaries', () => {
    expect(collides(100, 0, cave)).toBe(false);
    expect(collides(250, 20, cave)).toBe(false);
  });
  it('detects both walls and the top boundary', () => {
    expect(collides(99, 0, cave)).toBe(true);
    expect(collides(251, 0, cave)).toBe(true);
    expect(collides(150, -1, cave)).toBe(true);
  });
  it('only checks rows overlapping the drone', () => {
    const bend: [number, number][] = [...cave];
    bend[10] = [220, 300];
    expect(collides(150, 0, bend)).toBe(false);
    expect(collides(150, 51, bend)).toBe(true);
  });
  it('allows exiting the final row', () => {
    expect(collides(150, 200, cave)).toBe(false);
  });
});
