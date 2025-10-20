import React, { useState, useMemo } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle,
  PieChart as PieChartIcon,
  BarChart3,
  Filter,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const Relatorios = ({ epis, movimentacoes }) => {
  const [tipoRelatorio, setTipoRelatorio] = useState("estoque");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // Cores para gráficos
  const COLORS = [
    "#DC2626",
    "#EA580C",
    "#D97706",
    "#CA8A04",
    "#65A30D",
    "#16A34A",
    "#059669",
    "#0D9488",
  ];

  // Categorias únicas
  const categorias = useMemo(() => {
    return [...new Set(epis.map((epi) => epi.categoria))];
  }, [epis]);

  // Função para determinar status
  const determineEPIStatus = (epi) => {
    const today = new Date();
    const validadeDate = new Date(epi.dataValidade);
    const diffDays = Math.ceil((validadeDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "vencido";
    if (diffDays <= epi.diasAvisoVencimento) return "vencimento_proximo";
    if (epi.quantidadeAtual <= epi.estoqueMinimo) return "estoque_baixo";
    return "normal";
  };

  // Dados para gráfico de pizza - EPIs por categoria
  const dadosPorCategoria = useMemo(() => {
    const contagem = {};
    epis.forEach((epi) => {
      contagem[epi.categoria] = (contagem[epi.categoria] || 0) + 1;
    });
    return Object.entries(contagem).map(([name, value]) => ({ name, value }));
  }, [epis]);

  // Dados para gráfico de status
  const dadosPorStatus = useMemo(() => {
    const contagem = {
      normal: 0,
      estoque_baixo: 0,
      vencimento_proximo: 0,
      vencido: 0,
    };
    epis.forEach((epi) => {
      const status = determineEPIStatus(epi);
      contagem[status]++;
    });
    return [
      { name: "Normal", value: contagem.normal, color: "#16A34A" },
      {
        name: "Estoque Baixo",
        value: contagem.estoque_baixo,
        color: "#EA580C",
      },
      {
        name: "Vencimento Próximo",
        value: contagem.vencimento_proximo,
        color: "#D97706",
      },
      { name: "Vencido", value: contagem.vencido, color: "#DC2626" },
    ];
  }, [epis]);

  // Dados para gráfico de movimentações ao longo do tempo
  const dadosMovimentacoesTempo = useMemo(() => {
    const movimentacoesFiltradas = movimentacoes.filter((mov) => {
      const movData = new Date(mov.data);
      const inicio = dataInicio ? new Date(dataInicio) : null;
      const fim = dataFim ? new Date(dataFim) : null;

      if (inicio && movData < inicio) return false;
      if (fim && movData > fim) return false;
      return true;
    });

    // Agrupar por data
    const grupos = {};
    movimentacoesFiltradas.forEach((mov) => {
      const data = new Date(mov.data).toLocaleDateString("pt-BR");
      if (!grupos[data]) {
        grupos[data] = { data, entradas: 0, saidas: 0, ajustes: 0, perdas: 0 };
      }
      grupos[data][
        mov.tipo === "entrada"
          ? "entradas"
          : mov.tipo === "saida"
          ? "saidas"
          : mov.tipo === "ajuste"
          ? "ajustes"
          : "perdas"
      ]++;
    });

    return Object.values(grupos).sort((a, b) => {
      const [diaA, mesA, anoA] = a.data.split("/");
      const [diaB, mesB, anoB] = b.data.split("/");
      return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
    });
  }, [movimentacoes, dataInicio, dataFim]);

  // Top 5 EPIs mais movimentados
  const top5EPIs = useMemo(() => {
    const contagem = {};
    movimentacoes.forEach((mov) => {
      contagem[mov.epiDescricao] =
        (contagem[mov.epiDescricao] || 0) + mov.quantidade;
    });
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [movimentacoes]);

  // Valor total do estoque
  const valorTotalEstoque = useMemo(() => {
    return epis.reduce((total, epi) => {
      return total + epi.quantidadeAtual * epi.valorUnitario;
    }, 0);
  }, [epis]);

  // Exportar PDF - Relatório de Estoque
  const exportarEstoquePDF = () => {
    try {
      const doc = new jsPDF();

      // Cabeçalho
      doc.setFillColor(211, 47, 47);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("EPI System", 105, 15, { align: "center" });
      doc.setFontSize(16);
      doc.text("Relatório de Estoque de EPIs", 105, 25, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 105, 33, {
        align: "center",
      });

      // Resetar cor do texto
      doc.setTextColor(0, 0, 0);

      // Estatísticas gerais
      doc.setFontSize(12);
      doc.text("Estatísticas Gerais", 14, 50);
      doc.setFontSize(10);
      doc.text(`Total de EPIs cadastrados: ${epis.length}`, 14, 58);
      doc.text(
        `Valor total em estoque: R$ ${valorTotalEstoque.toFixed(2)}`,
        14,
        65
      );
      doc.text(
        `EPIs com estoque baixo: ${
          dadosPorStatus.find((s) => s.name === "Estoque Baixo")?.value || 0
        }`,
        14,
        72
      );
      doc.text(
        `EPIs vencidos: ${
          dadosPorStatus.find((s) => s.name === "Vencido")?.value || 0
        }`,
        14,
        79
      );

      // Tabela de EPIs
      const tableData = epis.map((epi) => [
        epi.descricao || "-",
        epi.categoria || "-",
        epi.quantidadeAtual?.toString() || "0",
        epi.tipoEstoque || "-",
        `R$ ${(epi.valorUnitario || 0).toFixed(2)}`,
        new Date(epi.dataValidade).toLocaleDateString("pt-BR"),
        determineEPIStatus(epi) === "normal"
          ? "Normal"
          : determineEPIStatus(epi) === "estoque_baixo"
          ? "Estoque Baixo"
          : determineEPIStatus(epi) === "vencimento_proximo"
          ? "Vencimento Próximo"
          : "Vencido",
      ]);

      autoTable(doc, {
        startY: 90,
        head: [
          [
            "Descrição",
            "Categoria",
            "Qtd",
            "Tipo",
            "Valor Unit.",
            "Validade",
            "Status",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [211, 47, 47] },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 15 },
          3: { cellWidth: 15 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
        },
      });

      doc.save(
        `relatorio-estoque-${new Date().toISOString().split("T")[0]}.pdf`
      );

      console.log("✅ PDF gerado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF: " + error.message);
    }
  };

  // Exportar Excel - Relatório de Estoque
  const exportarEstoqueExcel = () => {
    const dados = epis.map((epi) => ({
      Descrição: epi.descricao,
      Categoria: epi.categoria,
      Tamanho: epi.tamanho,
      Quantidade: epi.quantidadeAtual,
      Tipo: epi.tipoEstoque,
      "Estoque Mínimo": epi.estoqueMinimo,
      Marca: epi.marca,
      CA: epi.numeroCA,
      Validade: new Date(epi.dataValidade).toLocaleDateString("pt-BR"),
      "Valor Unitário": epi.valorUnitario,
      "Valor Total": (epi.quantidadeAtual * epi.valorUnitario).toFixed(2),
      Fornecedor: epi.fornecedor,
      Status:
        determineEPIStatus(epi) === "normal"
          ? "Normal"
          : determineEPIStatus(epi) === "estoque_baixo"
          ? "Estoque Baixo"
          : determineEPIStatus(epi) === "vencimento_proximo"
          ? "Vencimento Próximo"
          : "Vencido",
    }));

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Estoque");
    XLSX.writeFile(
      wb,
      `relatorio-estoque-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Exportar PDF - Relatório de Movimentações
  const exportarMovimentacoesPDF = () => {
    try {
      const doc = new jsPDF();

      // Cabeçalho
      doc.setFillColor(211, 47, 47);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("EPI System", 105, 15, { align: "center" });
      doc.setFontSize(16);
      doc.text("Relatório de Movimentações", 105, 25, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 105, 33, {
        align: "center",
      });

      doc.setTextColor(0, 0, 0);

      // Filtros aplicados
      let startY = 50;
      if (dataInicio || dataFim) {
        doc.setFontSize(10);
        doc.text("Período:", 14, startY);
        const periodo = `${
          dataInicio
            ? new Date(dataInicio).toLocaleDateString("pt-BR")
            : "Início"
        } até ${
          dataFim ? new Date(dataFim).toLocaleDateString("pt-BR") : "Hoje"
        }`;
        doc.text(periodo, 14, startY + 7);
        startY += 15;
      }

      // Filtrar movimentações
      const movimentacoesFiltradas = movimentacoes.filter((mov) => {
        const movData = new Date(mov.data);
        const inicio = dataInicio ? new Date(dataInicio) : null;
        const fim = dataFim ? new Date(dataFim) : null;
        if (inicio && movData < inicio) return false;
        if (fim && movData > fim) return false;
        return true;
      });

      // Tabela de movimentações
      const tableData = movimentacoesFiltradas.map((mov) => [
        new Date(mov.data).toLocaleDateString("pt-BR"),
        mov.epiDescricao || "-",
        mov.tipo === "entrada"
          ? "Entrada"
          : mov.tipo === "saida"
          ? "Saída"
          : mov.tipo === "ajuste"
          ? "Ajuste"
          : "Perda",
        mov.quantidade?.toString() || "0",
        mov.responsavel || "-",
      ]);

      autoTable(doc, {
        startY: startY,
        head: [["Data", "EPI", "Tipo", "Quantidade", "Responsável"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [211, 47, 47] },
        styles: { fontSize: 10, cellPadding: 2 },
      });

      doc.save(
        `relatorio-movimentacoes-${new Date().toISOString().split("T")[0]}.pdf`
      );

      console.log("✅ PDF gerado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <p className="text-gray-600">Análises e exportações do sistema</p>
      </div>

      {/* Seletor de Tipo de Relatório */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTipoRelatorio("estoque")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoRelatorio === "estoque"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package size={16} className="inline mr-2" />
            Estoque Atual
          </button>
          <button
            onClick={() => setTipoRelatorio("movimentacoes")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoRelatorio === "movimentacoes"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Movimentações
          </button>
          <button
            onClick={() => setTipoRelatorio("vencimentos")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoRelatorio === "vencimentos"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Vencimentos
          </button>
          <button
            onClick={() => setTipoRelatorio("dashboard")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tipoRelatorio === "dashboard"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Dashboard
          </button>
        </div>
      </div>

      {/* Relatório de Estoque Atual */}
      {tipoRelatorio === "estoque" && (
        <div className="space-y-6">
          {/* Botões de Exportação */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportarEstoquePDF}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download size={16} />
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={exportarEstoqueExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total EPIs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {epis.length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {valorTotalEstoque.toFixed(2)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Estoque Baixo
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      dadosPorStatus.find((s) => s.name === "Estoque Baixo")
                        .value
                    }
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {dadosPorStatus.find((s) => s.name === "Vencido").value}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Tabela de EPIs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista Completa de EPIs
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {epis.map((epi) => {
                    const status = determineEPIStatus(epi);
                    const statusBadge =
                      status === "normal"
                        ? "bg-green-100 text-green-800"
                        : status === "estoque_baixo"
                        ? "bg-orange-100 text-orange-800"
                        : status === "vencimento_proximo"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800";
                    const statusText =
                      status === "normal"
                        ? "Normal"
                        : status === "estoque_baixo"
                        ? "Estoque Baixo"
                        : status === "vencimento_proximo"
                        ? "Vence em Breve"
                        : "Vencido";

                    return (
                      <tr key={epi.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {epi.descricao}
                          </div>
                          <div className="text-sm text-gray-500">
                            {epi.marca}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {epi.categoria}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {epi.quantidadeAtual} {epi.tipoEstoque.toLowerCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          R$ {epi.valorUnitario.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          R${" "}
                          {(epi.quantidadeAtual * epi.valorUnitario).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadge}`}
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Movimentações */}
      {tipoRelatorio === "movimentacoes" && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={exportarMovimentacoesPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download size={16} />
                <span>Exportar PDF</span>
              </button>
            </div>
          </div>

          {/* Gráfico de Movimentações ao Longo do Tempo */}
          {dadosMovimentacoesTempo.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Movimentações ao Longo do Tempo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosMovimentacoesTempo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="entradas"
                    stroke="#16A34A"
                    name="Entradas"
                  />
                  <Line
                    type="monotone"
                    dataKey="saidas"
                    stroke="#DC2626"
                    name="Saídas"
                  />
                  <Line
                    type="monotone"
                    dataKey="ajustes"
                    stroke="#D97706"
                    name="Ajustes"
                  />
                  <Line
                    type="monotone"
                    dataKey="perdas"
                    stroke="#7C3AED"
                    name="Perdas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Resumo de Movimentações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entradas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {movimentacoes.filter((m) => m.tipo === "entrada").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saídas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {movimentacoes.filter((m) => m.tipo === "saida").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ajustes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {movimentacoes.filter((m) => m.tipo === "ajuste").length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Perdas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {movimentacoes.filter((m) => m.tipo === "perda").length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatório de Vencimentos */}
      {tipoRelatorio === "vencimentos" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EPIs Vencidos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-red-50 border-b border-red-200">
                <h3 className="text-lg font-semibold text-red-900">
                  EPIs Vencidos
                </h3>
              </div>
              <div className="p-4">
                {epis.filter((epi) => determineEPIStatus(epi) === "vencido")
                  .length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum EPI vencido
                  </p>
                ) : (
                  <div className="space-y-3">
                    {epis
                      .filter((epi) => determineEPIStatus(epi) === "vencido")
                      .map((epi) => (
                        <div
                          key={epi.id}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {epi.descricao}
                            </p>
                            <p className="text-sm text-gray-600">
                              {epi.marca} • {epi.categoria}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">
                              Vencido em{" "}
                              {new Date(epi.dataValidade).toLocaleDateString(
                                "pt-BR"
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {epi.quantidadeAtual}{" "}
                              {epi.tipoEstoque.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* EPIs com Vencimento Próximo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-yellow-50 border-b border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-900">
                  Vencimento Próximo
                </h3>
              </div>
              <div className="p-4">
                {epis.filter(
                  (epi) => determineEPIStatus(epi) === "vencimento_proximo"
                ).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum EPI próximo ao vencimento
                  </p>
                ) : (
                  <div className="space-y-3">
                    {epis
                      .filter(
                        (epi) =>
                          determineEPIStatus(epi) === "vencimento_proximo"
                      )
                      .map((epi) => {
                        const diasRestantes = Math.ceil(
                          (new Date(epi.dataValidade) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <div
                            key={epi.id}
                            className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {epi.descricao}
                              </p>
                              <p className="text-sm text-gray-600">
                                {epi.marca} • {epi.categoria}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-yellow-600">
                                {diasRestantes} dias restantes
                              </p>
                              <p className="text-xs text-gray-500">
                                Vence em{" "}
                                {new Date(epi.dataValidade).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Avançado */}
      {tipoRelatorio === "dashboard" && (
        <div className="space-y-6">
          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Pizza - EPIs por Categoria */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                EPIs por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPorCategoria.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Pizza - Status dos EPIs */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Status dos EPIs
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosPorStatus.filter((s) => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 EPIs Mais Movimentados */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 5 EPIs Mais Utilizados
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top5EPIs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="value"
                  fill="#DC2626"
                  name="Quantidade Total Movimentada"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Métricas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Valor Médio por EPI
                </h4>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(valorTotalEstoque / epis.length).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Valor total: R$ {valorTotalEstoque.toFixed(2)}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Total de Movimentações
                </h4>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {movimentacoes.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Todas as movimentações registradas
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Categorias Ativas
                </h4>
                <PieChartIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {categorias.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Diferentes categorias em uso
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
