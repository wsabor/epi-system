# 🧪 Plano de Testes - Sistema de Controle EPIs v1.0

## 📋 Índice
- [Testes Funcionais](#testes-funcionais)
- [Testes de Segurança](#testes-de-segurança)
- [Testes de Usabilidade](#testes-de-usabilidade)
- [Testes de Performance](#testes-de-performance)
- [Testes de Integração](#testes-de-integração)
- [Checklist de Validação](#checklist-de-validação)

---

## 🔧 Testes Funcionais

### 1. Autenticação

#### 1.1 Login
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro apropriado
- [ ] Login com email não cadastrado mostra erro
- [ ] Login com senha errada mostra erro
- [ ] Campo de senha tem toggle show/hide
- [ ] Botão "Esqueci minha senha" funciona
- [ ] Sessão persiste após recarregar página
- [ ] Loading state aparece durante login

#### 1.2 Registro
- [ ] Cadastro com dados válidos funciona
- [ ] Validação de email funciona
- [ ] Validação de senha mínima (6 caracteres) funciona
- [ ] Confirmação de senha valida corretamente
- [ ] Campos obrigatórios são validados
- [ ] Usuário é criado com role "visualizador" por padrão
- [ ] Erros são exibidos corretamente

#### 1.3 Recuperação de Senha
- [ ] Email de recuperação é enviado
- [ ] Email inválido mostra erro
- [ ] Mensagem de sucesso aparece após envio
- [ ] Link de recuperação funciona (testar no email)

#### 1.4 Logout
- [ ] Botão de logout funciona
- [ ] Confirmação de logout aparece
- [ ] Usuário é redirecionado para login
- [ ] Sessão é limpa completamente

---

### 2. Dashboard

#### 2.1 Visualização
- [ ] Cards de estatísticas mostram números corretos
- [ ] Gráfico de pizza carrega corretamente
- [ ] Cores do gráfico são distintas
- [ ] Timeline de movimentações aparece
- [ ] Alertas são contabilizados corretamente

#### 2.2 Dados em Tempo Real
- [ ] Ao adicionar EPI, dashboard atualiza
- [ ] Ao fazer movimentação, números atualizam
- [ ] Gráficos refletem mudanças imediatamente

---

### 3. Controle de Estoque

#### 3.1 Listagem
- [ ] Lista de EPIs carrega corretamente
- [ ] Paginação funciona (se implementada)
- [ ] Busca por nome funciona
- [ ] Busca por categoria funciona
- [ ] Filtros funcionam corretamente
- [ ] Badge de status mostra cores corretas
  - Verde: Normal
  - Laranja: Estoque baixo
  - Amarelo: Vencimento próximo
  - Vermelho: Vencido

#### 3.2 Criar EPI
- [ ] Modal abre corretamente
- [ ] Todos os campos estão visíveis
- [ ] Validações funcionam:
  - Campos obrigatórios
  - Quantidade >= 0
  - Valor >= 0
  - Data de validade futura
- [ ] EPI é salvo no Firebase
- [ ] EPI aparece na lista após salvar
- [ ] Modal fecha após salvar
- [ ] Mensagem de sucesso aparece

#### 3.3 Editar EPI
- [ ] Modal abre com dados preenchidos
- [ ] Alterações são salvas
- [ ] Validações funcionam na edição
- [ ] Lista atualiza após edição

#### 3.4 Excluir EPI
- [ ] Modal de confirmação aparece
- [ ] EPI é removido após confirmar
- [ ] Cancelar não remove EPI
- [ ] EPI desaparece da lista

#### 3.5 Visualizar Detalhes
- [ ] Modal de detalhes abre
- [ ] Todas as informações aparecem
- [ ] Histórico de movimentações carrega
- [ ] Botão fechar funciona

---

### 4. Movimentações

#### 4.1 Listagem
- [ ] Lista carrega corretamente
- [ ] Tipos de movimentação têm cores diferentes:
  - Entrada: Verde
  - Saída: Vermelho
  - Ajuste: Amarelo
  - Perda: Roxo
- [ ] Data e hora aparecem corretas
- [ ] Busca funciona
- [ ] Filtro por tipo funciona
- [ ] Filtro por data funciona

#### 4.2 Nova Movimentação - Entrada
- [ ] Modal abre corretamente
- [ ] Pode selecionar EPI
- [ ] Tipo "Entrada" aumenta quantidade
- [ ] Campos específicos aparecem
- [ ] Validações funcionam
- [ ] Quantidade do EPI atualiza no estoque

#### 4.3 Nova Movimentação - Saída
- [ ] Tipo "Saída" diminui quantidade
- [ ] Campo "Funcionário que recebeu" aparece
- [ ] Não permite saída maior que estoque
- [ ] Quantidade do EPI atualiza

#### 4.4 Nova Movimentação - Ajuste
- [ ] Tipo "Ajuste" define quantidade exata
- [ ] Motivo do ajuste é obrigatório
- [ ] Quantidade é atualizada corretamente

#### 4.5 Nova Movimentação - Perda
- [ ] Tipo "Perda" diminui quantidade
- [ ] Campo de motivo aparece
- [ ] Quantidade não fica negativa

---

### 5. Relatórios

#### 5.1 Relatório de Estoque
- [ ] Tabela carrega com todos os EPIs
- [ ] Estatísticas estão corretas
- [ ] Botão "Exportar PDF" funciona
  - [ ] PDF é gerado
  - [ ] Tabela aparece no PDF
  - [ ] Formatação está correta
  - [ ] Cabeçalho SENAI aparece
- [ ] Botão "Exportar Excel" funciona
  - [ ] Arquivo .xlsx é baixado
  - [ ] Dados estão completos
  - [ ] Formatação está OK

#### 5.2 Relatório de Movimentações
- [ ] Filtro por data funciona
- [ ] Gráfico de linha carrega
- [ ] Exportação PDF funciona
- [ ] Dados estão corretos

#### 5.3 Relatório de Vencimentos
- [ ] EPIs vencidos aparecem
- [ ] EPIs próximos ao vencimento aparecem
- [ ] Cores de alerta estão corretas
- [ ] Contagem está correta

#### 5.4 Dashboard Avançado
- [ ] Todos os gráficos carregam
- [ ] Top 5 EPIs está correto
- [ ] Métricas estão calculadas corretamente

---

### 6. Usuários (Admin apenas)

#### 6.1 Listagem
- [ ] Lista carrega corretamente
- [ ] Estatísticas estão corretas
- [ ] Busca funciona
- [ ] Filtro por função funciona
- [ ] Filtro por status funciona

#### 6.2 Criar Usuário
- [ ] Modal abre
- [ ] Validações funcionam
- [ ] Usuário é criado no Firebase Auth
- [ ] Documento é criado no Firestore
- [ ] Novo usuário aparece na lista

#### 6.3 Editar Usuário
- [ ] Modal abre com dados preenchidos
- [ ] Alterações são salvas
- [ ] Permissões podem ser alteradas

#### 6.4 Ativar/Desativar
- [ ] Modal de confirmação aparece
- [ ] Status muda corretamente
- [ ] Usuário inativo não consegue logar

#### 6.5 Excluir Usuário
- [ ] Modal de confirmação aparece
- [ ] Usuário é removido
- [ ] Não pode excluir si mesmo

#### 6.6 Log de Auditoria
- [ ] Tela de auditoria abre
- [ ] Logs aparecem corretamente
- [ ] Filtros funcionam
- [ ] Exportação CSV funciona
- [ ] Timeline está cronológica

---

## 🔐 Testes de Segurança

### Permissões por Role

#### Administrador
- [ ] Acessa todas as páginas
- [ ] Vê botão "Usuários" no menu
- [ ] Pode criar/editar/excluir EPIs
- [ ] Pode registrar movimentações
- [ ] Pode gerenciar usuários
- [ ] Vê logs de auditoria

#### Operador
- [ ] Acessa Dashboard, Estoque, Movimentações, Relatórios
- [ ] NÃO vê botão "Usuários"
- [ ] Pode criar/editar/excluir EPIs
- [ ] Pode registrar movimentações
- [ ] NÃO pode gerenciar usuários

#### Visualizador
- [ ] Acessa Dashboard e Relatórios
- [ ] Vê estoque em modo somente leitura
- [ ] NÃO vê botões de criar/editar
- [ ] NÃO pode registrar movimentações
- [ ] NÃO pode gerenciar usuários

### Firestore Rules
- [ ] Usuário não autenticado não acessa dados
- [ ] Usuário só cria seu próprio documento
- [ ] Logs não podem ser editados/excluídos
- [ ] EPIs só são acessados por usuários autenticados

---

## 👥 Testes de Usabilidade

### Responsividade
- [ ] Funciona em desktop (1920x1080)
- [ ] Funciona em laptop (1366x768)
- [ ] Funciona em tablet (768x1024)
- [ ] Funciona em mobile (375x667)
- [ ] Menu lateral funciona em mobile
- [ ] Tabelas têm scroll horizontal em telas pequenas
- [ ] Modais são responsivos

### Interface
- [ ] Cores seguem identidade SENAI (vermelho)
- [ ] Ícones são intuitivos
- [ ] Botões têm hover effects
- [ ] Loading states são claros
- [ ] Mensagens de erro são compreensíveis
- [ ] Tooltips ajudam o usuário

### Acessibilidade
- [ ] Contraste de cores adequado
- [ ] Textos são legíveis
- [ ] Formulários têm labels claras
- [ ] Tab navigation funciona
- [ ] Campos obrigatórios são indicados

---

## ⚡ Testes de Performance

### Carregamento
- [ ] Página inicial carrega em < 3 segundos
- [ ] Imagens são otimizadas
- [ ] Sem memory leaks
- [ ] Sem console errors

### Firebase
- [ ] Queries são otimizadas
- [ ] Usa índices quando necessário
- [ ] Listeners são limpos ao desmontar
- [ ] Paginação implementada para grandes volumes

### Navegação
- [ ] Mudança entre páginas é rápida
- [ ] Não há travamentos
- [ ] Gráficos renderizam suavemente

---

## 🔗 Testes de Integração

### Firebase Authentication
- [ ] Login persiste após reload
- [ ] Token é renovado automaticamente
- [ ] Logout limpa sessão completamente

### Firebase Firestore
- [ ] Dados são sincronizados em tempo real
- [ ] Mudanças aparecem instantaneamente
- [ ] Offline persistence funciona (se habilitado)

### Geração de Relatórios
- [ ] PDFs são gerados sem erros
- [ ] Excel é gerado corretamente
- [ ] Dados nos relatórios batem com o sistema

---

## ✅ Checklist de Validação Final

### Antes de Produção
- [ ] Todos os testes funcionais passaram
- [ ] Todas as permissões foram testadas
- [ ] Sistema funciona em todos os navegadores:
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Edge
  - [ ] Safari (se possível)
- [ ] .env.local está no .gitignore
- [ ] Não há console.logs de debug
- [ ] Não há dados de teste hardcoded
- [ ] README.md está atualizado
- [ ] LICENSE está incluída

### Dados de Teste
- [ ] Criar 3 usuários (Admin, Operador, Visualizador)
- [ ] Criar 10-15 EPIs de exemplo
- [ ] Criar 20-30 movimentações
- [ ] Testar com EPIs vencidos
- [ ] Testar com EPIs em estoque baixo

---

## 📝 Relatório de Bugs

Use este template para reportar bugs encontrados:

```
### Bug #X: [Título do Bug]

**Severidade:** Crítica / Alta / Média / Baixa
**Encontrado em:** [Página/Componente]
**Passos para Reproduzir:**
1. 
2. 
3. 

**Resultado Esperado:**

**Resultado Obtido:**

**Screenshots:** (se aplicável)

**Navegador/Dispositivo:**
```

---

## 🎯 Critérios de Aceitação

Para considerar v1.0 pronta para produção:

- [ ] ✅ Pelo menos 90% dos testes funcionais passaram
- [ ] ✅ Todos os testes de segurança passaram
- [ ] ✅ Sistema é responsivo em todos os dispositivos
- [ ] ✅ Não há bugs críticos ou de alta severidade
- [ ] ✅ Performance está aceitável
- [ ] ✅ Documentação está completa

---

**Data do Teste:** __________________  
**Testador:** __________________  
**Versão:** 1.0.0  
**Status:** ⬜ Aprovado | ⬜ Reprovado | ⬜ Aprovado com Ressalvas
