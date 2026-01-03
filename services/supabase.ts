
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be in a .env file
// e.g. import.meta.env.VITE_SUPABASE_URL
const SUPABASE_URL = 'https://your-project-url.supabase.co'; 
const SUPABASE_ANON_KEY = 'your-anon-key';

export const isSupabaseConfigured = !SUPABASE_URL.includes('your-project-url');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
