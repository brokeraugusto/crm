
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

// Interface for our user_api_keys table that's not yet in the types
interface ApiKeys {
  id: string;
  user_id: string;
  drive_api_key: string | null;
  drive_client_id: string | null;
  drive_client_secret: string | null;
  calendar_api_key: string | null;
  calendar_client_id: string | null;
  calendar_client_secret: string | null;
  created_at?: string;
  updated_at?: string;
}

const googleApiSchema = z.object({
  driveApiKey: z.string().min(1, "API Key do Google Drive é obrigatória"),
  driveClientId: z.string().min(1, "Client ID do Google Drive é obrigatório"),
  driveClientSecret: z.string().min(1, "Client Secret do Google Drive é obrigatório"),
  calendarApiKey: z.string().min(1, "API Key do Google Agenda é obrigatória"),
  calendarClientId: z.string().min(1, "Client ID do Google Agenda é obrigatório"),
  calendarClientSecret: z.string().min(1, "Client Secret do Google Agenda é obrigatório"),
});

export function GoogleIntegrationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Formulário
  const form = useForm<z.infer<typeof googleApiSchema>>({
    resolver: zodResolver(googleApiSchema),
    defaultValues: {
      driveApiKey: "",
      driveClientId: "",
      driveClientSecret: "",
      calendarApiKey: "",
      calendarClientId: "",
      calendarClientSecret: "",
    },
  });
  
  // Carregar as configurações existentes do usuário
  useEffect(() => {
    async function loadUserConfig() {
      try {
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUserId(user.id);
        
        // Buscar configurações existentes usando 'as any' to bypass TypeScript errors
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('*')
          .eq('user_id', user.id)
          .single() as { data: ApiKeys | null, error: any };
          
        if (error) {
          console.log("Configurações não encontradas ou novo usuário");
          return;
        }
        
        if (data) {
          form.reset({
            driveApiKey: data.drive_api_key || "",
            driveClientId: data.drive_client_id || "",
            driveClientSecret: data.drive_client_secret || "",
            calendarApiKey: data.calendar_api_key || "",
            calendarClientId: data.calendar_client_id || "",
            calendarClientSecret: data.calendar_client_secret || ""
          });
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
    
    loadUserConfig();
  }, [form]);
  
  // Enviar configurações
  async function onSubmit(values: z.infer<typeof googleApiSchema>) {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar configurações",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: userId,
          drive_api_key: values.driveApiKey,
          drive_client_id: values.driveClientId,
          drive_client_secret: values.driveClientSecret,
          calendar_api_key: values.calendarApiKey,
          calendar_client_id: values.calendarClientId,
          calendar_client_secret: values.calendarClientSecret,
          updated_at: new Date().toISOString()
        } as ApiKeys) as any;
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Configurações salvas",
        description: "Suas credenciais do Google foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <span>Configuração de APIs Google</span>
        </CardTitle>
        <CardDescription>
          Insira suas credenciais do Google para integrar com o Google Drive e Google Agenda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Google Drive</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driveApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="AIzaSyC..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="driveClientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder="12345...apps.googleusercontent.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="driveClientSecret"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="GOCSPX-..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium">Google Agenda</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="calendarApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input placeholder="AIzaSyC..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calendarClientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input placeholder="12345...apps.googleusercontent.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="calendarClientSecret"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="GOCSPX-..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
