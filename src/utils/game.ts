export type CaveData = [number, number][];
export const DRONE_SIZE = 50;
export const ROW_HEIGHT = 10;

export function collides(x: number, y: number, cave: CaveData): boolean {
  if (y < 0) return true;
  const first = Math.max(0, Math.floor(y / ROW_HEIGHT));
  const last = Math.min(cave.length - 1, Math.floor((y + DRONE_SIZE - 0.001) / ROW_HEIGHT));
  for (let row = first; row <= last; row++) {
    const [left, right] = cave[row];
    if (x < left || x + DRONE_SIZE > right) return true;
  }
  return false;
}
