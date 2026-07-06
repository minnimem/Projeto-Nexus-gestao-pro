export function buildCompanyPayload(companyForm) {
  return {
    ...companyForm,
    nome: companyForm.nome.trim(),
    estoqueMinimoPadrao: Number(companyForm.estoqueMinimoPadrao || 5),
  };
}

export function buildPlanPayload(planForm) {
  return {
    ...planForm,
    limiteUsuarios: Number(planForm.limiteUsuarios || 0),
    limiteFiliais: Number(planForm.limiteFiliais || 0),
    limiteCaixas: Number(planForm.limiteCaixas || 0),
    limiteProdutos: Number(planForm.limiteProdutos || 0),
    valorMensalPlano: planForm.valorMensalPlano === "" ? null : Number(planForm.valorMensalPlano || 0),
    diaVencimentoPlano: Number(planForm.diaVencimentoPlano || 10),
    ultimoPagamentoPlano: planForm.ultimoPagamentoPlano || null,
  };
}

export function buildBranchPayload(branchForm) {
  return {
    ...branchForm,
    nome: branchForm.nome.trim(),
    uf: branchForm.uf.trim().toUpperCase(),
  };
}

export function buildContractPayload(contractForm) {
  return {
    ...contractForm,
    nome: contractForm.nome.trim(),
    valorMensal: contractForm.valorMensal ? Number(contractForm.valorMensal) : null,
    filialId: contractForm.filialId || null,
    dataInicio: contractForm.dataInicio || null,
    dataFim: contractForm.dataFim || null,
  };
}
