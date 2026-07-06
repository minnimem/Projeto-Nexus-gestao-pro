import { asList, formatNumber } from "../../../utils/formatters.js";

export function getCompanyRiskSignals(empresa) {
  const signals = [];
  const assinatura = String(empresa.statusAssinatura || "TESTE").toUpperCase();
  const usuariosAtivos = Number(empresa.usuariosAtivos || 0);
  const limiteUsuarios = Number(empresa.limiteUsuarios || empresa.plano.limites.usuarios || 0);
  const filiais = Number(empresa.filiais || 0);
  const limiteFiliais = Number(empresa.limiteFiliais || empresa.plano.limites.filiais || 0);
  const liberacoes = asList(empresa.liberacoes);
  const pendingAddons = liberacoes.filter((item) => item.contratado && !item.liberado).length;

  if (empresa.ativo === false) {
    signals.push({ label: "Inativa", tone: "danger" });
  }
  if (["SUSPENSA", "CANCELADA"].includes(assinatura)) {
    signals.push({ label: assinatura === "CANCELADA" ? "Cancelada" : "Suspensa", tone: "danger" });
  } else if (assinatura === "PENDENTE") {
    signals.push({ label: "Pendente", tone: "warning" });
  } else if (assinatura === "TESTE") {
    signals.push({ label: "Em teste", tone: "info" });
  }
  if (limiteUsuarios > 0 && usuariosAtivos >= limiteUsuarios) {
    signals.push({ label: "Limite usuários", tone: "danger" });
  } else if (limiteUsuarios > 0 && usuariosAtivos / limiteUsuarios >= 0.8) {
    signals.push({ label: "Usuários 80%+", tone: "warning" });
  }
  if (limiteFiliais > 0 && filiais >= limiteFiliais) {
    signals.push({ label: "Limite filiais", tone: "danger" });
  }
  if (pendingAddons > 0) {
    signals.push({ label: `${formatNumber(pendingAddons)} adicional(is)`, tone: "warning" });
  }
  if (!empresa.cnpj || !empresa.email) {
    signals.push({ label: "Cadastro incompleto", tone: "warning" });
  }

  return signals.length > 0 ? signals : [{ label: "Ok", tone: "success" }];
}
