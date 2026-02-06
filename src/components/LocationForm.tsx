import { useState, useEffect } from 'react';
import type { PlantingLocation, SunExposure } from '../types';
import { SUN_EXPOSURE_LABELS } from '../types';
import './LocationForm.css';

interface LocationFormProps {
  location?: PlantingLocation | null;
  onSave: (location: Omit<PlantingLocation, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const SUN_EXPOSURES: SunExposure[] = ['aurinkoinen', 'puolivarjo', 'varjo'];

export function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sunExposure, setSunExposure] = useState<SunExposure>('aurinkoinen');
  const [soilType, setSoilType] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name);
      setDescription(location.description);
      setSunExposure(location.sunExposure);
      setSoilType(location.soilType);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: location?.id,
      name,
      description,
      sunExposure,
      soilType,
    });
  };

  return (
    <div className="location-form-overlay">
      <form className="location-form" onSubmit={handleSubmit}>
        <h2>{location ? 'Muokkaa istutuspaikkaa' : 'Lisää uusi istutuspaikka'}</h2>

        <div className="form-group">
          <label htmlFor="name">Nimi</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="esim. Kasvihuone, Parveke"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sunExposure">Valoisuus</label>
          <select
            id="sunExposure"
            value={sunExposure}
            onChange={(e) => setSunExposure(e.target.value as SunExposure)}
          >
            {SUN_EXPOSURES.map((exposure) => (
              <option key={exposure} value={exposure}>
                {SUN_EXPOSURE_LABELS[exposure]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="soilType">Maaperä (valinnainen)</label>
          <input
            id="soilType"
            type="text"
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            placeholder="esim. Multaseos, Savimaa"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Kuvaus</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Kuvaile istutuspaikkaa..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Peruuta
          </button>
          <button type="submit" className="btn-primary">
            {location ? 'Tallenna' : 'Lisää'}
          </button>
        </div>
      </form>
    </div>
  );
}
