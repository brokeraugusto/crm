
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleIntegrationForm } from "@/components/configuracoes/GoogleIntegrationForm";
import { WebhookIntegrationForm } from "@/components/configuracoes/WebhookIntegrationForm";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Configuracoes() {
  return (
    <div className="space-y-6 max-w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie integrações e preferências do sistema
        </p>
      </div>

      <ScrollArea className="w-full">
        <Tabs defaultValue="integracoes" className="w-full">
          <TabsList>
            <TabsTrigger value="integracoes">Integrações Google</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks (n8n)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="integracoes" className="space-y-6 w-full">
            <GoogleIntegrationForm />
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-6 w-full">
            <WebhookIntegrationForm />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}
