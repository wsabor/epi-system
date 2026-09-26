# Deploy — VM no Proxmox do SENAI

Roteiro para colocar o EPI System no ar numa VM Linux com Docker. Os comandos assumem **Ubuntu Server 24.04** (Debian 12 funciona igual) e o projeto em `/opt/epi-system`.

## 0. Antes de ir ao SENAI

- [ ] **Código no GitHub:** a VM baixa o código do repositório. A branch `refactor/api-postgres` precisa estar no GitHub (push) — ou já mesclada na `main`.
- [ ] **EmailJS** (Account → Security): ligar *Allow EmailJS API for non-browser applications* e *Use Private Key*; anotar a **Private Key**.
- [ ] **EmailJS** (Email Templates): criar o template de redefinição de senha com `{{nome}}`, `{{redefinir_url}}` e `{{validade}}`, destinatário `{{to_email}}`. O de convite continua o mesmo.
- [ ] Decidir o **e-mail que recebe os pedidos de acesso** (`VITE_EMAIL_SOLICITAR_ACESSO`).

## 1. Criar a VM no Proxmox

| Item | Valor |
|---|---|
| SO | Ubuntu Server 24.04 LTS (ou Debian 12) |
| CPU / RAM / disco | 2 vCPU / 2 GB / 20 GB (sobra folga) |
| Rede | **IP fixo** e, se possível, um nome no DNS interno |

LXC também serve, mas precisa de `nesting=1` e `keyctl=1` para o Docker; VM dá menos trabalho.

Durante a instalação, habilite o OpenSSH. Depois:

```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone America/Sao_Paulo
```

## 2. Instalar o Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER     # saia e entre de novo no SSH para valer
docker run --rm hello-world       # deve imprimir "Hello from Docker!"
```

Firewall (só SSH, HTTP e HTTPS):

```bash
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable
```

> O Docker publica portas por fora do `ufw`. Por isso o `docker-compose.yml` só publica o nginx (ou o Caddy): API e banco não têm porta nenhuma.

## 3. Baixar o código

```bash
sudo mkdir -p /opt/epi-system && sudo chown $USER: /opt/epi-system
git clone https://github.com/wsabor/epi-system.git /opt/epi-system
cd /opt/epi-system
git checkout refactor/api-postgres   # até ela ser mesclada na main
```

## 4. Configurar o `.env`

```bash
cp .env.example .env && chmod 600 .env
openssl rand -hex 24          # -> POSTGRES_PASSWORD (só letras e números)
openssl rand -base64 48       # -> JWT_SEGREDO
nano .env
```

Valores de produção (o resto pode ficar como está):

| Variável | Valor |
|---|---|
| `POSTGRES_PASSWORD` | o gerado acima |
| `JWT_SEGREDO` | o gerado acima |
| `APP_URL` | o endereço que as pessoas vão digitar: `http://IP-DA-VM` ou `https://nome` (seção 6) |
| `EMAILJS_*` | os 5 valores da sua conta (seção 0) |
| `VITE_EMAIL_SOLICITAR_ACESSO` | e-mail que recebe pedidos de acesso |
| `ADMIN_INICIAL_*` | seu nome, e-mail e uma senha temporária |

`DATABASE_URL` e `API_PORT` só valem em desenvolvimento — em produção o compose monta a conexão sozinho.

## 5. Subir o sistema

```bash
docker compose up -d --build                       # primeira vez: alguns minutos
docker compose ps                                  # db, api e web devem ficar "healthy"
curl http://localhost/api/health                   # {"status":"ok","banco":"ok"}
docker compose exec api ./node_modules/.bin/prisma db seed   # cria o administrador
```

No navegador, abra `APP_URL`, entre com o admin e **troque a senha** (ícone de chave no topo). Depois **apague a linha `ADMIN_INICIAL_SENHA` do `.env`**.

As migrations do banco rodam sozinhas toda vez que a API sobe.

## 6. HTTPS (fortemente recomendado)

Sem HTTPS, senha e sessão passam em texto aberto na rede. O Caddy já está no `docker-compose.yml`, desligado por padrão. No `.env`:

```bash
COMPOSE_PROFILES=https         # liga o Caddy
WEB_PORTA=127.0.0.1:8080       # o nginx passa a ser acessível só pelo Caddy
COOKIE_SECURE=true
TRUST_PROXY=2                  # Caddy + nginx na frente da API
APP_URL=https://<endereço>
SITE_ENDERECO=<endereço>
```

Escolha conforme o endereço:

| Situação | `SITE_ENDERECO` | `CADDY_TLS` | Certificado |
|---|---|---|---|
| Domínio público apontando para a VM (portas 80/443 acessíveis da internet) | `epi.exemplo.com.br` | vazio | Let's Encrypt, automático |
| Só rede interna, acesso pelo IP | `10.0.0.50` | vazio | CA própria do Caddy |
| Só rede interna, nome no DNS do SENAI | `epi.senai.local` | `tls internal` | CA própria do Caddy |

```bash
docker compose up -d --build
```

**Com CA própria**, cada navegador avisa "conexão não segura" até o certificado raiz do Caddy ser instalado nas máquinas:

```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

Instale o `caddy-root.crt` como *Autoridade de Certificação Raiz Confiável* nos computadores que usam o sistema (a TI pode distribuir por GPO). Até lá, dá para usar clicando em "avançar" no aviso — ainda é criptografado, mas o ideal é instalar.

## 7. Backups

O script faz `pg_dump` e apaga backups com mais de 30 dias:

```bash
sudo mkdir -p /var/backups/epi-system && sudo chown $USER: /var/backups/epi-system
./scripts/backup.sh                         # teste: deve imprimir "backup gravado: ..."
crontab -e
```

Adicione (todo dia às 02:00):

```
0 2 * * * cd /opt/epi-system && ./scripts/backup.sh >> /var/backups/epi-system/backup.log 2>&1
```

Configure também, no Proxmox, um **backup agendado da VM** (Datacenter → Backup), de preferência num storage fora do disco da VM.

**Teste a restauração** pelo menos uma vez (backup que nunca foi restaurado não conta):

```bash
./scripts/restaurar-backup.sh /var/backups/epi-system/epi-system-AAAAMMDD-HHMMSS.dump
```

O script pede confirmação, guarda um backup do estado atual antes, para a API, restaura e sobe a API de novo.

## 8. Checklist final

- [ ] `docker compose ps`: tudo `healthy`
- [ ] Login do admin funcionando e senha inicial trocada; `ADMIN_INICIAL_SENHA` apagada do `.env`
- [ ] HTTPS ativo (cadeado no navegador) e `COOKIE_SECURE=true`
- [ ] Convite enviado para um usuário de teste chega por e-mail e funciona
- [ ] "Esqueci minha senha" chega por e-mail
- [ ] Usuário visualizador não vê botões de cadastro/movimentação
- [ ] Backup manual gerado e cron configurado; backup da VM agendado no Proxmox
- [ ] Sistema antigo tirado do ar: deploy da Vercel e projeto Firebase excluídos
- [ ] Credenciais de demonstração não aparecem mais em lugar nenhum

## Dia a dia

```bash
cd /opt/epi-system
docker compose ps                      # situação dos serviços
docker compose logs -f api             # log da API (Ctrl+C para sair)
docker compose restart api             # reiniciar só a API
```

**Atualizar para uma nova versão:**

```bash
./scripts/backup.sh                    # sempre antes de atualizar
git pull
docker compose up -d --build           # migrations novas rodam sozinhas
```

**Mudou algo no `.env`?** `docker compose up -d` recria o que for preciso. Se foi `VITE_EMAIL_SOLICITAR_ACESSO`, use `docker compose up -d --build` (ela vai para dentro do código do navegador).

**Acesso de fora do SENAI:** se a rede permitir SSH externo (VPN, túnel), boa parte deste roteiro pode ser feita remotamente — combine com a TI.
