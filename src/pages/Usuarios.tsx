
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { 
  AlertTriangle, 
  Shield, 
  User, 
  UserPlus, 
  Loader2,
  X,
  Check,
  Mail,
  UserX,
  Pencil
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

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

// Interface para o formulário de novo usuário
interface NewUserFormData {
  nome: string;
  email: string;
  telefone: string;
  roles: UserRole[];
}

export default function Usuarios() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [isEditUserFormOpen, setIsEditUserFormOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState<NewUserFormData>({
    nome: "",
    email: "",
    telefone: "",
    roles: []
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("corretor");

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
    loadUsers();
  }, [isMasterAdmin]);
  
  const loadUsers = async () => {
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
      toast.error("Não foi possível carregar a lista de usuários. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };
  
  // Função para alterar role
  const handleRoleChange = async (userId: string, role: UserRole, hasRole: boolean) => {
    setLoadingAction(userId + role);
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
    } finally {
      setLoadingAction(null);
    }
  };

  // Função para excluir usuário
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setLoadingAction("delete-" + userToDelete);
    try {
      // Implementar lógica para excluir o usuário usando o Supabase Admin API
      const { error } = await supabase.auth.admin.deleteUser(userToDelete);
      
      if (error) {
        throw error;
      }
      
      // Remover usuário da lista local
      setUsers(users.filter(u => u.id !== userToDelete));
      toast.success("Usuário excluído com sucesso");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error);
      toast.error(`Erro ao excluir usuário: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setUserToDelete(null);
    }
  };
  
  // Função para adicionar novo usuário
  const handleAddUser = async () => {
    if (!newUser.nome || !newUser.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }
    
    setLoadingAction("add-user");
    try {
      // Criar usuário usando o Supabase Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        email_confirm: true,
        user_metadata: {
          nome: newUser.nome
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Adicionar dados adicionais na tabela users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            nome: newUser.nome,
            email: newUser.email,
            telefone: newUser.telefone || null
          });
          
        if (profileError) throw profileError;
        
        // Atribuir roles selecionadas
        if (newUser.roles.length > 0) {
          for (const role of newUser.roles) {
            await assignRole(data.user.id, role);
          }
        }
        
        // Adicionar usuário à lista local
        const newUserData: UserData = {
          id: data.user.id,
          email: data.user.email || newUser.email,
          nome: newUser.nome,
          telefone: newUser.telefone,
          roles: newUser.roles,
          created_at: new Date().toISOString()
        };
        
        setUsers([...users, newUserData]);
        toast.success("Usuário criado com sucesso");
        
        // Limpar formulário
        setNewUser({
          nome: "",
          email: "",
          telefone: "",
          roles: []
        });
        
        setIsUserFormOpen(false);
      }
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast.error(`Erro ao criar usuário: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Função para enviar convite por email
  const handleSendInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email é obrigatório");
      return;
    }
    
    setLoadingAction("invite");
    try {
      // Enviar convite por email
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail);
      
      if (error) throw error;
      
      if (data.user) {
        // Atribuir role selecionada
        await assignRole(data.user.id, inviteRole);
        
        toast.success(`Convite enviado com sucesso para ${inviteEmail}`);
        
        // Adicionar usuário à lista local
        const newUserData: UserData = {
          id: data.user.id,
          email: inviteEmail,
          nome: inviteEmail.split('@')[0],
          roles: [inviteRole],
          created_at: new Date().toISOString()
        };
        
        setUsers([...users, newUserData]);
        
        // Limpar formulário
        setInviteEmail("");
        setInviteRole("corretor");
        setIsInviteFormOpen(false);
      }
    } catch (error: any) {
      console.error("Erro ao enviar convite:", error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Função para preparar edição de usuário
  const handlePrepareEdit = (user: UserData) => {
    setUserToEdit(user);
    setIsEditUserFormOpen(true);
  };

  // Função para salvar edição de usuário
  const handleSaveEdit = async () => {
    if (!userToEdit) return;
    
    setLoadingAction("edit-" + userToEdit.id);
    try {
      // Atualizar o nome e telefone
      const { error } = await supabase
        .from('users')
        .update({
          nome: userToEdit.nome,
          telefone: userToEdit.telefone || null
        })
        .eq('id', userToEdit.id);
        
      if (error) throw error;
      
      // Atualizar a lista local
      setUsers(users.map(u => {
        if (u.id === userToEdit.id) {
          return userToEdit;
        }
        return u;
      }));
      
      toast.success("Usuário atualizado com sucesso");
      setIsEditUserFormOpen(false);
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(`Erro ao atualizar usuário: ${error.message}`);
    } finally {
      setLoadingAction(null);
      setUserToEdit(null);
    }
  };

  // Função para alternar role no formulário de novo usuário
  const toggleRole = (role: UserRole) => {
    if (newUser.roles.includes(role)) {
      setNewUser({
        ...newUser,
        roles: newUser.roles.filter(r => r !== role)
      });
    } else {
      setNewUser({
        ...newUser,
        roles: [...newUser.roles, role]
      });
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
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={roles.includes("admin") ? "default" : "outline"}
                className={roles.includes("admin") ? "bg-red-500 hover:bg-red-600" : ""}
                onClick={() => handleRoleChange(userId, "admin", roles.includes("admin"))}
                disabled={isCurrentUser && isMasterAdmin || loadingAction === userId + "admin"}
              >
                {loadingAction === userId + "admin" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Admin'
                )}
              </Button>
              <Button 
                size="sm" 
                variant={roles.includes("gerente") ? "default" : "outline"}
                className={roles.includes("gerente") ? "bg-blue-500 hover:bg-blue-600" : ""}
                onClick={() => handleRoleChange(userId, "gerente", roles.includes("gerente"))}
                disabled={loadingAction === userId + "gerente"}
              >
                {loadingAction === userId + "gerente" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Gerente'
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                variant={roles.includes("corretor") ? "default" : "outline"}
                className={roles.includes("corretor") ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => handleRoleChange(userId, "corretor", roles.includes("corretor"))}
                disabled={loadingAction === userId + "corretor"}
              >
                {loadingAction === userId + "corretor" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Corretor'
                )}
              </Button>
              <Button 
                size="sm" 
                variant={roles.includes("assistente") ? "default" : "outline"}
                className={roles.includes("assistente") ? "bg-orange-500 hover:bg-orange-600" : ""}
                onClick={() => handleRoleChange(userId, "assistente", roles.includes("assistente"))}
                disabled={loadingAction === userId + "assistente"}
              >
                {loadingAction === userId + "assistente" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Assistente'
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => handlePrepareEdit(row.original)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex items-center gap-1"
                onClick={() => {
                  setUserToDelete(userId);
                  setIsDeleteDialogOpen(true);
                }}
                disabled={isCurrentUser || loadingAction === "delete-" + userId}
              >
                {loadingAction === "delete-" + userId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <UserX className="h-3.5 w-3.5" />
                    Excluir
                  </>
                )}
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
    <div className="container px-4 sm:px-0 mx-auto form-wrapper">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Usuários do Sistema
                </CardTitle>
                <CardDescription>
                  Gerencie os usuários e suas permissões
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Preencha os dados para criar um novo usuário no sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          placeholder="Nome completo"
                          value={newUser.nome}
                          onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          placeholder="(00) 00000-0000"
                          value={newUser.telefone}
                          onChange={(e) => setNewUser({...newUser, telefone: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Permissões</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={newUser.roles.includes("admin") ? "default" : "outline"}
                            className={newUser.roles.includes("admin") ? "bg-red-500 hover:bg-red-600" : ""}
                            onClick={() => toggleRole("admin")}
                          >
                            Admin
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={newUser.roles.includes("gerente") ? "default" : "outline"}
                            className={newUser.roles.includes("gerente") ? "bg-blue-500 hover:bg-blue-600" : ""}
                            onClick={() => toggleRole("gerente")}
                          >
                            Gerente
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={newUser.roles.includes("corretor") ? "default" : "outline"}
                            className={newUser.roles.includes("corretor") ? "bg-green-500 hover:bg-green-600" : ""}
                            onClick={() => toggleRole("corretor")}
                          >
                            Corretor
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={newUser.roles.includes("assistente") ? "default" : "outline"}
                            className={newUser.roles.includes("assistente") ? "bg-orange-500 hover:bg-orange-600" : ""}
                            onClick={() => toggleRole("assistente")}
                          >
                            Assistente
                          </Button>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUserFormOpen(false)}>Cancelar</Button>
                      <Button 
                        onClick={handleAddUser}
                        disabled={loadingAction === "add-user"}
                      >
                        {loadingAction === "add-user" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Criar Usuário
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  onClick={loadUsers} 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Atualizar"
                  )}
                </Button>
              </div>
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
            <CardContent>
              <div className="mb-6">
                <Dialog open={isInviteFormOpen} onOpenChange={setIsInviteFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Enviar Convite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Convidar Novo Usuário</DialogTitle>
                      <DialogDescription>
                        Envie um convite por email para que um novo usuário se cadastre no sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="invite-email">Email</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="email@exemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="invite-role">Função inicial</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value) => setInviteRole(value as UserRole)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="corretor">Corretor</SelectItem>
                            <SelectItem value="assistente">Assistente</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-1">
                          Você poderá alterar as permissões depois que o usuário aceitar o convite.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsInviteFormOpen(false)}>Cancelar</Button>
                      <Button 
                        onClick={handleSendInvite}
                        disabled={loadingAction === "invite"}
                      >
                        {loadingAction === "invite" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Enviar Convite
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Sistema de convites</h3>
                </div>
                <p className="text-sm">
                  O sistema de convites por email permite que você convide novos usuários para o sistema sem precisar criar manualmente suas contas.
                  Eles receberão um email com um link para definir suas senhas e acessar o sistema.
                </p>
              </div>
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
            <CardContent>
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-3">Administrador</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Acesso total ao sistema</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gerenciar usuários</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gerenciar permissões</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-3">Gerente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Gerenciar imóveis</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gerenciar leads</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Editar usuários</span>
                      <Badge variant="default" className="bg-red-500">Negado</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-3">Corretor</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Visualizar imóveis</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gerenciar leads próprios</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Gerenciar agenda própria</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card border rounded-lg p-5">
                  <h3 className="text-lg font-medium mb-3">Assistente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Visualizar leads</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Agendar visitas</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Editar imóveis</span>
                      <Badge variant="default" className="bg-red-500">Negado</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                As permissões são aplicadas automaticamente com base na função do usuário. Estas configurações não podem ser alteradas.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog de confirmação para excluir usuário */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O usuário perderá acesso ao sistema e todos os seus dados serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={loadingAction === "delete-" + userToDelete}
            >
              {loadingAction === "delete-" + userToDelete ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>Excluir</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição de usuário */}
      <Dialog open={isEditUserFormOpen} onOpenChange={setIsEditUserFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-nome">Nome</Label>
                <Input
                  id="edit-nome"
                  placeholder="Nome completo"
                  value={userToEdit.nome}
                  onChange={(e) => setUserToEdit({...userToEdit, nome: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={userToEdit.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-telefone">Telefone</Label>
                <Input
                  id="edit-telefone"
                  placeholder="(00) 00000-0000"
                  value={userToEdit.telefone || ""}
                  onChange={(e) => setUserToEdit({...userToEdit, telefone: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserFormOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={loadingAction === "edit-" + userToEdit?.id}
            >
              {loadingAction === "edit-" + userToEdit?.id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>Salvar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
