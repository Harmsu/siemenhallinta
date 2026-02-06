import type { SeedCategory, Subcategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import './CategoryFilter.css';

interface CategoryFilterProps {
  selected: SeedCategory | null;
  selectedSubcategory: string | null;
  subcategories: Subcategory[];
  onChange: (category: SeedCategory | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
}

const CATEGORIES: SeedCategory[] = ['vihannekset', 'yrtit', 'kukat', 'hedelmät', 'marjat'];

export function CategoryFilter({ selected, selectedSubcategory, subcategories, onChange, onSubcategoryChange }: CategoryFilterProps) {
  const handleCategoryClick = (category: SeedCategory | null) => {
    onChange(category);
    onSubcategoryChange(null);
  };

  // Suodata alakategoriat valitun kategorian mukaan
  const categorySubcategories = selected
    ? subcategories
        .filter((s) => s.category === selected)
        .sort((a, b) => a.name.localeCompare(b.name, 'fi'))
    : [];

  return (
    <div className="category-filter-wrapper">
      <div className="category-filter">
        <button
          className={`filter-btn ${selected === null ? 'active' : ''}`}
          onClick={() => handleCategoryClick(null)}
        >
          Kaikki
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`filter-btn ${selected === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
      {categorySubcategories.length > 0 && (
        <div className="subcategory-filter">
          <button
            className={`filter-btn sub ${selectedSubcategory === null ? 'active' : ''}`}
            onClick={() => onSubcategoryChange(null)}
          >
            Kaikki {CATEGORY_LABELS[selected!].toLowerCase()}
          </button>
          {categorySubcategories.map((sub) => (
            <button
              key={sub.id}
              className={`filter-btn sub ${selectedSubcategory === sub.name ? 'active' : ''}`}
              onClick={() => onSubcategoryChange(sub.name)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
