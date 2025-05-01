
import { Loader2, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { useLeadImoveis } from "@/hooks/useLeadImoveis";
import { VincularImovelForm } from "./VincularImovelForm";

interface ImoveisVinculadosProps {
  leadId: string;
}

export function ImoveisVinculados({ leadId }: ImoveisVinculadosProps) {
  const { vinculados, isLoading, desvincularImovel } = useLeadImoveis(leadId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Imóveis de Interesse</h3>
      </div>
      
      <VincularImovelForm leadId={leadId} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : vinculados.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          Nenhum imóvel vinculado a este lead.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vinculados.map((imovel) => (
            <Card key={imovel.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img
                  src={imovel.imagem || "/placeholder.svg"}
                  alt={imovel.titulo}
                  className="h-full w-full object-cover"
                />
                <Badge className={`absolute top-2 right-2 bg-${imovel.status === 'disponivel' ? 'green' : imovel.status === 'reservado' ? 'yellow' : imovel.status === 'vendido' ? 'blue' : 'gray'}-100 text-${imovel.status === 'disponivel' ? 'green' : imovel.status === 'reservado' ? 'yellow' : imovel.status === 'vendido' ? 'blue' : 'gray'}-700`}>
                  {imovel.status === 'disponivel' 
                    ? 'Disponível' 
                    : imovel.status === 'reservado'
                    ? 'Reservado'
                    : imovel.status === 'vendido'
                    ? 'Vendido'
                    : 'Inativo'}
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
                    <p className="font-bold text-primary">{formatCurrency(imovel.preco)}</p>
                  </div>
                </div>
                <p className="text-sm mt-2 text-muted-foreground line-clamp-1">
                  {imovel.endereco}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-xs">
                    <span className="font-bold">{imovel.quartos}</span> Quartos
                  </div>
                  <div className="text-xs">
                    <span className="font-bold">{imovel.banheiros}</span> Banheiros
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button size="sm" variant="outline">Ver Detalhes</Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => desvincularImovel.mutate(imovel.id)}
                    disabled={desvincularImovel.isPending}
                  >
                    {desvincularImovel.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
