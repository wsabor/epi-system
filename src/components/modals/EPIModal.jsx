import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const MovimentacaoModal = ({
  isOpen,
  onClose,
  epis = [],
  currentUser,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    epiId: "",
    tipoMovimentacao: "",
    quantidade: "",
    responsavel: currentUser?.nome || "",
    funcionarioRecebeu: "",
    motivo: "",
    observacoes: "",
  });

  // Resetar form quando abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        epiId: "",
        tipoMovimentacao: "",
        quantidade: "",
        responsavel: currentUser?.nome || "",
        funcionarioRecebeu: "",
        motivo: "",
        observacoes: "",
      });
    }
  }, [isOpen, currentUser]);

  const handleSubmit = (e) => {
  e.preventDefault();

  alert('TESTE: Form foi submetido!'); // <- Para ter certeza que está executando

  console.log("🔍 Iniciando submit da movimentação");
  console.log("📋 Form data completo:", formData);
  console.log("📦 Lista de EPIs:", epis);
  console.log("🎯 EPI ID do form:", formData.epiId, "Tipo:", typeof formData.epiId);

  // Verificar se tem EPIs
  if (!epis || epis.length === 0) {
    alert('ERRO: Nenhum EPI disponível!');
    console.error('❌ Array de EPIs está vazio:', epis);
    return;
  }

  // Verificar se selecionou um EPI
  if (!formData.epiId) {
    alert('ERRO: Nenhum EPI foi selecionado!');
    console.error('❌ formData.epiId está vazio');
    return;
  }

  // Converter para string e buscar o EPI
  const epiId = String(formData.epiId);
  console.log("🔎 ID convertido para string:", epiId);
  console.log("📋 Comparando com IDs:", epis.map(e => ({ 
    id: e.id, 
    idString: String(e.id),
    match: String(e.id) === epiId 
  })));

  const epiSelecionado = epis.find((epi) => String(epi.id) === epiId);

  console.log("✅ Resultado da busca:", epiSelecionado);

  if (!epiSelecionado) {
    console.error("❌ EPI não encontrado!");
    console.error("🔍 ID procurado:", epiId);
    console.error("📋 IDs disponíveis:", epis.map((e) => String(e.id)));
    alert(
      `Selecione um EPI válido\n\nID procurado: ${epiId}\nIDs disponíveis: ${epis.map(e => e.id).join(', ')}`
    );
    return;
  }

  const movimentacao = {
    tipo: formData.tipoMovimentacao,
    quantidade: parseInt(formData.quantidade) || 0,
    responsavel: formData.responsavel,
    funcionarioRecebeu: formData.funcionarioRecebeu || "",
    motivo: formData.motivo,
    observacoes: formData.observacoes || "",
  };

  console.log("📤 Enviando movimentação:", movimentacao);
  console.log("📦 Com EPI:", epiSelecionado);

  onSave(movimentacao, epiSelecionado);
  onClose();
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

  const epiSelecionado = epis.find(
    (epi) => String(epi.id) === String(formData.epiId)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    {epi.tipoEstoque?.toLowerCase() || "unidade(s)"})
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
                  setFormData({ ...formData, tipoMovimentacao: e.target.value })
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
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                max={
                  formData.tipoMovimentacao === "ajuste"
                    ? undefined
                    : epiSelecionado?.quantidadeAtual
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
                  {epiSelecionado.tipoEstoque?.toLowerCase() || "unidade(s)"}
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
                  placeholder="Nome do funcionário"
                />
              </div>
            )}

            {/* Motivo */}
            <div
              className={
                formData.tipoMovimentacao === "saida" ? "" : "md:col-span-2"
              }
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo <span className="text-red-500">*</span>
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

          {/* Observações */}
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

export default MovimentacaoModal;
