import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Building2, ChevronDown, Filter, Plus, Search, Eye, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useImoveis } from "@/hooks/useImoveis";
import { Imovel } from "@/types/leads";
import { ImovelDetail } from "@/components/imoveis/ImovelDetail";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImovelForm } from "@/components/imoveis/ImovelForm";
import { Skeleton } from "@/components/ui/skeleton";

// Status dos imóveis com suas respectivas cores
const statusMap: Record<string, { label: string; color: string }> = {
  disponivel: { label: "Disponível", color: "bg-green-100 text-green-700" },
  reservado: { label: "Reservado", color: "bg-yellow-100 text-yellow-700" },
  vendido: { label: "Vendido", color: "bg-blue-100 text-blue-700" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
};

export default function Imoveis() {
  const { imoveis, isLoading } = useImoveis();
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [termoBusca, setTermoBusca] = useState("");
  
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Filtra os imóveis com base nos critérios selecionados
  const imoveisFiltrados = imoveis.filter((imovel) => {
    // Filtra por tipo
    if (filtroTipo && filtroTipo !== "todos" && imovel.tipo !== filtroTipo) {
      return false;
    }

    // Filtra por status
    if (filtroStatus && filtroStatus !== "todos" && imovel.status !== filtroStatus) {
      return false;
    }

    // Filtra por termo de busca
    if (termoBusca) {
      const termo = termoBusca.toLowerCase();
      return (
        imovel.titulo.toLowerCase().includes(termo) ||
        imovel.endereco.toLowerCase().includes(termo) ||
        imovel.tipo.toLowerCase().includes(termo)
      );
    }

    return true;
  });

  const handleOpenDetail = (imovel: Imovel) => {
    setImovelSelecionado(imovel);
    setDetailOpen(true);
  };

  const handleOpenForm = (imovel?: Imovel) => {
    if (imovel) {
      setImovelSelecionado(imovel);
      setEditMode(true);
    } else {
      setImovelSelecionado(null);
      setEditMode(false);
    }
    setFormOpen(true);
    setDetailOpen(false);
  };

  const handleEditFromDetail = () => {
    if (imovelSelecionado) {
      setDetailOpen(false);
      setEditMode(true);
      setFormOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
        </div>
        <Button className="flex items-center gap-1" onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" />
          <span>Novo Imóvel</span>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar imóveis..."
                className="pl-8 w-full"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtrar</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span>Tipo</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFiltroTipo("todos")}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Apartamento")}>Apartamento</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Casa")}>Casa</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Cobertura")}>Cobertura</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Loft")}>Loft</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Terreno")}>Terreno</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Sala Comercial")}>Sala Comercial</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span>Status</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFiltroStatus("todos")}>Todos</DropdownMenuItem>
                  {Object.entries(statusMap).map(([key, { label }]) => (
                    <DropdownMenuItem key={key} onClick={() => setFiltroStatus(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
              <div className="h-48 w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex items-center gap-4 mt-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="mt-4 flex justify-end">
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : imoveisFiltrados.length > 0 ? (
          imoveisFiltrados.map((imovel) => (
            <Card key={imovel.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img
                  src={imovel.imagem || "/placeholder.svg"}
                  alt={imovel.titulo}
                  className="h-full w-full object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${statusMap[imovel.status].color}`}
                >
                  {statusMap[imovel.status].label}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{imovel.titulo}</h3>
                    <p className="text-sm text-muted-foreground">
                      {imovel.tipo} • {imovel.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(imovel.preco)}
                    </p>
                  </div>
                </div>
                <p className="text-sm mt-2 text-muted-foreground line-clamp-1">
                  {imovel.endereco}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="text-xs">
                    <span className="font-bold">{imovel.quartos}</span> Quartos
                  </div>
                  <div className="text-xs">
                    <span className="font-bold">{imovel.banheiros}</span> Banheiros
                  </div>
                  <div className="text-xs">
                    <span className="font-bold">{imovel.area}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenForm(imovel)}>
                    <Pencil className="h-4 w-4 mr-1" /> Editar
                  </Button>
                  <Button size="sm" onClick={() => handleOpenDetail(imovel)}>
                    <Eye className="h-4 w-4 mr-1" /> Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-muted-foreground">Nenhum imóvel encontrado para os critérios selecionados.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setFiltroTipo(null);
              setFiltroStatus(null);
              setTermoBusca("");
            }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Dialog para formulário de imóvel */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editMode ? "Editar Imóvel" : "Novo Imóvel"}</DialogTitle>
          </DialogHeader>
          <ImovelForm 
            imovelParaEditar={editMode ? imovelSelecionado || undefined : undefined} 
            onClose={() => setFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Componente para detalhes do imóvel */}
      {imovelSelecionado && (
        <ImovelDetail
          imovel={imovelSelecionado}
          isOpen={detailOpen}
          onOpenChange={setDetailOpen}
          onEdit={handleEditFromDetail}
        />
      )}
    </div>
  );
}
