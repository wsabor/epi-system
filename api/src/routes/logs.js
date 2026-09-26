import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import {
  esquemaPaginacao,
  esquemaPeriodo,
  filtroPeriodo,
  paginar,
  respostaPaginada,
} from "../services/consultas.js";
import { formatarLog } from "../services/formatar.js";

export const logsRouter = Router();

logsRouter.get("/", async (req, res) => {
  const filtros = z
    .object({
      usuarioId: z.uuid().optional(),
      acao: z.string().trim().max(50).optional(),
      entidade: z.string().trim().max(30).optional(),
      entidadeId: z.string().trim().max(50).optional(),
    })
    .extend(esquemaPeriodo.shape)
    .extend(esquemaPaginacao.shape)
    .parse(req.query);

  const where = {
    usuarioId: filtros.usuarioId,
    acao: filtros.acao,
    entidade: filtros.entidade,
    entidadeId: filtros.entidadeId,
    criadoEm: filtroPeriodo(filtros),
  };

  const [itens, total] = await prisma.$transaction([
    prisma.log.findMany({ where, include: { usuario: true }, orderBy: { criadoEm: "desc" }, ...paginar(filtros) }),
    prisma.log.count({ where }),
  ]);

  res.json(respostaPaginada(itens.map(formatarLog), total, filtros));
});
