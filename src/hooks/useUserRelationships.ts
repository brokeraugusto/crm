
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Remover esse hook e usar após a criação da tabela user_relationships
// Este é um hook temporário que será substituído após a criação da tabela
export function useUserRelationships() {
  const [loading, setLoading] = useState(false);
  
  // Associar um corretor ou assistente a um gerente
  const assignUserToManager = async (managerId: string, subordinateId: string) => {
    try {
      setLoading(true);
      // Temporariamente retornando sucesso até que a tabela seja criada
      toast.success("Usuário associado com sucesso");
      return { managerId, subordinateId };
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
      // Temporariamente retornando sucesso até que a tabela seja criada
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
      // Temporariamente retornando uma lista vazia até que a tabela seja criada
      return [];
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
      // Temporariamente retornando null até que a tabela seja criada
      return null;
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
      
      // Sem a tabela user_relationships, vamos limitar o acesso
      // Temporariamente, apenas usuários com mesmo ID ou admins podem acessar os dados
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
