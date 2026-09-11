import type { Seed, CategoryType } from '../types';

const COLUMNS = [
  'Tyyppi',
  'Kategoria',
  'Alakategoria',
  'Nimi',
  'Lajike',
  'Kylvösyvyys_cm',
  'Kylvö_alkukuu',
  'Kylvö_loppukuu',
  'Sisälle',
  'Kasvatusohjeet',
  'KuvaURL',
] as const;

function escapeField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function seedToRow(seed: Seed): string {
  const fields = [
    seed.categoryType === 'sipuli' ? 'Sipuli' : 'Siemen',
    seed.category,
    seed.subcategory ?? '',
    seed.nameFi,
    seed.variety ?? '',
    seed.plantingDepthCm != null ? String(seed.plantingDepthCm) : '',
    String(seed.plantingTime.startMonth),
    String(seed.plantingTime.endMonth),
    seed.plantingTime.indoor ? 'kyllä' : 'ei',
    seed.growingInstructions ?? '',
    seed.imageUrl ?? '',
  ];
  return fields.map(escapeField).join(',');
}

export function seedsToCsv(seeds: Seed[]): string {
  const lines = [COLUMNS.join(','), ...seeds.map(seedToRow)];
  return lines.join('\r\n');
}

// Yksinkertainen CSV-rivijako joka osaa lainausmerkkien sisällä olevat pilkut/rivinvaihdot
function parseCsvLines(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      // ohitetaan, \n hoitaa rivinvaihdon
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

export type ImportedSeed = Omit<Seed, 'id' | 'createdAt'>;

// Vanhoissa (ennen Tyyppi-saraketta viedyissä) CSV-tiedostoissa on 10 saraketta eikä Tyyppi-saraketta -
// tunnistetaan sarakemäärästä ja oletetaan 'siemen', jotta vanhat vientitiedostot voi yhä tuoda.
const LEGACY_COLUMN_COUNT = 10;

export function parseSeedsCsv(text: string): ImportedSeed[] {
  const rows = parseCsvLines(text);
  if (rows.length === 0) return [];

  const [header, ...dataRows] = rows;
  const isLegacyFormat = header.length <= LEGACY_COLUMN_COUNT;

  return dataRows.map((cols) => {
    const fields = isLegacyFormat ? ['Siemen', ...cols] : cols;
    const [type, category, subcategory, nameFi, variety, depth, startMonth, endMonth, indoor, instructions, imageUrl] =
      fields;
    return {
      categoryType: (type ?? '').trim().toLowerCase() === 'sipuli' ? 'sipuli' : 'siemen',
      category: (category ?? '').trim(),
      subcategory: (subcategory ?? '').trim(),
      nameFi: (nameFi ?? '').trim(),
      variety: (variety ?? '').trim(),
      plantingDepthCm: depth && depth.trim() !== '' ? Number(depth) : undefined,
      plantingTime: {
        startMonth: Number(startMonth) || 1,
        endMonth: Number(endMonth) || 1,
        indoor: (indoor ?? '').trim().toLowerCase() === 'kyllä',
      },
      growingInstructions: (instructions ?? '').trim(),
      imageUrl: (imageUrl ?? '').trim(),
    };
  });
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function csvFilenameFor(categoryType: CategoryType): string {
  const date = new Date().toISOString().split('T')[0];
  return `${categoryType === 'sipuli' ? 'sipulit' : 'siemenet'}-${date}.csv`;
}
