
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Status dos leads com suas respectivas cores
const statusMap: Record<string, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contato: { label: "Contato", color: "bg-yellow-100 text-yellow-700" },
  visita: { label: "Visita", color: "bg-purple-100 text-purple-700" },
  proposta: { label: "Proposta", color: "bg-orange-100 text-orange-700" },
  vendido: { label: "Vendido", color: "bg-green-100 text-green-700" },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

// Dados de exemplo para os leads
const leadsData = [
  {
    id: 1,
    nome: "Ana Silva",
    telefone: "(11) 98765-4321",
    email: "ana.silva@exemplo.com",
    interesse: "Apartamento 3 quartos",
    status: "novo",
    dataCriacao: "15/04/2023",
  },
  {
    id: 2,
    nome: "Carlos Oliveira",
    telefone: "(21) 98765-4321",
    email: "carlos.oliveira@exemplo.com",
    interesse: "Casa com quintal",
    status: "contato",
    dataCriacao: "20/04/2023",
  },
  {
    id: 3,
    nome: "Mariana Santos",
    telefone: "(31) 98765-4321",
    email: "mariana.santos@exemplo.com",
    interesse: "Loft na área central",
    status: "visita",
    dataCriacao: "25/04/2023",
  },
  {
    id: 4,
    nome: "Paulo Mendes",
    telefone: "(41) 98765-4321",
    email: "paulo.mendes@exemplo.com",
    interesse: "Cobertura duplex",
    status: "proposta",
    dataCriacao: "01/05/2023",
  },
  {
    id: 5,
    nome: "Fernanda Lima",
    telefone: "(51) 98765-4321",
    email: "fernanda.lima@exemplo.com",
    interesse: "Casa em condomínio fechado",
    status: "vendido",
    dataCriacao: "10/05/2023",
  },
];

export default function Leads() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Novo Lead</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar leads..."
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

          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.nome}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>{lead.telefone}</div>
                      <div className="text-xs text-muted-foreground">
                        {lead.email}
                      </div>
                    </TableCell>
                    <TableCell>{lead.interesse}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${statusMap[lead.status].color} border-none`}
                      >
                        {statusMap[lead.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{lead.dataCriacao}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Agendar visita</DropdownMenuItem>
                          <DropdownMenuItem>WhatsApp</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
