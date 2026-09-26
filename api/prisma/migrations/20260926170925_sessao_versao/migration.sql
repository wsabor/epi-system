-- Incrementar derruba todas as sessões abertas do usuário (troca/redefinição de senha).
ALTER TABLE "usuarios" ADD COLUMN "sessao_versao" INTEGER NOT NULL DEFAULT 0;
