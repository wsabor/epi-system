// Formato das respostas da API. Nomes de campos seguem os que as telas já usam.

export function formatarEpi(epi) {
  return {
    ...epi,
    valorUnitario: Number(epi.valorUnitario),
    // Só a data (AAAA-MM-DD): como Date completo, o navegador em UTC-3 mostraria o dia anterior.
    dataValidade: epi.dataValidade.toISOString().slice(0, 10),
  };
}

// Espera a movimentação carregada com { epi, usuario }.
export function formatarMovimentacao(mov) {
  return {
    id: mov.id,
    epiId: mov.epiId,
    epiDescricao: mov.epi.descricao,
    tipoEstoque: mov.epi.tipoEstoque,
    tipo: mov.tipo,
    quantidade: mov.quantidade,
    quantidadeAnterior: mov.quantidadeAnterior,
    quantidadeNova: mov.quantidadeNova,
    responsavel: mov.responsavel,
    funcionarioRecebeu: mov.funcionarioRecebeu,
    motivo: mov.motivo,
    observacoes: mov.observacoes,
    usuarioId: mov.usuarioId,
    usuarioNome: mov.usuario.nome,
    data: mov.criadoEm,
  };
}

export function formatarUsuario(usuario) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    departamento: usuario.departamento,
    telefone: usuario.telefone,
    role: usuario.role,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
    ultimoAcesso: usuario.ultimoAcesso,
  };
}

export function statusConvite(convite, agora = new Date()) {
  if (convite.usadoEm) return "usado";
  if (convite.revogadoEm) return "revogado";
  if (convite.expiraEm < agora) return "expirado";
  return "pendente";
}

// Espera o convite carregado com { criadoPor }.
export function formatarConvite(convite) {
  return {
    id: convite.id,
    nome: convite.nome,
    email: convite.email,
    departamento: convite.departamento,
    telefone: convite.telefone,
    role: convite.role,
    status: statusConvite(convite),
    expiraEm: convite.expiraEm,
    usadoEm: convite.usadoEm,
    revogadoEm: convite.revogadoEm,
    criadoPorNome: convite.criadoPor.nome,
    criadoEm: convite.criadoEm,
  };
}

// Espera o log carregado com { usuario }.
export function formatarLog(log) {
  return {
    id: log.id,
    acao: log.acao,
    usuarioId: log.usuarioId,
    usuarioNome: log.usuario?.nome ?? null,
    usuarioEmail: log.usuario?.email ?? null,
    entidade: log.entidade,
    entidadeId: log.entidadeId,
    detalhes: log.detalhes,
    ip: log.ip,
    data: log.criadoEm,
  };
}

// Só os campos que mudaram, para a auditoria mostrar "antes → depois".
export function diferencas(antes, depois, campos) {
  const resultado = { antes: {}, depois: {} };
  for (const campo of campos) {
    if (String(antes[campo]) !== String(depois[campo])) {
      resultado.antes[campo] = antes[campo];
      resultado.depois[campo] = depois[campo];
    }
  }
  return Object.keys(resultado.antes).length ? resultado : null;
}
