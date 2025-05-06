
import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AtividadeForm } from "@/components/agenda/AtividadeForm";
import { AtividadeDetail } from "@/components/agenda/AtividadeDetail";
import { Atividade } from "@/types/leads";
import { useTodasAtividades } from "@/hooks/useTodasAtividades";
import { AgendaHeader } from "@/components/agenda/AgendaHeader";
import { AgendaSidebar } from "@/components/agenda/AgendaSidebar";
import { AgendaContent } from "@/components/agenda/AgendaContent";
import { eventTypes } from "@/components/agenda/EventTypeConfig";

export default function Agenda() {
  const { atividades, isLoading } = useTodasAtividades();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState<Atividade | null>(null);
  
  // Filtra eventos do dia selecionado
  const eventosHoje = !isLoading ? atividades.filter(
    (evento) => format(new Date(evento.data), "yyyy-MM-dd") === format(date || new Date(), "yyyy-MM-dd")
  ) : [];

  // Ordena por horário
  eventosHoje.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  
  const handleOpenForm = (atividade?: Atividade) => {
    if (atividade) {
      setAtividadeSelecionada(atividade);
      setEditMode(true);
    } else {
      setAtividadeSelecionada(null);
      setEditMode(false);
    }
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleOpenDetail = (atividade: Atividade) => {
    setAtividadeSelecionada(atividade);
    setDetailOpen(true);
  };

  const handleEditFromDetail = () => {
    if (atividadeSelecionada) {
      setDetailOpen(false);
      setEditMode(true);
      setFormOpen(true);
    }
  };

  // Contador de eventos por dia para o calendário
  const eventCountByDate = !isLoading ? atividades.reduce<Record<string, number>>((acc, evento) => {
    const dateStr = format(new Date(evento.data), "yyyy-MM-dd");
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {}) : {};

  return (
    <div className="space-y-6 animate-fade-in">
      <AgendaHeader onNewActivity={() => handleOpenForm()} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AgendaSidebar 
          date={date} 
          setDate={setDate} 
          eventCountByDate={eventCountByDate} 
          eventTypes={eventTypes}
        />

        <AgendaContent 
          date={date}
          setDate={setDate}
          isLoading={isLoading}
          eventTypes={eventTypes}
          eventosHoje={eventosHoje}
          onOpenDetail={handleOpenDetail}
          onOpenForm={handleOpenForm}
        />
      </div>

      {/* Dialog para formulário de atividade */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editMode ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
          </DialogHeader>
          <AtividadeForm 
            atividadeParaEditar={editMode ? atividadeSelecionada || undefined : undefined} 
            onClose={() => setFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Componente para detalhes da atividade */}
      {atividadeSelecionada && (
        <AtividadeDetail
          atividade={atividadeSelecionada}
          isOpen={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}
