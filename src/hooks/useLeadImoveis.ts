
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Imovel, LeadImovel } from "@/types/leads";
import { toast } from "sonner";

export function useLeadImoveis(leadId?: string) {
  const queryClient = useQueryClient();

  const { data: vinculados = [], isLoading } = useQuery({
    queryKey: ["leadImoveis", leadId],
    enabled: !!leadId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads_imoveis")
        .select(`
          id,
          imovel_id,
          imoveis:imoveis (*)
        `)
        .eq("lead_id", leadId);

      if (error) {
        toast.error("Erro ao carregar imóveis vinculados", { description: error.message });
        throw error;
      }

      return data.map((item: any) => ({
        id: item.id,
        imovel_id: item.imovel_id,
        ...item.imoveis
      })) as (Imovel & { id: string })[];
    }
  });

  const vincularImovel = useMutation({
    mutationFn: async ({ leadId, imovelId }: { leadId: string; imovelId: string }) => {
      const { data, error } = await supabase
        .from("leads_imoveis")
        .insert({
          lead_id: leadId,
          imovel_id: imovelId
        })
        .select()
        .single();

      if (error) {
        toast.error("Erro ao vincular imóvel", { description: error.message });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadImoveis", leadId] });
      toast.success("Imóvel vinculado com sucesso!");
    }
  });

  const desvincularImovel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads_imoveis")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Erro ao desvincular imóvel", { description: error.message });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadImoveis", leadId] });
      toast.success("Imóvel desvinculado com sucesso!");
    }
  });

  return {
    vinculados,
    isLoading,
    vincularImovel,
    desvincularImovel
  };
}
