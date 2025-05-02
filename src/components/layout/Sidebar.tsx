
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  Building2,
  Calendar,
  FileText,
  BookOpen,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/components/theme/ThemeProvider";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function Sidebar({ open, setOpen }: SidebarProps) {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile) setOpen(true);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, setOpen]);

  // Função para fechar o menu ao clicar fora em dispositivos móveis
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar-main');
      if (isMobile && open && sidebar && !sidebar.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, open, setOpen]);

  const handleLinkClick = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const isDark = theme === 'dark';
  
  const activeClass = `${isDark 
    ? "bg-gray-800 text-white font-medium" 
    : "bg-sidebar-accent text-sidebar-accent-foreground font-medium"}`;
    
  const normalClass = `${isDark 
    ? "text-gray-300 hover:bg-gray-800 hover:text-white" 
    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        id="sidebar-main"
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${isMobile ? "shadow-lg" : ""} ${
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } border-r`}
      >
        {/* Sidebar header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}>
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">CP</span>
            </div>
            <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Casa Próxima</h1>
          </NavLink>
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* Sidebar content */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            <NavLink
              to="/"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Home className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/leads"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Leads</span>
            </NavLink>
            <NavLink
              to="/imoveis"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Building2 className="w-5 h-5 mr-3" />
              <span>Imóveis</span>
            </NavLink>
            <NavLink
              to="/agenda"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Calendar className="w-5 h-5 mr-3" />
              <span>Agenda</span>
            </NavLink>
            <NavLink
              to="/documentos"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <FileText className="w-5 h-5 mr-3" />
              <span>Documentos</span>
            </NavLink>
            <NavLink
              to="/base-conhecimento"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <BookOpen className="w-5 h-5 mr-3" />
              <span>Base de Conhecimento</span>
            </NavLink>
          </nav>
          
          <div className={`px-3 py-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <NavLink
              to="/configuracoes"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${isActive ? activeClass : normalClass}`
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Configurações</span>
            </NavLink>
            <button 
              className={`flex items-center w-full px-3 py-2 mt-1 rounded-md ${
                isDark ? "text-red-400 hover:bg-red-900/30" : "text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
