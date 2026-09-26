import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { MOTIVOS_POR_TIPO, MOTIVO_ENTREGA_FUNCIONARIO, MOTIVO_OUTROS } from "../dominio.js";
import { permitir } from "../middlewares/autenticar.js";
import { ErroHttp } from "../middlewares/erros.js";
import { registrarLog } from "../services/auditoria.js";
import {
  esquemaPaginacao,
  esquemaPeriodo,
  filtroPeriodo,
  paginar,
  respostaPaginada,
} from "../services/consultas.js";
import { formatarEpi, formatarMovimentacao } from "../services/formatar.js";

const TIPOS = ["entrada", "saida", "ajuste", "perda"];
const opcional = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const esquemaMovimentacao = z
  .object({
    epiId: z.uuid("EPI inválido"),
    tipo: z.enum(TIPOS, "Tipo inválido"),
    quantidade: z.number().int().nonnegative().max(1_000_000),
    responsavel: z.string().trim().min(1, "Obrigatório").max(150),
    funcionarioRecebeu: opcional(150),
    motivo: z.string(),
    observacoes: opcional(1000),
  })
  .superRefine((mov, ctx) => {
    const erro = (path, message) => ctx.addIssue({ code: "custom", path: [path], message });
    if (!MOTIVOS_POR_TIPO[mov.tipo].includes(mov.motivo)) erro("motivo", "Motivo inválido para o tipo");
    if (mov.tipo !== "ajuste" && mov.quantidade === 0) erro("quantidade", "A quantidade precisa ser maior que zero");
    if (mov.motivo === MOTIVO_OUTROS && !mov.observacoes) erro("observacoes", "Descreva o motivo");
    if (mov.motivo === MOTIVO_ENTREGA_FUNCIONARIO && !mov.funcionarioRecebeu) {
      erro("funcionarioRecebeu", "Informe o funcionário que recebeu o EPI");
    }
  })
  // Só a saída registra quem recebeu (regra também garantida no banco).
  .transform((mov) => ({ ...mov, funcionarioRecebeu: mov.tipo === "saida" ? mov.funcionarioRecebeu : null }));

function calcularSaldo(tipo, anterior, quantidade) {
  if (tipo === "entrada") return anterior + quantidade;
  if (tipo === "ajuste") return quantidade;
  return anterior - quantidade;
}

const incluir = { epi: true, usuario: true };

export const movimentacoesRouter = Router();

movimentacoesRouter.get("/", permitir("movimentacoes:ver"), async (req, res) => {
  const filtros = z
    .object({
      epiId: z.uuid().optional(),
      tipo: z.enum(TIPOS).optional(),
      busca: z.string().trim().max(100).optional(),
    })
    .extend(esquemaPeriodo.shape)
    .extend(esquemaPaginacao.shape)
    .parse(req.query);

  const contem = { contains: filtros.busca, mode: "insensitive" };
  const where = {
    epiId: filtros.epiId,
    tipo: filtros.tipo,
    criadoEm: filtroPeriodo(filtros),
    ...(filtros.busca && {
      OR: [{ epi: { descricao: contem } }, { responsavel: contem }, { funcionarioRecebeu: contem }],
    }),
  };

  const [itens, total] = await prisma.$transaction([
    prisma.movimentacao.findMany({ where, include: incluir, orderBy: { criadoEm: "desc" }, ...paginar(filtros) }),
    prisma.movimentacao.count({ where }),
  ]);

  res.json(respostaPaginada(itens.map(formatarMovimentacao), total, filtros));
});

movimentacoesRouter.post("/", permitir("movimentacoes:criar"), async (req, res) => {
  const dados = esquemaMovimentacao.parse(req.body);

  const { movimentacao, epi } = await prisma.$transaction(async (tx) => {
    // FOR UPDATE trava a linha do EPI: duas movimentações simultâneas no mesmo EPI
    // são feitas uma depois da outra, cada uma vendo o saldo correto.
    const [bloqueado] = await tx.$queryRaw`
      SELECT quantidade_atual, ativo FROM epis WHERE id = ${dados.epiId}::uuid FOR UPDATE`;
    if (!bloqueado) throw new ErroHttp(404, "EPI não encontrado");
    if (!bloqueado.ativo) throw new ErroHttp(409, "EPI desativado não aceita movimentações");

    const anterior = bloqueado.quantidade_atual;
    const nova = calcularSaldo(dados.tipo, anterior, dados.quantidade);
    if (nova < 0) {
      throw new ErroHttp(409, `Estoque insuficiente: há ${anterior} em estoque`);
    }

    const epiAtualizado = await tx.epi.update({ where: { id: dados.epiId }, data: { quantidadeAtual: nova } });
    const criada = await tx.movimentacao.create({
      data: { ...dados, quantidadeAnterior: anterior, quantidadeNova: nova, usuarioId: req.usuario.id },
      include: incluir,
    });
    await registrarLog(
      req,
      {
        acao: "MOVIMENTACAO_CRIAR",
        entidade: "movimentacao",
        entidadeId: criada.id,
        detalhes: { epiId: dados.epiId, tipo: dados.tipo, quantidade: dados.quantidade, anterior, nova },
      },
      tx,
    );
    return { movimentacao: criada, epi: epiAtualizado };
  });

  res.status(201).json({ movimentacao: formatarMovimentacao(movimentacao), epi: formatarEpi(epi) });
});
