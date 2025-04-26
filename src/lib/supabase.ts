
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cezsixgyusytlxnyhdvm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlenNpeGd5dXN5dGx4bnloZHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTIzOTEsImV4cCI6MjA2MTA2ODM5MX0.uG29vpjbsCy9P69GAi-NNLBEZBaztsJMm_Wlq6nRETc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TimelineEntry = {
  id: number;
  date: string;
  title: string;
  description: string;
  images: string[];
  created_at: string;
  is_monthsary: boolean;
};

export type GalleryItem = {
  id: number;
  monthsary_date: string;
  title: string;
  description: string;
  images: string[];
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  password: string;
};

// Authentication functions
export const checkAuth = async (password: string, name: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('password', password)
    .eq('name', name)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
};

// Functions to manage timeline entries
export const getTimelineEntries = async (): Promise<TimelineEntry[]> => {
  const { data, error } = await supabase
    .from('timeline')
    .select('*')
    .order('date', { ascending: false });
  
  if (error || !data) {
    return [];
  }
  
  return data;
};

export const createTimelineEntry = async (entry: Omit<TimelineEntry, 'id' | 'created_at'>) => {
  return await supabase.from('timeline').insert([entry]);
};

export const updateTimelineEntry = async (id: number, updates: Partial<TimelineEntry>) => {
  return await supabase.from('timeline').update(updates).eq('id', id);
};

export const deleteTimelineEntry = async (id: number) => {
  return await supabase.from('timeline').delete().eq('id', id);
};

// Functions to manage gallery items
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('monthsary_date', { ascending: false });
  
  if (error || !data) {
    return [];
  }
  
  return data;
};

export const createGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
  return await supabase.from('gallery').insert([item]);
};

export const updateGalleryItem = async (id: number, updates: Partial<GalleryItem>) => {
  return await supabase.from('gallery').update(updates).eq('id', id);
};

export const deleteGalleryItem = async (id: number) => {
  return await supabase.from('gallery').delete().eq('id', id);
};

// Function to upload image to Supabase storage
export const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('couple-images')
    .upload(`${path}/${file.name}`, file);
  
  if (error) {
    throw error;
  }
  
  return supabase.storage.from('couple-images').getPublicUrl(`${path}/${file.name}`).data.publicUrl;
};
