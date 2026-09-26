import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

const AceitarConvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { entrar } = useAuth();

  const [convite, setConvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    senha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    api(`/convites/aceitar/${token}`)
      .then(setConvite)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.senha.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);

    try {
      // A API cria a conta e já devolve a sessão aberta.
      const perfil = await api(`/convites/aceitar/${token}`, {
        method: "POST",
        body: { senha: formData.senha },
      });
      setSuccess(true);
      setTimeout(() => {
        entrar(perfil);
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando convite...</p>
        </div>
      </div>
    );
  }

  if (error && !convite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Convite Inválido
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Conta Criada com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Sua conta foi criada. Entrando no sistema...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo!
          </h1>
          <p className="text-gray-600">
            Você foi convidado para o Sistema de Gestão de EPIs
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Nome:</p>
          <p className="font-semibold text-gray-900">{convite.nome}</p>
          
          <p className="text-sm text-gray-600 mb-1 mt-3">Email:</p>
          <p className="font-semibold text-gray-900">{convite.email}</p>
          
          <p className="text-sm text-gray-600 mb-1 mt-3">Departamento:</p>
          <p className="font-semibold text-gray-900">{convite.departamento}</p>
          
          <p className="text-sm text-gray-600 mb-1 mt-3">Função:</p>
          <p className="font-semibold text-gray-900">
            {convite.role === "admin" && "Administrador"}
            {convite.role === "operador" && "Operador"}
            {convite.role === "visualizador" && "Visualizador"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Defina sua Senha *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirme sua Senha *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading ? "Criando conta..." : "Criar Conta e Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AceitarConvite;
