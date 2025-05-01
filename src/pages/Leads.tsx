
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/leads/LeadForm";
import { useLeads } from "@/hooks/useLeads";

// Status dos leads com suas respectivas cores
const statusMap: Record<string, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  contato: { label: "Contato", color: "bg-yellow-100 text-yellow-700" },
  visita: { label: "Visita", color: "bg-purple-100 text-purple-700" },
  proposta: { label: "Proposta", color: "bg-orange-100 text-orange-700" },
  vendido: { label: "Vendido", color: "bg-green-100 text-green-700" },
  perdido: { label: "Perdido", color: "bg-red-100 text-red-700" },
};

export default function Leads() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { leads, isLoading, createLead, filter, setFilter } = useLeads();

  // Filtrar leads baseado na busca
  const filteredLeads = leads.filter(
    (lead) =>
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.telefone && lead.telefone.includes(searchTerm))
  );

  const handleCreateLead = (data: any) => {
    createLead.mutate(data, {
      onSuccess: () => {
        setOpenDialog(false);
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Novo Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <LeadForm 
              onSubmit={handleCreateLead} 
              isLoading={createLead.isPending} 
            />
          </DialogContent>
        </Dialog>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  <DropdownMenuItem onClick={() => setFilter(null)}>
                    Todos
                  </DropdownMenuItem>
                  {Object.entries(statusMap).map(([key, { label }]) => (
                    <DropdownMenuItem key={key} onClick={() => setFilter(key)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum lead encontrado.
              </div>
            ) : (
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
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.nome}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>{lead.telefone || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.email || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{lead.interesse || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${statusMap[lead.status].color} border-none`}
                        >
                          {statusMap[lead.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`https://wa.me/${lead.telefone?.replace(/\D/g, '')}`, '_blank')}>
                              WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
