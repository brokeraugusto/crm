
import { useState } from "react";
import { Atividade } from "@/types/leads";
import { useAgendaOperations } from "@/hooks/useAgendaOperations";

interface UseAtividadeSubmitProps {
  atividadeParaEditar?: Atividade;
  onClose: () => void;
  leadId?: string;
  imovelId?: string;
}

export function useAtividadeSubmit({
  atividadeParaEditar,
  onClose,
  leadId,
  imovelId
}: UseAtividadeSubmitProps) {
  const { criarAtividade, atualizarAtividade, loading } = useAgendaOperations();
  
  async function handleSubmit(data: any) {
    try {
      if (atividadeParaEditar) {
        await atualizarAtividade.mutateAsync({ 
          id: atividadeParaEditar.id, 
          ...data 
        });
      } else {
        await criarAtividade.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
    }
  }

  return {
    handleSubmit,
    loading,
    isEditing: !!atividadeParaEditar
  };
}
