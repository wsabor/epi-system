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
| 10 | EPI é excluído de verdade, deixando movimentações apontando para um EPI que não existe mais | [epiServices.js:107-115](../src/services/epiServices.js#L107-L115) | 2, 4, 7 |

---

## Fase 0 — Preparação e decisões pendentes

- [ ] Criar a branch `refactor/api-postgres`
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

- [ ] `api/` com Express 5, Zod, Prisma, bcrypt, `jsonwebtoken`, `cookie-parser`, `helmet`
- [ ] `docker-compose.dev.yml` só com o PostgreSQL (API e Vite rodam na máquina com hot reload)
- [ ] Proxy `/api` no [vite.config.js](../vite.config.js) para o dev
- [ ] **Um único `.env` na raiz** (+ `.env.example` versionado): o Vite lê direto; a API carrega com `node --env-file=../.env`; o `docker-compose` usa o mesmo arquivo. Variáveis do front têm prefixo `VITE_`, segredos da API nunca têm
- [ ] `.env.example` com `VITE_EMAIL_SOLICITAR_ACESSO=solicitar-acesso@exemplo.com` como placeholder
- [ ] Rota `GET /api/health` respondendo `{ status: "ok" }` e checando conexão com o banco

## Fase 2 — Modelo de dados (Prisma)

- [ ] `Usuario`: id, nome, email (único), senhaHash, departamento, telefone, role (enum), ativo, criadoEm, ultimoAcesso
- [ ] `Epi`: id, descricao, marca, tamanho, ca, quantidadeAtual, estoqueMinimo, dataValidade, diasAvisoVencimento, valor/custo (`Decimal`), fornecedor, **ativo**, criadoEm, atualizadoEm — conferir campos reais em [EPIModal.jsx](../src/components/modals/EPIModal.jsx)
- [ ] `Movimentacao`: id, epiId → Epi, tipo (enum entrada/saida/perda/ajuste), quantidade, quantidadeAnterior, quantidadeNova, responsavel, funcionarioRecebeu, motivo, observacoes, usuarioId → Usuario, criadoEm
- [ ] `Convite`: id, tokenHash (único), nome, email, departamento, telefone, role, expiraEm, usadoEm, criadoPorId, usuarioId
- [ ] `TokenRedefinicaoSenha`: id, usuarioId, tokenHash, expiraEm, usadoEm
- [ ] `Log`: id, usuarioId, acao, entidade, entidadeId, detalhes (`Json`), ip, criadoEm
- [ ] `Relatorio`: id, tipo (enum estoque/movimentacoes/vencimentos/dashboard), filtros (`Json`: período, categoria), dados (`Json`: retrato dos números no momento da geração), geradoPorId, criadoEm — relatório salvo não muda mesmo que o estoque mude depois
- [ ] Primeira migration (`prisma migrate dev`) + seed com um admin inicial
- [ ] Todas as FKs com `onDelete: Restrict`: o banco recusa apagar EPI ou usuário que tenha histórico, mesmo que alguém tente por fora da API (#10)

## Fase 3 — Autenticação e autorização na API

- [ ] `POST /api/auth/login` — rejeita usuário inativo (#3); atualiza `ultimoAcesso`; limite de tentativas por IP
- [ ] `POST /api/auth/logout`, `GET /api/auth/me` (retorna perfil **e** permissões)
- [ ] `POST /api/auth/esqueci-senha` → token aleatório (`crypto.randomBytes`), salvo só como hash, e-mail via EmailJS
- [ ] `POST /api/auth/redefinir-senha`
- [ ] Middleware `autenticar` (lê o cookie, carrega o usuário do banco a cada request: usuário desativado ou excluído perde o acesso na hora — #3, #4)
- [ ] Middleware `permitir("criarEPI")` lendo **uma única** matriz de permissões (Fase 0) no servidor (#2)

## Fase 4 — Rotas de domínio

- [ ] `epis`: listar (filtro ativos/inativos/todos, padrão só ativos), criar, editar; `PATCH /api/epis/:id/ativo` só admin. **Sem rota de exclusão** (#10)
- [ ] `movimentacoes`: listar (paginado), listar por EPI, **criar em transação** — lê o estoque com lock, calcula a nova quantidade no servidor, grava movimentação e EPI juntos; saída maior que o estoque é rejeitada em vez de "zerar" silenciosamente (#1). Movimentação em EPI inativo é rejeitada. **Sem rota de edição/exclusão**
- [ ] `usuarios` (admin): listar, editar, ativar/desativar. **Sem exclusão e sem "criar" direto**: novo usuário só por convite (#5). Admin não pode desativar a si mesmo nem rebaixar o último admin
- [ ] `convites` (admin): criar (token forte, e-mail via EmailJS no servidor — #6, #8), listar, revogar
- [ ] `convites` (público): `GET /api/convites/:token` devolve só nome/e-mail/role do convite válido; `POST /api/convites/:token/aceitar` cria a conta
- [ ] Auditoria no servidor para toda escrita (EPI, movimentação, usuário, convite, login), com IP real do request (#7)
- [ ] `relatorios`: `POST` (admin/operador) — **o servidor** calcula e grava o retrato a partir do banco; `GET` lista e `GET /:id` detalha (todos os perfis)
- [ ] `logs` (admin): listar com filtro por usuário/ação/período no banco (hoje o filtro é no cliente sobre 1000 registros)

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

- [ ] `api/Dockerfile` (Node LTS slim, usuário não-root, `prisma migrate deploy` antes de subir)
- [ ] `Dockerfile` do frontend: build do Vite → nginx com fallback de SPA (substitui o `rewrites` do [vercel.json](../vercel.json)) e proxy `/api`. Variáveis `VITE_*` entram como *build args* vindos do `.env` da raiz — mudar o e-mail de solicitação exige `docker compose build web`
- [ ] `docker-compose.yml`: `web`, `api`, `db`; volume nomeado para o Postgres; healthchecks; `restart: unless-stopped`; porta do banco **não** exposta
- [ ] `docker compose up` do zero numa máquina limpa sobe tudo e o admin do seed consegue logar
- [ ] Remover [vercel.json](../vercel.json)

## Fase 7 — Migração dos dados do Firestore

- [ ] Script `api/scripts/exportar-firestore.js` (Firebase Admin SDK) → JSON por coleção
- [ ] Script `api/scripts/importar.js`: IDs novos com tabela de mapeamento id antigo → novo (para `epiId`, `userId` nas movimentações); `Timestamp` → `DateTime`
- [ ] Movimentações órfãs (EPI já excluído no Firebase, #10): criar o EPI como **inativo** a partir do `epiDescricao` gravado na movimentação, preservando o histórico
- [ ] Usuários importados **sem senha**: após o corte, cada um recebe e-mail de redefinição (hash do Firebase não é portável)
- [ ] Convites pendentes não migram — reemitir os que ainda interessarem
- [ ] Ensaiar em ambiente de teste e conferir contagens e o estoque de alguns EPIs contra o Firebase

## Fase 8 — Deploy no Proxmox e corte

- [ ] Subir a stack na VM (preparada na Fase 0), com `.env` de produção (segredos novos, não os de dev)
- [ ] HTTPS conforme verificado na Fase 0 (proxy da borda ou Caddy na própria VM)
- [ ] Testar os 3 perfis fim a fim, incluindo tentar ações proibidas direto na API (sem passar pela UI)
- [ ] Corte: congelar uso do sistema antigo → exportar/importar final → disparar e-mails de redefinição → liberar
- [ ] Manter o projeto Firebase em leitura por algumas semanas antes de desativá-lo

## Fase 9 — Pós-migração

- [ ] Backup diário com `pg_dump` (container ou cron na VM) + backup da VM pelo Proxmox (`vzdump`)
- [ ] Testar um restore de verdade e documentar o passo a passo
- [ ] Testes automatizados da API (começar pela movimentação transacional e pelas permissões)
- [ ] CI: lint + testes + build das imagens
- [ ] Reavaliar tempo real (SSE é o mais simples) se fizer falta no Dashboard

---

## Ordem de execução

Fases 0 → 5 no ambiente local, sem afetar o sistema em produção. A Fase 6 pode começar junto com a 4. As Fases 7 e 8 só depois de 1–6 validadas.
