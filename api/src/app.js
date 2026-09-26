import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { healthRouter } from "./routes/health.js";
import { rotaNaoEncontrada, tratarErros } from "./middlewares/erros.js";

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
