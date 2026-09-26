import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useOpcoes } from "../../hooks/useOpcoes";

const MOTIVO_ENTREGA = "Entrega para funcionário";

const FORM_VAZIO = {
  epiId: "",
  tipoMovimentacao: "",
  quantidade: "",
  responsavel: "",
  funcionarioRecebeu: "",
  motivo: "",
  observacoes: "",
};

// Montado só enquanto aberto (o App o renderiza condicionalmente): o estado nasce pronto a cada abertura.
// epis: só os ativos. epiInicial: EPI já escolhido quando o modal é aberto a partir da linha da tabela.
const MovimentacaoModal = ({ isOpen, onClose, epis, epiInicial, onSave }) => {
  const { usuario } = useAuth();
  const opcoes = useOpcoes();
  const motivosPorTipo = opcoes?.motivosPorTipo ?? {};

  const [formData, setFormData] = useState(() => ({
    ...FORM_VAZIO,
    epiId: epiInicial?.id ?? "",
    responsavel: usuario?.nome ?? "",
  }));
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  // O saldo é calculado pela API; aqui só se envia o que foi informado.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await onSave({
        epiId: formData.epiId,
        tipo: formData.tipoMovimentacao,
        quantidade: parseInt(formData.quantidade),
        responsavel: formData.responsavel,
        funcionarioRecebeu: formData.tipoMovimentacao === "saida" ? formData.funcionarioRecebeu : undefined,
        motivo: formData.motivo,
        observacoes: formData.observacoes,
      });
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const epiSelecionado = epis.find((epi) => epi.id === formData.epiId);
  const motivosDisponiveis = motivosPorTipo[formData.tipoMovimentacao] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Nova Movimentação
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{erro}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EPI */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EPI <span className="text-red-500">*</span>
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

            {/* Tipo de Movimentação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimentação <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.tipoMovimentacao}
                onChange={(e) =>
                  setFormData({ 
                    ...formData, 
                    tipoMovimentacao: e.target.value,
                    motivo: "" // Limpar motivo ao mudar tipo
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

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.tipoMovimentacao === "ajuste" ? "Quantidade contada (novo saldo)" : "Quantidade"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="1"
                min={formData.tipoMovimentacao === "ajuste" ? "0" : "1"}
                max={
                  ["saida", "perda"].includes(formData.tipoMovimentacao)
                    ? epiSelecionado?.quantidadeAtual
                    : undefined
                }
                value={formData.quantidade}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
              {epiSelecionado && (
                <p className="text-sm text-gray-500 mt-1">
                  Estoque atual: {epiSelecionado.quantidadeAtual}{" "}
                  {epiSelecionado.tipoEstoque.toLowerCase()}
                </p>
              )}
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.responsavel}
                onChange={(e) =>
                  setFormData({ ...formData, responsavel: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nome do responsável"
              />
            </div>

            {/* Funcionário que Recebeu (apenas para saída) */}
            {formData.tipoMovimentacao === "saida" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funcionário que Recebeu
                  {formData.motivo === MOTIVO_ENTREGA && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="text"
                  required={formData.motivo === MOTIVO_ENTREGA}
                  maxLength={150}
                  value={formData.funcionarioRecebeu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      funcionarioRecebeu: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome do funcionário"
                />
              </div>
            )}

            {/* Motivo - Select ou Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo <span className="text-red-500">*</span>
              </label>
              {formData.tipoMovimentacao ? (
                <select
                  required
                  value={formData.motivo}
                  onChange={(e) =>
                    setFormData({ ...formData, motivo: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione o motivo</option>
                  {motivosDisponiveis.map((motivo, index) => (
                    <option key={index} value={motivo}>
                      {motivo}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  placeholder="Selecione primeiro o tipo de movimentação"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
                />
              )}
            </div>

            {/* Campo de texto para "Outros" */}
            {formData.motivo === "Outros" && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especifique o Motivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Descreva o motivo da movimentação..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Observações (somente se não for "Outros") */}
          {formData.motivo !== "Outros" && (
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
          )}

          {/* Botões */}
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
              disabled={salvando}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{salvando ? "Registrando..." : "Registrar Movimentação"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovimentacaoModal;
