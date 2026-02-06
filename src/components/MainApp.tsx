import { useState, useMemo } from 'react';
import type { Seed, SeedCategory, PlantingLocation, Planting, CareLogEntry } from '../types';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { SeedList } from './SeedList';
import { SeedForm } from './SeedForm';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { LocationList } from './LocationList';
import { LocationForm } from './LocationForm';
import { PlantingList } from './PlantingList';
import { PlantingForm } from './PlantingForm';
import { CareLogForm } from './CareLogForm';
import { Calendar } from './Calendar';
import { Statistics } from './Statistics';

type View = 'seeds' | 'locations' | 'plantings' | 'calendar' | 'statistics';

interface MainAppProps {
  onLogout: () => void;
}

export function MainApp({ onLogout }: MainAppProps) {
  const [activeView, setActiveView] = useState<View>('seeds');

  // Supabase data
  const {
    seeds,
    locations,
    plantings,
    careLogs,
    loading,
    error,
    addSeed,
    updateSeed,
    deleteSeed,
    addLocation,
    updateLocation,
    deleteLocation,
    addPlanting,
    updatePlanting,
    deletePlanting,
    addCareLog,
    deleteCareLog,
    subcategories,
    addSubcategory,
    deleteSubcategory,
  } = useSupabaseData();

  // Siemenet UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SeedCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isSeedFormOpen, setIsSeedFormOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | null>(null);

  // Istutuspaikat UI state
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PlantingLocation | null>(null);

  // Istutukset UI state
  const [plantingSearch, setPlantingSearch] = useState('');
  const [isPlantingFormOpen, setIsPlantingFormOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<Planting | null>(null);
  const [plantingInitialDate, setPlantingInitialDate] = useState<string>('');

  // Hoitoloki UI state
  const [isCareLogFormOpen, setIsCareLogFormOpen] = useState(false);
  const [careLogPlantingId, setCareLogPlantingId] = useState<string>('');
  const [careLogInitialDate, setCareLogInitialDate] = useState<string>('');

  // Siementen suodatus ja järjestys (aakkosjärjestys)
  const filteredSeeds = useMemo(() => {
    const filtered = seeds.filter((seed) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        seed.nameFi.toLowerCase().includes(searchLower) ||
        (seed.variety && seed.variety.toLowerCase().includes(searchLower));

      const matchesCategory =
        selectedCategory === null || seed.category === selectedCategory;

      const matchesSubcategory =
        selectedSubcategory === null || seed.subcategory === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });

    // Järjestä aakkosjärjestykseen (nimi + lajike)
    return filtered.sort((a, b) => {
      const nameA = `${a.nameFi} ${a.variety || ''}`.toLowerCase();
      const nameB = `${b.nameFi} ${b.variety || ''}`.toLowerCase();
      return nameA.localeCompare(nameB, 'fi');
    });
  }, [seeds, searchQuery, selectedCategory, selectedSubcategory]);

  // Istutuspaikkojen suodatus
  const filteredLocations = useMemo(() => {
    if (locationSearch === '') return locations;
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(locationSearch.toLowerCase()) ||
      loc.description.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [locations, locationSearch]);

  // Istutusten suodatus
  const filteredPlantings = useMemo(() => {
    if (plantingSearch === '') return plantings;
    const searchLower = plantingSearch.toLowerCase();
    return plantings.filter((p) => {
      const seed = seeds.find((s) => s.id === p.seedId);
      const location = locations.find((l) => l.id === p.locationId);
      return (
        (seed?.nameFi.toLowerCase().includes(searchLower)) ||
        (seed?.variety?.toLowerCase().includes(searchLower)) ||
        (location?.name.toLowerCase().includes(searchLower))
      );
    });
  }, [plantings, plantingSearch, seeds, locations]);

  // Siementen käsittelijät
  const handleSaveSeed = async (seedData: Omit<Seed, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (seedData.id) {
        await updateSeed(seedData.id, seedData);
      } else {
        await addSeed(seedData);
      }
      setIsSeedFormOpen(false);
      setEditingSeed(null);
    } catch (err) {
      console.error('Error saving seed:', err);
      alert('Virhe tallennettaessa siementä');
    }
  };

  const handleEditSeed = (seed: Seed) => {
    setEditingSeed(seed);
    setIsSeedFormOpen(true);
  };

  const handleDeleteSeed = async (id: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän siemenen?')) {
      try {
        await deleteSeed(id);
      } catch (err) {
        console.error('Error deleting seed:', err);
        alert('Virhe poistettaessa siementä');
      }
    }
  };

  const handleCopySeed = (seed: Seed) => {
    const copiedSeed: Seed = {
      ...seed,
      id: '',
      variety: '',
      imageUrl: '',
    };
    setEditingSeed(copiedSeed);
    setIsSeedFormOpen(true);
  };

  const handleDeleteSubcategory = async (id: string) => {
    const subcategory = subcategories.find((s) => s.id === id);
    if (!subcategory) return;

    // Tarkista onko alakategoria käytössä
    const inUse = seeds.some((s) => s.subcategory === subcategory.name);
    if (inUse) {
      alert('Alakategoriaa ei voi poistaa, koska se on käytössä siemenissä.');
      return;
    }

    if (window.confirm(`Haluatko varmasti poistaa alakategorian "${subcategory.name}"?`)) {
      try {
        await deleteSubcategory(id);
      } catch (err) {
        console.error('Error deleting subcategory:', err);
        alert('Virhe poistettaessa alakategoriaa');
      }
    }
  };

  // Luo istutus suoraan siemenkortista
  const handleQuickPlant = async (seedId: string, locationId: string) => {
    try {
      await addPlanting({
        seedId,
        locationId,
        plantedDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        notes: '',
        status: 'active',
      });
      setActiveView('plantings');
    } catch (err) {
      console.error('Error creating planting:', err);
      alert('Virhe luotaessa istutusta');
    }
  };

  // Istutuspaikkojen käsittelijät
  const handleSaveLocation = async (locationData: Omit<PlantingLocation, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (locationData.id) {
        await updateLocation(locationData.id, locationData);
      } else {
        await addLocation(locationData);
      }
      setIsLocationFormOpen(false);
      setEditingLocation(null);
    } catch (err) {
      console.error('Error saving location:', err);
      alert('Virhe tallennettaessa paikkaa');
    }
  };

  const handleEditLocation = (location: PlantingLocation) => {
    setEditingLocation(location);
    setIsLocationFormOpen(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän istutuspaikan?')) {
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error('Error deleting location:', err);
        alert('Virhe poistettaessa paikkaa');
      }
    }
  };

  // Istutusten käsittelijät
  const handleSavePlanting = async (plantingData: Omit<Planting, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      if (plantingData.id) {
        await updatePlanting(plantingData.id, plantingData);
      } else {
        await addPlanting(plantingData);
      }
      setIsPlantingFormOpen(false);
      setEditingPlanting(null);
      setPlantingInitialDate('');
    } catch (err) {
      console.error('Error saving planting:', err);
      alert('Virhe tallennettaessa istutusta');
    }
  };

  const handleEditPlanting = (planting: Planting) => {
    setEditingPlanting(planting);
    setIsPlantingFormOpen(true);
  };

  const handleDeletePlanting = async (id: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän istutuksen?')) {
      try {
        await deletePlanting(id);
      } catch (err) {
        console.error('Error deleting planting:', err);
        alert('Virhe poistettaessa istutusta');
      }
    }
  };

  // Kopioi istutus ensi vuodelle
  const handleCopyToNextYear = async (planting: Planting) => {
    const currentDate = new Date(planting.plantedDate);
    const nextYearDate = new Date(currentDate);
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);

    const nextYearDateStr = `${nextYearDate.getFullYear()}-${String(nextYearDate.getMonth() + 1).padStart(2, '0')}-${String(nextYearDate.getDate()).padStart(2, '0')}`;

    try {
      await addPlanting({
        seedId: planting.seedId,
        locationId: planting.locationId,
        plantedDate: nextYearDateStr,
        quantity: planting.quantity,
        notes: planting.notes,
        status: 'seedling',
      });
      alert(`Istutus kopioitu vuodelle ${nextYearDate.getFullYear()}`);
    } catch (err) {
      console.error('Error copying planting:', err);
      alert('Virhe kopioitaessa istutusta');
    }
  };

  // Hoitolokin käsittelijät
  const handleAddCareLog = (plantingId: string, date?: string) => {
    setCareLogPlantingId(plantingId);
    setCareLogInitialDate(date || '');
    setIsCareLogFormOpen(true);
  };

  const handleSaveCareLog = async (entryData: Omit<CareLogEntry, 'id' | 'createdAt'>) => {
    try {
      await addCareLog(entryData);
      setIsCareLogFormOpen(false);
      setCareLogPlantingId('');
      setCareLogInitialDate('');
    } catch (err) {
      console.error('Error saving care log:', err);
      alert('Virhe tallennettaessa hoitomerkintää');
    }
  };

  const handleDeleteCareLog = async (id: string) => {
    try {
      await deleteCareLog(id);
    } catch (err) {
      console.error('Error deleting care log:', err);
      alert('Virhe poistettaessa hoitomerkintää');
    }
  };

  // Kalenterista lisäys
  const handleCalendarAddPlanting = (date: string) => {
    setPlantingInitialDate(date);
    setEditingPlanting(null);
    setIsPlantingFormOpen(true);
  };

  const handleCalendarAddCareLog = (plantingId: string, date: string) => {
    handleAddCareLog(plantingId, date);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Ladataan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">Virhe: {error}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <h1>Harmsun siemenet</h1>
          <button className="btn-logout" onClick={onLogout}>
            Kirjaudu ulos
          </button>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeView === 'seeds' ? 'active' : ''}`}
            onClick={() => setActiveView('seeds')}
          >
            Siemenet
          </button>
          <button
            className={`nav-tab ${activeView === 'locations' ? 'active' : ''}`}
            onClick={() => setActiveView('locations')}
          >
            Paikat
          </button>
          <button
            className={`nav-tab ${activeView === 'plantings' ? 'active' : ''}`}
            onClick={() => setActiveView('plantings')}
          >
            Istutukset
          </button>
          <button
            className={`nav-tab ${activeView === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveView('calendar')}
          >
            Kalenteri
          </button>
          <button
            className={`nav-tab ${activeView === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveView('statistics')}
          >
            Tilastot
          </button>
        </nav>
      </header>

      <main className="main">
        {activeView === 'seeds' && (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <CategoryFilter
                  selected={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  subcategories={subcategories}
                  onChange={setSelectedCategory}
                  onSubcategoryChange={setSelectedSubcategory}
                />
              </div>
              <button className="btn-add" onClick={() => setIsSeedFormOpen(true)}>
                + Lisää siemen
              </button>
            </div>

            <p className="item-count">
              Näytetään {filteredSeeds.length} / {seeds.length} siementä
            </p>

            <SeedList
              seeds={filteredSeeds}
              locations={locations}
              onEdit={handleEditSeed}
              onDelete={handleDeleteSeed}
              onCopy={handleCopySeed}
              onQuickPlant={handleQuickPlant}
            />
          </>
        )}

        {activeView === 'locations' && (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <SearchBar value={locationSearch} onChange={setLocationSearch} />
              </div>
              <button className="btn-add" onClick={() => setIsLocationFormOpen(true)}>
                + Lisää paikka
              </button>
            </div>

            <p className="item-count">
              Näytetään {filteredLocations.length} / {locations.length} istutuspaikkaa
            </p>

            <LocationList
              locations={filteredLocations}
              onEdit={handleEditLocation}
              onDelete={handleDeleteLocation}
            />
          </>
        )}

        {activeView === 'plantings' && (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <SearchBar value={plantingSearch} onChange={setPlantingSearch} />
              </div>
              <button className="btn-add" onClick={() => setIsPlantingFormOpen(true)}>
                + Lisää istutus
              </button>
            </div>

            <p className="item-count">
              Näytetään {filteredPlantings.length} / {plantings.length} istutusta
            </p>

            <PlantingList
              plantings={filteredPlantings}
              seeds={seeds}
              locations={locations}
              careLogs={careLogs}
              onEdit={handleEditPlanting}
              onDelete={handleDeletePlanting}
              onAddCareLog={handleAddCareLog}
              onDeleteCareLog={handleDeleteCareLog}
              onCopyToNextYear={handleCopyToNextYear}
            />
          </>
        )}

        {activeView === 'calendar' && (
          <Calendar
            plantings={plantings}
            careLogs={careLogs}
            seeds={seeds}
            locations={locations}
            onAddPlanting={handleCalendarAddPlanting}
            onAddCareLog={handleCalendarAddCareLog}
          />
        )}

        {activeView === 'statistics' && (
          <Statistics
            plantings={plantings}
            seeds={seeds}
            locations={locations}
            careLogs={careLogs}
          />
        )}
      </main>

      {isSeedFormOpen && (
        <SeedForm
          seed={editingSeed}
          subcategories={subcategories}
          onSave={handleSaveSeed}
          onAddSubcategory={addSubcategory}
          onDeleteSubcategory={handleDeleteSubcategory}
          onCancel={() => {
            setIsSeedFormOpen(false);
            setEditingSeed(null);
          }}
        />
      )}

      {isLocationFormOpen && (
        <LocationForm
          location={editingLocation}
          onSave={handleSaveLocation}
          onCancel={() => {
            setIsLocationFormOpen(false);
            setEditingLocation(null);
          }}
        />
      )}

      {isPlantingFormOpen && (
        <PlantingForm
          planting={editingPlanting}
          seeds={seeds}
          locations={locations}
          initialDate={plantingInitialDate}
          onSave={handleSavePlanting}
          onCancel={() => {
            setIsPlantingFormOpen(false);
            setEditingPlanting(null);
            setPlantingInitialDate('');
          }}
        />
      )}

      {isCareLogFormOpen && (
        <CareLogForm
          plantingId={careLogPlantingId}
          initialDate={careLogInitialDate}
          onSave={handleSaveCareLog}
          onCancel={() => {
            setIsCareLogFormOpen(false);
            setCareLogPlantingId('');
            setCareLogInitialDate('');
          }}
        />
      )}
    </div>
  );
}
