import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Shield,
  Mail,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ForgotPassword = ({ onToggleLogin }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Digite seu email");
      return;
    }

    try {
      setError("");
      setSuccess(false);
      setLoading(true);
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error("Erro ao enviar email:", err);

      if (err.code === "auth/user-not-found") {
        setError("Email não encontrado");
      } else if (err.code === "auth/invalid-email") {
        setError("Email inválido");
      } else {
        setError("Erro ao enviar email. Tente novamente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Recuperar Senha
          </h1>
          <p className="text-red-100">Sistema de Controle EPIs</p>
        </div>

        {/* Card de Recuperação */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <button
            onClick={onToggleLogin}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            disabled={loading}
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar ao login
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Esqueceu sua senha?
          </h2>
          <p className="text-gray-600 mb-6">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">
                <p className="font-semibold mb-1">Email enviado com sucesso!</p>
                <p>
                  Verifique sua caixa de entrada e siga as instruções para
                  redefinir sua senha.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Enviando...</span>
                </div>
              ) : success ? (
                "Email Enviado"
              ) : (
                "Enviar Link de Recuperação"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-red-100 text-sm">
          <p>© 2025 wsabor.dev - Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
