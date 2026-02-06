import type { Planting, CareLogEntry, Seed, PlantingLocation } from '../types';
import { PlantingCard } from './PlantingCard';
import './PlantingList.css';

interface PlantingListProps {
  plantings: Planting[];
  seeds: Seed[];
  locations: PlantingLocation[];
  careLogs: CareLogEntry[];
  onEdit: (planting: Planting) => void;
  onDelete: (id: string) => void;
  onAddCareLog: (plantingId: string) => void;
  onDeleteCareLog: (id: string) => void;
  onCopyToNextYear: (planting: Planting) => void;
}

export function PlantingList({
  plantings,
  seeds,
  locations,
  careLogs,
  onEdit,
  onDelete,
  onAddCareLog,
  onDeleteCareLog,
  onCopyToNextYear,
}: PlantingListProps) {
  if (plantings.length === 0) {
    return (
      <div className="planting-list-empty">
        <p>Ei istutuksia. Lisää ensimmäinen istutus klikkaamalla "Lisää istutus" -painiketta.</p>
      </div>
    );
  }

  const getSeed = (seedId: string) => seeds.find((s) => s.id === seedId);
  const getLocation = (locationId: string) => locations.find((l) => l.id === locationId);
  const getCareLogs = (plantingId: string) => careLogs.filter((c) => c.plantingId === plantingId);

  return (
    <div className="planting-list">
      {plantings.map((planting) => (
        <PlantingCard
          key={planting.id}
          planting={planting}
          seed={getSeed(planting.seedId)}
          location={getLocation(planting.locationId)}
          careLogs={getCareLogs(planting.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddCareLog={onAddCareLog}
          onDeleteCareLog={onDeleteCareLog}
          onCopyToNextYear={onCopyToNextYear}
        />
      ))}
    </div>
  );
}
