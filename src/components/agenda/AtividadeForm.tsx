
import React from "react";
import { Atividade } from "@/types/leads";
import { useAtividadeSubmit } from "@/hooks/useAtividadeSubmit";
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
  const { handleSubmit, loading } = useAtividadeSubmit({
    atividadeParaEditar,
    onClose,
    leadId,
    imovelId
  });
  
  return (
    <CommonAtividadeForm
      defaultValues={atividadeParaEditar}
      onSubmit={handleSubmit}
      onClose={onClose}
      isLoading={loading}
      leadId={leadId}
      imovelId={imovelId}
    />
  );
}
