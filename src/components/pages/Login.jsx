import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, AlertCircle } from "lucide-react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } =
    useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
      navigate("/");
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
        navigate("/");
      } else {
        if (password.length < 6) {
          setError("A senha deve ter no mínimo 6 caracteres");
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, nome);
        navigate("/");
      }
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Digite seu email para recuperar a senha");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Email inválido";
      case "auth/user-not-found":
        return "Usuário não encontrado";
      case "auth/wrong-password":
        return "Senha incorreta";
      case "auth/email-already-in-use":
        return "Este email já está em uso";
      case "auth/weak-password":
        return "Senha muito fraca. Use no mínimo 6 caracteres";
      case "auth/invalid-credential":
        return "Credenciais inválidas. Verifique email e senha";
      default:
        return "Erro ao fazer login. Tente novamente.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo SENAI */}
        <div className="text-center mb-8">
          <div className="w-28 h-16 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">SENAI</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Controle EPIs
          </h1>
          <p className="text-gray-600 mt-2">SENAI São Paulo</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
          </h2>

          {/* Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Reset Email Sent */}
          {resetEmailSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <span className="text-sm">
                Email de recuperação enviado! Verifique sua caixa de entrada.
              </span>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Continuar com Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    required={!isLogin}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="João Silva"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
            </button>
          </form>

          {/* Toggle Login/Cadastro */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setResetEmailSent(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isLogin ? (
                <>
                  Não tem uma conta?{" "}
                  <span className="text-red-600 font-medium">Cadastre-se</span>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <span className="text-red-600 font-medium">Entrar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
