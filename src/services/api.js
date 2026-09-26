export class ErroApi extends Error {
  constructor(status, mensagem, campos) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

let aoExpirarSessao = null;

// O AuthContext registra aqui o que fazer quando a API responde 401 (sessão expirada/derrubada).
export function definirAoExpirarSessao(funcao) {
  aoExpirarSessao = funcao;
}

function montarMensagem(dados) {
  const erro = dados?.erro || "Erro de comunicação com o servidor";
  if (!dados?.campos) return erro;
  const detalhes = Object.values(dados.campos).flat().join("; ");
  return detalhes ? `${erro}: ${detalhes}` : erro;
}

export async function api(caminho, { method = "GET", body, query } = {}) {
  const parametros = query
    ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ""))
    : null;
  const url = `/api${caminho}${parametros?.size ? `?${parametros}` : ""}`;

  let resposta;
  try {
    resposta = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErroApi(0, "Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && !caminho.startsWith("/auth/")) aoExpirarSessao?.();
    throw new ErroApi(resposta.status, montarMensagem(dados), dados?.campos);
  }
  return dados;
}
