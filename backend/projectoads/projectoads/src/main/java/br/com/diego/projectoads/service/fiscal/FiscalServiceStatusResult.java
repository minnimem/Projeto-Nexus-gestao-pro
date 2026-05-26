package br.com.diego.projectoads.service.fiscal;

public record FiscalServiceStatusResult(
        boolean disponivel,
        String status,
        String mensagem
) {
}
