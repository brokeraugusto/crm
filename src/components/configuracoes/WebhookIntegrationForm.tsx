
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
import { AlertCircle, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const webhookSchema = z.object({
  webhookUrl: z.string().url("Por favor informe uma URL válida").min(1, "URL do webhook é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória")
});

interface WebhookConfig {
  id: string;
  user_id: string;
  webhook_url: string;
  description: string;
  created_at: string;
  updated_at?: string | null;
}

export function WebhookIntegrationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form initialization
  const form = useForm<z.infer<typeof webhookSchema>>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      webhookUrl: "",
      description: ""
    },
  });
  
  // Load existing webhooks
  useEffect(() => {
    async function loadWebhooks() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUserId(user.id);
        
        // Fetch existing webhooks using typed query
        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) {
          console.error("Error loading webhooks:", error);
          return;
        }
        
        if (data) {
          setWebhooks(data as WebhookConfig[]);
        }
      } catch (error) {
        console.error("Error loading webhooks:", error);
      }
    }
    
    loadWebhooks();
  }, []);
  
  // Test webhook
  const testWebhook = async (webhookUrl: string) => {
    try {
      setIsLoading(true);
      
      // Prepare test payload
      const testPayload = {
        type: "TEST",
        timestamp: new Date().toISOString(),
        message: "Este é um teste do Pleno CRM"
      };
      
      // Send request to webhook
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
        mode: 'no-cors' // Important to avoid CORS errors with webhooks
      });
      
      toast({
        title: "Webhook testado",
        description: "O webhook foi testado. Verifique sua integração para confirmar o recebimento.",
      });
    } catch (error: any) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Erro",
        description: `Erro ao testar webhook: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete webhook
  const deleteWebhook = async (webhookId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);
        
      if (error) throw error;
      
      // Update webhooks list
      setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
      
      toast({
        title: "Webhook removido",
        description: "O webhook foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Error removing webhook:", error);
      toast({
        title: "Erro",
        description: `Erro ao remover webhook: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add webhook
  async function onSubmit(values: z.infer<typeof webhookSchema>) {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar webhooks",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Add webhook
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: userId,
          webhook_url: values.webhookUrl,
          description: values.description
        })
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setWebhooks([...webhooks, data[0] as WebhookConfig]);
      }
      
      // Reset form
      form.reset();
      
      toast({
        title: "Webhook adicionado",
        description: "O webhook foi adicionado com sucesso.",
      });
    } catch (error: any) {
      console.error("Error adding webhook:", error);
      toast({
        title: "Erro",
        description: `Erro ao adicionar webhook: ${error.message}`,
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
          <Webhook className="h-5 w-5 text-primary" />
          <span>Webhooks para Integrações (n8n)</span>
        </CardTitle>
        <CardDescription>
          Configure webhooks para integrar com n8n, IA ou qualquer outro serviço externo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Informação</AlertTitle>
          <AlertDescription>
            Os webhooks permitem que serviços externos como n8n ou agentes de IA possam acessar e modificar dados do seu CRM.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Webhook</FormLabel>
                  <FormControl>
                    <Input placeholder="https://n8n.example.com/webhook/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    URL completa do webhook fornecida pelo n8n ou outro serviço
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Automação de Leads, Notificação de Imóveis..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Descreva o propósito deste webhook para referência futura
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adicionando..." : "Adicionar Webhook"}
              </Button>
            </div>
          </form>
        </Form>
        
        {webhooks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Webhooks Configurados</h3>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div 
                  key={webhook.id} 
                  className="p-4 border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{webhook.description}</p>
                    <p className="text-sm text-muted-foreground break-all">{webhook.webhook_url}</p>
                    <p className="text-xs text-muted-foreground">
                      Adicionado em {new Date(webhook.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end md:self-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => testWebhook(webhook.webhook_url)}
                      disabled={isLoading}
                    >
                      Testar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                      disabled={isLoading}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
