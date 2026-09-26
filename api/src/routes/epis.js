import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { CATEGORIAS, MOTIVO_ESTOQUE_INICIAL, TIPOS_ESTOQUE, tamanhosDaCategoria } from "../dominio.js";
import { permitir } from "../middlewares/autenticar.js";
import { ErroHttp } from "../middlewares/erros.js";
import { registrarLog } from "../services/auditoria.js";
import { esquemaId, esquemaStatusAtivo, filtroAtivo } from "../services/consultas.js";
import { diferencas, formatarEpi } from "../services/formatar.js";

const texto = (max) => z.string().trim().min(1, "Obrigatório").max(max);

// Campos editáveis. A quantidade NÃO está aqui: estoque só muda por movimentação.
const esquemaEpi = z
  .object({
    descricao: texto(200),
    categoria: z.enum(CATEGORIAS, "Categoria inválida"),
    tamanho: texto(20),
    tipoEstoque: z.enum(TIPOS_ESTOQUE, "Unidade inválida"),
    marca: texto(100),
    numeroCA: texto(20),
    dataValidade: z.iso.date("Data inválida (use AAAA-MM-DD)"),
    valorUnitario: z.number().nonnegative().max(99_999_999.99),
    fornecedor: texto(150),
    estoqueMinimo: z.number().int().nonnegative(),
    diasAvisoVencimento: z.number().int().nonnegative().max(3650),
  })
  .refine((epi) => tamanhosDaCategoria(epi.categoria).includes(epi.tamanho), {
    path: ["tamanho"],
    message: "Tamanho inválido para a categoria",
  });

const CAMPOS_EDITAVEIS = [
  "descricao",
  "categoria",
  "tamanho",
  "tipoEstoque",
  "marca",
  "numeroCA",
  "dataValidade",
  "valorUnitario",
  "fornecedor",
  "estoqueMinimo",
  "diasAvisoVencimento",
];

const paraBanco = (dados) => ({ ...dados, dataValidade: new Date(dados.dataValidade) });

async function buscarEpi(id) {
  const epi = await prisma.epi.findUnique({ where: { id } });
  if (!epi) throw new ErroHttp(404, "EPI não encontrado");
  return epi;
}

export const episRouter = Router();

episRouter.get("/", permitir("epis:ver"), async (req, res) => {
  const { status } = z.object({ status: esquemaStatusAtivo.default("ativos") }).parse(req.query);
  const epis = await prisma.epi.findMany({
    where: { ativo: filtroAtivo(status) },
    orderBy: { descricao: "asc" },
  });
  res.json(epis.map(formatarEpi));
});

episRouter.get("/:id", permitir("epis:ver"), async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  res.json(formatarEpi(await buscarEpi(id)));
});

episRouter.post("/", permitir("epis:criar"), async (req, res) => {
  const dados = esquemaEpi.parse(req.body);
  const { quantidadeInicial } = z
    .object({ quantidadeInicial: z.number().int().nonnegative().max(1_000_000).default(0) })
    .parse(req.body);

  const epi = await prisma.$transaction(async (tx) => {
    const criado = await tx.epi.create({
      data: { ...paraBanco(dados), quantidadeAtual: quantidadeInicial },
    });
    // O saldo inicial também fica no histórico, como uma entrada.
    if (quantidadeInicial > 0) {
      await tx.movimentacao.create({
        data: {
          epiId: criado.id,
          tipo: "entrada",
          quantidade: quantidadeInicial,
          quantidadeAnterior: 0,
          quantidadeNova: quantidadeInicial,
          responsavel: req.usuario.nome,
          motivo: MOTIVO_ESTOQUE_INICIAL,
          usuarioId: req.usuario.id,
        },
      });
    }
    await registrarLog(
      req,
      { acao: "EPI_CRIAR", entidade: "epi", entidadeId: criado.id, detalhes: { ...dados, quantidadeInicial } },
      tx,
    );
    return criado;
  });

  res.status(201).json(formatarEpi(epi));
});

episRouter.put("/:id", permitir("epis:editar"), async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  const dados = esquemaEpi.parse(req.body);
  const antes = formatarEpi(await buscarEpi(id));

  const epi = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.epi.update({ where: { id }, data: paraBanco(dados) });
    const mudancas = diferencas(antes, formatarEpi(atualizado), CAMPOS_EDITAVEIS);
    if (mudancas) {
      await registrarLog(
        req,
        { acao: "EPI_EDITAR", entidade: "epi", entidadeId: id, detalhes: { descricao: antes.descricao, ...mudancas } },
        tx,
      );
    }
    return atualizado;
  });

  res.json(formatarEpi(epi));
});

episRouter.patch("/:id/ativo", permitir("epis:ativar"), async (req, res) => {
  const { id } = esquemaId.parse(req.params);
  const { ativo } = z.object({ ativo: z.boolean() }).parse(req.body);
  const atual = await buscarEpi(id);
  if (atual.ativo === ativo) return res.json(formatarEpi(atual));

  const epi = await prisma.$transaction(async (tx) => {
    const atualizado = await tx.epi.update({ where: { id }, data: { ativo } });
    await registrarLog(
      req,
      { acao: ativo ? "EPI_REATIVAR" : "EPI_DESATIVAR", entidade: "epi", entidadeId: id, detalhes: { descricao: atual.descricao } },
      tx,
    );
    return atualizado;
  });

  res.json(formatarEpi(epi));
});
