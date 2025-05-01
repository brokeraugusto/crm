
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Atividade } from "@/types/leads";
import { toast } from "sonner";

export function useTodasAtividades() {
  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["atividades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atividades")
        .select("*")
        .order("data", { ascending: true });

      if (error) {
        toast.error("Erro ao carregar atividades", { description: error.message });
        throw error;
      }

      return data as Atividade[];
    }
  });

  return {
    atividades,
    isLoading
  };
}
