
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { MainLayout } from "./components/layout/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Imoveis from "./pages/Imoveis";
import Agenda from "./pages/Agenda";
import Documentos from "./pages/Documentos";
import BaseConhecimento from "./pages/BaseConhecimento";
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
              <Route path="/imoveis" element={<Imoveis />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/base-conhecimento" element={<BaseConhecimento />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
