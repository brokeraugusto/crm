
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lead, LeadStatus } from "@/types/leads";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthProvider";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  telefone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  interesse: z.string().optional(),
  status: z.string(),
  observacao: z.string().optional(),
});

type LeadFormValues = z.infer<typeof schema>;

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "novo", label: "Novo" },
  { value: "contato", label: "Contato" },
  { value: "visita", label: "Visita" },
  { value: "proposta", label: "Proposta" },
  { value: "vendido", label: "Vendido" },
  { value: "perdido", label: "Perdido" },
];

interface LeadFormProps {
  defaultValues?: Partial<Lead>;
  onSubmit: (data: LeadFormValues) => void;
  isLoading?: boolean;
}

export function LeadForm({ defaultValues, onSubmit, isLoading }: LeadFormProps) {
  const { user } = useAuth();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: defaultValues?.nome || "",
      telefone: defaultValues?.telefone || "",
      email: defaultValues?.email || "",
      interesse: defaultValues?.interesse || "",
      status: defaultValues?.status || "novo",
      observacao: defaultValues?.observacao || "",
    },
  });

  const handleSubmit = (values: LeadFormValues) => {
    onSubmit({
      ...values,
      user_id: user?.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interesse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interesse</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Apartamento de 3 quartos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações adicionais sobre o lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : defaultValues?.id ? "Atualizar Lead" : "Cadastrar Lead"}
        </Button>
      </form>
    </Form>
  );
}
