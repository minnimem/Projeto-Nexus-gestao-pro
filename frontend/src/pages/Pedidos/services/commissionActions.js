export function validateCommissionPercent(value) {
  const percentual = Number(value);
  if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
    return { error: "Percentual de comissão deve ficar entre 0 e 100." };
  }

  return { percentual };
}

export function validateSellerGoal(value) {
  const meta = Number(value || 0);
  if (!Number.isFinite(meta) || meta < 0) {
    return { error: "Meta de vendas deve ser zero ou maior." };
  }

  return { meta };
}

export function buildSellerGoalPayload({ meta, usuario }) {
  return {
    nome: usuario.nome,
    login: usuario.login,
    perfil: usuario.perfil,
    cargo: usuario.cargo || null,
    departamento: usuario.departamento || null,
    salario: usuario.salario || null,
    metaVendas: meta,
    dataInicio: usuario.dataInicio || null,
    telefone: usuario.telefone || null,
    email: usuario.email || null,
    documento: usuario.documento || null,
  };
}

export function buildSellerGoalDrafts(sellers) {
  return sellers.reduce((acc, usuario) => {
    acc[usuario.id] = usuario.metaVendas || "";
    return acc;
  }, {});
}
