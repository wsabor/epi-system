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

const App = () => {
  // Auth
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  // Estados de navegação
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        userId: currentUser?.uid || "unknown",
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

  // Verificar permissões
  const canAccessUsuarios = userProfile?.role === "admin";
  const canEditEPIs =
    userProfile?.role === "admin" || userProfile?.role === "operador";
  const canViewReports = userProfile?.role !== undefined;

  // Loading state da autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostra telas de login/registro
  if (!currentUser) {
    return <AuthWrapper />;
  }

  // Loading state dos dados
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
        userRole={userProfile?.role}
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
          userProfile={userProfile}
        />

        <main className="flex-1 p-6">
          {currentView === "dashboard" && <Dashboard epis={epis} />}

          {currentView === "estoque" && (
            <ControleEstoque
              epis={epis}
              onAddEPI={() => canEditEPIs && setShowAddEPI(true)}
              onEditEPI={(epi) => canEditEPIs && setEditingEPI(epi)}
              onDeleteEPI={canEditEPIs ? handleDeleteEPI : null}
              onMovimentacao={() => canEditEPIs && setShowMovimentacao(true)}
              onViewEPI={(epi) => setViewingEPI(epi)}
              canEdit={canEditEPIs}
            />
          )}

          {currentView === "movimentacoes" && (
            <Movimentacoes
              movimentacoes={movimentacoes}
              onNovaMovimentacao={() =>
                canEditEPIs && setShowMovimentacao(true)
              }
              canCreate={canEditEPIs}
            />
          )}

          {currentView === "relatorios" && canViewReports && (
            <Relatorios epis={epis} movimentacoes={movimentacoes} />
          )}

          {currentView === "usuarios" && canAccessUsuarios && <Usuarios />}

          {currentView === "sobre" && <Sobre />}

          {/* Mensagem de acesso negado */}
          {currentView === "usuarios" && !canAccessUsuarios && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-600">
                Você não tem permissão para acessar esta página.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modais */}
      {canEditEPIs && (
        <>
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
        </>
      )}

      <EPIDetalhesModal
        isOpen={!!viewingEPI}
        onClose={() => setViewingEPI(null)}
        epi={viewingEPI}
      />
    </div>
  );
};

export default App;
