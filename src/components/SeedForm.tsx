import { useState, useEffect, useRef } from 'react';
import type { Seed, Subcategory, CategoryType } from '../types';
import { getCategoryLabel, MONTH_NAMES, BULB_TYPE_ANCHOR, CATEGORY_ANCHOR } from '../types';
import { api } from '../api/client';
import { compressImageToBlob } from '../utils/image';
import './SeedForm.css';

interface SeedFormProps {
  seed?: Seed | null;
  defaultCategoryType?: CategoryType;
  subcategories: Subcategory[];
  onSave: (seed: Omit<Seed, 'id' | 'createdAt'> & { id?: string }) => void;
  onAddSubcategory: (category: string, name: string) => Promise<Subcategory>;
  onDeleteSubcategory: (id: string) => void;
  onCancel: () => void;
}

export function SeedForm({ seed, defaultCategoryType, subcategories, onSave, onAddSubcategory, onDeleteSubcategory, onCancel }: SeedFormProps) {
  const [nameFi, setNameFi] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>(defaultCategoryType || 'siemen');
  const [plantingDepthCm, setPlantingDepthCm] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [startMonth, setStartMonth] = useState(4);
  const [endMonth, setEndMonth] = useState(5);
  const [indoor, setIndoor] = useState(false);
  const [growingInstructions, setGrowingInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kategoria-ankkuri riippuu tyypistä: siemenillä kiinteä "kategoriat"-lista, sipuleilla "sipulit"-lista.
  // Molemmat ovat käyttäjän itse lisättäviä/poistettavia, samalla mekanismilla.
  const categoryAnchor = categoryType === 'sipuli' ? BULB_TYPE_ANCHOR : CATEGORY_ANCHOR;
  const categoryOptions = subcategories
    .filter((s) => s.category === categoryAnchor)
    .sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  // Suodata alakategoriat valitun kategorian mukaan
  const categorySubcategories = subcategories
    .filter((s) => s.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, 'fi'));

  useEffect(() => {
    if (seed) {
      setNameFi(seed.nameFi);
      setVariety(seed.variety);
      setCategory(seed.category);
      setSubcategory(seed.subcategory || '');
      setCategoryType(seed.categoryType || 'siemen');
      setPlantingDepthCm(seed.plantingDepthCm !== undefined ? String(seed.plantingDepthCm) : '');
      setStartMonth(seed.plantingTime.startMonth);
      setEndMonth(seed.plantingTime.endMonth);
      setIndoor(seed.plantingTime.indoor);
      setGrowingInstructions(seed.growingInstructions);
      setImageUrl(seed.imageUrl || '');
    }
  }, [seed]);

  // Nollaa alakategoria kun kategoria vaihtuu
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setSubcategory('');
    setIsAddingSubcategory(false);
    setNewSubcategory('');
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim()) return;
    try {
      const added = await onAddSubcategory(category, newSubcategory.trim());
      setSubcategory(added.name);
      setNewSubcategory('');
      setIsAddingSubcategory(false);
    } catch (err) {
      console.error('Error adding subcategory:', err);
      alert('Virhe lisättäessä alakategoriaa');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const added = await onAddSubcategory(categoryAnchor, newCategoryName.trim());
      handleCategoryChange(added.name);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Virhe lisättäessä kategoriaa');
    }
  };

  const handleDeleteCategory = () => {
    const found = categoryOptions.find((c) => c.name === category);
    if (found) {
      onDeleteSubcategory(found.id);
      handleCategoryChange('');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const blob = await compressImageToBlob(file);
      const url = await api.uploadImage(blob);
      setImageUrl(url);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Virhe kuvan latauksessa');
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: seed?.id || undefined,
      nameFi,
      variety,
      category,
      subcategory,
      categoryType,
      plantingDepthCm: categoryType === 'sipuli' && plantingDepthCm ? Number(plantingDepthCm) : undefined,
      plantingTime: {
        startMonth,
        endMonth,
        indoor,
      },
      growingInstructions,
      imageUrl,
    });
  };

  return (
    <div className="seed-form-overlay">
      <form className="seed-form" onSubmit={handleSubmit}>
        <h2>
          {seed?.id
            ? (categoryType === 'sipuli' ? 'Muokkaa sipulia' : 'Muokkaa siementä')
            : (categoryType === 'sipuli' ? 'Lisää uusi sipuli' : 'Lisää uusi siemen')}
        </h2>

        <div className="form-group">
          <label htmlFor="nameFi">Nimi</label>
          <input
            id="nameFi"
            type="text"
            value={nameFi}
            onChange={(e) => setNameFi(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="variety">Lajike</label>
          <input
            id="variety"
            type="text"
            value={variety}
            onChange={(e) => setVariety(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Kategoria</label>
            {isAddingCategory ? (
              <div className="subcategory-add">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Uusi kategoria..."
                  autoFocus
                />
                <button type="button" className="btn-small" onClick={handleAddCategory}>
                  Lisää
                </button>
                <button
                  type="button"
                  className="btn-small btn-cancel"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  Peruuta
                </button>
              </div>
            ) : (
              <div className="subcategory-select">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  required
                >
                  <option value="">Valitse kategoria</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.name}>
                      {getCategoryLabel(opt.name)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-subcategory"
                  onClick={() => setIsAddingCategory(true)}
                  title="Lisää uusi kategoria"
                >
                  +
                </button>
                {category && (
                  <button
                    type="button"
                    className="btn-delete-subcategory"
                    onClick={handleDeleteCategory}
                    title="Poista kategoria"
                  >
                    -
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subcategory">Alakategoria (valinnainen)</label>
            {isAddingSubcategory ? (
              <div className="subcategory-add">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="Uusi alakategoria..."
                  autoFocus
                />
                <button type="button" className="btn-small" onClick={handleAddSubcategory}>
                  Lisää
                </button>
                <button
                  type="button"
                  className="btn-small btn-cancel"
                  onClick={() => {
                    setIsAddingSubcategory(false);
                    setNewSubcategory('');
                  }}
                >
                  Peruuta
                </button>
              </div>
            ) : (
              <div className="subcategory-select">
                <select
                  id="subcategory"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!category}
                >
                  <option value="">Ei alakategoriaa</option>
                  {categorySubcategories.map((sub) => (
                    <option key={sub.id} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-add-subcategory"
                  onClick={() => setIsAddingSubcategory(true)}
                  disabled={!category}
                  title="Lisää uusi alakategoria"
                >
                  +
                </button>
                {subcategory && (
                  <button
                    type="button"
                    className="btn-delete-subcategory"
                    onClick={() => {
                      const sub = categorySubcategories.find((s) => s.name === subcategory);
                      if (sub) {
                        onDeleteSubcategory(sub.id);
                        setSubcategory('');
                      }
                    }}
                    title="Poista alakategoria"
                  >
                    -
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {categoryType === 'sipuli' && (
          <div className="form-group">
            <label htmlFor="plantingDepthCm">Istutussyvyys (cm)</label>
            <input
              id="plantingDepthCm"
              type="number"
              min="0"
              step="0.5"
              value={plantingDepthCm}
              onChange={(e) => setPlantingDepthCm(e.target.value)}
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startMonth">Istutus alkaa</label>
            <select
              id="startMonth"
              value={startMonth}
              onChange={(e) => setStartMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="endMonth">Istutus päättyy</label>
            <select
              id="endMonth"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>

        {categoryType !== 'sipuli' && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
              />
              Esikasvatus sisällä
            </label>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="instructions">Kasvatusohjeet</label>
          <textarea
            id="instructions"
            value={growingInstructions}
            onChange={(e) => setGrowingInstructions(e.target.value)}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Valokuva</label>
          <div className="image-upload">
            {imageUrl ? (
              <div className="image-preview">
                <img src={imageUrl} alt="Esikatselu" />
                <button type="button" className="btn-remove-image" onClick={handleRemoveImage}>
                  ×
                </button>
              </div>
            ) : (
              <div className="image-placeholder">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="btn-upload">
                  📷 Valitse kuva
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Peruuta
          </button>
          <button type="submit" className="btn-primary">
            {seed?.id ? 'Tallenna' : 'Lisää'}
          </button>
        </div>
      </form>
    </div>
  );
}
