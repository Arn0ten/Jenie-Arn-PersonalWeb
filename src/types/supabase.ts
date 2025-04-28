import type { RealtimeChannel } from "@supabase/supabase-js";

export type TimelinePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: {
    id: number;
    date: string;
    title: string;
    description: string;
    images: string[];
    created_at: string;
    is_monthsary: boolean;
  } | null;
  old: {
    id: number;
    date: string;
    title: string;
    description: string;
    images: string[];
    created_at: string;
    is_monthsary: boolean;
  } | null;
};

export type GalleryPayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: {
    id: number;
    monthsary_date: string;
    title: string;
    description: string;
    images: string[];
    created_at: string;
  } | null;
  old: {
    id: number;
    monthsary_date: string;
    title: string;
    description: string;
    images: string[];
    created_at: string;
  } | null;
};

export type SupabaseSubscription = RealtimeChannel;
