import { useState, useEffect } from "react";
import {
  subscribeToMovimentacoes,
  createMovimentacao as createMovimentacaoService,
} from "../services/movimentacaoService";

export const useMovimentacoes = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    // Subscrever para atualizações em tempo real
    const unsubscribe = subscribeToMovimentacoes((movimentacoesData) => {
      setMovimentacoes(movimentacoesData);
      setLoading(false);
    });

    // Cleanup: cancelar subscription quando componente desmontar
    return () => unsubscribe();
  }, []);

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
