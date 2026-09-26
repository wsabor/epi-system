import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

// Traz ativos e inativos; cada tela filtra o que precisa.
export const useEPIs = () => {
  const { usuario } = useAuth();
  const [epis, setEpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recarregar = useCallback(async () => {
    try {
      setEpis(await api("/epis", { query: { status: "todos" } }));
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
      setEpis([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    recarregar();
  }, [usuarioId, recarregar]);

  const addEPI = async (dados) => {
    await api("/epis", { method: "POST", body: dados });
    await recarregar();
  };

  const updateEPI = async (id, dados) => {
    await api(`/epis/${id}`, { method: "PUT", body: dados });
    await recarregar();
  };

  const setAtivoEPI = async (id, ativo) => {
    await api(`/epis/${id}/ativo`, { method: "PATCH", body: { ativo } });
    await recarregar();
  };

  return { epis, loading, error, addEPI, updateEPI, setAtivoEPI, recarregar };
};
