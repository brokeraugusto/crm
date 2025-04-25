
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
  FolderOpen,
  ChevronRight,
  MoreHorizontal,
  File,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// Ícones para formatos de arquivo
const formatIcons: Record<string, JSX.Element> = {
  pdf: <File className="h-6 w-6 text-red-500" />,
  docx: <File className="h-6 w-6 text-blue-500" />,
  xlsx: <File className="h-6 w-6 text-green-500" />,
};

export default function Documentos() {
  const [activeTab, setActiveTab] = useState("todos");
  
  // Filtrar documentos com base na tab ativa
  const documentosFiltrados = activeTab === "todos"
    ? documentosData
    : activeTab === "templates"
    ? documentosData.filter(doc => doc.tipo === "template")
    : documentosData.filter(doc => doc.tipo === "documento");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <FilePlus className="h-4 w-4" />
            <span>Novo Documento</span>
          </Button>
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
    </div>
  );
}
