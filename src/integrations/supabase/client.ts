// client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://blmuvicbfduadqsrarhn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbXV2aWNiZmR1YWRxc3JhcmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTc1MTEsImV4cCI6MjA2MTA3MzUxMX0.Lwp5KDKNf20lqisu1eYix-dikjvuk5Crz3c8EYaYffA";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
