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
      clients: {
        Row: {
          access: Database["public"]["Enums"]["access"]
          created_at: string
          id: number
          name: string
        }
        Insert: {
          access?: Database["public"]["Enums"]["access"]
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          access?: Database["public"]["Enums"]["access"]
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      company: {
        Row: {
          created_at: string
          default_clients_access: Database["public"]["Enums"]["access"]
          default_projects_access: Database["public"]["Enums"]["access"]
          id: boolean
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          default_clients_access?: Database["public"]["Enums"]["access"]
          default_projects_access?: Database["public"]["Enums"]["access"]
          id?: boolean
          logo_url?: string | null
          name?: string
        }
        Update: {
          created_at?: string
          default_clients_access?: Database["public"]["Enums"]["access"]
          default_projects_access?: Database["public"]["Enums"]["access"]
          id?: boolean
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      directories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "directories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "directories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          client_id: number | null
          id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          client_id?: number | null
          id?: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          client_id?: number | null
          id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          current_version_id: string | null
          id: string
          locked_by_user_id: string | null
          number: number
          project_id: string
        }
        Insert: {
          created_at?: string
          current_version_id?: string | null
          id?: string
          locked_by_user_id?: string | null
          number?: number
          project_id: string
        }
        Update: {
          created_at?: string
          current_version_id?: string | null
          id?: string
          locked_by_user_id?: string | null
          number?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_current_version_id_fkey"
            columns: ["current_version_id"]
            isOneToOne: true
            referencedRelation: "files_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_locked_by_user_id_fkey"
            columns: ["locked_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      files_versions: {
        Row: {
          created_at: string
          file_id: string
          id: string
          name: string
          object_id: string
          version: number
        }
        Insert: {
          created_at?: string
          file_id: string
          id?: string
          name?: string
          object_id: string
          version: number
        }
        Update: {
          created_at?: string
          file_id?: string
          id?: string
          name?: string
          object_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          client_id: number | null
          created_at: string
          id: string
          level: Database["public"]["Enums"]["access"]
          project_id: string | null
          user_id: string
        }
        Insert: {
          client_id?: number | null
          created_at?: string
          id?: string
          level: Database["public"]["Enums"]["access"]
          project_id?: string | null
          user_id: string
        }
        Update: {
          client_id?: number | null
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["access"]
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissions_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          access: Database["public"]["Enums"]["access"]
          client_id: number
          created_at: string
          id: string
          name: string
          project_number: number
        }
        Insert: {
          access?: Database["public"]["Enums"]["access"]
          client_id: number
          created_at?: string
          id?: string
          name: string
          project_number: number
        }
        Update: {
          access?: Database["public"]["Enums"]["access"]
          client_id?: number
          created_at?: string
          id?: string
          name?: string
          project_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      symlinks: {
        Row: {
          created_at: string
          directory_id: string
          file_id: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          directory_id: string
          file_id: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          directory_id?: string
          file_id?: string
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symlinks_directory_id_fkey"
            columns: ["directory_id"]
            isOneToOne: false
            referencedRelation: "directories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "symlinks_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          full_name: string
          id: string
          last_name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          full_name?: string
          id: string
          last_name?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      access: "READ" | "EDIT" | "DELETE" | "ADMIN" | "NONE"
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
      access: ["READ", "EDIT", "DELETE", "ADMIN", "NONE"],
    },
  },
} as const

