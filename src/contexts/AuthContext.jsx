import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, definirAoExpirarSessao } from "../services/api";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook e Provider do mesmo contexto ficam juntos
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [permissoes, setPermissoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recebe a resposta de login/me/aceitar convite: { usuario, permissoes }.
  const entrar = useCallback((perfil) => {
    setUsuario(perfil.usuario);
    setPermissoes(perfil.permissoes);
  }, []);

  const sair = useCallback(() => {
    setUsuario(null);
    setPermissoes([]);
  }, []);

  useEffect(() => {
    definirAoExpirarSessao(sair);
    api("/auth/me")
      .then(entrar)
      .catch(sair)
      .finally(() => setLoading(false));
  }, [entrar, sair]);

  const login = async (email, senha) => {
    entrar(await api("/auth/login", { method: "POST", body: { email, senha } }));
  };

  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    sair();
  };

  const alterarSenha = async (senhaAtual, novaSenha) => {
    entrar(await api("/auth/alterar-senha", { method: "POST", body: { senhaAtual, novaSenha } }));
  };

  const esqueciSenha = async (email) => {
    const { mensagem } = await api("/auth/esqueci-senha", { method: "POST", body: { email } });
    return mensagem;
  };

  const redefinirSenha = async (token, novaSenha) => {
    const { mensagem } = await api("/auth/redefinir-senha", { method: "POST", body: { token, novaSenha } });
    return mensagem;
  };

  // Só esconde/mostra itens da tela: quem autoriza de verdade é a API.
  const hasPermission = useCallback((permissao) => permissoes.includes(permissao), [permissoes]);

  const value = {
    usuario,
    loading,
    login,
    logout,
    alterarSenha,
    esqueciSenha,
    redefinirSenha,
    entrar,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
