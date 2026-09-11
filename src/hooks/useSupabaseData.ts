import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Seed, PlantingLocation, Planting, CareLogEntry, Subcategory } from '../types';

export function useSupabaseData(enabled: boolean) {
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [locations, setLocations] = useState<PlantingLocation[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [careLogs, setCareLogs] = useState<CareLogEntry[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lataa kaikki data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [seedsData, locationsData, plantingsData, careLogsData, subcategoriesData] = await Promise.all([
        api.getSeeds(),
        api.getLocations(),
        api.getPlantings(),
        api.getCareLogs(),
        api.getSubcategories(),
      ]);
      setSeeds(seedsData);
      setLocations(locationsData);
      setPlantings(plantingsData);
      setCareLogs(careLogsData);
      setSubcategories(subcategoriesData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchAll();
  }, [enabled, fetchAll]);

  // Siemenet
  const addSeed = async (seed: Omit<Seed, 'id' | 'createdAt'>) => {
    const data = await api.createSeed(seed);
    setSeeds((prev) => [...prev, data]);
    return data;
  };

  const updateSeed = async (id: string, seed: Omit<Seed, 'id' | 'createdAt'>) => {
    const data = await api.updateSeed(id, seed);
    setSeeds((prev) => prev.map((s) => (s.id === id ? data : s)));
  };

  const deleteSeed = async (id: string) => {
    await api.deleteSeed(id);
    setSeeds((prev) => prev.filter((s) => s.id !== id));
  };

  // Istutuspaikat
  const addLocation = async (location: Omit<PlantingLocation, 'id' | 'createdAt'>) => {
    const data = await api.createLocation(location);
    setLocations((prev) => [...prev, data]);
    return data;
  };

  const updateLocation = async (id: string, location: Omit<PlantingLocation, 'id' | 'createdAt'>) => {
    const data = await api.updateLocation(id, location);
    setLocations((prev) => prev.map((l) => (l.id === id ? data : l)));
  };

  const deleteLocation = async (id: string) => {
    await api.deleteLocation(id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // Istutukset
  const addPlanting = async (planting: Omit<Planting, 'id' | 'createdAt'>) => {
    const data = await api.createPlanting(planting);
    setPlantings((prev) => [...prev, data]);
    return data;
  };

  const updatePlanting = async (id: string, planting: Omit<Planting, 'id' | 'createdAt'>, lossReason?: string) => {
    const data = await api.updatePlanting(id, planting);
    setPlantings((prev) => prev.map((p) => (p.id === id ? data : p)));

    if (lossReason && planting.currentQuantity < planting.quantity) {
      const logData = await api.createCareLog({
        plantingId: id,
        date: new Date().toISOString().split('T')[0],
        type: 'loss',
        notes: lossReason,
        quantityAfter: planting.currentQuantity,
      });
      setCareLogs((prev) => [...prev, logData]);
    }
  };

  const deletePlanting = async (id: string) => {
    await api.deletePlanting(id);
    setPlantings((prev) => prev.filter((p) => p.id !== id));
    // Hoitologit poistuvat automaattisesti CASCADE-säännön takia
    setCareLogs((prev) => prev.filter((c) => c.plantingId !== id));
  };

  // Hoitoloki
  const addCareLog = async (entry: Omit<CareLogEntry, 'id' | 'createdAt'>) => {
    const data = await api.createCareLog(entry);
    setCareLogs((prev) => [...prev, data]);
    return data;
  };

  const deleteCareLog = async (id: string) => {
    await api.deleteCareLog(id);
    setCareLogs((prev) => prev.filter((c) => c.id !== id));
  };

  // Alakategoriat
  const addSubcategory = async (category: string, name: string) => {
    const data = await api.createSubcategory(category, name);
    setSubcategories((prev) => [...prev, data]);
    return data;
  };

  const deleteSubcategory = async (id: string) => {
    await api.deleteSubcategory(id);
    setSubcategories((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    // Data
    seeds,
    locations,
    plantings,
    careLogs,
    subcategories,
    loading,
    error,
    // Siemenet
    addSeed,
    updateSeed,
    deleteSeed,
    // Paikat
    addLocation,
    updateLocation,
    deleteLocation,
    // Istutukset
    addPlanting,
    updatePlanting,
    deletePlanting,
    // Hoitoloki
    addCareLog,
    deleteCareLog,
    // Alakategoriat
    addSubcategory,
    deleteSubcategory,
    // Refresh
    refresh: fetchAll,
  };
}
