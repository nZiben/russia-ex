import type { Region, RegionLevelState } from '../state/types';
import type { Locale } from '../i18n/i18n';

export interface MapView {
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
  const { container, regions, onRegionClick } = options;

  let currentState: RegionLevelState = options.state;
  let currentLocale: Locale = options.locale;

  function getGridColumnCount(): number {
    return Math.max(...regions.map((region) => region.col + (region.width ?? 1) - 1));
  }

  function renderNationGrid(): void {
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'map-grid';
    grid.style.gridTemplateColumns = `repeat(${getGridColumnCount()}, var(--tile-size))`;

    for (const region of regions) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'region-tile';
      tile.dataset.regionId = region.id;
      tile.dataset.level = currentState[region.id] ?? 'NEVER';
      tile.dataset.districtId = region.districtId;
      tile.style.gridColumn = `${region.col} / span ${region.width ?? 1}`;
      tile.style.gridRow = `${region.row} / span ${region.height ?? 1}`;

      const label = document.createElement('span');
      label.className = 'region-tile__label';
      label.textContent = region.shortLabel;
      tile.appendChild(label);

      const title = currentLocale === 'ru' ? region.fullNameRu : region.fullNameEn;
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

  function updateAll(state: RegionLevelState): void {
    currentState = state;
    renderNationGrid();
  }

  function updateLocale(locale: Locale): void {
    currentLocale = locale;
    renderNationGrid();
  }

  renderNationGrid();

  return {
    updateAll,
    updateLocale,
  };
}
