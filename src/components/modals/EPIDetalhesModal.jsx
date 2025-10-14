import React from "react";
import { X, Package, Calendar, DollarSign, AlertTriangle } from "lucide-react";

const EPIDetalhesModal = ({ isOpen, onClose, epi }) => {
  if (!isOpen || !epi) return null;

  // Função para determinar status
  const determineEPIStatus = (epi) => {
    const today = new Date();
    const validadeDate = new Date(epi.dataValidade);
    const diffDays = Math.ceil((validadeDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        text: "Vencido",
        color: "bg-red-100 text-red-800 border-red-200",
      };
    if (diffDays <= epi.diasAvisoVencimento)
      return {
        text: "Vencimento Próximo",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    if (epi.quantidadeAtual <= epi.estoqueMinimo)
      return {
        text: "Estoque Baixo",
        color: "bg-orange-100 text-orange-800 border-orange-200",
      };
    return {
      text: "Normal",
      color: "bg-green-100 text-green-800 border-green-200",
    };
  };

  const status = determineEPIStatus(epi);
  const valorTotal = (epi.quantidadeAtual * epi.valorUnitario).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {epi.descricao}
                </h3>
                <p className="text-sm text-gray-600">
                  {epi.categoria} • {epi.marca}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${status.color}`}
              >
                {status.text}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">CA Nº</p>
              <p className="text-lg font-bold text-gray-900">{epi.numeroCA}</p>
            </div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="p-6 space-y-6">
          {/* Estoque */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <Package size={16} className="mr-2" />
              Informações de Estoque
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-700 mb-1">Quantidade Atual</p>
                <p className="text-2xl font-bold text-blue-900">
                  {epi.quantidadeAtual}
                </p>
                <p className="text-xs text-blue-600">{epi.tipoEstoque}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Estoque Mínimo</p>
                <p className="text-2xl font-bold text-blue-900">
                  {epi.estoqueMinimo}
                </p>
                <p className="text-xs text-blue-600">{epi.tipoEstoque}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Tamanho</p>
                <p className="text-2xl font-bold text-blue-900">
                  {epi.tamanho}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Tipo</p>
                <p className="text-lg font-semibold text-blue-900">
                  {epi.tipoEstoque}
                </p>
              </div>
            </div>
          </div>

          {/* Validade */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-900 mb-3 flex items-center">
              <Calendar size={16} className="mr-2" />
              Validade
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-yellow-700 mb-1">Data de Validade</p>
                <p className="text-lg font-bold text-yellow-900">
                  {new Date(epi.dataValidade).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-yellow-700 mb-1">
                  Aviso de Vencimento
                </p>
                <p className="text-lg font-bold text-yellow-900">
                  {epi.diasAvisoVencimento} dias antes
                </p>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
              <DollarSign size={16} className="mr-2" />
              Informações Financeiras
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-green-700 mb-1">Valor Unitário</p>
                <p className="text-xl font-bold text-green-900">
                  R$ {epi.valorUnitario.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">
                  Valor Total em Estoque
                </p>
                <p className="text-xl font-bold text-green-900">
                  R$ {valorTotal}
                </p>
                <p className="text-xs text-green-600">
                  ({epi.quantidadeAtual} x R$ {epi.valorUnitario.toFixed(2)})
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes Adicionais */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Detalhes Adicionais
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Categoria</p>
                <p className="font-semibold text-gray-900">{epi.categoria}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Marca/Fabricante</p>
                <p className="font-semibold text-gray-900">{epi.marca}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Fornecedor</p>
                <p className="font-semibold text-gray-900">{epi.fornecedor}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Número do CA</p>
                <p className="font-semibold text-gray-900">{epi.numeroCA}</p>
              </div>
            </div>
          </div>

          {/* Alertas (se houver) */}
          {status.text !== "Normal" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Atenção Necessária
                  </h4>
                  <p className="text-sm text-red-700">
                    {status.text === "Estoque Baixo" &&
                      `O estoque atual (${epi.quantidadeAtual}) está abaixo ou igual ao estoque mínimo (${epi.estoqueMinimo}). Considere fazer uma nova compra.`}
                    {status.text === "Vencimento Próximo" &&
                      `Este EPI está próximo ao vencimento. Data de validade: ${new Date(
                        epi.dataValidade
                      ).toLocaleDateString("pt-BR")}.`}
                    {status.text === "Vencido" &&
                      `Este EPI está vencido desde ${new Date(
                        epi.dataValidade
                      ).toLocaleDateString("pt-BR")}. Não deve ser utilizado.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPIDetalhesModal;
