import { app } from "./app.js";
import { prisma } from "./db.js";

const porta = Number(process.env.API_PORT) || 3000;

const server = app.listen(porta, () => {
  console.log(`API ouvindo em http://localhost:${porta}`);
});

// O Docker envia SIGTERM ao parar o container: fecha conexões antes de sair.
for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
