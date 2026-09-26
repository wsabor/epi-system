import { z } from "zod";

export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: "Rota não encontrada" });
}

// O Express só reconhece o handler de erro se ele tiver 4 parâmetros.
export function tratarErros(err, req, res, _next) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos",
      campos: z.flattenError(err).fieldErrors,
    });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    erro: status >= 500 ? "Erro interno do servidor" : err.message,
  });
}
