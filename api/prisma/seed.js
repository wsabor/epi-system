import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

const nome = process.env.ADMIN_INICIAL_NOME || "Administrador";
const email = process.env.ADMIN_INICIAL_EMAIL?.trim().toLowerCase();
const senha = process.env.ADMIN_INICIAL_SENHA;

if (!email || !senha) {
  console.error("Defina ADMIN_INICIAL_EMAIL e ADMIN_INICIAL_SENHA no .env");
  process.exit(1);
}
if (senha.length < 8) {
  console.error("ADMIN_INICIAL_SENHA precisa ter pelo menos 8 caracteres");
  process.exit(1);
}

const admins = await prisma.usuario.count({ where: { role: "admin" } });

if (admins > 0) {
  console.log("Já existe administrador: nada a fazer.");
} else {
  const admin = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 12),
      departamento: "Administrativo",
      role: "admin",
    },
  });
  await prisma.log.create({
    data: {
      usuarioId: admin.id,
      acao: "USUARIO_CRIAR_SEED",
      entidade: "usuario",
      entidadeId: admin.id,
      detalhes: { email },
    },
  });
  console.log(`Administrador inicial criado: ${email}`);
}

await prisma.$disconnect();
