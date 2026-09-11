import type { Seed, PlantingLocation, Planting, CareLogEntry, Subcategory } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  Object.assign(headers, options.headers || {});

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Ei kirjautunut');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Pyyntö epäonnistui');
  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ id: string; email: string }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Siemenet
  getSeeds: () => request<Seed[]>('/seeds'),
  createSeed: (seed: Omit<Seed, 'id' | 'createdAt'>) =>
    request<Seed>('/seeds', { method: 'POST', body: JSON.stringify(seed) }),
  updateSeed: (id: string, seed: Omit<Seed, 'id' | 'createdAt'>) =>
    request<Seed>(`/seeds/${id}`, { method: 'PUT', body: JSON.stringify(seed) }),
  deleteSeed: (id: string) => request<{ success: boolean }>(`/seeds/${id}`, { method: 'DELETE' }),

  // Alakategoriat
  getSubcategories: () => request<Subcategory[]>('/subcategories'),
  createSubcategory: (category: string, name: string) =>
    request<Subcategory>('/subcategories', { method: 'POST', body: JSON.stringify({ category, name }) }),
  deleteSubcategory: (id: string) => request<{ success: boolean }>(`/subcategories/${id}`, { method: 'DELETE' }),

  // Istutuspaikat
  getLocations: () => request<PlantingLocation[]>('/locations'),
  createLocation: (location: Omit<PlantingLocation, 'id' | 'createdAt'>) =>
    request<PlantingLocation>('/locations', { method: 'POST', body: JSON.stringify(location) }),
  updateLocation: (id: string, location: Omit<PlantingLocation, 'id' | 'createdAt'>) =>
    request<PlantingLocation>(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(location) }),
  deleteLocation: (id: string) => request<{ success: boolean }>(`/locations/${id}`, { method: 'DELETE' }),

  // Istutukset
  getPlantings: () => request<Planting[]>('/plantings'),
  createPlanting: (planting: Omit<Planting, 'id' | 'createdAt'>) =>
    request<Planting>('/plantings', { method: 'POST', body: JSON.stringify(planting) }),
  updatePlanting: (id: string, planting: Omit<Planting, 'id' | 'createdAt'>) =>
    request<Planting>(`/plantings/${id}`, { method: 'PUT', body: JSON.stringify(planting) }),
  deletePlanting: (id: string) => request<{ success: boolean }>(`/plantings/${id}`, { method: 'DELETE' }),

  // Hoitoloki
  getCareLogs: () => request<CareLogEntry[]>('/care-logs'),
  createCareLog: (entry: Omit<CareLogEntry, 'id' | 'createdAt'>) =>
    request<CareLogEntry>('/care-logs', { method: 'POST', body: JSON.stringify(entry) }),
  deleteCareLog: (id: string) => request<{ success: boolean }>(`/care-logs/${id}`, { method: 'DELETE' }),

  // Kuvat - palauttaa täyden URL:n (API:n origin + palvelimen antama polku)
  uploadImage: async (blob: Blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    const { url } = await request<{ url: string }>('/images', { method: 'POST', body: formData });
    return `${API_ORIGIN}${url}`;
  },
};
