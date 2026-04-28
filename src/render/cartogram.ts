import type { Region } from '../state/types';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
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
  rect: Rect;
  polygon: Point[];
  bounds: PolygonBounds;
  label: Point;
  labelFontSize: number;
}

export interface CartogramGeometry {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  silhouetteRects: Rect[];
  shapes: RegionShape[];
}

const CELL_STEP = 94;
const VIEW_PADDING = 48;
const SILHOUETTE_RADIUS = 13;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function randomFromSeed(seed: number): number {
  const next = Math.sin(seed * 12.9898) * 43758.5453;
  return next - Math.floor(next);
}

function getRegionWidth(region: Region): number {
  return region.width ?? 1;
}

function getRegionHeight(region: Region): number {
  return region.height ?? 1;
}

function getRegionRect(region: Region): Rect {
  return {
    x: (region.col - 1) * CELL_STEP,
    y: (region.row - 1) * CELL_STEP,
    width: getRegionWidth(region) * CELL_STEP,
    height: getRegionHeight(region) * CELL_STEP,
    radius: SILHOUETTE_RADIUS,
  };
}

function buildOccupiedCellSet(regions: Region[]): Set<string> {
  const cells = new Set<string>();

  for (const region of regions) {
    const width = getRegionWidth(region);
    const height = getRegionHeight(region);

    for (let rowOffset = 0; rowOffset < height; rowOffset += 1) {
      for (let colOffset = 0; colOffset < width; colOffset += 1) {
        cells.add(`${region.row + rowOffset}:${region.col + colOffset}`);
      }
    }
  }

  return cells;
}

function countMissingNeighbors(occupiedCells: Set<string>, cells: string[]): number {
  let missing = 0;

  for (const cell of cells) {
    if (!occupiedCells.has(cell)) {
      missing += 1;
    }
  }

  return missing;
}

function getExposure(
  region: Region,
  occupiedCells: Set<string>
): {
  north: number;
  east: number;
  south: number;
  west: number;
} {
  const width = getRegionWidth(region);
  const height = getRegionHeight(region);

  const northNeighbors: string[] = [];
  const eastNeighbors: string[] = [];
  const southNeighbors: string[] = [];
  const westNeighbors: string[] = [];

  for (let colOffset = 0; colOffset < width; colOffset += 1) {
    northNeighbors.push(`${region.row - 1}:${region.col + colOffset}`);
    southNeighbors.push(`${region.row + height}:${region.col + colOffset}`);
  }

  for (let rowOffset = 0; rowOffset < height; rowOffset += 1) {
    westNeighbors.push(`${region.row + rowOffset}:${region.col - 1}`);
    eastNeighbors.push(`${region.row + rowOffset}:${region.col + width}`);
  }

  return {
    north: countMissingNeighbors(occupiedCells, northNeighbors) / northNeighbors.length,
    east: countMissingNeighbors(occupiedCells, eastNeighbors) / eastNeighbors.length,
    south: countMissingNeighbors(occupiedCells, southNeighbors) / southNeighbors.length,
    west: countMissingNeighbors(occupiedCells, westNeighbors) / westNeighbors.length,
  };
}

function buildCornerPoints(
  rect: Rect,
  exposure: { north: number; east: number; south: number; west: number },
  seed: number
): { topLeft: Point; topRight: Point; bottomRight: Point; bottomLeft: Point } {
  const minSide = Math.min(rect.width, rect.height);
  const inset = clamp(minSide * 0.18, 10, 24);

  const northDepth = lerp(inset * 0.82, inset * 0.28, exposure.north);
  const eastDepth = lerp(inset * 0.82, inset * 0.28, exposure.east);
  const southDepth = lerp(inset * 0.82, inset * 0.28, exposure.south);
  const westDepth = lerp(inset * 0.82, inset * 0.28, exposure.west);

  const topLeft = {
    x: rect.x + westDepth * lerp(0.9, 0.52, randomFromSeed(seed + 1)),
    y: rect.y + northDepth * lerp(0.9, 0.52, randomFromSeed(seed + 2)),
  };
  const topRight = {
    x: rect.x + rect.width - eastDepth * lerp(0.9, 0.52, randomFromSeed(seed + 3)),
    y: rect.y + northDepth * lerp(0.88, 0.48, randomFromSeed(seed + 4)),
  };
  const bottomRight = {
    x: rect.x + rect.width - eastDepth * lerp(0.86, 0.46, randomFromSeed(seed + 5)),
    y: rect.y + rect.height - southDepth * lerp(0.88, 0.48, randomFromSeed(seed + 6)),
  };
  const bottomLeft = {
    x: rect.x + westDepth * lerp(0.88, 0.48, randomFromSeed(seed + 7)),
    y: rect.y + rect.height - southDepth * lerp(0.86, 0.46, randomFromSeed(seed + 8)),
  };

  return { topLeft, topRight, bottomRight, bottomLeft };
}

function buildHorizontalSidePoints(options: {
  start: Point;
  end: Point;
  fixedY: number;
  depthDirection: 1 | -1;
  exposure: number;
  seed: number;
}): Point[] {
  const { start, end, fixedY, depthDirection, exposure, seed } = options;
  const width = Math.abs(end.x - start.x);
  const count = width > CELL_STEP * 1.3 ? 3 : 2;
  const depthBase = lerp(14, 5, exposure);
  const wobble = lerp(4, 9, exposure);
  const points: Point[] = [];

  for (let index = 0; index < count; index += 1) {
    const t = (index + 1) / (count + 1);
    const xJitter = (randomFromSeed(seed + index) - 0.5) * width * 0.08;
    const wave =
      (randomFromSeed(seed + index + 12) - 0.5) * wobble +
      Math.sin((t + seed) * Math.PI) * wobble * 0.16;

    points.push({
      x: lerp(start.x, end.x, t) + xJitter,
      y: fixedY + depthDirection * clamp(depthBase + wave, 2, 20),
    });
  }

  return points;
}

function buildVerticalSidePoints(options: {
  start: Point;
  end: Point;
  fixedX: number;
  depthDirection: 1 | -1;
  exposure: number;
  seed: number;
}): Point[] {
  const { start, end, fixedX, depthDirection, exposure, seed } = options;
  const height = Math.abs(end.y - start.y);
  const count = height > CELL_STEP * 1.3 ? 3 : 2;
  const depthBase = lerp(14, 5, exposure);
  const wobble = lerp(4, 9, exposure);
  const points: Point[] = [];

  for (let index = 0; index < count; index += 1) {
    const t = (index + 1) / (count + 1);
    const yJitter = (randomFromSeed(seed + index) - 0.5) * height * 0.08;
    const wave =
      (randomFromSeed(seed + index + 12) - 0.5) * wobble +
      Math.sin((t + seed) * Math.PI) * wobble * 0.16;

    points.push({
      x: fixedX + depthDirection * clamp(depthBase + wave, 2, 20),
      y: lerp(start.y, end.y, t) + yJitter,
    });
  }

  return points;
}

function createPolygonBounds(points: Point[]): PolygonBounds {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getLabelFontSize(region: Region, rect: Rect): number {
  const widthBudget = rect.width * 0.74;
  const heightBudget = rect.height * 0.34;
  const widthSize = widthBudget / Math.max(region.shortLabel.length * 0.62, 1);
  const heightSize = heightBudget;

  return clamp(Math.min(widthSize, heightSize), 12, 27);
}

function buildRegionPolygon(region: Region, occupiedCells: Set<string>): RegionShape {
  const rect = getRegionRect(region);
  const exposure = getExposure(region, occupiedCells);
  const seed = hashString(region.id);
  const corners = buildCornerPoints(rect, exposure, seed);

  const northSide = buildHorizontalSidePoints({
    start: corners.topLeft,
    end: corners.topRight,
    fixedY: rect.y,
    depthDirection: 1,
    exposure: exposure.north,
    seed: seed + 20,
  });
  const eastSide = buildVerticalSidePoints({
    start: corners.topRight,
    end: corners.bottomRight,
    fixedX: rect.x + rect.width,
    depthDirection: -1,
    exposure: exposure.east,
    seed: seed + 40,
  });
  const southSide = buildHorizontalSidePoints({
    start: corners.bottomRight,
    end: corners.bottomLeft,
    fixedY: rect.y + rect.height,
    depthDirection: -1,
    exposure: exposure.south,
    seed: seed + 60,
  });
  const westSide = buildVerticalSidePoints({
    start: corners.bottomLeft,
    end: corners.topLeft,
    fixedX: rect.x,
    depthDirection: 1,
    exposure: exposure.west,
    seed: seed + 80,
  });

  const polygon = [
    corners.topLeft,
    ...northSide,
    corners.topRight,
    ...eastSide,
    corners.bottomRight,
    ...southSide,
    corners.bottomLeft,
    ...westSide,
  ];

  const label = {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };

  return {
    region,
    rect,
    polygon,
    bounds: createPolygonBounds(polygon),
    label,
    labelFontSize: getLabelFontSize(region, rect),
  };
}

export function buildCartogramGeometry(regions: Region[]): CartogramGeometry {
  const occupiedCells = buildOccupiedCellSet(regions);
  const silhouetteRects = regions.map((region) => getRegionRect(region));
  const shapes = regions.map((region) => buildRegionPolygon(region, occupiedCells));

  const minX = Math.min(...silhouetteRects.map((rect) => rect.x)) - VIEW_PADDING;
  const minY = Math.min(...silhouetteRects.map((rect) => rect.y)) - VIEW_PADDING;
  const maxX = Math.max(...silhouetteRects.map((rect) => rect.x + rect.width)) + VIEW_PADDING;
  const maxY = Math.max(...silhouetteRects.map((rect) => rect.y + rect.height)) + VIEW_PADDING;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    silhouetteRects,
    shapes,
  };
}

export function polygonToPath(points: Point[]): string {
  if (points.length === 0) {
    return '';
  }

  const [firstPoint, ...restPoints] = points;
  const commands = [`M ${firstPoint.x.toFixed(2)} ${firstPoint.y.toFixed(2)}`];

  for (const point of restPoints) {
    commands.push(`L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  }

  commands.push('Z');
  return commands.join(' ');
}
