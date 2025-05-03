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

// Interface for profiles table with avatar_url included
interface UserProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  empresa?: string;
  telefone?: string;
  criado_em?: string;
  atualizado_em?: string;
}

// Define a consistent return type for user with roles
export interface UserWithRoles {
  id: string;
  email: string | null;
  nome: string | null;
  telefone: string | null;
  avatar_url?: string;
  creci?: string | null;
  created_at: string;
  updated_at: string;
  roles: UserRole[];
}

// Types for RPC functions
type HasPermissionParams = {
  user_id: string;
  resource_name: string;
  action_name: string;
}

type QueryPermissionsParams = {
  roles_array: UserRole[];
  resource_name: string;
  action_name: string;
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
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      if (userRolesError) {
        console.error("Erro ao buscar roles do usuário:", userRolesError);
        return false;
      }
        
      if (!userRoles || userRoles.length === 0) {
        return false;
      }
      
      // Verificar se qualquer uma das roles tem a permissão necessária
      const roles = userRoles.map(ur => ur.role);
      
      // Administradores sempre têm todas as permissões
      if (roles.includes('admin')) {
        return true;
      }
      
      try {
        // Tentativa de usar a função RPC
        const { data, error } = await (supabase.rpc as any)(
          'has_permission',
          { 
            user_id: user.id, 
            resource_name: resource, 
            action_name: action 
          } as HasPermissionParams
        );
        
        if (!error) {
          return data === true;
        }
        
        // Se a função RPC falhar, usamos uma query direta
        console.log("Usando método alternativo para verificar permissões");
      } catch (rpcError) {
        console.error("Erro ao tentar função RPC:", rpcError);
        // Continue para a abordagem alternativa
      }
      
      // Abordagem alternativa: verificar permissões diretamente
      // Em vez de usar from('role_permissions'), usamos uma query SQL genérica
      const query = `
        SELECT * FROM role_permissions 
        WHERE role = ANY($1) 
        AND resource = $2 
        AND action = $3
      `;
      
      const { data: directPermissions, error: directError } = await (supabase.rpc as any)(
        'query_permissions',
        { 
          roles_array: roles, 
          resource_name: resource, 
          action_name: action 
        } as QueryPermissionsParams
      );
      
      if (directError) {
        // Se a função RPC não existir, tentamos outra abordagem mais simples
        // Esta é uma solução temporária, idealmente devemos criar uma função RPC específica
        console.error("Erro ao verificar permissões:", directError);
        
        // Verificamos apenas com base no papel do usuário
        // Ex: gerentes podem fazer qualquer coisa com imóveis
        if (resource === 'imoveis' && roles.includes('gerente')) {
          return true;
        }
        
        if (resource === 'leads' && roles.includes('corretor')) {
          return true;
        }
        
        return false;
      }
      
      return !!directPermissions;
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
      
      // Usamos 'users' em vez de 'profiles' para evitar erros de tipo
      // A tabela 'users' já está definida nos tipos do Supabase
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Erro ao obter perfil:", profileError);
      }
      
      // Obter roles do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (rolesError) {
        console.error("Erro ao obter roles:", rolesError);
      }
      
      return {
        ...user,
        profile: profile || null,
        roles: userRoles?.map(r => r.role) || []
      };
    } catch (error) {
      console.error("Erro ao obter usuário com roles:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Obter todos os usuários com suas roles
  const getAllUsersWithRoles = async (): Promise<UserWithRoles[]> => {
    try {
      setLoading(true);
      
      // Obter todos os usuários
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) {
        throw usersError;
      }
      
      if (!users || users.length === 0) {
        return [];
      }
      
      // Obter roles para todos os usuários
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) {
        throw rolesError;
      }
      
      // Mapear roles para cada usuário
      const usersWithRoles = users.map(user => {
        const roles = userRoles
          ?.filter(ur => ur.user_id === user.id)
          .map(ur => ur.role as UserRole) || [];
          
        return {
          ...user,
          roles,
          avatar_url: user.avatar_url || undefined
        } as UserWithRoles;
      });
      
      return usersWithRoles;
    } catch (error) {
      console.error("Erro ao obter todos os usuários:", error);
      toast.error("Erro ao obter lista de usuários");
      return [];
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
        .insert({ user_id: userId, role });
        
      if (error) {
        toast.error(`Erro ao atribuir permissão: ${error.message}`);
        return false;
      }
      
      toast.success(`Role ${role} atribuída com sucesso`);
      return true;
    } catch (error: any) {
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
        .eq('role', role);
        
      if (error) {
        toast.error(`Erro ao remover permissão: ${error.message}`);
        return false;
      }
      
      toast.success(`Role ${role} removida com sucesso`);
      return true;
    } catch (error: any) {
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
    getAllUsersWithRoles,
    assignRole,
    removeRole
  };
}
