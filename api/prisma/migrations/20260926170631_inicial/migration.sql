-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'operador', 'visualizador');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('entrada', 'saida', 'ajuste', 'perda');

-- CreateEnum
CREATE TYPE "TipoRelatorio" AS ENUM ('estoque', 'movimentacoes', 'vencimentos', 'dashboard');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "telefone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'visualizador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acesso" TIMESTAMPTZ(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epis" (
    "id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "tamanho" TEXT NOT NULL,
    "tipo_estoque" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "numero_ca" TEXT NOT NULL,
    "data_validade" DATE NOT NULL,
    "valor_unitario" DECIMAL(10,2) NOT NULL,
    "fornecedor" TEXT NOT NULL,
    "quantidade_atual" INTEGER NOT NULL DEFAULT 0,
    "estoque_minimo" INTEGER NOT NULL,
    "dias_aviso_vencimento" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "epis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes" (
    "id" UUID NOT NULL,
    "epi_id" UUID NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "quantidade_anterior" INTEGER NOT NULL,
    "quantidade_nova" INTEGER NOT NULL,
    "responsavel" TEXT NOT NULL,
    "funcionario_recebeu" TEXT,
    "motivo" TEXT NOT NULL,
    "observacoes" TEXT,
    "usuario_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convites" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "telefone" TEXT,
    "role" "Role" NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "usado_em" TIMESTAMPTZ(3),
    "revogado_em" TIMESTAMPTZ(3),
    "criado_por_id" UUID NOT NULL,
    "usuario_id" UUID,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "convites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_redefinicao_senha" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "usado_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_redefinicao_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "acao" TEXT NOT NULL,
    "entidade" TEXT,
    "entidade_id" TEXT,
    "detalhes" JSONB,
    "ip" TEXT,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorios" (
    "id" UUID NOT NULL,
    "tipo" "TipoRelatorio" NOT NULL,
    "filtros" JSONB NOT NULL,
    "dados" JSONB NOT NULL,
    "gerado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relatorios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "epis_ativo_descricao_idx" ON "epis"("ativo", "descricao");

-- CreateIndex
CREATE INDEX "movimentacoes_criado_em_idx" ON "movimentacoes"("criado_em" DESC);

-- CreateIndex
CREATE INDEX "movimentacoes_epi_id_criado_em_idx" ON "movimentacoes"("epi_id", "criado_em" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "convites_token_hash_key" ON "convites"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "convites_usuario_id_key" ON "convites"("usuario_id");

-- CreateIndex
CREATE INDEX "convites_email_idx" ON "convites"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_redefinicao_senha_token_hash_key" ON "tokens_redefinicao_senha"("token_hash");

-- CreateIndex
CREATE INDEX "logs_criado_em_idx" ON "logs"("criado_em" DESC);

-- CreateIndex
CREATE INDEX "logs_usuario_id_criado_em_idx" ON "logs"("usuario_id", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "logs_entidade_entidade_id_idx" ON "logs"("entidade", "entidade_id");

-- CreateIndex
CREATE INDEX "relatorios_criado_em_idx" ON "relatorios"("criado_em" DESC);

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_epi_id_fkey" FOREIGN KEY ("epi_id") REFERENCES "epis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes" ADD CONSTRAINT "movimentacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convites" ADD CONSTRAINT "convites_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_redefinicao_senha" ADD CONSTRAINT "tokens_redefinicao_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_gerado_por_id_fkey" FOREIGN KEY ("gerado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ===== Regras de integridade que o schema do Prisma não expressa (escritas à mão) =====

ALTER TABLE "usuarios"
  ADD CONSTRAINT "usuarios_email_minusculo" CHECK ("email" = lower("email"));

ALTER TABLE "epis"
  ADD CONSTRAINT "epis_quantidade_atual_nao_negativa" CHECK ("quantidade_atual" >= 0),
  ADD CONSTRAINT "epis_estoque_minimo_nao_negativo" CHECK ("estoque_minimo" >= 0),
  ADD CONSTRAINT "epis_dias_aviso_nao_negativo" CHECK ("dias_aviso_vencimento" >= 0),
  ADD CONSTRAINT "epis_valor_unitario_nao_negativo" CHECK ("valor_unitario" >= 0);

-- No ajuste, "quantidade" é o novo saldo contado e pode ser 0; nos demais tipos precisa ser positiva.
-- O saldo novo precisa bater com o tipo; junto com quantidade_nova >= 0, saída maior que o estoque é recusada.
ALTER TABLE "movimentacoes"
  ADD CONSTRAINT "movimentacoes_quantidade_valida" CHECK ("quantidade" > 0 OR ("tipo" = 'ajuste' AND "quantidade" >= 0)),
  ADD CONSTRAINT "movimentacoes_quantidade_anterior_nao_negativa" CHECK ("quantidade_anterior" >= 0),
  ADD CONSTRAINT "movimentacoes_quantidade_nova_nao_negativa" CHECK ("quantidade_nova" >= 0),
  ADD CONSTRAINT "movimentacoes_saldo_coerente" CHECK ("quantidade_nova" = CASE "tipo"
    WHEN 'entrada' THEN "quantidade_anterior" + "quantidade"
    WHEN 'ajuste' THEN "quantidade"
    ELSE "quantidade_anterior" - "quantidade"
  END),
  ADD CONSTRAINT "movimentacoes_funcionario_so_em_saida" CHECK ("tipo" = 'saida' OR "funcionario_recebeu" IS NULL);

ALTER TABLE "convites"
  ADD CONSTRAINT "convites_expira_depois_de_criado" CHECK ("expira_em" > "criado_em");

-- Histórico imutável: nem a API nem SQL direto conseguem alterar/apagar movimentações e logs.
-- Para uma correção excepcional, um DBA precisa desligar o trigger de forma explícita.
CREATE FUNCTION "impedir_alteracao_historico"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Registros de % são imutáveis (% não permitido)', TG_TABLE_NAME, TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "movimentacoes_imutaveis"
  BEFORE UPDATE OR DELETE ON "movimentacoes"
  FOR EACH ROW EXECUTE FUNCTION "impedir_alteracao_historico"();

CREATE TRIGGER "logs_imutaveis"
  BEFORE UPDATE OR DELETE ON "logs"
  FOR EACH ROW EXECUTE FUNCTION "impedir_alteracao_historico"();
