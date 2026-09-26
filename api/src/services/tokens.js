import { createHash, randomBytes } from "node:crypto";

// O token vai só no link enviado; o banco guarda apenas o hash, então um vazamento do banco não expõe links válidos.
export function gerarToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
