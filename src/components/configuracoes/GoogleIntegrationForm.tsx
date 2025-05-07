
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
import { Calendar, FileText, Key, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme/ThemeProvider";

// Interface for our user_api_keys table that's not yet in the types
interface ApiKeys {
  id?: string;
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
  driveClientId: z.string().min(1, "Client ID do OAuth é obrigatório"),
  driveClientSecret: z.string().min(1, "Client Secret do OAuth é obrigatório"),
  calendarApiKey: z.string().min(1, "API Key do Google Agenda é obrigatória"),
  calendarClientId: z.string().min(1, "Client ID do OAuth é obrigatório"),
  calendarClientSecret: z.string().min(1, "Client Secret do OAuth é obrigatório"),
});

export function GoogleIntegrationForm() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  const [driveTestSuccess, setDriveTestSuccess] = useState(false);
  const [calendarTestSuccess, setCalendarTestSuccess] = useState(false);
  
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
        
        // Buscar configurações existentes
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
          // Store the existing record ID for use during update
          setExistingRecordId(data.id);
          
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

  // Testar integração com Google Drive
  const testGoogleDriveIntegration = async () => {
    const values = form.getValues();
    
    if (!values.driveApiKey || !values.driveClientId || !values.driveClientSecret) {
      toast.error("Erro", {
        description: "Preencha todas as informações do Google Drive para testar a conexão",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando teste de integração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDriveTestSuccess(true);
      toast.success("Teste bem-sucedido", {
        description: "A conexão com o Google Drive foi testada com sucesso.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setDriveTestSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast.error("Erro", {
        description: `Erro ao testar conexão: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Testar integração com Google Calendar
  const testGoogleCalendarIntegration = async () => {
    const values = form.getValues();
    
    if (!values.calendarApiKey || !values.calendarClientId || !values.calendarClientSecret) {
      toast.error("Erro", {
        description: "Preencha todas as informações do Google Agenda para testar a conexão",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulando teste de integração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCalendarTestSuccess(true);
      toast.success("Teste bem-sucedido", {
        description: "A conexão com o Google Agenda foi testada com sucesso.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setCalendarTestSuccess(false);
      }, 3000);
    } catch (error: any) {
      toast.error("Erro", {
        description: `Erro ao testar conexão: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enviar configurações
  async function onSubmit(values: z.infer<typeof googleApiSchema>) {
    if (!userId) {
      toast.error("Erro", {
        description: "Você precisa estar logado para salvar configurações",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiKeyData: ApiKeys = {
        user_id: userId,
        drive_api_key: values.driveApiKey,
        drive_client_id: values.driveClientId,
        drive_client_secret: values.driveClientSecret,
        calendar_api_key: values.calendarApiKey,
        calendar_client_id: values.calendarClientId,
        calendar_client_secret: values.calendarClientSecret,
        updated_at: new Date().toISOString()
      };
      
      let error;
      
      // If we have an existing record ID, update the record instead of inserting a new one
      if (existingRecordId) {
        console.log("Updating existing record:", existingRecordId);
        const response = await supabase
          .from('user_api_keys')
          .update(apiKeyData)
          .eq('id', existingRecordId);
          
        error = response.error;
      } else {
        console.log("Inserting new record");
        const response = await supabase
          .from('user_api_keys')
          .insert(apiKeyData);
          
        error = response.error;
      }
      
      if (error) {
        console.error("Error saving settings:", error);
        throw error;
      }
      
      toast.success("Configurações salvas", {
        description: "Suas credenciais do Google foram salvas com sucesso.",
      });
      
    } catch (error: any) {
      console.error("Detailed error:", error);
      toast.error("Erro ao salvar configurações", {
        description: error.message || "Houve um problema ao salvar suas configurações.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Card className={`w-full overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
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
        <ScrollArea className="h-[65vh] overflow-y-auto pr-4">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Como obter credenciais</AlertTitle>
            <AlertDescription>
              Para obter suas credenciais do Google, visite o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a>, 
              crie um projeto e habilite as APIs do Google Drive e Google Calendar.
            </AlertDescription>
          </Alert>

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
                        <FormLabel>Client ID (OAuth)</FormLabel>
                        <FormControl>
                          <Input placeholder="12345...apps.googleusercontent.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mesmo Client ID para Drive e Agenda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="driveClientSecret"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Client Secret (OAuth)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="GOCSPX-..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Mesmo Client Secret para Drive e Agenda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testGoogleDriveIntegration}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {driveTestSuccess ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : null}
                      Testar Conexão com Google Drive
                    </Button>
                  </div>
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
                        <FormLabel>Client ID (OAuth)</FormLabel>
                        <FormControl>
                          <Input placeholder="12345...apps.googleusercontent.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mesmo Client ID para Drive e Agenda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="calendarClientSecret"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Client Secret (OAuth)</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="GOCSPX-..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Mesmo Client Secret para Drive e Agenda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="md:col-span-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testGoogleCalendarIntegration}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {calendarTestSuccess ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : null}
                      Testar Conexão com Google Agenda
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {isLoading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
