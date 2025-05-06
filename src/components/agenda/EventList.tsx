
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Atividade } from "@/types/leads";

interface EventListProps {
  date: Date | undefined;
  isLoading: boolean;
  eventTypes: Record<string, { label: string; color: string }>;
  eventosHoje: Atividade[];
  onOpenDetail: (atividade: Atividade) => void;
  onOpenForm: (atividade?: Atividade) => void;
}

export function EventList({ 
  date, 
  isLoading, 
  eventTypes, 
  eventosHoje, 
  onOpenDetail, 
  onOpenForm 
}: EventListProps) {
  return (
    <div className="relative pl-6 border-l border-border">
      {isLoading ? (
        <EventListSkeleton />
      ) : eventosHoje.length > 0 ? (
        <EventListItems 
          eventTypes={eventTypes}
          eventosHoje={eventosHoje}
          onOpenDetail={onOpenDetail}
          onOpenForm={onOpenForm}
        />
      ) : (
        <EventListEmpty onOpenForm={onOpenForm} />
      )}
    </div>
  );
}

function EventListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
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
      ))}
    </>
  );
}

function EventListItems({ 
  eventTypes,
  eventosHoje,
  onOpenDetail,
  onOpenForm
}: {
  eventTypes: Record<string, { label: string; color: string }>;
  eventosHoje: Atividade[];
  onOpenDetail: (atividade: Atividade) => void;
  onOpenForm: (atividade?: Atividade) => void;
}) {
  return (
    <>
      {eventosHoje.map((evento) => (
        <div
          key={evento.id}
          className="mb-8 relative hover:bg-gray-50 p-4 rounded-lg -ml-8 pl-8 transition-colors cursor-pointer"
          onClick={() => onOpenDetail(evento)}
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
                onOpenForm(evento);
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
      ))}
    </>
  );
}

function EventListEmpty({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">
        Nenhum compromisso para esta data.
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onOpenForm}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Atividade
      </Button>
    </div>
  );
}
