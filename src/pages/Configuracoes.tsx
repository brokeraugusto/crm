import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Moon, Sun, Cloud, Calendar, Key, Save, Eye, EyeOff, UserPlus, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useRoles, UserRole } from "@/hooks/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserWithRoles {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  roles: string[];
}

// Define a complete type for the user data from the users table
interface UserData {
  id: string;
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  avatar_url?: string | null;
  empresa?: string | null;
  creci?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow other properties that might exist
}

export default function Configuracoes() {
  const { theme, setTheme } = useTheme();
  const [googleDriveApiKey, setGoogleDriveApiKey] = useState(
    localStorage.getItem("googleDriveApiKey") || ""
  );
  const [googleCalendarApiKey, setGoogleCalendarApiKey] = useState(
    localStorage.getItem("googleCalendarApiKey") || ""
  );
  const [showKeys, setShowKeys] = useState(false);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("corretor");
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  
  const { hasPermission, assignRole, removeRole, getUserWithRoles } = useRoles();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasAdminAccess = await hasPermission('users', 'manage');
      setIsAdmin(hasAdminAccess);
      
      if (hasAdminAccess) {
        loadUsers();
      }
    };
    
    checkPermissions();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Obter todos os usuários e suas funções
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Obter dados adicionais dos usuários da tabela 'users'
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) throw usersError;
      
      // Obter roles de cada usuário
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) throw rolesError;
      
      // Mapear as roles para cada usuário
      const usersWithRoles: UserWithRoles[] = authUsers.users.map(authUser => {
        // Garantir que userData seja tratado como UserData para ter acesso à propriedade avatar_url
        const userData = usersData?.find(u => u.id === authUser.id) as UserData || {} as UserData;
        const userRoles = rolesData?.filter(r => r.user_id === authUser.id).map(r => r.role) || [];
        
        return {
          id: authUser.id,
          nome: userData.nome || authUser.user_metadata?.nome || authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          telefone: userData.telefone || '',
          avatar_url: userData.avatar_url || '',
          roles: userRoles
        };
      });
      
      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeys = () => {
    // Salvar as chaves no localStorage
    localStorage.setItem("googleDriveApiKey", googleDriveApiKey);
    localStorage.setItem("googleCalendarApiKey", googleCalendarApiKey);
    
    toast.success("Configurações salvas", {
      description: "Suas chaves de API foram salvas com sucesso."
    });
  };

  const handleInviteUser = async () => {
    if (!userEmail || !selectedRole) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    setLoading(true);
    try {
      // Enviar convite por email (depende da configuração do Supabase)
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(userEmail);
      
      if (error) throw error;
      
      toast.success("Convite enviado com sucesso", {
        description: `Um email foi enviado para ${userEmail} com instruções de cadastro.`
      });
      
      // Limpar formulário
      setUserEmail("");
      loadUsers();
    } catch (error: any) {
      console.error("Erro ao convidar usuário:", error);
      toast.error("Erro ao convidar usuário", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId: string, role: UserRole, hasRole: boolean) => {
    setProcessingUserId(userId);
    try {
      if (hasRole) {
        // Remover role
        await removeRole(userId, role);
      } else {
        // Adicionar role
        await assignRole(userId, role);
      }
      
      // Atualizar lista de usuários
      await loadUsers();
    } catch (error: any) {
      console.error("Erro ao gerenciar permissão:", error);
      toast.error("Erro ao gerenciar permissão", {
        description: error.message
      });
    } finally {
      setProcessingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'gerente': return 'bg-purple-500';
      case 'corretor': return 'bg-blue-500';
      case 'assistente': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema.
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? "usuarios" : "aparencia"} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios">Usuários e Permissões</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Sun className="h-5 w-5 dark-visible" />
                  <Label htmlFor="dark-mode">Modo escuro</Label>
                  <Moon className="h-5 w-5 dark-visible" />
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integracoes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Integrações API</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowKeys(!showKeys)}
              >
                {showKeys ? (
                  <><EyeOff className="h-4 w-4 mr-2" /> Ocultar</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" /> Mostrar</>
                )}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-primary" />
                    <Label htmlFor="google-drive-api">Google Drive API Key</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="google-drive-api"
                      type={showKeys ? "text" : "password"}
                      placeholder="Insira sua chave de API do Google Drive"
                      value={googleDriveApiKey}
                      onChange={(e) => setGoogleDriveApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use para integrar o armazenamento de documentos no Google Drive.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Label htmlFor="google-calendar-api">Google Calendar API Key</Label>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="google-calendar-api"
                      type={showKeys ? "text" : "password"}
                      placeholder="Insira sua chave de API do Google Calendar"
                      value={googleCalendarApiKey}
                      onChange={(e) => setGoogleCalendarApiKey(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use para sincronizar atividades com seu Google Calendar.
                  </p>
                </div>

                <Button onClick={handleSaveKeys}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="usuarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Convidar Novo Usuário</CardTitle>
                <CardDescription>
                  Envie um convite para novos usuários se cadastrarem no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Email do usuário"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as UserRole)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="corretor">Corretor</SelectItem>
                      <SelectItem value="assistente">Assistente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleInviteUser} 
                    disabled={loading || !userEmail}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Convidar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários e Permissões</CardTitle>
                <CardDescription>
                  Gerencie os usuários e seus níveis de acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-container">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Funções</TableHead>
                        <TableHead>Administrador</TableHead>
                        <TableHead>Gerente</TableHead>
                        <TableHead>Corretor</TableHead>
                        <TableHead>Assistente</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 && !loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      ) : loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={user.avatar_url || ""} alt={user.nome} />
                                <AvatarFallback className="text-xs">
                                  {user.nome.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="dark-visible">{user.nome}</span>
                            </TableCell>
                            <TableCell className="dark-visible">{user.email}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <Badge key={role} className={`${getRoleBadgeColor(role)} dark-visible`}>
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={processingUserId === user.id}
                                className={`size-8 ${user.roles.includes('admin') ? 'text-green-500' : 'text-muted-foreground'}`}
                                onClick={() => handleToggleRole(user.id, 'admin', user.roles.includes('admin'))}
                              >
                                {processingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.roles.includes('admin') ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={processingUserId === user.id}
                                className={`size-8 ${user.roles.includes('gerente') ? 'text-green-500' : 'text-muted-foreground'}`}
                                onClick={() => handleToggleRole(user.id, 'gerente', user.roles.includes('gerente'))}
                              >
                                {processingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.roles.includes('gerente') ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={processingUserId === user.id}
                                className={`size-8 ${user.roles.includes('corretor') ? 'text-green-500' : 'text-muted-foreground'}`}
                                onClick={() => handleToggleRole(user.id, 'corretor', user.roles.includes('corretor'))}
                              >
                                {processingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.roles.includes('corretor') ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={processingUserId === user.id}
                                className={`size-8 ${user.roles.includes('assistente') ? 'text-green-500' : 'text-muted-foreground'}`}
                                onClick={() => handleToggleRole(user.id, 'assistente', user.roles.includes('assistente'))}
                              >
                                {processingUserId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.roles.includes('assistente') ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
