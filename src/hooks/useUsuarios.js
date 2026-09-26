import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

// Sem criar (só por convite) e sem excluir (só inativar).
export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recarregar = useCallback(async () => {
    try {
      setUsuarios(await api("/usuarios"));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const updateUsuario = async (id, dados) => {
    await api(`/usuarios/${id}`, { method: "PUT", body: dados });
    await recarregar();
  };

  const setAtivoUsuario = async (id, ativo) => {
    await api(`/usuarios/${id}/ativo`, { method: "PATCH", body: { ativo } });
    await recarregar();
  };

  return { usuarios, loading, error, updateUsuario, setAtivoUsuario, recarregar };
};
