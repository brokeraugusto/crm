
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Upload, User, Mail, Phone, Building } from "lucide-react";

export default function MeuPerfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [creci, setCreci] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setNome(data.nome || "");
          setEmail(user.email || "");
          setTelefone(data.telefone || "");
          setEmpresa(data.empresa || "");
          setCreci(data.creci || "");
        }
        
        // Verificar se tem avatar
        const { data: avatarData } = await supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}`);
          
        if (avatarData?.publicUrl) {
          setAvatarUrl(avatarData.publicUrl);
        }
      } catch (error: any) {
        toast.error("Erro ao carregar perfil", { description: error.message });
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Atualizar perfil no banco de dados
      const { error } = await supabase
        .from("users")
        .update({
          nome,
          telefone,
          empresa,
          creci,
          updated_at: new Date(),
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Atualizar metadados de autenticação
      await supabase.auth.updateUser({
        data: { nome }
      });
      
      toast.success("Perfil atualizado com sucesso");
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}.${fileExt}`;
    
    setUploadingAvatar(true);
    try {
      // Criar o bucket se não existir
      const { error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024, // 1MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
      });
      
      if (bucketError && bucketError.message !== 'Bucket already exists') {
        throw bucketError;
      }
      
      // Fazer upload do avatar
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      
      if (error) throw error;
      
      // Obter a URL pública
      const { data } = await supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      if (data) {
        setAvatarUrl(data.publicUrl);
        toast.success("Avatar atualizado com sucesso");
      }
    } catch (error: any) {
      toast.error("Erro ao fazer upload do avatar", { description: error.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="info">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-28 w-28">
                  <AvatarImage src={avatarUrl || ""} alt={nome} />
                  <AvatarFallback className="text-3xl">
                    {nome?.split(" ").map(n => n[0]).join("").toUpperCase() || "CP"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>Atualizar foto</span>
                    </div>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </Label>
                </div>
              </div>
              
              <div className="w-full space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">
                      <User className="inline-block h-4 w-4 mr-1" />
                      Nome
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Seu nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline-block h-4 w-4 mr-1" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">
                      <Phone className="inline-block h-4 w-4 mr-1" />
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      placeholder="Seu telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">
                      <Building className="inline-block h-4 w-4 mr-1" />
                      Empresa/Imobiliária
                    </Label>
                    <Input
                      id="empresa"
                      placeholder="Nome da sua empresa"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creci">CRECI</Label>
                    <Input
                      id="creci"
                      placeholder="Seu número de CRECI"
                      value={creci}
                      onChange={(e) => setCreci(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Alterar Senha
              </Button>
              
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Sua conta foi criada em {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
