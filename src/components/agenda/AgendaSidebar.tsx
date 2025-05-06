
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendaSidebarProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  eventCountByDate: Record<string, number>;
  eventTypes: Record<string, { label: string; color: string }>;
}

export function AgendaSidebar({ 
  date, 
  setDate, 
  eventCountByDate, 
  eventTypes 
}: AgendaSidebarProps) {
  return (
    <Card className="col-span-1 h-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>Calendário</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-2">
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
        </div>
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
              className="w-full justify-start text-primary truncate"
            >
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Conectar com Google Agenda</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
