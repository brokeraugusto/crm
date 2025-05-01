
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Atividade } from "@/types/leads";
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
import { useImoveis } from "@/hooks/useImoveis";
import { useAuth } from "@/components/auth/AuthProvider";

const schema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  duracao: z.string().min(1, "Duração é obrigatória"),
  endereco: z.string().optional(),
  descricao: z.string().optional(),
  imovel_id: z.string().optional().or(z.literal("")),
});

type AtividadeFormValues = z.infer<typeof schema>;

interface AtividadeFormProps {
  leadId: string;
  defaultValues?: Partial<Atividade>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const tiposAtividade = [
  { value: "visita", label: "Visita" },
  { value: "reuniao", label: "Reunião" },
  { value: "ligacao", label: "Ligação" },
  { value: "email", label: "Email" },
  { value: "contrato", label: "Contrato" },
  { value: "outro", label: "Outro" },
];

export function AtividadeForm({ leadId, defaultValues, onSubmit, isLoading }: AtividadeFormProps) {
  const { imoveis } = useImoveis();
  const { user } = useAuth();

  const form = useForm<AtividadeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: defaultValues?.titulo || "",
      tipo: defaultValues?.tipo || "visita",
      data: defaultValues?.data ? new Date(defaultValues.data).toISOString().slice(0, 16) : "",
      duracao: defaultValues?.duracao || "1h",
      endereco: defaultValues?.endereco || "",
      descricao: defaultValues?.descricao || "",
      imovel_id: defaultValues?.imovel_id || "",
    },
  });

  const handleSubmit = (values: AtividadeFormValues) => {
    const formattedValues = {
      ...values,
      lead_id: leadId,
      user_id: user?.id,
    };
    onSubmit(formattedValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Título da atividade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tiposAtividade.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
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
            name="duracao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30min">30 minutos</SelectItem>
                    <SelectItem value="1h">1 hora</SelectItem>
                    <SelectItem value="1h30">1 hora e 30 minutos</SelectItem>
                    <SelectItem value="2h">2 horas</SelectItem>
                    <SelectItem value="3h">3 horas</SelectItem>
                    <SelectItem value="4h">4 horas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imovel_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imóvel (opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um imóvel (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {imoveis.map((imovel) => (
                    <SelectItem key={imovel.id} value={imovel.id}>
                      {imovel.titulo}
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
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Endereço da atividade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da atividade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : defaultValues?.id ? "Atualizar Atividade" : "Cadastrar Atividade"}
        </Button>
      </form>
    </Form>
  );
}
