import { useState, useMemo, useRef } from 'react';
import type { Seed, CategoryType, PlantingLocation, Planting, CareLogEntry } from '../types';
import { BULB_TYPE_ANCHOR, CATEGORY_ANCHOR } from '../types';
import { seedsToCsv, parseSeedsCsv, downloadCsv, csvFilenameFor } from '../utils/seedCsv';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { SeedList } from './SeedList';
import { SeedForm } from './SeedForm';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { BulbCategoryFilter } from './BulbCategoryFilter';
import { LocationList } from './LocationList';
import { LocationForm } from './LocationForm';
import { PlantingList } from './PlantingList';
import { PlantingForm } from './PlantingForm';
import { CareLogForm } from './CareLogForm';
import { Calendar } from './Calendar';
import { Statistics } from './Statistics';
import { ChangePasswordForm } from './ChangePasswordForm';
import { ConfirmDialog } from './ConfirmDialog';

type View = 'seeds' | 'bulbs' | 'locations' | 'plantings' | 'calendar' | 'statistics' | 'settings';
type DefaultTab = 'seeds' | 'bulbs';

const DEFAULT_TAB_KEY = 'harmsu-default-tab';

function getStoredDefaultTab(): DefaultTab {
  const stored = localStorage.getItem(DEFAULT_TAB_KEY);
  return stored === 'bulbs' ? 'bulbs' : 'seeds';
}

// Tunniste siemenen/sipulin sisällölliselle "samuudelle" - käytetään CSV-tuonnin
// duplikaattisuodatukseen (nimi, lajike, kategoria, alakategoria, tyyppi)
function seedSignature(s: { nameFi: string; variety?: string; category: string; subcategory?: string; categoryType?: string }) {
  return [s.nameFi, s.variety, s.category, s.subcategory, s.categoryType]
    .map((v) => (v || '').trim().toLowerCase())
    .join('::');
}

interface MainAppProps {
  onLogout: () => void;
}

export function MainApp({ onLogout }: MainAppProps) {
  const [defaultTab, setDefaultTab] = useState<DefaultTab>(getStoredDefaultTab);
  const [activeView, setActiveView] = useState<View>(getStoredDefaultTab);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Poistovahvistus - oma dialogi natiivin window.confirm():n sijaan, koska se ei
  // näytä mitään iOS:n "Lisää kotivalikkoon" -PWA-tilassa (apple-mobile-web-app-capable) -
  // poisto näytti epäonnistuvan hiljaisesti, koska confirm() palautti aina false.
  const [pendingConfirm, setPendingConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const requestConfirm = (message: string, onConfirm: () => void) => {
    setPendingConfirm({ message, onConfirm });
  };

  const handleDefaultTabChange = (tab: DefaultTab) => {
    setDefaultTab(tab);
    localStorage.setItem(DEFAULT_TAB_KEY, tab);
  };

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
  } = useSupabaseData(true);

  // Siemenet UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isSeedFormOpen, setIsSeedFormOpen] = useState(false);
  const [editingSeed, setEditingSeed] = useState<Seed | null>(null);

  // Sipulit UI state
  const [bulbSearchQuery, setBulbSearchQuery] = useState('');
  const [selectedBulbType, setSelectedBulbType] = useState<string | null>(null);
  const [selectedBulbVariety, setSelectedBulbVariety] = useState<string | null>(null);

  // Istutuspaikat UI state
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PlantingLocation | null>(null);

  // Istutukset UI state
  const [plantingSearch, setPlantingSearch] = useState('');
  const [selectedPlantingType, setSelectedPlantingType] = useState<CategoryType | null>(null);
  const [isPlantingFormOpen, setIsPlantingFormOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<Planting | null>(null);
  const [plantingInitialDate, setPlantingInitialDate] = useState<string>('');

  // Hoitoloki UI state
  const [isCareLogFormOpen, setIsCareLogFormOpen] = useState(false);
  const [careLogPlantingId, setCareLogPlantingId] = useState<string>('');
  const [careLogInitialDate, setCareLogInitialDate] = useState<string>('');

  // Siementen suodatus ja järjestys (aakkosjärjestys) - vain categoryType 'siemen'
  const filteredSeeds = useMemo(() => {
    const filtered = seeds.filter((seed) => {
      if (seed.categoryType !== 'siemen') return false;

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

  // Sipulien suodatus ja järjestys - vain categoryType 'sipuli'
  const filteredBulbs = useMemo(() => {
    const filtered = seeds.filter((seed) => {
      if (seed.categoryType !== 'sipuli') return false;

      const searchLower = bulbSearchQuery.toLowerCase();
      const matchesSearch =
        bulbSearchQuery === '' ||
        seed.nameFi.toLowerCase().includes(searchLower) ||
        (seed.variety && seed.variety.toLowerCase().includes(searchLower));

      const matchesType =
        selectedBulbType === null || seed.category === selectedBulbType;

      const matchesVariety =
        selectedBulbVariety === null || seed.subcategory === selectedBulbVariety;

      return matchesSearch && matchesType && matchesVariety;
    });

    return filtered.sort((a, b) => {
      const nameA = `${a.nameFi} ${a.variety || ''}`.toLowerCase();
      const nameB = `${b.nameFi} ${b.variety || ''}`.toLowerCase();
      return nameA.localeCompare(nameB, 'fi');
    });
  }, [seeds, bulbSearchQuery, selectedBulbType, selectedBulbVariety]);

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
    return plantings.filter((p) => {
      const seed = seeds.find((s) => s.id === p.seedId);
      const location = locations.find((l) => l.id === p.locationId);

      const matchesType =
        selectedPlantingType === null || seed?.categoryType === selectedPlantingType;

      if (plantingSearch === '') return matchesType;

      const searchLower = plantingSearch.toLowerCase();
      const matchesSearch =
        seed?.nameFi.toLowerCase().includes(searchLower) ||
        seed?.variety?.toLowerCase().includes(searchLower) ||
        location?.name.toLowerCase().includes(searchLower);

      return matchesType && matchesSearch;
    });
  }, [plantings, plantingSearch, selectedPlantingType, seeds, locations]);

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

  const handleDeleteSeed = (id: string) => {
    requestConfirm('Haluatko varmasti poistaa tämän siemenen?', async () => {
      try {
        await deleteSeed(id);
      } catch (err) {
        console.error('Error deleting seed:', err);
        alert('Virhe poistettaessa siementä');
      }
    });
  };

  const seedImportInputRef = useRef<HTMLInputElement>(null);
  const bulbImportInputRef = useRef<HTMLInputElement>(null);

  const handleExportSeeds = (categoryType: CategoryType) => {
    const filtered = seeds.filter((s) => s.categoryType === categoryType);
    downloadCsv(csvFilenameFor(categoryType), seedsToCsv(filtered));
  };

  const handleImportSeeds = async (file: File) => {
    const knownCategories = new Set(subcategories.map((s) => `${s.category}::${s.name}`));
    // Estää saman CSV:n toistuvan tuonnin luomasta duplikaatteja - vertaa nimeä, lajiketta,
    // kategoriaa, alakategoriaa ja tyyppiä sekä olemassa oleviin siemeniin että jo tässä
    // tuontierässä lisättyihin.
    const existingSignatures = new Set(seeds.map(seedSignature));

    try {
      const text = await file.text();
      const rows = parseSeedsCsv(text);
      let importedSeeds = 0;
      let importedBulbs = 0;
      let skippedDuplicates = 0;

      for (const row of rows) {
        if (!row.nameFi || !row.category) continue;

        const signature = seedSignature(row);
        if (existingSignatures.has(signature)) {
          skippedDuplicates++;
          continue;
        }

        const anchor = row.categoryType === 'sipuli' ? BULB_TYPE_ANCHOR : CATEGORY_ANCHOR;
        if (!knownCategories.has(`${anchor}::${row.category}`)) {
          await addSubcategory(anchor, row.category);
          knownCategories.add(`${anchor}::${row.category}`);
        }
        if (row.subcategory && !knownCategories.has(`${row.category}::${row.subcategory}`)) {
          await addSubcategory(row.category, row.subcategory);
          knownCategories.add(`${row.category}::${row.subcategory}`);
        }

        await addSeed(row);
        existingSignatures.add(signature);
        if (row.categoryType === 'sipuli') importedBulbs++;
        else importedSeeds++;
      }

      const skippedText = skippedDuplicates > 0
        ? ` Ohitettu ${skippedDuplicates} kpl, koska samanlainen (nimi, lajike, kategoria) oli jo listalla.`
        : '';
      alert(`Tuotu ${importedSeeds} siementä ja ${importedBulbs} sipulia.${skippedText}`);
    } catch (err) {
      console.error('Error importing CSV:', err);
      alert('Virhe CSV-tiedoston tuonnissa. Tarkista tiedoston muoto.');
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

  const handleDeleteSubcategory = (id: string) => {
    const subcategory = subcategories.find((s) => s.id === id);
    if (!subcategory) return;

    // Tarkista onko alakategoria käytössä
    const inUse = seeds.some((s) => s.subcategory === subcategory.name);
    if (inUse) {
      alert('Alakategoriaa ei voi poistaa, koska se on käytössä siemenissä.');
      return;
    }

    requestConfirm(`Haluatko varmasti poistaa alakategorian "${subcategory.name}"?`, async () => {
      try {
        await deleteSubcategory(id);
      } catch (err) {
        console.error('Error deleting subcategory:', err);
        alert('Virhe poistettaessa alakategoriaa');
      }
    });
  };

  // Luo istutus suoraan siemenkortista
  const handleQuickPlant = async (seedId: string, locationId: string) => {
    try {
      await addPlanting({
        seedId,
        locationId,
        plantedDate: new Date().toISOString().split('T')[0],
        quantity: 1,
        currentQuantity: 1,
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

  const handleDeleteLocation = (id: string) => {
    requestConfirm('Haluatko varmasti poistaa tämän istutuspaikan?', async () => {
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error('Error deleting location:', err);
        alert('Virhe poistettaessa paikkaa');
      }
    });
  };

  // Istutusten käsittelijät
  const handleSavePlanting = async (plantingData: Omit<Planting, 'id' | 'createdAt'> & { id?: string; lossReason?: string }) => {
    const { lossReason, ...data } = plantingData;
    try {
      if (data.id) {
        await updatePlanting(data.id, data, lossReason);
      } else {
        await addPlanting({ ...data, currentQuantity: data.quantity });
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

  const handleDeletePlanting = (id: string) => {
    requestConfirm('Haluatko varmasti poistaa tämän istutuksen?', async () => {
      try {
        await deletePlanting(id);
      } catch (err) {
        console.error('Error deleting planting:', err);
        alert('Virhe poistettaessa istutusta');
      }
    });
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
        currentQuantity: planting.quantity,
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
          <h1>Harmsun Puutarhapäiväkirja</h1>
          <div className="header-actions">
            <button className="btn-logout" onClick={onLogout}>
              Kirjaudu ulos
            </button>
          </div>
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeView === 'seeds' ? 'active' : ''}`}
            onClick={() => setActiveView('seeds')}
          >
            Siemenet
          </button>
          <button
            className={`nav-tab ${activeView === 'bulbs' ? 'active' : ''}`}
            onClick={() => setActiveView('bulbs')}
          >
            Sipulit
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
          <button
            className={`nav-tab ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            Asetukset
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
              <div className="toolbar-right">
                <button className="btn-add" onClick={() => setIsSeedFormOpen(true)}>
                  + Lisää siemen
                </button>
              </div>
            </div>

            <p className="item-count">
              Näytetään {filteredSeeds.length} / {seeds.filter((s) => s.categoryType === 'siemen').length} siementä
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

        {activeView === 'bulbs' && (
          <>
            <div className="toolbar">
              <div className="toolbar-left">
                <SearchBar value={bulbSearchQuery} onChange={setBulbSearchQuery} />
                <BulbCategoryFilter
                  subcategories={subcategories}
                  selectedType={selectedBulbType}
                  selectedVariety={selectedBulbVariety}
                  onTypeChange={setSelectedBulbType}
                  onVarietyChange={setSelectedBulbVariety}
                />
              </div>
              <div className="toolbar-right">
                <button className="btn-add" onClick={() => setIsSeedFormOpen(true)}>
                  + Lisää sipuli
                </button>
              </div>
            </div>

            <p className="item-count">
              Näytetään {filteredBulbs.length} / {seeds.filter((s) => s.categoryType === 'sipuli').length} sipulia
            </p>

            <SeedList
              seeds={filteredBulbs}
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
                <div className="category-filter">
                  <button
                    className={`filter-btn ${selectedPlantingType === null ? 'active' : ''}`}
                    onClick={() => setSelectedPlantingType(null)}
                  >
                    Kaikki
                  </button>
                  <button
                    className={`filter-btn ${selectedPlantingType === 'siemen' ? 'active' : ''}`}
                    onClick={() => setSelectedPlantingType('siemen')}
                  >
                    Siemenet
                  </button>
                  <button
                    className={`filter-btn ${selectedPlantingType === 'sipuli' ? 'active' : ''}`}
                    onClick={() => setSelectedPlantingType('sipuli')}
                  >
                    Sipulit
                  </button>
                </div>
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
              requestConfirm={requestConfirm}
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

        {activeView === 'settings' && (
          <div className="settings-page">
            <section className="settings-section">
              <h2>Oletusvälilehti</h2>
              <p className="settings-description">
                Valitse kumpi välilehti avautuu ensimmäisenä kun kirjaudut sisään (esim. Sipulit istutuskaudella, Siemenet keväällä).
              </p>
              <div className="settings-actions">
                <button
                  className={`filter-btn ${defaultTab === 'seeds' ? 'active' : ''}`}
                  onClick={() => handleDefaultTabChange('seeds')}
                >
                  Siemenet
                </button>
                <button
                  className={`filter-btn ${defaultTab === 'bulbs' ? 'active' : ''}`}
                  onClick={() => handleDefaultTabChange('bulbs')}
                >
                  Sipulit
                </button>
              </div>
            </section>

            <section className="settings-section">
              <h2>Siemenet</h2>
              <p className="settings-description">Vie siemenet varmuuskopioksi tai tuo aiemmin viety CSV-tiedosto.</p>
              <div className="settings-actions">
                <button className="btn-secondary" onClick={() => handleExportSeeds('siemen')}>
                  Vie CSV
                </button>
                <button className="btn-secondary" onClick={() => seedImportInputRef.current?.click()}>
                  Tuo CSV
                </button>
                <input
                  ref={seedImportInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportSeeds(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </section>

            <section className="settings-section">
              <h2>Sipulit</h2>
              <p className="settings-description">Vie sipulit varmuuskopioksi tai tuo aiemmin viety CSV-tiedosto.</p>
              <div className="settings-actions">
                <button className="btn-secondary" onClick={() => handleExportSeeds('sipuli')}>
                  Vie CSV
                </button>
                <button className="btn-secondary" onClick={() => bulbImportInputRef.current?.click()}>
                  Tuo CSV
                </button>
                <input
                  ref={bulbImportInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportSeeds(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </section>

            <section className="settings-section">
              <h2>Tili</h2>
              <p className="settings-description">Vaihda tilisi salasana.</p>
              <div className="settings-actions">
                <button className="btn-secondary" onClick={() => setIsChangePasswordOpen(true)}>
                  Vaihda salasana
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      {isSeedFormOpen && (
        <SeedForm
          seed={editingSeed}
          defaultCategoryType={activeView === 'bulbs' ? 'sipuli' : 'siemen'}
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

      {isChangePasswordOpen && <ChangePasswordForm onClose={() => setIsChangePasswordOpen(false)} />}

      {pendingConfirm && (
        <ConfirmDialog
          message={pendingConfirm.message}
          onConfirm={() => {
            const { onConfirm } = pendingConfirm;
            setPendingConfirm(null);
            onConfirm();
          }}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
