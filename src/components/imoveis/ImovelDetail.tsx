
import React from "react";
import { Imovel } from "@/types/leads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Link, Calendar, Mail, Building2, Share2 } from "lucide-react";
import { useImoveisOperations } from "@/hooks/useImoveisOperations";
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

const statusMap: Record<string, { label: string; color: string }> = {
  disponivel: { label: "Disponível", color: "bg-green-100 text-green-700" },
  reservado: { label: "Reservado", color: "bg-yellow-100 text-yellow-700" },
  vendido: { label: "Vendido", color: "bg-blue-100 text-blue-700" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
};

interface ImovelDetailProps {
  imovel: Imovel;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function ImovelDetail({
  imovel,
  isOpen,
  onOpenChange,
  onEdit,
}: ImovelDetailProps) {
  const { excluirImovel } = useImoveisOperations();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await excluirImovel.mutateAsync(imovel.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir imóvel:", error);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{imovel.titulo}</span>
              <Badge className={`${statusMap[imovel.status].color}`}>
                {statusMap[imovel.status].label}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={imovel.imagem || "/placeholder.svg"}
                  alt={imovel.titulo}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-lg">Detalhes</h3>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="border rounded p-2 text-center">
                    <p className="text-sm text-muted-foreground">Quartos</p>
                    <p className="font-semibold">{imovel.quartos}</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="text-sm text-muted-foreground">Banheiros</p>
                    <p className="font-semibold">{imovel.banheiros}</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <p className="text-sm text-muted-foreground">Área</p>
                    <p className="font-semibold">{imovel.area}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg">Informações</h3>
              <div className="space-y-3 mt-2">
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Tipo</p>
                  <p>{imovel.tipo}</p>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Endereço</p>
                  <p>{imovel.endereco}</p>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Preço</p>
                  <p className="text-primary font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(imovel.preco)}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <p className="text-muted-foreground text-sm">Descrição</p>
                  <p>{imovel.descricao || "Sem descrição"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <h3 className="font-semibold text-lg">Ações Rápidas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Link className="mr-2 h-4 w-4" />
                    Vincular Lead
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Visita
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar por Email
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartilhar
                  </Button>
                </div>
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
            <AlertDialogTitle>Excluir Imóvel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
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
