import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Seed, PlantingLocation, Planting, CareLogEntry, Subcategory, SeedCategory } from '../types';

// Muunnosfunktiot tietokannan ja sovelluksen välillä
function dbToSeed(row: any): Seed {
  return {
    id: row.id,
    nameFi: row.name_fi,
    variety: row.variety || '',
    category: row.category,
    subcategory: row.subcategory || '',
    plantingTime: {
      startMonth: row.planting_start_month,
      endMonth: row.planting_end_month,
      indoor: row.planting_indoor,
    },
    growingInstructions: row.growing_instructions || '',
    imageUrl: row.image_url || '',
    createdAt: row.created_at,
  };
}

function seedToDb(seed: Omit<Seed, 'id' | 'createdAt'>) {
  return {
    name_fi: seed.nameFi,
    variety: seed.variety || null,
    category: seed.category,
    subcategory: seed.subcategory || null,
    planting_start_month: seed.plantingTime.startMonth,
    planting_end_month: seed.plantingTime.endMonth,
    planting_indoor: seed.plantingTime.indoor,
    growing_instructions: seed.growingInstructions || null,
    image_url: seed.imageUrl || null,
  };
}

function dbToLocation(row: any): PlantingLocation {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    sunExposure: row.sun_exposure,
    soilType: row.soil_type || '',
    createdAt: row.created_at,
  };
}

function locationToDb(location: Omit<PlantingLocation, 'id' | 'createdAt'>) {
  return {
    name: location.name,
    description: location.description || null,
    sun_exposure: location.sunExposure,
    soil_type: location.soilType || null,
  };
}

function dbToPlanting(row: any): Planting {
  return {
    id: row.id,
    seedId: row.seed_id,
    locationId: row.location_id,
    plantedDate: row.planted_date,
    quantity: row.quantity,
    notes: row.notes || '',
    status: row.status,
    createdAt: row.created_at,
  };
}

function plantingToDb(planting: Omit<Planting, 'id' | 'createdAt'>) {
  return {
    seed_id: planting.seedId,
    location_id: planting.locationId,
    planted_date: planting.plantedDate,
    quantity: planting.quantity,
    notes: planting.notes || null,
    status: planting.status,
  };
}

function dbToCareLog(row: any): CareLogEntry {
  return {
    id: row.id,
    plantingId: row.planting_id,
    date: row.date,
    type: row.type,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

function careLogToDb(entry: Omit<CareLogEntry, 'id' | 'createdAt'>) {
  return {
    planting_id: entry.plantingId,
    date: entry.date,
    type: entry.type,
    notes: entry.notes || null,
  };
}

function dbToSubcategory(row: any): Subcategory {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    createdAt: row.created_at,
  };
}

export function useSupabaseData() {
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
      const [seedsRes, locationsRes, plantingsRes, careLogsRes, subcategoriesRes] = await Promise.all([
        supabase.from('seeds').select('*').order('name_fi'),
        supabase.from('locations').select('*').order('name'),
        supabase.from('plantings').select('*').order('created_at', { ascending: false }),
        supabase.from('care_logs').select('*').order('date', { ascending: false }),
        supabase.from('subcategories').select('*').order('name'),
      ]);

      if (seedsRes.error) throw seedsRes.error;
      if (locationsRes.error) throw locationsRes.error;
      if (plantingsRes.error) throw plantingsRes.error;
      if (careLogsRes.error) throw careLogsRes.error;
      if (subcategoriesRes.error) throw subcategoriesRes.error;

      setSeeds(seedsRes.data.map(dbToSeed));
      setLocations(locationsRes.data.map(dbToLocation));
      setPlantings(plantingsRes.data.map(dbToPlanting));
      setCareLogs(careLogsRes.data.map(dbToCareLog));
      setSubcategories(subcategoriesRes.data.map(dbToSubcategory));
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Siemenet
  const addSeed = async (seed: Omit<Seed, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('seeds')
      .insert(seedToDb(seed))
      .select()
      .single();
    if (error) throw error;
    setSeeds((prev) => [...prev, dbToSeed(data)]);
    return dbToSeed(data);
  };

  const updateSeed = async (id: string, seed: Omit<Seed, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('seeds')
      .update(seedToDb(seed))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setSeeds((prev) => prev.map((s) => (s.id === id ? dbToSeed(data) : s)));
  };

  const deleteSeed = async (id: string) => {
    const seed = seeds.find((s) => s.id === id);
    const { error } = await supabase.from('seeds').delete().eq('id', id);
    if (error) throw error;
    setSeeds((prev) => prev.filter((s) => s.id !== id));
    if (seed?.imageUrl && seed.imageUrl.includes('seed-images')) {
      const path = seed.imageUrl.split('/seed-images/')[1];
      if (path) await supabase.storage.from('seed-images').remove([path]);
    }
  };

  // Istutuspaikat
  const addLocation = async (location: Omit<PlantingLocation, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('locations')
      .insert(locationToDb(location))
      .select()
      .single();
    if (error) throw error;
    setLocations((prev) => [...prev, dbToLocation(data)]);
    return dbToLocation(data);
  };

  const updateLocation = async (id: string, location: Omit<PlantingLocation, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('locations')
      .update(locationToDb(location))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setLocations((prev) => prev.map((l) => (l.id === id ? dbToLocation(data) : l)));
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  // Istutukset
  const addPlanting = async (planting: Omit<Planting, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('plantings')
      .insert(plantingToDb(planting))
      .select()
      .single();
    if (error) throw error;
    setPlantings((prev) => [...prev, dbToPlanting(data)]);
    return dbToPlanting(data);
  };

  const updatePlanting = async (id: string, planting: Omit<Planting, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('plantings')
      .update(plantingToDb(planting))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setPlantings((prev) => prev.map((p) => (p.id === id ? dbToPlanting(data) : p)));
  };

  const deletePlanting = async (id: string) => {
    const { error } = await supabase.from('plantings').delete().eq('id', id);
    if (error) throw error;
    setPlantings((prev) => prev.filter((p) => p.id !== id));
    // Hoitologit poistuvat automaattisesti CASCADE-säännön takia
    setCareLogs((prev) => prev.filter((c) => c.plantingId !== id));
  };

  // Hoitoloki
  const addCareLog = async (entry: Omit<CareLogEntry, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('care_logs')
      .insert(careLogToDb(entry))
      .select()
      .single();
    if (error) throw error;
    setCareLogs((prev) => [...prev, dbToCareLog(data)]);
    return dbToCareLog(data);
  };

  const deleteCareLog = async (id: string) => {
    const { error } = await supabase.from('care_logs').delete().eq('id', id);
    if (error) throw error;
    setCareLogs((prev) => prev.filter((c) => c.id !== id));
  };

  // Alakategoriat
  const addSubcategory = async (category: SeedCategory, name: string) => {
    const { data, error } = await supabase
      .from('subcategories')
      .insert({ category, name })
      .select()
      .single();
    if (error) throw error;
    setSubcategories((prev) => [...prev, dbToSubcategory(data)]);
    return dbToSubcategory(data);
  };

  const deleteSubcategory = async (id: string) => {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
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
