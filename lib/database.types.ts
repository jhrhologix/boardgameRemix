export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bgg_games: {
        Row: {
          id: string
          bgg_id: string
          name: string
          year_published: number | null
          image_url: string | null
          bgg_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bgg_id: string
          name: string
          year_published?: number | null
          image_url?: string | null
          bgg_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bgg_id?: string
          name?: string
          year_published?: number | null
          image_url?: string | null
          bgg_url?: string | null
          created_at?: string
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
      hashtags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
        }
      }
      remix_games: {
        Row: {
          id: string
          remix_id: string
          bgg_game_id: string
          created_at: string
        }
        Insert: {
          id?: string
          remix_id: string
          bgg_game_id: string
          created_at?: string
        }
        Update: {
          id?: string
          remix_id?: string
          bgg_game_id?: string
          created_at?: string
        }
      }
      remix_hashtags: {
        Row: {
          id: string
          remix_id: string
          hashtag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          remix_id: string
          hashtag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          remix_id?: string
          hashtag_id?: string
          created_at?: string
        }
      }
      remixes: {
        Row: {
          id: string
          title: string
          description: string
          difficulty: string
          rules: string
          setup_instructions: string
          user_id: string
          created_at: string
          youtube_url: string | null
          max_players: number | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          difficulty: string
          rules: string
          setup_instructions: string
          user_id: string
          created_at?: string
          youtube_url?: string | null
          max_players?: number | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          difficulty?: string
          rules?: string
          setup_instructions?: string
          user_id?: string
          created_at?: string
          youtube_url?: string | null
          max_players?: number | null
        }
      }
      comments: {
        Row: {
          id: string
          remix_id: string
          user_id: string
          content: string
          created_at: string
          parent_id: string | null
          is_resolved: boolean
          is_pinned: boolean
        }
        Insert: {
          id?: string
          remix_id: string
          user_id: string
          content: string
          created_at?: string
          parent_id?: string | null
          is_resolved?: boolean
          is_pinned?: boolean
        }
        Update: {
          id?: string
          remix_id?: string
          user_id?: string
          content?: string
          created_at?: string
          parent_id?: string | null
          is_resolved?: boolean
          is_pinned?: boolean
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
      [_ in never]: never
    }
  }
}
