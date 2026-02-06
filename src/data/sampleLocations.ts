import type { PlantingLocation } from '../types';

export const sampleLocations: PlantingLocation[] = [
  {
    id: '1',
    name: 'Kasvihuone',
    description: 'Lämmin kasvihuone takapihalla. Sopii lämpöä vaativille kasveille.',
    sunExposure: 'aurinkoinen',
    soilType: 'Multaseos',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Parvekelaatikot',
    description: 'Etelään suunnatut parvekelaatikot. Hyvä yrteille ja pienille vihanneksille.',
    sunExposure: 'aurinkoinen',
    soilType: 'Ruukkumulta',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Takapiha - varjoisa alue',
    description: 'Omenapuun alla oleva alue. Sopii varjoa sietäville kasveille.',
    sunExposure: 'varjo',
    soilType: 'Savimaa',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Kasvilavat',
    description: 'Korotetut kasvilavat keskellä pihaa. Hyvä salaateille ja juureksille.',
    sunExposure: 'puolivarjo',
    soilType: 'Kompostimulta',
    createdAt: new Date().toISOString(),
  },
];
