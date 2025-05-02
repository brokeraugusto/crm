
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { MainLayout } from "./components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./components/leads/LeadDetail";
import Imoveis from "./pages/Imoveis";
import Agenda from "./pages/Agenda";
import Documentos from "./pages/Documentos";
import BaseConhecimento from "./pages/BaseConhecimento";
import Configuracoes from "./pages/Configuracoes";
import MeuPerfil from "./pages/MeuPerfil";
import NotFound from "./pages/NotFound";
import { useAuth } from "./components/auth/AuthProvider";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="casa-proxima-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/leads/:id" element={<LeadDetail />} />
                <Route path="/imoveis" element={<Imoveis />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/base-conhecimento" element={<BaseConhecimento />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/meu-perfil" element={<MeuPerfil />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
