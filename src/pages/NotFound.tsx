
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl font-medium mb-6">Página não encontrada</p>
        <p className="text-muted-foreground mb-8 max-w-md">
          Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido movida ou removida.
        </p>
        <Button asChild className="flex items-center gap-2">
          <a href="/">
            <Home className="h-4 w-4" />
            <span>Voltar para o início</span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
