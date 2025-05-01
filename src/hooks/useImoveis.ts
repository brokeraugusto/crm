
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Imovel } from "@/types/leads";
import { toast } from "sonner";

export function useImoveis() {
  const { data: imoveis = [], isLoading } = useQuery({
    queryKey: ["imoveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar imóveis", { description: error.message });
        throw error;
      }

      return data as Imovel[];
    }
  });

  const getImovelById = async (id: string): Promise<Imovel | null> => {
    const { data, error } = await supabase
      .from("imoveis")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao buscar imóvel", { description: error.message });
      return null;
    }

    return data as Imovel;
  };

  return {
    imoveis,
    isLoading,
    getImovelById
  };
}
