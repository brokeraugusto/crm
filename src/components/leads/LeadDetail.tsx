
import { useState } from "react";
import { 
  ArrowLeft, Users, Calendar, Home, Edit, Trash, Loader2 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/leads";
import { ImoveisVinculados } from "./ImoveisVinculados";
import { AtividadesLead } from "./AtividadesLead";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "./LeadForm";
import { useLeads } from "@/hooks/useLeads";

// Status dos leads com suas respectivas cores
const statusMap: Record<string, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contato: { label: "Contato", color: "bg-yellow-100 text-yellow-700" },
  visita: { label: "Visita", color: "bg-purple-100 text-purple-700" },
  proposta: { label: "Proposta", color: "bg-orange-100 text-orange-700" },
  vendido: { label: "Vendido", color: "bg-green-100 text-green-700" },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateLead, deleteLead } = useLeads();
  const [openDialog, setOpenDialog] = useState(false);
  
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      if (!id) throw new Error("ID do lead não informado");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast({
          title: "Erro ao buscar lead",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Lead;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Lead não encontrado.</p>
        <Button variant="link" onClick={() => navigate("/leads")}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  const handleUpdateLead = (data: any) => {
    updateLead.mutate(
      { id: lead.id, ...data },
      {
        onSuccess: () => {
          setOpenDialog(false);
        },
      }
    );
  };

  const handleDeleteLead = () => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteLead.mutate(lead.id, {
        onSuccess: () => {
          navigate("/leads");
          toast({
            title: "Lead excluído com sucesso",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold tracking-tight">{lead.nome}</h1>
            <Badge className={statusMap[lead.status].color}>
              {statusMap[lead.status].label}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <Button variant="outline" onClick={() => setOpenDialog(true)}>
              <Edit className="h-4 w-4 mr-2" />
              <span>Editar</span>
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Lead</DialogTitle>
              </DialogHeader>
              <LeadForm 
                defaultValues={lead}
                onSubmit={handleUpdateLead}
                isLoading={updateLead.isPending}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="destructive" 
            onClick={handleDeleteLead}
            disabled={deleteLead.isPending}
          >
            {deleteLead.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash className="h-4 w-4 mr-2" />
            )}
            <span>Excluir</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{lead.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={statusMap[lead.status].color}>
                  {statusMap[lead.status].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{lead.telefone || "Não informado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email || "Não informado"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Interesse</p>
                <p className="font-medium">{lead.interesse || "Não informado"}</p>
              </div>
              {lead.observacao && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Observação</p>
                  <p className="font-medium">{lead.observacao}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Data de Cadastro</p>
              <p className="font-medium">
                {format(new Date(lead.created_at), "PPP", { locale: ptBR })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-medium">
                {format(new Date(lead.updated_at), "PPP", { locale: ptBR })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="atividades">
        <TabsList>
          <TabsTrigger value="atividades" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Atividades
          </TabsTrigger>
          <TabsTrigger value="imoveis" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            Imóveis
          </TabsTrigger>
        </TabsList>
        <TabsContent value="atividades" className="mt-4">
          <AtividadesLead leadId={lead.id} />
        </TabsContent>
        <TabsContent value="imoveis" className="mt-4">
          <ImoveisVinculados leadId={lead.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
