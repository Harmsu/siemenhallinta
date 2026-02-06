import type { PlantingLocation } from '../types';
import { SUN_EXPOSURE_LABELS } from '../types';
import './LocationCard.css';

interface LocationCardProps {
  location: PlantingLocation;
  onEdit: (location: PlantingLocation) => void;
  onDelete: (id: string) => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const { name, description, sunExposure, soilType } = location;

  return (
    <div className="location-card">
      <div className="location-card-header">
        <span className={`sun-badge sun-${sunExposure}`}>
          {SUN_EXPOSURE_LABELS[sunExposure]}
        </span>
        <div className="location-card-actions">
          <button className="btn-icon" onClick={() => onEdit(location)} title="Muokkaa">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => onDelete(location.id)} title="Poista">
            🗑️
          </button>
        </div>
      </div>
      <h3 className="location-name">{name}</h3>
      {soilType && <p className="location-soil">Maaperä: {soilType}</p>}
      <p className="location-description">{description}</p>
    </div>
  );
}
