
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AtividadeForm } from "@/components/agenda/AtividadeForm";
import { AtividadeDetail } from "@/components/agenda/AtividadeDetail";
import { Atividade } from "@/types/leads";
import { useTodasAtividades } from "@/hooks/useTodasAtividades";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos de eventos com cores
const eventTypes = {
  visita: {
    label: "Visita",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
  reuniao: {
    label: "Reunião",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  assinatura: {
    label: "Assinatura",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  contato: {
    label: "Contato",
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  },
  vistoria: {
    label: "Vistoria",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
};

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        </div>
        <Button className="flex items-center gap-1" onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" />
          <span>Nova Atividade</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              className="w-full"
              modifiers={{
                hasEvent: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  return !!eventCountByDate[dateStr];
                },
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: "bold",
                  backgroundColor: "rgba(var(--primary), 0.1)"
                },
              }}
            />
            <div className="p-4 border-t">
              <h3 className="font-medium mb-2">Tipos de Eventos</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(eventTypes).map(([key, { label, color }]) => (
                  <Badge key={key} className={`cursor-default ${color}`}>
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t">
              <h3 className="font-medium mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-primary"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Conectar com Google Agenda
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>
              Compromissos do dia{" "}
              <span className="font-normal">
                {format(date || new Date(), "d 'de' MMMM", { locale: ptBR })}
              </span>
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-auto justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>
                    {format(date || new Date(), "d 'de' MMMM", {
                      locale: ptBR,
                    })}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="mb-8 relative -ml-8 pl-8">
                    <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary/20"></div>
                    <div className="hover:bg-gray-50 p-4 rounded-lg transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))
              ) : eventosHoje.length > 0 ? (
                eventosHoje.map((evento) => (
                  <div
                    key={evento.id}
                    className="mb-8 relative hover:bg-gray-50 p-4 rounded-lg -ml-8 pl-8 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(evento)}
                  >
                    <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                      <div>
                        <Badge className={eventTypes[evento.tipo as keyof typeof eventTypes]?.color || "bg-gray-100 text-gray-700"}>
                          {eventTypes[evento.tipo as keyof typeof eventTypes]?.label || evento.tipo}
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-2">
                          {format(new Date(evento.data), "HH:mm")} • {evento.duracao}
                        </span>
                      </div>
                      <div>
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          handleOpenForm(evento);
                        }}>
                          Editar
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold">{evento.titulo}</h3>
                    {evento.cliente && (
                      <p className="text-sm">
                        Cliente: <span className="font-medium">{evento.cliente}</span>
                      </p>
                    )}
                    {evento.endereco && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {evento.endereco}
                      </p>
                    )}
                    {evento.descricao && (
                      <p className="text-sm mt-2">{evento.descricao}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum compromisso para esta data.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => handleOpenForm()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Atividade
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
