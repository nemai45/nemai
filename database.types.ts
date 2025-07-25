export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      add_on: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price: number
          service_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "add_on_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          artist_id: string
          cover_image: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          artist_id?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          artist_id?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      area: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      artist_profile: {
        Row: {
          address: string
          area: number
          bio: string | null
          booking_month_limit: number
          business_name: string
          created_at: string
          disabled: boolean
          discount: number
          id: string
          is_available_at_client_home: boolean
          is_featured: boolean
          is_work_from_home: boolean
          location: string | null
          logo: string | null
          no_of_artists: number
          upi_id: string
        }
        Insert: {
          address: string
          area: number
          bio?: string | null
          booking_month_limit?: number
          business_name: string
          created_at?: string
          disabled?: boolean
          discount?: number
          id?: string
          is_available_at_client_home?: boolean
          is_featured?: boolean
          is_work_from_home?: boolean
          location?: string | null
          logo?: string | null
          no_of_artists?: number
          upi_id?: string
        }
        Update: {
          address?: string
          area?: number
          bio?: string | null
          booking_month_limit?: number
          business_name?: string
          created_at?: string
          disabled?: boolean
          discount?: number
          id?: string
          is_available_at_client_home?: boolean
          is_featured?: boolean
          is_work_from_home?: boolean
          location?: string | null
          logo?: string | null
          no_of_artists?: number
          upi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_profile_area_fkey"
            columns: ["area"]
            isOneToOne: false
            referencedRelation: "area"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          artist_id: string
          created_at: string
          day: number
          end_time: number
          id: string
          start_time: number
        }
        Insert: {
          artist_id?: string
          created_at?: string
          day: number
          end_time: number
          id?: string
          start_time: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          day?: number
          end_time?: number
          id?: string
          start_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_date: {
        Row: {
          artist_id: string
          created_at: string
          date: string
          end_time: number
          id: string
          no_of_artist: number
          start_time: number
        }
        Insert: {
          artist_id?: string
          created_at?: string
          date: string
          end_time: number
          id?: string
          no_of_artist: number
          start_time: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          date?: string
          end_time?: number
          id?: string
          no_of_artist?: number
          start_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "blocked_date_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      booked_add_on: {
        Row: {
          add_on_id: string
          booking_id: string
          count: number
          created_at: string
          id: string
        }
        Insert: {
          add_on_id?: string
          booking_id?: string
          count: number
          created_at?: string
          id?: string
        }
        Update: {
          add_on_id?: string
          booking_id?: string
          count?: number
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booked_add_on_add_on_id_fkey"
            columns: ["add_on_id"]
            isOneToOne: false
            referencedRelation: "add_on"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booked_add_on_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_images: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          url: string
        }
        Insert: {
          artist_id?: string
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverImages_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          album_id: string
          created_at: string
          id: string
          url: string
        }
        Insert: {
          album_id?: string
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
        }
        Insert: {
          artist_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      order: {
        Row: {
          cancel_message: string | null
          client_address: string | null
          created_at: string
          date: string
          id: string
          paid_amount: number
          payment_id: string | null
          promo_code: string | null
          razorpay_id: string
          service_id: string
          start_time: number
          status: Database["public"]["Enums"]["status"]
          total_amount: number
          user_id: string
          discount: number,
          promo_code_discount: number
        }
        Insert: {
          cancel_message?: string | null
          client_address?: string | null
          created_at?: string
          date: string
          id?: string
          paid_amount: number
          payment_id?: string | null
          promo_code?: string | null
          razorpay_id: string
          service_id?: string
          start_time: number
          status?: Database["public"]["Enums"]["status"]
          total_amount: number
          user_id?: string
          discount?: number
          promo_code_discount?: number
        }
        Update: {
          cancel_message?: string | null
          client_address?: string | null
          created_at?: string
          date?: string
          id?: string
          paid_amount?: number
          payment_id?: string | null
          promo_code?: string | null
          razorpay_id?: string
          service_id?: string
          start_time?: number
          status?: Database["public"]["Enums"]["status"]
          total_amount?: number
          user_id?: string
          discount?: number
          promo_code_discount?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_promo_code_fkey"
            columns: ["promo_code"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          artist_id: string
          created_at: string
          id: string
          notes: string
        }
        Insert: {
          amount: number
          artist_id?: string
          created_at?: string
          id?: string
          notes: string
        }
        Update: {
          amount?: number
          artist_id?: string
          created_at?: string
          id?: string
          notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount: number
          id: string
          is_disabled: boolean
        }
        Insert: {
          code: string
          created_at?: string
          discount: number
          id?: string
          is_disabled?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          discount?: number
          id?: string
          is_disabled?: boolean
        }
        Relationships: []
      }
      review: {
        Row: {
          created_at: string
          id: string
          order_id: string
          rating: number
          review: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string
          rating: number
          review?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          review?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          artist_id: string
          created_at: string
          description: string | null
          duration: number
          id: string
          name: string
          price: number
        }
        Insert: {
          artist_id: string
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
        }
        Update: {
          artist_id?: string
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artist_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_phone_verified: boolean
          last_name: string | null
          onboarded: boolean
          phone_no: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_phone_verified?: boolean
          last_name?: string | null
          onboarded?: boolean
          phone_no?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_phone_verified?: boolean
          last_name?: string | null
          onboarded?: boolean
          phone_no?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      whitelist: {
        Row: {
          added_by: string | null
          created_at: string
          email: string
          role: Database["public"]["Enums"]["whitelist_role"]
          status: Database["public"]["Enums"]["whitelist_status"]
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          email: string
          role: Database["public"]["Enums"]["whitelist_role"]
          status?: Database["public"]["Enums"]["whitelist_status"]
        }
        Update: {
          added_by?: string | null
          created_at?: string
          email?: string
          role?: Database["public"]["Enums"]["whitelist_role"]
          status?: Database["public"]["Enums"]["whitelist_status"]
        }
        Relationships: [
          {
            foreignKeyName: "whitelist_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_albums_with_image_count: {
        Args: { user_id: string }
        Returns: {
          album_id: string
          album_name: string
          image_count: number
          cover_image: string
        }[]
      }
      get_monthly_income_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_income_current_month: number
          total_income_last_month: number
          service_wise_income: Json
        }[]
      }
      onboard_user: {
        Args:
          | {
              user_id: string
              role: string
              first_name: string
              last_name: string
              phone_no: string
              business_name: string | null 
              logo: string | null
              address: string | null
              bio: string | null
              upi_id: string | null
              no_of_artists: number | null
              booking_month_limit: number | null
              location: string | null
              area: number | null
            }
          | {
              user_id: string
              role: string
              first_name: string
              last_name: string
              phone_no: string
              business_name: string | null
              logo: string | null
              address: string | null
              bio: string | null
              upi_id: string | null
              no_of_artists: number | null
              booking_month_limit: number | null
              location: string | null
              area: number | null
              is_work_from_home: boolean | null
              is_available_at_client_home: boolean | null
            }
        Returns: undefined
      }
      store_artist: {
        Args: {
          business_name: string
          logo: string
          address: string
          bio: string
          upi_id: string
          no_of_artists: number
          booking_month_limit: number
          location: string
          lat: number
          lng: number
        }
        Returns: undefined
      }
    }
    Enums: {
      status: "paid" | "pending" | "cancel_requested" | "cancelled"
      user_role: "customer" | "artist" | "admin"
      whitelist_role: "artist" | "admin"
      whitelist_status: "inactive" | "active" | "deactive"
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
    Enums: {
      status: ["paid", "pending", "cancel_requested", "cancelled"],
      user_role: ["customer", "artist", "admin"],
      whitelist_role: ["artist", "admin"],
      whitelist_status: ["inactive", "active", "deactive"],
    },
  },
} as const
