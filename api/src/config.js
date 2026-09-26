import { z } from "zod";

const producao = process.env.NODE_ENV === "production";
const emProducao = (schema) => (producao ? schema : schema.optional());
const obrigatorio = { error: "obrigatório" };

const esquema = z.object({
  DATABASE_URL: z.string(obrigatorio),
  API_PORT: z.coerce.number().int().positive().default(3000),
  JWT_SEGREDO: z.string(obrigatorio).min(32, "precisa ter pelo menos 32 caracteres"),
  COOKIE_SECURE: z.enum(["true", "false"]).default("false").transform((v) => v === "true"),
  APP_URL: z.url({ error: "obrigatório (URL completa, ex.: http://localhost:5173)" }),
  EMAILJS_SERVICE_ID: emProducao(z.string(obrigatorio)),
  EMAILJS_PUBLIC_KEY: emProducao(z.string(obrigatorio)),
  EMAILJS_PRIVATE_KEY: emProducao(z.string(obrigatorio)),
  EMAILJS_TEMPLATE_CONVITE: emProducao(z.string(obrigatorio)),
  EMAILJS_TEMPLATE_REDEFINIR_SENHA: emProducao(z.string(obrigatorio)),
});

// "VAR=" no .env chega como texto vazio: tratar como não definida.
const env = Object.fromEntries(Object.entries(process.env).filter(([, valor]) => valor !== ""));
const resultado = esquema.safeParse(env);

if (!resultado.success) {
  console.error("Configuração inválida no .env:");
  for (const [campo, erros] of Object.entries(z.flattenError(resultado.error).fieldErrors)) {
    console.error(`  ${campo}: ${erros.join(", ")}`);
  }
  process.exit(1);
}

export const config = { ...resultado.data, producao };
