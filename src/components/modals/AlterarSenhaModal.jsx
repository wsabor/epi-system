import React, { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AlterarSenhaModal = ({ isOpen, onClose }) => {
  const { alterarSenha } = useAuth();
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmacao: "" });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const fechar = () => {
    setForm({ senhaAtual: "", novaSenha: "", confirmacao: "" });
    setErro("");
    setSucesso(false);
    onClose();
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    if (form.novaSenha.length < 8) return setErro("A nova senha precisa ter pelo menos 8 caracteres");
    if (form.novaSenha !== form.confirmacao) return setErro("As senhas não conferem");

    setLoading(true);
    try {
      await alterarSenha(form.senhaAtual, form.novaSenha);
      setSucesso(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const campo = (name, label) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input
        type="password"
        name={name}
        value={form[name]}
        onChange={handleChange}
        required
        maxLength={72}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        disabled={loading}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Alterar senha</h3>
          <button onClick={fechar} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {sucesso ? (
          <div className="p-6 text-center">
            <CheckCircle size={40} className="text-green-600 mx-auto mb-3" />
            <p className="text-gray-700 mb-1">Senha alterada com sucesso.</p>
            <p className="text-sm text-gray-500 mb-6">Sessões abertas em outros dispositivos foram encerradas.</p>
            <button onClick={fechar} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {erro && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{erro}</span>
              </div>
            )}
            {campo("senhaAtual", "Senha atual")}
            {campo("novaSenha", "Nova senha (mínimo 8 caracteres)")}
            {campo("confirmacao", "Confirme a nova senha")}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={fechar} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Alterar senha"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AlterarSenhaModal;
