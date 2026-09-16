import { useState, useEffect, useRef } from 'react';
import type { PlantingPhoto } from '../types';
import { api } from '../api/client';
import { compressImageToBlob } from '../utils/image';
import './PlantingPhotos.css';

interface PlantingPhotosProps {
  plantingId: string;
  requestConfirm: (message: string, onConfirm: () => void) => void;
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

export function PlantingPhotos({ plantingId, requestConfirm }: PlantingPhotosProps) {
  const [photos, setPhotos] = useState<PlantingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PlantingPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kuvat ladataan vasta kun tämä komponentti renderöityy - eli vasta kun käyttäjä
  // avaa "Kuvat"-osion yksittäiselle istutukselle, ei koko istutuslistan yhteydessä.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getPlantingPhotos(plantingId)
      .then((data) => {
        if (!cancelled) setPhotos(data);
      })
      .catch((err) => console.error('Error loading planting photos:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plantingId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await compressImageToBlob(file, 1200, 0.75);
      const imageUrl = await api.uploadPlantingPhoto(blob);
      const photo = await api.createPlantingPhoto({
        plantingId,
        imageUrl,
        caption: '',
        takenAt: todayIso(),
      });
      setPhotos((prev) => [photo, ...prev]);
    } catch (err) {
      console.error('Error uploading planting photo:', err);
      alert('Virhe kuvan latauksessa');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = (photo: PlantingPhoto) => {
    requestConfirm('Haluatko varmasti poistaa tämän kuvan?', async () => {
      try {
        await api.deletePlantingPhoto(photo.id);
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        setPreviewPhoto((prev) => (prev?.id === photo.id ? null : prev));
      } catch (err) {
        console.error('Error deleting planting photo:', err);
        alert('Virhe poistettaessa kuvaa');
      }
    });
  };

  const handleCaptionBlur = async (photo: PlantingPhoto, caption: string) => {
    if (caption === photo.caption) return;
    try {
      const updated = await api.updatePlantingPhoto(photo.id, { caption, takenAt: photo.takenAt });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
      setPreviewPhoto((prev) => (prev?.id === photo.id ? updated : prev));
    } catch (err) {
      console.error('Error updating caption:', err);
      alert('Virhe kuvatekstin tallennuksessa');
    }
  };

  const handleTakenAtChange = async (photo: PlantingPhoto, takenAt: string) => {
    if (!takenAt) return;
    try {
      const updated = await api.updatePlantingPhoto(photo.id, { caption: photo.caption, takenAt });
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? updated : p)));
      setPreviewPhoto((prev) => (prev?.id === photo.id ? updated : prev));
    } catch (err) {
      console.error('Error updating date:', err);
      alert('Virhe päivämäärän tallennuksessa');
    }
  };

  if (loading) {
    return <p className="planting-photos-loading">Ladataan kuvia...</p>;
  }

  return (
    <div className="planting-photos">
      {photos.length > 0 && (
        <div className="planting-photos-grid">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="planting-photo-thumb"
              onClick={() => setPreviewPhoto(photo)}
            >
              <img src={photo.imageUrl} alt={photo.caption || 'Istutuskuva'} loading="lazy" />
              <span className="planting-photo-thumb-caption">
                {photo.caption || new Date(photo.takenAt).toLocaleDateString('fi-FI')}
              </span>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        id={`planting-photo-upload-${plantingId}`}
        hidden
        disabled={uploading}
      />
      <label htmlFor={`planting-photo-upload-${plantingId}`} className="btn-add-photo">
        {uploading ? 'Ladataan...' : '📷 Lisää kuva'}
      </label>

      {previewPhoto && (
        <div className="photo-preview-overlay" onClick={() => setPreviewPhoto(null)}>
          <div className="photo-preview" onClick={(e) => e.stopPropagation()}>
            <img src={previewPhoto.imageUrl} alt={previewPhoto.caption || 'Istutuskuva'} />
            <div className="photo-preview-details">
              <input
                key={`date-${previewPhoto.id}`}
                type="date"
                className="photo-preview-date"
                defaultValue={previewPhoto.takenAt}
                onBlur={(e) => handleTakenAtChange(previewPhoto, e.target.value)}
              />
              <input
                key={`caption-${previewPhoto.id}`}
                type="text"
                className="photo-preview-caption"
                placeholder="Kuvateksti (valinnainen)"
                defaultValue={previewPhoto.caption}
                onBlur={(e) => handleCaptionBlur(previewPhoto, e.target.value)}
              />
              <div className="photo-preview-actions">
                <button type="button" className="btn-secondary" onClick={() => setPreviewPhoto(null)}>
                  Sulje
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(previewPhoto)}>
                  Poista kuva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
