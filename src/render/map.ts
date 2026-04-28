import type { Region, RegionLevelState } from '../state/types';
import type { Locale } from '../i18n/i18n';
import { buildCartogramGeometry, polygonToPath } from './cartogram';

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface MapView {
  updateAll(state: RegionLevelState): void;
  updateLocale(locale: Locale): void;
}

interface MapOptions {
  container: HTMLElement;
  regions: Region[];
  state: RegionLevelState;
  locale: Locale;
  onRegionClick: (region: Region, element: Element) => void;
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tagName: K
): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tagName);
}

export function createMapView(options: MapOptions): MapView {
  const { container, regions, onRegionClick } = options;

  const geometry = buildCartogramGeometry(regions);

  let currentState: RegionLevelState = options.state;
  let currentLocale: Locale = options.locale;

  function renderNationMap(): void {
    container.innerHTML = '';

    const svg = createSvgElement('svg');
    svg.classList.add('map-svg');
    svg.setAttribute(
      'viewBox',
      `${geometry.minX.toFixed(2)} ${geometry.minY.toFixed(2)} ${geometry.width.toFixed(
        2
      )} ${geometry.height.toFixed(2)}`
    );
    svg.setAttribute('aria-label', 'Cartogram of Russian regions');
    const silhouetteLayer = createSvgElement('g');
    silhouetteLayer.classList.add('map-silhouette');

    for (const rect of geometry.silhouetteRects) {
      const rectEl = createSvgElement('rect');
      rectEl.classList.add('map-silhouette-cell');
      rectEl.setAttribute('x', rect.x.toFixed(2));
      rectEl.setAttribute('y', rect.y.toFixed(2));
      rectEl.setAttribute('width', rect.width.toFixed(2));
      rectEl.setAttribute('height', rect.height.toFixed(2));
      rectEl.setAttribute('rx', String(rect.radius ?? 0));
      rectEl.setAttribute('ry', String(rect.radius ?? 0));
      silhouetteLayer.appendChild(rectEl);
    }

    svg.appendChild(silhouetteLayer);

    for (const shape of geometry.shapes) {
      const group = createSvgElement('g');
      group.classList.add('region-group');

      const path = createSvgElement('path');
      path.classList.add('region-shape');
      path.dataset.regionId = shape.region.id;
      path.dataset.level = currentState[shape.region.id] ?? 'NEVER';
      path.dataset.districtId = shape.region.districtId;
      path.setAttribute('d', polygonToPath(shape.polygon));
      path.setAttribute('tabindex', '0');
      path.setAttribute('role', 'button');

      const title = currentLocale === 'ru' ? shape.region.fullNameRu : shape.region.fullNameEn;
      path.setAttribute('aria-label', title);

      path.addEventListener('click', () => {
        onRegionClick(shape.region, path);
      });

      path.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onRegionClick(shape.region, path);
        }
      });

      const label = createSvgElement('text');
      label.classList.add('region-label');
      label.setAttribute('x', shape.label.x.toFixed(2));
      label.setAttribute('y', shape.label.y.toFixed(2));
      label.setAttribute('font-size', shape.labelFontSize.toFixed(2));
      label.textContent = shape.region.shortLabel;

      group.appendChild(path);
      group.appendChild(label);
      svg.appendChild(group);
    }

    container.appendChild(svg);
  }

  function updateAll(state: RegionLevelState): void {
    currentState = state;
    renderNationMap();
  }

  function updateLocale(locale: Locale): void {
    currentLocale = locale;
    renderNationMap();
  }

  renderNationMap();

  return {
    updateAll,
    updateLocale,
  };
}
