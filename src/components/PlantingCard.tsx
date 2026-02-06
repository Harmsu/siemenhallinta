import { useState } from 'react';
import type { Planting, CareLogEntry, Seed, PlantingLocation } from '../types';
import { PLANTING_STATUS_LABELS, CARE_TYPE_LABELS } from '../types';
import './PlantingCard.css';

interface PlantingCardProps {
  planting: Planting;
  seed: Seed | undefined;
  location: PlantingLocation | undefined;
  careLogs: CareLogEntry[];
  onEdit: (planting: Planting) => void;
  onDelete: (id: string) => void;
  onAddCareLog: (plantingId: string) => void;
  onDeleteCareLog: (id: string) => void;
  onCopyToNextYear: (planting: Planting) => void;
}

export function PlantingCard({
  planting,
  seed,
  location,
  careLogs,
  onEdit,
  onDelete,
  onAddCareLog,
  onDeleteCareLog,
  onCopyToNextYear,
}: PlantingCardProps) {
  const [showLogs, setShowLogs] = useState(false);

  const plantedDate = new Date(planting.plantedDate).toLocaleDateString('fi-FI');
  const seedName = seed ? `${seed.nameFi}${seed.variety ? ` (${seed.variety})` : ''}` : 'Tuntematon siemen';
  const locationName = location?.name || 'Tuntematon paikka';

  const sortedLogs = [...careLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={`planting-card planting-${planting.status}`}>
      <div className="planting-card-header">
        <span className={`status-badge status-${planting.status}`}>
          {PLANTING_STATUS_LABELS[planting.status]}
        </span>
        <div className="planting-card-actions">
          <button className="btn-icon" onClick={() => onCopyToNextYear(planting)} title="Kopioi ensi vuodelle">
            📋
          </button>
          <button className="btn-icon" onClick={() => onEdit(planting)} title="Muokkaa">
            ✏️
          </button>
          <button className="btn-icon" onClick={() => onDelete(planting.id)} title="Poista">
            🗑️
          </button>
        </div>
      </div>

      <h3 className="planting-seed">{seedName}</h3>
      <p className="planting-location">📍 {locationName}</p>

      <div className="planting-details">
        <div className="detail-row">
          <span className="detail-label">Istutettu:</span>
          <span>{plantedDate}</span>
        </div>
        {planting.quantity > 0 && (
          <div className="detail-row">
            <span className="detail-label">Määrä:</span>
            <span>{planting.quantity} kpl</span>
          </div>
        )}
      </div>

      {planting.notes && <p className="planting-notes">{planting.notes}</p>}

      <div className="care-log-section">
        <div className="care-log-header">
          <button
            className="btn-toggle-logs"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? '▼' : '▶'} Hoitoloki ({careLogs.length})
          </button>
          <button
            className="btn-add-log"
            onClick={() => onAddCareLog(planting.id)}
          >
            + Lisää merkintä
          </button>
        </div>

        {showLogs && (
          <div className="care-log-list">
            {sortedLogs.length === 0 ? (
              <p className="no-logs">Ei merkintöjä</p>
            ) : (
              sortedLogs.map((log) => (
                <div key={log.id} className="care-log-entry">
                  <div className="log-header">
                    <span className="log-type">{CARE_TYPE_LABELS[log.type]}</span>
                    <span className="log-date">
                      {new Date(log.date).toLocaleDateString('fi-FI')}
                    </span>
                    <button
                      className="btn-icon btn-delete-log"
                      onClick={() => onDeleteCareLog(log.id)}
                      title="Poista"
                    >
                      ×
                    </button>
                  </div>
                  {log.notes && <p className="log-notes">{log.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
