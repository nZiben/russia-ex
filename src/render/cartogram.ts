import type { DistrictId, Region } from '../state/types';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PolygonBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface RegionShape {
  region: Region;
  componentId: string;
  site: Point;
  label: Point;
  polygon: Point[];
  bounds: PolygonBounds;
  labelFontSize: number;
}

export interface CartogramComponent {
  id: string;
  bounds: PolygonBounds;
  maskRects: Rect[];
  shapes: RegionShape[];
}

export interface CartogramGeometry {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  shapes: RegionShape[];
  components: CartogramComponent[];
}

interface OccupiedCell {
  row: number;
  col: number;
  rect: Rect;
}

const CELL_SIZE = 100;
const VIEW_PADDING = CELL_SIZE * 0.45;
const COMPONENT_PADDING = CELL_SIZE * 1.1;
const POLYGON_GAP = CELL_SIZE * 0.14;
const SITE_JITTER = 0.16;

const DISTRICT_WARP: Record<DistrictId, { xTilt: number; yTilt: number }> = {
  northwestern: { xTilt: -0.05, yTilt: -0.03 },
  central: { xTilt: -0.03, yTilt: 0.01 },
  southern: { xTilt: 0.03, yTilt: 0.05 },
  north_caucasian: { xTilt: 0.04, yTilt: 0.08 },
  volga: { xTilt: 0.02, yTilt: 0.03 },
  ural: { xTilt: 0.04, yTilt: -0.02 },
  siberian: { xTilt: 0.03, yTilt: 0.02 },
  far_eastern: { xTilt: 0.05, yTilt: 0.04 },
};

const REGION_TWEAKS: Record<string, Partial<Point>> = {
  kaliningrad_oblast: { x: -0.16, y: 0.04 },
  murmansk_oblast: { x: -0.18, y: -0.2 },
  karelia_republic: { x: -0.08, y: -0.08 },
  arkhangelsk_oblast: { x: 0.02, y: -0.1 },
  nenets_ao: { x: 0.14, y: -0.18 },
  komi_republic: { x: 0.08, y: -0.04 },
  crimea_republic: { x: -0.08, y: 0.1 },
  sevastopol_city: { x: -0.08, y: 0.24 },
  krasnodar_krai: { x: -0.06, y: 0.08 },
  adygea_republic: { x: -0.02, y: 0.06 },
  dagestan_republic: { x: 0.12, y: 0.12 },
  astrakhan_oblast: { x: 0.08, y: 0.04 },
  kalmykia_republic: { x: 0.04, y: 0.04 },
  yamalo_nenets_ao: { x: 0.06, y: -0.1 },
  khanty_mansi_ao: { x: -0.04, y: -0.04 },
  sakha_republic: { x: 0.16, y: -0.14 },
  krasnoyarsk_krai: { x: 0.04, y: 0.02 },
  irkutsk_oblast: { x: 0.03, y: 0.03 },
  buryatia_republic: { x: 0.04, y: 0.08 },
  altai_republic: { x: 0.04, y: 0.12 },
  tuva_republic: { x: 0.06, y: 0.1 },
  chukotka_ao: { x: 0.26, y: -0.14 },
  kamchatka_krai: { x: 0.18, y: 0.06 },
  magadan_oblast: { x: 0.08, y: 0.01 },
  khabarovsk_krai: { x: 0.08, y: 0.02 },
  amur_oblast: { x: 0.04, y: 0.08 },
  jewish_ao: { x: 0.04, y: 0.12 },
  primorsky_krai: { x: 0.1, y: 0.16 },
  sakhalin_oblast: { x: 0.18, y: 0.08 },
};

function hashToUnit(value: string, seed: number): number {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }
  return (hash / 0xffffffff) * 2 - 1;
}

function getBounds(points: Point[]): PolygonBounds {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getRegionSite(region: Region): Point {
  let x = region.col - 1 + ((region.width ?? 1) - 1) * 0.5;
  let y = region.row - 1 + ((region.height ?? 1) - 1) * 0.5;

  const warp = DISTRICT_WARP[region.districtId];
  x += warp.xTilt * (y - 4.5);
  y += warp.yTilt * (x - 10);

  const tweak = REGION_TWEAKS[region.id];
  if (tweak) {
    x += tweak.x ?? 0;
    y += tweak.y ?? 0;
  }

  x += hashToUnit(region.id, 17) * SITE_JITTER;
  y += hashToUnit(region.id, 71) * SITE_JITTER;

  return {
    x: x * CELL_SIZE,
    y: y * CELL_SIZE,
  };
}

function polygonArea(points: Point[]): number {
  let area = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }

  return area / 2;
}

function polygonCentroid(points: Point[]): Point {
  const area = polygonArea(points);

  if (Math.abs(area) < 1e-6) {
    const fallback = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), {
      x: 0,
      y: 0,
    });

    return {
      x: fallback.x / points.length,
      y: fallback.y / points.length,
    };
  }

  let sumX = 0;
  let sumY = 0;

  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    const cross = current.x * next.y - next.x * current.y;
    sumX += (current.x + next.x) * cross;
    sumY += (current.y + next.y) * cross;
  }

  return {
    x: sumX / (6 * area),
    y: sumY / (6 * area),
  };
}

function clipPolygonToHalfPlane(polygon: Point[], site: Point, otherSite: Point): Point[] {
  const normal = {
    x: otherSite.x - site.x,
    y: otherSite.y - site.y,
  };

  if (Math.abs(normal.x) + Math.abs(normal.y) < 1e-6) {
    return polygon;
  }

  const midpoint = {
    x: (site.x + otherSite.x) / 2,
    y: (site.y + otherSite.y) / 2,
  };

  const signedDistance = (point: Point): number =>
    (point.x - midpoint.x) * normal.x + (point.y - midpoint.y) * normal.y;

  const output: Point[] = [];

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const previous = polygon[(index + polygon.length - 1) % polygon.length];
    const currentDistance = signedDistance(current);
    const previousDistance = signedDistance(previous);
    const currentInside = currentDistance <= 0;
    const previousInside = previousDistance <= 0;

    if (currentInside !== previousInside) {
      const t = previousDistance / (previousDistance - currentDistance);
      output.push({
        x: previous.x + (current.x - previous.x) * t,
        y: previous.y + (current.y - previous.y) * t,
      });
    }

    if (currentInside) {
      output.push(current);
    }
  }

  return output;
}

function shrinkPolygon(polygon: Point[], centroid: Point, gap: number): Point[] {
  return polygon.map((point) => {
    const dx = centroid.x - point.x;
    const dy = centroid.y - point.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= 1e-6) {
      return point;
    }

    const factor = Math.min(0.34, gap / distance);

    return {
      x: point.x + dx * factor,
      y: point.y + dy * factor,
    };
  });
}

function getLabelFontSize(region: Region, bounds: PolygonBounds): number {
  const widthBased = bounds.width / Math.max(2.4, region.shortLabel.length * 0.62);
  const heightBased = bounds.height * 0.36;
  return Math.max(16, Math.min(34, Math.min(widthBased, heightBased)));
}

function getRegionCells(region: Region): OccupiedCell[] {
  const width = region.width ?? 1;
  const height = region.height ?? 1;
  const cells: OccupiedCell[] = [];

  for (let rowOffset = 0; rowOffset < height; rowOffset += 1) {
    for (let colOffset = 0; colOffset < width; colOffset += 1) {
      const row = region.row + rowOffset;
      const col = region.col + colOffset;

      cells.push({
        row,
        col,
        rect: {
          x: (col - 1) * CELL_SIZE,
          y: (row - 1) * CELL_SIZE,
          width: CELL_SIZE,
          height: CELL_SIZE,
        },
      });
    }
  }

  return cells;
}

function getRegionComponentMap(regions: Region[]): {
  components: Map<string, OccupiedCell[]>;
  regionComponentId: Map<string, string>;
} {
  const cells = new Map<string, OccupiedCell>();
  const regionAnchors = new Map<string, string>();

  for (const region of regions) {
    const regionCells = getRegionCells(region);
    const anchor = regionCells[0];
    regionAnchors.set(region.id, `${anchor.row},${anchor.col}`);

    for (const cell of regionCells) {
      cells.set(`${cell.row},${cell.col}`, cell);
    }
  }

  const visited = new Set<string>();
  const cellToComponentId = new Map<string, string>();
  const components = new Map<string, OccupiedCell[]>();
  let componentIndex = 0;

  for (const [cellKey, cell] of cells.entries()) {
    if (visited.has(cellKey)) continue;

    componentIndex += 1;
    const componentId = `component-${componentIndex}`;
    const queue = [cell];
    const componentCells: OccupiedCell[] = [];
    visited.add(cellKey);

    while (queue.length) {
      const current = queue.shift()!;
      const currentKey = `${current.row},${current.col}`;
      componentCells.push(current);
      cellToComponentId.set(currentKey, componentId);

      const neighbors = [
        [current.row - 1, current.col],
        [current.row + 1, current.col],
        [current.row, current.col - 1],
        [current.row, current.col + 1],
      ];

      for (const [neighborRow, neighborCol] of neighbors) {
        const neighborKey = `${neighborRow},${neighborCol}`;
        if (!cells.has(neighborKey) || visited.has(neighborKey)) continue;
        visited.add(neighborKey);
        queue.push(cells.get(neighborKey)!);
      }
    }

    components.set(componentId, componentCells);
  }

  const regionComponentId = new Map<string, string>();
  for (const region of regions) {
    const anchorKey = regionAnchors.get(region.id);
    if (!anchorKey) continue;
    const componentId = cellToComponentId.get(anchorKey);
    if (componentId) {
      regionComponentId.set(region.id, componentId);
    }
  }

  return { components, regionComponentId };
}

function getComponentBounds(cells: OccupiedCell[]): PolygonBounds {
  const points: Point[] = [];

  for (const cell of cells) {
    points.push({ x: cell.rect.x, y: cell.rect.y });
    points.push({ x: cell.rect.x + cell.rect.width, y: cell.rect.y + cell.rect.height });
  }

  return getBounds(points);
}

export function polygonToPath(points: Point[]): string {
  if (!points.length) {
    return '';
  }

  const [first, ...rest] = points;
  const segments = rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${segments.join(' ')} Z`;
}

export function buildCartogramGeometry(regions: Region[]): CartogramGeometry {
  const siteByRegionId = new Map(regions.map((region) => [region.id, getRegionSite(region)]));
  const { components: cellComponents, regionComponentId } = getRegionComponentMap(regions);
  const cartogramComponents: CartogramComponent[] = [];
  const allShapes: RegionShape[] = [];
  const visiblePoints: Point[] = [];

  for (const [componentId, cells] of cellComponents.entries()) {
    const componentRegions = regions.filter(
      (region) => regionComponentId.get(region.id) === componentId
    );

    const componentBounds = getComponentBounds(cells);
    const initialPolygon: Point[] = [
      {
        x: componentBounds.minX - COMPONENT_PADDING,
        y: componentBounds.minY - COMPONENT_PADDING,
      },
      {
        x: componentBounds.maxX + COMPONENT_PADDING,
        y: componentBounds.minY - COMPONENT_PADDING,
      },
      {
        x: componentBounds.maxX + COMPONENT_PADDING,
        y: componentBounds.maxY + COMPONENT_PADDING,
      },
      {
        x: componentBounds.minX - COMPONENT_PADDING,
        y: componentBounds.maxY + COMPONENT_PADDING,
      },
    ];

    const shapes: RegionShape[] = componentRegions.map((region) => {
      const site = siteByRegionId.get(region.id)!;
      let polygon = initialPolygon;

      for (const otherRegion of componentRegions) {
        if (otherRegion.id === region.id) continue;
        polygon = clipPolygonToHalfPlane(polygon, site, siteByRegionId.get(otherRegion.id)!);
      }

      const centroid = polygonCentroid(polygon);
      const shrunkenPolygon = shrinkPolygon(polygon, centroid, POLYGON_GAP);
      const bounds = getBounds(shrunkenPolygon);

      return {
        region,
        componentId,
        site,
        label: site,
        polygon: shrunkenPolygon,
        bounds,
        labelFontSize: getLabelFontSize(region, bounds),
      };
    });

    const maskRects = cells.map((cell) => cell.rect);
    for (const rect of maskRects) {
      visiblePoints.push({ x: rect.x, y: rect.y });
      visiblePoints.push({ x: rect.x + rect.width, y: rect.y + rect.height });
    }

    cartogramComponents.push({
      id: componentId,
      bounds: componentBounds,
      maskRects,
      shapes,
    });

    allShapes.push(...shapes);
  }

  const visibleBounds = getBounds(visiblePoints);

  return {
    minX: visibleBounds.minX - VIEW_PADDING,
    minY: visibleBounds.minY - VIEW_PADDING,
    maxX: visibleBounds.maxX + VIEW_PADDING,
    maxY: visibleBounds.maxY + VIEW_PADDING,
    width: visibleBounds.width + VIEW_PADDING * 2,
    height: visibleBounds.height + VIEW_PADDING * 2,
    shapes: allShapes,
    components: cartogramComponents,
  };
}
