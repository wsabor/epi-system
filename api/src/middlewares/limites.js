import { rateLimit } from "express-rate-limit";

const QUINZE_MINUTOS = 15 * 60 * 1000;

// Só respostas de erro contam: se muitos usuários chegarem pelo mesmo IP (proxy da rede),
// quem acerta não esgota o limite de ninguém.
export function limitarFalhas(limit) {
  return rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { erro: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
  });
}

// Conta todas as chamadas: para rotas em que cada chamada tem custo (ex.: envia e-mail).
export function limitarChamadas(limit) {
  return rateLimit({
    windowMs: QUINZE_MINUTOS,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { erro: "Muitas solicitações. Aguarde 15 minutos e tente novamente." },
  });
}
