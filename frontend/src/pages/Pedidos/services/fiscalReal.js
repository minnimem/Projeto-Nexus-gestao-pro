import { asList, formatNumber } from "../../../utils/formatters";

export function buildFiscalRealFilename({ documento, pedido, prefix, extension }) {
  return `nexus-one-${prefix}-${documento.modelo || "documento-fiscal"}-${documento.serie || "serie"}-${documento.numero || pedido.id}.${extension}`.toLowerCase();
}

export function getFiscalRealPendingSummary(data) {
  const pendencias = asList(data.pendencias);
  const totalPendencias = Number.isFinite(Number(data.totalPendencias))
    ? Number(data.totalPendencias)
    : pendencias.length;
  const totalExternas = Number.isFinite(Number(data.totalPendenciasExternas))
    ? Number(data.totalPendenciasExternas)
    : asList(data.pendenciasExternas).length;

  return {
    alertaExterno: totalExternas > 0 ? ` Validar ${formatNumber(totalExternas)} item(ns) externo(s).` : "",
    pendencias,
    resumoPendencias: pendencias.slice(0, 3).join(" | "),
    totalPendencias,
  };
}

export function buildFiscalReadinessMessage(status) {
  const { alertaExterno, resumoPendencias, totalPendencias } = getFiscalRealPendingSummary(status);
  if (status.prontoEmissaoReal) {
    return `${status.documento || "Documento fiscal"}: prontidao real ${status.percentualProntidao || 0}%. ${status.proximaAcao || "Checklist sem bloqueios operacionais."}${alertaExterno}`;
  }

  return `${status.documento || "Documento fiscal"}: prontidao real ${status.percentualProntidao || 0}%, bloqueada por ${formatNumber(totalPendencias || 1)} pendencia(s): ${resumoPendencias || status.proximaAcao || "consulte o checklist real."}${alertaExterno}`;
}

export function buildFiscalPackageMessage(pacote) {
  const { alertaExterno, resumoPendencias, totalPendencias } = getFiscalRealPendingSummary(pacote);
  if (pacote.prontoEmissaoReal) {
    return `Pacote de emissão real baixado. Prontidao ${pacote.percentualProntidao || 0}%.${alertaExterno}`;
  }

  return `Pacote real baixado com ${formatNumber(totalPendencias || 1)} pendencia(s). Prontidao ${pacote.percentualProntidao || 0}%. ${pacote.proximaAcao || resumoPendencias || "Consulte o checklist real."}${alertaExterno}`;
}

export function buildFiscalIntegrityMessage(integridade) {
  const { pendencias, totalPendencias } = getFiscalRealPendingSummary(integridade);
  const prontidao = Number.isFinite(Number(integridade.percentualProntidao))
    ? ` Prontidao ${formatNumber(integridade.percentualProntidao)}%.`
    : "";

  if (integridade.valido) {
    return `Pacote real integro: ${integridade.pacoteReferencia || "referência gerada"}.${prontidao} ${integridade.proximaAcao || ""}`.trim();
  }

  return `Pacote real bloqueado por ${formatNumber(totalPendencias || 1)} pendencia(s).${prontidao} ${integridade.proximaAcao || pendencias.slice(0, 3).join(" | ") || "verifique payload/XML e checklist real"}`;
}
