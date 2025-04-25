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
      compromissos: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          imovel_id: string | null
          lead_id: string | null
          local: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          local?: string | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          imovel_id?: string | null
          lead_id?: string | null
          local?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conhecimento: {
        Row: {
          categoria: string
          conteudo: string
          created_at: string
          id: string
          tags: string[] | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria: string
          conteudo: string
          created_at?: string
          id?: string
          tags?: string[] | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: string
          conteudo?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conhecimento_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          categoria: string
          created_at: string
          descricao: string | null
          formato: string
          id: string
          is_template: boolean | null
          tipo: string
          titulo: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descricao?: string | null
          formato: string
          id?: string
          is_template?: boolean | null
          tipo: string
          titulo: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          formato?: string
          id?: string
          is_template?: boolean | null
          tipo?: string
          titulo?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          area_construida: number | null
          area_total: number | null
          bairro: string
          banheiros: number | null
          cep: string | null
          cidade: string
          condominio: number | null
          created_at: string
          descricao: string | null
          destaque: boolean | null
          endereco: string
          estado: string
          finalidade: string
          id: string
          iptu: number | null
          preco: number
          quartos: number | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
          vagas: number | null
        }
        Insert: {
          area_construida?: number | null
          area_total?: number | null
          bairro: string
          banheiros?: number | null
          cep?: string | null
          cidade: string
          condominio?: number | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          endereco: string
          estado: string
          finalidade: string
          id?: string
          iptu?: number | null
          preco: number
          quartos?: number | null
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
          user_id: string
          vagas?: number | null
        }
        Update: {
          area_construida?: number | null
          area_total?: number | null
          bairro?: string
          banheiros?: number | null
          cep?: string | null
          cidade?: string
          condominio?: number | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          endereco?: string
          estado?: string
          finalidade?: string
          id?: string
          iptu?: number | null
          preco?: number
          quartos?: number | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
          vagas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis_fotos: {
        Row: {
          created_at: string
          descricao: string | null
          destaque: boolean | null
          id: string
          imovel_id: string
          ordem: number | null
          url: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imovel_id: string
          ordem?: number | null
          url: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imovel_id?: string
          ordem?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_fotos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis_videos: {
        Row: {
          created_at: string
          id: string
          imovel_id: string
          ordem: number | null
          titulo: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          imovel_id: string
          ordem?: number | null
          titulo?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          imovel_id?: string
          ordem?: number | null
          titulo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_videos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          interesse: string | null
          nome: string
          observacoes: string | null
          origem: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          interesse?: string | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          interesse?: string | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          creci: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email: string
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creci?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
