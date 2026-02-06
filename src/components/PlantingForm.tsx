import { useState, useEffect } from 'react';
import type { Planting, PlantingStatus, Seed, PlantingLocation } from '../types';
import { PLANTING_STATUS_LABELS } from '../types';
import './PlantingForm.css';

interface PlantingFormProps {
  planting?: Planting | null;
  seeds: Seed[];
  locations: PlantingLocation[];
  initialDate?: string;
  onSave: (planting: Omit<Planting, 'id' | 'createdAt'> & { id?: string }) => void;
  onCancel: () => void;
}

const STATUSES: PlantingStatus[] = ['seedling', 'planted_ground', 'planted_greenhouse', 'active', 'harvested', 'failed'];

export function PlantingForm({ planting, seeds, locations, initialDate, onSave, onCancel }: PlantingFormProps) {
  const [seedId, setSeedId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [plantedDate, setPlantedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<PlantingStatus>('active');

  useEffect(() => {
    if (planting) {
      setSeedId(planting.seedId);
      setLocationId(planting.locationId);
      setPlantedDate(planting.plantedDate.split('T')[0]);
      setQuantity(planting.quantity);
      setNotes(planting.notes);
      setStatus(planting.status);
    }
  }, [planting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: planting?.id || undefined,
      seedId,
      locationId,
      plantedDate,
      quantity,
      notes,
      status,
    });
  };

  const getSeedLabel = (seed: Seed) => {
    let label = seed.nameFi;
    if (seed.variety) label += ` (${seed.variety})`;
    return label;
  };

  return (
    <div className="planting-form-overlay">
      <form className="planting-form" onSubmit={handleSubmit}>
        <h2>{planting?.id ? 'Muokkaa istutusta' : 'Lisää uusi istutus'}</h2>

        <div className="form-group">
          <label htmlFor="seedId">Siemen</label>
          <select
            id="seedId"
            value={seedId}
            onChange={(e) => setSeedId(e.target.value)}
            required
          >
            <option value="">Valitse siemen...</option>
            {seeds.map((seed) => (
              <option key={seed.id} value={seed.id}>
                {getSeedLabel(seed)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="locationId">Istutuspaikka</label>
          <select
            id="locationId"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          >
            <option value="">Valitse paikka...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="plantedDate">Istutuspäivä</label>
            <input
              id="plantedDate"
              type="date"
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Määrä (kpl)</label>
            <input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Tila</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PlantingStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {PLANTING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Muistiinpanot</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Lisätietoja istutuksesta..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Peruuta
          </button>
          <button type="submit" className="btn-primary">
            {planting?.id ? 'Tallenna' : 'Lisää'}
          </button>
        </div>
      </form>
    </div>
  );
}
