
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserRelationship {
  id: string;
  manager_id: string;
  subordinate_id: string;
  created_at: string;
  users?: {
    nome: string;
  };
  manager_name?: string;
  subordinate_name?: string;
}

export function useUserRelationships() {
  const [loading, setLoading] = useState(false);
  
  // Associar um corretor ou assistente a um gerente
  const assignUserToManager = async (managerId: string, subordinateId: string) => {
    try {
      setLoading(true);
      
      // Verificar se a relação já existe
      const { data: existingRelation, error: checkError } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('manager_id', managerId)
        .eq('subordinate_id', subordinateId)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      if (existingRelation) {
        toast.info("Usuário já está associado a este gerente");
        return existingRelation;
      }
      
      // Criar nova relação
      const { data, error } = await supabase
        .from('user_relationships')
        .insert({
          manager_id: managerId,
          subordinate_id: subordinateId
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      toast.success("Usuário associado com sucesso");
      return data;
    } catch (error: any) {
      console.error("Erro ao associar usuário:", error);
      toast.error(`Erro ao associar usuário: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Remover associação entre um corretor/assistente e um gerente
  const removeUserFromManager = async (managerId: string, subordinateId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('manager_id', managerId)
        .eq('subordinate_id', subordinateId);
        
      if (error) {
        throw error;
      }
      
      toast.success("Associação removida com sucesso");
      return true;
    } catch (error: any) {
      console.error("Erro ao remover associação:", error);
      toast.error(`Erro ao remover associação: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Obter todos os subordinados de um gerente
  const getManagerSubordinates = async (managerId: string): Promise<UserRelationship[]> => {
    try {
      setLoading(true);
      
      // First get the relationships
      const { data: relationships, error } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('manager_id', managerId);
        
      if (error) {
        throw error;
      }
      
      // Now fetch the user names for each subordinate
      const enrichedRelationships = await Promise.all(
        (relationships || []).map(async (relationship) => {
          const { data: userData } = await supabase
            .from('users')
            .select('nome')
            .eq('id', relationship.subordinate_id)
            .single();
          
          return {
            ...relationship,
            users: userData || { nome: 'Usuário desconhecido' }
          };
        })
      );
      
      return enrichedRelationships;
    } catch (error: any) {
      console.error("Erro ao obter subordinados:", error);
      toast.error(`Erro ao obter subordinados: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Obter gerente de um corretor/assistente
  const getUserManager = async (userId: string): Promise<UserRelationship | null> => {
    try {
      setLoading(true);
      
      // First get the relationship
      const { data: relationship, error } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('subordinate_id', userId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!relationship) {
        return null;
      }
      
      // Now fetch the manager's name
      const { data: userData } = await supabase
        .from('users')
        .select('nome')
        .eq('id', relationship.manager_id)
        .single();
      
      return {
        ...relationship,
        users: userData || { nome: 'Gerente desconhecido' }
      };
    } catch (error: any) {
      console.error("Erro ao obter gerente:", error);
      toast.error(`Erro ao obter gerente: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Verificar se um usuário pode acessar dados de outro usuário
  const canAccessUserData = async (currentUserId: string, targetUserId: string) => {
    try {
      if (currentUserId === targetUserId) {
        return true; // Usuário sempre pode acessar seus próprios dados
      }
      
      // Verificar se o usuário é admin
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId);
        
      if (roleError) throw roleError;
      
      if (userRoles?.some(r => r.role === 'admin')) {
        return true; // Admin pode acessar dados de qualquer usuário
      }
      
      // Verificar se o usuário atual é gerente do usuário alvo
      const { data: relationship, error: relationshipError } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('manager_id', currentUserId)
        .eq('subordinate_id', targetUserId)
        .maybeSingle();
        
      if (relationshipError) throw relationshipError;
      
      return !!relationship; // Retorna true se existe relacionamento, false caso contrário
    } catch (error: any) {
      console.error("Erro ao verificar acesso:", error);
      return false;
    }
  };
  
  return {
    loading,
    assignUserToManager,
    removeUserFromManager,
    getManagerSubordinates,
    getUserManager,
    canAccessUserData
  };
}
