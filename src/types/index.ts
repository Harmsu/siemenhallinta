export interface Seed {
  id: string;
  nameFi: string;
  variety: string;
  category: SeedCategory;
  subcategory: string;
  plantingTime: PlantingTime;
  growingInstructions: string;
  imageUrl: string;
  createdAt: string;
}

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

// Alakategoria
export interface Subcategory {
  id: string;
  category: SeedCategory;
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
  createdAt: string;
}

export type CareType = 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'pest_control' | 'other';

export const CARE_TYPE_LABELS: Record<CareType, string> = {
  watering: 'Kastelu',
  fertilizing: 'Lannoitus',
  pruning: 'Leikkaus',
  harvesting: 'Sadonkorjuu',
  pest_control: 'Tuholaistorjunta',
  other: 'Muu',
};
