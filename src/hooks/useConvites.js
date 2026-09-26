import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export const useConvites = () => {
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    try {
      setConvites(await api("/convites"));
    } catch (err) {
      console.error("Erro ao carregar convites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // Retorna { convite, link, emailEnviado, erroEmail }: o link só existe nesta resposta.
  const criarConvite = async (dados) => {
    const resultado = await api("/convites", { method: "POST", body: dados });
    await recarregar();
    return resultado;
  };

  const revogarConvite = async (id) => {
    await api(`/convites/${id}/revogar`, { method: "PATCH" });
    await recarregar();
  };

  return { convites, loading, criarConvite, revogarConvite, recarregar };
};
