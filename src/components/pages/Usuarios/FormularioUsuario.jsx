import React, { useState, useEffect } from "react";
import { X, Save, Shield, Users, Eye, AlertCircle } from "lucide-react";

const FormularioUsuario = ({ usuario, roles, onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    departamento: "",
    role: "visualizador",
  });

  const [erros, setErros] = useState({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        telefone: usuario.telefone || "",
        departamento: usuario.departamento || "",
        role: usuario.role || "visualizador",
      });
    }
  }, [usuario]);

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      novosErros.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      novosErros.email = "Email inválido";
    }

    if (!formData.departamento.trim()) {
      novosErros.departamento = "Departamento é obrigatório";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      onSalvar(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro do campo ao digitar
    if (erros[name]) {
      setErros((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const roleAtual = roles[formData.role];
  const RoleIcon = roleAtual?.icon || Shield;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {usuario ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <p className="text-gray-600">
            {usuario
              ? "Atualize as informações do usuário"
              : "Preencha os dados para criar um novo usuário"}
          </p>
        </div>
        <button
          onClick={onCancelar}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações Básicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  erros.nome ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Digite o nome completo"
              />
              {erros.nome && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {erros.nome}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  erros.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="email@provedor.br"
              />
              {erros.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {erros.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="(11) 98765-4321"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  erros.departamento ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Selecione o departamento</option>
                <option value="TI">TI</option>
                <option value="Almoxarifado">Almoxarifado</option>
                <option value="Segurança">Segurança</option>
                <option value="Produção">Produção</option>
                <option value="Administrativo">Administrativo</option>
                <option value="RH">Recursos Humanos</option>
              </select>
              {erros.departamento && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {erros.departamento}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Função e Permissões */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Função e Permissões
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione a Função
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(roles).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = formData.role === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: key }))
                      }
                      className={`p-4 border-2 rounded-lg transition-all ${
                        isSelected
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon
                          size={24}
                          className={
                            isSelected ? "text-red-600" : "text-gray-400"
                          }
                        />
                        <span
                          className={`font-semibold ${
                            isSelected ? "text-red-900" : "text-gray-900"
                          }`}
                        >
                          {config.nome}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detalhes das Permissões */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <RoleIcon size={20} className="text-red-600" />
                <h4 className="font-semibold text-gray-900">
                  Permissões do {roleAtual?.nome}
                </h4>
              </div>
              <ul className="space-y-2">
                {roleAtual?.permissoes.map((permissao, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                    {permissao}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Save size={18} />
            <span>{usuario ? "Salvar Alterações" : "Criar Usuário"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioUsuario;
