
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Atividade } from "@/types/leads";
import { atividadeSchema, AtividadeFormData } from "./validation/atividadeSchema";
import { AtividadeFormFields } from "./AtividadeFormFields";
import { AtividadeFormButtons } from "./AtividadeFormButtons";
import { format } from "date-fns";

interface AtividadeFormProps {
  defaultValues?: Partial<Atividade>;
  onSubmit: (data: any) => void;
  onClose?: () => void;
  isLoading?: boolean;
  leadId?: string;
  imovelId?: string;
}

export function AtividadeForm({ 
  defaultValues, 
  onSubmit, 
  onClose,
  isLoading,
  leadId, 
  imovelId 
}: AtividadeFormProps) {
  const [hora, setHora] = useState(defaultValues?.data ? format(new Date(defaultValues.data), "HH:mm") : "09:00");
  
  const form = useForm<AtividadeFormData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      data: defaultValues.data ? new Date(defaultValues.data) : new Date(),
      cliente: defaultValues.cliente || "",
    } : {
      titulo: "",
      tipo: "visita",
      data: new Date(),
      duracao: "1 hora",
      endereco: "",
      descricao: "",
      cliente: "",
    },
  });

  async function handleSubmit(data: AtividadeFormData) {
    try {
      // Combinar a data selecionada com o horário inserido
      const [horaStr, minutoStr] = hora.split(":");
      const horaNum = parseInt(horaStr, 10);
      const minutoNum = parseInt(minutoStr, 10);
      
      const dataComHora = new Date(data.data);
      dataComHora.setHours(horaNum, minutoNum);
      
      const atividadeData = {
        titulo: data.titulo,
        tipo: data.tipo,
        data: dataComHora.toISOString(),
        duracao: data.duracao,
        endereco: data.endereco || null,
        descricao: data.descricao || null,
        cliente: data.cliente || null,
        lead_id: leadId || null,
        imovel_id: imovelId || null,
      };
      
      onSubmit(atividadeData);
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <AtividadeFormFields form={form} hora={hora} setHora={setHora} />
        <AtividadeFormButtons 
          onClose={onClose}
          isLoading={isLoading}
          isEditing={!!defaultValues?.id}
        />
      </form>
    </Form>
  );
}
