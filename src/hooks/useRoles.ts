
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UserRole = 'admin' | 'gerente' | 'corretor' | 'assistente';

export interface RolePermission {
  id: string;
  resource: string;
  action: string;
  role: UserRole;
}

// Interface for user_roles table that's not yet in the types
interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
}

export function useRoles() {
  const [loading, setLoading] = useState(false);
  
  // Verificar se o usuário atual tem permissão para uma ação específica
  const hasPermission = async (resource: string, action: string) => {
    try {
      setLoading(true);
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      // Obter as roles do usuário
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id) as { data: UserRoleRecord[] | null };
        
      if (!userRoles || userRoles.length === 0) {
        return false;
      }
      
      // Verificar se qualquer uma das roles tem a permissão necessária
      const roles = userRoles.map(ur => ur.role);
      
      // Administradores sempre têm todas as permissões
      if (roles.includes('admin')) {
        return true;
      }
      
      // Verificar permissões para outras roles
      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('*')
        .in('role', roles)
        .eq('resource', resource)
        .eq('action', action) as { data: RolePermission[] | null };
      
      return permissions && permissions.length > 0;
    } catch (error) {
      console.error("Erro ao verificar permissões:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Obter o perfil do usuário atual com informações de role
  const getUserWithRoles = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }
      
      // Obter perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // Obter roles do usuário
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id) as { data: UserRoleRecord[] | null };
      
      return {
        ...user,
        profile,
        roles: userRoles?.map(r => r.role) || []
      };
    } catch (error) {
      console.error("Erro ao obter usuário com roles:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Atribuir role para um usuário
  const assignRole = async (userId: string, role: UserRole) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role }) as any;
        
      if (error) {
        toast.error(`Erro ao atribuir permissão: ${error.message}`);
        return false;
      }
      
      toast.success(`Role ${role} atribuída com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao atribuir role:", error);
      toast.error("Erro ao atribuir permissão");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Remover role de um usuário
  const removeRole = async (userId: string, role: UserRole) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role) as any;
        
      if (error) {
        toast.error(`Erro ao remover permissão: ${error.message}`);
        return false;
      }
      
      toast.success(`Role ${role} removida com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao remover role:", error);
      toast.error("Erro ao remover permissão");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    hasPermission,
    getUserWithRoles,
    assignRole,
    removeRole
  };
}
