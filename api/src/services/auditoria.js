import { prisma } from "../db.js";

// Aceita um client de transação (tx) para gravar o log junto com a operação auditada.
export function registrarLog(req, { acao, usuarioId, entidade, entidadeId, detalhes }, tx = prisma) {
  return tx.log.create({
    data: {
      acao,
      usuarioId: usuarioId ?? req.usuario?.id ?? null,
      entidade,
      entidadeId,
      detalhes,
      ip: req.ip,
    },
  });
}
