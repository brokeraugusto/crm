
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Atividade } from "@/types/leads";
import { useAgendaOperations } from "@/hooks/useAgendaOperations";
import { DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const atividadeSchema = z.object({
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

type AtividadeFormData = z.infer<typeof atividadeSchema>;

interface AtividadeFormProps {
  atividadeParaEditar?: Atividade;
  onClose: () => void;
  leadId?: string;
  imovelId?: string;
}

export function AtividadeForm({ 
  atividadeParaEditar, 
  onClose, 
  leadId, 
  imovelId 
}: AtividadeFormProps) {
  const { criarAtividade, atualizarAtividade, loading } = useAgendaOperations();
  const [hora, setHora] = useState(atividadeParaEditar ? format(new Date(atividadeParaEditar.data), "HH:mm") : "09:00");
  
  const form = useForm<AtividadeFormData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues: atividadeParaEditar ? {
      ...atividadeParaEditar,
      data: new Date(atividadeParaEditar.data),
    } : {
      titulo: "",
      tipo: "visita",
      data: new Date(),
      duracao: "1 hora",
      endereco: "",
      descricao: "",
      cliente: "",
    },
  });

  async function onSubmit(data: AtividadeFormData) {
    try {
      // Combinar a data selecionada com o horário inserido
      const [horaStr, minutoStr] = hora.split(":");
      const horaNum = parseInt(horaStr, 10);
      const minutoNum = parseInt(minutoStr, 10);
      
      const dataComHora = new Date(data.data);
      dataComHora.setHours(horaNum, minutoNum);
      
      const atividadeData = {
        ...data,
        data: dataComHora.toISOString(),
        lead_id: leadId,
        imovel_id: imovelId,
      };
      
      if (atividadeParaEditar) {
        await atualizarAtividade.mutateAsync({ 
          id: atividadeParaEditar.id, 
          ...atividadeData 
        });
      } else {
        await criarAtividade.mutateAsync(atividadeData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar atividade:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Visita ao apartamento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="visita">Visita</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="contato">Contato</SelectItem>
                    <SelectItem value="assinatura">Assinatura</SelectItem>
                    <SelectItem value="vistoria">Vistoria</SelectItem>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a duração" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15 minutos">15 minutos</SelectItem>
                    <SelectItem value="30 minutos">30 minutos</SelectItem>
                    <SelectItem value="1 hora">1 hora</SelectItem>
                    <SelectItem value="2 horas">2 horas</SelectItem>
                    <SelectItem value="Meio período">Meio período</SelectItem>
                    <SelectItem value="Dia inteiro">Dia inteiro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Hora</FormLabel>
            <FormControl>
              <Input 
                type="time" 
                value={hora}
                onChange={(e) => setHora(e.target.value)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="cliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Onde será realizada a atividade..." {...field} />
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
                <Textarea
                  placeholder="Detalhes adicionais da atividade..."
                  className="h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="text-primary"
            disabled={loading}
          >
            Sincronizar com Google Agenda
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : atividadeParaEditar ? "Atualizar" : "Agendar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
