import type { Subcategory } from '../types';
import { BULB_TYPE_ANCHOR } from '../types';
import './CategoryFilter.css';

interface BulbCategoryFilterProps {
  subcategories: Subcategory[];
  selectedType: string | null;
  selectedVariety: string | null;
  onTypeChange: (type: string | null) => void;
  onVarietyChange: (variety: string | null) => void;
}

export function BulbCategoryFilter({
  subcategories,
  selectedType,
  selectedVariety,
  onTypeChange,
  onVarietyChange,
}: BulbCategoryFilterProps) {
  const bulbTypes = subcategories
    .filter((s) => s.category === BULB_TYPE_ANCHOR)
    .sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  // Kun tyyppi on valittu, näytetään vain valittu (ei kaikkia), ettei rivi täytä ruutua
  const visibleBulbTypes = selectedType
    ? bulbTypes.filter((type) => type.name === selectedType)
    : bulbTypes;

  const varieties = selectedType
    ? subcategories
        .filter((s) => s.category === selectedType)
        .sort((a, b) => a.name.localeCompare(b.name, 'fi'))
    : [];

  const handleTypeClick = (type: string | null) => {
    onTypeChange(type);
    onVarietyChange(null);
  };

  return (
    <div className="category-filter-wrapper">
      <div className="category-filter">
        <button
          className={`filter-btn ${selectedType === null ? 'active' : ''}`}
          onClick={() => handleTypeClick(null)}
        >
          Kaikki
        </button>
        {visibleBulbTypes.map((type) => (
          <button
            key={type.id}
            className={`filter-btn ${selectedType === type.name ? 'active' : ''}`}
            onClick={() => handleTypeClick(type.name)}
          >
            {type.name}
          </button>
        ))}
      </div>
      {varieties.length > 0 && (
        <div className="subcategory-filter">
          <button
            className={`filter-btn sub ${selectedVariety === null ? 'active' : ''}`}
            onClick={() => onVarietyChange(null)}
          >
            Kaikki {selectedType?.toLowerCase()}
          </button>
          {varieties.map((variety) => (
            <button
              key={variety.id}
              className={`filter-btn sub ${selectedVariety === variety.name ? 'active' : ''}`}
              onClick={() => onVarietyChange(variety.name)}
            >
              {variety.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
