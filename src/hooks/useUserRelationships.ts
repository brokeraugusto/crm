
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/hooks/useRoles";

interface UserRelationship {
  id: string;
  manager_id: string;
  subordinate_id: string;
  created_at?: string;
}

export function useUserRelationships() {
  const [loading, setLoading] = useState(false);
  
  // Associar um corretor ou assistente a um gerente
  const assignUserToManager = async (managerId: string, subordinateId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_relationships')
        .insert({
          manager_id: managerId,
          subordinate_id: subordinateId,
        });
      
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
  const getManagerSubordinates = async (managerId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          subordinate_id,
          users:subordinate_id (id, nome, email, telefone),
          user_roles!inner (role)
        `)
        .eq('manager_id', managerId);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Erro ao obter subordinados:", error);
      toast.error(`Erro ao obter subordinados: ${error.message}`);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Obter gerente de um corretor/assistente
  const getUserManager = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_relationships')
        .select(`
          manager_id,
          users:manager_id (id, nome, email, telefone)
        `)
        .eq('subordinate_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou gerente
          return null;
        }
        throw error;
      }
      
      return data;
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
      
      // Verificar se o usuário é gerente do usuário alvo
      if (userRoles?.some(r => r.role === 'gerente')) {
        const { data, error } = await supabase
          .from('user_relationships')
          .select()
          .eq('manager_id', currentUserId)
          .eq('subordinate_id', targetUserId);
          
        if (error) throw error;
        
        return data && data.length > 0;
      }
      
      // Verificar se os usuários têm o mesmo gerente
      if (userRoles?.some(r => r.role === 'corretor')) {
        // Verificar se o alvo é um assistente associado ao corretor
        const { data, error } = await supabase
          .from('user_relationships')
          .select(`
            manager_id
          `)
          .eq('subordinate_id', targetUserId)
          .eq('manager_id', currentUserId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          return true;
        }
        
        // Verificar se ambos têm o mesmo gerente
        const { data: currentUserRelation, error: currentUserError } = await supabase
          .from('user_relationships')
          .select('manager_id')
          .eq('subordinate_id', currentUserId)
          .single();
          
        if (currentUserError && currentUserError.code !== 'PGRST116') throw currentUserError;
        
        if (currentUserRelation) {
          const { data: targetUserRelation, error: targetUserError } = await supabase
            .from('user_relationships')
            .select('manager_id')
            .eq('subordinate_id', targetUserId)
            .single();
            
          if (targetUserError && targetUserError.code !== 'PGRST116') throw targetUserError;
          
          if (targetUserRelation && currentUserRelation.manager_id === targetUserRelation.manager_id) {
            return true;
          }
        }
      }
      
      return false;
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
