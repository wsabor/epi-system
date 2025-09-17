import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Download,
  Calendar,
  User,
  Building2,
  Shield,
  Headphones,
  Glasses,
  HardHat,
  Hand,
  Footprints,
  Shirt,
  MoreHorizontal,
  Bell,
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Save,
  ArrowUpDown,
} from "lucide-react";

// Dados mockados para demonstração
const mockEPIs = [
  {
    id: 1,
    descricao: "Capacete de Segurança Branco",
    categoria: "Capacetes",
    tamanho: "Único",
    quantidadeAtual: 45,
    tipoEstoque: "Peça",
    marca: "MSA",
    numeroCA: "12345",
    dataValidade: "2025-12-31",
    valorUnitario: 35.5,
    fornecedor: "EPI Tech",
    estoqueMinimo: 20,
    diasAvisoVencimento: 30,
    status: "normal",
  },
  {
    id: 2,
    descricao: "Luva de Couro Cano Curto",
    categoria: "Luvas",
    tamanho: "G",
    quantidadeAtual: 8,
    tipoEstoque: "Par",
    marca: "Vonder",
    numeroCA: "67890",
    dataValidade: "2024-06-30",
    valorUnitario: 15.9,
    fornecedor: "Proteção Plus",
    estoqueMinimo: 15,
    diasAvisoVencimento: 60,
    status: "estoque_baixo",
  },
  {
    id: 3,
    descricao: "Óculos de Proteção Incolor",
    categoria: "Proteção Visual",
    tamanho: "Único",
    quantidadeAtual: 32,
    tipoEstoque: "Peça",
    marca: "3M",
    numeroCA: "54321",
    dataValidade: "2024-03-15",
    valorUnitario: 12.8,
    fornecedor: "Safety Store",
    estoqueMinimo: 25,
    diasAvisoVencimento: 45,
    status: "vencimento_proximo",
  },
];

const mockMovimentacoes = [
  {
    id: 1,
    epiId: 1,
    epiDescricao: "Capacete de Segurança Branco",
    tipo: "entrada",
    quantidade: 50,
    quantidadeAnterior: 20,
    responsavel: "João Silva",
    funcionarioRecebeu: "",
    motivo: "Compra",
    observacoes: "Lote novo recebido do fornecedor",
    data: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    epiId: 2,
    epiDescricao: "Luva de Couro Cano Curto",
    tipo: "saida",
    quantidade: 5,
    quantidadeAnterior: 25,
    responsavel: "Maria Santos",
    funcionarioRecebeu: "Carlos Oliveira",
    motivo: "Entrega para funcionário",
    observacoes: "Entrega mensal",
    data: "2024-01-10T14:20:00",
  },
];

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

const App = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    nome: "João Silva",
    email: "joao.silva@senaisp.edu.br",
    permissao: "administrador",
  });

  // Estados para os modais/formulários
  const [showAddEPI, setShowAddEPI] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [editingEPI, setEditingEPI] = useState(null);

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Estados dos dados
  const [epis, setEpis] = useState(mockEPIs);
  const [movimentacoes, setMovimentacoes] = useState(mockMovimentacoes);

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

  // Atualizar status dos EPIs
  useEffect(() => {
    const updatedEpis = epis.map((epi) => ({
      ...epi,
      status: determineEPIStatus(epi),
    }));
    setEpis(updatedEpis);
  }, [epis]); // Adicionar dependência

  // Filtrar EPIs
  const filteredEpis = useMemo(() => {
    return epis.filter((epi) => {
      const matchesSearch =
        epi.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        epi.marca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || epi.categoria === filterCategory;
      const matchesStatus = !filterStatus || epi.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [epis, searchTerm, filterCategory, filterStatus]);

  // Calcular estatísticas para o dashboard
  const stats = useMemo(() => {
    const total = epis.length;
    const estoqueBaixo = epis.filter(
      (epi) => epi.status === "estoque_baixo"
    ).length;
    const vencimentoProximo = epis.filter(
      (epi) => epi.status === "vencimento_proximo"
    ).length;
    const vencidos = epis.filter((epi) => epi.status === "vencido").length;
    const alertas = estoqueBaixo + vencimentoProximo + vencidos;

    return { total, estoqueBaixo, vencimentoProximo, vencidos, alertas };
  }, [epis]);

  // Componente do Header
  const Header = () => (
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
          {stats.alertas > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {stats.alertas}
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

  // Componente da Sidebar
  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-red-600 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-red-500">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <span className="text-red-600 font-bold">SENAI</span>
          </div>
          <div className="text-white">
            <h2 className="font-bold">EPIs</h2>
            <p className="text-xs text-red-100">Controle</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 text-white hover:bg-red-500 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-4">
        <div className="px-4 mb-4">
          <h3 className="text-xs font-semibold text-red-200 uppercase tracking-wide">
            Menu Principal
          </h3>
        </div>

        {[
          { id: "dashboard", icon: Home, label: "Dashboard" },
          { id: "estoque", icon: Package, label: "Controle de Estoque" },
          { id: "movimentacoes", icon: TrendingUp, label: "Movimentações" },
          { id: "relatorios", icon: FileText, label: "Relatórios" },
          { id: "usuarios", icon: Users, label: "Usuários" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500 transition-colors ${
              currentView === item.id
                ? "bg-red-500 border-r-2 border-white"
                : ""
            }`}
          >
            <item.icon size={20} className="text-white" />
            <span className="text-white">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-500 rounded-lg transition-colors">
          <LogOut size={20} className="text-white" />
          <span className="text-white">Sair</span>
        </button>
      </div>
    </div>
  );

  // Componente de Estatísticas
  const StatsCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-lg ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  // Componente Dashboard
  const Dashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do controle de EPIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Package}
          title="Total de EPIs"
          value={stats.total}
          color="text-blue-600"
          subtitle="Tipos cadastrados"
        />
        <StatsCard
          icon={AlertTriangle}
          title="Estoque Baixo"
          value={stats.estoqueBaixo}
          color="text-orange-600"
          subtitle="Abaixo do mínimo"
        />
        <StatsCard
          icon={Calendar}
          title="Vencimento Próximo"
          value={stats.vencimentoProximo}
          color="text-yellow-600"
          subtitle="Próximos ao venc."
        />
        <StatsCard
          icon={AlertTriangle}
          title="Vencidos"
          value={stats.vencidos}
          color="text-red-600"
          subtitle="Fora da validade"
        />
      </div>

      {stats.alertas > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle size={20} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Alertas Importantes</h3>
          </div>
          <div className="space-y-2">
            {stats.estoqueBaixo > 0 && (
              <p className="text-red-700">
                • {stats.estoqueBaixo} EPI(s) com estoque abaixo do mínimo
              </p>
            )}
            {stats.vencimentoProximo > 0 && (
              <p className="text-red-700">
                • {stats.vencimentoProximo} EPI(s) com vencimento próximo
              </p>
            )}
            {stats.vencidos > 0 && (
              <p className="text-red-700">• {stats.vencidos} EPI(s) vencidos</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          EPIs que Precisam de Atenção
        </h3>
        <div className="space-y-3">
          {epis
            .filter((epi) => epi.status !== "normal")
            .map((epi) => {
              const IconComponent = categoriaIcons[epi.categoria] || Package;
              return (
                <div
                  key={epi.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent size={20} className="text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {epi.descricao}
                      </p>
                      <p className="text-sm text-gray-500">
                        {epi.categoria} • {epi.marca}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        epi.status === "estoque_baixo"
                          ? "bg-orange-100 text-orange-800"
                          : epi.status === "vencimento_proximo"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {epi.status === "estoque_baixo"
                        ? "Estoque Baixo"
                        : epi.status === "vencimento_proximo"
                        ? "Vence em Breve"
                        : "Vencido"}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {epi.quantidadeAtual} {epi.tipoEstoque.toLowerCase()}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // Componente do Modal de Adicionar/Editar EPI
  const EPIModal = ({ isOpen, onClose, epi = null }) => {
    const [formData, setFormData] = useState({
      descricao: "",
      categoria: "",
      tamanho: "",
      quantidadeAtual: "",
      tipoEstoque: "Peça",
      marca: "",
      numeroCA: "",
      dataValidade: "",
      valorUnitario: "",
      fornecedor: "",
      estoqueMinimo: "",
      diasAvisoVencimento: "",
    });

    useEffect(() => {
      if (epi) {
        setFormData({
          descricao: epi.descricao || "",
          categoria: epi.categoria || "",
          tamanho: epi.tamanho || "",
          quantidadeAtual: epi.quantidadeAtual || "",
          tipoEstoque: epi.tipoEstoque || "Peça",
          marca: epi.marca || "",
          numeroCA: epi.numeroCA || "",
          dataValidade: epi.dataValidade || "",
          valorUnitario: epi.valorUnitario || "",
          fornecedor: epi.fornecedor || "",
          estoqueMinimo: epi.estoqueMinimo || "",
          diasAvisoVencimento: epi.diasAvisoVencimento || "",
        });
      } else {
        setFormData({
          descricao: "",
          categoria: "",
          tamanho: "",
          quantidadeAtual: "",
          tipoEstoque: "Peça",
          marca: "",
          numeroCA: "",
          dataValidade: "",
          valorUnitario: "",
          fornecedor: "",
          estoqueMinimo: "",
          diasAvisoVencimento: "",
        });
      }
    }, [epi, isOpen]);

    useEffect(() => {
      const updatedEpis = epis.map((epi) => ({
        ...epi,
        status: determineEPIStatus(epi),
      }));
      setEpis(updatedEpis);
    }, [epis]); // Adicionar dependência

    const getTamanhosOptions = () => {
      switch (formData.categoria) {
        case "Uniformes":
          return ["PP", "P", "M", "G", "GG"];
        case "Calçados de Segurança":
          return Array.from({ length: 15 }, (_, i) => (34 + i).toString());
        default:
          return ["Único"];
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {epi ? "Editar EPI" : "Adicionar Novo EPI"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do EPI *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoria: e.target.value,
                      tamanho: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {Object.keys(categoriaIcons).map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho *
                </label>
                <select
                  required
                  value={formData.tamanho}
                  onChange={(e) =>
                    setFormData({ ...formData, tamanho: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  disabled={!formData.categoria}
                >
                  <option value="">Selecione o tamanho</option>
                  {getTamanhosOptions().map((tamanho) => (
                    <option key={tamanho} value={tamanho}>
                      {tamanho}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Estoque *
                </label>
                <select
                  required
                  value={formData.tipoEstoque}
                  onChange={(e) =>
                    setFormData({ ...formData, tipoEstoque: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Peça">Peça</option>
                  <option value="Par">Par</option>
                  <option value="Kit">Kit</option>
                  <option value="Metro">Metro</option>
                  <option value="Litro">Litro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade Atual *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantidadeAtual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantidadeAtual: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque Mínimo *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.estoqueMinimo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estoqueMinimo: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca/Fabricante *
                </label>
                <input
                  type="text"
                  required
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número do CA *
                </label>
                <input
                  type="text"
                  required
                  value={formData.numeroCA}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroCA: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Validade *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dataValidade}
                  onChange={(e) =>
                    setFormData({ ...formData, dataValidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias p/ Aviso de Vencimento *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.diasAvisoVencimento}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diasAvisoVencimento: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Unitário (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={formData.valorUnitario}
                  onChange={(e) =>
                    setFormData({ ...formData, valorUnitario: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornecedor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fornecedor}
                  onChange={(e) =>
                    setFormData({ ...formData, fornecedor: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>{epi ? "Salvar Alterações" : "Cadastrar EPI"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente do Modal de Movimentação
  const MovimentacaoModal = ({ isOpen, onClose, epiSelecionado = null }) => {
    const [formData, setFormData] = useState({
      epiId: "",
      tipoMovimentacao: "",
      quantidade: "",
      responsavel: currentUser.nome,
      funcionarioRecebeu: "",
      motivo: "",
      observacoes: "",
    });

    useEffect(() => {
      if (epiSelecionado) {
        setFormData((prev) => ({
          ...prev,
          epiId: epiSelecionado.id.toString(),
        }));
      }
    }, [epiSelecionado]);

    const handleSubmit = (e) => {
      e.preventDefault();

      const epiSelecionadoObj = epis.find(
        (epi) => epi.id === parseInt(formData.epiId)
      );
      const quantidade = parseInt(formData.quantidade);

      // Criar nova movimentação
      const novaMovimentacao = {
        id: Date.now(),
        ...formData,
        epiId: parseInt(formData.epiId),
        epiDescricao: epiSelecionadoObj.descricao,
        quantidade: quantidade,
        quantidadeAnterior: epiSelecionadoObj.quantidadeAtual,
        data: new Date().toISOString(),
        userId: "user-123",
      };

      // Atualizar estoque do EPI
      let novaQuantidade = epiSelecionadoObj.quantidadeAtual;

      switch (formData.tipoMovimentacao) {
        case "entrada":
          novaQuantidade += quantidade;
          break;
        case "saida":
          novaQuantidade = Math.max(0, novaQuantidade - quantidade);
          break;
        case "ajuste":
          novaQuantidade = quantidade;
          break;
        case "perda":
          novaQuantidade = Math.max(0, novaQuantidade - quantidade);
          break;
      }

      const episAtualizados = epis.map((epi) =>
        epi.id === parseInt(formData.epiId)
          ? { ...epi, quantidadeAtual: novaQuantidade }
          : epi
      );

      setEpis(episAtualizados);
      setMovimentacoes([...movimentacoes, novaMovimentacao]);

      // Reset form
      setFormData({
        epiId: "",
        tipoMovimentacao: "",
        quantidade: "",
        responsavel: currentUser.nome,
        funcionarioRecebeu: "",
        motivo: "",
        observacoes: "",
      });

      onClose();
    };

    if (!isOpen) return null;

    const epiSelecionadoObj = epis.find(
      (epi) => epi.id === parseInt(formData.epiId)
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Nova Movimentação
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EPI *
                </label>
                <select
                  required
                  value={formData.epiId}
                  onChange={(e) =>
                    setFormData({ ...formData, epiId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione um EPI</option>
                  {epis.map((epi) => (
                    <option key={epi.id} value={epi.id}>
                      {epi.descricao} - {epi.marca} ({epi.quantidadeAtual}{" "}
                      {epi.tipoEstoque.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimentação *
                </label>
                <select
                  required
                  value={formData.tipoMovimentacao}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tipoMovimentacao: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="ajuste">Ajuste de Inventário</option>
                  <option value="perda">Perda/Avaria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={
                    formData.tipoMovimentacao === "ajuste"
                      ? undefined
                      : epiSelecionadoObj?.quantidadeAtual
                  }
                  value={formData.quantidade}
                  onChange={(e) =>
                    setFormData({ ...formData, quantidade: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {epiSelecionadoObj && (
                  <p className="text-sm text-gray-500 mt-1">
                    Estoque atual: {epiSelecionadoObj.quantidadeAtual}{" "}
                    {epiSelecionadoObj.tipoEstoque.toLowerCase()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável *
                </label>
                <input
                  type="text"
                  required
                  value={formData.responsavel}
                  onChange={(e) =>
                    setFormData({ ...formData, responsavel: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {formData.tipoMovimentacao === "saida" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funcionário que Recebeu
                  </label>
                  <input
                    type="text"
                    value={formData.funcionarioRecebeu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        funcionarioRecebeu: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              <div
                className={
                  formData.tipoMovimentacao === "saida" ? "" : "md:col-span-2"
                }
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
                  }
                  placeholder="Ex: Compra, Entrega para funcionário, Inventário, Avaria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                rows="3"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Observações adicionais..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Registrar Movimentação</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente de Controle de Estoque
  const ControleEstoque = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Controle de Estoque
          </h2>
          <p className="text-gray-600">Gerenciar EPIs cadastrados</p>
        </div>
        <button
          onClick={() => setShowAddEPI(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Novo EPI</span>
        </button>
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
              {filteredEpis.map((epi) => {
                const IconComponent = categoriaIcons[epi.categoria] || Package;
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
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          epi.status === "normal"
                            ? "bg-green-100 text-green-800"
                            : epi.status === "estoque_baixo"
                            ? "bg-orange-100 text-orange-800"
                            : epi.status === "vencimento_proximo"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {epi.status === "normal"
                          ? "Normal"
                          : epi.status === "estoque_baixo"
                          ? "Estoque Baixo"
                          : epi.status === "vencimento_proximo"
                          ? "Vence em Breve"
                          : "Vencido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(epi.dataValidade).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowMovimentacao(true)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Movimentar"
                        >
                          <TrendingUp size={16} />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Visualizar"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setEditingEPI(epi)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Componente de Movimentações
  const Movimentacoes = () => {
    const [searchMovTerm, setSearchMovTerm] = useState("");
    const [filterMovTipo, setFilterMovTipo] = useState("");
    const [filterDataInicio, setFilterDataInicio] = useState("");
    const [filterDataFim, setFilterDataFim] = useState("");

    const filteredMovimentacoes = useMemo(() => {
      return movimentacoes.filter((mov) => {
        const matchesSearch =
          mov.epiDescricao
            .toLowerCase()
            .includes(searchMovTerm.toLowerCase()) ||
          mov.responsavel.toLowerCase().includes(searchMovTerm.toLowerCase());
        const matchesTipo = !filterMovTipo || mov.tipo === filterMovTipo;

        let matchesData = true;
        if (filterDataInicio && filterDataFim) {
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
          return tipo;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Movimentações</h2>
            <p className="text-gray-600">
              Histórico de entradas e saídas de EPIs
            </p>
          </div>
          <button
            onClick={() => setShowMovimentacao(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nova Movimentação</span>
          </button>
        </div>

        {/* Filtros de Movimentação */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-3 text-gray-400"
              />
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
                      <p>Nenhuma movimentação encontrada</p>
                    </td>
                  </tr>
                ) : (
                  filteredMovimentacoes.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(mov.data).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(mov.data).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {mov.epiDescricao}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mov.quantidadeAnterior} →{" "}
                          {mov.tipo === "entrada"
                            ? mov.quantidadeAnterior + mov.quantidade
                            : mov.tipo === "ajuste"
                            ? mov.quantidade
                            : Math.max(
                                0,
                                mov.quantidadeAnterior - mov.quantidade
                              )}
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
                          {mov.quantidade}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mov.responsavel}
                        </div>
                        {mov.funcionarioRecebeu && (
                          <div className="text-sm text-gray-500">
                            → {mov.funcionarioRecebeu}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {mov.motivo}
                        </div>
                        {mov.observacoes && (
                          <div className="text-sm text-gray-500 mt-1">
                            {mov.observacoes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 p-1"
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
                    {
                      filteredMovimentacoes.filter((m) => m.tipo === "entrada")
                        .length
                    }
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
                    {
                      filteredMovimentacoes.filter((m) => m.tipo === "saida")
                        .length
                    }
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
                    {
                      filteredMovimentacoes.filter((m) => m.tipo === "ajuste")
                        .length
                    }
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
                    {
                      filteredMovimentacoes.filter((m) => m.tipo === "perda")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-6">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "estoque" && <ControleEstoque />}
          {currentView === "movimentacoes" && <Movimentacoes />}
          {currentView === "relatorios" && (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Relatórios
              </h3>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          )}
          {currentView === "usuarios" && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Usuários
              </h3>
              <p className="text-gray-600">
                Funcionalidade em desenvolvimento...
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modais */}
      <EPIModal isOpen={showAddEPI} onClose={() => setShowAddEPI(false)} />
      <EPIModal
        isOpen={!!editingEPI}
        onClose={() => setEditingEPI(null)}
        epi={editingEPI}
      />
      <MovimentacaoModal
        isOpen={showMovimentacao}
        onClose={() => setShowMovimentacao(false)}
      />
    </div>
  );
};

export default App;
