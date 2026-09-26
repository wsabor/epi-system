import bcrypt from "bcryptjs";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { ErroHttp } from "../middlewares/erros.js";
import { autenticar } from "../middlewares/autenticar.js";
import { registrarLog } from "../services/auditoria.js";
import { enviarEmailRedefinicaoSenha } from "../services/email.js";
import { encerrarSessao, iniciarSessao, perfilPublico } from "../services/sessao.js";
import { gerarToken, hashToken } from "../services/tokens.js";

export const CUSTO_BCRYPT = 12;
const VALIDADE_REDEFINICAO_MS = 60 * 60 * 1000;

// Comparar contra um hash qualquer quando o e-mail não existe: a resposta leva o mesmo tempo
// e não revela quais e-mails estão cadastrados.
const HASH_FALSO = bcrypt.hashSync("senha-inexistente", CUSTO_BCRYPT);

export const esquemaSenha = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres")
  .max(72, "A senha pode ter no máximo 72 caracteres"); // limite do bcrypt

const esquemaEmail = z.email("E-mail inválido").trim().toLowerCase();

// Só respostas de erro contam: se muitos usuários chegarem pelo mesmo IP (proxy da rede),
// logins bem-sucedidos não esgotam o limite de ninguém.
const limitarFalhas = (limit) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { erro: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
  });

const limiteLogin = limitarFalhas(10);
const limiteRedefinicao = limitarFalhas(10);
// Cada pedido dispara um e-mail, então aqui contam todos.
const limiteEsqueciSenha = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { erro: "Muitas solicitações. Aguarde 15 minutos e tente novamente." },
});

export const authRouter = Router();

authRouter.post("/login", limiteLogin, async (req, res) => {
  const { email, senha } = z.object({ email: esquemaEmail, senha: z.string() }).parse(req.body);

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = await bcrypt.compare(senha, usuario?.senhaHash ?? HASH_FALSO);

  if (!usuario || !senhaConfere) {
    await registrarLog(req, {
      acao: "LOGIN_FALHA",
      usuarioId: usuario?.id,
      detalhes: { email },
    });
    throw new ErroHttp(401, "E-mail ou senha inválidos");
  }

  if (!usuario.ativo) {
    await registrarLog(req, { acao: "LOGIN_BLOQUEADO_INATIVO", usuarioId: usuario.id });
    throw new ErroHttp(403, "Usuário desativado. Procure o administrador do sistema.");
  }

  const atualizado = await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcesso: new Date() },
  });
  await registrarLog(req, { acao: "LOGIN", usuarioId: usuario.id });

  iniciarSessao(res, atualizado);
  res.json(perfilPublico(atualizado));
});

authRouter.post("/logout", (req, res) => {
  encerrarSessao(res);
  res.status(204).end();
});

authRouter.get("/me", autenticar, (req, res) => {
  res.json(perfilPublico(req.usuario));
});

authRouter.post("/alterar-senha", autenticar, async (req, res) => {
  const { senhaAtual, novaSenha } = z
    .object({ senhaAtual: z.string(), novaSenha: esquemaSenha })
    .parse(req.body);

  if (!(await bcrypt.compare(senhaAtual, req.usuario.senhaHash))) {
    throw new ErroHttp(400, "Senha atual incorreta");
  }

  const atualizado = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.update({
      where: { id: req.usuario.id },
      data: {
        senhaHash: await bcrypt.hash(novaSenha, CUSTO_BCRYPT),
        sessaoVersao: { increment: 1 },
      },
    });
    await registrarLog(req, { acao: "SENHA_ALTERAR", entidade: "usuario", entidadeId: usuario.id }, tx);
    return usuario;
  });

  // As outras sessões caem; esta recebe um cookie novo para continuar logada.
  iniciarSessao(res, atualizado);
  res.json(perfilPublico(atualizado));
});

authRouter.post("/esqueci-senha", limiteEsqueciSenha, async (req, res) => {
  const { email } = z.object({ email: esquemaEmail }).parse(req.body);
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (usuario?.ativo) {
    const { token, tokenHash } = gerarToken();
    await prisma.$transaction(async (tx) => {
      // Um pedido novo invalida os links anteriores ainda não usados.
      await tx.tokenRedefinicaoSenha.updateMany({
        where: { usuarioId: usuario.id, usadoEm: null },
        data: { usadoEm: new Date() },
      });
      await tx.tokenRedefinicaoSenha.create({
        data: {
          usuarioId: usuario.id,
          tokenHash,
          expiraEm: new Date(Date.now() + VALIDADE_REDEFINICAO_MS),
        },
      });
      await registrarLog(req, { acao: "SENHA_REDEFINICAO_SOLICITAR", usuarioId: usuario.id }, tx);
    });

    await enviarEmailRedefinicaoSenha({
      nome: usuario.nome,
      email: usuario.email,
      link: `${config.APP_URL}/redefinir-senha/${token}`,
    });
  }

  // Mesma resposta exista ou não o e-mail: não revela quem tem cadastro.
  res.status(202).json({
    mensagem: "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
  });
});

authRouter.post("/redefinir-senha", limiteRedefinicao, async (req, res) => {
  const { token, novaSenha } = z
    .object({ token: z.string().min(1), novaSenha: esquemaSenha })
    .parse(req.body);

  const linkInvalido = new ErroHttp(400, "Link inválido ou expirado. Solicite uma nova redefinição de senha.");
  const registro = await prisma.tokenRedefinicaoSenha.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: true },
  });

  if (!registro || registro.usadoEm || registro.expiraEm < new Date() || !registro.usuario.ativo) {
    throw linkInvalido;
  }

  const senhaHash = await bcrypt.hash(novaSenha, CUSTO_BCRYPT);

  await prisma.$transaction(async (tx) => {
    // Marca como usado só se ainda não estava: de dois pedidos simultâneos, apenas um passa.
    const { count } = await tx.tokenRedefinicaoSenha.updateMany({
      where: { id: registro.id, usadoEm: null },
      data: { usadoEm: new Date() },
    });
    if (count === 0) throw linkInvalido;

    await tx.usuario.update({
      where: { id: registro.usuarioId },
      data: { senhaHash, sessaoVersao: { increment: 1 } },
    });
    await registrarLog(req, { acao: "SENHA_REDEFINIR", usuarioId: registro.usuarioId }, tx);
  });

  res.json({ mensagem: "Senha redefinida. Faça login com a nova senha." });
});
