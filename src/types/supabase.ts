/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      game_versions: {
        Row: {
          id: string
          published: boolean
          version: string
        }
        Insert: {
          id?: string
          published?: boolean
          version: string
        }
        Update: {
          id?: string
          published?: boolean
          version?: string
        }
        Relationships: []
      }
      github_users: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          user_name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name?: string | null
          user_name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_contributors: {
        Row: {
          id: string
          mod_id: string
          user_id: string
        }
        Insert: {
          id?: string
          mod_id: string
          user_id: string
        }
        Update: {
          id?: string
          mod_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_contributors_mod_id_fkey"
            columns: ["mod_id"]
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_contributors_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "github_users"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_version_dependencies: {
        Row: {
          dependency_id: string
          id: string
          mod_versions_id: string
          semver: string
        }
        Insert: {
          dependency_id: string
          id?: string
          mod_versions_id: string
          semver: string
        }
        Update: {
          dependency_id?: string
          id?: string
          mod_versions_id?: string
          semver?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_version_dependencies_dependency_id_fkey"
            columns: ["dependency_id"]
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_version_dependencies_mod_versions_id_fkey"
            columns: ["mod_versions_id"]
            referencedRelation: "mod_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_version_supported_game_versions: {
        Row: {
          game_version_id: string | null
          id: string
          mod_version_id: string
        }
        Insert: {
          game_version_id?: string | null
          id?: string
          mod_version_id: string
        }
        Update: {
          game_version_id?: string | null
          id?: string
          mod_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_version_supported_game_versions_game_version_id_fkey"
            columns: ["game_version_id"]
            referencedRelation: "game_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mod_version_supported_game_versions_mod_version_id_fkey"
            columns: ["mod_version_id"]
            referencedRelation: "mod_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      mod_versions: {
        Row: {
          created_at: string
          download_url: string
          id: string
          mod_id: string
          version: string
        }
        Insert: {
          created_at?: string
          download_url: string
          id?: string
          mod_id: string
          version: string
        }
        Update: {
          created_at?: string
          download_url?: string
          id?: string
          mod_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "mod_versions_mod_id_fkey"
            columns: ["mod_id"]
            referencedRelation: "mods"
            referencedColumns: ["id"]
          },
        ]
      }
      mods: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          more_info_url: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id: string
          more_info_url: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          more_info_url?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "mods_category_fkey"
            columns: ["category"]
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string | null
          user_name: string
        }[]
      }
      get_mods_listing: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          slug: string
          category: string
          contributors: Database["public"]["CompositeTypes"]["contributor_type"][]
          supported_game_versions: string[]
          latest_mod_version: string
        }[]
      }
      new_mod: {
        Args: {
          id: string
          name: string
          description: string
          category: string
          more_info_url: string
          slug: string
          user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      contributor_type: {
        id: string
        name: string
        user_name: string
        avatar_url: string
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
