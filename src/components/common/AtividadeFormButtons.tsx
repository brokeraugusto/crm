
import React from "react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { useTheme } from "../theme/ThemeProvider";
import { Calendar } from "lucide-react";

interface AtividadeFormButtonsProps {
  onClose?: () => void;
  isLoading?: boolean;
  isEditing: boolean;
  onGoogleCalendarSync?: () => void;
  isGoogleSyncing?: boolean;
}

export function AtividadeFormButtons({ 
  onClose, 
  isLoading, 
  isEditing,
  onGoogleCalendarSync,
  isGoogleSyncing = false 
}: AtividadeFormButtonsProps) {
  const { theme } = useTheme();
  
  return (
    <>
      <div className="pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="text-primary flex items-center gap-2"
          disabled={isLoading || isGoogleSyncing}
          onClick={onGoogleCalendarSync}
        >
          <Calendar className="h-4 w-4" />
          {isGoogleSyncing ? "Sincronizando..." : "Sincronizar com Google Agenda"}
        </Button>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className={theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Agendar"}
        </Button>
      </DialogFooter>
    </>
  );
}
