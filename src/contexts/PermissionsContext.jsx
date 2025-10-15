import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

const PermissionsContext = createContext();

// Definição de permissões por role
const PERMISSIONS = {
  admin: {
    // Usuários
    criarUsuarios: true,
    editarUsuarios: true,
    excluirUsuarios: true,
    ativarDesativarUsuarios: true,
    visualizarUsuarios: true,
    visualizarAuditoria: true,

    // EPIs
    criarEPIs: true,
    editarEPIs: true,
    excluirEPIs: true,
    visualizarEPIs: true,

    // Movimentações
    criarMovimentacoes: true,
    editarMovimentacoes: true,
    excluirMovimentacoes: true,
    visualizarMovimentacoes: true,

    // Relatórios
    gerarRelatorios: true,
    exportarRelatorios: true,

    // Dashboard
    visualizarDashboard: true,
  },
  operador: {
    // Usuários
    criarUsuarios: false,
    editarUsuarios: false,
    excluirUsuarios: false,
    ativarDesativarUsuarios: false,
    visualizarUsuarios: false,
    visualizarAuditoria: false,

    // EPIs
    criarEPIs: true,
    editarEPIs: true,
    excluirEPIs: false, // Operador NÃO pode excluir
    visualizarEPIs: true,

    // Movimentações
    criarMovimentacoes: true,
    editarMovimentacoes: true,
    excluirMovimentacoes: false,
    visualizarMovimentacoes: true,

    // Relatórios
    gerarRelatorios: true,
    exportarRelatorios: true,

    // Dashboard
    visualizarDashboard: true,
  },
  visualizador: {
    // Usuários
    criarUsuarios: false,
    editarUsuarios: false,
    excluirUsuarios: false,
    ativarDesativarUsuarios: false,
    visualizarUsuarios: false,
    visualizarAuditoria: false,

    // EPIs
    criarEPIs: false,
    editarEPIs: false,
    excluirEPIs: false,
    visualizarEPIs: true, // Apenas visualizar

    // Movimentações
    criarMovimentacoes: false,
    editarMovimentacoes: false,
    excluirMovimentacoes: false,
    visualizarMovimentacoes: true, // Apenas visualizar

    // Relatórios
    gerarRelatorios: true, // Pode gerar relatórios básicos
    exportarRelatorios: false, // Mas não exportar

    // Dashboard
    visualizarDashboard: true,
  },
};

export const PermissionsProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Função para verificar se o usuário tem uma permissão específica
  const hasPermission = (permission) => {
    if (!currentUser) return false;

    // Se não tiver role definido, assume visualizador
    const userRole = currentUser.role || "visualizador";

    // Se o role não existir nas permissões, retorna false
    if (!PERMISSIONS[userRole]) {
      console.warn(`Role "${userRole}" não encontrado nas permissões`);
      return false;
    }

    return PERMISSIONS[userRole][permission] || false;
  };

  // Função para verificar se o usuário tem um role específico
  const hasRole = (role) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  // Função para verificar se é admin
  const isAdmin = () => hasRole("admin");

  // Função para verificar se é operador
  const isOperador = () => hasRole("operador");

  // Função para verificar se é visualizador
  const isVisualizador = () => hasRole("visualizador");

  // Função para obter todas as permissões do usuário atual
  const getUserPermissions = () => {
    if (!currentUser) return {};
    const userRole = currentUser.role || "visualizador";
    return PERMISSIONS[userRole] || {};
  };

  const value = {
    hasPermission,
    hasRole,
    isAdmin,
    isOperador,
    isVisualizador,
    getUserPermissions,
    currentUserRole: currentUser?.role || "visualizador",
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error(
      "usePermissions deve ser usado dentro de um PermissionsProvider"
    );
  }
  return context;
};
