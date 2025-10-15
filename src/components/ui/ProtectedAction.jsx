import React from "react";
import { usePermissions } from "../../contexts/PermissionsContext";
import { Lock } from "lucide-react";

/**
 * Componente que protege ações baseado em permissões
 * 
 * @param {string} permission - Nome da permissão requerida
 * @param {React.ReactNode} children - Conteúdo a ser renderizado se tiver permissão
 * @param {React.ReactNode} fallback - Conteúdo alternativo se não tiver permissão (opcional)
 * @param {boolean} showLocked - Se true, mostra o elemento desabilitado ao invés de esconder (opcional)
 * @param {string} lockedMessage - Mensagem a ser exibida quando bloqueado (opcional)
 */
const ProtectedAction = ({
  permission,
  children,
  fallback = null,
  showLocked = false,
  lockedMessage = "Você não tem permissão para esta ação",
}) => {
  const { hasPermission } = usePermissions();

  const hasAccess = hasPermission(permission);

  // Se não tem permissão
  if (!hasAccess) {
    // Se deve mostrar bloqueado
    if (showLocked) {
      return (
        <div className="relative group">
          <div className="opacity-50 cursor-not-allowed pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 whitespace-nowrap">
              <Lock size={14} />
              <span>{lockedMessage}</span>
            </div>
          </div>
        </div>
      );
    }

    // Caso contrário, retorna o fallback ou null
    return fallback;
  }

  // Tem permissão, renderiza normalmente
  return <>{children}</>;
};

export default ProtectedAction;
