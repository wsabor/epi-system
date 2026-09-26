// Teste de interface no Chrome instalado na máquina (playwright-core não baixa navegador).
// Cria usuários e EPIs de teste: só em desenvolvimento. Uso: npm run test:ui (API e Vite no ar).
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { chromium } from "playwright-core";

const BASE = process.env.UI_URL || "http://localhost:5173";
const SHOTS = `${tmpdir()}/epi-system-teste-ui/`;
mkdirSync(SHOTS, { recursive: true });
const ADMIN_EMAIL = process.env.ADMIN_INICIAL_EMAIL;
const ADMIN_SENHA = process.env.ADMIN_INICIAL_SENHA;
if (process.env.NODE_ENV === "production") {
  console.error("Este teste cria dados falsos: não rode em produção.");
  process.exit(1);
}
const sufixo = Date.now().toString().slice(-6);
let falhas = 0;
const errosConsole = [];

function checar(descricao, ok, extra = "") {
  if (!ok) falhas++;
  console.log(`${ok ? "ok   " : "FALHA"} ${descricao}${!ok && extra ? `  -> ${extra}` : ""}`);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

async function novaPagina() {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: "pt-BR", timezoneId: "America/Sao_Paulo" });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());
  page.on("console", (m) => m.type() === "error" && errosConsole.push(m.text()));
  page.on("pageerror", (e) => errosConsole.push(String(e)));
  return page;
}

// ---------------- Admin ----------------
const page = await novaPagina();
await page.goto(BASE);
await page.getByRole("heading", { name: "Entrar" }).waitFor();
const mailto = await page.getByRole("link", { name: "Solicitar acesso" }).getAttribute("href");
checar("login: link 'Solicitar acesso' com mailto do .env", mailto?.startsWith(`mailto:${process.env.VITE_EMAIL_SOLICITAR_ACESSO}`), mailto);
checar("login: sem link de cadastro aberto", (await page.getByText("Cadastre-se").count()) === 0);

await page.getByPlaceholder("seu@email.com").fill(ADMIN_EMAIL);
await page.getByPlaceholder("••••••••").fill("senha-errada");
await page.getByRole("button", { name: "Entrar" }).click();
await page.getByText("E-mail ou senha inválidos").waitFor();
checar("login: senha errada mostra a mensagem da API", true);

await page.getByPlaceholder("••••••••").fill(ADMIN_SENHA);
await page.getByRole("button", { name: "Entrar" }).click();
await page.getByText("Administrador", { exact: true }).first().waitFor();
checar("admin entra e vê o nome/função no cabeçalho", true);
for (const item of ["Dashboard", "Controle de Estoque", "Movimentações", "Relatórios", "Usuários"]) {
  checar(`menu do admin tem "${item}"`, (await page.locator("nav").getByText(item, { exact: true }).count()) === 1);
}
await page.screenshot({ path: `${SHOTS}01-dashboard-admin.png` });

// Cadastro de EPI com estoque inicial
await page.locator("nav").getByText("Controle de Estoque").click();
await page.getByRole("button", { name: "Novo EPI" }).click();
const modal = page.locator("form").last();
const descricao = `Protetor auricular UI ${sufixo}`;
await modal.getByPlaceholder("Ex: Capacete de Segurança Branco").fill(descricao);
await modal.locator("select").nth(0).selectOption("Proteção Auditiva");
checar("EPI: categoria com tamanho único já preenche o tamanho", (await modal.locator("select").nth(1).inputValue()) === "Único");
await modal.locator("select").nth(2).selectOption("Par");
await modal.getByPlaceholder("0").first().fill("20");
await modal.getByPlaceholder("0").nth(1).fill("5");
await modal.getByPlaceholder("Ex: 3M, MSA, Vonder").fill("3M");
await modal.getByPlaceholder("12345").fill("5745");
await modal.locator('input[type="date"]').fill("2027-03-15");
await modal.getByPlaceholder("30").fill("30");
await modal.getByPlaceholder("0.00").fill("4.90");
await modal.getByPlaceholder("Nome do fornecedor").fill("Fornecedor UI");
await page.screenshot({ path: `${SHOTS}02-novo-epi.png` });
await modal.getByRole("button", { name: "Cadastrar EPI" }).click();
const linha = page.locator("tr", { hasText: descricao });
await linha.waitFor();
checar("EPI aparece na tabela com 20 em estoque", (await linha.innerText()).includes("20 par"));
checar("validade exibida no dia certo (15/03/2027, sem erro de fuso)", (await linha.innerText()).includes("15/03/2027"), await linha.innerText());

// Edição: quantidade bloqueada
await linha.getByTitle("Editar").click();
checar("editar EPI: quantidade só leitura", await page.locator('input[type="number"][disabled]').isVisible());
await page.getByText("Para alterar o estoque, registre uma movimentação.").waitFor();
await page.getByRole("button", { name: "Cancelar" }).click();

// Movimentação a partir da linha (EPI pré-selecionado)
await linha.getByTitle("Movimentar").click();
const modalMov = page.locator("form").last();
checar("movimentar pela linha já seleciona o EPI", (await modalMov.locator("select").first().locator("option:checked").innerText()).includes(descricao));
await modalMov.locator("select").nth(1).selectOption("saida");
await modalMov.getByPlaceholder("0").fill("3");
await modalMov.locator("select").nth(2).selectOption("Entrega para funcionário");
checar("entrega exige funcionário que recebeu", await modalMov.getByPlaceholder("Nome do funcionário").evaluate((el) => el.required));
await modalMov.getByPlaceholder("Nome do funcionário").fill("Maria Souza");
await modalMov.getByRole("button", { name: "Registrar Movimentação" }).click();
await page.waitForFunction((d) => [...document.querySelectorAll("tr")].some((tr) => tr.innerText.includes(d) && tr.innerText.includes("17 par")), descricao);
checar("saída de 3 → estoque 17 na tabela (recarregado da API)", true);

// Ajuste para quantidade maior que o estoque é permitido; saída acima do estoque é barrada pelo formulário
await linha.getByTitle("Movimentar").click();
await modalMov.locator("select").nth(1).selectOption("perda");
checar("perda: campo quantidade limitado ao estoque (max=17)", (await modalMov.getByPlaceholder("0").getAttribute("max")) === "17");
await page.getByRole("button", { name: "Cancelar" }).click();

// Desativar e filtrar inativos
await linha.getByTitle("Desativar").click();
await page.waitForFunction((d) => ![...document.querySelectorAll("tr")].some((tr) => tr.innerText.includes(d)), descricao);
checar("desativar: EPI some da lista de ativos", true);
await page.locator("select").filter({ hasText: "Somente ativos" }).selectOption("inativos");
await page.locator("tr", { hasText: descricao }).getByText("Desativado").waitFor();
checar("filtro 'Somente desativados' mostra o EPI com selo", true);
await page.screenshot({ path: `${SHOTS}03-estoque-inativos.png` });
await page.locator("tr", { hasText: descricao }).getByTitle("Reativar").click();
await page.waitForFunction((d) => ![...document.querySelectorAll("tr")].some((tr) => tr.innerText.includes(d)), descricao);
checar("reativar: sai da lista de desativados", true);

// Movimentações: detalhe mostra saldo gravado e quem registrou
await page.locator("nav").getByText("Movimentações").click();
const linhaMov = page.locator("tr", { hasText: descricao }).filter({ hasText: "Maria" }).first();
await linhaMov.waitFor();
await linhaMov.locator("button").last().click();
await page.getByText("Saldo após a movimentação").waitFor();
const detalhe = await page.locator(".fixed").last().innerText();
checar("detalhe da movimentação: saldo 17 e 'registrada por'", detalhe.includes("17") && detalhe.includes("Registrada no sistema por"), detalhe.slice(0, 200));
await page.screenshot({ path: `${SHOTS}04-detalhe-movimentacao.png` });
await page.keyboard.press("Escape");
await page.locator(".fixed").last().getByRole("button").last().click().catch(() => {});

// Relatórios: admin vê exportação
await page.locator("nav").getByText("Relatórios").click();
checar("relatórios: admin vê 'Exportar PDF'", await page.getByRole("button", { name: "Exportar PDF" }).first().isVisible());
for (const [botao, extensao] of [["Exportar Excel", ".xlsx"], ["Exportar PDF", ".pdf"]]) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: botao }).first().click(),
  ]);
  const caminho = `${SHOTS}${download.suggestedFilename()}`;
  await download.saveAs(caminho);
  const { size } = await import("node:fs").then((fs) => fs.statSync(caminho));
  checar(`relatórios: "${botao}" baixa ${extensao} (${size} bytes)`, download.suggestedFilename().endsWith(extensao) && size > 1000);
}

// Convite
await page.locator("nav").getByText("Usuários").click();
await page.getByRole("button", { name: "Convidar Usuário" }).click();
const emailVis = `vis.ui${sufixo}@teste.com`;
const form = page.locator("form").last();
await form.getByPlaceholder("João Silva").fill("Visualizador UI");
await form.getByPlaceholder("joao@empresa.com").fill(emailVis);
await form.locator("select").selectOption("Segurança");
await form.getByRole("button", { name: "Criar Convite" }).click();
await page.getByText("Convite criado!").waitFor();
const link = await page.locator('input[readonly]').inputValue();
checar("convite criado com QR Code e link", (await page.locator("svg").count()) > 0 && link.includes("/aceitar-convite/"), link);
checar("convite: e-mail 'enviado' (console da API em dev)", await page.getByText(`E-mail com o convite enviado para ${emailVis}`).isVisible());
await page.screenshot({ path: `${SHOTS}05-convite-criado.png` });
await page.getByRole("button", { name: "Concluir" }).click();
await page.locator("tr", { hasText: emailVis }).getByText("Pendente").waitFor();
checar("convite aparece na lista como Pendente", true);

// ---------------- Visualizador via convite ----------------
const pv = await novaPagina();
await pv.goto(link);
await pv.getByText("Você foi convidado").waitFor();
checar("link do convite abre com os dados do convidado", await pv.getByText(emailVis).isVisible());
await pv.getByPlaceholder("Mínimo 8 caracteres").fill("senhaVisual123");
await pv.getByPlaceholder("Digite a senha novamente").fill("senhaVisual123");
await pv.getByRole("button", { name: "Criar Conta e Entrar" }).click();
await pv.getByText("Visualizador", { exact: true }).first().waitFor({ timeout: 10000 });
checar("aceitar convite cria a conta e já entra logado", true);
const menuVis = await pv.locator("nav").innerText();
checar("visualizador: menu sem Relatórios e sem Usuários", !menuVis.includes("Relatórios") && !menuVis.includes("Usuários"), menuVis);
await pv.locator("nav").getByText("Controle de Estoque").click();
await pv.getByText("Controle de Estoque", { exact: true }).last().waitFor();
checar("visualizador: sem 'Novo EPI' nem 'Movimentação'", (await pv.getByRole("button", { name: "Novo EPI" }).count()) === 0 && (await pv.getByRole("button", { name: "Movimentação" }).count()) === 0);
checar("visualizador: linhas sem editar/desativar", (await pv.getByTitle("Editar").count()) === 0 && (await pv.getByTitle("Desativar").count()) === 0);
await pv.screenshot({ path: `${SHOTS}06-estoque-visualizador.png` });

// Admin desativa o visualizador → a sessão dele cai na próxima ação
await page.reload();
await page.locator("nav").getByText("Usuários").click();
await page.locator("tr", { hasText: emailVis }).getByTitle("Desativar").click();
await page.getByRole("button", { name: "Confirmar", exact: true }).click();
await page.locator("tr", { hasText: emailVis }).getByText("Inativo").waitFor();
checar("admin desativa o visualizador", true);
await pv.locator("nav").getByText("Movimentações").click();
await pv.reload();
await pv.getByRole("heading", { name: "Entrar" }).waitFor({ timeout: 10000 });
checar("visualizador desativado volta para a tela de login", true);

// Auditoria geral
await page.getByRole("button", { name: "Auditoria geral" }).click();
await page.getByText("Timeline de Atividades").waitFor();
const timeline = page.locator("div.rounded-lg", { has: page.getByRole("heading", { name: "Timeline de Atividades" }) });
await timeline.locator("span", { hasText: "Desativou usuário" }).first().waitFor();
const auditoria = await timeline.innerText();
checar("auditoria geral lista ações com rótulos legíveis", ["Cadastrou EPI", "Movimentação", "Criou convite", "Aceitou convite"].every((t) => auditoria.includes(t)));
await page.screenshot({ path: `${SHOTS}07-auditoria.png` });

// Alterar senha (e voltar)
await page.getByTitle("Alterar senha").click();
const campos = page.locator(".fixed form input[type=password]");
await campos.nth(0).fill(ADMIN_SENHA);
await campos.nth(1).fill("senhaNovaAdmin1");
await campos.nth(2).fill("senhaNovaAdmin1");
await page.locator(".fixed form").getByRole("button", { name: "Alterar senha" }).click();
await page.getByText("Senha alterada com sucesso.").waitFor();
await page.getByRole("button", { name: "Fechar" }).click();
await page.getByTitle("Alterar senha").click();
await campos.nth(0).fill("senhaNovaAdmin1");
await campos.nth(1).fill(ADMIN_SENHA);
await campos.nth(2).fill(ADMIN_SENHA);
await page.locator(".fixed form").getByRole("button", { name: "Alterar senha" }).click();
await page.getByText("Senha alterada com sucesso.").waitFor();
await page.getByRole("button", { name: "Fechar" }).click();
checar("alterar senha pelo cabeçalho (ida e volta)", true);

// Logout
await page.getByTitle("Sair").click();
await page.getByRole("heading", { name: "Entrar" }).waitFor();
checar("logout volta para o login", true);

// Esqueci a senha
await page.getByRole("button", { name: "Esqueci minha senha" }).click();
await page.getByPlaceholder("seu@email.com").fill(ADMIN_EMAIL);
await page.getByRole("button", { name: "Enviar Link de Recuperação" }).click();
await page.getByText("Solicitação registrada").waitFor();
checar("esqueci a senha: mensagem neutra", true);

const errosReais = errosConsole.filter((e) => !e.includes("401") && !e.includes("403"));
checar("nenhum erro de JavaScript no console", errosReais.length === 0, errosReais.join(" | "));

await browser.close();
console.log(falhas ? `\n${falhas} FALHA(S)` : `\nTodos os testes de interface passaram (capturas em ${SHOTS})`);
process.exit(falhas ? 1 : 0);
