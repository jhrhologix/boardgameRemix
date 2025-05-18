export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      original_games: {
        Row: {
          id: string
          name: string
          publisher: string | null
          description: string | null
          min_players: number | null
          max_players: number | null
          avg_play_time: number | null
          category: 'strategy' | 'party' | 'family' | 'card' | 'dice' | 'other' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          publisher?: string | null
          description?: string | null
          min_players?: number | null
          max_players?: number | null
          avg_play_time?: number | null
          category?: 'strategy' | 'party' | 'family' | 'card' | 'dice' | 'other' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          publisher?: string | null
          description?: string | null
          min_players?: number | null
          max_players?: number | null
          avg_play_time?: number | null
          category?: 'strategy' | 'party' | 'family' | 'card' | 'dice' | 'other' | null
          created_at?: string
          updated_at?: string
        }
      }
      remixes: {
        Row: {
          id: string
          original_game_id: string
          creator_id: string
          title: string
          description: string
          rules: string
          difficulty: 'easy' | 'medium' | 'hard' | null
          min_players: number | null
          max_players: number | null
          avg_play_time: number | null
          materials_needed: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          original_game_id: string
          creator_id: string
          title: string
          description: string
          rules: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          min_players?: number | null
          max_players?: number | null
          avg_play_time?: number | null
          materials_needed?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          original_game_id?: string
          creator_id?: string
          title?: string
          description?: string
          rules?: string
          difficulty?: 'easy' | 'medium' | 'hard' | null
          min_players?: number | null
          max_players?: number | null
          avg_play_time?: number | null
          materials_needed?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          remix_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          remix_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          remix_id?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          remix_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          remix_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          remix_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: 'easy' | 'medium' | 'hard'
      game_category: 'strategy' | 'party' | 'family' | 'card' | 'dice' | 'other'
    }
  }
} 