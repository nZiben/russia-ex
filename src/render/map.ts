import type {
  Region,
  RegionLevelState,
  LevelId,
  District,
  DistrictId
} from '../state/types';
import type { Locale } from '../i18n/i18n';
import { LEVELS } from '../config/levels';

export type MapMode = 'districts' | 'regions';

export interface MapView {
  showOverview(): void;
  showDistrict(districtId: DistrictId): void;
  updateAll(state: RegionLevelState): void;
  updateLocale(locale: Locale): void;
  getCurrentMode(): MapMode;
  getCurrentDistrictId(): DistrictId | null;
}

interface MapOptions {
  container: HTMLElement;
  regions: Region[];
  districts: District[];
  state: RegionLevelState;
  locale: Locale;
  onRegionClick: (region: Region, element: HTMLButtonElement) => void;
  onDistrictClick: (district: District, element: HTMLButtonElement) => void;
}

export function createMapView(options: MapOptions): MapView {
  const { container, regions, districts, onRegionClick, onDistrictClick } = options;

  let currentState: RegionLevelState = options.state;
  let currentLocale: Locale = options.locale;
  let currentMode: MapMode = 'districts';
  let currentDistrictId: DistrictId | null = null;

  function getRegionsForDistrict(districtId: DistrictId): Region[] {
    return regions.filter((r) => r.districtId === districtId);
  }

  function getDistrictBackground(districtId: DistrictId): string {
    const districtRegions = getRegionsForDistrict(districtId);
    if (!districtRegions.length) {
      return 'var(--level-never)';
    }

    const counts = new Map<LevelId, number>();
    for (const level of LEVELS) {
      counts.set(level.id, 0);
    }

    for (const region of districtRegions) {
      const levelId = currentState[region.id] ?? 'NEVER';
      counts.set(levelId, (counts.get(levelId) ?? 0) + 1);
    }

    const total = districtRegions.length;
    const segments: { color: string; start: number; end: number }[] = [];
    let acc = 0;

    for (const level of LEVELS) {
      const count = counts.get(level.id) ?? 0;
      if (!count) continue;
      const ratio = count / total;
      const start = acc;
      const end = acc + ratio;
      segments.push({ color: level.color, start, end });
      acc = end;
    }

    if (!segments.length) return 'var(--level-never)';
    if (segments.length === 1) return segments[0].color;

    const stops = segments
      .map((seg) => {
        const startPct = Math.round(seg.start * 100);
        const endPct = Math.round(seg.end * 100);
        return `${seg.color} ${startPct}% ${endPct}%`;
      })
      .join(', ');

    return `linear-gradient(90deg, ${stops})`;
  }

  /** -------- overview: federal districts -------- */

  function renderDistrictOverview(): void {
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'map-grid';

    const maxCol = Math.max(
      ...districts.map(
        (d) => d.col + (typeof d.width === 'number' ? d.width : 1) - 1
      )
    );
    grid.style.gridTemplateColumns = `repeat(${maxCol}, var(--tile-size))`;

    for (const district of districts) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'region-tile region-tile--district';
      const width = district.width ?? 1;
      const height = district.height ?? 1;

      tile.style.gridColumn = `${district.col} / span ${width}`;
      tile.style.gridRow = `${district.row} / span ${height}`;
      tile.dataset.districtId = district.id;

      const bg = getDistrictBackground(district.id);
      if (bg.startsWith('linear-gradient')) {
        tile.style.backgroundImage = bg;
        tile.style.backgroundColor = 'transparent';
      } else {
        tile.style.backgroundImage = '';
        tile.style.backgroundColor = bg;
      }

      tile.textContent = district.shortLabel;

      const title =
        currentLocale === 'ru' ? district.fullNameRu : district.fullNameEn;
      tile.title = title;
      tile.setAttribute('aria-label', title);

      tile.addEventListener('click', () => {
        onDistrictClick(district, tile);
      });

      tile.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onDistrictClick(district, tile);
        }
      });

      grid.appendChild(tile);
    }

    container.appendChild(grid);
  }

  /** -------- zoom: regions inside selected district -------- */

  function renderRegionGridForDistrict(districtId: DistrictId): void {
    container.innerHTML = '';

    const districtRegions = getRegionsForDistrict(districtId);
    if (!districtRegions.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No regions for this district.';
      container.appendChild(empty);
      return;
    }

    const minCol = Math.min(...districtRegions.map((r) => r.col));
    const minRow = Math.min(...districtRegions.map((r) => r.row));
    const maxCol = Math.max(
      ...districtRegions.map(
        (r) => r.col + (typeof r.width === 'number' ? r.width : 1) - 1
      )
    );
    const columns = maxCol - minCol + 1;

    const grid = document.createElement('div');
    grid.className = 'map-grid';
    grid.style.gridTemplateColumns = `repeat(${columns}, var(--tile-size))`;

    for (const region of districtRegions) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'region-tile';
      tile.dataset.regionId = region.id;

      const width = region.width ?? 1;
      const height = region.height ?? 1;

      const col = region.col - minCol + 1;
      const row = region.row - minRow + 1;
      tile.style.gridColumn = `${col} / span ${width}`;
      tile.style.gridRow = `${row} / span ${height}`;

      const levelId = currentState[region.id] ?? 'NEVER';
      tile.dataset.level = levelId;

      tile.textContent = region.shortLabel;

      const title =
        currentLocale === 'ru' ? region.fullNameRu : region.fullNameEn;
      tile.title = title;
      tile.setAttribute('aria-label', title);

      tile.addEventListener('click', () => {
        onRegionClick(region, tile);
      });

      tile.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onRegionClick(region, tile);
        }
      });

      grid.appendChild(tile);
    }

    container.appendChild(grid);
  }

  /** -------- public API -------- */

  function showOverview(): void {
    currentMode = 'districts';
    currentDistrictId = null;
    renderDistrictOverview();
  }

  function showDistrict(districtId: DistrictId): void {
    currentMode = 'regions';
    currentDistrictId = districtId;
    renderRegionGridForDistrict(districtId);
  }

  function updateAll(state: RegionLevelState): void {
    currentState = state;
    if (currentMode === 'districts') {
      renderDistrictOverview();
    } else if (currentDistrictId) {
      renderRegionGridForDistrict(currentDistrictId);
    }
  }

  function updateLocale(locale: Locale): void {
    currentLocale = locale;
    if (currentMode === 'districts') {
      renderDistrictOverview();
    } else if (currentDistrictId) {
      renderRegionGridForDistrict(currentDistrictId);
    }
  }

  showOverview();

  return {
    showOverview,
    showDistrict,
    updateAll,
    updateLocale,
    getCurrentMode: () => currentMode,
    getCurrentDistrictId: () => currentDistrictId
  };
}
