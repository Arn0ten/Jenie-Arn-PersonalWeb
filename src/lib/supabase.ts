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

export type ImageLike = {
  id: number;
  image_url: string;
  ip_address: string;
  created_at: string;
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

// Image likes functions
export const getImageLikes = async (imageUrl: string): Promise<number> => {
  const { count, error } = await supabase
    .from("image_likes")
    .select("*", { count: "exact", head: true })
    .eq("image_url", imageUrl);

  if (error) {
    console.error("Error fetching image likes:", error);
    return 0;
  }

  return count || 0;
};

export const getLikedImages = async (ipAddress: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("image_likes")
    .select("image_url")
    .eq("ip_address", ipAddress);

  if (error) {
    console.error("Error fetching liked images:", error);
    return [];
  }

  return data?.map((like) => like.image_url) || [];
};

export const toggleImageLike = async (
  imageUrl: string,
  ipAddress: string,
): Promise<boolean> => {
  // Check if the user already liked this image
  const { data: existingLike, error: checkError } = await supabase
    .from("image_likes")
    .select("id")
    .eq("image_url", imageUrl)
    .eq("ip_address", ipAddress)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows returned" which is expected if not liked
    console.error("Error checking existing like:", checkError);
    return false;
  }

  // If already liked, remove the like
  if (existingLike) {
    const { error: deleteError } = await supabase
      .from("image_likes")
      .delete()
      .eq("id", existingLike.id);

    if (deleteError) {
      console.error("Error removing like:", deleteError);
      return false;
    }
    return false; // Return false to indicate the image is now unliked
  }

  // If not liked, add a new like
  const { error: insertError } = await supabase
    .from("image_likes")
    .insert([{ image_url: imageUrl, ip_address: ipAddress }]);

  if (insertError) {
    console.error("Error adding like:", insertError);
    return false;
  }

  return true; // Return true to indicate the image is now liked
};

// Function to get visitor's IP address
export const getVisitorIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    // Fallback to a session-based identifier if IP can't be determined
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
};

// Function to get all image likes counts at once (more efficient)
export const getAllImageLikesCounts = async (
  imageUrls: string[],
): Promise<Record<string, number>> => {
  if (!imageUrls.length) return {};

  const { data, error } = await supabase
    .from("image_likes")
    .select("image_url")
    .in("image_url", imageUrls);

  if (error) {
    console.error("Error fetching all image likes:", error);
    return {};
  }

  // Count occurrences of each image URL
  const counts: Record<string, number> = {};
  imageUrls.forEach((url) => (counts[url] = 0)); // Initialize all to 0

  data?.forEach((like) => {
    if (counts[like.image_url] !== undefined) {
      counts[like.image_url]++;
    } else {
      counts[like.image_url] = 1;
    }
  });

  return counts;
};
