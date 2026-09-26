# Roadmap — Migração Firebase → API própria (Node + PostgreSQL) + Docker

> Documento de trabalho da refatoração, versionado junto com o código. Marque os itens conforme forem concluídos.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Backend | API própria em **Node.js (Express 5)**, validação com **Zod** |
| Banco | **PostgreSQL**, acesso e migrations via **Prisma** |
| Autenticação | Própria: senha com **bcrypt**, sessão em **JWT num cookie httpOnly** |
| Tempo real | Não no dia 1: *fetch + refetch após cada ação* |
| Cadastro | **Somente por convite.** A tela de registro sai; no login fica um link `mailto:` para pedir convite |
| E-mail | **EmailJS mantido**, mas chamado **pelo servidor** (credenciais saem do bundle do navegador) |
| Exclusão | **Nada com histórico é excluído.** EPIs e usuários são **inativados**; movimentações são **imutáveis** (erro se corrige com nova movimentação de `ajuste`) |
| Configuração | **Um único `.env` na raiz** alimenta Vite (dev), API e `docker-compose` |
| Deploy | VM Linux (Ubuntu Server/Debian) com Docker no **Proxmox do SENAI**, administrada pelo Wagner (acesso só presencial no SENAI) |
| Google OAuth | Removido (código morto hoje) |
| Dados | **Sistema novo.** O Firebase só tem dados de teste: nada é migrado e não há compatibilidade com legado a manter. Go-live: **28/09/2026** |

## Arquitetura alvo

```
Navegador ──► web (nginx: serve o build do Vite + proxy /api) ──► api (Node/Express) ──► db (PostgreSQL)
                                                                        └──► EmailJS (REST)
```

- Três containers, uma rede Docker, só a porta do `web` exposta.
- Front e API na mesma origem (`/api` via proxy): cookie de sessão simples, sem CORS.
- Estrutura do repositório: o frontend continua na raiz (menos churn); a API entra em `api/`; `docker-compose.yml` na raiz.

```
epi-system/
├── src/                 # frontend React (existente)
├── api/
│   ├── prisma/          # schema.prisma + migrations
│   ├── src/
│   │   ├── routes/      # auth, epis, movimentacoes, usuarios, convites, logs
│   │   ├── middlewares/ # autenticação, permissão, auditoria, erros
│   │   └── services/    # regra de negócio (ex.: movimentação transacional)
│   └── Dockerfile
├── Dockerfile           # frontend (build Vite → nginx)
├── nginx.conf
└── docker-compose.yml
```

## Problemas do sistema atual que a migração corrige

Cada item tem uma fase responsável; nenhum deve ser "portado" como está.

| # | Problema | Onde | Fase |
|---|---|---|---|
| 1 | Movimentação grava histórico e estoque em 2 operações separadas, com quantidade vinda do navegador (condição de corrida) | [App.jsx:80-127](../src/App.jsx#L80-L127) | 4 |
| 2 | Permissões só no cliente; `PermissionsContext`/`ProtectedAction` são código morto; regras reais são `if` soltos | [App.jsx:147-150](../src/App.jsx#L147-L150) | 0, 3, 5 |
| 3 | Usuário com `ativo: false` continua logando | [AuthContext.jsx:83-122](../src/contexts/AuthContext.jsx#L83-L122) | 3 |
| 4 | Usuário excluído que loga tem o perfil recriado como visualizador | [AuthContext.jsx:155-167](../src/contexts/AuthContext.jsx#L155-L167) | 3 |
| 5 | "Criar usuário" do admin gera perfil sem conta de login | [Usuarios.jsx:144](../src/components/pages/Usuarios/Usuarios.jsx#L144) | 4, 5 |
| 6 | Token de convite com `Math.random` gerado no navegador; convites legíveis sem login | [ConviteUsuarioModal.jsx:30](../src/components/modals/ConviteUsuarioModal.jsx#L30) | 4 |
| 7 | Auditoria gravada pelo cliente, só cobre gestão de usuários, IP fixo `192.168.1.100` | [useLogs.js:61](../src/hooks/useLogs.js#L61) | 4 |
| 8 | Credenciais do EmailJS no código do frontend | [emailService.js](../src/services/emailService.js) | 4 |
| 9 | Cadastro aberto para qualquer um que acesse a URL | [Register.jsx](../src/components/auth/Register.jsx) | 5 |
| 10 | EPI é excluído de verdade, deixando movimentações apontando para um EPI que não existe mais | [epiServices.js:107-115](../src/services/epiServices.js#L107-L115) | 2, 4 |
| 11 | Formulário de edição do EPI altera a quantidade direto, sem movimentação (saldo sem explicação no histórico) | [EPIModal.jsx:99](../src/components/modals/EPIModal.jsx#L99) | 4, 5 |

---

## Fase 0 — Preparação e decisões pendentes

- [x] Criar a branch `refactor/api-postgres` (a `main` fica intacta como backup até o corte)
- [ ] Levantar volume de dados por coleção no Firestore (`epis`, `movimentacoes`, `usuarios`, `logs`, `convites`)
- [x] Matriz de permissões (fonte única da verdade, aplicada na API):

  | Ação | admin | operador | visualizador |
  |---|---|---|---|
  | Ver dashboard, EPIs, movimentações | ✔ | ✔ | ✔ |
  | Criar/editar EPI | ✔ | ✔ | — |
  | **Ativar/desativar EPI** | ✔ | — | — |
  | Excluir EPI | — (não existe) | — | — |
  | Registrar movimentação | ✔ | ✔ | — |
  | Editar/excluir movimentação | — (não existe) | — | — |
  | Gerar relatório (fica salvo) | ✔ | ✔ | — |
  | Exportar relatório (PDF/Excel) | ✔ | ✔ | — |
  | Ver relatórios já gerados (só na tela) | ✔ | ✔ | ✔ |
  | Convidar usuários, editar, ativar/desativar usuário | ✔ | — | — |
  | Excluir usuário | — (não existe) | — | — |
  | Ver auditoria | ✔ | — | — |

- [x] Visualizador não gera nem exporta relatório: só vê, na tela, relatórios já gerados por admin/operador. **Isso é funcionalidade nova** — hoje o relatório é calculado na hora e não fica salvo (ver `Relatorio` na Fase 2)
- [ ] EmailJS: ativar "API for non-browser applications" na conta, gerar a *private key* e criar um segundo template (redefinição de senha)
- [x] Endereço do `mailto:` de solicitação de convite: variável `VITE_EMAIL_SOLICITAR_ACESSO` no `.env` (placeholder até definir o responsável)

**Na VM (segunda-feira, 28/09, presencial no SENAI):**

- [ ] Criar VM no Proxmox — Ubuntu Server 24.04 ou Debian 12, 2 vCPU / 2 GB RAM / 20 GB disco é folgado. (LXC também serve, mas precisa de `nesting` e `keyctl` ligados para o Docker; VM dá menos dor de cabeça)
- [ ] IP fixo + nome DNS interno (o link do convite e o QR Code dependem de um endereço estável)
- [ ] Instalar Docker Engine + plugin Compose e testar com `docker run hello-world`
- [ ] Liberar acesso SSH para conseguir trabalhar na VM de fora do SENAI (se a rede permitir: VPN, túnel ou similar) — senão, cada deploy depende de ir presencialmente
- [ ] Verificar HTTPS: há certificado/proxy na borda da rede, ou será com certificado próprio na VM (Caddy)?

## Fase 1 — Esqueleto da API e ambiente de desenvolvimento

- [x] `api/` com Express 5, Zod, Prisma 7 (+ `@prisma/adapter-pg`), `cookie-parser`, `helmet` — `bcryptjs` entrou na Fase 2 (seed), `jsonwebtoken` entra na Fase 3
- [x] `docker-compose.dev.yml` só com o PostgreSQL 18 (API e Vite rodam na máquina com hot reload)
- [x] Proxy `/api` no [vite.config.js](../vite.config.js) para o dev (porta lida do `.env`)
- [x] **Um único `.env` na raiz** (+ [.env.example](../.env.example) versionado): o Vite lê direto; a API carrega com `node --env-file=../.env`; o Prisma CLI carrega em [api/prisma.config.js](../api/prisma.config.js); o `docker-compose` usa o mesmo arquivo
- [x] `.env.example` com `VITE_EMAIL_SOLICITAR_ACESSO=solicitar-acesso@exemplo.com` como placeholder
- [x] Rota `GET /api/health`: `200 {status:"ok",banco:"ok"}`, ou `503` se o banco cair (a API continua no ar e se recupera sozinha)
- [x] Encerramento limpo em `SIGTERM` (necessário para o `docker stop`)
- [x] ESLint da raiz com bloco Node para `api/` e `vite.config.js`

**Notas técnicas da Fase 1**

- **Node 24 é obrigatório** (inclusive na imagem Docker da Fase 6): o Prisma 7 gera o client em `.ts` e o Node 24 executa TypeScript nativamente, sem etapa de build.
- O pacote `prisma` no npm está com a tag `latest` apontando para uma *release candidate* (8.0.0-rc). Fixamos em `^7.10.0`; ao atualizar, conferir a versão.
- `npm audit` acusa 4 alertas "high", todos dentro do **CLI** do Prisma (`mysql2`, que não usamos, e `deepmerge-ts`, que só lê nosso próprio config). Nada disso roda em produção. A correção sugerida pelo npm rebaixa para o Prisma 6: **não aplicar**. Reavaliar a cada atualização do Prisma.
- O npm 11 bloqueia scripts de instalação: os do Prisma estão liberados em `allowScripts` no [api/package.json](../api/package.json), presos à versão exata. Ao atualizar o Prisma, rodar `npm approve-scripts prisma @prisma/engines` de novo.
- Lint do frontend tem 14 problemas **anteriores** à migração (em `src/`); somem com a reescrita da Fase 5.

**Como rodar em desenvolvimento**

```bash
cp .env.example .env                                  # só na primeira vez
docker compose -f docker-compose.dev.yml up -d --wait # banco
cd api && npm install                                 # também gera o Prisma Client
npm run db:migrate && npm run db:seed                 # tabelas + admin inicial
npm run dev                                           # API em http://localhost:3000 (terminal 1)
npm run dev                                           # frontend em http://localhost:5173 (terminal 2, na raiz)
```

Teste: `curl localhost:5173/api/health` → `{"status":"ok","banco":"ok"}`

## Fase 2 — Modelo de dados (Prisma)

Schema em [api/prisma/schema.prisma](../api/prisma/schema.prisma). IDs `uuid` v7 (ordenados por tempo), datas `timestamptz`, dinheiro `Decimal(10,2)`, tabelas e colunas em `snake_case` no banco.

- [x] `Usuario` (`usuarios`): nome, email (único), senhaHash (obrigatório), departamento, telefone, role, ativo, criadoEm, ultimoAcesso
- [x] `Epi` (`epis`) com os campos **reais** do [EPIModal.jsx](../src/components/modals/EPIModal.jsx): descricao, categoria, tamanho, tipoEstoque (unidade), marca, numeroCA, dataValidade (`date`), valorUnitario, fornecedor, quantidadeAtual, estoqueMinimo, diasAvisoVencimento, **ativo**
- [x] `Movimentacao` (`movimentacoes`): epi, tipo, quantidade, quantidadeAnterior, **quantidadeNova**, responsavel, funcionarioRecebeu (só saída), motivo, observacoes, usuario (quem registrou). O campo duplicado `epiDescricao` do Firestore **não** foi mantido: vem pela relação
- [x] `Convite` (`convites`): tokenHash, dados do convidado, role, expiraEm, usadoEm, **revogadoEm**, criadoPor, usuario (conta criada)
- [x] `TokenRedefinicaoSenha` (`tokens_redefinicao_senha`)
- [x] `Log` (`logs`): usuario (opcional), acao, entidade, entidadeId, detalhes (`Json`), ip
- [x] `Relatorio` (`relatorios`): tipo, filtros (`Json`), dados (`Json`, retrato congelado), geradoPor
- [x] Migration `inicial` aplicada; seed (`npm run db:seed`) cria o primeiro admin a partir do `.env` **só se não houver nenhum admin** — pode rodar quantas vezes quiser
- [x] Todas as FKs com `ON DELETE RESTRICT` (#10)
- [x] Regras escritas à mão no fim da migration (o Prisma não as expressa, mas também não tenta desfazê-las — verificado):
  - `CHECK` de não-negativos em estoque, estoque mínimo, dias de aviso, valor e quantidades
  - `CHECK` de quantidade > 0, exceto no ajuste (que pode zerar o saldo)
  - `CHECK` de **saldo coerente**: `quantidadeNova` = anterior + quantidade (entrada), anterior − quantidade (saída/perda) ou quantidade (ajuste). Com o não-negativo, saída maior que o estoque é recusada pelo próprio banco
  - `CHECK` de "funcionário que recebeu" só em saída
  - `CHECK` de e-mail sempre em minúsculas
  - **Triggers** que recusam `UPDATE`/`DELETE` em `movimentacoes` e `logs` — histórico imutável mesmo via SQL direto
- [x] Testado com SQL puro (fora da API): todas as operações proibidas foram recusadas (apagar com histórico, alterar movimentação/log, estoque negativo, e-mail com maiúscula, usuário sem senha, saldo incoerente, saída maior que o estoque) e as válidas aceitas (entrada, ajuste, ajuste para zero)

**Notas técnicas da Fase 2**

- Categorias, unidades (`tipoEstoque`), departamentos e motivos continuam como **texto**, validados pela API (Fase 4) contra listas no código. Transformar em tabelas administráveis fica para depois, se necessário.
- `bcryptjs` (JavaScript puro) em vez de `bcrypt` (nativo): sem compilação na imagem Docker e sem liberar scripts de instalação. Custo 12.
- O `migrate dev` do Prisma 7 já regenera o client; o seed **não** roda sozinho (`npm run db:seed`).
- Para uma correção excepcional em movimentação/log, um DBA precisa desligar o trigger explicitamente (`ALTER TABLE ... DISABLE TRIGGER ...`) — fica visível e deliberado.

## Fase 3 — Autenticação e autorização na API

- [x] `POST /api/auth/login` — e-mail sem diferenciar maiúsculas; rejeita usuário inativo (403, #3); atualiza `ultimoAcesso`; mesma mensagem para e-mail inexistente e senha errada (e mesmo tempo de resposta)
- [x] `POST /api/auth/logout`, `GET /api/auth/me` (perfil **e** lista de permissões)
- [x] `POST /api/auth/alterar-senha` (logado; derruba as outras sessões e renova o cookie desta)
- [x] `POST /api/auth/esqueci-senha` → token de 256 bits, banco guarda só o hash, validade 1 h, pedido novo invalida links anteriores; resposta idêntica exista ou não o e-mail
- [x] `POST /api/auth/redefinir-senha` → link de uso único (atômico, mesmo com pedidos simultâneos); derruba todas as sessões
- [x] Sessão: JWT HS256 em cookie `epi_sessao` (`HttpOnly`, `SameSite=Strict`, `Path=/api`, 8 h; `Secure` via `COOKIE_SECURE`)
- [x] Middleware `autenticar`: recarrega o usuário do banco a cada request; inativo ou `sessaoVersao` diferente → 401 na hora (#3, #4)
- [x] Middleware `permitir("epis:ativar")` lendo **uma única** matriz em [api/src/permissoes.js](../api/src/permissoes.js) (#2)
- [x] Limite por IP: login e redefinição contam **só falhas** (10 / 15 min — proxy compartilhado não trava quem acerta a senha); esqueci-senha conta tudo (5 / 15 min)
- [x] Auditoria de `LOGIN`, `LOGIN_FALHA`, `LOGIN_BLOQUEADO_INATIVO`, `SENHA_ALTERAR`, `SENHA_REDEFINICAO_SOLICITAR`, `SENHA_REDEFINIR`, com IP
- [x] [api/src/config.js](../api/src/config.js) valida o `.env` na partida e diz o que falta; em produção (`NODE_ENV=production`) exige o EmailJS
- [x] Senha: mínimo 8, máximo 72 caracteres (limite do bcrypt)
- [x] Testado de ponta a ponta com `curl`: 22 cenários (sessão, troca e redefinição de senha, reuso de link, usuário desativado, logout) + limite de tentativas + 14 casos da matriz de permissões

**Notas técnicas da Fase 3**

- Campo novo `usuarios.sessao_versao` (migration própria): vai no token; incrementar derruba todas as sessões do usuário. Usado em troca/redefinição de senha — e será usado ao desativar usuário e mudar role (Fase 4).
- `trust proxy = 1`: a API confia em exatamente um proxy (nginx em produção, Vite em dev). A porta da API **não pode** ficar exposta direto na rede, senão o cliente forja o IP pelo `X-Forwarded-For` (Fase 6 já prevê isso).
- Sem EmailJS configurado (dev), o e-mail sai no console da API com o link — dá para testar a redefinição sem enviar nada.
- Banco local de desenvolvimento passou a ser `epi_dev` (o antigo `epi_system` do container ficou com a migration descartada; pode ser apagado com `docker compose -f docker-compose.dev.yml exec db dropdb -U epi epi_system`). Quem clonar do zero usa o nome do `.env.example` normalmente.

## Fase 4 — Rotas de domínio

- [x] `GET /api/opcoes`: categorias, tamanhos por categoria, unidades, departamentos, motivos por tipo e funções — **fonte única** em [api/src/dominio.js](../api/src/dominio.js); o frontend deixa de repetir essas listas
- [x] `epis`: listar (`?status=ativos|inativos|todos`, padrão ativos), detalhar, criar, editar; `PATCH /api/epis/:id/ativo` só admin. **Sem rota de exclusão** (#10)
  - Cadastro com `quantidadeInicial` gera automaticamente uma entrada "Estoque inicial (cadastro do EPI)" — todo saldo tem explicação no histórico
  - Edição **não** altera a quantidade (campo ignorado): estoque só muda por movimentação (#11)
  - Tamanho validado contra a categoria
- [x] `movimentacoes`: listar paginado com filtros (`epiId`, `tipo`, `busca`, `de`/`ate` no horário de Brasília); **criar em transação com `SELECT ... FOR UPDATE`** — saldo calculado no servidor; saída maior que o estoque → 409 (#1); EPI desativado → 409. **Sem edição/exclusão**
  - Motivo validado contra o tipo; "Outros" exige descrição; "Entrega para funcionário" exige quem recebeu (registro de entrega de EPI); quem recebeu só é gravado em saídas
- [x] `usuarios` (admin): listar, editar (nome, departamento, telefone, função), ativar/desativar. **Sem exclusão e sem "criar" direto** (#5). Admin não desativa a si mesmo nem muda a própria função — com isso o sistema nunca fica sem admin ativo. Desativar incrementa `sessaoVersao` (reativar não ressuscita tokens antigos)
- [x] `convites` (admin): criar (token de 256 bits, só o hash no banco, validade 7 dias, e-mail pelo servidor — #6, #8), listar com status, revogar. Convite novo para o mesmo e-mail revoga o pendente. Se o e-mail falhar, o convite vale e a resposta traz o link (para QR Code)
- [x] `convites` (público): `GET /api/convites/aceitar/:token` (só nome/e-mail/departamento/função); `POST /api/convites/aceitar/:token` cria a conta de forma atômica e **já entra logado**
- [x] Auditoria no servidor para toda escrita, **na mesma transação** da operação, com IP real; edições guardam só os campos alterados (antes → depois) (#7)
- [x] `logs` (admin): paginado, filtros por usuário, ação, entidade, período — no banco (#7)
- [ ] ~~`relatorios` salvos~~ → **adiado para depois do go-live** (ver "Ordem de execução")
- [x] Teste de ponta a ponta versionado: [api/scripts/teste-api.mjs](../api/scripts/teste-api.mjs) (`npm run test:api` com a API no ar) — **52 cenários passando**, incluindo 20 movimentações simultâneas no mesmo EPI

**Notas técnicas da Fase 4**

- Respostas de movimentação trazem `epiDescricao` e `data`, os mesmos nomes que as telas já usam (menos retrabalho na Fase 5). `dataValidade` sai como `AAAA-MM-DD` (evita o "dia anterior" no fuso UTC-3); `valorUnitario` sai como número.
- Busca ignora maiúsculas mas **não** acentos ("joao" não acha "João"). Melhoria futura: extensão `unaccent` do Postgres.
- `porPagina` aceita até 5000: no go-live os relatórios continuam calculados no navegador a partir da lista de movimentações do período.
- O `teste-api.mjs` cria dados de teste: só em desenvolvimento (recusa `NODE_ENV=production`).

## Fase 5 — Frontend

- [ ] `src/services/api.js`: wrapper de `fetch` (`credentials: "include"`, tratamento de 401 → volta ao login)
- [ ] [AuthContext.jsx](../src/contexts/AuthContext.jsx) usando `/api/auth/*`; permissões vêm do `/me`
- [ ] Substituir os `if` de [App.jsx:147-150](../src/App.jsx#L147-L150) por um único `hasPermission` alimentado pelo `/me`; apagar `PermissionsContext.jsx` e `ProtectedAction.jsx` (ou reaproveitar o `ProtectedAction` sobre o novo contexto)
- [ ] Hooks `useEPIs`, `useMovimentacoes`, `useUsuarios`, `useLogs`: `fetch` + função `recarregar()` chamada após cada ação
- [ ] `handleSaveMovimentacao` passa a só chamar a API (o cálculo de estoque sai do front)
- [ ] Controle de Estoque: botão "Excluir" vira "Desativar/Reativar" (só admin); filtro para mostrar inativos; EPI inativo com selo visual e fora da lista do modal de movimentação
- [ ] Relatórios ([Relatorios.jsx](../src/components/pages/Relatorios.jsx)): admin/operador escolhem tipo e filtros → "Gerar" (salva na API) → veem e exportam PDF/Excel. Todos os perfis têm a lista "Relatórios gerados" (quem gerou, quando, filtros) e abrem o retrato salvo usando os mesmos componentes de exibição. Botões de exportar só aparecem para quem tem a permissão
- [ ] Usuários: remover o botão de exclusão e o formulário de "criar usuário" (fica só o convite)
- [ ] Remover `Register.jsx` e a rota de cadastro; no login, link "Solicitar acesso" com `mailto:` lendo `import.meta.env.VITE_EMAIL_SOLICITAR_ACESSO` (#9)
- [ ] Telas novas: "Esqueci minha senha" apontando para a API e "Redefinir senha" (`/redefinir-senha/:token`)
- [ ] [ConviteUsuarioModal.jsx](../src/components/modals/ConviteUsuarioModal.jsx) e [AceitarConvite.jsx](../src/components/auth/AceitarConvite.jsx) usando a API; QR Code continua com `qrcode.react`
- [ ] Remover `firebase`, `@emailjs/browser`, `fs` e `path` do [package.json](../package.json) e apagar [firebase.js](../src/services/firebase.js) e [emailService.js](../src/services/emailService.js)
- [ ] Trocar o texto "Carregando dados do Firebase..." e referências no [README.md](../README.md)

## Fase 6 — Dockerização

- [ ] `api/Dockerfile` (**Node 24** slim, usuário não-root, `prisma generate` no build, `prisma migrate deploy` antes de subir)
- [ ] `Dockerfile` do frontend: build do Vite → nginx com fallback de SPA (substitui o `rewrites` do [vercel.json](../vercel.json)) e proxy `/api`. Variáveis `VITE_*` entram como *build args* vindos do `.env` da raiz — mudar o e-mail de solicitação exige `docker compose build web`
- [ ] `docker-compose.yml`: `web`, `api`, `db`; volume nomeado para o Postgres; healthchecks; `restart: unless-stopped`; porta do banco **não** exposta
- [ ] `docker compose up` do zero numa máquina limpa sobe tudo e o admin do seed consegue logar
- [ ] Remover [vercel.json](../vercel.json)

## ~~Fase 7 — Migração dos dados do Firestore~~ (removida)

O sistema nunca foi para produção: o que existe no Firebase são dados de exemplo/teste. **Nada é migrado** — o sistema novo começa vazio, com o admin do seed.

## Fase 8 — Deploy no Proxmox (go-live)

- [ ] Subir a stack na VM (preparada na Fase 0), com `.env` de produção (segredos novos, gerados na hora, não os de dev)
- [ ] Rodar o seed de produção e trocar a senha do admin inicial no primeiro login
- [ ] HTTPS conforme verificado na Fase 0 (proxy da borda ou Caddy na própria VM)
- [ ] **Backup diário com `pg_dump` já no dia 1** (cron na VM) + backup da VM pelo Proxmox (`vzdump`) — governança não fica para depois
- [ ] Testar os 3 perfis fim a fim, incluindo tentar ações proibidas direto na API (sem passar pela UI)
- [ ] Cadastrar os EPIs reais e convidar os usuários
- [ ] Desativar o projeto Firebase e o deploy da Vercel quando quiser (não há dados a preservar)

## Fase 9 — Pós-go-live

- [ ] Testar um restore de verdade e documentar o passo a passo
- [ ] Testes automatizados da API (começar pela movimentação transacional e pelas permissões)
- [ ] CI: lint + testes + build das imagens
- [ ] Reavaliar tempo real (SSE é o mais simples) se fizer falta no Dashboard

---

## Ordem de execução

Fases 1 → 5 no ambiente local. A Fase 6 pode começar junto com a 4. A Fase 8 só depois de 1–6 validadas localmente.

**Meta de go-live: segunda-feira, 28/09/2026.** Se o prazo apertar, o que pode ficar para a semana seguinte **sem ferir as regras de permissão**:

- Relatórios salvos (tabela `relatorios`): no go-live, admin/operador usam os relatórios como hoje (calculados na hora + exportação) e o visualizador **não vê a tela de Relatórios** até a funcionalidade entrar
- Filtros avançados da auditoria (vai listando por data)
- Restore testado e CI (Fase 9)
