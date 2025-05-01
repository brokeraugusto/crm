
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Atividade } from "@/types/leads";
import { toast } from "sonner";

export function useAgendaOperations() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const criarAtividade = useMutation({
    mutationFn: async (atividade: Omit<Atividade, "id" | "created_at" | "updated_at">) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("atividades")
          .insert(atividade)
          .select()
          .single();

        if (error) {
          toast.error("Erro ao criar atividade", { description: error.message });
          throw error;
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades"] });
      toast.success("Atividade criada com sucesso!");
    },
  });

  const atualizarAtividade = useMutation({
    mutationFn: async ({ id, ...atividade }: Partial<Atividade> & { id: string }) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("atividades")
          .update(atividade)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          toast.error("Erro ao atualizar atividade", { description: error.message });
          throw error;
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades"] });
      toast.success("Atividade atualizada com sucesso!");
    },
  });

  const excluirAtividade = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("atividades")
          .delete()
          .eq("id", id);

        if (error) {
          toast.error("Erro ao excluir atividade", { description: error.message });
          throw error;
        }
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades"] });
      toast.success("Atividade excluída com sucesso!");
    },
  });

  return {
    loading,
    criarAtividade,
    atualizarAtividade,
    excluirAtividade
  };
}
