import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Home,
  Package,
  TrendingUp,
  FileText,
  Users,
  Info,
  LogOut,
  X,
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentView, setCurrentView }) => {
  const { logout, hasPermission } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Erro ao sair:", error);
      }
    }
  };

  const handleMenuClick = (itemId) => {
    setCurrentView(itemId);
    setSidebarOpen(false);
  };

  // Relatórios exige "gerar": até os relatórios salvos existirem, o visualizador não tem o que ver ali.
  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", permissao: "epis:ver" },
    { id: "estoque", icon: Package, label: "Controle de Estoque", permissao: "epis:ver" },
    { id: "movimentacoes", icon: TrendingUp, label: "Movimentações", permissao: "movimentacoes:ver" },
    { id: "relatorios", icon: FileText, label: "Relatórios", permissao: "relatorios:gerar" },
    { id: "usuarios", icon: Users, label: "Usuários", permissao: "usuarios:gerir" },
    { id: "sobre", icon: Info, label: "Sobre" },
  ].filter((item) => !item.permissao || hasPermission(item.permissao));

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-red-600 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header do Sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-red-500">
        <div className="flex items-center space-x-3">
          {/* <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
            <span className="text-red-600 font-bold text-xs">SENAI</span>
          </div> */}
          <div className="text-white">
            <h2 className="font-bold">EPI System</h2>
            <p className="text-xs text-red-100">Controle de EPIs</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 text-white hover:bg-red-500 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Menu de Navegação */}
      <nav className="mt-4">
        <div className="px-4 mb-4">
          <h3 className="text-xs font-semibold text-red-200 uppercase tracking-wide">
            Menu Principal
          </h3>
        </div>

        {/* Itens do menu principais */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500 transition-colors ${
              currentView === item.id
                ? "bg-red-500 border-r-4 border-white"
                : ""
            }`}
          >
            <item.icon size={20} className="text-white" />
            <span className="text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Botão de Sair */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500 rounded-lg transition-colors"
        >
          <LogOut size={20} className="text-white" />
          <span className="text-white font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
