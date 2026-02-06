import type { Seed, PlantingLocation } from '../types';
import { CATEGORY_LABELS, MONTH_NAMES } from '../types';
import './SeedCard.css';

interface SeedCardProps {
  seed: Seed;
  locations: PlantingLocation[];
  onEdit: (seed: Seed) => void;
  onDelete: (id: string) => void;
  onCopy: (seed: Seed) => void;
  onQuickPlant: (seedId: string, locationId: string) => void;
}

export function SeedCard({ seed, locations, onEdit, onDelete, onCopy, onQuickPlant }: SeedCardProps) {
  const { nameFi, variety, category, subcategory, plantingTime, growingInstructions, imageUrl } = seed;

  const plantingTimeText = `${MONTH_NAMES[plantingTime.startMonth - 1]} - ${MONTH_NAMES[plantingTime.endMonth - 1]}`;

  const handleQuickPlant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    if (locationId) {
      onQuickPlant(seed.id, locationId);
      e.target.value = ''; // Reset selection
    }
  };

  return (
    <div className="seed-card">
      {imageUrl && (
        <div className="seed-image">
          <img src={imageUrl} alt={nameFi} />
        </div>
      )}
      <div className="seed-card-header">
        <div className="seed-badges">
          <span className={`category-badge category-${category}`}>
            {CATEGORY_LABELS[category]}
          </span>
          {subcategory && (
            <span className="subcategory-badge">
              {subcategory}
            </span>
          )}
        </div>
        <div className="seed-card-actions">
          <button className="btn-icon" onClick={() => onCopy(seed)} title="Kopioi">
            📋
          </button>
          <button className="btn-icon" onClick={() => onEdit(seed)} title="Muokkaa">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => onDelete(seed.id)} title="Poista">
            🗑️
          </button>
        </div>
      </div>
      <h3 className="seed-name">{nameFi}</h3>
      {variety && <p className="seed-variety">{variety}</p>}
      <div className="seed-info">
        <div className="planting-time">
          <span className="label">Istutusaika:</span>
          <span>{plantingTimeText}</span>
          {plantingTime.indoor && <span className="indoor-badge">Esikasvatus</span>}
        </div>
      </div>
      {growingInstructions && <p className="growing-instructions">{growingInstructions}</p>}

      {locations.length > 0 && (
        <div className="quick-plant">
          <select onChange={handleQuickPlant} defaultValue="">
            <option value="" disabled>
              🌱 Istutuspaikka...
            </option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
