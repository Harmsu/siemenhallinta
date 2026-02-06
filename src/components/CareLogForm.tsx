import { useState } from 'react';
import type { CareLogEntry, CareType } from '../types';
import { CARE_TYPE_LABELS } from '../types';
import './CareLogForm.css';

interface CareLogFormProps {
  plantingId: string;
  initialDate?: string;
  onSave: (entry: Omit<CareLogEntry, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const CARE_TYPES: CareType[] = ['watering', 'fertilizing', 'pruning', 'harvesting', 'pest_control', 'other'];

export function CareLogForm({ plantingId, initialDate, onSave, onCancel }: CareLogFormProps) {
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<CareType>('watering');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      plantingId,
      date,
      type,
      notes,
    });
  };

  return (
    <div className="carelog-form-overlay">
      <form className="carelog-form" onSubmit={handleSubmit}>
        <h2>Lisää hoitomerkintä</h2>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Päivämäärä</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Tyyppi</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as CareType)}
            >
              {CARE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CARE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Muistiinpanot (valinnainen)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Lisätietoja..."
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Peruuta
          </button>
          <button type="submit" className="btn-primary">
            Lisää
          </button>
        </div>
      </form>
    </div>
  );
}
