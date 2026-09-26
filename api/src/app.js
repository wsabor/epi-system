import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/erros.js";

export const app = express();

// Um proxy na frente (nginx em produção, Vite em dev): o IP real do cliente vem no X-Forwarded-For.
// Confiar só em 1 salto impede que o cliente forje o IP mandando o próprio cabeçalho.
app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
