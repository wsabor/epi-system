#!/usr/bin/env bash
# Backup do banco do EPI System (pg_dump em formato custom). Agendar no cron da VM (docs/DEPLOY.md).
# Variáveis opcionais: BACKUP_DIR (padrão /var/backups/epi-system) e BACKUP_RETENCAO_DIAS (padrão 30).
set -euo pipefail
cd "$(dirname "$0")/.."

DESTINO="${BACKUP_DIR:-/var/backups/epi-system}"
RETENCAO_DIAS="${BACKUP_RETENCAO_DIAS:-30}"
ARQUIVO="$DESTINO/epi-system-$(date +%Y%m%d-%H%M%S).dump"

mkdir -p "$DESTINO"
umask 077

# Grava num arquivo temporário e só renomeia no fim: um backup interrompido nunca parece completo.
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$ARQUIVO.parcial"
mv "$ARQUIVO.parcial" "$ARQUIVO"

find "$DESTINO" -name 'epi-system-*.dump' -mtime +"$RETENCAO_DIAS" -delete

echo "$(date '+%F %T') backup gravado: $ARQUIVO ($(du -h "$ARQUIVO" | cut -f1))"
