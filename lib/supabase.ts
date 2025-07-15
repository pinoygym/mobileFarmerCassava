import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          role?: string;
          created_at?: string;
        };
      };
      farmers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          middle_initial: string | null;
          location_group: string;
          barangay: string;
          town: string;
          contact_number: string;
          land_area: number | null;
          planted_date: string | null;
          harvest_date: string | null;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          middle_initial?: string | null;
          location_group: string;
          barangay: string;
          town: string;
          contact_number: string;
          land_area?: number | null;
          planted_date?: string | null;
          harvest_date?: string | null;
          created_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          middle_initial?: string | null;
          location_group?: string;
          barangay?: string;
          town?: string;
          contact_number?: string;
          land_area?: number | null;
          planted_date?: string | null;
          harvest_date?: string | null;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
};