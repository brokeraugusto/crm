
import React from "react";
import { Atividade } from "@/types/leads";
import { useAgendaOperations } from "@/hooks/useAgendaOperations";
import { AtividadeForm as CommonAtividadeForm } from "../common/AtividadeForm";

interface AtividadeFormProps {
  atividadeParaEditar?: Atividade;
  onClose: () => void;
  leadId?: string;
  imovelId?: string;
}

export function AtividadeForm({ 
  atividadeParaEditar, 
  onClose, 
  leadId, 
  imovelId 
}: AtividadeFormProps) {
  const { criarAtividade, atualizarAtividade, loading } = useAgendaOperations();
  
  async function onSubmit(data: any) {
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

  return (
    <CommonAtividadeForm
      defaultValues={atividadeParaEditar}
      onSubmit={onSubmit}
      onClose={onClose}
      isLoading={loading}
      leadId={leadId}
      imovelId={imovelId}
    />
  );
}
