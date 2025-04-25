
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Building2, ChevronDown, Filter, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Status dos imóveis com suas respectivas cores
const statusMap: Record<string, { label: string; color: string }> = {
  disponivel: { label: "Disponível", color: "bg-green-100 text-green-700" },
  reservado: { label: "Reservado", color: "bg-yellow-100 text-yellow-700" },
  vendido: { label: "Vendido", color: "bg-blue-100 text-blue-700" },
  inativo: { label: "Inativo", color: "bg-gray-100 text-gray-700" },
};

// Dados de exemplo
const imoveisData = [
  {
    id: 1,
    titulo: "Apartamento de Luxo",
    tipo: "Apartamento",
    endereco: "Av. Paulista, 1000, São Paulo",
    preco: "R$ 850.000",
    quartos: 3,
    banheiros: 2,
    area: "120m²",
    status: "disponivel",
    imagem: "/placeholder.svg",
  },
  {
    id: 2,
    titulo: "Casa em Condomínio",
    tipo: "Casa",
    endereco: "Rua das Flores, 123, Alphaville",
    preco: "R$ 1.200.000",
    quartos: 4,
    banheiros: 3,
    area: "250m²",
    status: "disponivel",
    imagem: "/placeholder.svg",
  },
  {
    id: 3,
    titulo: "Cobertura Duplex",
    tipo: "Cobertura",
    endereco: "Rua Augusta, 500, São Paulo",
    preco: "R$ 1.500.000",
    quartos: 4,
    banheiros: 3,
    area: "300m²",
    status: "reservado",
    imagem: "/placeholder.svg",
  },
  {
    id: 4,
    titulo: "Loft Moderno",
    tipo: "Loft",
    endereco: "Rua Oscar Freire, 200, São Paulo",
    preco: "R$ 750.000",
    quartos: 1,
    banheiros: 2,
    area: "90m²",
    status: "vendido",
    imagem: "/placeholder.svg",
  },
  {
    id: 5,
    titulo: "Casa de Campo",
    tipo: "Casa",
    endereco: "Estrada do Campo, km 5, Interior",
    preco: "R$ 950.000",
    quartos: 5,
    banheiros: 4,
    area: "400m²",
    status: "inativo",
    imagem: "/placeholder.svg",
  },
];

export default function Imoveis() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Imóveis</h1>
        </div>
        <Button className="flex items-center gap-1">
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
                  <DropdownMenuItem>Todos</DropdownMenuItem>
                  <DropdownMenuItem>Apartamento</DropdownMenuItem>
                  <DropdownMenuItem>Casa</DropdownMenuItem>
                  <DropdownMenuItem>Cobertura</DropdownMenuItem>
                  <DropdownMenuItem>Loft</DropdownMenuItem>
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
                  <DropdownMenuItem>Todos</DropdownMenuItem>
                  {Object.entries(statusMap).map(([key, { label }]) => (
                    <DropdownMenuItem key={key}>{label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imoveisData.map((imovel) => (
          <Card key={imovel.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <img
                src={imovel.imagem}
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
                  <p className="font-bold text-primary">{imovel.preco}</p>
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
              <div className="mt-4 flex justify-end">
                <Button size="sm">Ver Detalhes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
