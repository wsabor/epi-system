import React from "react";
import {
  X,
  Package,
  TrendingUp,
  TrendingDown,
  Edit3,
  AlertTriangle,
  User,
  Calendar,
  Hash,
  FileText,
  Activity,
} from "lucide-react";

const MovimentacaoDetalhesModal = ({ isOpen, onClose, movimentacao }) => {
  if (!isOpen || !movimentacao) return null;

  const tipoConfig = {
    entrada: {
      icon: TrendingUp,
      label: "Entrada",
      color: "bg-green-100 text-green-800 border-green-200",
      iconColor: "text-green-600",
    },
    saida: {
      icon: TrendingDown,
      label: "Saída",
      color: "bg-red-100 text-red-800 border-red-200",
      iconColor: "text-red-600",
    },
    ajuste: {
      icon: Edit3,
      label: "Ajuste",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      iconColor: "text-yellow-600",
    },
    perda: {
      icon: AlertTriangle,
      label: "Perda",
      color: "bg-purple-100 text-purple-800 border-purple-200",
      iconColor: "text-purple-600",
    },
  };

  const config = tipoConfig[movimentacao.tipo] || tipoConfig.entrada;
  const TipoIcon = config.icon;

  const formatarData = (data) => {
    if (!data) return "N/A";
    // Se for Timestamp do Firebase
    if (data?.toDate) {
      return data.toDate().toLocaleString("pt-BR");
    }
    return new Date(data).toLocaleString("pt-BR");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-lg ${config.color} border-2 flex items-center justify-center`}
            >
              <TipoIcon size={24} className={config.iconColor} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalhes da Movimentação
              </h2>
              <p className="text-sm text-gray-500">
                Visualize todas as informações desta movimentação
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tipo e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Activity size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Tipo de Movimentação
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TipoIcon size={20} className={config.iconColor} />
                <span className="text-lg font-semibold text-gray-900">
                  {config.label}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Data e Hora
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {formatarData(movimentacao.data)}
              </span>
            </div>
          </div>

          {/* EPI */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center space-x-3 mb-3">
              <Package size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">EPI</h3>
            </div>
            <p className="text-lg font-medium text-gray-900">
              {movimentacao.epiDescricao || "Não informado"}
            </p>
          </div>

          {/* Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Hash size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Quantidade Movimentada
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {movimentacao.quantidade || 0}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Quantidade Anterior
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {movimentacao.quantidadeAnterior || 0}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-600">
                  Quantidade Atual
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {movimentacao.tipo === "entrada"
                  ? (movimentacao.quantidadeAnterior || 0) +
                    (movimentacao.quantidade || 0)
                  : movimentacao.tipo === "saida" ||
                    movimentacao.tipo === "perda"
                  ? Math.max(
                      0,
                      (movimentacao.quantidadeAnterior || 0) -
                        (movimentacao.quantidade || 0)
                    )
                  : movimentacao.quantidade || 0}
              </span>
            </div>
          </div>

          {/* Responsável */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <User size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Responsável pela Movimentação
              </span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {movimentacao.responsavel || "Não informado"}
            </span>
          </div>

          {/* Funcionário que Recebeu (apenas para saída) */}
          {movimentacao.tipo === "saida" && movimentacao.funcionarioRecebeu && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <User size={18} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Funcionário que Recebeu
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {movimentacao.funcionarioRecebeu}
              </span>
            </div>
          )}

          {/* Motivo */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <FileText size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Motivo</span>
            </div>
            <p className="text-gray-900">
              {movimentacao.motivo || "Nenhum motivo informado"}
            </p>
          </div>

          {/* Observações */}
          {movimentacao.observacoes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText size={18} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  Observações
                </span>
              </div>
              <p className="text-gray-900">{movimentacao.observacoes}</p>
            </div>
          )}

          {/* Informações Adicionais */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Informações Adicionais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">ID da Movimentação:</span>
                <span className="ml-2 text-gray-900 font-mono">
                  {movimentacao.id || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">ID do EPI:</span>
                <span className="ml-2 text-gray-900 font-mono">
                  {movimentacao.epiId || "N/A"}
                </span>
              </div>
              {movimentacao.userId && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">ID do Usuário:</span>
                  <span className="ml-2 text-gray-900 font-mono">
                    {movimentacao.userId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovimentacaoDetalhesModal;
