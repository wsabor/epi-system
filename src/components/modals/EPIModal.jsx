import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const EPIModal = ({ isOpen, onClose, epi = null, onSave }) => {
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

  // Categorias disponíveis
  const categorias = [
    "Proteção Respiratória",
    "Proteção Auditiva",
    "Proteção Visual",
    "Capacetes",
    "Luvas",
    "Calçados de Segurança",
    "Uniformes",
    "Outros",
  ];

  // Tipos de estoque
  const tiposEstoque = ["Peça", "Par", "Kit", "Metro", "Litro"];

  // Atualizar formulário quando EPI mudar
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
      // Resetar formulário para novo EPI
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

  // Obter opções de tamanho baseado na categoria
  const getTamanhosOptions = () => {
    switch (formData.categoria) {
      case "Uniformes":
        return ["PP", "P", "M", "G", "GG", "XG"];
      case "Calçados de Segurança":
        return Array.from({ length: 15 }, (_, i) => (34 + i).toString());
      default:
        return ["Único"];
    }
  };

  // Resetar tamanho quando categoria mudar
  useEffect(() => {
    if (formData.categoria) {
      const tamanhos = getTamanhosOptions();
      if (!tamanhos.includes(formData.tamanho)) {
        setFormData((prev) => ({ ...prev, tamanho: "" }));
      }
    }
  }, [formData.categoria]);

  // Submeter formulário
  const handleSubmit = (e) => {
    e.preventDefault();

    const epiData = {
      ...formData,
      quantidadeAtual: parseInt(formData.quantidadeAtual) || 0,
      valorUnitario: parseFloat(formData.valorUnitario) || 0,
      estoqueMinimo: parseInt(formData.estoqueMinimo) || 0,
      diasAvisoVencimento: parseInt(formData.diasAvisoVencimento) || 0,
    };

    if (epi) {
      // Editar EPI existente
      onSave({ id: epi.id, ...epiData });
    } else {
      // Criar novo EPI
      onSave(epiData);
    }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {epi ? "Editar EPI" : "Adicionar Novo EPI"}
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
            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição do EPI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Capacete de Segurança Branco"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>

            {/* Tamanho */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho <span className="text-red-500">*</span>
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
              {!formData.categoria && (
                <p className="text-xs text-gray-500 mt-1">
                  Selecione uma categoria primeiro
                </p>
              )}
            </div>

            {/* Tipo de Estoque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Estoque <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.tipoEstoque}
                onChange={(e) =>
                  setFormData({ ...formData, tipoEstoque: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {tiposEstoque.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantidade Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade Atual <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantidadeAtual}
                onChange={(e) =>
                  setFormData({ ...formData, quantidadeAtual: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estoque Mínimo <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.estoqueMinimo}
                onChange={(e) =>
                  setFormData({ ...formData, estoqueMinimo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            {/* Marca/Fabricante */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca/Fabricante <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.marca}
                onChange={(e) =>
                  setFormData({ ...formData, marca: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: 3M, MSA, Vonder"
              />
            </div>

            {/* Número do CA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do CA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.numeroCA}
                onChange={(e) =>
                  setFormData({ ...formData, numeroCA: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="12345"
              />
            </div>

            {/* Data de Validade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Validade <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dataValidade}
                onChange={(e) =>
                  setFormData({ ...formData, dataValidade: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="dd/mm/yyyy"
                pattern="\d{4}-\d{2}-\d{2}"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: DD/MM/AAAA</p>
            </div>

            {/* Dias para Aviso de Vencimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dias p/ Aviso de Vencimento{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.diasAvisoVencimento}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    diasAvisoVencimento: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="30"
              />
            </div>

            {/* Valor Unitário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Unitário (R$) <span className="text-red-500">*</span>
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
                placeholder="0.00"
              />
            </div>

            {/* Fornecedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fornecedor}
                onChange={(e) =>
                  setFormData({ ...formData, fornecedor: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nome do fornecedor"
              />
            </div>
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
              <span>{epi ? "Salvar Alterações" : "Cadastrar EPI"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EPIModal;
