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
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"]
          city: Database["public"]["Enums"]["sa_city"]
          created_at: string
          date: string
          description: string
          doors_time: string | null
          hero_image: string | null
          id: string
          image: string
          organiser: string
          organiser_verified: boolean
          owner_id: string | null
          price_from: number
          slug: string
          subtitle: string | null
          tags: string[]
          title: string
          trending: boolean
          updated_at: string
          venue: string
          venue_address: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["event_category"]
          city: Database["public"]["Enums"]["sa_city"]
          created_at?: string
          date: string
          description?: string
          doors_time?: string | null
          hero_image?: string | null
          id?: string
          image: string
          organiser: string
          organiser_verified?: boolean
          owner_id?: string | null
          price_from?: number
          slug: string
          subtitle?: string | null
          tags?: string[]
          title: string
          trending?: boolean
          updated_at?: string
          venue: string
          venue_address?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"]
          city?: Database["public"]["Enums"]["sa_city"]
          created_at?: string
          date?: string
          description?: string
          doors_time?: string | null
          hero_image?: string | null
          id?: string
          image?: string
          organiser?: string
          organiser_verified?: boolean
          owner_id?: string | null
          price_from?: number
          slug?: string
          subtitle?: string | null
          tags?: string[]
          title?: string
          trending?: boolean
          updated_at?: string
          venue?: string
          venue_address?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          quantity: number
          ticket_tier_id: string
          tier_name: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          quantity: number
          ticket_tier_id: string
          tier_name: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          ticket_tier_id?: string
          tier_name?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_ticket_tier_id_fkey"
            columns: ["ticket_tier_id"]
            isOneToOne: false
            referencedRelation: "ticket_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          event_id: string
          fee: number
          id: string
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          event_id: string
          fee: number
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          event_id?: string
          fee?: number
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string
          event_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_tiers: {
        Row: {
          available: boolean
          badge: string | null
          capacity: number | null
          created_at: string
          event_id: string
          id: string
          name: string
          perks: string[]
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          badge?: string | null
          capacity?: number | null
          created_at?: string
          event_id: string
          id?: string
          name: string
          perks?: string[]
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          badge?: string | null
          capacity?: number | null
          created_at?: string
          event_id?: string
          id?: string
          name?: string
          perks?: string[]
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          buyer_email: string
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          event_slug: string
          event_title: string
          id: string
          payfast_payment_id: string | null
          payment_id: string
          qr_code: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          tier_name: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          buyer_email: string
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          event_slug: string
          event_title: string
          id?: string
          payfast_payment_id?: string | null
          payment_id: string
          qr_code?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          tier_name: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          buyer_email?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          event_slug?: string
          event_title?: string
          id?: string
          payfast_payment_id?: string | null
          payment_id?: string
          qr_code?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          tier_name?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          roles: Database["public"]["Enums"]["app_role"][]
          user_id: string
        }[]
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _target: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "organiser" | "admin"
      event_category:
        | "music"
        | "festivals"
        | "sports"
        | "comedy"
        | "food"
        | "conferences"
      order_status: "pending" | "paid" | "cancelled" | "refunded"
      sa_city:
        | "Cape Town"
        | "Johannesburg"
        | "Durban"
        | "Pretoria"
        | "Gqeberha"
        | "East London"
        | "Bloemfontein"
        | "Polokwane"
        | "Mbombela"
        | "Kimberley"
        | "Pietermaritzburg"
        | "Stellenbosch"
        | "George"
        | "Rustenburg"
        | "Soweto"
        | "Centurion"
        | "Sandton"
        | "Knysna"
        | "Hermanus"
        | "Paarl"
        | "Potchefstroom"
        | "Upington"
        | "Vanderbijlpark"
        | "Vereeniging"
        | "Benoni"
        | "Boksburg"
        | "Brakpan"
        | "Germiston"
        | "Springs"
        | "Krugersdorp"
        | "Randfontein"
        | "Oudtshoorn"
        | "Worcester"
        | "Swellendam"
        | "Bellville"
        | "Somerset West"
        | "Newcastle"
        | "Empangeni"
        | "Richards Bay"
        | "Pinetown"
        | "Umlazi"
        | "Mooi River"
        | "Howick"
        | "Bhisho"
        | "KuGompo City"
        | "Kariega"
        | "Mthatha"
        | "Makhanda"
        | "Graaff-Reinet"
        | "Welkom"
        | "Odendaalsrus"
        | "Sasolburg"
        | "Bethlehem"
        | "Kroonstad"
        | "Parys"
        | "Clarens"
        | "Musina"
        | "Phalaborwa"
        | "Thabazimbi"
        | "Makhado"
        | "Bela-Bela"
        | "Tzaneen"
        | "eMalahleni"
        | "Middelburg"
        | "Secunda"
        | "Ermelo"
        | "Standerton"
        | "Barberton"
        | "Sabie"
        | "Mahikeng"
        | "Klerksdorp"
        | "Brits"
        | "Hartbeespoort"
        | "Lichtenburg"
        | "Vryburg"
        | "Springbok"
        | "De Aar"
        | "Kuruman"
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
      app_role: ["user", "organiser", "admin"],
      event_category: [
        "music",
        "festivals",
        "sports",
        "comedy",
        "food",
        "conferences",
      ],
      order_status: ["pending", "paid", "cancelled", "refunded"],
      sa_city: [
        "Cape Town",
        "Johannesburg",
        "Durban",
        "Pretoria",
        "Gqeberha",
        "East London",
        "Bloemfontein",
        "Polokwane",
        "Mbombela",
        "Kimberley",
        "Pietermaritzburg",
        "Stellenbosch",
        "George",
        "Rustenburg",
        "Soweto",
        "Centurion",
        "Sandton",
        "Knysna",
        "Hermanus",
        "Paarl",
        "Potchefstroom",
        "Upington",
        "Vanderbijlpark",
        "Vereeniging",
        "Benoni",
        "Boksburg",
        "Brakpan",
        "Germiston",
        "Springs",
        "Krugersdorp",
        "Randfontein",
        "Oudtshoorn",
        "Worcester",
        "Swellendam",
        "Bellville",
        "Somerset West",
        "Newcastle",
        "Empangeni",
        "Richards Bay",
        "Pinetown",
        "Umlazi",
        "Mooi River",
        "Howick",
        "Bhisho",
        "KuGompo City",
        "Kariega",
        "Mthatha",
        "Makhanda",
        "Graaff-Reinet",
        "Welkom",
        "Odendaalsrus",
        "Sasolburg",
        "Bethlehem",
        "Kroonstad",
        "Parys",
        "Clarens",
        "Musina",
        "Phalaborwa",
        "Thabazimbi",
        "Makhado",
        "Bela-Bela",
        "Tzaneen",
        "eMalahleni",
        "Middelburg",
        "Secunda",
        "Ermelo",
        "Standerton",
        "Barberton",
        "Sabie",
        "Mahikeng",
        "Klerksdorp",
        "Brits",
        "Hartbeespoort",
        "Lichtenburg",
        "Vryburg",
        "Springbok",
        "De Aar",
        "Kuruman",
      ],
    },
  },
} as const
