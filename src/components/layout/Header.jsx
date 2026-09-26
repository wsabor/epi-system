import React, { useState } from "react";
import { Menu, Bell, LogOut, User, KeyRound } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import AlterarSenhaModal from "../modals/AlterarSenhaModal";

const NOMES_FUNCAO = {
  admin: "Administrador",
  operador: "Operador",
  visualizador: "Visualizador",
};

const Header = ({ sidebarOpen, setSidebarOpen, alertas }) => {
  const { usuario, logout } = useAuth();
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?")) {
      try {
        await logout();
      } catch (error) {
        alert("Erro ao fazer logout: " + error.message);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <AlterarSenhaModal isOpen={alterandoSenha} onClose={() => setAlterandoSenha(false)} />

      <div className="flex items-center justify-between h-16 px-4">
        {/* Botão do menu mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        {/* Logo/Título no mobile */}
        <div className="md:hidden">
          <h1 className="text-lg font-bold text-gray-900">EPIs</h1>
        </div>

        {/* Espaçador */}
        <div className="flex-1 hidden md:block"></div>

        {/* Ações */}
        <div className="flex items-center space-x-4">
          {/* Notificações */}
          <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100" title="EPIs com alerta">
            <Bell size={20} />
            {alertas > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {alertas}
              </span>
            )}
          </button>

          {/* Perfil do Usuário */}
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <User size={16} className="text-red-600" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{usuario?.nome || "Usuário"}</p>
              <p className="text-xs text-gray-500">{NOMES_FUNCAO[usuario?.role]}</p>
            </div>
          </div>

          <button
            onClick={() => setAlterandoSenha(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Alterar senha"
          >
            <KeyRound size={20} />
          </button>

          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
