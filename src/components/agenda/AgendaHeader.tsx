
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus } from "lucide-react";

interface AgendaHeaderProps {
  onNewActivity: () => void;
}

export function AgendaHeader({ onNewActivity }: AgendaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
      </div>
      <Button className="flex items-center gap-1" onClick={onNewActivity}>
        <Plus className="h-4 w-4" />
        <span>Nova Atividade</span>
      </Button>
    </div>
  );
}
