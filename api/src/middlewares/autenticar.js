import { prisma } from "../db.js";
import { temPermissao } from "../permissoes.js";
import { COOKIE_SESSAO, encerrarSessao, lerSessao } from "../services/sessao.js";

// Carrega o usuário do banco a cada request: desativar ou trocar a senha derruba a sessão na hora.
export async function autenticar(req, res, next) {
  const sessao = lerSessao(req.cookies[COOKIE_SESSAO]);
  const usuario = sessao && (await prisma.usuario.findUnique({ where: { id: sessao.id } }));

  if (!usuario || !usuario.ativo || usuario.sessaoVersao !== sessao.versao) {
    encerrarSessao(res);
    return res.status(401).json({ erro: "Sessão inválida ou expirada. Faça login novamente." });
  }

  req.usuario = usuario;
  next();
}

export function permitir(permissao) {
  return (req, res, next) => {
    if (!temPermissao(req.usuario.role, permissao)) {
      return res.status(403).json({ erro: "Você não tem permissão para esta ação." });
    }
    next();
  };
}
