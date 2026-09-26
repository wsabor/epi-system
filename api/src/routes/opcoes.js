import { Router } from "express";
import {
  CATEGORIAS,
  DEPARTAMENTOS,
  MOTIVOS_POR_TIPO,
  ROLES,
  TIPOS_ESTOQUE,
  tamanhosDaCategoria,
} from "../dominio.js";

export const opcoesRouter = Router();

opcoesRouter.get("/", (req, res) => {
  res.json({
    categorias: CATEGORIAS,
    tamanhosPorCategoria: Object.fromEntries(CATEGORIAS.map((c) => [c, tamanhosDaCategoria(c)])),
    tiposEstoque: TIPOS_ESTOQUE,
    departamentos: DEPARTAMENTOS,
    motivosPorTipo: MOTIVOS_POR_TIPO,
    roles: ROLES,
  });
});
