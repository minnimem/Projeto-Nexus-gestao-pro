export function buildUserPayload(form, includePassword) {
  return {
    nome: form.nome.trim(),
    login: form.login.trim(),
    senha: includePassword ? form.senha : form.senha ? form.senha : null,
    perfil: form.perfil,
    filialId: form.filialId || null,
    cargo: form.cargo.trim() || null,
    departamento: form.departamento.trim() || null,
    salario: form.salario ? Number(form.salario) : null,
    metaVendas: form.metaVendas ? Number(form.metaVendas) : null,
    dataInicio: form.dataInicio || null,
    telefone: form.telefone.trim() || null,
    email: form.email.trim() || null,
    documento: form.documento.trim() || null,
  };
}
