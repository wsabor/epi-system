#!/usr/bin/env bash
# Restaura um backup gerado por scripts/backup.sh. SUBSTITUI todos os dados atuais do banco.
# Uso: scripts/restaurar-backup.sh /var/backups/epi-system/epi-system-AAAAMMDD-HHMMSS.dump
set -euo pipefail
cd "$(dirname "$0")/.."

ARQUIVO="${1:?informe o arquivo .dump a restaurar}"
[ -f "$ARQUIVO" ] || { echo "Arquivo não encontrado: $ARQUIVO"; exit 1; }

echo "ATENÇÃO: todos os dados atuais serão substituídos pelo backup $ARQUIVO"
if [ "${CONFIRMAR:-}" != "RESTAURAR" ]; then
  read -r -p "Digite RESTAURAR para continuar: " resposta
  [ "$resposta" = "RESTAURAR" ] || { echo "Cancelado."; exit 1; }
fi

# Guarda o estado atual antes de sobrescrever (caso o backup escolhido seja o errado).
BACKUP_DIR="${BACKUP_DIR:-/var/backups/epi-system}" ./scripts/backup.sh

# API parada durante a restauração: ninguém grava no meio do processo.
docker compose stop api
docker compose exec -T db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --single-transaction' \
  < "$ARQUIVO"
docker compose start api

echo "Restauração concluída a partir de $ARQUIVO"
