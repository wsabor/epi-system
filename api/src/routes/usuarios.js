import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { DEPARTAMENTOS, ROLES } from "../dominio.js";
import { ErroHttp } from "../middlewares/erros.js";
import { registrarLog } from "../services/auditoria.js";
import { esquemaId, esquemaStatusAtivo, filtroAtivo } from "../services/consultas.js";
import { diferencas, formatarUsuario } from "../services/formatar.js";

// Sem criação direta (só por convite) e sem exclusão (só inativação).
// Quem chama é sempre um admin ativo que não pode se desativar nem mudar a própria função:
// por isso o sistema nunca fica sem admin ativo.

export const esquemaDadosUsuario = z.object({
  nome: z.string().trim().min(1, "Obrigatório").max(150),
  departamento: z.enum(DEPARTAMENTOS, "Departamento inválido"),
  telefone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((v) => v || null),
  role: z.enum(Object.keys(ROLES), "Função inválida"),
});

async function buscarUsuario(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new ErroHttp(404, "Usuário não encontrado");
  return usuario;
}

export const usuariosRouter = Router();

usuariosRouter.get("/", async (req, res) => {
  const { status } = z.object({ status: esquemaStatusAtivo.default("todos") }).parse(req.query);
  const usuarios = await prisma.usuario.findMany({
    where: { ativo: filtroAtivo(status) },
    orderBy: { nome: "asc" },
  });
  res.json(usuarios.map(formatarUsuario));
});

usuariosRouter.put("/:id", async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  const dados = esquemaDadosUsuario.parse(req.body);
  const antes = await buscarUsuario(id);

  if (id === req.usuario.id && dados.role !== antes.role) {
    throw new ErroHttp(409, "Você não pode alterar a sua própria função");
  }

  const usuario = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.usuario.update({ where: { id }, data: dados });
    const mudancas = diferencas(antes, atualizado, ["nome", "departamento", "telefone", "role"]);
    if (mudancas) {
      await registrarLog(
        req,
        { acao: "USUARIO_EDITAR", entidade: "usuario", entidadeId: id, detalhes: { email: antes.email, ...mudancas } },
        tx,
      );
    }
    return atualizado;
  });

  res.json(formatarUsuario(usuario));
});

usuariosRouter.patch("/:id/ativo", async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  const { ativo } = z.object({ ativo: z.boolean() }).parse(req.body);

  if (id === req.usuario.id) throw new ErroHttp(409, "Você não pode desativar a si mesmo");

  const atual = await buscarUsuario(id);
  if (atual.ativo === ativo) return res.json(formatarUsuario(atual));

  // Desativado perde a sessão na hora (o middleware confere "ativo" a cada request).
  // Incrementar a versão garante que reativar não ressuscite tokens emitidos antes.
  const usuario = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.usuario.update({
      where: { id },
      data: { ativo, ...(!ativo && { sessaoVersao: { increment: 1 } }) },
    });
    await registrarLog(
      req,
      {
        acao: ativo ? "USUARIO_REATIVAR" : "USUARIO_DESATIVAR",
        entidade: "usuario",
        entidadeId: id,
        detalhes: { nome: atual.nome, email: atual.email },
      },
      tx,
    );
    return atualizado;
  });

  res.json(formatarUsuario(usuario));
});
