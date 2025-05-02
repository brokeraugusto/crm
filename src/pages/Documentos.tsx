
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Plus,
  Search,
  FilePlus,
  FolderPlus,
  Filter,
  ChevronRight,
  MoreHorizontal,
  File,
  FileCheck,
  FileSpreadsheet,
  FileLock,
  FileSignature,
  FileWarning,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TipoDocumento } from "@/hooks/useDocumentos";
import { DocumentoForm } from "@/components/documentos/DocumentoForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Dados de exemplo para os documentos
const documentosData = [
  {
    id: 1,
    nome: "Contrato de Compra e Venda",
    tipo: "template",
    categoria: "Contratos",
    dataCriacao: "10/04/2023",
    formato: "docx",
    tamanho: "325 KB",
  },
  {
    id: 2,
    nome: "Checklist de Documentação",
    tipo: "template",
    categoria: "Checklists",
    dataCriacao: "15/04/2023",
    formato: "pdf",
    tamanho: "156 KB",
  },
  {
    id: 3,
    nome: "Proposta Comercial",
    tipo: "template",
    categoria: "Propostas",
    dataCriacao: "20/04/2023",
    formato: "docx",
    tamanho: "289 KB",
  },
  {
    id: 4,
    nome: "Ficha de Avaliação de Imóvel",
    tipo: "template",
    categoria: "Avaliações",
    dataCriacao: "25/04/2023",
    formato: "pdf",
    tamanho: "210 KB",
  },
  {
    id: 5,
    nome: "Contrato de Locação",
    tipo: "template",
    categoria: "Contratos",
    dataCriacao: "01/05/2023",
    formato: "docx",
    tamanho: "342 KB",
  },
  {
    id: 6,
    nome: "Contrato Ana Silva",
    tipo: "documento",
    cliente: "Ana Silva",
    categoria: "Contratos",
    dataCriacao: "12/05/2023",
    formato: "pdf",
    tamanho: "425 KB",
  },
  {
    id: 7,
    nome: "Proposta Carlos Oliveira",
    tipo: "documento",
    cliente: "Carlos Oliveira",
    categoria: "Propostas",
    dataCriacao: "18/05/2023",
    formato: "pdf",
    tamanho: "298 KB",
  },
];

// Tipos de documentos disponíveis para geração
const tiposDocumentos: TipoDocumento[] = [
  "Autorização de Venda (PF)",
  "Autorização de Venda (PJ)",
  "Autorização de Intermediação Locatícia",
  "Contrato de Representação Exclusiva",
  "Proposta de Compra",
  "Compromisso de Compra e Venda",
];

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

// Ícones para formatos de arquivo
const formatIcons: Record<string, JSX.Element> = {
  pdf: <File className="h-6 w-6 text-red-500" />,
  docx: <File className="h-6 w-6 text-blue-500" />,
  xlsx: <File className="h-6 w-6 text-green-500" />,
};

export default function Documentos() {
  const [activeTab, setActiveTab] = useState("todos");
  const [documentoSelecionado, setDocumentoSelecionado] = useState<TipoDocumento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [googleDriveDialogOpen, setGoogleDriveDialogOpen] = useState(false);
  
  // Filtrar documentos com base na tab ativa
  const documentosFiltrados = activeTab === "todos"
    ? documentosData
    : activeTab === "templates"
    ? documentosData.filter(doc => doc.tipo === "template")
    : documentosData.filter(doc => doc.tipo === "documento");

  const handleDocumentoSelect = (tipo: TipoDocumento) => {
    // Opção 1: Abrir diretamente o formulário externo
    const webhookUrl = getWebhookUrl(tipo);
    
    if (webhookUrl) {
      window.open(webhookUrl, '_blank');
      toast.success(`Formulário para ${tipo} aberto em nova janela`, {
        description: "Preencha o formulário externo para gerar o documento."
      });
    } else {
      // Opção 2: Abrir o diálogo interno se não houver webhook configurado
      setDocumentoSelecionado(tipo);
      setDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <FilePlus className="h-4 w-4" />
                <span>Novo Documento</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuItem 
                onClick={() => setGoogleDriveDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                <span>Conectar com Google Drive</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {tiposDocumentos.map((tipo) => (
                <DropdownMenuItem
                  key={tipo}
                  onClick={() => handleDocumentoSelect(tipo)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {tipo.includes("Autorização") ? (
                    <FileCheck className="h-4 w-4 text-green-600" />
                  ) : tipo.includes("Representação") ? (
                    <FileLock className="h-4 w-4 text-yellow-600" />
                  ) : tipo.includes("Proposta") ? (
                    <FileSignature className="h-4 w-4 text-blue-600" />
                  ) : (
                    <FileWarning className="h-4 w-4 text-orange-600" />
                  )}
                  <span>{tipo}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button className="flex items-center gap-1">
            <FolderPlus className="h-4 w-4" />
            <span>Novo Template</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar documentos..."
                className="pl-8 w-full"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="todos" className="m-0">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {documentosFiltrados.map((documento) => (
                  <Card key={documento.id} className="overflow-hidden">
                    <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="mr-4">
                        {formatIcons[documento.formato] || <File className="h-6 w-6 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{documento.nome}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{documento.categoria}</span>
                          <span>•</span>
                          <span>{documento.formato.toUpperCase()}</span>
                          <span>•</span>
                          <span>{documento.tamanho}</span>
                        </div>
                        {documento.cliente && (
                          <p className="text-xs text-primary mt-1">
                            Cliente: {documento.cliente}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Visualizar</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Baixar</DropdownMenuItem>
                          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}

                <Card className="overflow-hidden border-dashed border-2 border-border/50">
                  <Button 
                    variant="ghost" 
                    className="h-full w-full p-8 flex flex-col items-center justify-center"
                    onClick={() => setDialogOpen(true)}
                  >
                    <Plus className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="font-medium">Gerar Novo Documento</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique para escolher um modelo
                    </p>
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="m-0">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {documentosFiltrados.map((documento) => (
                  <Card key={documento.id} className="overflow-hidden">
                    <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="mr-4">
                        {formatIcons[documento.formato] || <File className="h-6 w-6 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{documento.nome}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{documento.categoria}</span>
                          <span>•</span>
                          <span>{documento.formato.toUpperCase()}</span>
                          <span>•</span>
                          <span>{documento.tamanho}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Visualizar</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Usar Template</DropdownMenuItem>
                          <DropdownMenuItem>Baixar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentos" className="m-0">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {documentosFiltrados.map((documento) => (
                  <Card key={documento.id} className="overflow-hidden">
                    <div className="flex items-center p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="mr-4">
                        {formatIcons[documento.formato] || <File className="h-6 w-6 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{documento.nome}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{documento.categoria}</span>
                          <span>•</span>
                          <span>{documento.formato.toUpperCase()}</span>
                          <span>•</span>
                          <span>{documento.tamanho}</span>
                        </div>
                        {documento.cliente && (
                          <p className="text-xs text-primary mt-1">
                            Cliente: {documento.cliente}
                          </p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Visualizar</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Baixar</DropdownMenuItem>
                          <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para selecionar e gerar documento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {documentoSelecionado || "Gerar Documento"}
            </DialogTitle>
            <DialogDescription>
              {documentoSelecionado 
                ? "O formulário será aberto em uma nova janela" 
                : "Selecione o tipo de documento para gerar"
              }
            </DialogDescription>
          </DialogHeader>
          {documentoSelecionado ? (
            <DocumentoForm
              tipo={documentoSelecionado}
              onClose={() => setDialogOpen(false)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
              {tiposDocumentos.map((tipo) => (
                <Button
                  key={tipo}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleDocumentoSelect(tipo)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{tipo}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Clique para preencher os dados
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para configuração do Google Drive */}
      <Dialog open={googleDriveDialogOpen} onOpenChange={setGoogleDriveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar com Google Drive</DialogTitle>
            <DialogDescription>
              Configure a integração para salvar documentos no Google Drive automaticamente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
              Esta funcionalidade requer autorização do Google. Você será redirecionado para fazer login e conceder as permissões necessárias.
            </div>
            
            <Button className="w-full" onClick={() => {
              // Simulando a integração com o Google
              setTimeout(() => {
                toast.success("Integração com Google Drive configurada com sucesso!");
                setGoogleDriveDialogOpen(false);
              }, 1500);
            }}>
              Conectar com Google Drive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
