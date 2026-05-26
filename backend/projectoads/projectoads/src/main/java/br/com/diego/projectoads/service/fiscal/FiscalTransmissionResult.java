package br.com.diego.projectoads.service.fiscal;

public record FiscalTransmissionResult(
        boolean autorizado,
        String chaveAcesso,
        String protocolo,
        String mensagem,
        String xmlRetorno,
        String danfeHtml
) {
}
