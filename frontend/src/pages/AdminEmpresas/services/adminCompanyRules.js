export function validateMasterCompanyForm(companyForm) {
  if (!String(companyForm.nome || "").trim()) return "Informe o nome da empresa.";
  if (!String(companyForm.adminNome || "").trim() || !String(companyForm.adminLogin || "").trim()) {
    return "Informe nome e login do admin inicial.";
  }
  if (String(companyForm.adminSenha || "").length < 6) {
    return "Senha do admin inicial precisa ter no minimo 6 caracteres.";
  }
  return "";
}

export function buildMasterCompanyPayload(companyForm) {
  return {
    ...companyForm,
    nome: companyForm.nome.trim(),
    razaoSocial: companyForm.razaoSocial.trim() || null,
    cnpj: companyForm.cnpj.trim() || null,
    telefone: companyForm.telefone.trim() || null,
    email: companyForm.email.trim() || null,
    cidade: companyForm.cidade.trim() || null,
    uf: companyForm.uf.trim().toUpperCase() || null,
    limiteUsuarios: Number(companyForm.limiteUsuarios || 0),
    limiteFiliais: Number(companyForm.limiteFiliais || 0),
    limiteCaixas: Number(companyForm.limiteCaixas || 0),
    limiteProdutos: Number(companyForm.limiteProdutos || 0),
    adminNome: companyForm.adminNome.trim(),
    adminLogin: companyForm.adminLogin.trim(),
    adminEmail: companyForm.adminEmail.trim() || null,
    adminTelefone: companyForm.adminTelefone.trim() || null,
  };
}

export function validateEditMasterCompanyForm(editCompanyForm) {
  if (!String(editCompanyForm.nome || "").trim()) return "Informe o nome da empresa.";
  return "";
}

export function buildEditMasterCompanyPayload(editCompanyForm) {
  return {
    ...editCompanyForm,
    nome: editCompanyForm.nome.trim(),
    razaoSocial: editCompanyForm.razaoSocial.trim() || null,
    cnpj: editCompanyForm.cnpj.trim() || null,
    telefone: editCompanyForm.telefone.trim() || null,
    email: editCompanyForm.email.trim() || null,
    endereco: editCompanyForm.endereco.trim() || null,
    cidade: editCompanyForm.cidade.trim() || null,
    uf: editCompanyForm.uf.trim().toUpperCase() || null,
    cep: editCompanyForm.cep.trim() || null,
    codigoMunicipio: editCompanyForm.codigoMunicipio.trim() || null,
    inscricaoEstadual: editCompanyForm.inscricaoEstadual.trim() || null,
    inscricaoMunicipal: editCompanyForm.inscricaoMunicipal.trim() || null,
    regimeTributario: editCompanyForm.regimeTributario || null,
    crt: editCompanyForm.crt || null,
    estoqueMinimoPadrao: Number(editCompanyForm.estoqueMinimoPadrao || 5),
  };
}

export function buildMasterCompanyStatusPayload(selectedCompany, statusObservation = "") {
  const nextStatus = selectedCompany?.ativo === false;
  return {
    payload: {
      ativo: nextStatus,
      observacaoComercial: statusObservation.trim() || null,
    },
    message: nextStatus ? "Empresa ativada." : "Empresa inativada.",
  };
}

export function buildControlledAddonPayload(draft = {}) {
  return {
    modulo: draft.modulo,
    status: draft.status || "BLOQUEADO",
    contratado: Boolean(draft.contratado),
    responsavel: String(draft.responsavel || "").trim() || null,
    evidencia: String(draft.evidencia || "").trim() || null,
    observacao: String(draft.observacao || "").trim() || null,
  };
}
