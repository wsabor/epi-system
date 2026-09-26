import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";

// Components
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/pages/Dashboard";
import ControleEstoque from "./components/pages/ControleEstoque";
import Movimentacoes from "./components/pages/Movimentacoes";
import Relatorios from "./components/pages/Relatorios";
import Usuarios from "./components/pages/Usuarios/Usuarios";
import Sobre from "./components/pages/Sobre";
import AuthWrapper from "./components/auth/AuthWrapper";

//Modais
import EPIModal from "./components/modals/EPIModal";
import MovimentacaoModal from "./components/modals/MovimentacaoModal";
import EPIDetalhesModal from "./components/modals/EPIDetalhesModal";

// Hooks
import { useEPIs } from "./hooks/useEPIs";
import { useMovimentacoes } from "./hooks/useMovimentacoes";
import { dataLocal } from "./utils/datas";

// Permissão necessária para abrir cada tela (a API confere de novo em cada chamada).
const PERMISSAO_DA_TELA = {
  dashboard: "epis:ver",
  estoque: "epis:ver",
  movimentacoes: "movimentacoes:ver",
  relatorios: "relatorios:gerar",
  usuarios: "usuarios:gerir",
};

const Carregando = ({ texto }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{texto}</p>
    </div>
  </div>
);

const App = () => {
  const { usuario, loading: authLoading, hasPermission } = useAuth();

  // Estados de navegação
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { epis, loading: loadingEPIs, addEPI, updateEPI, setAtivoEPI, recarregar: recarregarEPIs } = useEPIs();
  const { movimentacoes, loading: loadingMovimentacoes, addMovimentacao } = useMovimentacoes();
  const episAtivos = epis.filter((epi) => epi.ativo);

  // Estados dos modais
  const [showAddEPI, setShowAddEPI] = useState(false);
  const [editingEPI, setEditingEPI] = useState(null);
  const [viewingEPI, setViewingEPI] = useState(null);
  // undefined = fechado; null = aberto sem EPI escolhido; objeto = aberto com o EPI pré-selecionado
  const [movimentacaoEPI, setMovimentacaoEPI] = useState(undefined);

  // Os modais aguardam estas funções e mostram o erro da API sem fechar.
  const handleSaveEPI = async (dados) => {
    if (editingEPI) {
      await updateEPI(editingEPI.id, dados);
    } else {
      await addEPI(dados);
    }
    setShowAddEPI(false);
    setEditingEPI(null);
  };

  const handleToggleAtivo = async (epi) => {
    const acao = epi.ativo ? "desativar" : "reativar";
    const aviso = epi.ativo
      ? "\n\nEle deixa de aceitar movimentações, mas o histórico é mantido."
      : "";
    if (!window.confirm(`Tem certeza que deseja ${acao} "${epi.descricao}"?${aviso}`)) return;
    try {
      await setAtivoEPI(epi.id, !epi.ativo);
    } catch (error) {
      alert(`Erro ao ${acao} EPI: ${error.message}`);
    }
  };

  const handleSaveMovimentacao = async (dados) => {
    await addMovimentacao(dados);
    await recarregarEPIs(); // o saldo do EPI mudou
    setMovimentacaoEPI(undefined);
  };

  // Alertas do cabeçalho: vencidos, vencendo e estoque baixo (só EPIs ativos)
  const alertas = episAtivos.filter((epi) => {
    const diffDays = Math.ceil((dataLocal(epi.dataValidade) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays <= epi.diasAvisoVencimento || epi.quantidadeAtual <= epi.estoqueMinimo;
  }).length;

  if (authLoading) return <Carregando texto="Carregando..." />;
  if (!usuario) return <AuthWrapper />;
  if (loadingEPIs || loadingMovimentacoes) return <Carregando texto="Carregando dados..." />;

  const permissaoTela = PERMISSAO_DA_TELA[currentView];
  const podeVerTela = !permissaoTela || hasPermission(permissaoTela);
  const podeMovimentar = hasPermission("movimentacoes:criar");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} alertas={alertas} />

        <main className="flex-1 p-6">
          {!podeVerTela && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
            </div>
          )}

          {podeVerTela && currentView === "dashboard" && <Dashboard epis={episAtivos} />}

          {podeVerTela && currentView === "estoque" && (
            <ControleEstoque
              epis={epis}
              onAddEPI={() => setShowAddEPI(true)}
              onEditEPI={(epi) => setEditingEPI(epi)}
              onToggleAtivo={handleToggleAtivo}
              onMovimentacao={(epi = null) => setMovimentacaoEPI(epi)}
              onViewEPI={(epi) => setViewingEPI(epi)}
              podeCriar={hasPermission("epis:criar")}
              podeEditar={hasPermission("epis:editar")}
              podeMovimentar={podeMovimentar}
              podeAtivar={hasPermission("epis:ativar")}
            />
          )}

          {podeVerTela && currentView === "movimentacoes" && (
            <Movimentacoes
              movimentacoes={movimentacoes}
              onNovaMovimentacao={() => setMovimentacaoEPI(null)}
              canCreate={podeMovimentar}
            />
          )}

          {podeVerTela && currentView === "relatorios" && (
            <Relatorios
              epis={episAtivos}
              movimentacoes={movimentacoes}
              podeExportar={hasPermission("relatorios:exportar")}
            />
          )}

          {podeVerTela && currentView === "usuarios" && <Usuarios />}

          {currentView === "sobre" && <Sobre />}
        </main>
      </div>

      {/* Modais */}
      <EPIModal
        isOpen={showAddEPI || !!editingEPI}
        onClose={() => {
          setShowAddEPI(false);
          setEditingEPI(null);
        }}
        epi={editingEPI}
        onSave={handleSaveEPI}
      />
      {movimentacaoEPI !== undefined && (
        <MovimentacaoModal
          isOpen
          onClose={() => setMovimentacaoEPI(undefined)}
          epis={episAtivos}
          epiInicial={movimentacaoEPI}
          onSave={handleSaveMovimentacao}
        />
      )}
      <EPIDetalhesModal isOpen={!!viewingEPI} onClose={() => setViewingEPI(null)} epi={viewingEPI} />
    </div>
  );
};

export default App;
