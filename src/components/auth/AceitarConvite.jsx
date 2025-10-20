import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { db, auth } from "../../services/firebase";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const AceitarConvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
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
    verificarConvite();
  }, [token]);

  const verificarConvite = async () => {
    try {
      console.log("🔍 Buscando convite com token:", token);
      
      const convitesRef = collection(db, "convites");
      const q = query(
        convitesRef,
        where("token", "==", token)
      );
      
      const querySnapshot = await getDocs(q);
      
      console.log("📦 Documentos encontrados:", querySnapshot.size);
      
      if (querySnapshot.empty) {
        console.error("❌ Nenhum convite encontrado com este token");
        setError("Convite inválido ou já utilizado");
        setLoading(false);
        return;
      }

      const conviteDoc = querySnapshot.docs[0];
      const conviteData = { id: conviteDoc.id, ...conviteDoc.data() };
      
      console.log("✅ Convite encontrado:", conviteData);
      
      // Verificar se já foi usado
      if (conviteData.usado) {
        console.error("❌ Convite já foi usado");
        setError("Este convite já foi utilizado");
        setLoading(false);
        return;
      }
      
      // Verificar se expirou
      const dataExpiracao = new Date(conviteData.dataExpiracao);
      const hoje = new Date();
      
      console.log("📅 Data de expiração:", dataExpiracao);
      console.log("📅 Data de hoje:", hoje);
      
      if (dataExpiracao < hoje) {
        console.error("❌ Convite expirado");
        setError("Este convite expirou em " + dataExpiracao.toLocaleDateString("pt-BR"));
        setLoading(false);
        return;
      }

      setConvite(conviteData);
      setLoading(false);
      console.log("✅ Convite válido e pronto para ser aceito");
      
    } catch (err) {
      console.error("❌ Erro ao verificar convite:", err);
      setError("Erro ao verificar convite: " + err.message);
      setLoading(false);
    }
  };

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

    // Validações
    if (formData.senha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);

    try {
      console.log("🚀 Iniciando criação de conta...");
      console.log("📧 Email:", convite.email);
      
      // 1. Criar usuário no Firebase Authentication
      console.log("⏳ Criando usuário no Authentication...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        convite.email,
        formData.senha
      );
      const user = userCredential.user;
      console.log("✅ Usuário criado no Authentication:", user.uid);

      // 2. Atualizar perfil com o nome
      console.log("⏳ Atualizando perfil...");
      await updateProfile(user, {
        displayName: convite.nome,
      });
      console.log("✅ Perfil atualizado");

      // 3. Criar documento do usuário no Firestore
      console.log("⏳ Criando documento no Firestore...");
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: convite.nome,
        email: convite.email,
        departamento: convite.departamento,
        telefone: convite.telefone || "",
        role: convite.role,
        ativo: true,
        dataCriacao: serverTimestamp(),
        ultimoAcesso: serverTimestamp(),
      });
      console.log("✅ Documento criado no Firestore");

      // 4. Marcar convite como usado
      console.log("⏳ Marcando convite como usado...");
      await updateDoc(doc(db, "convites", convite.id), {
        usado: true,
        dataUso: serverTimestamp(),
        usuarioId: user.uid,
      });
      console.log("✅ Convite marcado como usado");

      setSuccess(true);
      console.log("🎉 CONTA CRIADA COM SUCESSO!");
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      console.error("❌ Erro ao aceitar convite:", err);
      console.error("❌ Código do erro:", err.code);
      console.error("❌ Mensagem:", err.message);
      
      let errorMessage = "Erro ao criar conta";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está cadastrado no sistema";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
            Sua conta foi criada. Redirecionando para o login...
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
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-10"
                placeholder="Mínimo 6 caracteres"
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
                minLength={6}
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
