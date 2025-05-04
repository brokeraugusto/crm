
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoogleIntegrationForm } from "@/components/configuracoes/GoogleIntegrationForm";
import { WebhookIntegrationForm } from "@/components/configuracoes/WebhookIntegrationForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdmin } from "@/hooks/useAdmin";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Configuracoes() {
  const { isMasterAdmin } = useAdmin();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("integracoes");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "webhooks" && isMasterAdmin) {
      setActiveTab("webhooks");
    }
  }, [searchParams, isMasterAdmin]);

  return (
    <div className="space-y-6 max-w-full animate-fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie integrações e preferências do sistema
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] w-full pr-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="integracoes" className="mb-1 sm:mb-0">Integrações Google</TabsTrigger>
            {isMasterAdmin && (
              <TabsTrigger value="webhooks" className="mb-1 sm:mb-0">Webhooks (n8n)</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="integracoes" className="space-y-6 w-full">
            <GoogleIntegrationForm />
          </TabsContent>
          
          {isMasterAdmin ? (
            <TabsContent value="webhooks" className="space-y-6 w-full">
              <WebhookIntegrationForm />
            </TabsContent>
          ) : (
            <TabsContent value="webhooks" className="space-y-6 w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Acesso Restrito</CardTitle>
                  <CardDescription>
                    Esta funcionalidade está disponível apenas para administradores master do sistema.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </ScrollArea>
    </div>
  );
}
