import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../services/firebase";

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
  const [loading, setLoading] = useState(true);

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verificar/criar usuário no Firestore
      const userRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Criar novo usuário
        await setDoc(userRef, {
          nome: user.displayName,
          email: user.email,
          permissao: "operador", // Padrão para novos usuários
          ativo: true,
          createdAt: serverTimestamp(),
        });
      }

      return user;
    } catch (error) {
      console.error("Erro no login com Google:", error);
      throw error;
    }
  };

  // Login com Email/Senha
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Erro no login com email:", error);
      throw error;
    }
  };

  // Cadastrar novo usuário com Email/Senha
  const registerWithEmail = async (email, password, nome) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      // Atualizar perfil com nome
      await updateProfile(user, {
        displayName: nome,
      });

      // Criar documento no Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nome: nome,
        email: email,
        permissao: "operador", // Padrão para novos usuários
        ativo: true,
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    }
  };

  // Resetar senha
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro no logout:", error);
      throw error;
    }
  };

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados do usuário no Firestore
        const userRef = doc(db, "usuarios", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Verificar se usuário está ativo
          if (!userData.ativo) {
            await signOut(auth);
            setCurrentUser(null);
            setLoading(false);
            return;
          }

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            nome: user.displayName || userData.nome,
            permissao: userData.permissao || "operador",
            ativo: userData.ativo,
          });
        } else {
          // Usuário existe no Auth mas não no Firestore - criar documento
          await setDoc(userRef, {
            nome: user.displayName || "Usuário",
            email: user.email,
            permissao: "operador",
            ativo: true,
            createdAt: serverTimestamp(),
          });

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            nome: user.displayName || "Usuário",
            permissao: "operador",
            ativo: true,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
