
import React from "react";
import { Atividade } from "@/types/leads";
import { AtividadeForm as CommonAtividadeForm } from "../common/AtividadeForm";

interface AtividadeFormProps {
  leadId: string;
  defaultValues?: Atividade;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClose?: () => void;
}

export function AtividadeForm({ 
  leadId, 
  defaultValues, 
  onSubmit,
  isLoading,
  onClose
}: AtividadeFormProps) {
  return (
    <CommonAtividadeForm
      leadId={leadId}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isLoading}
      onClose={onClose}
    />
  );
}
