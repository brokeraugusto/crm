
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

      <ScrollArea className="h-[calc(100vh-12rem)] w-full">
        <div className="pr-4 pb-8">
          <Tabs defaultValue="integracoes" className="w-full">
            <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
              <TabsTrigger value="integracoes" className="mb-1 sm:mb-0">Integrações Google</TabsTrigger>
              <TabsTrigger value="webhooks" className="mb-1 sm:mb-0">Webhooks (n8n)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="integracoes" className="space-y-6 w-full">
              <GoogleIntegrationForm />
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-6 w-full">
              <WebhookIntegrationForm />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
