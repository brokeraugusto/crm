
import React from "react";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";

interface AtividadeFormButtonsProps {
  onClose?: () => void;
  isLoading?: boolean;
  isEditing: boolean;
}

export function AtividadeFormButtons({ onClose, isLoading, isEditing }: AtividadeFormButtonsProps) {
  return (
    <>
      <div className="pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="text-primary"
          disabled={isLoading}
        >
          Sincronizar com Google Agenda
        </Button>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : isEditing ? "Atualizar" : "Agendar"}
        </Button>
      </DialogFooter>
    </>
  );
}
