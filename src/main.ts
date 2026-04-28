import './styles.css';

import { regions } from './config/regions';
import { LEVELS } from './config/levels';
import {
  createDefaultState,
  loadRegionLevels,
  saveRegionLevels,
  clearRegionLevels,
} from './state/storage';
import { computeScore } from './state/scoring';
import { createMapView } from './render/map';
import { createLevelPopup } from './render/popup';
import { exportMapImage } from './export/exportImage';
import {
  applyTranslations,
  getDefaultLocale,
  loadStoredLocale,
  storeLocale,
  setDocumentLang,
  translate,
  type Locale,
} from './i18n/i18n';
import type { RegionLevelState } from './state/types';

function getInitialLocale(): Locale {
  return loadStoredLocale() ?? getDefaultLocale();
}

function initApp(): void {
  const appRoot = document.querySelector<HTMLElement>('#app');
  const mapRoot = document.querySelector<HTMLElement>('#map-root');
  const legendList = document.querySelector<HTMLUListElement>('#legend-levels');
  const resetButton = document.querySelector<HTMLButtonElement>('#reset-all');
  const saveImageButton = document.querySelector<HTMLButtonElement>('#save-image');
  const scoreCurrentEl = document.querySelector<HTMLElement>('#score-current');
  const scoreMaxEl = document.querySelector<HTMLElement>('#score-max');
  const scoreVisitedEl = document.querySelector<HTMLElement>('#score-visited');
  const langButtons = document.querySelectorAll<HTMLButtonElement>('.language-switcher__button');

  if (
    !appRoot ||
    !mapRoot ||
    !legendList ||
    !resetButton ||
    !saveImageButton ||
    !scoreCurrentEl ||
    !scoreMaxEl ||
    !scoreVisitedEl
  ) {
    throw new Error('Missing core DOM elements');
  }

  let locale: Locale = getInitialLocale();
  setDocumentLang(locale);

  let regionLevels: RegionLevelState = loadRegionLevels(regions);
  const popup = createLevelPopup({ levels: LEVELS });

  const mapView = createMapView({
    container: mapRoot,
    regions,
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
        },
      });
    },
  });

  function renderLegend(currentLocale: Locale): void {
    legendList.innerHTML = '';

    LEVELS.forEach((level) => {
      const li = document.createElement('li');
      li.className = 'legend__item';
      li.style.setProperty('--legend-color', level.color);
      if (level.id === 'NEVER') {
        li.classList.add('is-neutral');
      }

      const label = document.createElement('span');
      label.className = 'legend__label';
      label.textContent = translate(currentLocale, level.nameKey);

      const weight = document.createElement('span');
      weight.className = 'legend__weight';
      weight.textContent = String(level.weight);

      li.appendChild(label);
      li.appendChild(weight);
      legendList.appendChild(li);
    });
  }

  function updateScore(): void {
    const summary = computeScore(regionLevels);
    const visitedCount = regions.length - summary.perLevelCounts.NEVER;

    scoreCurrentEl.textContent = String(summary.totalScore);
    scoreMaxEl.textContent = String(summary.maxScore);
    scoreVisitedEl.textContent = translate(locale, 'score.visitedSummary')
      .replace('{visited}', String(visitedCount))
      .replace('{total}', String(regions.length));
  }

  function setLocale(newLocale: Locale): void {
    locale = newLocale;
    storeLocale(locale);
    setDocumentLang(locale);
    applyTranslations(appRoot, locale);
    renderLegend(locale);
    mapView.updateLocale(locale);
    popup.updateLocale(locale);
    updateScore();

    langButtons.forEach((btn) => {
      const btnLocale = btn.dataset.locale as Locale | undefined;
      btn.classList.toggle('is-active', btnLocale === locale);
    });
  }

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const btnLocale = btn.dataset.locale as Locale | undefined;
      if (!btnLocale || btnLocale === locale) return;
      setLocale(btnLocale);
    });
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

  applyTranslations(appRoot, locale);
  renderLegend(locale);
  updateScore();
  mapView.updateAll(regionLevels);
  setLocale(locale);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
