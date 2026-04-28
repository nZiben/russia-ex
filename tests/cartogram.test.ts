import { describe, expect, it } from 'vitest';
import { regions } from '../src/config/regions';
import { buildCartogramGeometry } from '../src/render/cartogram';

function getPolygonArea(points: { x: number; y: number }[]): number {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return Math.abs(area / 2);
}

describe('cartogram geometry', () => {
  it('creates a non-degenerate polygon for every region', () => {
    const geometry = buildCartogramGeometry(regions);

    expect(geometry.shapes).toHaveLength(regions.length);

    for (const shape of geometry.shapes) {
      expect(shape.polygon.length).toBeGreaterThanOrEqual(3);
      expect(getPolygonArea(shape.polygon)).toBeGreaterThan(100);
      expect(shape.bounds.width).toBeGreaterThan(10);
      expect(shape.bounds.height).toBeGreaterThan(10);
      expect(shape.labelFontSize).toBeGreaterThan(0);
    }
  });
});
