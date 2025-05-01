
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Imovel } from "@/types/leads";
import { toast } from "sonner";

export function useImoveisOperations() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const criarImovel = useMutation({
    mutationFn: async (imovel: Omit<Imovel, "id" | "created_at" | "updated_at">) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .insert(imovel)
          .select()
          .single();

        if (error) {
          toast.error("Erro ao criar imóvel", { description: error.message });
          throw error;
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast.success("Imóvel criado com sucesso!");
    },
  });

  const atualizarImovel = useMutation({
    mutationFn: async ({ id, ...imovel }: Partial<Imovel> & { id: string }) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .update(imovel)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          toast.error("Erro ao atualizar imóvel", { description: error.message });
          throw error;
        }

        return data;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast.success("Imóvel atualizado com sucesso!");
    },
  });

  const excluirImovel = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("imoveis")
          .delete()
          .eq("id", id);

        if (error) {
          toast.error("Erro ao excluir imóvel", { description: error.message });
          throw error;
        }
      } finally {
        setLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast.success("Imóvel excluído com sucesso!");
    },
  });

  return {
    loading,
    criarImovel,
    atualizarImovel,
    excluirImovel
  };
}
