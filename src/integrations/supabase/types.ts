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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          blush_category: string | null
          blush_color: string | null
          blush_confidence: number | null
          created_at: string
          eyeshadow_category: string | null
          eyeshadow_color: string | null
          eyeshadow_confidence: number | null
          foundation_category: string | null
          foundation_confidence: number | null
          foundation_finish: string | null
          id: string
          lip_category: string | null
          lip_color: string | null
          lip_confidence: number | null
          look_id: string
          raw_json: Json | null
          skin_tone: string | null
          skin_tone_confidence: number | null
          style_tags: string[] | null
          undertone: string | null
          undertone_confidence: number | null
        }
        Insert: {
          blush_category?: string | null
          blush_color?: string | null
          blush_confidence?: number | null
          created_at?: string
          eyeshadow_category?: string | null
          eyeshadow_color?: string | null
          eyeshadow_confidence?: number | null
          foundation_category?: string | null
          foundation_confidence?: number | null
          foundation_finish?: string | null
          id?: string
          lip_category?: string | null
          lip_color?: string | null
          lip_confidence?: number | null
          look_id: string
          raw_json?: Json | null
          skin_tone?: string | null
          skin_tone_confidence?: number | null
          style_tags?: string[] | null
          undertone?: string | null
          undertone_confidence?: number | null
        }
        Update: {
          blush_category?: string | null
          blush_color?: string | null
          blush_confidence?: number | null
          created_at?: string
          eyeshadow_category?: string | null
          eyeshadow_color?: string | null
          eyeshadow_confidence?: number | null
          foundation_category?: string | null
          foundation_confidence?: number | null
          foundation_finish?: string | null
          id?: string
          lip_category?: string | null
          lip_color?: string | null
          lip_confidence?: number | null
          look_id?: string
          raw_json?: Json | null
          skin_tone?: string | null
          skin_tone_confidence?: number | null
          style_tags?: string[] | null
          undertone?: string | null
          undertone_confidence?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: true
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          look_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          look_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          look_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
        ]
      }
      look_products: {
        Row: {
          look_id: string
          match_confidence: number | null
          product_id: string
          reason: string | null
        }
        Insert: {
          look_id: string
          match_confidence?: number | null
          product_id: string
          reason?: string | null
        }
        Update: {
          look_id?: string
          match_confidence?: number | null
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "look_products_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "look_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      looks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_public: boolean
          slug: string
          storage_path: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_public?: boolean
          slug: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_public?: boolean
          slug?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "looks_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string | null
          finish: string | null
          id: string
          image_url: string | null
          name: string
          price_inr: number
          retailer_name: string
          retailer_url: string
          shade: string | null
          shade_family: string | null
          subcategory: string | null
          undertone: string | null
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description?: string | null
          finish?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_inr: number
          retailer_name: string
          retailer_url: string
          shade?: string | null
          shade_family?: string | null
          subcategory?: string | null
          undertone?: string | null
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          finish?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_inr?: number
          retailer_name?: string
          retailer_url?: string
          shade?: string | null
          shade_family?: string | null
          subcategory?: string | null
          undertone?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string
          look_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          look_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          look_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_look_id_fkey"
            columns: ["look_id"]
            isOneToOne: false
            referencedRelation: "looks"
            referencedColumns: ["id"]
          },
        ]
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
