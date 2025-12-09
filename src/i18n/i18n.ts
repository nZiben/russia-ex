export type Locale = 'en' | 'ru';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ru'];

const LOCALE_STORAGE_KEY = 'russia-ex-locale-v1';

type Messages = Record<string, string>;

const en: Messages = {
'app.title': 'russia-ex',
'app.subtitle': 'Interactive footprint map of Russian regions',
'app.description':
'Mark where you have lived, travelled or just passed through across all federal subjects of Russia. Your data stays in this browser and can be saved as an image.',
'legend.title': 'Visit levels',
'controls.languageLabel': 'Language',
'controls.resetAll': 'Reset all',
'controls.saveImage': 'Save as image',
'score.totalLabel': 'Total score:',
'popup.chooseLevel': 'Choose visit level',
'popup.close': 'Close',
'level.LIVED.name': 'Lived',
'level.LIVED.description': 'Lived here for a year or more.',
'level.SHORT_STAY.name': 'Short stay',
'level.SHORT_STAY.description': 'Lived here for about a month or longer.',
'level.TRAVELED.name': 'Travel',
'level.TRAVELED.description': 'Visited for tourism or leisure.',
'level.BUSINESS_TRIP.name': 'Business trip',
'level.BUSINESS_TRIP.description': 'Visited mainly for work.',
'level.TRANSIT.name': 'Transit',
'level.TRANSIT.description': 'Only passed through (train, road, airport, etc.).',
'level.NEVER.name': 'Never',
'level.NEVER.description': 'Have not been here yet.',
'export.imageTitle': 'My Russia footprint',
'export.imageSubtitle': 'Regions I have lived in, visited or passed through',
'export.scoreLabel': 'Total score',
'export.footer': 'Generated with russia-ex'
};

const ru: Messages = {
'app.title': 'russia-ex',
'app.subtitle': 'Интерактивная карта следов по регионам России',
'app.description':
'Отметьте, где вы жили, путешествовали или просто проезжали через регионы России. Данные хранятся только в этом браузере, карту можно сохранить как изображение.',
'legend.title': 'Уровни посещения',
'controls.languageLabel': 'Язык',
'controls.resetAll': 'Сбросить всё',
'controls.saveImage': 'Сохранить как изображение',
'score.totalLabel': 'Суммарный счёт:',
'popup.chooseLevel': 'Выберите уровень посещения',
'popup.close': 'Закрыть',
'level.LIVED.name': 'Жил(а)',
'level.LIVED.description': 'Жили здесь год и дольше.',
'level.SHORT_STAY.name': 'Краткое проживание',
'level.SHORT_STAY.description': 'Проживали здесь около месяца и дольше.',
'level.TRAVELED.name': 'Путешествие',
'level.TRAVELED.description': 'Приезжали сюда как турист(ка).',
'level.BUSINESS_TRIP.name': 'Командировка',
'level.BUSINESS_TRIP.description': 'Приезжали сюда в основном по работе.',
'level.TRANSIT.name': 'Транзит',
'level.TRANSIT.description':
'Только проездом (поезд, автомобиль, пересадка в аэропорту и т.п.).',
'level.NEVER.name': 'Не был(а)',
'level.NEVER.description': 'Ещё не были здесь.',
'export.imageTitle': 'Мой след по России',
'export.imageSubtitle': 'Регионы, где я жил(а), бывал(а) или проезжал(а)',
'export.scoreLabel': 'Суммарный счёт',
'export.footer': 'Создано в russia-ex'
};

const TRANSLATIONS: Record<Locale, Messages> = { en, ru };

export function translate(locale: Locale, key: string): string {
const messages = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
return messages[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function applyTranslations(root: ParentNode, locale: Locale): void {
const elements = root.querySelectorAll<HTMLElement>('[data-i18n-key]');
elements.forEach((el) => {
const key = el.dataset.i18nKey;
if (!key) return;
el.textContent = translate(locale, key);
});
}

export function getDefaultLocale(): Locale {
if (typeof navigator !== 'undefined') {
const lang = navigator.language.toLowerCase();
if (lang.startsWith('ru')) return 'ru';
}
return 'en';
}

export function loadStoredLocale(): Locale | null {
if (typeof window === 'undefined' || !('localStorage' in window)) return null;
try {
const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
if (!value) return null;
if ((SUPPORTED_LOCALES as readonly string[]).includes(value)) {
return value as Locale;
}
return null;
} catch {
return null;
}
}

export function storeLocale(locale: Locale): void {
if (typeof window === 'undefined' || !('localStorage' in window)) return;
try {
window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
} catch {
}
}

export function setDocumentLang(locale: Locale): void {
if (typeof document === 'undefined') return;
document.documentElement.lang = locale;
}
