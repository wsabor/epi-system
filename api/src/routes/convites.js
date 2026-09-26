import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { prisma } from "../db.js";
import { DIAS_VALIDADE_CONVITE } from "../dominio.js";
import { autenticar, permitir } from "../middlewares/autenticar.js";
import { ErroHttp } from "../middlewares/erros.js";
import { limitarFalhas } from "../middlewares/limites.js";
import { registrarLog } from "../services/auditoria.js";
import { enviarEmailConvite } from "../services/email.js";
import { esquemaId } from "../services/consultas.js";
import { formatarConvite, statusConvite } from "../services/formatar.js";
import { iniciarSessao, perfilPublico } from "../services/sessao.js";
import { gerarToken, hashToken } from "../services/tokens.js";
import { CUSTO_BCRYPT, esquemaEmail, esquemaSenha } from "./auth.js";
import { esquemaDadosUsuario } from "./usuarios.js";

const conviteInvalido = () => new ErroHttp(404, "Convite inválido, expirado ou já utilizado");

async function buscarConvitePendente(token, tx = prisma) {
  const convite = await tx.convite.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!convite || statusConvite(convite) !== "pendente") throw conviteInvalido();
  return convite;
}

export const convitesRouter = Router();

// ---------- Rotas públicas (quem abriu o link do convite ainda não tem conta) ----------

const limiteAceite = limitarFalhas(20);
const esquemaToken = z.object({ token: z.string().min(1).max(100) });

convitesRouter.get("/aceitar/:token", limiteAceite, async (req, res) => {
  const { token } = esquemaToken.parse(req.params);
  const convite = await buscarConvitePendente(token);
  res.json({
    nome: convite.nome,
    email: convite.email,
    departamento: convite.departamento,
    role: convite.role,
    expiraEm: convite.expiraEm,
  });
});

convitesRouter.post("/aceitar/:token", limiteAceite, async (req, res) => {
  const { token } = esquemaToken.parse(req.params);
  const { senha } = z.object({ senha: esquemaSenha }).parse(req.body);
  const senhaHash = await bcrypt.hash(senha, CUSTO_BCRYPT);

  const usuario = await prisma.$transaction(async (tx) => {
    const convite = await buscarConvitePendente(token, tx);

    // Marca como usado só se ainda estava pendente: de dois aceites simultâneos, apenas um passa.
    const { count } = await tx.convite.updateMany({
      where: { id: convite.id, usadoEm: null, revogadoEm: null, expiraEm: { gt: new Date() } },
      data: { usadoEm: new Date() },
    });
    if (count === 0) throw conviteInvalido();

    if (await tx.usuario.findUnique({ where: { email: convite.email } })) {
      throw new ErroHttp(409, "Já existe uma conta com este e-mail. Faça login ou use 'Esqueci minha senha'.");
    }

    const criado = await tx.usuario.create({
      data: {
        nome: convite.nome,
        email: convite.email,
        departamento: convite.departamento,
        telefone: convite.telefone,
        role: convite.role,
        senhaHash,
        ultimoAcesso: new Date(),
      },
    });
    await tx.convite.update({ where: { id: convite.id }, data: { usuarioId: criado.id } });
    await registrarLog(
      req,
      {
        acao: "CONVITE_ACEITAR",
        usuarioId: criado.id,
        entidade: "convite",
        entidadeId: convite.id,
        detalhes: { email: criado.email, role: criado.role },
      },
      tx,
    );
    return criado;
  });

  // Conta criada já entra logada.
  iniciarSessao(res, usuario);
  res.status(201).json(perfilPublico(usuario));
});

// ---------- Rotas do administrador ----------

convitesRouter.use(autenticar, permitir("convites:gerir"));

convitesRouter.get("/", async (req, res) => {
  const convites = await prisma.convite.findMany({
    include: { criadoPor: true },
    orderBy: { criadoEm: "desc" },
    take: 500,
  });
  res.json(convites.map(formatarConvite));
});

convitesRouter.post("/", async (req, res) => {
  const dados = esquemaDadosUsuario.extend({ email: esquemaEmail }).parse(req.body);
  const { enviarEmail } = z.object({ enviarEmail: z.boolean().default(true) }).parse(req.body);

  if (await prisma.usuario.findUnique({ where: { email: dados.email } })) {
    throw new ErroHttp(409, "Já existe um usuário com este e-mail");
  }

  const { token, tokenHash } = gerarToken();
  const link = `${config.APP_URL}/aceitar-convite/${token}`;
  const expiraEm = new Date(Date.now() + DIAS_VALIDADE_CONVITE * 24 * 60 * 60 * 1000);

  const convite = await prisma.$transaction(async (tx) => {
    // Um convite novo para o mesmo e-mail invalida os anteriores ainda pendentes.
    await tx.convite.updateMany({
      where: { email: dados.email, usadoEm: null, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
    const criado = await tx.convite.create({
      data: { ...dados, tokenHash, expiraEm, criadoPorId: req.usuario.id },
      include: { criadoPor: true },
    });
    await registrarLog(
      req,
      {
        acao: "CONVITE_CRIAR",
        entidade: "convite",
        entidadeId: criado.id,
        detalhes: { email: dados.email, role: dados.role },
      },
      tx,
    );
    return criado;
  });

  // Se o e-mail falhar, o convite continua válido: o admin compartilha o link ou o QR Code.
  let emailEnviado = false;
  let erroEmail = null;
  if (enviarEmail) {
    try {
      await enviarEmailConvite({ ...dados, link });
      emailEnviado = true;
    } catch (err) {
      console.error("Falha ao enviar e-mail de convite:", err.message);
      erroEmail = "Não foi possível enviar o e-mail. Compartilhe o link ou o QR Code.";
    }
  }

  // O link só existe nesta resposta (o banco guarda apenas o hash do token).
  res.status(201).json({ convite: formatarConvite(convite), link, emailEnviado, erroEmail });
});

convitesRouter.patch("/:id/revogar", async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  const atual = await prisma.convite.findUnique({ where: { id } });
  if (!atual) throw new ErroHttp(404, "Convite não encontrado");
  if (statusConvite(atual) !== "pendente") throw new ErroHttp(409, "Só convites pendentes podem ser revogados");

  const convite = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.convite.update({
      where: { id },
      data: { revogadoEm: new Date() },
      include: { criadoPor: true },
    });
    await registrarLog(req, { acao: "CONVITE_REVOGAR", entidade: "convite", entidadeId: id }, tx);
    return atualizado;
  });

  res.json(formatarConvite(convite));
});
