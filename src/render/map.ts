import type { Region, RegionLevelState, LevelId } from '../state/types';
import type { Locale } from '../i18n/i18n';

export interface MapView {
  updateRegionLevel(regionId: string, levelId: LevelId): void;
  updateAll(state: RegionLevelState): void;
  updateLocale(locale: Locale): void;
}

interface MapOptions {
  container: HTMLElement;
  regions: Region[];
  state: RegionLevelState;
  locale: Locale;
  onRegionClick: (region: Region, element: HTMLButtonElement) => void;
}

export function createMapView(options: MapOptions): MapView {
  const { container, regions, state } = options;

  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'map-grid';

  const maxCol = Math.max(...regions.map((r) => r.col));
  grid.style.gridTemplateColumns = `repeat(${maxCol}, var(--tile-size))`;

  const tilesById = new Map<string, HTMLButtonElement>();

  for (const region of regions) {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'region-tile';
    tile.dataset.regionId = region.id;
    tile.style.gridColumn = String(region.col);
    tile.style.gridRow = String(region.row);
    tile.textContent = region.shortLabel;

    const currentLevel = state[region.id];
    tile.dataset.level = currentLevel ?? 'NEVER';

    const title = options.locale === 'ru' ? region.fullNameRu : region.fullNameEn;
    tile.title = title;
    tile.setAttribute('aria-label', title);

    tile.addEventListener('click', () => {
      options.onRegionClick(region, tile);
    });

    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        options.onRegionClick(region, tile);
      }
    });

    tilesById.set(region.id, tile);
    grid.appendChild(tile);
  }

  container.appendChild(grid);

  function updateRegionLevel(regionId: string, levelId: LevelId): void {
    const tile = tilesById.get(regionId);
    if (!tile) return;
    tile.dataset.level = levelId;
  }

  function updateAll(newState: RegionLevelState): void {
    for (const [regionId, tile] of tilesById.entries()) {
      tile.dataset.level = newState[regionId] ?? 'NEVER';
    }
  }

  function updateLocale(locale: Locale): void {
    for (const [regionId, tile] of tilesById.entries()) {
      const region = regions.find((r) => r.id === regionId);
      if (!region) continue;
      const title = locale === 'ru' ? region.fullNameRu : region.fullNameEn;
      tile.title = title;
      tile.setAttribute('aria-label', title);
    }
  }

  return { updateRegionLevel, updateAll, updateLocale };
}
