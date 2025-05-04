
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImoveis } from "@/hooks/useImoveis";
import { useLeadImoveis } from "@/hooks/useLeadImoveis";

interface VincularImovelFormProps {
  leadId: string;
}

export function VincularImovelForm({ leadId }: VincularImovelFormProps) {
  const [imovelId, setImovelId] = useState<string>("");
  const { imoveis } = useImoveis();
  const { vincularImovel, vinculados } = useLeadImoveis(leadId);

  // Filtra os imóveis já vinculados
  const imoveisDisponiveis = imoveis.filter(
    (imovel) => !vinculados.some((v) => v.id === imovel.id)
  );

  const handleVincular = () => {
    if (!imovelId) return;

    vincularImovel.mutate({
      leadId,
      imovelId,
    }, {
      onSuccess: () => {
        setImovelId("");
      }
    });
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Select value={imovelId} onValueChange={setImovelId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um imóvel" />
          </SelectTrigger>
          <SelectContent>
            {imoveisDisponiveis.map((imovel) => (
              <SelectItem key={imovel.id} value={imovel.id}>
                {imovel.titulo}
              </SelectItem>
            ))}
            {imoveisDisponiveis.length === 0 && (
              <SelectItem value="no-items-available" disabled>
                Não há imóveis disponíveis para vincular
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={handleVincular} 
        disabled={!imovelId || vincularImovel.isPending}
      >
        {vincularImovel.isPending ? "Vinculando..." : "Vincular"}
      </Button>
    </div>
  );
}
