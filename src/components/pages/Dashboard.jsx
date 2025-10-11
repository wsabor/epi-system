import React, { useMemo } from "react";
import { Package, AlertTriangle, Calendar } from "lucide-react";
import StatsCard from "../ui/StatsCard";

const Dashboard = ({ epis }) => {
  // Ícones para as categorias
  const categoriaIcons = {
    "Proteção Respiratória": "🛡️",
    "Proteção Auditiva": "🎧",
    "Proteção Visual": "👓",
    Capacetes: "⛑️",
    Luvas: "🧤",
    "Calçados de Segurança": "👢",
    Uniformes: "👕",
    Outros: "📦",
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

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = epis.length;
    const estoqueBaixo = epis.filter(
      (epi) => determineEPIStatus(epi) === "estoque_baixo"
    ).length;
    const vencimentoProximo = epis.filter(
      (epi) => determineEPIStatus(epi) === "vencimento_proximo"
    ).length;
    const vencidos = epis.filter(
      (epi) => determineEPIStatus(epi) === "vencido"
    ).length;
    const alertas = estoqueBaixo + vencimentoProximo + vencidos;

    return { total, estoqueBaixo, vencimentoProximo, vencidos, alertas };
  }, [epis]);

  // EPIs que precisam de atenção
  const episPrecisandoAtencao = useMemo(() => {
    return epis.filter((epi) => determineEPIStatus(epi) !== "normal");
  }, [epis]);

  const getStatusBadge = (status) => {
    switch (status) {
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
        return { text: "Normal", className: "bg-green-100 text-green-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Visão geral do controle de EPIs</p>
      </div>

      {/* Cards de Estatísticas */}
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

      {/* Alertas Importantes */}
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

      {/* EPIs que Precisam de Atenção */}
      {episPrecisandoAtencao.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            EPIs que Precisam de Atenção
          </h3>
          <div className="space-y-3">
            {episPrecisandoAtencao.map((epi) => {
              const status = determineEPIStatus(epi);
              const badge = getStatusBadge(status);
              const icon = categoriaIcons[epi.categoria] || "📦";

              return (
                <div
                  key={epi.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{icon}</span>
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
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                    >
                      {badge.text}
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
      )}

      {/* Mensagem quando não há alertas */}
      {stats.alertas === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Package size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              Tudo em Ordem! 🎉
            </h3>
            <p className="text-green-700">
              Não há EPIs que precisam de atenção no momento.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
