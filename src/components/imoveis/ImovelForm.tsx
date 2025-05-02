
import React from "react";
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
import { Imovel } from "@/types/leads";
import { useImoveisOperations } from "@/hooks/useImoveisOperations";
import { DialogFooter } from "@/components/ui/dialog";

const imovelSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  tipo: z.string().min(1, "Selecione o tipo de imóvel"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  area: z.string().min(1, "Área é obrigatória"),
  quartos: z.coerce.number().min(0, "Informe a quantidade de quartos"),
  banheiros: z.coerce.number().min(0, "Informe a quantidade de banheiros"),
  preco: z.coerce.number().min(1, "Preço deve ser maior que zero"),
  status: z.string().min(1, "Selecione o status do imóvel"),
  descricao: z.string().optional(),
  imagem: z.string().optional(),
});

type ImovelFormData = z.infer<typeof imovelSchema>;

interface ImovelFormProps {
  imovelParaEditar?: Imovel;
  onClose: () => void;
}

export function ImovelForm({ imovelParaEditar, onClose }: ImovelFormProps) {
  const { criarImovel, atualizarImovel, loading } = useImoveisOperations();
  
  const form = useForm<ImovelFormData>({
    resolver: zodResolver(imovelSchema),
    defaultValues: imovelParaEditar || {
      titulo: "",
      tipo: "",
      endereco: "",
      area: "",
      quartos: 0,
      banheiros: 0,
      preco: 0,
      status: "disponivel",
      descricao: "",
      imagem: "/placeholder.svg",
    },
  });

  async function onSubmit(data: ImovelFormData) {
    try {
      // Ensure all required fields are present
      const imovelData = {
        ...data,
        endereco: data.endereco, // Ensure endereco is explicitly included
        area: data.area,         // Ensure area is explicitly included
        tipo: data.tipo,         // Ensure tipo is explicitly included
        titulo: data.titulo,     // Ensure titulo is explicitly included
        quartos: data.quartos,
        banheiros: data.banheiros,
        preco: data.preco,
        status: data.status,
      };
      
      if (imovelParaEditar) {
        await atualizarImovel.mutateAsync({ 
          id: imovelParaEditar.id, 
          ...imovelData 
        });
      } else {
        await criarImovel.mutateAsync(imovelData);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar imóvel:", error);
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
                <Input placeholder="Apartamento no centro..." {...field} />
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
                    <SelectItem value="Apartamento">Apartamento</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Cobertura">Cobertura</SelectItem>
                    <SelectItem value="Loft">Loft</SelectItem>
                    <SelectItem value="Terreno">Terreno</SelectItem>
                    <SelectItem value="Sala Comercial">Sala Comercial</SelectItem>
                    <SelectItem value="Loja">Loja</SelectItem>
                    <SelectItem value="Galpão">Galpão</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, bairro, cidade..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Área</FormLabel>
                <FormControl>
                  <Input placeholder="120m²" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quartos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="banheiros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banheiros</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
                  placeholder="Descreva o imóvel..."
                  className="h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : imovelParaEditar ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
