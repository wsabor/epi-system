# Frontend: build do Vite e arquivos estáticos servidos pelo nginx (que também encaminha /api).

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Variáveis VITE_ entram no código do navegador na hora do build (mudou? docker compose build web).
ARG VITE_EMAIL_SOLICITAR_ACESSO
ENV VITE_EMAIL_SOLICITAR_ACESSO=$VITE_EMAIL_SOLICITAR_ACESSO
RUN npm run build

FROM nginx:1.29-alpine
# Correções de segurança publicadas depois da imagem base; curl não é usado pelo nginx.
RUN apk upgrade --no-cache && apk del --no-cache curl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
