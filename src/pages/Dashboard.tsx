
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, HousePlus, CalendarPlus, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTodasAtividades } from "@/hooks/useTodasAtividades";
import { useImoveis } from "@/hooks/useImoveis";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { atividades, isLoading: atividadesLoading } = useTodasAtividades();
  const { imoveis, isLoading: imoveisLoading } = useImoveis();
  const { leads, isLoading: leadsLoading } = useLeads();

  const atividadesHoje = atividades.filter(atividade => {
    const hoje = new Date();
    const dataAtividade = new Date(atividade.data);
    return dataAtividade.toDateString() === hoje.toDateString();
  });

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

      {/* Cards de estatísticas reais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Ativos
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-2xl font-bold">{leads.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total de leads cadastrados
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Imóveis Disponíveis
            </CardTitle>
            <HousePlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {imoveisLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-2xl font-bold">{imoveis.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total de imóveis cadastrados
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compromissos Hoje
            </CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {atividadesLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-2xl font-bold">{atividadesHoje.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Atividades para hoje
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Atividades Pendentes
            </CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {atividadesLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="text-2xl font-bold">{atividades.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total de atividades
            </p>
          </CardContent>
        </Card>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
