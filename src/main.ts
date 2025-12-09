import './styles.css';

import { regions } from './config/regions';
import { districts, districtById } from './config/districts';
import { LEVELS } from './config/levels';
import {
  createDefaultState,
  loadRegionLevels,
  saveRegionLevels,
  clearRegionLevels
} from './state/storage';
import { computeScore } from './state/scoring';
import { createMapView, type MapMode } from './render/map';
import { createLevelPopup } from './render/popup';
import { exportMapImage } from './export/exportImage';
import {
  applyTranslations,
  getDefaultLocale,
  loadStoredLocale,
  storeLocale,
  setDocumentLang,
  translate,
  type Locale
} from './i18n/i18n';
import type { RegionLevelState } from './state/types';
import type { DistrictId } from './state/types';

function getInitialLocale(): Locale {
  return loadStoredLocale() ?? getDefaultLocale();
}

function initApp(): void {
  const appRoot = document.querySelector<HTMLElement>('#app');
  const mapRoot = document.querySelector<HTMLElement>('#map-root');
  const legendList = document.querySelector<HTMLUListElement>('#legend-levels');
  const legendNotes = document.querySelector<HTMLElement>('#legend-notes');
  const resetButton = document.querySelector<HTMLButtonElement>('#reset-all');
  const saveImageButton = document.querySelector<HTMLButtonElement>('#save-image');
  const scoreCurrentEl = document.querySelector<HTMLElement>('#score-current');
  const scoreMaxEl = document.querySelector<HTMLElement>('#score-max');
  const langButtons = document.querySelectorAll<HTMLButtonElement>(
    '.language-switcher__button'
  );
  const mapModeTitle = document.querySelector<HTMLElement>('#map-mode-title');
  const mapModeHint = document.querySelector<HTMLElement>('#map-mode-hint');
  const mapBackButton = document.querySelector<HTMLButtonElement>('#map-back');

  if (
    !appRoot ||
    !mapRoot ||
    !legendList ||
    !legendNotes ||
    !resetButton ||
    !saveImageButton ||
    !scoreCurrentEl ||
    !scoreMaxEl ||
    !mapModeTitle ||
    !mapModeHint ||
    !mapBackButton
  ) {
    throw new Error('Missing core DOM elements');
  }

  let locale: Locale = getInitialLocale();
  setDocumentLang(locale);

  let regionLevels: RegionLevelState = loadRegionLevels(regions);

  const popup = createLevelPopup({ levels: LEVELS });

  let currentMode: MapMode = 'districts';
  let currentDistrictId: DistrictId | null = null;

  const mapView = createMapView({
    container: mapRoot,
    regions,
    districts,
    state: regionLevels,
    locale,
    onRegionClick: (region, element) => {
      popup.open({
        region,
        anchorElement: element,
        currentLevelId: regionLevels[region.id],
        locale,
        onSelect: (levelId) => {
          regionLevels = { ...regionLevels, [region.id]: levelId };
          saveRegionLevels(regionLevels);
          mapView.updateAll(regionLevels);
          updateScore();
        }
      });
    },
    onDistrictClick: (district) => {
      currentMode = 'regions';
      currentDistrictId = district.id;
      mapView.showDistrict(district.id);
      updateMapHeader();
    }
  });

  function renderLegend(currentLocale: Locale): void {
    legendList.innerHTML = '';
    legendNotes.innerHTML = '';

    LEVELS.forEach((level) => {
      const li = document.createElement('li');
      li.className = 'legend__item';

      const swatch = document.createElement('span');
      swatch.className = 'legend__swatch';
      swatch.style.backgroundColor = level.color;

      const label = document.createElement('span');
      label.className = 'legend__label';
      label.textContent = translate(currentLocale, level.nameKey);

      li.appendChild(swatch);
      li.appendChild(label);
      legendList.appendChild(li);

      const note = document.createElement('p');
      note.className = 'legend__note';
      const name = translate(currentLocale, level.nameKey);
      const desc = translate(currentLocale, level.descriptionKey);
      note.textContent = `${name} – ${desc}`;
      legendNotes.appendChild(note);
    });
  }

  function updateScore(): void {
    const summary = computeScore(regionLevels);
    scoreCurrentEl.textContent = String(summary.totalScore);
    scoreMaxEl.textContent = String(summary.maxScore);
  }

  function updateMapHeader(): void {
    if (currentMode === 'districts') {
      mapBackButton.hidden = true;
      mapModeTitle.textContent = translate(locale, 'map.overviewTitle');
      mapModeHint.textContent = translate(locale, 'map.overviewHint');
    } else if (currentDistrictId) {
      const district = districtById.get(currentDistrictId);
      const name =
        locale === 'ru'
          ? district?.fullNameRu ?? ''
          : district?.fullNameEn ?? '';
      mapBackButton.hidden = false;
      mapModeTitle.textContent = name;
      mapModeHint.textContent = translate(locale, 'map.districtHint');
    }
  }

  function setLocale(newLocale: Locale): void {
    locale = newLocale;
    storeLocale(locale);
    setDocumentLang(locale);
    applyTranslations(appRoot, locale);
    renderLegend(locale);
    mapView.updateLocale(locale);
    updateMapHeader();

    langButtons.forEach((btn) => {
      const btnLocale = btn.dataset.locale as Locale | undefined;
      if (btnLocale === locale) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const btnLocale = btn.dataset.locale as Locale | undefined;
      if (!btnLocale || btnLocale === locale) return;
      setLocale(btnLocale);
    });
  });

  mapBackButton.addEventListener('click', () => {
    currentMode = 'districts';
    currentDistrictId = null;
    mapView.showOverview();
    updateMapHeader();
  });

  resetButton.addEventListener('click', () => {
    regionLevels = createDefaultState(regions);
    clearRegionLevels();
    mapView.updateAll(regionLevels);
    updateScore();
  });

  saveImageButton.addEventListener('click', () => {
    exportMapImage(regionLevels, locale);
  });

  // Initial render
  applyTranslations(appRoot, locale);
  renderLegend(locale);
  updateScore();
  updateMapHeader();
  mapView.updateAll(regionLevels);
  setLocale(locale); // re-apply to sync language toggles
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
