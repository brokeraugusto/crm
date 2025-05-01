
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Atividade } from "@/types/leads";
import { toast } from "sonner";

export function useAtividades(leadId?: string) {
  const queryClient = useQueryClient();

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atividades")
        .select("*")
        .eq("lead_id", leadId)
        .order("data", { ascending: true });

      if (error) {
        toast.error("Erro ao carregar atividades", { description: error.message });
        throw error;
      }

      return data as Atividade[];
    }
  });

  const criarAtividade = useMutation({
    mutationFn: async (atividade: Omit<Atividade, "id" | "created_at" | "updated_at">) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades", leadId] });
      toast.success("Atividade criada com sucesso!");
    }
  });

  const atualizarAtividade = useMutation({
    mutationFn: async ({ id, ...atividade }: Partial<Atividade> & { id: string }) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades", leadId] });
      toast.success("Atividade atualizada com sucesso!");
    }
  });

  const excluirAtividade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("atividades")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Erro ao excluir atividade", { description: error.message });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atividades", leadId] });
      toast.success("Atividade excluída com sucesso!");
    }
  });

  return {
    atividades,
    isLoading,
    criarAtividade,
    atualizarAtividade,
    excluirAtividade
  };
}
