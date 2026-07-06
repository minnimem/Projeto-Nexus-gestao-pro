import { StatusBadge } from "../../../components/StatusBadge/StatusBadge";
import { formatNumber } from "../../../utils/formatters";

export function FiscalDocumentCell({ documento, realConclusion }) {
  return (
    <>
      <strong>
        {documento
          ?
          `${documento.modelo || "-"} ${documento.serie || "-"}-${documento.numero || "-"}`
          : "Não preparado"}
      </strong>
      <small>{documento.chaveAcesso || documento.protocolo || "Aguardando homologação"}</small>
      {documento.possuiPendenciasFiscais && (
        <StatusBadge
          label={`Cadastro fiscal pendente${Number(documento.totalPendenciasFiscais) > 0 ? ` (${formatNumber(documento.totalPendenciasFiscais)})` : ""}`}
          status="PENDENTE"
        />
      )}
      {documento.id && (
        <StatusBadge
          label={realConclusion.label}
          status={realConclusion.tone === "aprovado" ? "CONCLUIDO" : "PENDENTE"}
        />
      )}
    </>
  );
}
