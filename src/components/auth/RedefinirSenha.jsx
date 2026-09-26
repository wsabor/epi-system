import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const RedefinirSenha = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { redefinirSenha } = useAuth();

  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres");
    if (senha !== confirmacao) return setErro("As senhas não conferem");

    setLoading(true);
    try {
      setSucesso(await redefinirSenha(token, senha));
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
          <p className="text-red-100">Sistema de Controle EPIs</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {sucesso ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <p className="text-gray-700 mb-6">{sucesso}</p>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{erro}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    minLength={8}
                    maxLength={72}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    placeholder="Mínimo 8 caracteres"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirme a nova senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
