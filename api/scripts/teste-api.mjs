// Teste de ponta a ponta da API contra um servidor rodando (npm run dev).
// Cria usuários, convites e EPIs de teste: roda SÓ em desenvolvimento.
// Uso: npm run test:api  (com a API no ar e o admin do seed com a senha do .env)

const BASE = `http://localhost:${process.env.API_PORT || 3000}/api`;
if (process.env.NODE_ENV === "production") {
  console.error("Este teste cria dados falsos: não rode em produção.");
  process.exit(1);
}
let falhas = 0;
let total = 0;

function cliente() {
  let cookie = "";
  return async (metodo, caminho, corpo) => {
    const r = await fetch(BASE + caminho, {
      method: metodo,
      headers: { "Content-Type": "application/json", ...(cookie && { Cookie: cookie }) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const sc = r.headers.get("set-cookie");
    if (sc) cookie = sc.split(";")[0];
    const texto = await r.text();
    return { status: r.status, corpo: texto ? JSON.parse(texto) : null };
  };
}

function checar(descricao, condicao, extra = "") {
  total++;
  if (!condicao) falhas++;
  console.log(`${condicao ? "ok   " : "FALHA"} ${descricao}${!condicao && extra ? `  -> ${JSON.stringify(extra).slice(0, 200)}` : ""}`);
}

const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
const sufixo = Date.now();

// ---------- Setup: admin ----------
const admin = cliente();
let r = await admin("POST", "/auth/login", {
  email: process.env.ADMIN_INICIAL_EMAIL,
  senha: process.env.ADMIN_INICIAL_SENHA,
});
checar("admin faz login", r.status === 200, r.corpo);
const adminId = r.corpo.usuario.id;

r = await admin("GET", "/opcoes");
checar("opções: listas do domínio", r.status === 200 && r.corpo.categorias.length === 8 && r.corpo.motivosPorTipo.saida.length === 5, r.corpo);

// ---------- Convites ----------
async function convidar(email, role) {
  return admin("POST", "/convites", { nome: `Teste ${role}`, email, departamento: "Almoxarifado", role });
}
const emailOp = `op${sufixo}@teste.com`;
r = await convidar(emailOp.toUpperCase(), "operador");
checar("convite operador criado (e-mail normalizado, e-mail 'enviado' no console)", r.status === 201 && r.corpo.convite.email === emailOp && r.corpo.emailEnviado, r.corpo);
const tokenOp = r.corpo.link.split("/").pop();

const anonimo = cliente();
r = await anonimo("GET", `/convites/aceitar/${tokenOp}`);
checar("link do convite mostra dados sem login", r.status === 200 && r.corpo.role === "operador", r.corpo);
r = await anonimo("GET", "/convites");
checar("lista de convites exige login (401)", r.status === 401, r.corpo);

const operador = cliente();
r = await operador("POST", `/convites/aceitar/${tokenOp}`, { senha: "123" });
checar("aceitar com senha curta (400)", r.status === 400, r.corpo);
r = await operador("POST", `/convites/aceitar/${tokenOp}`, { senha: "senhaOperador1" });
checar("aceitar convite cria conta e já loga (201)", r.status === 201 && r.corpo.usuario.role === "operador", r.corpo);
const operadorId = r.corpo.usuario.id;
r = await anonimo("POST", `/convites/aceitar/${tokenOp}`, { senha: "outraSenha123" });
checar("reusar convite (404)", r.status === 404, r.corpo);

const emailVis = `vis${sufixo}@teste.com`;
r = await convidar(emailVis, "visualizador");
const visualizador = cliente();
r = await visualizador("POST", `/convites/aceitar/${r.corpo.link.split("/").pop()}`, { senha: "senhaVisual123" });
checar("visualizador criado por convite", r.status === 201, r.corpo);

r = await convidar(emailOp, "admin");
checar("convite para e-mail já cadastrado (409)", r.status === 409, r.corpo);

const emailPend = `pend${sufixo}@teste.com`;
const c1 = await convidar(emailPend, "visualizador");
const c2 = await convidar(emailPend, "operador");
r = await anonimo("GET", `/convites/aceitar/${c1.corpo.link.split("/").pop()}`);
checar("convite novo p/ mesmo e-mail invalida o anterior (404)", r.status === 404, r.corpo);
r = await admin("PATCH", `/convites/${c2.corpo.convite.id}/revogar`);
checar("revogar convite pendente", r.status === 200 && r.corpo.status === "revogado", r.corpo);
r = await admin("PATCH", `/convites/${c2.corpo.convite.id}/revogar`);
checar("revogar de novo (409)", r.status === 409, r.corpo);
r = await operador("GET", "/convites");
checar("operador não gerencia convites (403)", r.status === 403, r.corpo);

// ---------- EPIs ----------
const epiBase = {
  descricao: `Luva nitrílica ${sufixo}`,
  categoria: "Luvas",
  tamanho: "Único",
  tipoEstoque: "Par",
  marca: "Marca X",
  numeroCA: "12345",
  dataValidade: "2027-06-30",
  valorUnitario: 12.5,
  fornecedor: "Fornecedor Y",
  estoqueMinimo: 5,
  diasAvisoVencimento: 30,
};
r = await visualizador("POST", "/epis", { ...epiBase, quantidadeInicial: 10 });
checar("visualizador não cria EPI (403)", r.status === 403, r.corpo);
r = await operador("POST", "/epis", { ...epiBase, tamanho: "M" });
checar("tamanho inválido para a categoria (400)", r.status === 400 && r.corpo.campos.tamanho, r.corpo);
r = await operador("POST", "/epis", { ...epiBase, quantidadeInicial: 10 });
checar("operador cria EPI com estoque inicial 10", r.status === 201 && r.corpo.quantidadeAtual === 10 && r.corpo.dataValidade === "2027-06-30" && r.corpo.valorUnitario === 12.5, r.corpo);
const epiId = r.corpo.id;
r = await operador("GET", `/movimentacoes?epiId=${epiId}`);
checar("estoque inicial virou movimentação de entrada", r.corpo.total === 1 && r.corpo.itens[0].motivo.startsWith("Estoque inicial"), r.corpo);
r = await visualizador("GET", "/epis");
checar("visualizador lista EPIs", r.status === 200 && r.corpo.some((e) => e.id === epiId), r.corpo);
r = await visualizador("GET", "/epis/nao-e-uuid");
checar("id inválido na URL (400)", r.status === 400, r.corpo);

r = await operador("PUT", `/epis/${epiId}`, { ...epiBase, marca: "Marca Z", quantidadeAtual: 999 });
checar("editar EPI ignora quantidadeAtual (só muda por movimentação)", r.status === 200 && r.corpo.marca === "Marca Z" && r.corpo.quantidadeAtual === 10, r.corpo);

// ---------- Movimentações ----------
const mov = (dados) => ({ epiId, responsavel: "Almoxarife", ...dados });
r = await visualizador("POST", "/movimentacoes", mov({ tipo: "entrada", quantidade: 1, motivo: "Compra de novos EPIs" }));
checar("visualizador não movimenta (403)", r.status === 403, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "saida", quantidade: 3, motivo: "Entrega para funcionário" }));
checar("entrega sem funcionário que recebeu (400)", r.status === 400 && r.corpo.campos.funcionarioRecebeu, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "saida", quantidade: 3, motivo: "Entrega para funcionário", funcionarioRecebeu: "João" }));
checar("saída de 3: saldo 10 → 7", r.status === 201 && r.corpo.epi.quantidadeAtual === 7 && r.corpo.movimentacao.quantidadeAnterior === 10, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "entrada", quantidade: 2, motivo: "Compra de novos EPIs", funcionarioRecebeu: "Não deveria gravar" }));
checar("entrada de 2: saldo 9, funcionário descartado", r.status === 201 && r.corpo.epi.quantidadeAtual === 9 && r.corpo.movimentacao.funcionarioRecebeu === null, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "saida", quantidade: 100, motivo: "Empréstimo temporário" }));
checar("saída maior que o estoque (409)", r.status === 409, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "entrada", quantidade: 1, motivo: "Entrega para funcionário" }));
checar("motivo que não é do tipo (400)", r.status === 400 && r.corpo.campos.motivo, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "perda", quantidade: 1, motivo: "Outros" }));
checar("motivo 'Outros' sem descrição (400)", r.status === 400 && r.corpo.campos.observacoes, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "saida", quantidade: 0, motivo: "Empréstimo temporário" }));
checar("saída com quantidade 0 (400)", r.status === 400, r.corpo);

// Concorrência: 20 entradas de 1 disparadas ao mesmo tempo.
const antes = (await operador("GET", `/epis/${epiId}`)).corpo.quantidadeAtual;
const paralelas = await Promise.all(
  Array.from({ length: 20 }, () => operador("POST", "/movimentacoes", mov({ tipo: "entrada", quantidade: 1, motivo: "Doação recebida" }))),
);
const depois = (await operador("GET", `/epis/${epiId}`)).corpo.quantidadeAtual;
checar(`concorrência: 20 entradas simultâneas → saldo ${antes} + 20 = ${depois}`, paralelas.every((p) => p.status === 201) && depois === antes + 20, { antes, depois });
r = await operador("GET", `/movimentacoes?epiId=${epiId}&porPagina=500`);
const saldosSeguidos = r.corpo.itens
  .slice()
  .reverse()
  .every((m, i, arr) => i === 0 || m.quantidadeAnterior === arr[i - 1].quantidadeNova);
checar("histórico encadeado: cada saldo anterior = saldo novo da movimentação anterior", saldosSeguidos);

r = await operador("POST", "/movimentacoes", mov({ tipo: "ajuste", quantidade: 0, motivo: "Recontagem" }));
checar("ajuste para zero", r.status === 201 && r.corpo.epi.quantidadeAtual === 0, r.corpo);

r = await visualizador("GET", `/movimentacoes?tipo=saida&busca=joão&de=${hoje}&ate=${hoje}&porPagina=5`);
checar("filtros: tipo + busca sem diferenciar maiúsculas + período de hoje", r.status === 200 && r.corpo.total >= 1 && r.corpo.itens.every((m) => m.tipo === "saida"), r.corpo);
r = await visualizador("GET", "/movimentacoes?de=2000-01-01&ate=2000-01-02");
checar("filtro de período sem resultados", r.status === 200 && r.corpo.total === 0, r.corpo);

// ---------- Ativar/desativar EPI ----------
r = await operador("PATCH", `/epis/${epiId}/ativo`, { ativo: false });
checar("operador não desativa EPI (403)", r.status === 403, r.corpo);
r = await admin("PATCH", `/epis/${epiId}/ativo`, { ativo: false });
checar("admin desativa EPI", r.status === 200 && r.corpo.ativo === false, r.corpo);
r = await operador("POST", "/movimentacoes", mov({ tipo: "entrada", quantidade: 1, motivo: "Doação recebida" }));
checar("EPI desativado não aceita movimentação (409)", r.status === 409, r.corpo);
r = await operador("GET", "/epis");
const naLista = r.corpo.some((e) => e.id === epiId);
r = await operador("GET", "/epis?status=inativos");
checar("desativado some da lista padrão e aparece em ?status=inativos", !naLista && r.corpo.some((e) => e.id === epiId));
r = await admin("PATCH", `/epis/${epiId}/ativo`, { ativo: true });
checar("admin reativa EPI", r.status === 200 && r.corpo.ativo === true, r.corpo);

// ---------- Usuários ----------
r = await operador("GET", "/usuarios");
checar("operador não gerencia usuários (403)", r.status === 403, r.corpo);
r = await admin("GET", "/usuarios");
checar("admin lista usuários", r.status === 200 && r.corpo.length >= 3, r.corpo);
r = await admin("PATCH", `/usuarios/${adminId}/ativo`, { ativo: false });
checar("admin não desativa a si mesmo (409)", r.status === 409, r.corpo);
r = await admin("PUT", `/usuarios/${adminId}`, { nome: "Administrador", departamento: "Administrativo", role: "operador" });
checar("admin não muda a própria função (409)", r.status === 409, r.corpo);
r = await admin("PUT", `/usuarios/${operadorId}`, { nome: "Operador Renomeado", departamento: "Produção", role: "operador" });
checar("admin edita outro usuário", r.status === 200 && r.corpo.nome === "Operador Renomeado", r.corpo);
const tokenGuardado = cliente();
await tokenGuardado("POST", "/auth/login", { email: emailOp, senha: "senhaOperador1" });
r = await admin("PATCH", `/usuarios/${operadorId}/ativo`, { ativo: false });
checar("admin desativa operador", r.status === 200 && r.corpo.ativo === false, r.corpo);
r = await operador("GET", "/epis");
checar("sessão do operador desativado cai na hora (401)", r.status === 401, r.corpo);
await admin("PATCH", `/usuarios/${operadorId}/ativo`, { ativo: true });
r = await tokenGuardado("GET", "/epis");
checar("após reativar, token emitido antes da desativação continua inválido (401)", r.status === 401, r.corpo);
r = await operador("POST", "/auth/login", { email: emailOp, senha: "senhaOperador1" });
checar("após reativar, novo login funciona", r.status === 200, r.corpo);

// ---------- Auditoria ----------
r = await operador("GET", "/logs");
checar("auditoria: operador sem acesso (401/403)", r.status === 401 || r.status === 403, r.corpo);
r = await admin("GET", `/logs?entidade=epi&entidadeId=${epiId}`);
const acoes = r.corpo.itens.map((l) => l.acao);
checar("auditoria do EPI: criar, editar, desativar, reativar", ["EPI_CRIAR", "EPI_EDITAR", "EPI_DESATIVAR", "EPI_REATIVAR"].every((a) => acoes.includes(a)), acoes);
const edicao = r.corpo.itens.find((l) => l.acao === "EPI_EDITAR");
checar("auditoria guarda antes → depois só do que mudou", edicao?.detalhes.antes.marca === "Marca X" && edicao?.detalhes.depois.marca === "Marca Z" && Object.keys(edicao.detalhes.antes).length === 1, edicao);
r = await admin("GET", "/logs?porPagina=5&pagina=2");
checar("auditoria paginada", r.status === 200 && r.corpo.itens.length === 5 && r.corpo.pagina === 2, r.corpo);

console.log(`\n${total - falhas}/${total} testes passaram`);
process.exit(falhas ? 1 : 0);
