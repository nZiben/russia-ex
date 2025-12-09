import type { LevelDefinition, LevelId, Region } from '../state/types';
import type { Locale } from '../i18n/i18n';
import { translate } from '../i18n/i18n';

interface PopupConfig {
  levels: LevelDefinition[];
}

interface OpenConfig {
  region: Region;
  anchorElement: HTMLElement;
  currentLevelId: LevelId;
  locale: Locale;
  onSelect: (levelId: LevelId) => void;
}

export interface LevelPopup {
  open(config: OpenConfig): void;
  close(): void;
  updateLocale(locale: Locale): void;
}

export function createLevelPopup(config: PopupConfig): LevelPopup {
  const { levels } = config;

  const container = document.createElement('div');
  container.className = 'level-popup';
  container.hidden = true;
  container.setAttribute('role', 'dialog');
  container.setAttribute('aria-modal', 'false');

  const header = document.createElement('div');
  header.className = 'level-popup__header';

  const titleEl = document.createElement('div');
  titleEl.className = 'level-popup__title';

  const chooseEl = document.createElement('div');
  chooseEl.className = 'level-popup__subtitle';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'level-popup__close';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.textContent = '×';

  header.appendChild(titleEl);
  header.appendChild(chooseEl);
  header.appendChild(closeButton);

  const levelsContainer = document.createElement('div');
  levelsContainer.className = 'level-popup__levels';

  const levelButtons = new Map<LevelId, HTMLButtonElement>();

  for (const level of levels) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-popup__level';
    btn.dataset.levelId = level.id;
    levelButtons.set(level.id, btn);
    levelsContainer.appendChild(btn);
  }

  container.appendChild(header);
  container.appendChild(levelsContainer);
  document.body.appendChild(container);

  let isOpen = false;
  let currentLocale: Locale = 'en';
  let currentOnSelect: ((level: LevelId) => void) | null = null;

  function applyLocaleToButtons(locale: Locale): void {
    for (const [id, btn] of levelButtons.entries()) {
      const label = translate(locale, `level.${id}.name`);
      btn.textContent = label;
      btn.setAttribute('aria-label', label);
    }
    chooseEl.textContent = translate(locale, 'popup.chooseLevel');
  }

  function setSelectedLevel(levelId: LevelId): void {
    for (const [id, btn] of levelButtons.entries()) {
      if (id === levelId) {
        btn.classList.add('is-selected');
      } else {
        btn.classList.remove('is-selected');
      }
    }
  }

  function positionPopup(anchor: HTMLElement): void {
    const rect = anchor.getBoundingClientRect();
    const width = 220;
    const approxHeight = 200;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let left = rect.left + scrollX + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, scrollX + window.innerWidth - width - 8));

    let top = rect.bottom + scrollY + 8;
    if (top + approxHeight > scrollY + window.innerHeight) {
      top = rect.top + scrollY - approxHeight - 8;
    }

    container.style.width = `${width}px`;
    container.style.left = `${left}px`;
    container.style.top = `${top}px`;
  }

  function open(configOpen: OpenConfig): void {
    const { region, anchorElement, currentLevelId, locale, onSelect } = configOpen;
    currentLocale = locale;
    currentOnSelect = onSelect;

    const label = locale === 'ru' ? region.fullNameRu : region.fullNameEn;
    titleEl.textContent = label;
    chooseEl.textContent = translate(locale, 'popup.chooseLevel');
    applyLocaleToButtons(locale);
    setSelectedLevel(currentLevelId);

    positionPopup(anchorElement);
    container.hidden = false;
    isOpen = true;

    const initialButton =
      levelButtons.get(currentLevelId) ?? levelButtons.values().next().value ?? null;
    if (initialButton) {
      initialButton.focus();
    }
  }

  function close(): void {
    container.hidden = true;
    isOpen = false;
    currentOnSelect = null;
  }

  for (const [levelId, btn] of levelButtons.entries()) {
    btn.addEventListener('click', () => {
      if (!currentOnSelect) return;
      currentOnSelect(levelId);
      close();
    });
  }

  closeButton.addEventListener('click', () => {
    close();
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  });

  document.addEventListener(
    'click',
    (event) => {
      if (!isOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (container.contains(target)) return;
      close();
    },
    true
  );

  function updateLocale(locale: Locale): void {
    currentLocale = locale;
    if (!isOpen) return;
    applyLocaleToButtons(locale);
  }

  return { open, close, updateLocale };
}
