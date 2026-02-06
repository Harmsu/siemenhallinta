import type { Seed, PlantingLocation } from '../types';
import { SeedCard } from './SeedCard';
import './SeedList.css';

interface SeedListProps {
  seeds: Seed[];
  locations: PlantingLocation[];
  onEdit: (seed: Seed) => void;
  onDelete: (id: string) => void;
  onCopy: (seed: Seed) => void;
  onQuickPlant: (seedId: string, locationId: string) => void;
}

export function SeedList({ seeds, locations, onEdit, onDelete, onCopy, onQuickPlant }: SeedListProps) {
  if (seeds.length === 0) {
    return (
      <div className="seed-list-empty">
        <p>Ei siemeniä. Lisää ensimmäinen siemen klikkaamalla "Lisää siemen" -painiketta.</p>
      </div>
    );
  }

  return (
    <div className="seed-list">
      {seeds.map((seed) => (
        <SeedCard
          key={seed.id}
          seed={seed}
          locations={locations}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
          onQuickPlant={onQuickPlant}
        />
      ))}
    </div>
  );
}
