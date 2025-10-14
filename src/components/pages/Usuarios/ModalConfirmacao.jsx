import React from "react";
import { AlertTriangle, Info, XCircle, X } from "lucide-react";

const ModalConfirmacao = ({
  aberto,
  titulo,
  mensagem,
  tipo = "warning",
  onConfirmar,
  onCancelar,
}) => {
  if (!aberto) return null;

  const tipoConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      buttonColor: "bg-orange-600 hover:bg-orange-700",
    },
    danger: {
      icon: XCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      buttonColor: "bg-red-600 hover:bg-red-700",
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const config = tipoConfig[tipo] || tipoConfig.warning;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div
            className={`flex items-start space-x-4 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
          >
            <Icon className={`${config.iconColor} flex-shrink-0`} size={24} />
            <p className="text-gray-700">{mensagem}</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancelar}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${config.buttonColor}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacao;
