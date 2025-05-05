
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Atividade } from "@/types/leads";
import { AtividadeForm as CommonAtividadeForm, AtividadeFormData } from "../common/AtividadeForm";

interface AtividadeFormProps {
  leadId: string;
  defaultValues?: Atividade;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function AtividadeForm({ 
  leadId, 
  defaultValues, 
  onSubmit,
  isLoading
}: AtividadeFormProps) {
  return (
    <CommonAtividadeForm
      leadId={leadId}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
  );
}
