export interface Seed {
  id: string;
  nameFi: string;
  variety: string;
  // Siemenillä yksi SeedCategory-arvoista; sipuleilla kukkasipulin tyyppi (esim. "Tulppaani"),
  // jotka ovat käyttäjän itse lisäämiä eikä siten kiinteä union-tyyppi
  category: string;
  subcategory: string;
  categoryType: CategoryType;
  plantingDepthCm?: number;
  plantingTime: PlantingTime;
  growingInstructions: string;
  imageUrl: string;
  createdAt: string;
}

export type CategoryType = 'siemen' | 'sipuli';

// Sipulien kategoriat (esim. "Tulppaani") tallennetaan alakategorioina tämän kiinteän "ankkurin"
// alle - oma erillinen arvo, jotta ne eivät sekoitu tavallisten SeedCategory-arvojen alakategorioihin.
// HUOM: sama vakio on myös server/scripts/create-user.js:ssä (erillinen backend-koodikanta) - pidä samana.
export const BULB_TYPE_ANCHOR = '__sipulit__';

// Siementen pääkategoriat (Vihannekset, Yrtit, ...) ovat myös käyttäjän muokattavissa/poistettavissa -
// tallennetaan samalla mekanismilla alakategorioina tämän ankkurin alle.
// HUOM: sama vakio on myös server/scripts/create-user.js:ssä - pidä samana.
export const CATEGORY_ANCHOR = '__kategoriat__';

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  siemen: 'Siemen',
  sipuli: 'Sipuli',
};

export type SeedCategory =
  | 'vihannekset'
  | 'yrtit'
  | 'kukat'
  | 'hedelmät'
  | 'marjat';

export interface PlantingTime {
  startMonth: number;
  endMonth: number;
  indoor: boolean;
}

export const CATEGORY_LABELS: Record<SeedCategory, string> = {
  vihannekset: 'Vihannekset',
  yrtit: 'Yrtit',
  kukat: 'Kukat',
  hedelmät: 'Hedelmät',
  marjat: 'Marjat',
};

// Sipulien kategoria on käyttäjän itse lisäämä vapaa teksti (esim. "Tulppaani"),
// joten sille ei ole valmista suomennosta CATEGORY_LABELS-taulukossa
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as SeedCategory] ?? category;
}

// Alakategoria
export interface Subcategory {
  id: string;
  category: string;
  name: string;
  createdAt: string;
}

export const MONTH_NAMES = [
  'Tammikuu',
  'Helmikuu',
  'Maaliskuu',
  'Huhtikuu',
  'Toukokuu',
  'Kesäkuu',
  'Heinäkuu',
  'Elokuu',
  'Syyskuu',
  'Lokakuu',
  'Marraskuu',
  'Joulukuu',
];

// Istutuspaikat

export interface PlantingLocation {
  id: string;
  name: string;
  description: string;
  sunExposure: SunExposure;
  soilType: string;
  createdAt: string;
}

export type SunExposure = 'aurinkoinen' | 'puolivarjo' | 'varjo';

export const SUN_EXPOSURE_LABELS: Record<SunExposure, string> = {
  aurinkoinen: 'Aurinkoinen',
  puolivarjo: 'Puolivarjo',
  varjo: 'Varjo',
};

// Istutukset

export interface Planting {
  id: string;
  seedId: string;
  locationId: string;
  plantedDate: string;
  quantity: number;
  currentQuantity: number;
  notes: string;
  status: PlantingStatus;
  createdAt: string;
}

export type PlantingStatus =
  | 'seedling'
  | 'planted_ground'
  | 'planted_greenhouse'
  | 'active'
  | 'harvested'
  | 'failed';

export const PLANTING_STATUS_LABELS: Record<PlantingStatus, string> = {
  seedling: 'Esikasvatuksessa',
  planted_ground: 'Istutettu maahan',
  planted_greenhouse: 'Istutettu kasvihuoneeseen',
  active: 'Kasvaa',
  harvested: 'Korjattu',
  failed: 'Epäonnistunut',
};

// Hoitoloki

export interface CareLogEntry {
  id: string;
  plantingId: string;
  date: string;
  type: CareType;
  notes: string;
  quantityAfter?: number;
  createdAt: string;
}

export type CareType = 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'pest_control' | 'loss' | 'note' | 'improvement' | 'other';

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  watering: 'Kastelu',
  fertilizing: 'Lannoitus',
  pruning: 'Leikkaus',
  harvesting: 'Sadonkorjuu',
  pest_control: 'Tuholaistorjunta',
  loss: 'Hävikki',
  note: 'Muistiinpano',
  improvement: 'Parannusehdotus',
  other: 'Muu',
};
