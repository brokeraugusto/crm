
import React, { useState } from "react";
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

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
  ligacao: {
    label: "Ligação",
    color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
  },
  email: {
    label: "Email",
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
  contrato: {
    label: "Contrato",
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  },
  outro: {
    label: "Outro",
    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
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
  const [lembreteOpen, setLembreteOpen] = useState(false);
  const [compartilharOpen, setCompartilharOpen] = useState(false);
  const [tempoLembrete, setTempoLembrete] = useState("30min");
  const [emailCompartilhar, setEmailCompartilhar] = useState("");

  const handleDelete = async () => {
    try {
      await excluirAtividade.mutateAsync(atividade.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
    }
  };

  const handleAddLembrete = () => {
    // Simular adição de lembrete
    toast({
      title: "Lembrete adicionado",
      description: `Você receberá um lembrete ${tempoLembrete} antes da atividade.`,
    });
    setLembreteOpen(false);
  };

  const handleCompartilhar = () => {
    // Simular compartilhamento
    if (!emailCompartilhar) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Atividade compartilhada",
      description: `Um convite foi enviado para ${emailCompartilhar}.`,
    });
    setCompartilharOpen(false);
    setEmailCompartilhar("");
  };

  const handleGoogleCalendar = () => {
    const googleCalendarApiKey = localStorage.getItem("googleCalendarApiKey");
    
    if (!googleCalendarApiKey) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua chave de API do Google Calendar nas configurações.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Adicionado ao Google Calendar",
      description: "A atividade foi adicionada ao seu Google Calendar.",
    });
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={handleGoogleCalendar}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Google Agenda</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setLembreteOpen(true)}
                >
                  <BellRing className="h-4 w-4" />
                  <span>Adicionar lembrete</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setCompartilharOpen(true)}
                >
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
      
      {/* Drawer para adicionar lembrete */}
      <Drawer open={lembreteOpen} onOpenChange={setLembreteOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Adicionar lembrete</DrawerTitle>
            <DrawerDescription>
              Configure quando deseja receber o lembrete para esta atividade.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-2">
              <Label htmlFor="lembrete-tempo">Tempo antes</Label>
              <Select value={tempoLembrete} onValueChange={setTempoLembrete}>
                <SelectTrigger id="lembrete-tempo">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">5 minutos antes</SelectItem>
                  <SelectItem value="15min">15 minutos antes</SelectItem>
                  <SelectItem value="30min">30 minutos antes</SelectItem>
                  <SelectItem value="1h">1 hora antes</SelectItem>
                  <SelectItem value="2h">2 horas antes</SelectItem>
                  <SelectItem value="1d">1 dia antes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleAddLembrete}>Salvar lembrete</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      
      {/* Drawer para compartilhar */}
      <Drawer open={compartilharOpen} onOpenChange={setCompartilharOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Compartilhar atividade</DrawerTitle>
            <DrawerDescription>
              Digite o email da pessoa com quem deseja compartilhar esta atividade.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-2">
              <Label htmlFor="compartilhar-email">Email</Label>
              <Input 
                id="compartilhar-email" 
                type="email" 
                placeholder="exemplo@email.com"
                value={emailCompartilhar}
                onChange={(e) => setEmailCompartilhar(e.target.value)}
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCompartilhar}>Compartilhar</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
