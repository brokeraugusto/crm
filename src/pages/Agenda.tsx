
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
};

// Dados de exemplo
const agendaData = [
  {
    id: 1,
    titulo: "Visita ao Apartamento Paulista",
    tipo: "visita",
    cliente: "Ana Silva",
    data: new Date(2023, 4, 15, 10, 30),
    duracao: "1 hora",
    endereco: "Av. Paulista, 1000, São Paulo",
    descricao: "Visita ao apartamento de 3 quartos na Av. Paulista",
  },
  {
    id: 2,
    titulo: "Reunião com Carlos",
    tipo: "reuniao",
    cliente: "Carlos Oliveira",
    data: new Date(2023, 4, 15, 14, 0),
    duracao: "30 minutos",
    endereco: "Escritório Central",
    descricao: "Discutir opções de financiamento",
  },
  {
    id: 3,
    titulo: "Assinatura de Contrato",
    tipo: "assinatura",
    cliente: "Mariana Santos",
    data: new Date(2023, 4, 16, 11, 0),
    duracao: "1 hora",
    endereco: "Escritório Central",
    descricao: "Assinatura de contrato do loft",
  },
  {
    id: 4,
    titulo: "Ligação para Paulo",
    tipo: "contato",
    cliente: "Paulo Mendes",
    data: new Date(2023, 4, 16, 15, 30),
    duracao: "15 minutos",
    endereco: "Telefônico",
    descricao: "Verificar interesse na cobertura duplex",
  },
  {
    id: 5,
    titulo: "Visita à Casa em Condomínio",
    tipo: "visita",
    cliente: "Fernanda Lima",
    data: new Date(2023, 4, 17, 9, 0),
    duracao: "2 horas",
    endereco: "Rua das Flores, 123, Alphaville",
    descricao: "Mostrar a casa de 4 quartos no condomínio",
  },
];

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Filtra eventos do dia selecionado
  const eventosHoje = agendaData.filter(
    (evento) => format(evento.data, "yyyy-MM-dd") === format(date || new Date(), "yyyy-MM-dd")
  );

  // Ordena por horário
  eventosHoje.sort((a, b) => a.data.getTime() - b.data.getTime());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Novo Compromisso</span>
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
              {eventosHoje.length > 0 ? (
                eventosHoje.map((evento) => (
                  <div
                    key={evento.id}
                    className="mb-8 relative hover:bg-gray-50 p-4 rounded-lg -ml-8 pl-8 transition-colors"
                  >
                    <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary"></div>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                      <div>
                        <Badge className={eventTypes[evento.tipo as keyof typeof eventTypes].color}>
                          {eventTypes[evento.tipo as keyof typeof eventTypes].label}
                        </Badge>
                        <span className="text-sm text-muted-foreground ml-2">
                          {format(evento.data, "HH:mm")} • {evento.duracao}
                        </span>
                      </div>
                      <div>
                        <Button size="sm" variant="outline">
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-bold">{evento.titulo}</h3>
                    <p className="text-sm">
                      Cliente: <span className="font-medium">{evento.cliente}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {evento.endereco}
                    </p>
                    <p className="text-sm mt-2">{evento.descricao}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Nenhum compromisso para esta data.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
