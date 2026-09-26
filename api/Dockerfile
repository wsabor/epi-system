# Node 24: o Prisma 7 gera o client em .ts e o Node 24 executa TypeScript sem etapa de build.
# Alpine: base menor e com menos pacotes do sistema (menos vulnerabilidades para acompanhar).
FROM node:24-alpine

# apk upgrade: pega correções de segurança publicadas depois da imagem base. openssl: exigido pelo Prisma CLI.
RUN apk upgrade --no-cache && apk add --no-cache openssl

ENV NODE_ENV=production \
    PRISMA_HIDE_UPDATE_MESSAGE=1

WORKDIR /app
RUN chown node:node /app
USER node

# Schema e config antes do npm ci: o postinstall roda "prisma generate".
COPY --chown=node:node package.json package-lock.json prisma.config.js ./
COPY --chown=node:node prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node src ./src

# O npm/yarn só servem para instalar: fora da imagem final, levam junto as vulnerabilidades deles.
USER root
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
    /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Aplica migrations pendentes e sobe a API. "exec" faz o Node receber o SIGTERM do "docker stop".
# Seed (sem npm na imagem): docker compose exec api ./node_modules/.bin/prisma db seed
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && exec node src/server.js"]
