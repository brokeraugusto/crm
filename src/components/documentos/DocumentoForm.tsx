
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
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const documentoSchema = z.object({
  nomeCliente: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  valorImovel: z.string().min(1, "Valor é obrigatório"),
  observacoes: z.string().optional(),
});

type DocumentoFormData = z.infer<typeof documentoSchema>;

interface DocumentoFormProps {
  tipo: TipoDocumento;
  onClose: () => void;
}

export function DocumentoForm({ tipo, onClose }: DocumentoFormProps) {
  const { loading } = useDocumentos();
  const navigate = useNavigate();

  // Função para obter URL do webhook com base no tipo de documento
  const getWebhookUrl = (tipo: TipoDocumento) => {
    const baseUrl = "https://n8n.baita.cloud/form/";
    
    switch(tipo) {
      case "Autorização de Venda (PF)":
        return `${baseUrl}autorizacaopf`;
      case "Autorização de Venda (PJ)":
        return `${baseUrl}autorizacaopj`;
      case "Autorização de Intermediação Locatícia":
        return `${baseUrl}intermediacaolocaticia`;
      case "Contrato de Representação Exclusiva":
        return `${baseUrl}contratoderepresentacao`;
      case "Proposta de Compra":
        return `${baseUrl}proposta`;
      case "Compromisso de Compra e Venda":
        return `${baseUrl}ccv`;
      default:
        return "";
    }
  };

  const handleOpenExternalForm = () => {
    const webhookUrl = getWebhookUrl(tipo);
    
    if (!webhookUrl) {
      toast.error("URL do webhook não configurada para este tipo de documento");
      return;
    }
    
    // Abrir o formulário externo em uma nova janela/aba
    window.open(webhookUrl, '_blank');
    
    // Fechar o modal após abrir o formulário externo
    onClose();
    
    // Mostrar toast de sucesso
    toast.success(`Formulário para ${tipo} aberto em nova janela`, {
      description: "Preencha o formulário externo para gerar o documento."
    });
  };

  // Abrir formulário automaticamente ao montar o componente
  useState(() => {
    handleOpenExternalForm();
  });

  return (
    <div className="space-y-4">
      <div className="bg-muted/40 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-1">Tipo de documento</h3>
        <p className="text-sm text-muted-foreground">{tipo}</p>
      </div>
      
      <p className="text-center py-8">
        O formulário para {tipo} foi aberto em uma nova janela.
        <br />
        Se a janela não abriu automaticamente, clique no botão abaixo.
      </p>
      
      <DialogFooter className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" onClick={onClose} type="button" className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button 
          type="button" 
          className="w-full sm:w-auto"
          onClick={handleOpenExternalForm}
        >
          Abrir Formulário
        </Button>
      </DialogFooter>
    </div>
  );
}
