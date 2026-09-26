import { useEffect, useState } from "react";
import { api } from "../services/api";

// Auditoria é gravada só pela API; aqui apenas se consulta, com filtros aplicados no servidor.
export const useLogs = (filtros) => {
  const [resultado, setResultado] = useState({ itens: [], total: 0, totalPaginas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const chave = JSON.stringify(filtros);
  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    api("/logs", { query: JSON.parse(chave) })
      .then((dados) => !cancelado && (setResultado(dados), setError(null)))
      .catch((err) => !cancelado && setError(err.message))
      .finally(() => !cancelado && setLoading(false));
    return () => {
      cancelado = true;
    };
  }, [chave]);

  return { logs: resultado.itens, total: resultado.total, totalPaginas: resultado.totalPaginas, loading, error };
};
