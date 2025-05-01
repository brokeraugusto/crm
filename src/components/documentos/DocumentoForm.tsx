
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TipoDocumento, useDocumentos } from "@/hooks/useDocumentos";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const documentoSchema = z.object({
  nomeCliente: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  valorImovel: z.string().min(1, "Valor é obrigatório"),
  observacoes: z.string().optional(),
  webhookUrl: z.string().url("URL inválida").optional(),
});

type DocumentoFormData = z.infer<typeof documentoSchema>;

interface DocumentoFormProps {
  tipo: TipoDocumento;
  onClose: () => void;
}

export function DocumentoForm({ tipo, onClose }: DocumentoFormProps) {
  const { gerarDocumento, loading } = useDocumentos();
  const [webhookUrl, setWebhookUrl] = useState<string>("");

  const form = useForm<DocumentoFormData>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      nomeCliente: "",
      cpfCnpj: "",
      endereco: "",
      valorImovel: "",
      observacoes: "",
      webhookUrl: "",
    },
  });

  async function onSubmit(data: DocumentoFormData) {
    try {
      await gerarDocumento(
        tipo,
        {
          ...data,
          tipoDocumento: tipo,
          dataCriacao: new Date().toISOString(),
        },
        webhookUrl || data.webhookUrl
      );
      
      onClose();
    } catch (error) {
      console.error("Erro ao gerar documento:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-muted/40 p-4 rounded-md mb-6">
          <h3 className="font-medium mb-1">Tipo de documento</h3>
          <p className="text-sm text-muted-foreground">{tipo}</p>
        </div>

        <FormField
          control={form.control}
          name="nomeCliente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpfCnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF/CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00 ou 00.000.000/0000-00" {...field} />
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
              <FormLabel>Endereço do Imóvel</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo do imóvel..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valorImovel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Imóvel</FormLabel>
              <FormControl>
                <Input placeholder="R$ 0,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais..."
                  className="h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do Webhook</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://..." 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    setWebhookUrl(e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription>
                URL do webhook para processamento do documento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Gerar Documento"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
