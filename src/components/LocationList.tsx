import type { PlantingLocation } from '../types';
import { LocationCard } from './LocationCard';
import './LocationList.css';

interface LocationListProps {
  locations: PlantingLocation[];
  onEdit: (location: PlantingLocation) => void;
  onDelete: (id: string) => void;
}

export function LocationList({ locations, onEdit, onDelete }: LocationListProps) {
  if (locations.length === 0) {
    return (
      <div className="location-list-empty">
        <p>Ei istutuspaikkoja. Lisää ensimmäinen paikka klikkaamalla "Lisää paikka" -painiketta.</p>
      </div>
    );
  }

  return (
    <div className="location-list">
      {locations.map((location) => (
        <LocationCard
          key={location.id}
          location={location}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
