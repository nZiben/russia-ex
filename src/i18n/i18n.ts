export type Locale = 'en' | 'ru';

const STORAGE_KEY = 'russia-ex-locale-v1';

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'RUSSIA-EX',
    'app.subtitle': 'Travel footprint across the federal subjects of Russia',

    'legend.title': 'Visit levels',
    'score.totalLabel': 'Score',
    'score.visitedSummary': 'Visited {visited} of {total} regions',
    'controls.resetAll': 'Reset',
    'controls.saveImage': 'Save image',
    'controls.languageLabel': 'Lang',

    'popup.chooseLevel': 'Set visit level',

    'level.LIVED.name': 'Lived',
    'level.LIVED.description': 'Lived here for a year or more.',
    'level.SHORT_STAY.name': 'Short stay',
    'level.SHORT_STAY.description': 'Lived here for about a month or more.',
    'level.TRAVELED.name': 'Travel',
    'level.TRAVELED.description': 'Visited mainly for tourism or leisure.',
    'level.BUSINESS_TRIP.name': 'Business trip',
    'level.BUSINESS_TRIP.description': 'Visited mainly for work.',
    'level.TRANSIT.name': 'Transit',
    'level.TRANSIT.description': 'Only passed through (train, road, airport transfer, etc.).',
    'level.NEVER.name': 'Never',
    'level.NEVER.description': 'Have not been here yet.',

    'export.imageTitle': 'RUSSIA-EX',
    'export.imageSubtitle': 'Travel footprint across the federal subjects of Russia',
    'export.scoreLabel': 'Score',
    'export.visitedLabel': 'Visited {visited} of {total}',
    'export.footer': 'russia-ex',
  },

  ru: {
    'app.title': 'RUSSIA-EX',
    'app.subtitle': 'Карта путешествий по регионам России',

    'legend.title': 'Уровни посещения',
    'score.totalLabel': 'Счёт',
    'score.visitedSummary': 'Отмечено {visited} из {total} регионов',
    'controls.resetAll': 'Сбросить',
    'controls.saveImage': 'Сохранить',
    'controls.languageLabel': 'Язык',

    'popup.chooseLevel': 'Выберите уровень',

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

    'export.imageTitle': 'RUSSIA-EX',
    'export.imageSubtitle': 'Карта путешествий по регионам России',
    'export.scoreLabel': 'Счёт',
    'export.visitedLabel': 'Отмечено {visited} из {total}',
    'export.footer': 'russia-ex',
  },
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
