
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Search,
  Plus,
  BookText,
  File,
  Link,
  MessageSquare,
  FileText,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Dados de exemplo
const baseDadosExemplo = [
  {
    id: 1,
    titulo: "Documentos essenciais para uma venda",
    categoria: "Processos",
    tipo: "artigo",
    autor: "João Silva",
    data: "10/04/2023",
    conteudo:
      "Neste artigo, descrevemos todos os documentos necessários para realizar uma venda imobiliária com segurança...",
    tags: ["documentação", "vendas", "contratos"],
  },
  {
    id: 2,
    titulo: "Argumentos de venda para imóveis de alto padrão",
    categoria: "Vendas",
    tipo: "guia",
    autor: "Ana Souza",
    data: "15/04/2023",
    conteudo:
      "Um guia completo com técnicas de argumentação para valorizar imóveis de alto padrão e convencer clientes exigentes...",
    tags: ["vendas", "persuasão", "alto padrão"],
  },
  {
    id: 3,
    titulo: "Perguntas frequentes de clientes",
    categoria: "Atendimento",
    tipo: "faq",
    autor: "Carlos Mendes",
    data: "20/04/2023",
    conteudo:
      "Lista das perguntas mais comuns feitas pelos clientes e as melhores respostas para cada situação...",
    tags: ["faq", "atendimento", "objeções"],
  },
  {
    id: 4,
    titulo: "Guia de avaliação de imóveis",
    categoria: "Avaliação",
    tipo: "guia",
    autor: "Mariana Santos",
    data: "25/04/2023",
    conteudo:
      "Como avaliar corretamente um imóvel considerando localização, acabamento, estado de conservação e tendências de mercado...",
    tags: ["avaliação", "precificação"],
  },
  {
    id: 5,
    titulo: "Dicas para fotografar imóveis",
    categoria: "Marketing",
    tipo: "artigo",
    autor: "Pedro Oliveira",
    data: "01/05/2023",
    conteudo:
      "Técnicas profissionais para fotografar imóveis e destacar seus melhores atributos...",
    tags: ["fotografia", "marketing"],
  },
  {
    id: 6,
    titulo: "Modelos de mensagens para WhatsApp",
    categoria: "Comunicação",
    tipo: "template",
    autor: "Juliana Lima",
    data: "05/05/2023",
    conteudo:
      "Templates prontos para diferentes situações de comunicação com clientes via WhatsApp...",
    tags: ["whatsapp", "comunicação", "templates"],
  },
  {
    id: 7,
    titulo: "Treinamento em negociação",
    categoria: "Vendas",
    tipo: "video",
    autor: "Roberto Alves",
    data: "10/05/2023",
    conteudo: "Vídeo tutorial sobre técnicas avançadas de negociação imobiliária.",
    tags: ["negociação", "vendas", "treinamento"],
  },
];

// Categorias únicas para filtragem
const categorias = [...new Set(baseDadosExemplo.map((item) => item.categoria))];

// Ícones para tipos de conteúdo
const tiposIcones: Record<string, JSX.Element> = {
  artigo: <BookText className="h-5 w-5" />,
  guia: <FileText className="h-5 w-5" />,
  faq: <MessageSquare className="h-5 w-5" />,
  template: <File className="h-5 w-5" />,
  video: <Link className="h-5 w-5" />,
};

export default function BaseConhecimento() {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtrar conteúdo com base na tab ativa e termo de busca
  const conteudoFiltrado = baseDadosExemplo.filter((item) => {
    const matchesTab = activeTab === "todos" || item.categoria.toLowerCase() === activeTab;
    const matchesSearch =
      searchTerm === "" ||
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            Base de Conhecimento
          </h1>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Novo Conteúdo</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 space-y-4">
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-2">
              <div className="space-y-1">
                <Button
                  variant={activeTab === "todos" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("todos")}
                >
                  <span>Todos</span>
                  <span className="ml-auto bg-muted rounded-full px-2 py-0.5 text-xs">
                    {baseDadosExemplo.length}
                  </span>
                </Button>
                {categorias.map((categoria) => (
                  <Button
                    key={categoria}
                    variant={
                      activeTab === categoria.toLowerCase() ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveTab(categoria.toLowerCase())}
                  >
                    <span>{categoria}</span>
                    <span className="ml-auto bg-muted rounded-full px-2 py-0.5 text-xs">
                      {
                        baseDadosExemplo.filter(
                          (item) => item.categoria === categoria
                        ).length
                      }
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-2">
              <div className="flex flex-wrap gap-1">
                {Array.from(
                  new Set(
                    baseDadosExemplo.flatMap((item) => item.tags)
                  )
                ).map((tag, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSearchTerm(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar na base de conhecimento..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-4">
              <CardTitle>
                {activeTab === "todos"
                  ? "Todo o Conteúdo"
                  : `Conteúdo: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conteudoFiltrado.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {conteudoFiltrado.map((item) => (
                    <AccordionItem key={item.id} value={`item-${item.id}`}>
                      <AccordionTrigger className="hover:bg-muted/50 px-4 -mx-4 rounded-md">
                        <div className="flex items-center gap-2 text-left">
                          <div className="p-1 rounded-md bg-primary/10">
                            {tiposIcones[item.tipo] || <FileText className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{item.titulo}</h3>
                            <p className="text-xs text-muted-foreground">
                              {item.categoria} • {item.data} • {item.autor}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          <p>{item.conteudo}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">
                              Ler artigo completo
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">
                    Nenhum conteúdo encontrado
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tente ajustar seus filtros ou termos de busca.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
