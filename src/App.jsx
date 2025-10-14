import React, { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { Users, FileText } from "lucide-react";

// Components
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/pages/Dashboard";
import ControleEstoque from "./components/pages/ControleEstoque";
import Movimentacoes from "./components/pages/Movimentacoes";
import Relatorios from "./components/pages/Relatorios";

//Modais
import EPIModal from "./components/modals/EPIModal";
import MovimentacaoModal from "./components/modals/MovimentacaoModal";
import EPIDetalhesModal from "./components/modals/EPIDetalhesModal";

// Hooks
import { useEPIs } from "./hooks/useEPIs";
import { useMovimentacoes } from "./hooks/useMovimentacoes";

const App = () => {
  // Estados de navegação
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { currentUser } = useAuth();

  // Dados do Firebase via hooks customizados
  const {
    epis,
    loading: loadingEPIs,
    addEPI,
    updateEPI,
    deleteEPI,
  } = useEPIs();
  const {
    movimentacoes,
    loading: loadingMovimentacoes,
    addMovimentacao,
  } = useMovimentacoes();

  // Estados dos modais
  const [showAddEPI, setShowAddEPI] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [editingEPI, setEditingEPI] = useState(null);
  const [viewingEPI, setViewingEPI] = useState(null);

  // Handlers para EPIs
  const handleSaveEPI = async (epiData) => {
    try {
      if (epiData.id && epis.find((e) => e.id === epiData.id)) {
        // Editar EPI existente
        await updateEPI(epiData.id, epiData);
      } else {
        // Adicionar novo EPI
        await addEPI(epiData);
      }
      setShowAddEPI(false);
      setEditingEPI(null);
    } catch (error) {
      alert("Erro ao salvar EPI: " + error.message);
    }
  };

  const handleDeleteEPI = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este EPI?")) {
      try {
        await deleteEPI(id);
      } catch (error) {
        alert("Erro ao excluir EPI: " + error.message);
      }
    }
  };

  // Handler para movimentações
  const handleSaveMovimentacao = async (movimentacaoData, epiSelecionado) => {
    try {
      // Salvar movimentação no Firebase
      await addMovimentacao({
        epiId: epiSelecionado.id,
        epiDescricao: epiSelecionado.descricao,
        tipo: movimentacaoData.tipo,
        quantidade: movimentacaoData.quantidade,
        quantidadeAnterior: epiSelecionado.quantidadeAtual,
        responsavel: movimentacaoData.responsavel,
        funcionarioRecebeu: movimentacaoData.funcionarioRecebeu || "",
        motivo: movimentacaoData.motivo,
        observacoes: movimentacaoData.observacoes || "",
        userId: "user-123", // Temporário - virá do AuthContext
      });

      // Calcular nova quantidade
      let novaQuantidade = epiSelecionado.quantidadeAtual;

      switch (movimentacaoData.tipo) {
        case "entrada":
          novaQuantidade += movimentacaoData.quantidade;
          break;
        case "saida":
        case "perda":
          novaQuantidade = Math.max(
            0,
            novaQuantidade - movimentacaoData.quantidade
          );
          break;
        case "ajuste":
          novaQuantidade = movimentacaoData.quantidade;
          break;
        default:
          break;
      }

      // Atualizar quantidade do EPI no Firebase
      await updateEPI(epiSelecionado.id, {
        ...epiSelecionado,
        quantidadeAtual: novaQuantidade,
      });

      setShowMovimentacao(false);
    } catch (error) {
      alert("Erro ao salvar movimentação: " + error.message);
    }
  };

  // Calcular alertas (usado pelo Header)
  const calcularAlertas = () => {
    return epis.filter((epi) => {
      const today = new Date();
      const validadeDate = new Date(epi.dataValidade);
      const diffDays = Math.ceil(
        (validadeDate - today) / (1000 * 60 * 60 * 24)
      );

      return (
        diffDays < 0 ||
        diffDays <= epi.diasAvisoVencimento ||
        epi.quantidadeAtual <= epi.estoqueMinimo
      );
    }).length;
  };

  // Loading state
  if (loadingEPIs || loadingMovimentacoes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do Firebase...</p>
        </div>
      </div>
    );
  }

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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          alertas={calcularAlertas()}
          currentUser={currentUser}
        />

        <main className="flex-1 p-6">
          {currentView === "dashboard" && <Dashboard epis={epis} />}

          {currentView === "estoque" && (
            <ControleEstoque
              epis={epis}
              onAddEPI={() => setShowAddEPI(true)}
              onEditEPI={(epi) => setEditingEPI(epi)}
              onDeleteEPI={handleDeleteEPI}
              onMovimentacao={() => setShowMovimentacao(true)}
              onViewEPI={(epi) => setViewingEPI(epi)}
            />
          )}

          {currentView === "movimentacoes" && (
            <Movimentacoes
              movimentacoes={movimentacoes}
              onNovaMovimentacao={() => setShowMovimentacao(true)}
            />
          )}

          {currentView === "relatorios" && (
            <Relatorios epis={epis} movimentacoes={movimentacoes} />
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
      <EPIModal
        isOpen={showAddEPI}
        onClose={() => setShowAddEPI(false)}
        onSave={handleSaveEPI}
      />
      <EPIModal
        isOpen={!!editingEPI}
        onClose={() => setEditingEPI(null)}
        epi={editingEPI}
        onSave={handleSaveEPI}
      />
      <MovimentacaoModal
        isOpen={showMovimentacao}
        onClose={() => setShowMovimentacao(false)}
        epis={epis}
        currentUser={currentUser}
        onSave={handleSaveMovimentacao}
      />
      <EPIDetalhesModal
        isOpen={!!viewingEPI}
        onClose={() => setViewingEPI(null)}
        epi={viewingEPI}
      />
    </div>
  );
};

export default App;
