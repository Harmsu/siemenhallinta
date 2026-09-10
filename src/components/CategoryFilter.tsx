import type { Subcategory } from '../types';
import { getCategoryLabel, CATEGORY_ANCHOR } from '../types';
import './CategoryFilter.css';

interface CategoryFilterProps {
  selected: string | null;
  selectedSubcategory: string | null;
  subcategories: Subcategory[];
  onChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
}

export function CategoryFilter({
  selected,
  selectedSubcategory,
  subcategories,
  onChange,
  onSubcategoryChange,
}: CategoryFilterProps) {
  const categoryOptions = subcategories
    .filter((s) => s.category === CATEGORY_ANCHOR)
    .sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  const handleCategoryClick = (category: string | null) => {
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
        {categoryOptions.map((opt) => (
          <button
            key={opt.id}
            className={`filter-btn ${selected === opt.name ? 'active' : ''}`}
            onClick={() => handleCategoryClick(opt.name)}
          >
            {getCategoryLabel(opt.name)}
          </button>
        ))}
      </div>
      {categorySubcategories.length > 0 && (
        <div className="subcategory-filter">
          <button
            className={`filter-btn sub ${selectedSubcategory === null ? 'active' : ''}`}
            onClick={() => onSubcategoryChange(null)}
          >
            Kaikki {getCategoryLabel(selected!).toLowerCase()}
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
