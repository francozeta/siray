export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  api: {
    Tables: {
      access_assets: {
        Row: {
          asset_code: string
          business_id: number
          created_at: string
          id: number
          installed_at: string | null
          last_verified_at: string | null
          organization_id: number
          service_point_id: number
          status: string
          technology: string
          updated_at: string
        }
        Insert: {
          asset_code: string
          business_id: number
          created_at?: string
          id?: never
          installed_at?: string | null
          last_verified_at?: string | null
          organization_id: number
          service_point_id: number
          status?: string
          technology?: string
          updated_at?: string
        }
        Update: {
          asset_code?: string
          business_id?: number
          created_at?: string
          id?: never
          installed_at?: string | null
          last_verified_at?: string | null
          organization_id?: number
          service_point_id?: number
          status?: string
          technology?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_assets_organization_id_business_id_service_point_id_fkey"
            columns: ["organization_id", "business_id", "service_point_id"]
            isOneToOne: false
            referencedRelation: "service_points"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          id: number
          name: string
          organization_id: number
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          organization_id: number
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          organization_id?: number
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogs: {
        Row: {
          business_id: number
          created_at: string
          id: number
          name: string
          organization_id: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: never
          name: string
          organization_id: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: never
          name?: string
          organization_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogs_organization_id_business_id_fkey"
            columns: ["organization_id", "business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      locations: {
        Row: {
          business_id: number
          created_at: string
          currency: string
          id: number
          name: string
          ordering_enabled: boolean
          organization_id: number
          slug: string
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          currency?: string
          id?: never
          name: string
          ordering_enabled?: boolean
          organization_id: number
          slug: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          currency?: string
          id?: never
          name?: string
          ordering_enabled?: boolean
          organization_id?: number
          slug?: string
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_business_id_fkey"
            columns: ["organization_id", "business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      menu_assignments: {
        Row: {
          active: boolean
          business_id: number
          created_at: string
          ends_at: string | null
          id: number
          location_id: number | null
          menu_id: number
          organization_id: number
          priority: number
          service_zone_id: number | null
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_id: number
          created_at?: string
          ends_at?: string | null
          id?: never
          location_id?: number | null
          menu_id: number
          organization_id: number
          priority?: number
          service_zone_id?: number | null
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_id?: number
          created_at?: string
          ends_at?: string | null
          id?: never
          location_id?: number | null
          menu_id?: number
          organization_id?: number
          priority?: number
          service_zone_id?: number | null
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_assignments_organization_id_business_id_location_id_fkey"
            columns: ["organization_id", "business_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
          {
            foreignKeyName: "menu_assignments_organization_id_business_id_menu_id_fkey"
            columns: ["organization_id", "business_id", "menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
          {
            foreignKeyName: "menu_assignments_organization_id_business_id_service_zone__fkey"
            columns: ["organization_id", "business_id", "service_zone_id"]
            isOneToOne: false
            referencedRelation: "service_zones"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean
          business_id: number
          created_at: string
          currency: string
          description_snapshot: string | null
          id: number
          image_path_snapshot: string | null
          menu_section_id: number
          name_snapshot: string
          organization_id: number
          price_minor: number
          product_id: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          business_id: number
          created_at?: string
          currency?: string
          description_snapshot?: string | null
          id?: never
          image_path_snapshot?: string | null
          menu_section_id: number
          name_snapshot: string
          organization_id: number
          price_minor: number
          product_id: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          business_id?: number
          created_at?: string
          currency?: string
          description_snapshot?: string | null
          id?: never
          image_path_snapshot?: string | null
          menu_section_id?: number
          name_snapshot?: string
          organization_id?: number
          price_minor?: number
          product_id?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_organization_id_business_id_menu_section_id_fkey"
            columns: ["organization_id", "business_id", "menu_section_id"]
            isOneToOne: false
            referencedRelation: "menu_sections"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
          {
            foreignKeyName: "menu_items_organization_id_business_id_product_id_fkey"
            columns: ["organization_id", "business_id", "product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      menu_sections: {
        Row: {
          business_id: number
          created_at: string
          id: number
          menu_version_id: number
          name: string
          organization_id: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: never
          menu_version_id: number
          name: string
          organization_id: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: never
          menu_version_id?: number
          name?: string
          organization_id?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_sections_organization_id_business_id_menu_version_id_fkey"
            columns: ["organization_id", "business_id", "menu_version_id"]
            isOneToOne: false
            referencedRelation: "menu_versions"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      menu_versions: {
        Row: {
          business_id: number
          created_at: string
          id: number
          menu_id: number
          organization_id: number
          published_at: string | null
          status: string
          updated_at: string
          version_number: number
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: never
          menu_id: number
          organization_id: number
          published_at?: string | null
          status?: string
          updated_at?: string
          version_number: number
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: never
          menu_id?: number
          organization_id?: number
          published_at?: string | null
          status?: string
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_versions_organization_id_business_id_menu_id_fkey"
            columns: ["organization_id", "business_id", "menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      menus: {
        Row: {
          business_id: number
          created_at: string
          id: number
          name: string
          organization_id: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: never
          name: string
          organization_id: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: never
          name?: string
          organization_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_organization_id_business_id_fkey"
            columns: ["organization_id", "business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["organization_id", "id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          organization_id: number
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: number
          role: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: number
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available: boolean
          business_id: number
          catalog_id: number
          created_at: string
          description: string | null
          id: number
          image_path: string | null
          name: string
          organization_id: number
          status: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          business_id: number
          catalog_id: number
          created_at?: string
          description?: string | null
          id?: never
          image_path?: string | null
          name: string
          organization_id: number
          status?: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          business_id?: number
          catalog_id?: number
          created_at?: string
          description?: string | null
          id?: never
          image_path?: string | null
          name?: string
          organization_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_business_id_catalog_id_fkey"
            columns: ["organization_id", "business_id", "catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      service_points: {
        Row: {
          business_id: number
          created_at: string
          id: number
          kind: string
          label: string
          ordering_enabled: boolean
          organization_id: number
          service_zone_id: number
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          id?: never
          kind: string
          label: string
          ordering_enabled?: boolean
          organization_id: number
          service_zone_id: number
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          id?: never
          kind?: string
          label?: string
          ordering_enabled?: boolean
          organization_id?: number
          service_zone_id?: number
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_points_organization_id_business_id_service_zone_id_fkey"
            columns: ["organization_id", "business_id", "service_zone_id"]
            isOneToOne: false
            referencedRelation: "service_zones"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
      service_zones: {
        Row: {
          business_id: number
          created_at: string
          fulfillment_mode: string
          id: number
          location_id: number
          name: string
          ordering_enabled: boolean
          organization_id: number
          service_mode: string
          status: string
          updated_at: string
        }
        Insert: {
          business_id: number
          created_at?: string
          fulfillment_mode: string
          id?: never
          location_id: number
          name: string
          ordering_enabled?: boolean
          organization_id: number
          service_mode: string
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: number
          created_at?: string
          fulfillment_mode?: string
          id?: never
          location_id?: number
          name?: string
          ordering_enabled?: boolean
          organization_id?: number
          service_mode?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_zones_organization_id_business_id_location_id_fkey"
            columns: ["organization_id", "business_id", "location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["organization_id", "business_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      resolve_access: {
        Args: { p_token_hash: string }
        Returns: {
          access_method: string
          business_id: number
          business_name: string
          business_slug: string
          fulfillment_mode: string
          location_id: number
          location_name: string
          organization_id: number
          service_mode: string
          service_point_id: number
          service_point_label: string
          service_zone_id: number
          service_zone_name: string
        }[]
      }
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
  api: {
    Enums: {},
  },
} as const

