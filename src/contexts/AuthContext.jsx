import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registrar novo usuário
  const register = async ({
    nome,
    email,
    password,
    departamento,
    telefone,
  }) => {
    try {
      console.log("🚀 Iniciando registro...");
      console.log("📧 Email:", email);
      console.log("👤 Nome:", nome);
      
      // 1. Criar usuário no Firebase Authentication
      console.log("⏳ Criando usuário no Authentication...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("✅ Usuário criado no Authentication:", user.uid);

      // 2. Atualizar perfil com o nome
      console.log("⏳ Atualizando perfil...");
      await updateProfile(user, {
        displayName: nome,
      });
      console.log("✅ Perfil atualizado");

      // 3. Criar documento do usuário no Firestore
      console.log("⏳ Criando documento no Firestore...");
      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        departamento,
        telefone: telefone || "",
        role: "visualizador", // Novo usuário sempre começa como visualizador
        ativo: true,
        dataCriacao: serverTimestamp(),
        ultimoAcesso: serverTimestamp(),
      });
      console.log("✅ Documento criado no Firestore");

      console.log("✅ Usuário registrado com sucesso!");
      return user;
    } catch (error) {
      console.error("❌ ERRO COMPLETO:", error);
      console.error("❌ Código do erro:", error.code);
      console.error("❌ Mensagem:", error.message);
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      console.log("🚀 Tentando fazer login...");
      console.log("📧 Email:", email);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("✅ Login no Authentication OK");

      // Atualizar último acesso
      const userRef = doc(db, "usuarios", userCredential.user.uid);
      
      // Verificar se o documento existe
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error("❌ Usuário não encontrado no Firestore!");
        throw new Error("Usuário não tem perfil no sistema. Entre em contato com o administrador.");
      }
      
      await setDoc(
        userRef,
        {
          ultimoAcesso: serverTimestamp(),
        },
        { merge: true }
      );

      console.log("✅ Login realizado com sucesso!");
      return userCredential.user;
    } catch (error) {
      console.error("❌ ERRO NO LOGIN:", error);
      console.error("❌ Código do erro:", error.code);
      console.error("❌ Mensagem:", error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("✅ Logout realizado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao fazer logout:", error);
      throw error;
    }
  };

  // Recuperar senha
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("✅ Email de recuperação enviado!");
    } catch (error) {
      console.error("❌ Erro ao enviar email de recuperação:", error);
      throw error;
    }
  };

  // Carregar perfil do usuário do Firestore
  const loadUserProfile = async (uid) => {
    try {
      console.log("⏳ Carregando perfil do usuário:", uid);
      const userDoc = await getDoc(doc(db, "usuarios", uid));
      if (userDoc.exists()) {
        console.log("✅ Perfil carregado:", userDoc.data());
        setUserProfile(userDoc.data());
        return userDoc.data();
      } else {
        console.warn("⚠️ Perfil de usuário não encontrado no Firestore");
        // Criar perfil básico se não existir
        const basicProfile = {
          nome: "Usuário",
          email: "",
          role: "visualizador",
          ativo: true,
          dataCriacao: serverTimestamp(),
        };
        await setDoc(doc(db, "usuarios", uid), basicProfile);
        setUserProfile(basicProfile);
        return basicProfile;
      }
    } catch (error) {
      console.error("❌ Erro ao carregar perfil do usuário:", error);
      return null;
    }
  };

  // Verificar permissões
  const hasPermission = (requiredRole) => {
    if (!userProfile) return false;

    const roleHierarchy = {
      admin: 3,
      operador: 2,
      visualizador: 1,
    };

    const userRoleLevel = roleHierarchy[userProfile.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    console.log("🔄 Iniciando observação de autenticação...");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 Estado de autenticação mudou:", user ? "LOGADO" : "DESLOGADO");
      if (user) {
        console.log("👤 Usuário logado:", user.email);
        setCurrentUser(user);
        await loadUserProfile(user.uid);
      } else {
        console.log("👋 Nenhum usuário logado");
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    resetPassword,
    hasPermission,
    loadUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
