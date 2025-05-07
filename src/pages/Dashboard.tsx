
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, HousePlus, CalendarPlus, FilePlus, Users, Building2, Calendar, FileText, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useLeads } from "@/hooks/useLeads";
import { useImoveis } from "@/hooks/useImoveis";
import { useTodasAtividades } from "@/hooks/useTodasAtividades";
import { useDocumentos } from "@/hooks/useDocumentos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { isMasterAdmin } = useAdmin();
  const { leads } = useLeads();
  const { imoveis } = useImoveis();
  const { atividades } = useTodasAtividades();
  const { loading: documentosLoading, gerarDocumento } = useDocumentos();
  
  // Calcular o número de documentos (simulação já que não temos esse dado diretamente)
  const documentos = [];
  
  const dataAtual = new Date();
  const inicioSemana = new Date(dataAtual);
  inicioSemana.setDate(dataAtual.getDate() - dataAtual.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  
  const atividadesHoje = atividades?.filter(atividade => {
    const dataAtividade = new Date(atividade.data);
    return dataAtividade.toDateString() === dataAtual.toDateString();
  }) || [];
  
  const atividadesSemana = atividades?.filter(atividade => {
    const dataAtividade = new Date(atividade.data);
    return dataAtividade >= inicioSemana && dataAtividade <= fimSemana;
  }) || [];
  
  const hoje = format(dataAtual, "EEEE, d 'de' MMMM", { locale: ptBR });
  const semana = `${format(inicioSemana, "d 'de' MMMM", { locale: ptBR })} - ${format(fimSemana, "d 'de' MMMM", { locale: ptBR })}`;
  
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
      
      {/* Resumo de funcionalidades */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>Leads</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link to="/leads">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Leads cadastrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                <span>Imóveis</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link to="/imoveis">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imoveis?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Imóveis cadastrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>Agenda</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link to="/agenda">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{atividadesHoje.length}</div>
            <p className="text-xs text-muted-foreground">Atividades hoje</p>
            <div className="text-sm mt-2">{atividadesSemana.length} esta semana</div>
            <p className="text-xs text-muted-foreground">{semana}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span>Documentos</span>
              </div>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link to="/documentos">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Documentos gerados</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Atividades do dia */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Atividades para hoje ({hoje})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {atividadesHoje.length > 0 ? (
            <div className="space-y-2">
              {atividadesHoje.slice(0, 3).map((atividade) => (
                <div key={atividade.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">{atividade.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(atividade.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {atividade.cliente || 'Sem cliente'}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/agenda?id=${atividade.id}`}>Ver</Link>
                  </Button>
                </div>
              ))}
              {atividadesHoje.length > 3 && (
                <Button variant="outline" asChild className="w-full mt-2">
                  <Link to="/agenda">Ver todas ({atividadesHoje.length})</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>Não há atividades para hoje</p>
              <Button variant="outline" asChild className="mt-2">
                <Link to="/agenda?new=true">
                  <CalendarPlus className="h-4 w-4 mr-1" />
                  <span>Agendar atividade</span>
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sistema integrado - visible only for master admin */}
      {isMasterAdmin && (
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
      )}
    </div>
  );
}
