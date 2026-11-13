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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          source_enquiry_id: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          source_enquiry_id?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          source_enquiry_id?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_source_enquiry_id_fkey"
            columns: ["source_enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          ai_summary: string | null
          budget_range: string | null
          company: string | null
          created_at: string
          email: string
          follow_up_date: string | null
          id: string
          internal_notes: string | null
          message: string
          name: string
          phone: string | null
          service_interest: string | null
          source: string
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          ai_summary?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email: string
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          message: string
          name: string
          phone?: string | null
          service_interest?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          ai_summary?: string | null
          budget_range?: string | null
          company?: string | null
          created_at?: string
          email?: string
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          message?: string
          name?: string
          phone?: string | null
          service_interest?: string | null
          source?: string
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          service_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          service_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          currency: string
          discount: number
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string
          notes: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          tax_label: string
          tax_rate: number
          terms: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_label?: string
          tax_rate?: number
          terms?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          discount?: number
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string
          notes?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_label?: string
          tax_rate?: number
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          recipient_id: string | null
          title: string
          type: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_id?: string | null
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_id?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: string
          notes: string | null
          paid_on: string
          receipt_number: string | null
          recorded_by: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method?: string
          notes?: string | null
          paid_on?: string
          receipt_number?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          notes?: string | null
          paid_on?: string
          receipt_number?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          category: string
          challenge: string
          client_name: string
          completed_on: string | null
          cover_image: string | null
          created_at: string
          description: string
          features: string[]
          id: string
          is_featured: boolean
          is_published: boolean
          name: string
          project_url: string | null
          screenshots: string[]
          slug: string
          solution: string
          sort_order: number
          status: string
          summary: string
          technologies: string[]
          updated_at: string
        }
        Insert: {
          category: string
          challenge?: string
          client_name?: string
          completed_on?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name: string
          project_url?: string | null
          screenshots?: string[]
          slug: string
          solution?: string
          sort_order?: number
          status?: string
          summary?: string
          technologies?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          challenge?: string
          client_name?: string
          completed_on?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          name?: string
          project_url?: string | null
          screenshots?: string[]
          slug?: string
          solution?: string
          sort_order?: number
          status?: string
          summary?: string
          technologies?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          title?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string
          due_date: string | null
          id: string
          internal_notes: string | null
          manager_id: string | null
          name: string
          progress: number
          service: string | null
          source_enquiry_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          manager_id?: string | null
          name: string
          progress?: number
          service?: string | null
          source_enquiry_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          manager_id?: string | null
          name?: string
          progress?: number
          service?: string | null
          source_enquiry_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_source_enquiry_id_fkey"
            columns: ["source_enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          benefits: string[]
          created_at: string
          features: Json
          icon: string
          id: string
          is_published: boolean
          offerings: string[]
          overview: string
          portfolio_category: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          summary: string
          tagline: string
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string[]
          created_at?: string
          features?: Json
          icon?: string
          id?: string
          is_published?: boolean
          offerings?: string[]
          overview?: string
          portfolio_category?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          summary?: string
          tagline?: string
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string[]
          created_at?: string
          features?: Json
          icon?: string
          id?: string
          is_published?: boolean
          offerings?: string[]
          overview?: string
          portfolio_category?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          summary?: string
          tagline?: string
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string
          avatar_url: string | null
          company: string
          created_at: string
          id: string
          is_published: boolean
          quote: string
          rating: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string
          avatar_url?: string | null
          company?: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote: string
          rating?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string
          avatar_url?: string | null
          company?: string
          created_at?: string
          id?: string
          is_published?: boolean
          quote?: string
          rating?: number
          sort_order?: number
          updated_at?: string
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
      website_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_projects: { Args: { _user_id: string }; Returns: boolean }
      convert_enquiry: {
        Args: { _create_project?: boolean; _enquiry_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoice_total: { Args: { _invoice_id: string }; Returns: number }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "project_manager"
        | "designer"
        | "developer"
      invoice_status: "draft" | "sent" | "void"
      lead_status:
        | "new"
        | "contacted"
        | "discussion"
        | "proposal_sent"
        | "negotiation"
        | "converted"
        | "lost"
      payment_status: "pending" | "confirmed" | "failed" | "refunded"
      project_status:
        | "new"
        | "planning"
        | "in_progress"
        | "review"
        | "completed"
        | "on_hold"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "todo" | "in_progress" | "review" | "done"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "super_admin",
        "admin",
        "project_manager",
        "designer",
        "developer",
      ],
      invoice_status: ["draft", "sent", "void"],
      lead_status: [
        "new",
        "contacted",
        "discussion",
        "proposal_sent",
        "negotiation",
        "converted",
        "lost",
      ],
      payment_status: ["pending", "confirmed", "failed", "refunded"],
      project_status: [
        "new",
        "planning",
        "in_progress",
        "review",
        "completed",
        "on_hold",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["todo", "in_progress", "review", "done"],
    },
  },
} as const
