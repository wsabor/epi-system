import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usuariosRef = collection(db, "usuarios");

    const unsubscribe = onSnapshot(
      usuariosRef,
      (snapshot) => {
        const usuariosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Ordenar por data de criação (mais recentes primeiro)
        usuariosData.sort((a, b) => {
          const dateA = a.dataCriacao?.toDate
            ? a.dataCriacao.toDate()
            : new Date(a.dataCriacao);
          const dateB = b.dataCriacao?.toDate
            ? b.dataCriacao.toDate()
            : new Date(b.dataCriacao);
          return dateB - dateA;
        });

        setUsuarios(usuariosData);
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao carregar usuários:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Adicionar novo usuário
  const addUsuario = async (usuarioData) => {
    try {
      const usuariosRef = collection(db, "usuarios");
      const novoUsuario = {
        ...usuarioData,
        dataCriacao: serverTimestamp(),
        ultimoAcesso: null,
        ativo: true,
      };

      const docRef = await addDoc(usuariosRef, novoUsuario);
      console.log("✅ Usuário criado com ID:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("❌ Erro ao adicionar usuário:", err);
      throw err;
    }
  };

  // Atualizar usuário existente
  const updateUsuario = async (id, usuarioData) => {
    try {
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, usuarioData);
      console.log("✅ Usuário atualizado:", id);
    } catch (err) {
      console.error("❌ Erro ao atualizar usuário:", err);
      throw err;
    }
  };

  // Deletar usuário
  const deleteUsuario = async (id) => {
    try {
      const usuarioRef = doc(db, "usuarios", id);
      await deleteDoc(usuarioRef);
      console.log("✅ Usuário deletado:", id);
    } catch (err) {
      console.error("❌ Erro ao deletar usuário:", err);
      throw err;
    }
  };

  // Ativar/Desativar usuário
  const toggleUsuarioStatus = async (id, ativo) => {
    try {
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, { ativo });
      console.log(`✅ Usuário ${ativo ? "ativado" : "desativado"}:`, id);
    } catch (err) {
      console.error("❌ Erro ao alterar status do usuário:", err);
      throw err;
    }
  };

  // Atualizar último acesso
  const updateUltimoAcesso = async (id) => {
    try {
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, {
        ultimoAcesso: serverTimestamp(),
      });
    } catch (err) {
      console.error("❌ Erro ao atualizar último acesso:", err);
      throw err;
    }
  };

  return {
    usuarios,
    loading,
    error,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    toggleUsuarioStatus,
    updateUltimoAcesso,
  };
};
