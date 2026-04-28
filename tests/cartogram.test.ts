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

    expect(geometry.silhouetteRects.length).toBeGreaterThan(0);
    expect(geometry.shapes).toHaveLength(regions.length);

    for (const shape of geometry.shapes) {
      expect(shape.polygon.length).toBeGreaterThanOrEqual(3);
      expect(getPolygonArea(shape.polygon)).toBeGreaterThan(100);
      expect(shape.bounds.width).toBeGreaterThan(10);
      expect(shape.bounds.height).toBeGreaterThan(10);
      expect(shape.labelFontSize).toBeGreaterThan(0);
      expect(shape.label.x).toBeGreaterThan(shape.rect.x);
      expect(shape.label.x).toBeLessThan(shape.rect.x + shape.rect.width);
      expect(shape.label.y).toBeGreaterThan(shape.rect.y);
      expect(shape.label.y).toBeLessThan(shape.rect.y + shape.rect.height);

      for (const point of shape.polygon) {
        expect(point.x).toBeGreaterThanOrEqual(shape.rect.x);
        expect(point.x).toBeLessThanOrEqual(shape.rect.x + shape.rect.width);
        expect(point.y).toBeGreaterThanOrEqual(shape.rect.y);
        expect(point.y).toBeLessThanOrEqual(shape.rect.y + shape.rect.height);
      }
    }
  });
});
