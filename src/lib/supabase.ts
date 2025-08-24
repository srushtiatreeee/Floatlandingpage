import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          profession: string | null
          company: string | null
          location: string | null
          phone: string | null
          experience: string | null
          project_types: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          profession?: string | null
          company?: string | null
          location?: string | null
          phone?: string | null
          experience?: string | null
          project_types?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          profession?: string | null
          company?: string | null
          location?: string | null
          phone?: string | null
          experience?: string | null
          project_types?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in_progress' | 'done'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}