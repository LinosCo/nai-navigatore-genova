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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_actions_log: {
        Row: {
          action: string
          admin_user_id: string
          details: Json | null
          id: string
          target_user_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_log_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          first_attempt: string | null
          id: string
          identifier: string
          last_attempt: string | null
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          first_attempt?: string | null
          id?: string
          identifier: string
          last_attempt?: string | null
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          first_attempt?: string | null
          id?: string
          identifier?: string
          last_attempt?: string | null
        }
        Relationships: []
      }
      initiatives: {
        Row: {
          contact: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          end_date: string | null
          id: string
          is_generated: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          nai_benefits: string | null
          organization: string
          participants: string
          published: boolean
          source_url: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          contact: string
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          end_date?: string | null
          id?: string
          is_generated?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          nai_benefits?: string | null
          organization: string
          participants: string
          published?: boolean
          source_url?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          contact?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          end_date?: string | null
          id?: string
          is_generated?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          nai_benefits?: string | null
          organization?: string
          participants?: string
          published?: boolean
          source_url?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          enable_all_notifications: boolean
          enable_email_notifications: boolean
          enabled_categories: string[] | null
          id: string
          notification_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enable_all_notifications?: boolean
          enable_email_notifications?: boolean
          enabled_categories?: string[] | null
          id?: string
          notification_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enable_all_notifications?: boolean
          enable_email_notifications?: boolean
          enabled_categories?: string[] | null
          id?: string
          notification_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          initiative_id: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiative_id?: string | null
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          initiative_id?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      pii_access_requests: {
        Row: {
          admin_user_id: string
          approved_by: string | null
          business_justification: string
          created_at: string | null
          expires_at: string | null
          fulfilled_at: string | null
          id: string
          request_status: string | null
          requested_fields: string[] | null
          target_profile_id: string
        }
        Insert: {
          admin_user_id: string
          approved_by?: string | null
          business_justification: string
          created_at?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          request_status?: string | null
          requested_fields?: string[] | null
          target_profile_id: string
        }
        Update: {
          admin_user_id?: string
          approved_by?: string | null
          business_justification?: string
          created_at?: string | null
          expires_at?: string | null
          fulfilled_at?: string | null
          id?: string
          request_status?: string | null
          requested_fields?: string[] | null
          target_profile_id?: string
        }
        Relationships: []
      }
      profile_access_log: {
        Row: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id: string | null
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_profile_id: string
          accessor_user_id?: string | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_profile_id?: string
          accessor_user_id?: string | null
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          codice_fiscale: string | null
          codice_fiscale_encrypted: string | null
          cognome: string | null
          created_at: string | null
          dati_spid: Json | null
          dati_spid_encrypted: string | null
          disable_reason: string | null
          disabled_at: string | null
          disabled_by: string | null
          email: string | null
          enabled: boolean
          id: string
          livello_autenticazione_spid: string | null
          nome: string | null
          provider_autenticazione: string | null
          ultimo_accesso_spid: string | null
          updated_at: string | null
        }
        Insert: {
          codice_fiscale?: string | null
          codice_fiscale_encrypted?: string | null
          cognome?: string | null
          created_at?: string | null
          dati_spid?: Json | null
          dati_spid_encrypted?: string | null
          disable_reason?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          email?: string | null
          enabled?: boolean
          id: string
          livello_autenticazione_spid?: string | null
          nome?: string | null
          provider_autenticazione?: string | null
          ultimo_accesso_spid?: string | null
          updated_at?: string | null
        }
        Update: {
          codice_fiscale?: string | null
          codice_fiscale_encrypted?: string | null
          cognome?: string | null
          created_at?: string | null
          dati_spid?: Json | null
          dati_spid_encrypted?: string | null
          disable_reason?: string | null
          disabled_at?: string | null
          disabled_by?: string | null
          email?: string | null
          enabled?: boolean
          id?: string
          livello_autenticazione_spid?: string | null
          nome?: string | null
          provider_autenticazione?: string | null
          ultimo_accesso_spid?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_disabled_by_fkey"
            columns: ["disabled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          severity: string | null
          target_resource: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          target_resource?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          severity?: string | null
          target_resource?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      spid_access_logs: {
        Row: {
          codice_fiscale: string
          id: string
          identity_provider: string
          ip_address: unknown | null
          livello_autenticazione: string
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          codice_fiscale: string
          id?: string
          identity_provider: string
          ip_address?: unknown | null
          livello_autenticazione: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          codice_fiscale?: string
          id?: string
          identity_provider?: string
          ip_address?: unknown | null
          livello_autenticazione?: string
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spid_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      decrypt_sensitive_data: {
        Args: { _encrypted_data: string; _field_type?: string }
        Returns: string
      }
      delete_user: {
        Args: { _reason?: string; _user_id: string }
        Returns: boolean
      }
      disable_user: {
        Args: { _reason?: string; _user_id: string }
        Returns: boolean
      }
      enable_user: {
        Args: { _user_id: string }
        Returns: boolean
      }
      encrypt_sensitive_data: {
        Args: { _data: string; _field_type?: string }
        Returns: string
      }
      get_admin_profiles_count: {
        Args: { _search?: string }
        Returns: number
      }
      get_admin_profiles_masked: {
        Args: { _limit?: number; _offset?: number; _search?: string }
        Returns: {
          codice_fiscale_masked: string
          cognome: string
          created_at: string
          disable_reason: string
          disabled_at: string
          disabled_by: string
          email: string
          enabled: boolean
          id: string
          livello_autenticazione_spid: string
          nome: string
          provider_autenticazione: string
          ultimo_accesso_spid: string
          updated_at: string
        }[]
      }
      get_codice_fiscale_decrypted: {
        Args: { _profile_id: string }
        Returns: string
      }
      get_profile_full_pii: {
        Args: { _operation_reason: string; _profile_id: string }
        Returns: {
          codice_fiscale: string
          cognome: string
          dati_spid: Json
          email: string
          id: string
          nome: string
        }[]
      }
      get_profile_masked: {
        Args: { _profile_id: string }
        Returns: {
          codice_fiscale_masked: string
          cognome: string
          created_at: string
          disable_reason: string
          disabled_at: string
          disabled_by: string
          email: string
          enabled: boolean
          id: string
          livello_autenticazione_spid: string
          nome: string
          provider_autenticazione: string
          ultimo_accesso_spid: string
          updated_at: string
        }[]
      }
      get_spid_data_decrypted: {
        Args: { _profile_id: string }
        Returns: Json
      }
      get_spid_data_summary: {
        Args: { _profile_id: string }
        Returns: {
          has_spid_data: boolean
          livello_autenticazione: string
          provider: string
          ultimo_accesso: string
        }[]
      }
      get_unread_notification_count: {
        Args: { user_id_param: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_profile_access: {
        Args: { _access_type: string; _profile_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          _details?: Json
          _event_type: string
          _severity?: string
          _target_resource?: string
        }
        Returns: undefined
      }
      mask_sensitive_data: {
        Args: { _codice_fiscale: string; _full_access?: boolean }
        Returns: string
      }
      migrate_to_encrypted_fields: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      request_pii_access: {
        Args: {
          _justification: string
          _requested_fields: string[]
          _target_profile_id: string
        }
        Returns: string
      }
      secure_update_profile: {
        Args: {
          _cognome?: string
          _email?: string
          _nome?: string
          _profile_id: string
        }
        Returns: undefined
      }
      update_codice_fiscale_encrypted: {
        Args: { _new_codice_fiscale: string; _profile_id: string }
        Returns: undefined
      }
      update_spid_data_encrypted: {
        Args: { _new_spid_data: Json; _profile_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
