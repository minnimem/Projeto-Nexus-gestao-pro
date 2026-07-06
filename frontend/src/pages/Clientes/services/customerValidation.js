export function sanitizeCustomerForm(form) {
  return {
    ...form,
    nome: String(form.nome || "").trim(),
    cpf: String(form.cpf || "").replace(/\D/g, ""),
    dataNascimento: String(form.dataNascimento || "").trim(),
    email: String(form.email || "").trim(),
    telefone: String(form.telefone || "").trim(),
    endereco: String(form.endereco || "").trim(),
    numero: String(form.numero || "").trim(),
    bairro: String(form.bairro || "").trim(),
    cidade: String(form.cidade || "").trim(),
    uf: String(form.uf || "").trim().toUpperCase(),
    cep: String(form.cep || "").replace(/\D/g, ""),
    codigoMunicipio: String(form.codigoMunicipio || "").replace(/\D/g, ""),
    inscricaoEstadual: String(form.inscricaoEstadual || "").trim(),
  };
}

export function validateCustomerForm(form) {
  const customer = sanitizeCustomerForm(form);

  if (!customer.nome) return { valid: false, message: "Informe o nome do cliente.", customer };
  if (customer.cpf.length !== 11) return { valid: false, message: "CPF precisa ter 11 dígitos.", customer };
  if (!customer.dataNascimento) return { valid: false, message: "Informe a data de nascimento.", customer };
  if (!customer.email) return { valid: false, message: "Informe o email do cliente.", customer };

  return { valid: true, message: "", customer };
}
