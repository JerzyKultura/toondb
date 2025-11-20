// TypeScript types for Supabase database schema

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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          organization: string | null
          api_quota: number
          storage_quota_gb: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          organization?: string | null
          api_quota?: number
          storage_quota_gb?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          organization?: string | null
          api_quota?: number
          storage_quota_gb?: number
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          key_prefix: string
          name: string
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          key_prefix: string
          name: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          key_prefix?: string
          name?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      toon_tables: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          schema_fields: Json
          row_count: number
          data: Json
          toon_content: string | null
          delimiter: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          schema_fields: Json
          row_count?: number
          data: Json
          toon_content?: string | null
          delimiter?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          schema_fields?: Json
          row_count?: number
          data?: Json
          toon_content?: string | null
          delimiter?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      toon_files: {
        Row: {
          id: string
          user_id: string
          table_id: string | null
          filename: string
          file_size: number
          storage_path: string
          content_type: string
          version: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          table_id?: string | null
          filename: string
          file_size: number
          storage_path: string
          content_type?: string
          version?: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          table_id?: string | null
          filename?: string
          file_size?: number
          storage_path?: string
          content_type?: string
          version?: number
          uploaded_at?: string
        }
      }
      query_history: {
        Row: {
          id: string
          user_id: string
          table_id: string | null
          query_text: string
          execution_time_ms: number | null
          result_rows: number | null
          status: 'success' | 'error'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          table_id?: string | null
          query_text: string
          execution_time_ms?: number | null
          result_rows?: number | null
          status: 'success' | 'error'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          table_id?: string | null
          query_text?: string
          execution_time_ms?: number | null
          result_rows?: number | null
          status?: 'success' | 'error'
          error_message?: string | null
          created_at?: string
        }
      }
      saved_queries: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          query_text: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          query_text: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          query_text?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string | null
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      usage_metrics: {
        Row: {
          id: string
          user_id: string
          date: string
          api_calls: number
          storage_used_mb: number
          bandwidth_used_mb: number
          query_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          api_calls?: number
          storage_used_mb?: number
          bandwidth_used_mb?: number
          query_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          api_calls?: number
          storage_used_mb?: number
          bandwidth_used_mb?: number
          query_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_audit_event: {
        Args: {
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

