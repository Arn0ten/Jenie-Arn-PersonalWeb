import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://blmuvicbfduadqsrarhn.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbXV2aWNiZmR1YWRxc3JhcmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTc1MTEsImV4cCI6MjA2MTA3MzUxMX0.Lwp5KDKNf20lqisu1eYix-dikjvuk5Crz3c8EYaYffA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  },
});

// Data types
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
export const checkAuth = async (
  password: string,
  name: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("password", password)
    .eq("name", name)
    .single();

  if (error || !data) {
    console.error("Auth error:", error);
    return false;
  }

  return true;
};

// Functions to manage timeline entries
export const getTimelineEntries = async (): Promise<TimelineEntry[]> => {
  const { data, error } = await supabase
    .from("timeline")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching timeline entries:", error);
    return [];
  }

  return data || [];
};

export const createTimelineEntry = async (
  entry: Omit<TimelineEntry, "id" | "created_at">,
) => {
  const { data, error } = await supabase.from("timeline").insert([entry]);
  if (error) console.error("Error creating timeline entry:", error);
  return { data, error };
};

export const updateTimelineEntry = async (
  id: number,
  updates: Partial<TimelineEntry>,
) => {
  const { data, error } = await supabase
    .from("timeline")
    .update(updates)
    .eq("id", id);
  if (error) console.error("Error updating timeline entry:", error);
  return { data, error };
};

export const deleteTimelineEntry = async (id: number) => {
  const { error } = await supabase.from("timeline").delete().eq("id", id);
  if (error) console.error("Error deleting timeline entry:", error);
  return { error };
};

// Functions to manage gallery items
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("monthsary_date", { ascending: false });

  if (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }

  return data || [];
};

export const createGalleryItem = async (
  item: Omit<GalleryItem, "id" | "created_at">,
) => {
  const { data, error } = await supabase.from("gallery").insert([item]);
  if (error) console.error("Error creating gallery item:", error);
  return { data, error };
};

export const updateGalleryItem = async (
  id: number,
  updates: Partial<GalleryItem>,
) => {
  const { data, error } = await supabase
    .from("gallery")
    .update(updates)
    .eq("id", id);
  if (error) console.error("Error updating gallery item:", error);
  return { data, error };
};

export const deleteGalleryItem = async (id: number) => {
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) console.error("Error deleting gallery item:", error);
  return { error };
};

// Function to upload image to Supabase storage
export const uploadImage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("couple-images")
      .upload(`${path}/${file.name}`, file);

    if (error) {
      console.error("Image upload error:", error);
      throw error;
    }

    return supabase.storage
      .from("couple-images")
      .getPublicUrl(`${path}/${file.name}`).data.publicUrl;
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
};
