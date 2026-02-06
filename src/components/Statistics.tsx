import { useState, useMemo } from 'react';
import type { Planting, Seed, PlantingLocation, CareLogEntry } from '../types';
import { CATEGORY_LABELS, PLANTING_STATUS_LABELS } from '../types';
import './Statistics.css';

interface StatisticsProps {
  plantings: Planting[];
  seeds: Seed[];
  locations: PlantingLocation[];
  careLogs: CareLogEntry[];
}

type ExpandedSection = 'total' | 'harvested' | 'active' | 'failed' | string | null;

export function Statistics({ plantings, seeds, locations, careLogs }: StatisticsProps) {
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);

  const getSeed = (seedId: string) => seeds.find((s) => s.id === seedId);
  const getLocation = (locationId: string) => locations.find((l) => l.id === locationId);

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Ryhmitellyt istutukset
  const groupedPlantings = useMemo(() => {
    const harvested = plantings.filter((p) => p.status === 'harvested');
    const failed = plantings.filter((p) => p.status === 'failed');
    const active = plantings.filter((p) =>
      p.status === 'active' || p.status === 'seedling' ||
      p.status === 'planted_ground' || p.status === 'planted_greenhouse'
    );

    // Kategorioittain
    const byCategory: Record<string, Planting[]> = {};
    plantings.forEach((p) => {
      const seed = getSeed(p.seedId);
      if (seed) {
        const cat = seed.category;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      }
    });

    // Paikoittain
    const byLocation: Record<string, { name: string; plantings: Planting[] }> = {};
    plantings.forEach((p) => {
      const loc = getLocation(p.locationId);
      if (loc) {
        if (!byLocation[p.locationId]) {
          byLocation[p.locationId] = { name: loc.name, plantings: [] };
        }
        byLocation[p.locationId].plantings.push(p);
      }
    });

    // Vuosittain
    const byYear: Record<string, Planting[]> = {};
    plantings.forEach((p) => {
      const year = p.plantedDate.split('-')[0];
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(p);
    });

    return { harvested, failed, active, byCategory, byLocation, byYear };
  }, [plantings, seeds, locations]);

  // Tilastot
  const stats = useMemo(() => {
    const successRate = plantings.length > 0
      ? Math.round((groupedPlantings.harvested.length / (groupedPlantings.harvested.length + groupedPlantings.failed.length || 1)) * 100)
      : 0;

    return {
      total: plantings.length,
      harvested: groupedPlantings.harvested.length,
      failed: groupedPlantings.failed.length,
      active: groupedPlantings.active.length,
      successRate,
      totalCareLogs: careLogs.length,
    };
  }, [plantings, groupedPlantings, careLogs]);

  // Tänä vuonna istuttamattomat siemenet
  const currentYear = new Date().getFullYear();
  const unplantedSeeds = useMemo(() => {
    const plantedSeedIdsThisYear = new Set(
      plantings
        .filter((p) => p.plantedDate.startsWith(String(currentYear)))
        .map((p) => p.seedId)
    );

    return seeds
      .filter((seed) => !plantedSeedIdsThisYear.has(seed.id))
      .sort((a, b) => a.nameFi.localeCompare(b.nameFi, 'fi'));
  }, [plantings, seeds, currentYear]);

  // Apufunktio istutuslistauksen renderöintiin
  const renderPlantingList = (plantingList: Planting[]) => {
    if (plantingList.length === 0) return <p className="no-data">Ei istutuksia</p>;

    return (
      <div className="expanded-list">
        {plantingList
          .sort((a, b) => b.plantedDate.localeCompare(a.plantedDate))
          .map((p) => {
            const seed = getSeed(p.seedId);
            const location = getLocation(p.locationId);
            return (
              <div key={p.id} className="expanded-item">
                <div className="expanded-item-header">
                  <span className="expanded-item-name">
                    {seed?.nameFi || 'Tuntematon'}
                    {seed?.variety && <span className="expanded-item-variety"> ({seed.variety})</span>}
                  </span>
                  <span className={`expanded-item-status status-${p.status}`}>
                    {PLANTING_STATUS_LABELS[p.status]}
                  </span>
                </div>
                <div className="expanded-item-details">
                  <span>📍 {location?.name || '?'}</span>
                  <span>📅 {new Date(p.plantedDate).toLocaleDateString('fi-FI')}</span>
                  {p.quantity > 0 && <span>📦 {p.quantity} kpl</span>}
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="statistics">
      {/* Yhteenveto */}
      <section className="stats-section">
        <h2>Yhteenveto</h2>
        <p className="stats-hint">Klikkaa korttia nähdäksesi listan</p>
        <div className="stats-grid">
          <div
            className={`stat-card clickable ${expandedSection === 'total' ? 'expanded' : ''}`}
            onClick={() => toggleSection('total')}
          >
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Istutuksia yhteensä</span>
          </div>
          <div
            className={`stat-card success clickable ${expandedSection === 'harvested' ? 'expanded' : ''}`}
            onClick={() => toggleSection('harvested')}
          >
            <span className="stat-number">{stats.harvested}</span>
            <span className="stat-label">Satoa korjattu</span>
          </div>
          <div
            className={`stat-card active clickable ${expandedSection === 'active' ? 'expanded' : ''}`}
            onClick={() => toggleSection('active')}
          >
            <span className="stat-number">{stats.active}</span>
            <span className="stat-label">Aktiivisia</span>
          </div>
          <div
            className={`stat-card failed clickable ${expandedSection === 'failed' ? 'expanded' : ''}`}
            onClick={() => toggleSection('failed')}
          >
            <span className="stat-number">{stats.failed}</span>
            <span className="stat-label">Epäonnistuneita</span>
          </div>
        </div>

        {/* Laajennettu lista */}
        {expandedSection === 'total' && renderPlantingList(plantings)}
        {expandedSection === 'harvested' && renderPlantingList(groupedPlantings.harvested)}
        {expandedSection === 'active' && renderPlantingList(groupedPlantings.active)}
        {expandedSection === 'failed' && renderPlantingList(groupedPlantings.failed)}

        {stats.harvested + stats.failed > 0 && (
          <div className="success-rate">
            <div className="success-rate-bar">
              <div
                className="success-rate-fill"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
            <span className="success-rate-text">
              Onnistumisprosentti: {stats.successRate}%
            </span>
          </div>
        )}
      </section>

      {/* Kategorioittain */}
      <section className="stats-section">
        <h2>Kategorioittain</h2>
        <div className="stats-table">
          <div className="stats-table-header">
            <span>Kategoria</span>
            <span>Yhteensä</span>
            <span>Korjattu</span>
            <span>Epäonn.</span>
          </div>
          {Object.entries(groupedPlantings.byCategory)
            .sort((a, b) => b[1].length - a[1].length)
            .map(([cat, catPlantings]) => {
              const harvested = catPlantings.filter((p) => p.status === 'harvested').length;
              const failed = catPlantings.filter((p) => p.status === 'failed').length;
              const isExpanded = expandedSection === `cat-${cat}`;
              return (
                <div key={cat}>
                  <div
                    className={`stats-table-row clickable ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleSection(`cat-${cat}`)}
                  >
                    <span>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</span>
                    <span>{catPlantings.length}</span>
                    <span className="text-success">{harvested}</span>
                    <span className="text-failed">{failed}</span>
                  </div>
                  {isExpanded && renderPlantingList(catPlantings)}
                </div>
              );
            })}
        </div>
      </section>

      {/* Paikoittain */}
      {Object.keys(groupedPlantings.byLocation).length > 0 && (
        <section className="stats-section">
          <h2>Paikoittain</h2>
          <div className="stats-table">
            <div className="stats-table-header">
              <span>Paikka</span>
              <span>Yhteensä</span>
              <span>Korjattu</span>
            </div>
            {Object.entries(groupedPlantings.byLocation)
              .sort((a, b) => b[1].plantings.length - a[1].plantings.length)
              .map(([id, data]) => {
                const harvested = data.plantings.filter((p) => p.status === 'harvested').length;
                const isExpanded = expandedSection === `loc-${id}`;
                return (
                  <div key={id}>
                    <div
                      className={`stats-table-row clickable ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleSection(`loc-${id}`)}
                    >
                      <span>{data.name}</span>
                      <span>{data.plantings.length}</span>
                      <span className="text-success">{harvested}</span>
                    </div>
                    {isExpanded && renderPlantingList(data.plantings)}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Vuosittain */}
      {Object.keys(groupedPlantings.byYear).length > 0 && (
        <section className="stats-section">
          <h2>Vuosittain</h2>
          <div className="stats-table">
            <div className="stats-table-header">
              <span>Vuosi</span>
              <span>Istutuksia</span>
              <span>Korjattu</span>
            </div>
            {Object.entries(groupedPlantings.byYear)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([year, yearPlantings]) => {
                const harvested = yearPlantings.filter((p) => p.status === 'harvested').length;
                const isExpanded = expandedSection === `year-${year}`;
                return (
                  <div key={year}>
                    <div
                      className={`stats-table-row clickable ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => toggleSection(`year-${year}`)}
                    >
                      <span>{year}</span>
                      <span>{yearPlantings.length}</span>
                      <span className="text-success">{harvested}</span>
                    </div>
                    {isExpanded && renderPlantingList(yearPlantings)}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Istuttamattomat siemenet */}
      <section className="stats-section">
        <h2>Istuttamattomat siemenet ({currentYear})</h2>
        {unplantedSeeds.length === 0 ? (
          <p className="no-data">Kaikki siemenet on istutettu tänä vuonna!</p>
        ) : (
          <div className="unplanted-list">
            {unplantedSeeds.map((seed) => (
              <div key={seed.id} className="unplanted-item">
                <span className="unplanted-name">
                  {seed.nameFi}
                  {seed.variety && <span className="unplanted-variety"> ({seed.variety})</span>}
                </span>
                <span className="unplanted-category">
                  {CATEGORY_LABELS[seed.category]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
