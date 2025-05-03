
import { NavLink } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Home,
  Users,
  Building2,
  Calendar,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  UserCog,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { open, isMobile, openMobile, toggleSidebar } = useSidebar();
  const { theme } = useTheme();
  const { isMasterAdmin } = useAdmin();
  const isDark = theme === 'dark';
  
  const handleLinkClick = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  const activeClass = `${isDark 
    ? "bg-gray-800 text-white font-medium" 
    : "bg-sidebar-accent text-sidebar-accent-foreground font-medium"}`;
    
  const normalClass = `${isDark 
    ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`;

  const sidebarWidth = open || (isMobile && openMobile) ? "w-64" : "w-20";
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      <aside
        id="sidebar-main"
        className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out ${
          isMobile ? (openMobile ? "translate-x-0" : "-translate-x-full") : "translate-x-0"
        } ${
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        } border-r md:block ${sidebarWidth} flex-shrink-0`}
      >
        {/* Sidebar header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b ${
          isDark ? "border-gray-800" : "border-gray-200"
        }`}>
          <NavLink to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold">CP</span>
            </div>
            {(open || (isMobile && openMobile)) && (
              <h1 className={`text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>Casa Próxima</h1>
            )}
          </NavLink>
          
          {/* Desktop collapse button */}
          {!isMobile && open && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-1 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Recolher menu</span>
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
              <Home className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (isMobile && openMobile)) && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/leads"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Users className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (isMobile && openMobile)) && <span>Leads</span>}
            </NavLink>
            <NavLink
              to="/imoveis"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Building2 className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (isMobile && openMobile)) && <span>Imóveis</span>}
            </NavLink>
            <NavLink
              to="/agenda"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <Calendar className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (iMobile && openMobile)) && <span>Agenda</span>}
            </NavLink>
            <NavLink
              to="/documentos"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (iMobile && openMobile)) && <span>Documentos</span>}
            </NavLink>
            <NavLink
              to="/base-conhecimento"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md mb-1 ${isActive ? activeClass : normalClass}`
              }
            >
              <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (iMobile && openMobile)) && <span>Base de Conhecimento</span>}
            </NavLink>
            
            {/* Seção Admin - visível apenas para o usuário master */}
            {isMasterAdmin && (
              <NavLink
                to="/usuarios"
                onClick={handleLinkClick}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2 rounded-md mb-1 mt-4 ${isActive ? activeClass : normalClass}`
                }
              >
                <UserCog className="w-5 h-5 mr-3 flex-shrink-0" />
                {(open || (iMobile && openMobile)) && <span>Administração</span>}
              </NavLink>
            )}
          </nav>
          
          <div className={`px-3 py-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <NavLink
              to="/configuracoes"
              onClick={handleLinkClick}
              className={({ isActive }) => 
                `flex items-center px-3 py-2 rounded-md ${isActive ? activeClass : normalClass}`
              }
            >
              <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (iMobile && openMobile)) && <span>Configurações</span>}
            </NavLink>
            <button 
              className={`flex items-center w-full px-3 py-2 mt-1 rounded-md ${
                isDark ? "text-red-400 hover:bg-red-900/30 hover:text-red-300" : "text-red-600 hover:bg-red-50"
              }`}
            >
              <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
              {(open || (iMobile && openMobile)) && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
