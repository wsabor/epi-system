import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  TrendingUp,
  Eye,
  Edit2,
  Trash2,
  Package,
  Shield,
  Headphones,
  Glasses,
  HardHat,
  Hand,
  Footprints,
  Shirt,
} from "lucide-react";

const ControleEstoque = ({
  epis,
  onAddEPI,
  onEditEPI,
  onDeleteEPI,
  onMovimentacao,
  onViewEPI,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Ícones para as categorias
  const categoriaIcons = {
    "Proteção Respiratória": Shield,
    "Proteção Auditiva": Headphones,
    "Proteção Visual": Glasses,
    Capacetes: HardHat,
    Luvas: Hand,
    "Calçados de Segurança": Footprints,
    Uniformes: Shirt,
    Outros: Package,
  };

  // Função para determinar status do EPI
  const determineEPIStatus = (epi) => {
    const today = new Date();
    const validadeDate = new Date(epi.dataValidade);
    const diffDays = Math.ceil((validadeDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "vencido";
    if (diffDays <= epi.diasAvisoVencimento) return "vencimento_proximo";
    if (epi.quantidadeAtual <= epi.estoqueMinimo) return "estoque_baixo";
    return "normal";
  };

  // Filtrar EPIs
  const filteredEpis = useMemo(() => {
    return epis.filter((epi) => {
      const matchesSearch =
        epi.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        epi.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || epi.categoria === filterCategory;
      const status = determineEPIStatus(epi);
      const matchesStatus = !filterStatus || status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [epis, searchTerm, filterCategory, filterStatus]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "normal":
        return { text: "Normal", className: "bg-green-100 text-green-800" };
      case "estoque_baixo":
        return {
          text: "Estoque Baixo",
          className: "bg-orange-100 text-orange-800",
        };
      case "vencimento_proximo":
        return {
          text: "Vence em Breve",
          className: "bg-yellow-100 text-yellow-800",
        };
      case "vencido":
        return { text: "Vencido", className: "bg-red-100 text-red-800" };
      default:
        return { text: "Normal", className: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Controle de Estoque
          </h2>
          <p className="text-gray-600">Gerenciar EPIs cadastrados</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onMovimentacao}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <TrendingUp size={20} />
            <span>Movimentação</span>
          </button>
          <button
            onClick={onAddEPI}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Novo EPI</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar EPIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas as Categorias</option>
            {Object.keys(categoriaIcons).map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todos os Status</option>
            <option value="normal">Normal</option>
            <option value="estoque_baixo">Estoque Baixo</option>
            <option value="vencimento_proximo">Vencimento Próximo</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>
      </div>

      {/* Lista de EPIs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estoque
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEpis.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Package size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Nenhum EPI encontrado</p>
                    <p className="text-sm mt-1">
                      {searchTerm || filterCategory || filterStatus
                        ? "Tente ajustar os filtros de busca"
                        : 'Clique em "Novo EPI" para cadastrar'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEpis.map((epi) => {
                  const IconComponent =
                    categoriaIcons[epi.categoria] || Package;
                  const status = determineEPIStatus(epi);
                  const badge = getStatusBadge(status);

                  return (
                    <tr key={epi.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IconComponent
                            size={20}
                            className="text-gray-600 mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {epi.descricao}
                            </div>
                            <div className="text-sm text-gray-500">
                              {epi.marca} • CA {epi.numeroCA}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {epi.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {epi.quantidadeAtual} {epi.tipoEstoque.toLowerCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Mín: {epi.estoqueMinimo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(epi.dataValidade).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onMovimentacao(epi)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Movimentar"
                          >
                            <TrendingUp size={16} />
                          </button>
                          <button
                            onClick={() => onViewEPI(epi)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Visualizar"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onEditEPI(epi)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteEPI(epi.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumo */}
      {filteredEpis.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Exibindo{" "}
              <span className="font-semibold text-gray-900">
                {filteredEpis.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-900">{epis.length}</span>{" "}
              EPIs
            </p>
            <p className="text-gray-600">
              Total em estoque:{" "}
              <span className="font-semibold text-gray-900">
                {filteredEpis.reduce(
                  (acc, epi) => acc + epi.quantidadeAtual,
                  0
                )}{" "}
                unidades
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControleEstoque;
