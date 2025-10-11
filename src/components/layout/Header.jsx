import React from "react";
import { Menu, Bell, User } from "lucide-react";

const Header = ({ sidebarOpen, setSidebarOpen, alertas, currentUser }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Sistema de Controle EPIs
            </h1>
            <p className="text-sm text-gray-500">SENAI São Paulo</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} />
          {alertas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {alertas}
            </span>
          )}
        </button>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{currentUser.nome}</p>
            <p className="text-gray-500 capitalize">{currentUser.permissao}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
