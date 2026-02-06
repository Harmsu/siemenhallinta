import { describe, it, expect } from 'vitest';
import {
  CATEGORY_LABELS,
  MONTH_NAMES,
  SUN_EXPOSURE_LABELS,
  PLANTING_STATUS_LABELS,
  CARE_TYPE_LABELS,
} from './index';

describe('CATEGORY_LABELS', () => {
  it('sisältää kaikki kategoriat', () => {
    expect(CATEGORY_LABELS.vihannekset).toBe('Vihannekset');
    expect(CATEGORY_LABELS.yrtit).toBe('Yrtit');
    expect(CATEGORY_LABELS.kukat).toBe('Kukat');
    expect(CATEGORY_LABELS.hedelmät).toBe('Hedelmät');
    expect(CATEGORY_LABELS.marjat).toBe('Marjat');
  });

  it('sisältää 5 kategoriaa', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(5);
  });
});

describe('MONTH_NAMES', () => {
  it('sisältää 12 kuukautta', () => {
    expect(MONTH_NAMES).toHaveLength(12);
  });

  it('alkaa tammikuulla', () => {
    expect(MONTH_NAMES[0]).toBe('Tammikuu');
  });

  it('päättyy joulukuuhun', () => {
    expect(MONTH_NAMES[11]).toBe('Joulukuu');
  });

  it('sisältää kaikki kuukaudet oikeassa järjestyksessä', () => {
    expect(MONTH_NAMES[4]).toBe('Toukokuu');
    expect(MONTH_NAMES[6]).toBe('Heinäkuu');
    expect(MONTH_NAMES[8]).toBe('Syyskuu');
  });
});

describe('SUN_EXPOSURE_LABELS', () => {
  it('sisältää kaikki valoisuustyypit', () => {
    expect(SUN_EXPOSURE_LABELS.aurinkoinen).toBe('Aurinkoinen');
    expect(SUN_EXPOSURE_LABELS.puolivarjo).toBe('Puolivarjo');
    expect(SUN_EXPOSURE_LABELS.varjo).toBe('Varjo');
  });

  it('sisältää 3 tyyppiä', () => {
    expect(Object.keys(SUN_EXPOSURE_LABELS)).toHaveLength(3);
  });
});

describe('PLANTING_STATUS_LABELS', () => {
  it('sisältää kaikki istutustilat', () => {
    expect(PLANTING_STATUS_LABELS.seedling).toBe('Esikasvatuksessa');
    expect(PLANTING_STATUS_LABELS.planted_ground).toBe('Istutettu maahan');
    expect(PLANTING_STATUS_LABELS.planted_greenhouse).toBe('Istutettu kasvihuoneeseen');
    expect(PLANTING_STATUS_LABELS.active).toBe('Kasvaa');
    expect(PLANTING_STATUS_LABELS.harvested).toBe('Korjattu');
    expect(PLANTING_STATUS_LABELS.failed).toBe('Epäonnistunut');
  });

  it('sisältää 6 tilaa', () => {
    expect(Object.keys(PLANTING_STATUS_LABELS)).toHaveLength(6);
  });
});

describe('CARE_TYPE_LABELS', () => {
  it('sisältää kaikki hoitotyypit', () => {
    expect(CARE_TYPE_LABELS.watering).toBe('Kastelu');
    expect(CARE_TYPE_LABELS.fertilizing).toBe('Lannoitus');
    expect(CARE_TYPE_LABELS.pruning).toBe('Leikkaus');
    expect(CARE_TYPE_LABELS.harvesting).toBe('Sadonkorjuu');
    expect(CARE_TYPE_LABELS.pest_control).toBe('Tuholaistorjunta');
    expect(CARE_TYPE_LABELS.other).toBe('Muu');
  });

  it('sisältää 6 tyyppiä', () => {
    expect(Object.keys(CARE_TYPE_LABELS)).toHaveLength(6);
  });
});
