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
  Pencil,
  Users,
  Settings
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
import { useUserRelationships } from "@/hooks/useUserRelationships";
import { EmailTemplateEditor, EmailTemplateData } from "@/components/ui/email-template-editor";

interface UserData {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  avatar_url?: string;
  roles: UserRole[];
  created_at?: string;
  managerId?: string;
  managerName?: string;
  subordinates?: Array<{id: string, nome: string, role: string}>;
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
  const [isEmailTemplateOpen, setIsEmailTemplateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [isManagerAssignOpen, setIsManagerAssignOpen] = useState(false);
  const [selectedSubordinate, setSelectedSubordinate] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [managers, setManagers] = useState<UserData[]>([]);
  const [activeUserRolesToEdit, setActiveUserRolesToEdit] = useState<string | null>(null);
  
  // Email template state
  const [emailTemplate, setEmailTemplate] = useState<EmailTemplateData>({
    subject: "Convite para Casa Próxima",
    body: `Olá,
    
Você foi convidado para participar do sistema Casa Próxima.
    
Clique no link abaixo para criar sua conta e começar a utilizar o sistema:
[LINK_CONVITE]
    
Se você tiver alguma dúvida, entre em contato com o administrador.
    
Atenciosamente,
Equipe Casa Próxima`
  });
  
  // Form states
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    telefone: "",
    roles: [] as UserRole[]
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("corretor");
  const [inviteManager, setInviteManager] = useState<string | null>(null);

  const { getAllUsersWithRoles, assignRole, removeRole } = useRoles();
  const { assignUserToManager, removeUserFromManager, getUserManager } = useUserRelationships();
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
      
      // Get managers (users with "gerente" role)
      const managersList = allUsers.filter(user => 
        user.roles.includes("gerente")
      );
      
      setManagers(managersList.map(manager => ({
        id: manager.id,
        email: manager.email || "",
        nome: manager.nome || "",
        roles: manager.roles
      })));
      
      // For each user, get their manager if they have one
      const usersWithManagers = await Promise.all(allUsers.map(async (user) => {
        if (user.roles.includes("corretor") || user.roles.includes("assistente")) {
          const managerInfo = await getUserManager(user.id);
          
          if (managerInfo) {
            return {
              ...user,
              managerId: managerInfo.manager_id,
              managerName: managerInfo.users?.nome || "Unknown"
            };
          }
        }
        
        return user;
      }));
      
      setUsers(usersWithManagers);
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
      // Enviar convite por email com template personalizado
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail, {
        data: {
          role: inviteRole,
          manager_id: inviteManager,
          invite_subject: emailTemplate.subject,
          invite_message: emailTemplate.body
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Atribuir role selecionada
        await assignRole(data.user.id, inviteRole);
        
        // Se selecionou um gerente, atribuir o usuário ao gerente
        if (inviteManager && (inviteRole === 'corretor' || inviteRole === 'assistente')) {
          await assignUserToManager(inviteManager, data.user.id);
        }
        
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
        setInviteManager(null);
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
  
  // Função para atribuir um subordinado a um gerente
  const handleAssignToManager = async () => {
    if (!selectedSubordinate || !selectedManager) {
      toast.error("Selecione o usuário e o gerente");
      return;
    }
    
    setLoadingAction("assign");
    try {
      await assignUserToManager(selectedManager, selectedSubordinate);
      
      // Atualizar a lista de usuários
      await loadUsers();
      
      setIsManagerAssignOpen(false);
      setSelectedSubordinate(null);
      setSelectedManager(null);
    } catch (error: any) {
      console.error("Erro ao atribuir gerente:", error);
      toast.error(`Erro ao atribuir gerente: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };
  
  // Função para remover um subordinado de um gerente
  const handleRemoveFromManager = async (userId: string, managerId: string) => {
    setLoadingAction("unassign-" + userId);
    try {
      await removeUserFromManager(managerId, userId);
      
      // Atualizar a lista de usuários
      await loadUsers();
    } catch (error: any) {
      console.error("Erro ao remover gerente:", error);
      toast.error(`Erro ao remover gerente: ${error.message}`);
    } finally {
      setLoadingAction(null);
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
  
  // Função para salvar template de email
  const handleSaveEmailTemplate = (template: EmailTemplateData) => {
    setEmailTemplate(template);
    setIsEmailTemplateOpen(false);
    toast.success("Template de email salvo com sucesso");
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
              {user.managerId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Gerente: {user.managerName}
                </p>
              )}
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
        const userId = row.original.id;
        
        return (
          <div className="flex flex-wrap gap-1 items-center">
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
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1"
              onClick={() => setActiveUserRolesToEdit(userId === activeUserRolesToEdit ? null : userId)}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            
            {activeUserRolesToEdit === userId && (
              <div className="absolute z-50 mt-32 ml-16 bg-popover border rounded-md shadow-md p-2 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant={roles.includes("admin") ? "default" : "outline"}
                    className={roles.includes("admin") ? "bg-red-500 hover:bg-red-600" : ""}
                    onClick={() => handleRoleChange(userId, "admin", roles.includes("admin"))}
                    disabled={loadingAction === userId + "admin"}
                  >
                    {loadingAction === userId + "admin" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : roles.includes("admin") ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Admin</>
                    ) : 'Admin'}
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
                    ) : roles.includes("gerente") ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Gerente</>
                    ) : 'Gerente'}
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
                    ) : roles.includes("corretor") ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Corretor</>
                    ) : 'Corretor'}
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
                    ) : roles.includes("assistente") ? (
                      <><Check className="h-3.5 w-3.5 mr-1" /> Assistente</>
                    ) : 'Assistente'}
                  </Button>
                </div>
              </div>
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
        const isCurrentUser = userId === user?.id;
        const isManager = row.original.roles.includes("gerente");
        const hasManager = row.original.managerId !== undefined;
        const roles = row.original.roles;
        
        return (
          <div className="flex flex-wrap gap-2 min-w-[120px]">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => handlePrepareEdit(row.original)}
              disabled={loadingAction === "edit-" + userId}
            >
              <Pencil className="h-3.5 w-3.5" />
              {loadingAction === "edit-" + userId ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Editar"
              )}
            </Button>
            
            {/* Botão para atribuir/remover gerente */}
            {!isManager && (
              hasManager ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => handleRemoveFromManager(userId, row.original.managerId!)}
                  disabled={loadingAction === "unassign-" + userId}
                >
                  {loadingAction === "unassign-" + userId ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Users className="h-3.5 w-3.5" />
                      Remover Gerente
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setSelectedSubordinate(userId);
                    setIsManagerAssignOpen(true);
                  }}
                >
                  <Users className="h-3.5 w-3.5" />
                  Atribuir Gerente
                </Button>
              )
            )}
            
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
                  <DialogContent className="max-w-md">
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
            <CardContent className="overflow-x-auto">
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
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Template de Email</CardTitle>
                <CardDescription>
                  Personalize o email enviado aos novos usuários
                </CardDescription>
              </div>
              <Button 
                onClick={() => setIsEmailTemplateOpen(true)}
                variant="outline"
              >
                Editar Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Assunto: {emailTemplate.subject}</h4>
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {emailTemplate.body}
                </div>
              </div>
            </CardContent>
          </Card>

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
                      </div>
                      {(inviteRole === 'corretor' || inviteRole === 'assistente') && (
                        <div className="grid gap-2">
                          <Label htmlFor="invite-manager">Atribuir a um Gerente</Label>
                          <Select
                            value={inviteManager || ""}
                            onValueChange={(value) => setInviteManager(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um gerente (opcional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Sem gerente</SelectItem>
                              {managers.map(manager => (
                                <SelectItem key={manager.id} value={manager.id}>
                                  {manager.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground mt-1">
                            O gerente poderá visualizar e gerenciar os dados deste usuário.
                          </p>
                        </div>
                      )}
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
                Hierarquia de acesso para diferentes funções
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
                      <span>Ver dados de corretores subordinados</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ver dados de assistentes de seus corretores</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
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
                      <span>Ver dados de assistentes subordinados</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ver dados de outros corretores</span>
                      <Badge variant="default" className="bg-red-500">Negado</Badge>
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
                      <span>Ver dados de outros assistentes</span>
                      <Badge variant="default" className="bg-red-500">Negado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ver dados do corretor atribuído</span>
                      <Badge variant="default" className="bg-green-500">Permitido</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                A hierarquia de permissões define quem pode acessar os dados de quem no sistema. Administradores podem acessar todos os dados, Gerentes podem acessar os dados dos seus corretores e assistentes, Corretores podem acessar os dados dos seus assistentes.
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
      
      {/* Dialog de atribuição de gerente */}
      <Dialog open={isManagerAssignOpen} onOpenChange={setIsManagerAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Gerente</DialogTitle>
            <DialogDescription>
              Selecione um gerente para atribuir ao usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-manager">Gerente</Label>
              <Select
                value={selectedManager || ""}
                onValueChange={(value) => setSelectedManager(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gerente" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map(manager => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagerAssignOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleAssignToManager}
              disabled={!selectedManager || loadingAction === "assign"}
            >
              {loadingAction === "assign" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>Atribuir Gerente</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição de template de email */}
      <Dialog open={isEmailTemplateOpen} onOpenChange={setIsEmailTemplateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Personalizar Email de Convite</DialogTitle>
            <DialogDescription>
              Edite o template de email enviado para novos usuários
            </DialogDescription>
          </DialogHeader>
          <EmailTemplateEditor 
            initialValue={emailTemplate} 
            onSave={handleSaveEmailTemplate}
            onCancel={() => setIsEmailTemplateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
