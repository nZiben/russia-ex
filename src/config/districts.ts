import type { District } from '../state/types';

/**
 * Block-cartogram layout for federal districts.
 *
 * We use a CSS grid with ~Russia-like silhouette:
 *
 *  - Northwestern on the far west/north
 *  - Central and Volga under it
 *  - South + North Caucasus at the south-west
 *  - Ural as a vertical block east of Volga
 *  - Siberian as a big block east of Ural
 *  - Far Eastern as the huge block on the far east
 *
 * Coordinates are in grid cells (row/col start, width/height span).
 */
export const districts: District[] = [
  {
    id: 'northwestern',
    shortLabel: 'NW',
    fullNameEn: 'Northwestern Federal District',
    fullNameRu: 'Северо-Западный федеральный округ',
    row: 1,
    col: 2,
    width: 3,
    height: 2
  },
  {
    id: 'central',
    shortLabel: 'Central',
    fullNameEn: 'Central Federal District',
    fullNameRu: 'Центральный федеральный округ',
    row: 3,
    col: 3,
    width: 3,
    height: 2
  },
  {
    id: 'southern',
    shortLabel: 'South',
    fullNameEn: 'Southern Federal District',
    fullNameRu: 'Южный федеральный округ',
    row: 5,
    col: 3,
    width: 3,
    height: 2
  },
  {
    id: 'north_caucasian',
    shortLabel: 'N. Caucasus',
    fullNameEn: 'North Caucasian Federal District',
    fullNameRu: 'Северо-Кавказский федеральный округ',
    row: 5,
    col: 6,
    width: 2,
    height: 2
  },
  {
    id: 'volga',
    shortLabel: 'Volga',
    fullNameEn: 'Volga Federal District',
    fullNameRu: 'Приволжский федеральный округ',
    row: 3,
    col: 6,
    width: 3,
    height: 2
  },
  {
    id: 'ural',
    shortLabel: 'Ural',
    fullNameEn: 'Ural Federal District',
    fullNameRu: 'Уральский федеральный округ',
    row: 2,
    col: 9,
    width: 2,
    height: 3
  },
  {
    id: 'siberian',
    shortLabel: 'Siberia',
    fullNameEn: 'Siberian Federal District',
    fullNameRu: 'Сибирский федеральный округ',
    row: 2,
    col: 11,
    width: 3,
    height: 3
  },
  {
    id: 'far_eastern',
    shortLabel: 'Far East',
    fullNameEn: 'Far Eastern Federal District',
    fullNameRu: 'Дальневосточный федеральный округ',
    row: 1,
    col: 14,
    width: 3,
    height: 4
  }
];

export const districtById = new Map(districts.map((d) => [d.id, d]));
