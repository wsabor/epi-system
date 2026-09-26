import React, { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Download, AlertCircle } from "lucide-react";
import { useLogs } from "../../../hooks/useLogs";

// Classes completas (não montadas em tempo de execução) para o Tailwind gerar as cores.
const COR = {
  azul: "bg-blue-100 text-blue-800",
  verde: "bg-green-100 text-green-800",
  amarelo: "bg-yellow-100 text-yellow-800",
  laranja: "bg-orange-100 text-orange-800",
  vermelho: "bg-red-100 text-red-800",
  roxo: "bg-purple-100 text-purple-800",
  cinza: "bg-gray-100 text-gray-800",
};

const ACOES = {
  LOGIN: { nome: "Login", cor: "azul" },
  LOGIN_FALHA: { nome: "Login com falha", cor: "vermelho" },
  LOGIN_BLOQUEADO_INATIVO: { nome: "Login de usuário desativado", cor: "vermelho" },
  SENHA_ALTERAR: { nome: "Alterou a senha", cor: "amarelo" },
  SENHA_REDEFINICAO_SOLICITAR: { nome: "Pediu redefinição de senha", cor: "amarelo" },
  SENHA_REDEFINIR: { nome: "Redefiniu a senha", cor: "amarelo" },
  USUARIO_CRIAR_SEED: { nome: "Admin inicial criado", cor: "cinza" },
  USUARIO_EDITAR: { nome: "Editou usuário", cor: "amarelo" },
  USUARIO_DESATIVAR: { nome: "Desativou usuário", cor: "laranja" },
  USUARIO_REATIVAR: { nome: "Reativou usuário", cor: "verde" },
  CONVITE_CRIAR: { nome: "Criou convite", cor: "verde" },
  CONVITE_ACEITAR: { nome: "Aceitou convite", cor: "verde" },
  CONVITE_REVOGAR: { nome: "Revogou convite", cor: "laranja" },
  EPI_CRIAR: { nome: "Cadastrou EPI", cor: "verde" },
  EPI_EDITAR: { nome: "Editou EPI", cor: "amarelo" },
  EPI_DESATIVAR: { nome: "Desativou EPI", cor: "laranja" },
  EPI_REATIVAR: { nome: "Reativou EPI", cor: "verde" },
  MOVIMENTACAO_CRIAR: { nome: "Movimentação", cor: "roxo" },
};

const POR_PAGINA = 50;

// Pares campo/valor; edições trazem também { antes, depois } só com o que mudou.
function descreverDetalhes(detalhes) {
  if (!detalhes) return null;
  const { antes, depois, ...resto } = detalhes;
  const partes = Object.entries(resto).map(([campo, valor]) => `${campo}: ${valor}`);
  if (antes && depois) {
    partes.push(
      ...Object.keys(depois).map((campo) => `${campo}: ${antes[campo] ?? "—"} → ${depois[campo] ?? "—"}`),
    );
  }
  return partes.join(" · ");
}

const formatarData = (data) => new Date(data).toLocaleString("pt-BR");

// usuario = null mostra a auditoria geral do sistema.
const LogAuditoria = ({ usuario, onVoltar }) => {
  const [acao, setAcao] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [pagina, setPagina] = useState(1);

  const { logs, total, totalPaginas, loading, error } = useLogs({
    usuarioId: usuario?.id,
    acao,
    de,
    ate,
    pagina,
    porPagina: POR_PAGINA,
  });

  const mudarFiltro = (setter) => (e) => {
    setter(e.target.value);
    setPagina(1);
  };

  const exportarCSV = () => {
    const linhas = [
      ["Data/Hora", "Usuário", "Ação", "Detalhes", "IP"],
      ...logs.map((log) => [
        formatarData(log.data),
        log.usuarioNome ?? "",
        ACOES[log.acao]?.nome ?? log.acao,
        descreverDetalhes(log.detalhes) ?? "",
        log.ip ?? "",
      ]),
    ];
    // Texto começando com = + - @ vira fórmula no Excel (CSV injection): prefixar com apóstrofo.
    const celula = (valor) => {
      const texto = String(valor);
      const seguro = /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
      return `"${seguro.replaceAll('"', '""')}"`;
    };
    const csv = linhas.map((linha) => linha.map(celula).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    const nome = usuario ? usuario.nome.replace(/\s+/g, "-") : "geral";
    link.download = `auditoria-${nome}-${new Date().toISOString().split("T")[0]}-p${pagina}.csv`;
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
            <h2 className="text-2xl font-bold text-gray-900">Log de Auditoria</h2>
            <p className="text-gray-600">
              {usuario ? `Ações de ${usuario.nome} (${usuario.email})` : "Todas as ações registradas no sistema"}
            </p>
          </div>
        </div>
        <button
          onClick={exportarCSV}
          disabled={logs.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          <span>Exportar página (CSV)</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={acao}
            onChange={mudarFiltro(setAcao)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas as ações</option>
            {Object.entries(ACOES).map(([chave, config]) => (
              <option key={chave} value={chave}>
                {config.nome}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            De
            <input
              type="date"
              value={de}
              onChange={mudarFiltro(setDe)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Até
            <input
              type="date"
              value={ate}
              onChange={mudarFiltro(setAte)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Timeline de Atividades</h3>
          <span className="text-sm text-gray-500">{total} registro(s)</span>
        </div>

        {error && <p className="p-6 text-sm text-red-600">{error}</p>}

        <div className={`divide-y divide-gray-200 ${loading ? "opacity-50" : ""}`}>
          {!loading && logs.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros</p>
            </div>
          ) : (
            logs.map((log) => {
              const config = ACOES[log.acao] ?? { nome: log.acao, cor: "cinza" };
              const detalhes = descreverDetalhes(log.detalhes);
              return (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={18} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COR[config.cor]}`}
                        >
                          {config.nome}
                        </span>
                        <span className="text-sm text-gray-500 whitespace-nowrap">{formatarData(log.data)}</span>
                      </div>
                      {!usuario && log.usuarioNome && (
                        <p className="mt-2 text-sm font-medium text-gray-900">{log.usuarioNome}</p>
                      )}
                      {detalhes && <p className="mt-1 text-sm text-gray-700 break-words">{detalhes}</p>}
                      <p className="mt-1 text-xs text-gray-500">IP: {log.ip ?? "—"}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPagina((p) => p - 1)}
              disabled={pagina <= 1 || loading}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página {pagina} de {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => p + 1)}
              disabled={pagina >= totalPaginas || loading}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogAuditoria;
