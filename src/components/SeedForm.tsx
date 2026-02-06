import { useState, useEffect, useRef } from 'react';
import type { Seed, SeedCategory, Subcategory } from '../types';
import { CATEGORY_LABELS, MONTH_NAMES } from '../types';
import './SeedForm.css';

interface SeedFormProps {
  seed?: Seed | null;
  subcategories: Subcategory[];
  onSave: (seed: Omit<Seed, 'id' | 'createdAt'> & { id?: string }) => void;
  onAddSubcategory: (category: SeedCategory, name: string) => Promise<Subcategory>;
  onDeleteSubcategory: (id: string) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: SeedCategory[] = ['vihannekset', 'yrtit', 'kukat', 'hedelmät', 'marjat'];

// Pakkaa kuva pienemmäksi
async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Skaalaa kuva jos se on liian suuri
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Muunna JPEG-muotoon pakkauksella
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function SeedForm({ seed, subcategories, onSave, onAddSubcategory, onDeleteSubcategory, onCancel }: SeedFormProps) {
  const [nameFi, setNameFi] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<SeedCategory>('vihannekset');
  const [subcategory, setSubcategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [startMonth, setStartMonth] = useState(4);
  const [endMonth, setEndMonth] = useState(5);
  const [indoor, setIndoor] = useState(false);
  const [growingInstructions, setGrowingInstructions] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setStartMonth(seed.plantingTime.startMonth);
      setEndMonth(seed.plantingTime.endMonth);
      setIndoor(seed.plantingTime.indoor);
      setGrowingInstructions(seed.growingInstructions);
      setImageUrl(seed.imageUrl || '');
    }
  }, [seed]);

  // Nollaa alakategoria kun yläkategoria vaihtuu
  const handleCategoryChange = (newCategory: SeedCategory) => {
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setImageUrl(compressedImage);
      } catch (err) {
        console.error('Error compressing image:', err);
        alert('Virhe kuvan käsittelyssä');
      }
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
        <h2>{seed?.id ? 'Muokkaa siementä' : 'Lisää uusi siemen'}</h2>

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
            <select
              id="category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as SeedCategory)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
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
