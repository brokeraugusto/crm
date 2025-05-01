
import React from "react";
import { Atividade } from "@/types/leads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Share2, BellRing } from "lucide-react";
import { useAgendaOperations } from "@/hooks/useAgendaOperations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoEventoMap: Record<string, { label: string; color: string }> = {
  visita: {
    label: "Visita",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  reuniao: {
    label: "Reunião",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  contato: {
    label: "Contato",
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  assinatura: {
    label: "Assinatura",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  vistoria: {
    label: "Vistoria",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
};

interface AtividadeDetailProps {
  atividade: Atividade;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function AtividadeDetail({
  atividade,
  isOpen,
  onOpenChange,
  onEdit,
}: AtividadeDetailProps) {
  const { excluirAtividade } = useAgendaOperations();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await excluirAtividade.mutateAsync(atividade.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{atividade.titulo}</span>
              <Badge 
                className={tipoEventoMap[atividade.tipo]?.color || "bg-gray-100 text-gray-700"}
              >
                {tipoEventoMap[atividade.tipo]?.label || atividade.tipo}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-md">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {format(new Date(atividade.data), "PPP", { locale: ptBR })} às {format(new Date(atividade.data), "HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duração: {atividade.duracao}
                </p>
              </div>
            </div>

            {atividade.cliente && (
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{atividade.cliente}</p>
              </div>
            )}

            {atividade.endereco && (
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p>{atividade.endereco}</p>
              </div>
            )}

            {atividade.descricao && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p>{atividade.descricao}</p>
              </div>
            )}

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Ações rápidas</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Google Agenda</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <BellRing className="h-4 w-4" />
                  <span>Adicionar lembrete</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  <span>Compartilhar</span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between mt-6">
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Atividade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
