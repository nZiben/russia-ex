export type Locale = 'en' | 'ru';

const STORAGE_KEY = 'russia-ex-locale-v1';

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'RUSSIA-EX',
    'app.subtitle': 'Interactive footprint map of Russian regions',
    'app.description':
      'Mark where you have lived, travelled or just passed through across all federal subjects of Russia. Your data stays in this browser and can be saved as an image.',

    'legend.title': 'Visit levels',
    'score.totalLabel': 'Total score:',
    'controls.resetAll': 'Reset all',
    'controls.saveImage': 'Save as image',
    'controls.languageLabel': 'Language',

    // Map mode
    'map.overviewTitle': 'Federal districts of Russia',
    'map.overviewHint': 'Click a district to zoom in and mark individual regions.',
    'map.districtHint': 'Click tiles to set visit level. Use “Back” to return to all districts.',
    'controls.backToOverview': 'Back to districts',

    // Popup
    'popup.chooseLevel': 'Choose visit level',

    // Levels
    'level.LIVED.name': 'Lived',
    'level.LIVED.description': 'Lived here for a year or more.',
    'level.SHORT_STAY.name': 'Short stay',
    'level.SHORT_STAY.description': 'Lived here for about a month or more.',
    'level.TRAVELED.name': 'Travel',
    'level.TRAVELED.description': 'Visited mainly for tourism or leisure.',
    'level.BUSINESS_TRIP.name': 'Business trip',
    'level.BUSINESS_TRIP.description': 'Visited mainly for work.',
    'level.TRANSIT.name': 'Transit',
    'level.TRANSIT.description':
      'Only passed through (train, road, airport transfer, etc.).',
    'level.NEVER.name': 'Never',
    'level.NEVER.description': 'Have not been here yet.',

    // Export
    'export.imageTitle': 'My Russia footprint',
    'export.imageSubtitle': 'Where I have lived, travelled, and passed through',
    'export.scoreLabel': 'Score',
    'export.footer': 'Generated with russia-ex'
  },

  ru: {
    'app.title': 'RUSSIA-EX',
    'app.subtitle': 'Интерактивная карта «следа» по регионам России',
    'app.description':
      'Отметьте, где вы жили, путешествовали или просто проезжали через субъекты РФ. Все данные хранятся только в этом браузере и могут быть сохранены как картинка.',

    'legend.title': 'Уровни посещения',
    'score.totalLabel': 'Суммарный счёт:',
    'controls.resetAll': 'Сбросить всё',
    'controls.saveImage': 'Сохранить как картинку',
    'controls.languageLabel': 'Язык',

    'map.overviewTitle': 'Федеральные округа России',
    'map.overviewHint': 'Нажмите на округ, чтобы приблизить и увидеть регионы внутри.',
    'map.districtHint':
      'Кликайте по регионам, чтобы выбрать уровень посещения. Кнопка «Назад» вернёт ко всем округам.',
    'controls.backToOverview': 'Назад к округам',

    'popup.chooseLevel': 'Выберите уровень посещения',

    'level.LIVED.name': 'Жил',
    'level.LIVED.description': 'Жил здесь год и больше.',
    'level.SHORT_STAY.name': 'Кратко жил',
    'level.SHORT_STAY.description': 'Жил здесь примерно месяц и больше.',
    'level.TRAVELED.name': 'Путешествие',
    'level.TRAVELED.description': 'Приезжал в основном как турист.',
    'level.BUSINESS_TRIP.name': 'Командировка',
    'level.BUSINESS_TRIP.description': 'Приезжал в основном по работе.',
    'level.TRANSIT.name': 'Транзит',
    'level.TRANSIT.description':
      'Только проезжал мимо (поезд, машина, пересадка в аэропорту и т.п.).',
    'level.NEVER.name': 'Не был',
    'level.NEVER.description': 'Пока ещё не был здесь.',

    'export.imageTitle': 'Мой след по России',
    'export.imageSubtitle': 'Где я жил, путешествовал и проезжал транзитом',
    'export.scoreLabel': 'Счёт',
    'export.footer': 'Создано с помощью russia-ex'
  }
};

export function translate(locale: Locale, key: string): string {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  return dict[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function applyTranslations(root: HTMLElement, locale: Locale): void {
  const elements = root.querySelectorAll<HTMLElement>('[data-i18n-key]');
  elements.forEach((el) => {
    const key = el.dataset.i18nKey;
    if (!key) return;
    el.textContent = translate(locale, key);
  });
}

export function getDefaultLocale(): Locale {
  if (typeof navigator !== 'undefined') {
    const langs = navigator.languages ?? [navigator.language];
    if (langs.some((l) => l.toLowerCase().startsWith('ru'))) {
      return 'ru';
    }
  }
  return 'en';
}

export function loadStoredLocale(): Locale | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'en' || value === 'ru') {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export function storeLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function setDocumentLang(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}
