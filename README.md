# 🛡️ Sistema de Controle de EPIs - SENAI São Paulo

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-red?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Firebase-11.1.0-orange?style=for-the-badge&logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</div>

<br>

<div align="center">
  <p><strong>Sistema completo para gerenciamento de Equipamentos de Proteção Individual (EPIs)</strong></p>
  <p>Desenvolvido para otimizar o controle de estoque, movimentações e relatórios de EPIs no ambiente industrial</p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Sistema de Permissões](#-sistema-de-permissões)
- [Capturas de Tela](#-capturas-de-tela)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Contato](#-contato)

---

## 🎯 Sobre o Projeto

O **Sistema de Controle de EPIs** é uma aplicação web moderna desenvolvida para o SENAI São Paulo, que permite o gerenciamento completo do ciclo de vida dos Equipamentos de Proteção Individual, desde a entrada no estoque até a distribuição aos funcionários.

### Problema que resolve:
- Controle manual de EPIs propenso a erros
- Falta de rastreabilidade de movimentações
- Dificuldade em gerar relatórios
- Perda de EPIs por vencimento
- Gestão ineficiente de estoque

### Solução oferecida:
✅ Controle digitalizado e em tempo real  
✅ Rastreamento completo de movimentações  
✅ Alertas automáticos de vencimento e estoque baixo  
✅ Relatórios PDF/Excel instantâneos  
✅ Sistema de permissões por função  
✅ Auditoria completa de ações  

---

## ⚡ Funcionalidades

### 🏠 Dashboard
- Visão geral do estoque em tempo real
- Indicadores visuais (EPIs ativos, vencidos, estoque baixo)
- Gráficos interativos de distribuição por categoria
- Timeline de movimentações recentes

### 📦 Controle de Estoque
- CRUD completo de EPIs
- Cadastro com:
  - Informações básicas (descrição, marca, tamanho, CA)
  - Controle de quantidade e estoque mínimo
  - Datas de validade com alertas automáticos
  - Valores e custos
  - Fornecedores
- Busca e filtros avançados
- Modal de detalhes com histórico completo

### 🔄 Movimentações
- Registro de 4 tipos de movimentação:
  - **Entrada**: Compras e recebimentos
  - **Saída**: Distribuição aos funcionários
  - **Ajuste**: Correções de inventário
  - **Perda**: Registro de danos/extravios
- Histórico completo com timestamps
- Rastreamento de responsáveis
- Integração automática com estoque

### 📊 Relatórios
- **Relatório de Estoque**: Visão completa com valores
- **Relatório de Movimentações**: Histórico detalhado com filtros por período
- **Relatório de Vencimentos**: EPIs vencidos e próximos ao vencimento
- **Dashboard Avançado**: Análises estatísticas e gráficos
- Exportação em **PDF** e **Excel**

### 👥 Gerenciamento de Usuários
- Sistema de 3 níveis de permissão:
  - **Administrador**: Acesso total
  - **Operador**: Gerencia EPIs e movimentações
  - **Visualizador**: Apenas consulta
- CRUD de usuários
- Ativação/desativação de contas
- Log de auditoria por usuário

### 🔐 Autenticação e Segurança
- Login com email/senha via Firebase Authentication
- Registro de novos usuários
- Recuperação de senha
- Proteção de rotas
- Sessão persistente
- Logout seguro

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca JavaScript para interfaces
- **Vite 6.0.3** - Build tool e dev server
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **Lucide React 0.469.0** - Ícones modernos
- **Recharts 2.15.0** - Biblioteca de gráficos

### Backend/Database
- **Firebase 11.1.0**
  - Authentication - Autenticação de usuários
  - Firestore - Banco de dados NoSQL em tempo real
  - Hosting - Hospedagem (opcional)

### Bibliotecas Auxiliares
- **jsPDF 2.5.2** - Geração de PDFs
- **jsPDF-AutoTable 3.8.4** - Tabelas em PDFs
- **SheetJS (xlsx) 0.18.5** - Geração de Excel
- **Date-fns** - Manipulação de datas

### Dev Tools
- **ESLint** - Linting de código
- **PostCSS** - Processamento CSS

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- Conta no **Firebase** (gratuita)
- Editor de código (recomendado: **VS Code**)

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/senai-epi-system.git
cd senai-epi-system
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Firebase

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env.local` no Git!

### 4. Configure as regras do Firestore

No Firebase Console, vá em **Firestore Database → Regras** e adicione:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /epis/{epiId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /movimentacoes/{movId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /usuarios/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    match /logs/{logId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## ⚙️ Configuração

### Criando o Primeiro Usuário Admin

1. Acesse o Firebase Console → Authentication
2. Clique em "Add user"
3. Adicione:
   - Email: `admin@senai.br`
   - Senha: `sua_senha_segura`
4. Copie o **UID** do usuário criado
5. Vá em Firestore Database → Criar documento
6. Collection: `usuarios`
7. ID do documento: Cole o UID copiado
8. Campos:
   ```
   nome: "Admin Sistema"
   email: "admin@senai.br"
   role: "admin"
   departamento: "TI"
   telefone: "(11) 98765-4321"
   ativo: true
   dataCriacao: [timestamp atual]
   ```

Pronto! Agora você pode fazer login com esse usuário.

---

## 📖 Como Usar

### Login no Sistema

1. Acesse a tela de login
2. Digite email e senha
3. Clique em "Entrar"

### Cadastrar um EPI

1. Vá em "Controle de Estoque"
2. Clique em "Novo EPI"
3. Preencha os dados obrigatórios
4. Clique em "Salvar"

### Registrar Movimentação

1. Vá em "Movimentações"
2. Clique em "Nova Movimentação"
3. Selecione o EPI
4. Escolha o tipo (Entrada/Saída/Ajuste/Perda)
5. Preencha quantidade e responsável
6. Salve

### Gerar Relatórios

1. Vá em "Relatórios"
2. Escolha o tipo de relatório
3. Aplique filtros (se necessário)
4. Clique em "Exportar PDF" ou "Exportar Excel"

---

## 📁 Estrutura do Projeto

```
senai-epi-system/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── AuthWrapper.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── modals/
│   │   │   ├── EPIModal.jsx
│   │   │   ├── EPIDetalhesModal.jsx
│   │   │   └── MovimentacaoModal.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── ControleEstoque.jsx
│   │       ├── Movimentacoes.jsx
│   │       ├── Relatorios.jsx
│   │       └── Usuarios/
│   │           ├── Usuarios.jsx
│   │           ├── FormularioUsuario.jsx
│   │           ├── ModalConfirmacao.jsx
│   │           └── LogAuditoria.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useEPIs.js
│   │   ├── useMovimentacoes.js
│   │   ├── useUsuarios.js
│   │   └── useLogs.js
│   ├── services/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.local
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔐 Sistema de Permissões

| Funcionalidade | Administrador | Operador | Visualizador |
|---|:---:|:---:|:---:|
| Ver Dashboard | ✅ | ✅ | ✅ |
| Ver Estoque | ✅ | ✅ | ✅ |
| Criar/Editar EPIs | ✅ | ✅ | ❌ |
| Excluir EPIs | ✅ | ✅ | ❌ |
| Registrar Movimentações | ✅ | ✅ | ❌ |
| Gerar Relatórios | ✅ | ✅ | ✅ |
| Gerenciar Usuários | ✅ | ❌ | ❌ |
| Ver Logs de Auditoria | ✅ | ❌ | ❌ |

---

## 📸 Capturas de Tela

### Tela de Login
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Controle de Estoque
![Estoque](docs/screenshots/estoque.png)

### Relatórios
![Relatorios](docs/screenshots/relatorios.png)

> 📝 **Nota**: Adicione as capturas de tela na pasta `docs/screenshots/`

---

## 🗺️ Roadmap

### Versão 1.0 ✅
- [x] Sistema de autenticação
- [x] CRUD de EPIs
- [x] Controle de movimentações
- [x] Relatórios PDF/Excel
- [x] Gerenciamento de usuários
- [x] Sistema de permissões

### Versão 2.0 🚧
- [ ] Notificações push
- [ ] Dashboard com mais métricas
- [ ] Modo escuro
- [ ] PWA (funciona offline)
- [ ] Integração com código de barras
- [ ] API REST
- [ ] Aplicativo mobile

### Versão 3.0 💡
- [ ] IA para previsão de demanda
- [ ] Integração com ERP
- [ ] Relatórios avançados com BI
- [ ] Multi-tenancy (várias empresas)

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Siga estes passos:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint para manter o código consistente
- Escreva commits descritivos
- Comente código complexo
- Teste antes de fazer PR

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 📧 Contato

**SENAI São Paulo**
- Website: [https://www.sp.senai.br](https://www.sp.senai.br)
- Email: contato@sp.senai.br

**Desenvolvedor**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Nome](https://linkedin.com/in/seu-perfil)

---

## 🙏 Agradecimentos

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)
- Comunidade Open Source

---

<div align="center">
  <p>Feito com ❤️ para o SENAI São Paulo</p>
  <p>⭐ Se este projeto te ajudou, deixe uma estrela!</p>
</div>
