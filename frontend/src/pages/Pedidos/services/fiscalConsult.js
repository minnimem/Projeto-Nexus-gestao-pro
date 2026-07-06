import { asList, formatNumber } from "../../../utils/formatters";

export function buildFiscalConsultMessage({ consulta, documento }) {
  const pendencias = asList(consulta.pendenciasFiscais);
  const identificador = `${consulta.modelo || documento.modelo || "Documento"} ${consulta.serie || "-"}-${consulta.numero || "-"}`;
  const totalArquivos = Number.isFinite(Number(consulta.totalArquivosDisponiveis))
    ? Number(consulta.totalArquivosDisponiveis)
    : [
        consulta.possuiPayloadJson,
        consulta.possuiXmlEnvio,
        consulta.possuiXmlRetorno,
        consulta.possuiDanfeHtml,
        consulta.possuiCartaCorrecao,
      ].filter(Boolean).length;
  const totalPendencias = Number.isFinite(Number(consulta.totalPendenciasFiscais))
    ? Number(consulta.totalPendenciasFiscais)
    : pendencias.length;
  const chaveOuProtocolo = consulta.chaveAcesso || consulta.protocolo
    ? ` Chave/protocolo: ${consulta.chaveAcesso || consulta.protocolo}.`
    : "";

  return {
    type: consulta.possuiPendenciasFiscais || consulta.status === "REJEITADO" ? "error" : "success",
    text: `${identificador}: ${consulta.status || "PENDENTE"}. Arquivos ${formatNumber(totalArquivos)}. Pendencias ${formatNumber(totalPendencias)}. ${consulta.proximaAcao || "Consulta fiscal concluída."}${chaveOuProtocolo}`,
  };
}
