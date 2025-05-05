
import { z } from "zod";

export const atividadeSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione o tipo de atividade"),
  data: z.date({
    required_error: "Data e hora são obrigatórias",
  }),
  duracao: z.string().min(1, "Informe a duração"),
  endereco: z.string().optional(),
  descricao: z.string().optional(),
  cliente: z.string().optional(),
});

export type AtividadeFormData = z.infer<typeof atividadeSchema>;
