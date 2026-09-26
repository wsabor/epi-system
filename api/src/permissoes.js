// Matriz de permissões: fonte única da verdade (docs/ROADMAP.md, Fase 0).
// O frontend recebe a lista pelo /api/auth/me só para esconder botões; quem decide é a API.

const LEITURA = ["epis:ver", "movimentacoes:ver", "relatorios:ver"];

const OPERACAO = [
  ...LEITURA,
  "epis:criar",
  "epis:editar",
  "movimentacoes:criar",
  "relatorios:gerar",
  "relatorios:exportar",
];

export const PERMISSOES = {
  visualizador: LEITURA,
  operador: OPERACAO,
  admin: [...OPERACAO, "epis:ativar", "usuarios:gerir", "convites:gerir", "auditoria:ver"],
};

export function temPermissao(role, permissao) {
  return PERMISSOES[role]?.includes(permissao) ?? false;
}
