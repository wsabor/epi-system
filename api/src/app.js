import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { autenticar, permitir } from "./middlewares/autenticar.js";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/erros.js";
import { authRouter } from "./routes/auth.js";
import { convitesRouter } from "./routes/convites.js";
import { episRouter } from "./routes/epis.js";
import { healthRouter } from "./routes/health.js";
import { logsRouter } from "./routes/logs.js";
import { movimentacoesRouter } from "./routes/movimentacoes.js";
import { opcoesRouter } from "./routes/opcoes.js";
import { usuariosRouter } from "./routes/usuarios.js";

export const app = express();

// Um proxy na frente (nginx em produção, Vite em dev): o IP real do cliente vem no X-Forwarded-For.
// Confiar só em 1 salto impede que o cliente forje o IP mandando o próprio cabeçalho.
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/convites", convitesRouter); // tem rotas públicas (aceitar convite) e de admin

app.use("/api/opcoes", autenticar, opcoesRouter);
app.use("/api/epis", autenticar, episRouter);
app.use("/api/movimentacoes", autenticar, movimentacoesRouter);
app.use("/api/usuarios", autenticar, permitir("usuarios:gerir"), usuariosRouter);
app.use("/api/logs", autenticar, permitir("auditoria:ver"), logsRouter);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
