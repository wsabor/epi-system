import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  Eye,
  Settings,
  AlertTriangle,
  ArrowUpDown,
} from "lucide-react";
import MovimentacaoDetalhesModal from "../modals/MovimentacaoDetalhesModal";

const Movimentacoes = ({ movimentacoes = [], onNovaMovimentacao, canCreate = true }) => {
  const [searchMovTerm, setSearchMovTerm] = useState("");
  const [filterMovTipo, setFilterMovTipo] = useState("");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");
  const [movimentacaoDetalhes, setMovimentacaoDetalhes] = useState(null);

  // Filtrar movimentações (com proteção contra undefined)
  const filteredMovimentacoes = useMemo(() => {
    if (!Array.isArray(movimentacoes)) return [];

    return movimentacoes.filter((mov) => {
      // Proteção contra valores undefined/null
      const epiDescricao = mov?.epiDescricao || "";
      const responsavel = mov?.responsavel || "";

      const matchesSearch =
        epiDescricao.toLowerCase().includes(searchMovTerm.toLowerCase()) ||
        responsavel.toLowerCase().includes(searchMovTerm.toLowerCase());
      const matchesTipo = !filterMovTipo || mov?.tipo === filterMovTipo;

      let matchesData = true;
      if (filterDataInicio && filterDataFim && mov?.data) {
        const movData = new Date(mov.data);
        const dataInicio = new Date(filterDataInicio);
        const dataFim = new Date(filterDataFim);
        matchesData = movData >= dataInicio && movData <= dataFim;
      }

      return matchesSearch && matchesTipo && matchesData;
    });
  }, [
    movimentacoes,
    searchMovTerm,
    filterMovTipo,
    filterDataInicio,
    filterDataFim,
  ]);

  // Funções auxiliares (com proteção)
  const getTipoColor = (tipo) => {
    switch (tipo) {
      case "entrada":
        return "bg-green-100 text-green-800";
      case "saida":
        return "bg-blue-100 text-blue-800";
      case "ajuste":
        return "bg-yellow-100 text-yellow-800";
      case "perda":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoLabel = (tipo) => {
    switch (tipo) {
      case "entrada":
        return "Entrada";
      case "saida":
        return "Saída";
      case "ajuste":
        return "Ajuste";
      case "perda":
        return "Perda/Avaria";
      default:
        return tipo || "N/A";
    }
  };

  const calcularNovaQuantidade = (mov) => {
    if (!mov) return 0;

    const quantidadeAnterior = mov.quantidadeAnterior || 0;
    const quantidade = mov.quantidade || 0;

    switch (mov.tipo) {
      case "entrada":
        return quantidadeAnterior + quantidade;
      case "ajuste":
        return quantidade;
      case "saida":
      case "perda":
        return Math.max(0, quantidadeAnterior - quantidade);
      default:
        return quantidadeAnterior;
    }
  };

  // Calcular resumo (com proteção)
  const resumo = useMemo(() => {
    if (!Array.isArray(filteredMovimentacoes)) {
      return { entradas: 0, saidas: 0, ajustes: 0, perdas: 0 };
    }

    return {
      entradas: filteredMovimentacoes.filter((m) => m?.tipo === "entrada")
        .length,
      saidas: filteredMovimentacoes.filter((m) => m?.tipo === "saida").length,
      ajustes: filteredMovimentacoes.filter((m) => m?.tipo === "ajuste").length,
      perdas: filteredMovimentacoes.filter((m) => m?.tipo === "perda").length,
    };
  }, [filteredMovimentacoes]);

  return (
    <div className="space-y-6">
      {/* Modal de Detalhes */}
      <MovimentacaoDetalhesModal
        isOpen={!!movimentacaoDetalhes}
        onClose={() => setMovimentacaoDetalhes(null)}
        movimentacao={movimentacaoDetalhes}
      />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Movimentações</h2>
          <p className="text-gray-600">
            Histórico de entradas e saídas de EPIs
          </p>
        </div>
        {canCreate && (
          <button
            onClick={onNovaMovimentacao}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nova Movimentação</span>
          </button>
        )}
      </div>

      {/* Filtros de Movimentação */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar movimentações..."
              value={searchMovTerm}
              onChange={(e) => setSearchMovTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterMovTipo}
            onChange={(e) => setFilterMovTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todos os Tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="ajuste">Ajuste</option>
            <option value="perda">Perda/Avaria</option>
          </select>
          <input
            type="date"
            placeholder="Data início"
            value={filterDataInicio}
            onChange={(e) => setFilterDataInicio(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="Data fim"
            value={filterDataFim}
            onChange={(e) => setFilterDataFim(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Movimentações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovimentacoes.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <TrendingUp
                      size={48}
                      className="mx-auto text-gray-300 mb-4"
                    />
                    <p className="text-lg font-medium">
                      Nenhuma movimentação encontrada
                    </p>
                    <p className="text-sm mt-1">
                      {searchMovTerm || filterMovTipo || filterDataInicio
                        ? "Tente ajustar os filtros de busca"
                        : 'Clique em "Nova Movimentação" para registrar'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMovimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {mov.data
                          ? new Date(mov.data).toLocaleDateString("pt-BR")
                          : "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mov.data
                          ? new Date(mov.data).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {mov.epiDescricao || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {mov.quantidadeAnterior || 0} →{" "}
                        {calcularNovaQuantidade(mov)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(
                          mov.tipo
                        )}`}
                      >
                        {getTipoLabel(mov.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {mov.tipo === "entrada" ? "+" : "-"}
                        {mov.quantidade || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {mov.responsavel || "N/A"}
                      </div>
                      {mov.funcionarioRecebeu && (
                        <div className="text-sm text-gray-500">
                          → {mov.funcionarioRecebeu}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {mov.motivo || "N/A"}
                      </div>
                      {mov.observacoes && (
                        <div className="text-sm text-gray-500 mt-1">
                          {mov.observacoes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setMovimentacaoDetalhes(mov)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo das Movimentações */}
      {filteredMovimentacoes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Entradas</p>
                <p className="text-lg font-bold text-green-600">
                  {resumo.entradas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Saídas</p>
                <p className="text-lg font-bold text-blue-600">
                  {resumo.saidas}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Settings className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ajustes</p>
                <p className="text-lg font-bold text-yellow-600">
                  {resumo.ajustes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Perdas</p>
                <p className="text-lg font-bold text-red-600">
                  {resumo.perdas}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movimentacoes;
