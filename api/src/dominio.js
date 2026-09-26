// Listas do domínio: fonte única. O frontend busca em GET /api/opcoes.

export const CATEGORIAS = [
  "Proteção Respiratória",
  "Proteção Auditiva",
  "Proteção Visual",
  "Capacetes",
  "Luvas",
  "Calçados de Segurança",
  "Uniformes",
  "Outros",
];

const TAMANHOS_UNIFORME = ["PP", "P", "M", "G", "GG", "XG"];
const TAMANHOS_CALCADO = Array.from({ length: 15 }, (_, i) => String(34 + i));

export function tamanhosDaCategoria(categoria) {
  if (categoria === "Uniformes") return TAMANHOS_UNIFORME;
  if (categoria === "Calçados de Segurança") return TAMANHOS_CALCADO;
  return ["Único"];
}

export const TIPOS_ESTOQUE = ["Peça", "Par", "Kit", "Metro", "Litro"];

export const DEPARTAMENTOS = ["Administrativo", "Almoxarifado", "Produção", "RH", "Segurança", "TI"];

export const MOTIVO_OUTROS = "Outros";
export const MOTIVO_ENTREGA_FUNCIONARIO = "Entrega para funcionário";
export const MOTIVO_ESTOQUE_INICIAL = "Estoque inicial (cadastro do EPI)";

export const MOTIVOS_POR_TIPO = {
  entrada: [
    "Compra de novos EPIs",
    "Devolução de EPI não utilizado",
    "Doação recebida",
    "Transferência de outro setor",
    MOTIVO_OUTROS,
  ],
  saida: [
    MOTIVO_ENTREGA_FUNCIONARIO,
    "Substituição de EPI danificado",
    "Transferência para outro setor",
    "Empréstimo temporário",
    MOTIVO_OUTROS,
  ],
  ajuste: ["Correção de inventário", "Erro de contagem", "Diferença de estoque", "Recontagem", MOTIVO_OUTROS],
  perda: [
    "EPI danificado/avariado",
    "Extravio/perda",
    "Vencimento/validade expirada",
    "Descarte por má qualidade",
    MOTIVO_OUTROS,
  ],
};

export const ROLES = {
  admin: "Administrador",
  operador: "Operador",
  visualizador: "Visualizador",
};

export const DIAS_VALIDADE_CONVITE = 7;
