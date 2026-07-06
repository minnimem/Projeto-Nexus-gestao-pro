import { formatDate } from "../../../utils/formatters";

export function FiscalConfigSecretsCell({ config }) {
  return (
    <>
      <strong>{config.certificadoAlias || "-"}</strong>
      <small>
        {[config.certificadoArquivoEnv, config.certificadoSenhaEnv, config.cscTokenEnv]
          .filter(Boolean)
          .join(" / ") || "Sem variaveis"}
      </small>
      <small>
        Validade: {config.certificadoValidoAte ? formatDate(config.certificadoValidoAte) : "não informada"}
      </small>
    </>
  );
}
