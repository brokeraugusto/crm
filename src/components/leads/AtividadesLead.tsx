
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calendar, Pencil, Trash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAtividades } from "@/hooks/useAtividades";
import { AtividadeForm } from "./AtividadeForm";
import { Atividade } from "@/types/leads";

interface AtividadesLeadProps {
  leadId: string;
}

// Define cores para tipos de atividades
const tipoAtividadeCores: Record<string, string> = {
  visita: "bg-purple-100 text-purple-700",
  reuniao: "bg-blue-100 text-blue-700",
  ligacao: "bg-green-100 text-green-700",
  email: "bg-yellow-100 text-yellow-700",
  contrato: "bg-orange-100 text-orange-700",
  outro: "bg-gray-100 text-gray-700",
};

export function AtividadesLead({ leadId }: AtividadesLeadProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);
  
  const { 
    atividades, 
    isLoading, 
    criarAtividade, 
    atualizarAtividade,
    excluirAtividade 
  } = useAtividades(leadId);

  const handleSubmitAtividade = (data: any) => {
    if (editingAtividade) {
      atualizarAtividade.mutate({
        id: editingAtividade.id,
        ...data
      }, {
        onSuccess: () => {
          setOpenDialog(false);
          setEditingAtividade(null);
        }
      });
    } else {
      criarAtividade.mutate(data, {
        onSuccess: () => {
          setOpenDialog(false);
        }
      });
    }
  };

  const handleEdit = (atividade: Atividade) => {
    setEditingAtividade(atividade);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta atividade?")) {
      excluirAtividade.mutate(id);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "PPP 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Atividades</h3>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingAtividade(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              <span>Nova Atividade</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAtividade ? "Editar Atividade" : "Nova Atividade"}
              </DialogTitle>
            </DialogHeader>
            <AtividadeForm 
              leadId={leadId} 
              defaultValues={editingAtividade || undefined}
              onSubmit={handleSubmitAtividade}
              isLoading={criarAtividade.isPending || atualizarAtividade.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : atividades.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Nenhuma atividade registrada para este lead.
        </div>
      ) : (
        <div className="space-y-4">
          {atividades.map((atividade) => (
            <Card key={atividade.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Badge className={tipoAtividadeCores[atividade.tipo] || "bg-gray-100 text-gray-700"}>
                      {atividade.tipo}
                    </Badge>
                    <h4 className="font-semibold">{atividade.titulo}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEdit(atividade)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDelete(atividade.id)}
                      disabled={excluirAtividade.isPending}
                    >
                      {excluirAtividade.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatarData(atividade.data)} • Duração: {atividade.duracao}
                  </p>
                  {atividade.endereco && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Local: {atividade.endereco}
                    </p>
                  )}
                </div>
                {atividade.descricao && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    {atividade.descricao}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
