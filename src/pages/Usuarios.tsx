import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRoles, UserRole } from "@/hooks/useRoles";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdmin } from "@/hooks/useAdmin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, User, UserPlus } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  avatar_url?: string;
  roles: UserRole[];
  created_at?: string;
}

// Define a type for the data returned from getAllUsersWithRoles
interface UserWithRole {
  id: string;
  email: string | null;
  nome: string | null;
  telefone: string | null;
  avatar_url?: string;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  creci?: string | null;
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllUsersWithRoles, assignRole, removeRole } = useRoles();
  const { user } = useAuth();
  const { isMasterAdmin } = useAdmin();
  const navigate = useNavigate();
  
  // Redireciona se não for admin
  useEffect(() => {
    if (!isMasterAdmin) {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/");
    }
  }, [isMasterAdmin, navigate]);
  
  // Carregar usuários
  useEffect(() => {
    async function loadUsers() {
      if (!isMasterAdmin) return;
      
      setLoading(true);
      try {
        const allUsers = await getAllUsersWithRoles();
        
        const formattedUsers = allUsers.map(u => ({
          id: u.id,
          email: u.email || "",
          nome: u.nome || "",
          telefone: u.telefone || "",
          avatar_url: u.avatar_url || "",
          roles: u.roles || [],
          created_at: u.created_at
        })) as UserData[];
        
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
        toast.error("Não foi possível carregar a lista de usuários");
      } finally {
        setLoading(false);
      }
    }
    
    loadUsers();
  }, [getAllUsersWithRoles, isMasterAdmin]);
  
  // Função para alterar role
  const handleRoleChange = async (userId: string, role: UserRole, hasRole: boolean) => {
    try {
      let success;
      
      if (hasRole) {
        success = await removeRole(userId, role);
      } else {
        success = await assignRole(userId, role);
      }
      
      if (success) {
        // Atualizar a lista de usuários
        setUsers(users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              roles: hasRole 
                ? u.roles.filter(r => r !== role)
                : [...u.roles, role]
            };
          }
          return u;
        }));
      }
    } catch (error) {
      console.error("Erro ao alterar permissão:", error);
      toast.error("Não foi possível alterar a permissão do usuário");
    }
  };
  
  // Definição das colunas
  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: "nome",
      header: "Usuário",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className="bg-primary text-white">
                {user.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.nome || "Sem nome"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "telefone",
      header: "Telefone",
      cell: ({ row }) => row.original.telefone || "N/A"
    },
    {
      accessorKey: "roles",
      header: "Permissões",
      cell: ({ row }) => {
        const roles = row.original.roles;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.includes("admin") && (
              <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                Admin
              </Badge>
            )}
            {roles.includes("gerente") && (
              <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                Gerente
              </Badge>
            )}
            {roles.includes("corretor") && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Corretor
              </Badge>
            )}
            {roles.includes("assistente") && (
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                Assistente
              </Badge>
            )}
            {roles.length === 0 && (
              <Badge variant="outline">Sem função</Badge>
            )}
          </div>
        );
      }
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const userId = row.original.id;
        const roles = row.original.roles;
        const isCurrentUser = userId === user?.id;
        
        return (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={roles.includes("admin") ? "default" : "outline"}
                className={roles.includes("admin") ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => handleRoleChange(userId, "admin", roles.includes("admin"))}
                disabled={isCurrentUser && isMasterAdmin}
              >
                Admin
              </Button>
              <Button 
                size="sm" 
                variant={roles.includes("gerente") ? "default" : "outline"}
                className={roles.includes("gerente") ? "bg-blue-500 hover:bg-blue-600" : ""}
                onClick={() => handleRoleChange(userId, "gerente", roles.includes("gerente"))}
              >
                Gerente
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={roles.includes("corretor") ? "default" : "outline"}
                className={roles.includes("corretor") ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => handleRoleChange(userId, "corretor", roles.includes("corretor"))}
              >
                Corretor
              </Button>
              <Button 
                size="sm" 
                variant={roles.includes("assistente") ? "default" : "outline"}
                className={roles.includes("assistente") ? "bg-orange-500 hover:bg-orange-600" : ""}
                onClick={() => handleRoleChange(userId, "assistente", roles.includes("assistente"))}
              >
                Assistente
              </Button>
            </div>
          </div>
        );
      }
    }
  ];
  
  // Se não for admin, redireciona
  if (!isMasterAdmin) {
    return null;
  }
  
  return (
    <div className="container mx-auto form-wrapper">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Administração</h1>
        <p className="text-muted-foreground">Gerencie usuários e permissões do sistema</p>
      </div>
      
      <Tabs defaultValue="usuarios">
        <TabsList className="mb-6">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="convites" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Convites
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Permissões
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Usuários do Sistema
              </CardTitle>
              <CardDescription>
                Gerencie os usuários e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={users} 
                loading={loading}
                searchColumn="nome"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="convites">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Convites para Novos Usuários
              </CardTitle>
              <CardDescription>
                Envie convites para novos usuários se registrarem no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Esta funcionalidade estará disponível em breve. Você poderá enviar convites 
                para novos usuários se registrarem no sistema com funções pré-definidas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Políticas de Permissões
              </CardTitle>
              <CardDescription>
                Configure políticas de acesso para diferentes funções
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Funcionalidade em desenvolvimento</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Esta funcionalidade estará disponível em breve. Você poderá configurar 
                políticas de acesso detalhadas para diferentes funções no sistema.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
