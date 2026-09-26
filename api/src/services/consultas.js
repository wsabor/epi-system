import { z } from "zod";

// O SENAI está em Brasília (UTC-3, sem horário de verão desde 2019).
const FUSO = "-03:00";

export const esquemaId = z.object({ id: z.uuid("Identificador inválido") });

export const esquemaPaginacao = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  // Teto alto: no go-live os relatórios ainda são calculados no navegador a partir desta lista.
  porPagina: z.coerce.number().int().min(1).max(5000).default(50),
});

export const esquemaPeriodo = z.object({
  de: z.iso.date().optional(),
  ate: z.iso.date().optional(),
});

// Filtro Prisma para "criadoEm" entre dois dias (inclusive), no horário local.
export function filtroPeriodo({ de, ate }) {
  if (!de && !ate) return undefined;
  const filtro = {};
  if (de) filtro.gte = new Date(`${de}T00:00:00${FUSO}`);
  if (ate) {
    const fim = new Date(`${ate}T00:00:00${FUSO}`);
    fim.setUTCDate(fim.getUTCDate() + 1);
    filtro.lt = fim;
  }
  return filtro;
}

export function paginar({ pagina, porPagina }) {
  return { skip: (pagina - 1) * porPagina, take: porPagina };
}

export function respostaPaginada(itens, total, { pagina, porPagina }) {
  return { itens, total, pagina, porPagina, totalPaginas: Math.ceil(total / porPagina) };
}

export const esquemaStatusAtivo = z.enum(["ativos", "inativos", "todos"]);

export function filtroAtivo(status) {
  if (status === "ativos") return true;
  if (status === "inativos") return false;
  return undefined;
}
