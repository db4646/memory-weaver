export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      consolidation_logs: {
        Row: {
          consolidation_type: string
          created_at: string
          details: Json | null
          id: string
          memories_affected: number | null
          user_id: string | null
        }
        Insert: {
          consolidation_type: string
          created_at?: string
          details?: Json | null
          id?: string
          memories_affected?: number | null
          user_id?: string | null
        }
        Update: {
          consolidation_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          memories_affected?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      episodic_memories: {
        Row: {
          access_count: number | null
          context_after: string | null
          context_before: string | null
          created_at: string
          decay_factor: number | null
          emotional_valence: number | null
          event_details: Json | null
          event_summary: string
          event_type: string
          id: string
          importance_score: number | null
          last_accessed_at: string | null
          related_semantic_ids: string[] | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          decay_factor?: number | null
          emotional_valence?: number | null
          event_details?: Json | null
          event_summary: string
          event_type: string
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          related_semantic_ids?: string[] | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          context_after?: string | null
          context_before?: string | null
          created_at?: string
          decay_factor?: number | null
          emotional_valence?: number | null
          event_details?: Json | null
          event_summary?: string
          event_type?: string
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          related_semantic_ids?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          memories_referenced: string[] | null
          role: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          memories_referenced?: string[] | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          memories_referenced?: string[] | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      research_papers: {
        Row: {
          abstract: string | null
          authors: string[] | null
          created_at: string
          doi: string | null
          field_of_study: string | null
          file_type: string | null
          file_url: string | null
          id: string
          importance_score: number | null
          keywords: string[] | null
          last_read_at: string | null
          notes: string | null
          publication_date: string | null
          read_count: number | null
          title: string
          updated_at: string
          url: string | null
          user_id: string | null
        }
        Insert: {
          abstract?: string | null
          authors?: string[] | null
          created_at?: string
          doi?: string | null
          field_of_study?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          importance_score?: number | null
          keywords?: string[] | null
          last_read_at?: string | null
          notes?: string | null
          publication_date?: string | null
          read_count?: number | null
          title: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Update: {
          abstract?: string | null
          authors?: string[] | null
          created_at?: string
          doi?: string | null
          field_of_study?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          importance_score?: number | null
          keywords?: string[] | null
          last_read_at?: string | null
          notes?: string | null
          publication_date?: string | null
          read_count?: number | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      semantic_memories: {
        Row: {
          access_count: number | null
          category: string | null
          content: string
          created_at: string
          decay_factor: number | null
          embedding_text: string | null
          id: string
          importance_score: number | null
          last_accessed_at: string | null
          metadata: Json | null
          source_reference: string | null
          source_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          category?: string | null
          content: string
          created_at?: string
          decay_factor?: number | null
          embedding_text?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          metadata?: Json | null
          source_reference?: string | null
          source_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          category?: string | null
          content?: string
          created_at?: string
          decay_factor?: number | null
          embedding_text?: string | null
          id?: string
          importance_score?: number | null
          last_accessed_at?: string | null
          metadata?: Json | null
          source_reference?: string | null
          source_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_memory_decay: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
