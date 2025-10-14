import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Clock,
  Search,
  Filter,
  Download,
  Shield,
  Users,
  Eye,
  AlertCircle,
} from "lucide-react";

const LogAuditoria = ({ usuario, logs, onVoltar }) => {
  const [busca, setBusca] = useState("");
  const [filtroAcao, setFiltroAcao] = useState("todas");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Tipos de ações
  const tiposAcoes = {
    LOGIN: { nome: "Login", cor: "blue" },
    LOGOUT: { nome: "Logout", cor: "gray" },
    CRIAR_EPI: { nome: "Criar EPI", cor: "green" },
    EDITAR_EPI: { nome: "Editar EPI", cor: "yellow" },
    EXCLUIR_EPI: { nome: "Excluir EPI", cor: "red" },
    MOVIMENTACAO: { nome: "Movimentação", cor: "purple" },
    VISUALIZAR_RELATORIO: { nome: "Visualizar Relatório", cor: "indigo" },
    CRIAR_USUARIO: { nome: "Criar Usuário", cor: "green" },
    EDITAR_USUARIO: { nome: "Editar Usuário", cor: "yellow" },
    DESATIVAR_USUARIO: { nome: "Desativar Usuário", cor: "orange" },
    ATIVAR_USUARIO: { nome: "Ativar Usuário", cor: "green" },
    EXCLUIR_USUARIO: { nome: "Excluir Usuário", cor: "red" },
  };

  // Filtrar logs
  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      const matchBusca = log.descricao
        .toLowerCase()
        .includes(busca.toLowerCase());
      const matchAcao = filtroAcao === "todas" || log.acao === filtroAcao;

      let matchData = true;
      if (dataInicio || dataFim) {
        const logData = new Date(log.timestamp);
        if (dataInicio)
          matchData = matchData && logData >= new Date(dataInicio);
        if (dataFim) matchData = matchData && logData <= new Date(dataFim);
      }

      return matchBusca && matchAcao && matchData;
    });
  }, [logs, busca, filtroAcao, dataInicio, dataFim]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const contagemAcoes = {};
    logs.forEach((log) => {
      contagemAcoes[log.acao] = (contagemAcoes[log.acao] || 0) + 1;
    });

    return {
      total: logs.length,
      periodo:
        logs.length > 0
          ? `${new Date(
              logs[logs.length - 1].timestamp
            ).toLocaleDateString()} - ${new Date(
              logs[0].timestamp
            ).toLocaleDateString()}`
          : "N/A",
      acoesPorTipo: contagemAcoes,
    };
  }, [logs]);

  const formatarData = (data) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const exportarCSV = () => {
    const headers = ["Data/Hora", "Ação", "Descrição", "IP"];
    const rows = logsFiltrados.map((log) => [
      formatarData(log.timestamp),
      tiposAcoes[log.acao]?.nome || log.acao,
      log.descricao,
      log.ip,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria-${usuario.nome.replace(/\s+/g, "-")}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onVoltar}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Log de Auditoria
            </h2>
            <p className="text-gray-600">
              Histórico de ações de {usuario.nome}
            </p>
          </div>
        </div>
        <button
          onClick={exportarCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-700">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {usuario.nome}
            </h3>
            <p className="text-gray-600">{usuario.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                {usuario.departamento}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                Membro desde{" "}
                {new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total de Ações</p>
          <p className="text-2xl font-bold text-gray-900">
            {estatisticas.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Período</p>
          <p className="text-sm font-semibold text-gray-900">
            {estatisticas.periodo}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Logins</p>
          <p className="text-2xl font-bold text-blue-600">
            {estatisticas.acoesPorTipo.LOGIN || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Movimentações</p>
          <p className="text-2xl font-bold text-purple-600">
            {estatisticas.acoesPorTipo.MOVIMENTACAO || 0}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar na descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="todas">Todas as Ações</option>
              {Object.entries(tiposAcoes).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Timeline de Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Timeline de Atividades
          </h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
          {logsFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum log encontrado
              </h3>
              <p className="text-gray-500">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            logsFiltrados.map((log) => {
              const acaoConfig = tiposAcoes[log.acao] || {
                nome: log.acao,
                cor: "gray",
              };

              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full bg-${acaoConfig.cor}-100 flex items-center justify-center flex-shrink-0`}
                    >
                      <Clock
                        size={18}
                        className={`text-${acaoConfig.cor}-600`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${acaoConfig.cor}-100 text-${acaoConfig.cor}-800`}
                        >
                          {acaoConfig.nome}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatarData(log.timestamp)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-900">
                        {log.descricao}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">IP: {log.ip}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LogAuditoria;
