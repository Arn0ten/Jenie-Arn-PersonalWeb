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

// Function to extract the storage path from a public URL
export const getStoragePathFromUrl = (url: string): string | null => {
  try {
    // The URL format is typically: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[path]
    const storageUrlPattern = /\/storage\/v1\/object\/public\/([^?]+)/;
    const match = url.match(storageUrlPattern);

    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return null;
  }
};

// Add this function to properly delete images from Supabase storage
export const deleteImageFromStorageAndDatabase = async (
  imageUrl: string,
): Promise<boolean> => {
  try {
    const path = getStoragePathFromUrl(imageUrl);
    if (!path) {
      console.error("Could not extract storage path from URL:", imageUrl);
      return false;
    }

    // The path includes the bucket name, so we need to split it
    const [bucket, ...pathParts] = path.split("/");
    const filePath = pathParts.join("/");

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      return false;
    }

    // Also delete any likes associated with this image
    const { error: likesError } = await supabase
      .from("image_likes")
      .delete()
      .eq("image_url", imageUrl);

    if (likesError) {
      console.error("Error deleting image likes:", likesError);
      // We continue even if likes deletion fails
    }

    return true;
  } catch (error) {
    console.error("Error in deleteImageFromStorageAndDatabase:", error);
    return false;
  }
};

// Update the existing function to use the new one
export const deleteImageFromStorage = async (
  imageUrl: string,
): Promise<boolean> => {
  return deleteImageFromStorageAndDatabase(imageUrl);
};

// Function to delete multiple images from storage
export const deleteImagesFromStorage = async (
  imageUrls: string[],
): Promise<boolean[]> => {
  const results = await Promise.all(
    imageUrls.map((url) => deleteImageFromStorage(url)),
  );
  return results;
};

export const deleteTimelineEntry = async (id: number) => {
  // First, get the entry to access its images
  const { data: entry, error: fetchError } = await supabase
    .from("timeline")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError || !entry) {
    console.error("Error fetching timeline entry for deletion:", fetchError);
    return { error: fetchError };
  }

  // Delete images from storage if they exist
  if (entry.images && entry.images.length > 0) {
    await deleteImagesFromStorage(entry.images);
  }

  // Then delete the entry from the database
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
  // First, get the gallery item to access its images
  const { data: item, error: fetchError } = await supabase
    .from("gallery")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    console.error("Error fetching gallery item for deletion:", fetchError);
    return { error: fetchError };
  }

  // Delete images from storage if they exist
  if (item.images && item.images.length > 0) {
    await deleteImagesFromStorage(item.images);
  }

  // Then delete the item from the database
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

// Add functions for real-time subscriptions
export const subscribeToTimelineChanges = (
  callback: (payload: any) => void,
) => {
  return supabase
    .channel("timeline-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "timeline",
      },
      (payload) => {
        callback(payload);
      },
    )
    .subscribe();
};

export const subscribeToGalleryChanges = (callback: (payload: any) => void) => {
  return supabase
    .channel("gallery-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "gallery",
      },
      (payload) => {
        callback(payload);
      },
    )
    .subscribe();
};

// Add function to update image in storage when editing
export const updateImageInStorage = async (
  oldImageUrl: string,
  newFile: File,
): Promise<string> => {
  try {
    // First delete the old image
    await deleteImageFromStorage(oldImageUrl);

    // Extract path components from the old URL to maintain the same structure
    const path = getStoragePathFromUrl(oldImageUrl);
    if (!path) {
      throw new Error("Could not extract storage path from URL");
    }

    const [bucket, ...pathParts] = path.split("/");
    const directory = pathParts.slice(0, -1).join("/");

    // Upload the new image with a timestamp to avoid name conflicts
    const timestamp = new Date().getTime();
    const newPath = `${directory}/${timestamp}_${newFile.name}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(newPath, newFile);

    if (error) {
      throw error;
    }

    return supabase.storage.from(bucket).getPublicUrl(newPath).data.publicUrl;
  } catch (error) {
    console.error("Error updating image in storage:", error);
    throw error;
  }
};
