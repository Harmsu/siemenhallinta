import type { Planting, CareLogEntry } from '../types';

export const samplePlantings: Planting[] = [
  {
    id: '1',
    seedId: '1', // Tomaatti
    locationId: '1', // Kasvihuone
    plantedDate: '2024-04-15',
    quantity: 6,
    notes: 'Esikasvatettu ikkunalaudalla maaliskuussa',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    seedId: '2', // Basilika
    locationId: '2', // Parvekelaatikot
    plantedDate: '2024-05-01',
    quantity: 4,
    notes: '',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

export const sampleCareLogs: CareLogEntry[] = [
  {
    id: '1',
    plantingId: '1',
    date: '2024-04-20',
    type: 'watering',
    notes: 'Ensimmäinen kastelu istutuksen jälkeen',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    plantingId: '1',
    date: '2024-04-25',
    type: 'fertilizing',
    notes: 'Tomaattilannoite',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    plantingId: '2',
    date: '2024-05-05',
    type: 'watering',
    notes: '',
    createdAt: new Date().toISOString(),
  },
];
