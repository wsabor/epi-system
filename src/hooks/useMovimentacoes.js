import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

// As telas de Movimentações e Relatórios filtram no navegador sobre as mais recentes.
// Quando o volume passar disso, os filtros devem ir para a API (ela já os suporta).
const LIMITE = 2000;

export const useMovimentacoes = () => {
  const { usuario } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recarregar = useCallback(async () => {
    try {
      const resposta = await api("/movimentacoes", { query: { porPagina: LIMITE } });
      setMovimentacoes(resposta.itens);
      setTotal(resposta.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const usuarioId = usuario?.id;
  useEffect(() => {
    if (!usuarioId) {
      setMovimentacoes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    recarregar();
  }, [usuarioId, recarregar]);

  const addMovimentacao = async (dados) => {
    const resultado = await api("/movimentacoes", { method: "POST", body: dados });
    await recarregar();
    return resultado;
  };

  return { movimentacoes, total, limite: LIMITE, loading, error, addMovimentacao, recarregar };
};
