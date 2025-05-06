
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Atividade } from "@/types/leads";
import { EventList } from "./EventList";

interface AgendaContentProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isLoading: boolean;
  eventTypes: Record<string, { label: string; color: string }>;
  eventosHoje: Atividade[];
  onOpenDetail: (atividade: Atividade) => void;
  onOpenForm: (atividade?: Atividade) => void;
}

export function AgendaContent({
  date,
  setDate,
  isLoading,
  eventTypes,
  eventosHoje,
  onOpenDetail,
  onOpenForm,
}: AgendaContentProps) {
  return (
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
        <EventList
          date={date}
          isLoading={isLoading}
          eventTypes={eventTypes}
          eventosHoje={eventosHoje}
          onOpenDetail={onOpenDetail}
          onOpenForm={onOpenForm}
        />
      </CardContent>
    </Card>
  );
}
