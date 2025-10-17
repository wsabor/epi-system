import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  subscribeToMovimentacoes,
  createMovimentacao as createMovimentacaoService,
} from "../services/movimentacaoService";

export const useMovimentacoes = () => {
  const { currentUser } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Só iniciar subscription se o usuário estiver autenticado
    if (!currentUser) {
      setMovimentacoes([]);
      setLoading(false);
      return;
    }

    console.log("🔄 Iniciando subscription de Movimentações...");
    setLoading(true);

    // Subscrever para atualizações em tempo real
    const unsubscribe = subscribeToMovimentacoes((movimentacoesData) => {
      console.log("✅ Movimentações carregadas:", movimentacoesData.length);
      setMovimentacoes(movimentacoesData);
      setLoading(false);
    });

    // Cleanup: cancelar subscription quando componente desmontar
    return () => {
      console.log("🛑 Cancelando subscription de Movimentações");
      unsubscribe();
    };
  }, [currentUser]); // ← ADICIONADA DEPENDÊNCIA

  const addMovimentacao = async (movimentacaoData) => {
    try {
      setError(null);
      await createMovimentacaoService(movimentacaoData);
      // O listener atualizará automaticamente a lista
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    movimentacoes,
    loading,
    error,
    addMovimentacao,
  };
};
