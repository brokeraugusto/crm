
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, HousePlus, CalendarPlus, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" className="flex items-center">
            <Link to="/leads?new=true">
              <UserPlus className="h-4 w-4 mr-1" />
              <span>Novo Lead</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="flex items-center">
            <Link to="/imoveis?new=true">
              <HousePlus className="h-4 w-4 mr-1" />
              <span>Novo Imóvel</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="flex items-center">
            <Link to="/agenda?new=true">
              <CalendarPlus className="h-4 w-4 mr-1" />
              <span>Nova Atividade</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="flex items-center">
            <Link to="/documentos?new=true">
              <FilePlus className="h-4 w-4 mr-1" />
              <span>Gerar Documento</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Sistema integrado */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Bem-vindo ao Pleno CRM</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>O sistema Pleno CRM está integrado com ferramentas Google para facilitar seu trabalho diário.</p>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" asChild>
                <Link to="/configuracoes">
                  Configurar Integração com Google
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/base-conhecimento">
                  Consultar Base de Conhecimento
                </Link>
              </Button>
            </div>
            
            <p className="pt-4">Configure webhooks para integrar com n8n, automações ou agentes de IA.</p>
            <div>
              <Button variant="outline" asChild>
                <Link to="/configuracoes?tab=webhooks">
                  Configurar Webhooks
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
