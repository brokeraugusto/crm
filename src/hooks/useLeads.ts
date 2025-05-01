
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lead, LeadStatus } from "@/types/leads";
import { toast } from "sonner";

export function useLeads() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads", filter],
    queryFn: async () => {
      let query = supabase.from("leads").select("*");
      
      if (filter && filter !== "todos") {
        query = query.eq("status", filter);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Erro ao carregar leads", { description: error.message });
        throw error;
      }
      
      return data as Lead[];
    }
  });

  const createLead = useMutation({
    mutationFn: async (newLead: Omit<Lead, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(newLead)
        .select()
        .single();

      if (error) {
        toast.error("Erro ao criar lead", { description: error.message });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead criado com sucesso!");
    }
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(lead)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        toast.error("Erro ao atualizar lead", { description: error.message });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead atualizado com sucesso!");
    }
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Erro ao excluir lead", { description: error.message });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead excluído com sucesso!");
    }
  });

  const getLeadById = async (id: string): Promise<Lead | null> => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Erro ao buscar lead", { description: error.message });
      return null;
    }

    return data as Lead;
  };

  return {
    leads,
    isLoading,
    filter,
    setFilter,
    createLead,
    updateLead,
    deleteLead,
    getLeadById
  };
}
