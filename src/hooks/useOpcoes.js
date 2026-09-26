import { useEffect, useState } from "react";
import { api } from "../services/api";

// As listas do domínio mudam só com deploy: uma busca por carregamento da página basta.
let cache = null;

export const useOpcoes = () => {
  const [opcoes, setOpcoes] = useState(null);

  useEffect(() => {
    cache ??= api("/opcoes").catch((erro) => {
      cache = null;
      throw erro;
    });
    cache.then(setOpcoes).catch((erro) => console.error("Erro ao carregar opções:", erro));
  }, []);

  return opcoes;
};
