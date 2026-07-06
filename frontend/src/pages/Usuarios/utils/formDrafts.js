export function buildCompanyFormDraft(empresa) {
  return {
    nome: empresa.nome || "",
    razaoSocial: empresa.razaoSocial || "",
    cnpj: empresa.cnpj || "",
    telefone: empresa.telefone || "",
    email: empresa.email || "",
    endereco: empresa.endereco || "",
    cidade: empresa.cidade || "",
    uf: empresa.uf || "",
    cep: empresa.cep || "",
    codigoMunicipio: empresa.codigoMunicipio || "",
    inscricaoEstadual: empresa.inscricaoEstadual || "",
    inscricaoMunicipal: empresa.inscricaoMunicipal || "",
    regimeTributario: empresa.regimeTributario || "",
    crt: empresa.crt || "",
    estoqueMinimoPadrao: empresa.estoqueMinimoPadrao || 5,
  };
}

export function buildPlanFormDraft(empresa) {
  return {
    planoComercial: empresa.planoComercial || "STARTER",
    statusAssinatura: empresa.statusAssinatura || "TESTE",
    limiteUsuarios: empresa.limiteUsuarios || 3,
    limiteFiliais: empresa.limiteFiliais || 1,
    limiteCaixas: empresa.limiteCaixas || 1,
    limiteProdutos: empresa.limiteProdutos || 500,
    valorMensalPlano: empresa.valorMensalPlano || "",
    diaVencimentoPlano: empresa.diaVencimentoPlano || 10,
    ultimoPagamentoPlano: empresa.ultimoPagamentoPlano || "",
    fiscalLiberado: Boolean(empresa.fiscalLiberado),
    pagamentosLiberado: Boolean(empresa.pagamentosLiberado),
    notificacoesLiberado: Boolean(empresa.notificacoesLiberado),
    logisticaLiberada: Boolean(empresa.logisticaLiberada),
    servicosLiberado: Boolean(empresa.servicosLiberado),
    auditoriaAvancadaLiberada: Boolean(empresa.auditoriaAvancadaLiberada),
  };
}

export function buildReleaseDrafts(liberationRows) {
  const nextDrafts = {};
  liberationRows.forEach((row) => {
    nextDrafts[row.modulo] = {
      modulo: row.modulo,
      status: row.status || "BLOQUEADO",
      contratado: Boolean(row.contratado),
      responsavel: row.responsavel || "",
      evidência: row.evidência || "",
      observacao: row.observacao || "",
    };
  });
  return nextDrafts;
}

export function buildFiscalConfigFormDraft(config) {
  return {
    filialId: config.filialId || "",
    modelo: config.modelo || "NFE",
    ambiente: config.ambiente || "HOMOLOGACAO",
    ativo: Boolean(config.ativo),
    serie: config.serie || "",
    proximoNumero: config.proximoNumero || "",
    provedor: config.provedor || "",
    provedorTokenEnv: config.provedorTokenEnv || "",
    certificadoAlias: config.certificadoAlias || "",
    certificadoArquivoEnv: config.certificadoArquivoEnv || "",
    certificadoSenhaEnv: config.certificadoSenhaEnv || "",
    certificadoValidoAte: config.certificadoValidoAte || "",
    cscId: config.cscId || "",
    cscTokenEnv: config.cscTokenEnv || "",
    endpointHomologacao: config.endpointHomologacao || "",
    endpointProducao: config.endpointProducao || "",
    observacao: config.observacao || "",
  };
}

export function buildUserFormDraft(usuario) {
  return {
    nome: usuario.nome || "",
    login: usuario.login || "",
    senha: "",
    perfil: usuario.perfil || "VENDEDOR",
    filialId: usuario.filialId || "",
    cargo: usuario.cargo || "",
    departamento: usuario.departamento || "",
    salario: usuario.salario || "",
    metaVendas: usuario.metaVendas || "",
    dataInicio: usuario.dataInicio || "",
    telefone: usuario.telefone || "",
    email: usuario.email || "",
    documento: usuario.documento || "",
  };
}
