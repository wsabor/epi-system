import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { PERMISSOES } from "../permissoes.js";
import { formatarUsuario } from "./formatar.js";

export const COOKIE_SESSAO = "epi_sessao";
const DURACAO_HORAS = 8;

const opcoesCookie = {
  httpOnly: true,
  sameSite: "strict",
  secure: config.COOKIE_SECURE,
  path: "/api",
};

export function iniciarSessao(res, usuario) {
  const token = jwt.sign({ v: usuario.sessaoVersao }, config.JWT_SEGREDO, {
    subject: usuario.id,
    expiresIn: `${DURACAO_HORAS}h`,
    algorithm: "HS256",
  });
  res.cookie(COOKIE_SESSAO, token, { ...opcoesCookie, maxAge: DURACAO_HORAS * 60 * 60 * 1000 });
}

export function encerrarSessao(res) {
  res.clearCookie(COOKIE_SESSAO, opcoesCookie);
}

// Retorna { id, versao } ou null se o token for inválido/expirado.
export function lerSessao(token) {
  try {
    const dados = jwt.verify(token, config.JWT_SEGREDO, { algorithms: ["HS256"] });
    return { id: dados.sub, versao: dados.v };
  } catch {
    return null;
  }
}

export function perfilPublico(usuario) {
  return { usuario: formatarUsuario(usuario), permissoes: PERMISSOES[usuario.role] };
}
