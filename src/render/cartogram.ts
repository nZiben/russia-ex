import type { DistrictId, Region } from '../state/types';

export interface Point {
  x: number;
  y: number;
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
  site: Point;
  label: Point;
  polygon: Point[];
  bounds: PolygonBounds;
  labelFontSize: number;
}

export interface CartogramGeometry {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  shapes: RegionShape[];
}

const CELL_SIZE = 100;
const MAP_PADDING = CELL_SIZE * 0.9;
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
  kaliningrad_oblast: { x: -0.65, y: 0.12 },
  murmansk_oblast: { x: -0.34, y: -0.34 },
  karelia_republic: { x: -0.12, y: -0.12 },
  arkhangelsk_oblast: { x: 0.06, y: -0.2 },
  nenets_ao: { x: 0.28, y: -0.28 },
  komi_republic: { x: 0.18, y: -0.12 },
  crimea_republic: { x: -0.22, y: 0.2 },
  sevastopol_city: { x: -0.18, y: 0.68 },
  krasnodar_krai: { x: -0.08, y: 0.12 },
  adygea_republic: { x: -0.02, y: 0.08 },
  dagestan_republic: { x: 0.22, y: 0.16 },
  astrakhan_oblast: { x: 0.12, y: 0.08 },
  kalmykia_republic: { x: 0.04, y: 0.06 },
  yamalo_nenets_ao: { x: 0.08, y: -0.16 },
  khanty_mansi_ao: { x: -0.04, y: -0.08 },
  sakha_republic: { x: 0.28, y: -0.24 },
  krasnoyarsk_krai: { x: 0.06, y: 0.04 },
  irkutsk_oblast: { x: 0.04, y: 0.06 },
  buryatia_republic: { x: 0.06, y: 0.12 },
  altai_republic: { x: 0.06, y: 0.22 },
  tuva_republic: { x: 0.08, y: 0.16 },
  chukotka_ao: { x: 0.64, y: -0.32 },
  kamchatka_krai: { x: 0.74, y: 0.16 },
  magadan_oblast: { x: 0.36, y: 0.02 },
  khabarovsk_krai: { x: 0.18, y: 0.04 },
  amur_oblast: { x: 0.08, y: 0.12 },
  jewish_ao: { x: 0.1, y: 0.18 },
  primorsky_krai: { x: 0.22, y: 0.32 },
  sakhalin_oblast: { x: 0.86, y: 0.18 },
};

function hashToUnit(value: string, seed: number): number {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0;
  }
  return (hash / 0xffffffff) * 2 - 1;
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

export function polygonToPath(points: Point[]): string {
  if (!points.length) {
    return '';
  }

  const [first, ...rest] = points;
  const segments = rest.map((point) => `L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${segments.join(' ')} Z`;
}

export function buildCartogramGeometry(regions: Region[]): CartogramGeometry {
  const sites = regions.map((region) => ({
    region,
    site: getRegionSite(region),
  }));

  const siteBounds = getBounds(sites.map(({ site }) => site));
  const minX = siteBounds.minX - MAP_PADDING;
  const minY = siteBounds.minY - MAP_PADDING;
  const maxX = siteBounds.maxX + MAP_PADDING;
  const maxY = siteBounds.maxY + MAP_PADDING;

  const boundsPolygon: Point[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];

  const shapes: RegionShape[] = sites.map(({ region, site }) => {
    let polygon = boundsPolygon;

    for (const candidate of sites) {
      if (candidate.region.id === region.id) continue;
      polygon = clipPolygonToHalfPlane(polygon, site, candidate.site);
    }

    const centroid = polygonCentroid(polygon);
    const shrunkenPolygon = shrinkPolygon(polygon, centroid, POLYGON_GAP);
    const shapeBounds = getBounds(shrunkenPolygon);

    return {
      region,
      site,
      label: site,
      polygon: shrunkenPolygon,
      bounds: shapeBounds,
      labelFontSize: getLabelFontSize(region, shapeBounds),
    };
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    shapes,
  };
}
